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

let col = new COL(__dirname + '\\test.col');