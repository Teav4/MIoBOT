const request = require("request");
const fs = require("fs");
module.exports = function(text,callback){
    let url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`
    request({
        uri: url
    })
    .pipe(fs.createWriteStream(__dirname +'/src/say.mp3'))
    .on('close', function() {
        callback();
    });
    
}