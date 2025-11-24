/**
 * Interpreter for Custom Python Interpreter
 * Executes the AST step-by-step using Generators.
 */
export class Interpreter {
    constructor(ast, outputCallback, updateVariablesCallback, feedbackCallback) {
        this.ast = ast;
        this.outputCallback = outputCallback;
        this.updateVariablesCallback = updateVariablesCallback;
        this.feedbackCallback = feedbackCallback || (() => { });
        this.variables = {};
        this.generator = this.createGenerator();
        this.currentLine = 0;
    }

    *createGenerator() {
        for (const stmt of this.ast) {
            yield* this.execute(stmt);
        }
    }

    *execute(stmt) {
        // Yield the statement info BEFORE execution to highlight the line
        this.currentLine = stmt.line;
        yield { line: stmt.line, phase: 'before' };

        switch (stmt.type) {
            case 'PrintStatement':
                const value = this.evaluate(stmt.expression);
                this.outputCallback(value);
                this.feedbackCallback(`画面に「${value}」を表示しました`);
                break;
            case 'AssignmentStatement':
                const assignValue = this.evaluate(stmt.value);
                this.variables[stmt.name] = assignValue;
                const displayValue = Array.isArray(assignValue) ? `[${assignValue.join(', ')}]` : assignValue;
                this.feedbackCallback(`変数「${stmt.name}」に ${displayValue} を代入しました`);
                break;
            case 'IfStatement':
                if (this.evaluate(stmt.condition)) {
                    for (const child of stmt.body) {
                        yield* this.execute(child);
                    }
                }
                break;
            case 'WhileStatement':
                while (this.evaluate(stmt.condition)) {
                    for (const child of stmt.body) {
                        yield* this.execute(child);
                    }
                }
                break;
            case 'ForStatement':
                const iterable = this.evaluate(stmt.iterable);
                if (!Array.isArray(iterable)) {
                    throw new Error("TypeError: object is not iterable");
                }
                for (const item of iterable) {
                    this.variables[stmt.iterator] = item;
                    for (const child of stmt.body) {
                        yield* this.execute(child);
                    }
                }
                break;
            case 'ExpressionStatement':
                this.evaluate(stmt.expression);
                break;
        }
    }

    evaluate(expr) {
        switch (expr.type) {
            case 'Literal':
                return expr.value;
            case 'ListLiteral':
                return expr.elements.map(e => this.evaluate(e));
            case 'Variable':
                if (this.variables[expr.name] === undefined) {
                    throw new Error(`NameError: name '${expr.name}' is not defined`);
                }
                return this.variables[expr.name];
            case 'BinaryExpression':
                const left = this.evaluate(expr.left);
                const right = this.evaluate(expr.right);
                switch (expr.operator) {
                    case '+':
                        if (Array.isArray(left) && Array.isArray(right)) return left.concat(right);
                        return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                    case '==':
                        if (Array.isArray(left) && Array.isArray(right)) return JSON.stringify(left) === JSON.stringify(right);
                        return left === right;
                    case '<': return left < right;
                    case '>': return left > right;
                }
                break;
        }
    }

    step() {
        try {
            const res = this.generator.next();
            if (res.done) {
                return { done: true };
            }
            this.updateVariablesCallback(this.variables);
            return { done: false, line: res.value.line };
        } catch (e) {
            this.outputCallback(`Error: ${e.message}`);
            return { done: true, error: e };
        }
    }
}
