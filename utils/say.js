const request = require("request");
const fs = require("fs");
module.exports = {
    vn : function(text,callback){
        let url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`
        request({
            uri: url
        })
        .pipe(fs.createWriteStream(__dirname +'/src/say.mp3'))
        .on('close', function() {
            callback();
        });
    },
    other : function(text,key,callback){
        let url = `https://www.bing.com/tspeak?&format=audio/mp3&language=${key}&IG=5CD131BD1E75424EBDB9FE297250F65A&IID=translator.5034.2&text=${encodeURI(text)}`
        request({
            uri: url
        })
        .pipe(fs.createWriteStream(__dirname+'/src/say.mp3'))
        .on('close',function(){
            callback();
        })
    }
}
