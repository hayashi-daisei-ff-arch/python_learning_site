/**
 * UI Manager
 * Handles DOM interactions and updates.
 */
import { templates } from './templates.js';

export class UI {
    constructor() {
        this.codeEditor = document.getElementById('code-editor');
        this.lineNumbers = document.getElementById('line-numbers');
        this.runBtn = document.getElementById('run-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.variablesContent = document.getElementById('variables-content');
        this.consoleOutput = document.getElementById('console-output');
        this.editorContainer = document.querySelector('.editor-container');
        this.templateSelect = document.getElementById('template-select');
        this.feedbackContent = document.getElementById('feedback-content');

        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'highlight-line';
        this.editorContainer.appendChild(this.highlightElement);
        this.highlightElement.style.display = 'none';

        this.setupEventListeners();
        this.updateLineNumbers();
    }

    setupEventListeners() {
        this.codeEditor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.clearHighlight();
        });

        this.codeEditor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.codeEditor.scrollTop;
            this.updateHighlightPosition();
        });

        this.templateSelect.addEventListener('change', (e) => {
            const key = e.target.value;
            if (templates[key]) {
                this.codeEditor.value = templates[key];
                this.updateLineNumbers();
                this.clearHighlight();
                this.clearConsole();
                this.updateVariables({});
                this.showFeedback("テンプレートを読み込みました。実行ボタンを押してください。");
            }
        });
    }

    updateLineNumbers() {
        const lines = this.codeEditor.value.split('\n').length;
        this.lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    }

    getCode() {
        return this.codeEditor.value;
    }

    clearConsole() {
        this.consoleOutput.innerHTML = '';
    }

    printToConsole(text) {
        const line = document.createElement('div');
        line.className = 'console-line';
        line.textContent = `> ${text}`;
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    updateVariables(variables) {
        this.variablesContent.innerHTML = '';
        if (Object.keys(variables).length === 0) {
            this.variablesContent.innerHTML = '<div class="empty-state">変数はまだありません</div>';
            return;
        }

        for (const [name, value] of Object.entries(variables)) {
            const item = document.createElement('div');
            item.className = 'variable-item';
            // Format value for display (e.g. arrays)
            let displayValue = value;
            if (Array.isArray(value)) {
                displayValue = `[${value.join(', ')}]`;
            }

            item.innerHTML = `
                <span class="variable-name">${name}</span>
                <span class="variable-value">${displayValue}</span>
            `;
            this.variablesContent.appendChild(item);
        }
    }

    highlightLine(lineNumber) {
        console.log(`Highlighting line: ${lineNumber}`);
        this.currentLine = lineNumber;
        if (!lineNumber || lineNumber < 1) {
            this.highlightElement.style.display = 'none';
            return;
        }

        const lineHeight = 21; // Approximation based on CSS (14px font * 1.5 line-height)
        const top = (lineNumber - 1) * lineHeight;

        this.highlightElement.style.display = 'block';
        // Initial position
        this.highlightElement.style.top = `${top}px`;
        this.highlightElement.style.height = `${lineHeight}px`;

        // Adjust for scroll immediately
        this.updateHighlightPosition();
    }

    updateHighlightPosition() {
        if (this.currentLine) {
            const lineHeight = 21;
            // Calculate top relative to container.
            // Textarea has padding: 10px.
            // ScrollTop moves the text UP, so we must move highlight UP.
            // But highlight is absolute in container.
            // So top should be: (lineIndex * lineHeight) + padding - scrollTop
            const top = (this.currentLine - 1) * lineHeight + 10 - this.codeEditor.scrollTop;
            this.highlightElement.style.top = `${top}px`;
            console.log(`Updated highlight pos: ${top}px (Line: ${this.currentLine}, Scroll: ${this.codeEditor.scrollTop})`);
        }
    }

    clearHighlight() {
        this.highlightElement.style.display = 'none';
        this.currentLine = null;
    }

    showFeedback(message, isError = false) {
        this.feedbackContent.textContent = message;
        this.feedbackContent.className = isError ? 'feedback-content feedback-error' : 'feedback-content';
    }

    onRun(callback) { this.runBtn.onclick = callback; }
    onStep(callback) { this.stepBtn.onclick = callback; }
    onReset(callback) { this.resetBtn.onclick = callback; }
}
