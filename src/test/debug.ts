import * as fs from 'fs';

let c = '';

export function fopen(...args: any[]) {
    for (let i = 0; i < args.length; i++) {
        c += (args[i].toString ? args[i].toString() : args[i]) + ' ';
    }
    c += '\n';
}

export function fclose() {
    fs.writeFileSync('C:/Program Files (x86)/MTA San Andreas 1.6/server/mods/deathmatch/resources/rwiotest/ts.txt', c);
}