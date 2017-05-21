export default function stripComments(stringIN, trackComment) {
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
    const trackComment = trackComment;

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

    function isEscaping() {
        if (getPreviousCharacter() === BACK_SLASH) {
            let caret = position - 1;
            let escaped = true;
            while (caret - 1 > 0) {
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

    function isLineTerminator(cp) {
        return cp === '\r' || cp === '\n';
    }

    function processBackQuotedString() {
        if (getCurrentCharacter() === BACK_QUOTE) {
            add();
            next();
            while (!atEnd()) {
                if (getCurrentCharacter() === BACK_QUOTE && !isEscaping()) {
                    return;
                }
                add();
                next();
            }
        }
    }

    function processSingleQuotedString() {
        if (getCurrentCharacter() === SINGLE_QUOTE) {
            add();
            next();
            while (!atEnd()) {
                if (getCurrentCharacter() === SINGLE_QUOTE && !isEscaping()) {
                    return;
                }
                add();
                next();
            }
        }
    }

    function processDoubleQuotedString() {
        if (getCurrentCharacter() === DOUBLE_QUOTE) {
            add();
            next();
            while (!atEnd()) {
                if (getCurrentCharacter() === DOUBLE_QUOTE && !isEscaping()) {
                    return;
                }
                add();
                next();
            }
        }
    }

    function processSingleLineComment() {
        if (getCurrentCharacter() === SLASH) {
            if (getNextCharacter() === SLASH) {
                const comment = {
                    type: 'LineComment',
                };
                comment.begin = {
                    line: lineNumber,
                    column: position - lineStart - 1,
                };
                next();
                while (!atEnd()) {
                    next();
                    if (getCurrentCharacter() === NEW_LINE
                        || getCurrentCharacter() === CARRIAGE_RETURN) {
                        comment.end = {
                            line: lineNumber,
                            column: position - lineStart - 1,
                        };
                        nextLine();
                        if (getCurrentCharacter() === CARRIAGE_RETURN
                            && getNextCharacter() === NEW_LINE) {
                            add();
                            next();
                        }
                        add();
                        next();
                        comments.push(comment);
                        return;
                    }
                }
            }
        }
    }

    function processMultiLineComment() {
        if (getCurrentCharacter() === SLASH) {
            if (getNextCharacter() === STAR) {
                next();
                while (!atEnd()) {
                    next();
                    if (getCurrentCharacter() === STAR) {
                        if (getNextCharacter() === SLASH) {
                            next();
                            next();
                            return;
                        }
                    }
                }
            }
        }
    }

    function processRegularExpression() {
        if (getCurrentCharacter() === SLASH) {
            add();
            next();
            while (!atEnd()) {
                if (getCurrentCharacter() === SLASH && !isEscaping()) {
                    return;
                }
                add();
                next();
            }
        }
    }

    while (!atEnd()) {
        processBackQuotedString();
        processDoubleQuotedString();
        processSingleQuotedString();
        processSingleLineComment();
        processMultiLineComment();
        processRegularExpression();
        if (!atEnd()) {
            add();
            next();
        }
    }
    return output.join('');
}
