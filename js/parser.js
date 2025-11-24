/**
 * Parser for Custom Python Interpreter
 * Converts tokens into an Abstract Syntax Tree (AST).
 */
export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    parse() {
        const statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return statements;
    }

    statement() {
        if (this.match('KEYWORD', 'print')) {
            return this.printStatement();
        }
        if (this.match('KEYWORD', 'int') || this.match('KEYWORD', 'float') || this.match('KEYWORD', 'str')) {
            // Cast functions are handled as expressions
            this.pos--; // Go back
            return this.expressionStatement();
        }
        if (this.match('KEYWORD', 'if')) {
            return this.ifStatement();
        }
        if (this.match('KEYWORD', 'while')) {
            return this.whileStatement();
        }
        if (this.match('KEYWORD', 'for')) {
            return this.forStatement();
        }

        // Check for assignment: IDENTIFIER = ...
        if (this.check('IDENTIFIER') && this.checkNext('OPERATOR', '=')) {
            this.advance(); // Consume identifier
            return this.assignmentStatement();
        }

        return this.expressionStatement();
    }

    printStatement() {
        const token = this.previous();
        this.consume('OPERATOR', '(');
        const expr = this.expression();
        this.consume('OPERATOR', ')');
        return { type: 'PrintStatement', expression: expr, line: token.line };
    }

    assignmentStatement() {
        const nameToken = this.previous();
        this.consume('OPERATOR', '=');
        const value = this.expression();
        return { type: 'AssignmentStatement', name: nameToken.value, value, line: nameToken.line };
    }

    ifStatement() {
        const token = this.previous();
        const condition = this.expression();
        this.consume('OPERATOR', ':');
        this.consume('INDENT');
        const body = [];
        while (!this.check('DEDENT') && !this.isAtEnd()) {
            body.push(this.statement());
        }
        this.consume('DEDENT');
        return { type: 'IfStatement', condition, body, line: token.line };
    }

    whileStatement() {
        const token = this.previous();
        const condition = this.expression();
        this.consume('OPERATOR', ':');
        this.consume('INDENT');
        const body = [];
        while (!this.check('DEDENT') && !this.isAtEnd()) {
            body.push(this.statement());
        }
        this.consume('DEDENT');
        return { type: 'WhileStatement', condition, body, line: token.line };
    }

    expressionStatement() {
        const expr = this.expression();
        const line = this.previous() ? this.previous().line : 0;
        return { type: 'ExpressionStatement', expression: expr, line };
    }

    expression() {
        return this.equality();
    }

    equality() {
        let expr = this.comparison();
        while (this.match('OPERATOR', '==')) {
            const right = this.comparison();
            expr = { type: 'BinaryExpression', left: expr, operator: '==', right };
        }
        return expr;
    }

    comparison() {
        let expr = this.term();
        while (this.match('OPERATOR', '<') || this.match('OPERATOR', '>') ||
            this.match('OPERATOR', '<=') || this.match('OPERATOR', '>=') ||
            this.match('OPERATOR', '!=')) {
            const operator = this.previous().value;
            const right = this.term();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }

    term() {
        let expr = this.factor();
        while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
            const operator = this.previous().value;
            const right = this.factor();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }

    factor() {
        let expr = this.primary();
        while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/') || this.match('OPERATOR', '%')) {
            const operator = this.previous().value;
            const right = this.primary();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }

    forStatement() {
        const token = this.previous();
        // for <var> in <iterable>:
        if (!this.match('IDENTIFIER')) {
            throw new Error(`Parse Error: Expected variable name after 'for' at line ${token.line}`);
        }
        const iterator = this.previous().value;

        if (!this.match('KEYWORD', 'in')) {
            throw new Error(`Parse Error: Expected 'in' after for loop variable at line ${token.line}`);
        }

        const iterable = this.expression();
        this.consume('OPERATOR', ':');
        this.consume('INDENT');
        const body = [];
        while (!this.check('DEDENT') && !this.isAtEnd()) {
            body.push(this.statement());
        }
        this.consume('DEDENT');
        return { type: 'ForStatement', iterator, iterable, body, line: token.line };
    }

    primary() {
        let expr;

        if (this.match('NUMBER')) {
            expr = { type: 'Literal', value: this.previous().value };
        } else if (this.match('STRING')) {
            expr = { type: 'Literal', value: this.previous().value };
        } else if (this.match('KEYWORD', 'int') || this.match('KEYWORD', 'float') || this.match('KEYWORD', 'str')) {
            // Cast function call
            const funcName = this.previous().value;
            this.consume('OPERATOR', '(');
            const argument = this.expression();
            this.consume('OPERATOR', ')');
            expr = { type: 'CastCall', function: funcName, argument };
        } else if (this.match('IDENTIFIER')) {
            expr = { type: 'Variable', name: this.previous().value };
        } else if (this.match('OPERATOR', '(')) {
            expr = this.expression();
            this.consume('OPERATOR', ')');
        } else if (this.match('OPERATOR', '[')) {
            expr = this.listDisplay();
        } else {
            throw new Error(`Parse Error: Unexpected token ${JSON.stringify(this.peek())}`);
        }

        // Handle array indexing: arr[0]
        while (this.match('OPERATOR', '[')) {
            const index = this.expression();
            this.consume('OPERATOR', ']');
            expr = { type: 'IndexAccess', object: expr, index };
        }

        return expr;
    }

    listDisplay() {
        const elements = [];
        if (!this.check('OPERATOR', ']')) {
            do {
                elements.push(this.expression());
            } while (this.match('OPERATOR', ','));
        }
        this.consume('OPERATOR', ']');
        return { type: 'ListLiteral', elements };
    }

    // Helper methods
    match(type, value) {
        if (this.check(type, value)) {
            this.advance();
            return true;
        }
        return false;
    }

    check(type, value) {
        if (this.isAtEnd()) return false;
        const token = this.peek();
        if (value !== undefined && token.value !== value) return false;
        return token.type === type;
    }

    checkNext(type, value) {
        if (this.pos + 1 >= this.tokens.length) return false;
        const token = this.tokens[this.pos + 1];
        if (value !== undefined && token.value !== value) return false;
        return token.type === type;
    }

    consume(type, value) {
        if (this.check(type, value)) return this.advance();
        throw new Error(`Expected token ${type} ${value || ''} but found ${JSON.stringify(this.peek())}`);
    }

    advance() {
        if (!this.isAtEnd()) this.pos++;
        return this.previous();
    }

    previous() {
        return this.tokens[this.pos - 1];
    }

    peek() {
        return this.tokens[this.pos];
    }

    isAtEnd() {
        return this.peek().type === 'EOF';
    }
}
