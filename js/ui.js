/**
 * UI Manager
 * Handles DOM interactions and updates.
 */
import { templates } from './templates.js';

export class UI {
    constructor() {
        this.codeEditor = document.getElementById('code-editor');
        this.codeBackdrop = document.getElementById('code-backdrop');
        this.lineNumbers = document.getElementById('line-numbers');
        this.runBtn = document.getElementById('run-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.consoleOutput = document.getElementById('console-output');
        this.variablesContent = document.getElementById('variables-content');
        this.feedbackContent = document.getElementById('feedback-content');
        this.templateSelect = document.getElementById('template-select');
        this.editorContainer = document.querySelector('.editor-container');

        // Line highlight element
        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'highlight-line';
        // Append to editor-wrapper if possible, otherwise container
        const wrapper = document.querySelector('.editor-wrapper');
        if (wrapper) {
            wrapper.appendChild(this.highlightElement);
        } else {
            this.editorContainer.appendChild(this.highlightElement);
        }
        this.highlightElement.style.display = 'none';

        this.setupEventListeners();
        this.updateLineNumbers();
        this.updateBackdrop(); // Initial update
    }

    setupEventListeners() {
        this.codeEditor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.clearHighlight();
            this.updateBackdrop();
        });

        this.codeEditor.addEventListener('scroll', () => {
            this.syncScroll();
            this.updateHighlightPosition();
        });

        this.codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.codeEditor.selectionStart;
                const end = this.codeEditor.selectionEnd;
                this.codeEditor.value = this.codeEditor.value.substring(0, start) + "    " + this.codeEditor.value.substring(end);
                this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 4;
                this.updateBackdrop();
            }
        });

        this.templateSelect.addEventListener('change', (e) => {
            const key = e.target.value;
            if (templates[key]) {
                this.codeEditor.value = templates[key];
                this.updateLineNumbers();
                this.clearHighlight();
                this.clearConsole();
                this.updateVariables({});
                this.updateBackdrop();
                this.showFeedback("テンプレートを読み込みました。実行ボタンを押してください。");
            }
        });
    }

    updateBackdrop() {
        if (!this.codeBackdrop) return;

        const text = this.codeEditor.value;
        // Replace zenkaku space and zenkaku alphanumeric with highlighted spans
        // Zenkaku Space: \u3000
        // Zenkaku Alphanumeric: \uFF01-\uFF5E
        let html = text.replace(/([\u3000\uFF01-\uFF5E]+)/g, '<span class="zenkaku-highlight">$1</span>');

        // Handle trailing newline for correct height
        if (text.endsWith('\n')) {
            html += '<br>';
        }

        this.codeBackdrop.innerHTML = html;
    }

    syncScroll() {
        this.lineNumbers.scrollTop = this.codeEditor.scrollTop;
        if (this.codeBackdrop) {
            this.codeBackdrop.scrollTop = this.codeEditor.scrollTop;
            this.codeBackdrop.scrollLeft = this.codeEditor.scrollLeft;
        }
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

            // Determine type and format value for display
            let displayValue = value;
            let dataType = '';

            if (Array.isArray(value)) {
                displayValue = `[${value.join(', ')}]`;
                dataType = 'リスト';
            } else if (typeof value === 'number') {
                if (Number.isInteger(value)) {
                    dataType = '数値-整数';
                } else {
                    dataType = '数値-小数';
                }
            } else if (typeof value === 'string') {
                displayValue = `"${value}"`;
                dataType = '文字列';
            } else if (typeof value === 'boolean') {
                dataType = '真偽値';
            }

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span class="variable-name">${name}</span>
                    <div style="text-align: right;">
                        <span class="variable-value">${displayValue}</span>
                        <span class="variable-type" style="font-size: 0.75em; opacity: 0.6; margin-left: 8px;">(${dataType})</span>
                    </div>
                </div>
            `;
            this.variablesContent.appendChild(item);
        }
    }

    highlightLine(lineNumber) {
        this.currentLine = lineNumber;
        if (!lineNumber || lineNumber < 1) {
            this.highlightElement.style.display = 'none';
            return;
        }

        const lineHeight = 21; // Approximation based on CSS
        const top = (lineNumber - 1) * lineHeight;

        this.highlightElement.style.display = 'block';
        this.highlightElement.style.top = `${top}px`;
        this.highlightElement.style.height = `${lineHeight}px`;

        this.updateHighlightPosition();
    }

    updateHighlightPosition() {
        if (this.currentLine) {
            const lineHeight = 21;
            // Adjust for scroll. Note: highlightElement is now inside editor-wrapper (relative),
            // but we might need to adjust logic if it's absolute.
            // If it's inside wrapper (which scrolls?), no, wrapper has overflow:hidden, textarea scrolls.
            // Actually, textarea scrolls, but wrapper doesn't.
            // So we need to subtract scrollTop.
            const top = (this.currentLine - 1) * lineHeight + 10 - this.codeEditor.scrollTop;
            this.highlightElement.style.top = `${top}px`;
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
