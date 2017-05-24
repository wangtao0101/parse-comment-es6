import stripComment from '../stripComment';

const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

test('strip jquery correct', () => {
    if (fs.existsSync(path.join(__dirname, 'lib/jquery-3.2.1.js'))) {
        const lib = fs.readFileSync(path.join(__dirname, 'lib/jquery-3.2.1.js')).toString();
        const strippedLib = stripComment(lib).text;
        const libMinified = UglifyJS.minify(lib);
        const strippedLibMinified = UglifyJS.minify(strippedLib);
        expect(libMinified).toEqual(strippedLibMinified);
        fs.writeFileSync(path.join(process.cwd(), 'src/test/lib', 'strippedJquery.js'), strippedLib);
    }
});

test('strip react correct', () => {
    if (fs.existsSync(path.join(__dirname, 'lib/react.js'))) {
        const lib = fs.readFileSync(path.join(__dirname, 'lib/react.js')).toString();
        const strippedLib = stripComment(lib).text;
        const libMinified = UglifyJS.minify(lib);
        const strippedLibMinified = UglifyJS.minify(strippedLib);
        expect(libMinified).toEqual(strippedLibMinified);
        fs.writeFileSync(path.join(process.cwd(), 'src/test/lib', 'strippedReact.js'), strippedLib);
    }
});

test('strip react-dom correct', () => {
    if (fs.existsSync(path.join(__dirname, 'lib/react-dom.js'))) {
        const lib = fs.readFileSync(path.join(__dirname, 'lib/react-dom.js')).toString();
        const strippedLib = stripComment(lib).text;
        const libMinified = UglifyJS.minify(lib);
        const strippedLibMinified = UglifyJS.minify(strippedLib);
        expect(libMinified).toEqual(strippedLibMinified);
        fs.writeFileSync(path.join(process.cwd(), 'src/test/lib', 'strippedReactDom.js'), strippedLib);
    }
});
