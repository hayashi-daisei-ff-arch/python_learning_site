/**
 * Japanese to Python translator
 * Converts Japanese keywords to Python keywords
 */
export class JapaneseTranslator {
    static translate(code) {
        // Japanese keyword mappings
        const mappings = {
            'もし': 'if',
            'そうでなければ': 'else',
            '繰り返す': 'while',
            '各': 'for',
            'の中の': 'in',
            '表示': 'print',
            'かつ': 'and',
            'または': 'or',
            '真': 'True',
            '偽': 'False'
        };

        let translatedCode = code;

        // Replace Japanese keywords with English
        for (const [japanese, english] of Object.entries(mappings)) {
            const regex = new RegExp(japanese, 'g');
            translatedCode = translatedCode.replace(regex, english);
        }

        return translatedCode;
    }
}
