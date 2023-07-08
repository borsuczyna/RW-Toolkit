// ---- IMG ----

// import IMG from "../IMG/IMG";

// let img = new IMG(__dirname + '\\test.img');

// img.addFile('test123456789.txt', Buffer.from('Hello dsaj hdusah dusah udsagu dgsauy gdsauyg duysag dyuWorld!'));
// img.addFile('test3213.txt', Buffer.from('Hello World!'));

// console.log(`IMG Version: ${img.version}`);
// console.log(`IMG Size: ${img.size}`);
// console.log(`IMG Entries: ${img.entries.length}`);
// console.log('-'.repeat(20));

// img.entries.forEach(entry => {
//     console.log(`${entry.name} (${entry.streamingSize} bytes) - ${img.getFile(entry.name)!.length} @ ${entry.offsetString}`);
// });

// img.saveToFile(__dirname + '\\output.img');



// import { COL } from "../COL/COL";
// import { WriteStream } from "../utils/stream";

// let col2 = new COL(__dirname + '\\test.col');
// col2.regenerateBounds = false;
// col2.save(__dirname + '\\output.col');

// let col = new COL(__dirname + '\\output.col');
// console.log(col.toString())

// DFF

import DFF from "../DFF/DFF";
import { RWVersion } from "../DFF/enums";

let startAll = Date.now();
for(let i = 0; i < 100; i++) {
    let start = Date.now();
    let dff = new DFF(__dirname + '\\test.dff');
    dff.save(__dirname + '\\output.dff');
    console.log(`Read time: ${Date.now() - start}ms`);
}
// let dff = new DFF(__dirname + '\\test.dff');
// console.log(dff.version == RWVersion.GTASA);
console.log(`Read and write time: ${Date.now() - startAll}ms`);