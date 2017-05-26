export default function stripComment(stringIN, option = {}) {
    const SLASH = '/';
    const BACK_SLASH = '\\';
    const STAR = '*';
    const DOUBLE_QUOTE = '"';
    const SINGLE_QUOTE = "'";
    const NEW_LINE = '\n';
    const CARRIAGE_RETURN = '\r';
    const BACK_QUOTE = '`';

    const string = stringIN;
    const length = string.length;
    let position = 0;
    const output = [];

    const comments = [];
    let lineNumber = 0;
    let lineStart = 0;

    const comment = option.comment === true;
    const range = option.range === true;
    const loc = option.loc === true;
    const raw = option.raw === true;

    function nextLine() {
        lineNumber += 1;
    }

    function getCurrentCharacter() {
        return string.charAt(position);
    }

    function getPreviousCharacter() {
        return string.charAt(position - 1);
    }

    function getNextCharacter() {
        return string.charAt(position + 1);
    }

    function add() {
        output.push(getCurrentCharacter());
    }

    function next() {
        position += 1;
    }

    function atEnd() {
        return position >= length;
    }

    function addComment(com) {
        if (!comment) {
            return;
        }

        if (!raw) {
            delete com.raw; // eslint-disable-line
        }

        if (!loc) {
            delete com.loc; // eslint-disable-line
        }

        if (!range) {
            delete com.range; // eslint-disable-line
        }
        comments.push(com);
    }

    function isEscaping() {
        if (getPreviousCharacter() === BACK_SLASH) {
            let caret = position - 1;
            let escaped = true;
            while (caret - 1 >= 0) {
                caret -= 1;
                if (string.charAt(caret) !== BACK_SLASH) {
                    return escaped;
                }
                escaped = !escaped;
            }
            return escaped;
        }
        return false;
    }

    function processSingleLineComment() {
        if (getCurrentCharacter() === SLASH) {
            if (getNextCharacter() === SLASH) {
                const com = {
                    type: 'LineComment',
                    loc: {},
                    range: {},
                };
                com.loc.start = {
                    line: lineNumber,
                    column: position - lineStart,
                };
                com.range.start = position;
                next();
                while (!atEnd()) {
                    next();
                    if (getCurrentCharacter() === NEW_LINE
                        || getCurrentCharacter() === CARRIAGE_RETURN) {
                        com.loc.end = {
                            line: lineNumber,
                            column: position - lineStart,
                        };
                        com.range.end = position;
                        com.raw = string.substring(com.range.start, com.range.end);
                        nextLine();
                        if (getCurrentCharacter() === CARRIAGE_RETURN
                            && getNextCharacter() === NEW_LINE) {
                            add();
                            next();
                        }
                        add();
                        next();
                        addComment(com);
                        lineStart = position;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function processMultiLineComment() {
        if (getCurrentCharacter() === SLASH) {
            if (getNextCharacter() === STAR) {
                const com = {
                    type: 'BlockComment',
                    loc: {},
                    range: {},
                };
                com.loc.start = {
                    line: lineNumber,
                    column: position - lineStart,
                };
                com.range.start = position;
                next();
                while (!atEnd()) {
                    next();
                    if (getCurrentCharacter() === NEW_LINE
                        || getCurrentCharacter() === CARRIAGE_RETURN) {
                        nextLine();
                        if (getCurrentCharacter() === CARRIAGE_RETURN
                            && getNextCharacter() === NEW_LINE) {
                            next();
                        }
                        lineStart = position + 1;
                    } else if (getCurrentCharacter() === STAR) {
                        if (getNextCharacter() === SLASH) {
                            next();
                            next();
                            com.loc.end = {
                                line: lineNumber,
                                column: position - lineStart,
                            };
                            com.range.end = position;
                            com.raw = string.substring(com.range.start, com.range.end);
                            addComment(com);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    function processSingleCharacterExpression(character) {
        if (getCurrentCharacter() === character) {
            add();
            next();
            while (!atEnd()) {
                /**
                 * tolerate line feed
                 */
                if (getCurrentCharacter() === NEW_LINE
                    || getCurrentCharacter() === CARRIAGE_RETURN) {
                    nextLine();
                    if (getCurrentCharacter() === CARRIAGE_RETURN
                        && getNextCharacter() === NEW_LINE) {
                        add();
                        next();
                    }
                    add();
                    next();
                    lineStart = position;
                    if (character !== BACK_QUOTE) {
                        return true;
                    }
                } else if (getCurrentCharacter() === character && !isEscaping()) {
                    add();
                    next();
                    return true;
                } else {
                    add();
                    next();
                }
            }
        }
        return false;
    }

    function process() {
        if (processSingleCharacterExpression(BACK_QUOTE)) {
            return;
        }
        if (processSingleCharacterExpression(DOUBLE_QUOTE)) {
            return;
        }
        if (processSingleCharacterExpression(SINGLE_QUOTE)) {
            return;
        }
        if (processSingleLineComment()) {
            return;
        }
        if (processMultiLineComment()) {
            return;
        }
        if (processSingleCharacterExpression(SLASH)) {
            return;
        }
        if (!atEnd()) {
            if (getCurrentCharacter() === NEW_LINE
                || getCurrentCharacter() === CARRIAGE_RETURN) {
                nextLine();
                if (getCurrentCharacter() === CARRIAGE_RETURN
                    && getNextCharacter() === NEW_LINE) {
                    add();
                    next();
                }
                add();
                next();
                lineStart = position;
            } else {
                add();
                next();
            }
        }
    }

    while (!atEnd()) {
        process();
    }
    return {
        text: output.join(''),
        comments,
    };
}
