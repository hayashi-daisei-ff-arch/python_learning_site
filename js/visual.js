/**
 * Visual Code Generator
 * Generates Python code from user-friendly form inputs
 */
export class VisualCodeGenerator {
    constructor() {
        this.modal = document.getElementById('visual-modal');
        this.codeType = document.getElementById('code-type');
        this.dynamicForm = document.getElementById('dynamic-form');
        this.addBtn = document.getElementById('add-code-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.visualBtn = document.getElementById('visual-mode-btn');
        this.codeEditor = document.getElementById('code-editor');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.visualBtn.addEventListener('click', () => this.showModal());
        this.cancelBtn.addEventListener('click', () => this.hideModal());
        this.codeType.addEventListener('change', () => this.updateForm());
        this.addBtn.addEventListener('click', () => this.generateCode());

        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
    }

    showModal() {
        this.modal.style.display = 'flex';
        this.updateForm();
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    updateForm() {
        const type = this.codeType.value;
        let html = '';

        switch (type) {
            case 'assign':
                html = `
                    <div class="form-group">
                        <label>変数名:</label>
                        <input type="text" id="var-name" placeholder="例: a">
                    </div>
                    <div class="form-group">
                        <label>値:</label>
                        <input type="text" id="var-value" placeholder="例: 10">
                    </div>
                `;
                break;
            case 'calc':
                html = `
                    <div class="form-group">
                        <label>結果を入れる変数:</label>
                        <input type="text" id="result-var" placeholder="例: c">
                    </div>
                    <div class="form-group">
                        <label>計算式:</label>
                        <input type="text" id="expression" placeholder="例: a + b">
                    </div>
                `;
                break;
            case 'print':
                html = `
                    <div class="form-group">
                        <label>表示する内容:</label>
                        <input type="text" id="print-value" placeholder="例: a または \"こんにちは\"">
                    </div>
                `;
                break;
            case 'if':
                html = `
                    <div class="form-group">
                        <label>条件:</label>
                        <input type="text" id="condition" placeholder="例: a > 10">
                    </div>
                    <div class="form-group">
                        <label>条件が真の時の処理:</label>
                        <input type="text" id="if-body" placeholder="例: print(a)">
                    </div>
                `;
                break;
            case 'loop':
                html = `
                    <div class="form-group">
                        <label>繰り返しの種類:</label>
                        <select id="loop-type">
                            <option value="while">while (条件)</option>
                            <option value="for">for (リスト)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>条件 または リスト:</label>
                        <input type="text" id="loop-condition" placeholder="例: count < 5 または [1,2,3]">
                    </div>
                    <div class="form-group">
                        <label>繰り返す処理:</label>
                        <input type="text" id="loop-body" placeholder="例: print(count)">
                    </div>
                `;
                break;
        }

        this.dynamicForm.innerHTML = html;
    }

    generateCode() {
        const type = this.codeType.value;
        let code = '';

        switch (type) {
            case 'assign':
                const varName = document.getElementById('var-name').value;
                const varValue = document.getElementById('var-value').value;
                code = `${varName} = ${varValue}`;
                break;
            case 'calc':
                const resultVar = document.getElementById('result-var').value;
                const expression = document.getElementById('expression').value;
                code = `${resultVar} = ${expression}`;
                break;
            case 'print':
                const printValue = document.getElementById('print-value').value;
                code = `print(${printValue})`;
                break;
            case 'if':
                const condition = document.getElementById('condition').value;
                const ifBody = document.getElementById('if-body').value;
                code = `if ${condition}:\n    ${ifBody}`;
                break;
            case 'loop':
                const loopType = document.getElementById('loop-type').value;
                const loopCondition = document.getElementById('loop-condition').value;
                const loopBody = document.getElementById('loop-body').value;
                if (loopType === 'while') {
                    code = `while ${loopCondition}:\n    ${loopBody}`;
                } else {
                    code = `for item in ${loopCondition}:\n    ${loopBody}`;
                }
                break;
        }

        // Add code to editor
        const currentCode = this.codeEditor.value;
        this.codeEditor.value = currentCode + (currentCode ? '\n' : '') + code;

        // Trigger input event to update line numbers
        this.codeEditor.dispatchEvent(new Event('input'));

        this.hideModal();
    }
}
