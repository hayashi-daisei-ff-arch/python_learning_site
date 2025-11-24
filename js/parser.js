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

    // ... (existing methods)

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

    // ... (existing methods)

    primary() {
        if (this.match('NUMBER')) return { type: 'Literal', value: this.previous().value };
        if (this.match('STRING')) return { type: 'Literal', value: this.previous().value };
        if (this.match('IDENTIFIER')) return { type: 'Variable', name: this.previous().value };
        if (this.match('OPERATOR', '(')) {
            const expr = this.expression();
            this.consume('OPERATOR', ')');
            return expr;
        }
        if (this.match('OPERATOR', '[')) {
            return this.listDisplay();
        }
        throw new Error(`Parse Error: Unexpected token ${JSON.stringify(this.peek())}`);
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
