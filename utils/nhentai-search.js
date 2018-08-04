const request = require("request-promise");
const fs = require("fs");
module.exports = {
    opt : {
        headers : {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0}"
        },
        json : true
    },
    image_host: "https://i.nhentai.net/galleries/",
    get : function(id) {
        return new Promise((resolve) => {
            this.opt.uri = "https://nhentai.net/api/gallery/"+id;
            request(this.opt).then(function (json) {
                    let tags = []; json.tags.forEach(e => {tags.push(e.name)});
                    resolve({
                        error : false,
                        title : json.title.english,
                        id : json.id,
                        pages: json.num_pages,
                        favorites : json.num_favorites,
                        tags : tags,
                        "image-id": json.media_id
                    });
            })
            .catch(() => {
                resolve({error : true});
            });
        })
    },
    createURL : function(image_id,num_pages){
        let arr = [];
        for(let i=1;i<=num_pages;++i){
            arr.push(this.image_host+image_id+"/"+i+".jpg");
        }
        return arr;
    },
    getStream : function(id,pages,image_id){
        return new Promise((resolve)=>{
            let att = [];
            this.load(id,image_id,pages);
            for(let i=1;i<=pages;++i)
                att.push(fs.createReadStream("./"+id+"/"+i+".jpg"));
            resolve(att);    
        });
    },
    downloadImg : function(uri,id,index){
        let dir = './'+id+'/';
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        request({
            uri: uri
        })
        .pipe(fs.createWriteStream(dir + index + '.jpg'))
        .on('close', function() {});    

    },
    load : function(id,image_id,num_pages) {
        let url = this.createURL(image_id,num_pages); let i = 0;
        Promise.all(url.map(e =>{
            ++i; this.downloadImg(e,id,i);
        }))
    }
}