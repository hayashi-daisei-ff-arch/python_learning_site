/**
 * Error message translator
 * Translates Python error messages to Japanese
 */
export class ErrorTranslator {
    static translate(errorMessage) {
        const translations = {
            // Name errors
            "is not defined": "は定義されていません",
            "NameError": "名前エラー",

            // Type errors
            "is not subscriptable": "はインデックスでアクセスできません",
            "TypeError": "型エラー",

            // Index errors
            "list index out of range": "リストのインデックスが範囲外です",
            "IndexError": "インデックスエラー",

            // Division errors
            "division by zero": "0で割ることはできません",
            "modulo by zero": "0で割った余りは計算できません",
            "ZeroDivisionError": "ゼロ除算エラー",

            // Parse errors
            "Unexpected token": "予期しないトークン",
            "Expected token": "トークンが必要です",
            "Parse Error": "構文エラー",

            // General
            "Error": "エラー"
        };

        let translated = errorMessage;

        // Apply translations
        for (const [english, japanese] of Object.entries(translations)) {
            translated = translated.replace(new RegExp(english, 'g'), japanese);
        }

        return translated;
    }

    static formatError(error) {
        const message = error.message;

        // If already has Japanese, return as is
        if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(message)) {
            return message;
        }

        // Otherwise translate
        return this.translate(message);
    }
}
