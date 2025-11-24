/**
 * Lexer for Custom Python Interpreter
 * Tokenizes the input source code.
 */
export class Lexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.line = 1; // Track line number
        this.tokens = [];
        this.indentStack = [0]; // Track indentation levels
    }

    tokenize() {
        while (this.pos < this.input.length) {
            const char = this.peek();

            if (/\s/.test(char)) {
                // Handle indentation if newline
                if (char === '\n') {
                    this.handleNewline();
                } else {
                    this.advance();
                }
            } else if (/[0-9]/.test(char)) {
                this.tokens.push(this.readNumber());
            } else if (/[a-zA-Z_]/.test(char)) {
                this.tokens.push(this.readIdentifier());
            } else if (char === '"' || char === "'") {
                this.tokens.push(this.readString(char));
            } else if (['+', '-', '*', '/', '=', '<', '>', '(', ')', ':', '[', ']', ',', '!'].includes(char)) {
                this.tokens.push(this.readOperator());
            } else if (char === '#') {
                this.skipComment();
            } else {
                throw new Error(`Unexpected character: ${char} at line ${this.line}`);
            }
        }

        // Dedent remaining
        while (this.indentStack.length > 1) {
            this.indentStack.pop();
            this.tokens.push({ type: 'DEDENT', line: this.line });
        }

        this.tokens.push({ type: 'EOF', line: this.line });
        return this.tokens;
    }

    peek() {
        return this.input[this.pos];
    }

    advance() {
        const char = this.input[this.pos++];
        return char;
    }

    handleNewline() {
        this.pos++; // Consume \n
        this.line++; // Increment line
        let indentCount = 0;
        while (this.peek() === ' ' || this.peek() === '\t') {
            this.pos++;
            indentCount++;
        }

        // If line is empty or comment, ignore indentation change
        if (this.peek() === '\n' || this.peek() === '#' || this.pos >= this.input.length) {
            return;
        }

        const currentIndent = this.indentStack[this.indentStack.length - 1];
        if (indentCount > currentIndent) {
            this.indentStack.push(indentCount);
            this.tokens.push({ type: 'INDENT', line: this.line });
        } else if (indentCount < currentIndent) {
            while (this.indentStack.length > 1 && this.indentStack[this.indentStack.length - 1] > indentCount) {
                this.indentStack.pop();
                this.tokens.push({ type: 'DEDENT', line: this.line });
            }
            if (this.indentStack[this.indentStack.length - 1] !== indentCount) {
                throw new Error(`Indentation error at line ${this.line}`);
            }
        }
    }

    readNumber() {
        let start = this.pos;
        while (/[0-9]/.test(this.peek())) {
            this.pos++;
        }
        return { type: 'NUMBER', value: parseInt(this.input.substring(start, this.pos)), line: this.line };
    }

    readIdentifier() {
        let start = this.pos;
        while (/[a-zA-Z0-9_]/.test(this.peek())) {
            this.pos++;
        }
        const value = this.input.substring(start, this.pos);
        const keywords = ['if', 'else', 'while', 'for', 'print', 'in'];
        const type = keywords.includes(value) ? 'KEYWORD' : 'IDENTIFIER';
        return { type, value, line: this.line };
    }

    readString(quote) {
        this.pos++; // Skip quote
        let start = this.pos;
        while (this.peek() !== quote && this.pos < this.input.length) {
            if (this.peek() === '\n') this.line++;
            this.pos++;
        }
        const value = this.input.substring(start, this.pos);
        this.pos++; // Skip closing quote
        return { type: 'STRING', value, line: this.line };
    }

    readOperator() {
        const char = this.input[this.pos++];
        // Handle double char operators like ==, <=, >=, !=
        if (char === '=' && this.peek() === '=') {
            this.pos++;
            return { type: 'OPERATOR', value: '==', line: this.line };
        }
        if (char === '<' && this.peek() === '=') {
            this.pos++;
            return { type: 'OPERATOR', value: '<=', line: this.line };
        }
        if (char === '>' && this.peek() === '=') {
            this.pos++;
            return { type: 'OPERATOR', value: '>=', line: this.line };
        }
        if (char === '!' && this.peek() === '=') {
            this.pos++;
            return { type: 'OPERATOR', value: '!=', line: this.line };
        }
        return { type: 'OPERATOR', value: char, line: this.line };
    }

    skipComment() {
        while (this.peek() !== '\n' && this.pos < this.input.length) {
            this.pos++;
        }
    }
}
