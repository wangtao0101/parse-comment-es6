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

    function processSingleLineComment() {
        if (getCurrentCharacter() === SLASH) {
            if (getNextCharacter() === SLASH) {
                const comment = {
                    type: 'LineComment',
                    loc: {},
                    range: {},
                };
                comment.loc.start = {
                    line: lineNumber,
                    column: position - lineStart,
                };
                comment.range.start = position;
                next();
                while (!atEnd()) {
                    next();
                    if (getCurrentCharacter() === NEW_LINE
                        || getCurrentCharacter() === CARRIAGE_RETURN) {
                        comment.loc.end = {
                            line: lineNumber,
                            column: position - lineStart,
                        };
                        comment.range.end = position;
                        nextLine();
                        if (getCurrentCharacter() === CARRIAGE_RETURN
                            && getNextCharacter() === NEW_LINE) {
                            add();
                            next();
                        }
                        add();
                        next();
                        comments.push(comment);
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
                const comment = {
                    type: 'BlockComment',
                    loc: {},
                    range: {},
                };
                comment.loc.start = {
                    line: lineNumber,
                    column: position - lineStart,
                };
                comment.range.start = position;
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
                            comment.loc.end = {
                                line: lineNumber,
                                column: position - lineStart,
                            };
                            comment.range.end = position;
                            comments.push(comment);
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
    return output.join('');
}
