import './main/index'

// import * as readline from 'readline';

// let tests = [
//     {
//         name: 'Adding lights',
//         file: 'adding light'
//     },
// ];

// let readlineSync = readline.createInterface({
//     input: process.stdin,
// });

// async function question(question: string): Promise<string> {
//     process.stdout.write(question);
//     return new Promise((resolve, reject) => {
//         readlineSync.question(question, (answer) => {
//             resolve(answer);
//         });
//     });
// }

// async function main() {
//     console.log('Available tests:')
//     for(let i = 0; i < tests.length; i++) {
//         console.log(`${i+1}. ${tests[i].name}`);
//     }

//     let testIndex = parseInt(await question('\nSelect test: ')) - 1;
//     console.log('');

//     let test = tests[testIndex];
//     import(`./${test.file}/index.ts`);

//     readlineSync.close();
// }

// main();