const fs = require("fs");
const request = require("request-promise");
const cheerio = require("cheerio");
const path = require('path');

/* configure folder path */
const folderPath = path.join(__dirname,"..","user","data","sticker");

module.exports = {
    get : function(uri){
        request(uri)
            .then(res => {
                let $ = cheerio.load(res); let ids = []
                let a = $(res).find('span.mdCMN09Image');
                let b = a[0].attribs.style;
                let id = parseInt(b.slice(b.indexOf("/sticker/")+9,b.indexOf("/ANDROID/")));
                for (let i=id;i<=id+40;++i)
                    ids.push(i);
                Promise.all(ids.map(this.load));
                return ids;        
            });
    },
    load : function(id){
        return new Promise((reject)=>{
            request(`https://stickershop.line-scdn.net/stickershop/v1/sticker/${id}/ANDROID/sticker.png;compress=true`)
                .pipe(fs.createWriteStream(folderPath+"/"+id+".png"));
        });
    }
}
