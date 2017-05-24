import stripComment from '../stripComment';

function makeComment(type, range, locStart, locEnd) {
    return {
        type: type === 0 ? 'LineComment' : 'BlockComment',
        range: {
            start: range[0],
            end: range[1],
        },
        loc: {
            start: {
                line: locStart[0],
                column: locStart[1],
            },
            end: {
                line: locEnd[0],
                column: locEnd[1],
            },
        },
    };
}

describe('stripComment', () => {
    test('strip LineComment comment correct', () => {
        const p = '//abc;\n';
        expect(stripComment(p)).toEqual({
            text: '\n',
            comments: [
                makeComment(0, [0, 6], [0, 0], [0, 6]),
            ],
        });
    });

    test('strip LineComment comment correct when encounter \r\n', () => {
        const p = '//abc;\r\na';
        expect(stripComment(p)).toEqual({
            text: '\r\na',
            comments: [
                makeComment(0, [0, 6], [0, 0], [0, 6]),
            ],
        });
    });

    test('strip BlockComment correct', () => {
        const p = '/*abc*/\n';
        expect(stripComment(p)).toEqual({
            text: '\n',
            comments: [
                makeComment(1, [0, 7], [0, 0], [0, 7]),
            ],
        });
    });

    test('strip BlockComment correct mutiline', () => {
        const p = '/*abc\nabc*/\n';
        expect(stripComment(p)).toEqual({
            text: '\n',
            comments: [
                makeComment(1, [0, 11], [0, 0], [1, 5]),
            ],
        });
    });

    test('strip BlockComment correct mutiline  when encounter \r\n', () => {
        const p = '/*abc\r\nabc*/\n';
        expect(stripComment(p)).toEqual({
            text: '\n',
            comments: [
                makeComment(1, [0, 12], [0, 0], [1, 5]),
            ],
        });
    });

    test('out put SINGLE_QUOTE', () => {
        const p = '\'aaa\'//abc\n';
        expect(stripComment(p)).toEqual({
            text: '\'aaa\'\n',
            comments: [
                makeComment(0, [5, 10], [0, 5], [0, 10]),
            ],
        });
    });

    test('out put DOUBLE_QUOTE correct', () => {
        const p = '"aaa"//abc\n';
        expect(stripComment(p)).toEqual({
            text: '"aaa"\n',
            comments: [
                makeComment(0, [5, 10], [0, 5], [0, 10]),
            ],
        });
    });

    test('tolerate SINGLE_QUOTE not closed ', () => {
        const p = '\'aaa\n//abc\n';
        expect(stripComment(p)).toEqual({
            text: '\'aaa\n\n',
            comments: [
                makeComment(0, [5, 10], [1, 0], [1, 5]),
            ],
        });
    });

    test('tolerate SINGLE_QUOTE not closed when using \r\n', () => {
        const p = '\'aaa\r\n//abc\n';
        expect(stripComment(p)).toEqual({
            text: '\'aaa\r\n\n',
            comments: [
                makeComment(0, [6, 11], [1, 0], [1, 5]),
            ],
        });
    });

    test('out put BACK_QUOTE correct', () => {
        const p = '`aaa`\n//abc\n';
        expect(stripComment(p)).toEqual({
            text: '`aaa`\n\n',
            comments: [
                makeComment(0, [6, 11], [1, 0], [1, 5]),
            ],
        });
    });

    test('out put BACK_QUOTE in mutiline correct', () => {
        const p = '`aaa\n`//abc\n';
        expect(stripComment(p)).toEqual({
            text: '`aaa\n`\n',
            comments: [
                makeComment(0, [6, 11], [1, 1], [1, 6]),
            ],
        });
    });

    test('out put REGEX correct', () => {
        const p = '/aaa/\n//abc\n';
        expect(stripComment(p)).toEqual({
            text: '/aaa/\n\n',
            comments: [
                makeComment(0, [6, 11], [1, 0], [1, 5]),
            ],
        });
    });

    test('out put REGEX correct when encounter escape', () => {
        const p = '/\\/aaa///abc\n';
        expect(stripComment(p)).toEqual({
            text: '/\\/aaa/\n',
            comments: [
                makeComment(0, [7, 12], [0, 7], [0, 12]),
            ],
        });
    });

    test('out put REGEX correct when encounter continuously escape', () => {
        const p = '/\\\\/aaa///abc\n';
        expect(stripComment(p)).toEqual({
            text: '/\\\\/aaa\n',
            comments: [
                makeComment(0, [7, 13], [0, 7], [0, 13]),
            ],
        });
    });

    test('out line feed correct in main loop', () => {
        const p = '\naa//abc\n';
        expect(stripComment(p)).toEqual({
            text: '\naa\n',
            comments: [
                makeComment(0, [3, 8], [1, 2], [1, 7]),
            ],
        });
    });

    test('out line feed correct using \r\n in main loop', () => {
        const p = '\r\n//abc\n';
        expect(stripComment(p)).toEqual({
            text: '\r\n\n',
            comments: [
                makeComment(0, [2, 7], [1, 0], [1, 5]),
            ],
        });
    });
});
