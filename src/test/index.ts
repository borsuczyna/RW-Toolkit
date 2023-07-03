/* ---- IMG ----

import { IMG } from "../IMG/IMG";

let img = new IMG(__dirname + '\\test.img');

console.log(`IMG Version: ${img.version}`);
console.log(`IMG Size: ${img.size}`);
console.log(`IMG Entries: ${img.entries.length}`);
console.log('-'.repeat(20));

img.entries.forEach(entry => {
    console.log(`${entry.name} (${entry.streamingSize} bytes) @ ${entry.offsetString}`);
});
*/

import { COL } from "../COL/COL";
import { WriteStream } from "../utils/stream";

let col2 = new COL(__dirname + '\\test.col');
col2.regenerateBounds = false;
col2.save(__dirname + '\\output.col');

let col = new COL(__dirname + '\\output.col');
console.log(col.toString())