import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import { UI } from './ui.js';
import { VisualCodeGenerator } from './visual.js';

const ui = new UI();
const visualGen = new VisualCodeGenerator();
let interpreter = null;

function resetInterpreter() {
    interpreter = null;
    ui.clearConsole();
    ui.updateVariables({});
    ui.clearHighlight();
}

function initInterpreter() {
    const code = ui.getCode();

    try {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();

        const parser = new Parser(tokens);
        const ast = parser.parse();

        interpreter = new Interpreter(
            ast,
            (output) => ui.printToConsole(output),
            (vars) => ui.updateVariables(vars),
            (message) => ui.showFeedback(message, false)
        );

        return true;
    } catch (e) {
        ui.printToConsole(`Error: ${e.message}`);
        ui.showFeedback(`エラーが発生しました: ${e.message}`, true);
        return false;
    }
}

ui.onRun(() => {
    resetInterpreter();
    if (initInterpreter()) {
        ui.showFeedback("実行中...");
        let result = { done: false };
        let maxSteps = 1000;
        while (!result.done && maxSteps > 0) {
            result = interpreter.step();
            maxSteps--;
        }
        if (maxSteps === 0) {
            ui.printToConsole("Error: Execution time limit exceeded (Infinite loop?)");
            ui.showFeedback("エラー: 無限ループの可能性があります", true);
        } else {
            ui.showFeedback("実行が完了しました", false);
        }
        ui.clearHighlight();
    }
});

ui.onStep(() => {
    if (!interpreter) {
        if (!initInterpreter()) return;
        ui.showFeedback("ステップ実行を開始します");
    }

    const result = interpreter.step();
    if (result.done) {
        ui.clearHighlight();
        if (!result.error) {
            ui.printToConsole("Execution finished");
            ui.showFeedback("実行が完了しました");
        } else {
            ui.showFeedback(`エラー: ${result.error.message}`, true);
        }
        interpreter = null;
    } else {
        ui.highlightLine(result.line);
    }
});

ui.onReset(() => {
    resetInterpreter();
    ui.printToConsole("Reset complete");
    ui.showFeedback("リセットしました");
});
