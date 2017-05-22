import stripComments from './StripComment';

const program = `
// import { abc as ccc } from 'helpalias/api';
// fsdfasdf
import { comabc } , d from './component/com' //sfasdf;
import { a, b, c, comabc } from './component';
var a = \`asdfasdf\`;
/*dfasdf
asdfasdf
*/
`;
console.log(stripComments(program));

