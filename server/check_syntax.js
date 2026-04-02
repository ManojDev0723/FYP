const fs = require('fs');
const content = fs.readFileSync('f:/DealHub/client/src/pages/AdminUserManagement.jsx', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') braces++;
    if (content[i] === '}') braces--;
    if (content[i] === '(') parens++;
    if (content[i] === ')') parens--;
    if (content[i] === '[') brackets++;
    if (content[i] === ']') brackets--;
}

console.log(`Braces: ${braces}`);
console.log(`Parens: ${parens}`);
console.log(`Brackets: ${brackets}`);

// Check tags (very simplified)
const openDivs = (content.match(/<div/g) || []).length;
const closeDivs = (content.match(/<\/div>/g) || []).length;
console.log(`Divs: ${openDivs} open, ${closeDivs} close`);
