const request = require("request-promise");
const fs =require("fs");

module.exports = {
    site_cat : "http://aws.random.cat/meow",
    site_dog : "https://random.dog/woof.json",
    random_cat : function(){
        return new Promise((resolve)=>{
            request(this.site_cat).then(j => {
                resolve(JSON.parse(j).file);
            });
        })
    }, 
    random_dog : function (){
        return new Promise((resolve)=>{
            request(this.site_dog).then(j => {
                resolve(JSON.parse(j).url);
            });
        })
    },
    getUserAvatar : function(userId){
        return new Promise((resolve)=>{
            request("http://graph.facebook.com/"+ userId + "/picture?height=720&width=720")
                .pipe(fs.createWriteStream("./src/avatar.jpg"));
        })
    },
    addReaction : function(msgID,threadID){
        let opt = {
            method: 'POST',
            uri : "https://www.facebook.com/webgraphql/mutation/?doc_id=1491398900900362&variables=%7B%22data%22%3A%7B%22client_mutation_id%22%3A%220%22%2C%22actor_id%22%3A%22100009010889693%22%2C%22action%22%3A%22ADD_REACTION%22%2C%22message_id%22%3A%22mid.%24cAAAAAaINIjlrSgN_ZllGL44uUhop%22%2C%22reaction%22%3A%22%F0%9F%98%8D%22%7D%7D&dpr=1",
            body: "__user=100009010889693&__a=1&__dyn=7AgNe-4amaAxd2u6aJGeFxqeCwDKEyGzEy4arWo8ovxGdwIhE98nwgUaofUvHyorxuEbbyEjKewXGt0TyKdwJKdx3wCgmVUkz8nxm1Dxa2m4oqwi88U8EeGxW5obof8Wum2S2G16Dx6WK6468nxK2C12wgovy8nyETwPxC48Sez_G48x5wKwCzay94u4e4oC2biAxqt5UjUy6F4iaz9oCmUpzUiVE7W4aDx639yFoK4FFXAye2y5ojx6bK&__req=1s&__be=1&__pc=EXP2%3ADEFAULT&__rev=4186911&fb_dtsg=AQH620VBQv4A%3AAQHS1wSnJeNi&jazoest=26581725450488666811185265586581728349119831107410178105&__spin_r=4186911&__spin_b=trunk&__spin_t=1533716453",
            headers : {
                "Accept": "*/*",
                "Accept-Encoding":"gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection" : "keep-alive",
                "Content-Length":"511",
                "Content-Type":"application/x-www-form-urlencoded",
                "Cookie":"fr=0u69RtjsAzf0yGOZX.AWXy3k5cGAX-0VEWbvjIpn_ATqg.BbGlz0.dH.AAA.0.0.BbapRI.AWWQoePZ; sb=9FwaW_-m9hmUrxjF2gUbmWgu; wd=1366x326; datr=9FwaW4O641gC6np52-SnFY0n; c_user=100009010889693; xs=21%3Az3AKkWGFlfNDbg%3A2%3A1528848840%3A13618%3A7727; pl=n; spin=r.4183217_b.trunk_t.1533682268_s.1_v.2_; act=1533712946868%2F20; presence=EDvF3EtimeF1533713554EuserFA21B09010889693A2EstateFDsb2F1533713541337EatF1533713551258Et3F_5bDiFA2thread_3a2280940368589017A2ErF1EoF1EfF1CAcDiFA2user_3a1B23202380649A2ErF1EoF4EfF14C_5dElm3FA2user_3a1B23202380649A2Eutc3F1533713360716G533713554262CEchFDp_5f1B09010889693F129CC",
                "Host":"www.facebook.com",
                "Referer":"https://www.facebook.com/",
                "User-Agent":"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:59.0) Gecko/20100101 Firefox/59.0"
            }
        }
        request(opt).then(console.log);
    }
} 