const fs = require("fs");
const word = JSON.parse(fs.readFileSync("badword.json","utf-8")); 

let msg = "khoa is gay";

console.log(word);
word.forEach(e => {
    if (e == msg) return console.log(true);
        return console.log(false);
})
