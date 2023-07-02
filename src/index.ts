import { IMG } from "./IMG";
import * as fs from 'fs';

let time = Date.now();

let imgData: Buffer = fs.readFileSync(__dirname + '\\test.img');
let img = new IMG(imgData);
let data: Buffer | undefined = img.getFile('bandana.dff');
if(!data) throw new Error('File not found.');

// fs.writeFileSync(__dirname + '\\output.dff', data);

console.log(`Time: ${Date.now() - time}ms`);

img.saveToFile(__dirname + '\\output.img');