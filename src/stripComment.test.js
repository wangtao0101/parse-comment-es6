import stripComment from './stripComment';

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
    test('stip LineComment comment correct', () => {
        const p = '//abc;\n';
        expect(stripComment(p)).toEqual({
            text: '\n',
            comments: [
                makeComment(0, [0, 6], [0, 0], [0, 6]),
            ],
        });
    });

    test('stip BlockComment correct', () => {
        const p = '/*abc*/\n';
        expect(stripComment(p)).toEqual({
            text: '\n',
            comments: [
                makeComment(1, [0, 7], [0, 0], [0, 7]),
            ],
        });
    });
});
