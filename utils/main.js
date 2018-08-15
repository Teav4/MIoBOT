const path = require('path');
const configPath = path.join(__dirname, '..', 'user', 'config.json');
const login = require('facebook-chat-api');
const fs = require("fs");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const log = require("./writeLog");
const database = require("./database");
const ran = require("./rainbow");

let option = {
    listenEvents: true,
    logLevel: "warn"
    ,selfListen: false
}
/* prefix */
const prefix = ".";

module.exports = function(cookie) {
    login(cookie, (err, bot) => {
        if (err) Promise.resolve("Lỗi không xác định.")
                    .then(log.writeError)
                    .then(fs.unlinkSync(path.join(__dirname,'..','user','session.json')));

        bot.setOptions(option);
            bot.listen((err, msg) => {
                if (err) log.writeError("Không thể kết nối cuộc trò chuyện.");
                console.log(msg);
                async function proc (msg) {
                    switch(msg.body){
                        case "ping":
                            bot.sendMessage("pong", msg.threadID);
                            break;
                        case "test":
                            bot.sendMessage({sticker:387545608037990},msg.threadID);
                            break;
                        case "help":
                            if(msg.isGroup){
                                bot.sendMessage("nội dung đã được gửi vào hòm thư của bạn",msg.threadID);
                            }
                            bot.sendMessage(fs.readFileSync("./utils/help.txt","utf-8"),(msg.isGroup) ? msg.senderID : msg.threadID); 
                            break;   
                        /* Let people know you are AFK when they mention you */
                        case prefix+"afk":
                            let filePath = path.join(__dirname,"..","user","data","AFK.json");
                            let AFK_list = JSON.parse(fs.readFileSync(filePath,"utf-8"));
                            AFK_list.forEach(e => {
                                if (e.thread == msg.threadID){
                                    e.users.push(msg.senderID);
                                }
                            });
                            AFK_list.push({thread : msg.threadID, users : [msg.senderID]});
                            fs.writeFileSync(filePath,JSON.stringify(AFK_list),"utf-8");
                            break;
                        /* Manage custom command command*/
                        case prefix+"cmd":
                            database.manager(msg.threadID,false)
                                .then(res => bot.sendMessage(res,msg.threadID));
                            break;
                        /* Images of characters that did something bad */    
                        case prefix+"bad":
                            sendRandomImg("gif/Bad")
                            break;
                        /*  Images of blushing characters */    
                        case prefix+"blush":
                            break;
                        /* Get information about the server */
                        case prefix+"serverinfo":
                            break;
                        /* Confused anime girl images */
                        case prefix+"confused":
                            sendRandomImg("gif/Confused");
                            break;
                        /* Cuddle images; you can also mention someone to cuddle them */
                        case prefix+"cuddle":
                            sendRandomImg("gif/Cuddle");
                            break;
                        /* Images of dancing characters */
                        case prefix+"dance":
                            sendRandomImg("gif/Dancing");
                            break;
                        /* Flip a coin */
                        case prefix+"flipcoin":
                            break;
                        /* Display this message */    
                        case prefix+"help":
                            break;   
                        /* Shrug images for when you have no idea */         
                        case prefix+"idk":
                            sendRandomImg("gif/Shrug");
                            break;
                        /* Display bot information */
                        case prefix+"info":
                            break;
                        /* Random insult images; you can also mention someone to insult them */
                        case prefix+"insult":
                            sendRandomImg("gif/Insult")
                            break;
                        /* Random images of dogs from random.dog */
                        case prefix+"inu":
                            break;
                        /* Have me join your server */
                        case prefix+"invite":
                            break;
                        /* Kissing images; you can also mention someone to kiss them */
                        case prefix+"kiss":
                            break;
                        /*  ( ͡° ͜ʖ ͡°) */
                        case prefix+"lenny":
                            bot.sendMessage("( ͡° ͜ʖ ͡°)",msg.threadID);
                            break;
                        /* Lewd image */
                        case prefix+"lewd":
                            break;
                        /* Licking images; you can also mention someone to lick them */
                        case prefix+"lick":
                            sendRandomImg("gif/Lick")
                            break;
                        /* Random cat images from random.cat */
                        case prefix+"neko":
                            ran.random_cat().then(url => request(url).pipe(fs.createWriteStream("./src/neko.jpg"))).then(()=>{
                                bot.sendMessage({attachment: fs.createReadStream("./src/neko.jpg")},msg.threadID);
                            })
                            break;
                        /* Random nomming/eating images */    
                        case prefix+"nom":    
                            break;
                        /* Images of cat girls */
                        case prefix+"catgirl":
                            sendRandomImg("gif/CatGirl");
                            break;
                        /* Headpatting images; you can also mention a user to pat them */
                        case prefix+"pat":
                            sendRandomImg("gif/Pat");
                            break;
                        /* Poke images; you can also mention a user to poke them */
                        case prefix+"poke":
                            sendRandomImg("gif/Poke");
                            break;
                        /* Images of pouting characters */
                        case prefix+"pout":
                            sendRandomImg("gif/Pouting");
                            break;
                        /* Random number generator */
                        case prefix+"random":
                            break;
                        /* group ranking */
                        case prefix+"rank":
                            break;
                        /* Let me remind you */
                        case prefix+"reminder":
                            break;
                        /* Have me say something */
                        case prefix+"say":
                            bot.sendMessage(msg.body,msg.threadID);
                            break;
                        /* Slap images; you can also mention a user to slap them */
                        case prefix+"slap":
                            sendRandomImg("gif/Slap");
                            break;
                        /* Images of smug characters */
                        case prefix+"smug":
                            break;
                        /* Images of characters that are staring; you can also mention a user to stare at them */
                        case prefix+"stare":
                            sendRandomImg("gif/Stare");
                            break;
                        /* Invite link for the support server */
                        case prefix+"support":
                            break;
                        /* Thumbs up images */
                        case prefix+"thumbsup":
                            sendRandomImg("gif/Thumbs");
                            break;
                        /* Triggered memes; you can also mention a user to show them you are triggered at them */
                        case prefix+"triggered":
                            sendRandomImg("gif/Triggered");
                            break;
                        /* Images of crying characters for when you are sad */
                        case prefix+"waa":
                            break;
                        /* Wasted memes */
                        case prefix+"wasted":
                            break;
                        /* Check the bot's prefix */
                        case "prefix":
                            bot.sendMessage("Bot prefix is *"+prefix+"*",msg.threadID);
                            break;                                                    
                        case "check connection":
                            const terminal = await require("./command_exec");
                            return terminal("ping facebook.com -c 1")
                                    .then(res => bot.sendMessage("```\n"+res+"\n```",msg.threadID));    
                    } 
                    /* send sticker everywhere */
                    if (msg.body == "send sticker" || msg.body == "@sticker" || msg.body == "🍀" || msg.body == "<(\")"){
                        sendRandomImg("sticker");
                    }
                    /* bot say ~ */
                    if (msg.body.indexOf("say ") == 0){
                        const tts = require("./say");
                        let callback = function(){
                            let m = {
                                body: "",
                                attachment: fs.createReadStream(__dirname + '/src/say.mp3')
                            }
                            bot.sendMessage(m, msg.threadID);
                        }
                        if (msg.body.indexOf("jp") == 4)
                            tts.other(msg.body.slice(6,msg.body.length),"ja",callback)
                            else 
                        if(msg.body.indexOf("en") == 4)
                            tts.other(msg.body.slice(6,msg.body.length),"en-US",callback)
                            else
                        if(msg.body.indexOf("ko") == 4)
                            tts.other(msg.body.slice(6,msg.body.length),"ko",callback)
                            else     
                        tts.vn(msg.body.slice(4,msg.body.length),callback);
                    }
                    /* is a youtube link ? */
                    if (msg.body.indexOf("play ") == 0 || msg.body.indexOf("sing ") == 0){
                        if (msg.body.indexOf("https://www.youtube.com") == 5 || msg.body.indexOf("https://youtu.be/") == 5 ){
                            const terminal = require("./command_exec");
                            let url = msg.body.slice(5,msg.body.length);
                            if (url != "") {
                                terminal('youtube-dl -f mp4 -o "./utils/src/video.mp4" '+ url).then(() => {
                                    bot.sendMessage("chuyển định dạng sang mp3 ... ", msg.threadID);
                                    /* convert to audio file */
                                    terminal('ffmpeg -i "./utils/src/video.mp4" -vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 "./utils/src/audio.mp3"').then(() => {
                                        bot.sendMessage("upload ... ", msg.threadID);
                                        let m = {
                                            body: "",
                                            attachment: fs.createReadStream(__dirname + '/src/audio.mp3')
                                        } /* send void */
                                        bot.sendMessage(m, msg.threadID);
                                        terminal('rm "./utils/src/video.mp4" "./utils/src/audio.mp3"');
                                    });
                                });
                            } else {log.warning("url is ''");}
                        }
                            
                    }
                    if(msg.body.indexOf("nhentai -i ") == 0){
                        let nhentai = require("./nhentai-search");
                        nhentai.get(msg.body.slice(11,msg.body.length))
                            .then((res) => {
                                if (!res.error) {
                                    let tags = "";
                                    res.tags.map(e => {tags = tags + e +", "});
                                    bot.sendMessage("title: " + res.title,msg.threadID);
                                    bot.sendMessage("pages: " + res.pages + "\nfavorites: " + res.favorites);
                                    bot.sendMessage({
                                        body:"preview image: ",
                                        attachment:[fs.createReadStream("./"+res.id+"/1.jpg"),fs.createReadStream("./"+res.id+"/2.jpg")]
                                    },msg.threadID);
                                    bot.sendMessage("tags: \n"+tags.slice(0,tags.length-2),msg.threadID);
                                } else 
                                    bot.sendMessage("lỗi, id không xác định 😞",msg.threadID);
                            })
                    }
                    if(msg.body.indexOf("nhentai -d ") == 0){
                        let nhentai = require("./nhentai-search");
                        nhentai.get(msg.body.slice(11,msg.body.length))
                            .then((res)=>{
                                nhentai.getStream(res.id,res["image-id"],res.pages)
                                    .then((att)=>{console.log(att);bot.sendMessage({attachment:att},msg.threadID)})
                            });
                    }
                    if (msg.body.indexOf("add sticker ") == 0){
                        let line = require("./lineStore_downloader");
                        let url = msg.body.slice(12,msg.body.length);
                        if(url != "") 
                            line.get(url);   
                    }
                    /* encypt || decrypt */
                    const crypto = require('crypto-js');
                    let key = 'emilia iz da bezt <(")'
                    if(msg.body.indexOf("encode ") == 0){
                        bot.sendMessage((msg.body.slice(7, msg.body.length).trim()) ? crypto.AES.encrypt(msg.body.slice(6, msg.body.length).trim(),key).toString() : "inval input .-.", msg.threadID);
                    }
                    if(msg.body.indexOf("decode ") == 0){
                        if(msg.isGroup){
                            bot.sendMessage("nội dung đã được gửi vào hòm thư của bạn",msg.threadID);
                        }
                        bot.sendMessage((msg.body.slice(7, msg.body.length).trim()) ? crypto.AES.decrypt(msg.body.slice(7, msg.body.length).trim(),key).toString(crypto.enc.Utf8) : "inval input .-.", (msg.isGroup) ? msg.senderID : msg.threadID);
                    }
                    if(msg.body.indexOf("parse ") == 0){
                        let cmd = crypto.AES.decrypt(msg.body.slice(6,msg.body.length),key).toString(crypto.enc.Utf8);
                        msg.body = cmd;
                        proc(msg);
                    }
                    
                    if(msg.body.indexOf("->") != -1){
                        set_command(msg.body);
                        bot.setMessageReaction(":like:", msg.messageID);
                    }
                    if(msg.body.indexOf("set sticker ") == 0){
                        bot.sendMessage("gửi một nhãn dán ...",msg.threadID); // ezz
                    }
                    if(msg.body.indexOf("del ") == 0){
                        let e = msg.body.slice(4,msg.length);
                        database.delete_command(msg.threadID,e.toLowerCase());
                        return bot.setMessageReaction(":like:",msg.messageID);
                    }
                    if(msg.body.indexOf("!! ") == 0){
                        if(isAdmin(msg.senderID)){
                            let e = msg.body.slice(3,msg.length);
                            let fpath = path.join(__dirname,"..","user","data","badword.json");
                            let badword = JSON.parse(fs.readFileSync(fpath,"utf-8"));
                            function addBlackList(e){
                                if(badword != undefined) {
                                    badword.push(e.toLowerCase());
                                    return fs.writeFileSync(fpath,JSON.stringify(badword),"utf-8");   
                                } else {
                                    fs.writeFileSync(fpath,JSON.stringify([e.toLowerCase()]),"utf-8");
                                }
                            }
                            if(e != ""){
                                if (e.indexOf("|") != -1) {
                                    let list = e.split("|");
                                    list.forEach(el => {
                                        addBlackList(el.trim());
                                    });
                                } else 
                                    addBlackList(e.toLowerCase());   
                                bot.setMessageReaction(":like:",msg.messageID);     
                            }
                        }
                        else 
                            bot.sendMessage("Bạn không đủ quyền để thực hiện lệnh này 😏👌",msg.threadID);    
                    }
                    /* ban user */
                    if(msg.body.indexOf("ban ") == 0){
                        let e = msg.body.slice(4,msg.body.length);
                        let fpath = path.join(__dirname,"..","user","data","banlist.json");
                        let banlist = JSON.parse(fs.readFileSync(fpath,"utf-8"));
                        if(isAdmin(msg.senderID)){
                            if (typeof banlist == "object"){
                                banlist.forEach(el => {
                                    if (el.thread == msg.threadID) 
                                        return el.users.push(msg.senderID);
                                });
                                banlist.push({thread: msg.threadID,users: [msg.senderID]});
                            }
                        }
                        else 
                            bot.sendMessage("Bạn không đủ quyền để thực hiện lệnh này 😏👌",msg.threadID);

                    }
                    /* Get information about a user */
                    if(msg.body.indexOf("userinfo") == 0){
                        bot.getUserInfo(msg.senderID,(err,res) => {
                            if(err) return console.log(err);
                            console.log(res);
                        });
                    }
                    /* Get a user's avatar */
                    if(msg.body.indexOf("avatar ") ==0){
                        
                    }
                    /* Music player */
                    if(msg.body.indexOf("music ") == 0){

                    }
                    /* Let me help you when you can't decide */
                    if(msg.body.indexOf("pick ") == 0){

                    }
                    if(msg.body.indexOf("pixiv ") == 0){
                        const pixiv = require("./pixivForEverything");
                        let fpath = path.join(__dirname,"src","pixiv");
                        if(msg.body.indexOf("pixiv -i ") == 0){
                            let id = (msg.body.slice(9,msg.length).indexOf(" ") != -1) ? msg.body.slice(9,msg.length).split(" ") : msg.body.slice(9,msg.length);
                            pixiv.download((typeof id == "object") ? id : [id],(filename) => {
                                bot.sendMessage({
                                    attachment : fs.createReadStream("./utils/src/pixiv/"+filename)
                                },msg.threadID);
                            });
                        }
                        if(msg.body.indexOf("pixiv -g ") ==0 ){
                            let id = null;
                            let word = msg.body.slice(9,msg.body.length);
                            if (word.indexOf(" ") != -1)
                                if (word.indexOf("-n ") != -1)
                                    id = word.slice(0,word.indexOf("-n ")).split(" ")
                                else
                                    id = word.split(" ")
                            else 
                                if (word.indexOf("-n ") != -1)
                                    id = word.slice(0,word.indexOf("-n "))
                                else    // code sida :v
                                    id = word;     
                            let index = (msg.body.indexOf("-n ") != -1 ) ? parseInt(msg.body.slice(msg.body.indexOf("-n ")+3,msg.body.length)*30) : 0;
                            console.log(id);
                            console.log(index); // quen nhap tai khoan vao file :v
                            pixiv.getUserWork(id,index,JSON.parse(fs.readFileSync("./utils/account.json","utf-8"))).then(res => {
                                pixiv.download(res, (filename) => {
                                    console.log(filename);
                                    bot.sendMessage({attachment: fs.createReadStream("./utils/src/pixiv/"+filename)},msg.threadID);
                                });
                            });
                        }
                        if(msg.body.indexOf("pixiv -m ") == 0){
                            let id = msg.body.slice(9,msg.body.length);
                            let fpath = "./utils/src/pixiv/manga/"+id;
                            if (!fs.existsSync(fpath))
                                fs.mkdirSync(fpath);
                            pixiv.downloadManga({id:id},fpath,(filename)=>{
                                bot.sendMessage({attachment:fs.createReadStream(fpath+"/"+filename)},msg.threadID); //@@
                            });
                        }
                        if(msg.body.indexOf("pixiv -m -l") == 0){
                            // thôi ngủ :) 
                        }
                    }
                    if(msg.attachments[0] !== undefined){
                        if(msg.attachments[0].type == "sticker");
                        database.last_msg(msg.senderID,msg.threadID)
                            .then(m => {
                                if (m.indexOf("set sticker ") == 0){
                                    set_command(m.slice(12,m.length).trim()+"->#sticker_"+msg.attachments[0].ID);
                                    bot.setMessageReaction(":like:",msg.messageID);
                                }
                            });
                    }
                    /* save message into database */
                    function addData() {
                        bot.getThreadInfo(msg.threadID,function(err,ret){
                            if(err) return console.error(err);
                            database._getdata(msg.senderID,msg.threadID).then(function(e){
                                let users = [];
                                ret.participantIDs.forEach(el=>{
                                    users.push({  
                                        "name":ret.nicknames[`${el}`], 
                                        "user-id":el
                                    });
                                });
                                let groups = []; let flag = false; let i = 0;
                                if (e.a != undefined) {
                                    JSON.parse(e.a.info)["group-invited"].forEach( uf =>{
                                        i++;
                                        if (uf["gr-id"] == msg.threadID) { flag = true;/* and */ }
                                    });
                                    if (!flag) { 
                                        groups = JSON.parse(e.a.info)["group-invited"];
                                        groups.push({
                                            "gr-id": msg.threadID,
                                            "nick-name": (ret.nicknames[`${msg.senderID}`] == undefined) ? "none" : ret.nicknames[`${msg.senderID}`], 
                                            "score": 1,
                                            "level": 0
                                        }); 
                                    } else groups = JSON.parse(e.a.info)["group-invited"];
                                }
                                bot.getUserInfo(msg.senderID, (err, res) => {
                                    if(err) return console.error(err);
                                    for (let i=0;i<groups.length;++i)
                                        if(groups[i]["gr-id"] == msg.threadID){
                                            groups[i].score++
                                            groups[i].level = parseInt(groups[i].score/30);
                                        }
                                    database._add({
                                        id: msg.senderID,
                                        name: res[`${msg.senderID}`].name,
                                        info: {
                                            "gender": (res[`${msg.senderID}`].gender == 2) ? "male":"female",
                                            "group-invited": groups, 
                                            "avt-url": "http://graph.facebook.com/"+ msg.senderID + "/picture?height=720&width=720",
                                            "profile-url": "https://www.facebook.com/" + res[`${msg.senderID}`].vanity
                                        },
                                    },{
                                        id:msg.threadID,
                                        name:(ret.isGroup) ? ret.threadName : res[`${msg.senderID}`].name,
                                        user:users
                                    });
                                });
                                
                            }).catch(log.writeError);
                        }); 
                    }
                    function set_command(m){
                        let ind = m.indexOf("->");
                        let right = m.slice(ind+2,m.length);
                        let left =  m.slice(0,ind);
                        if (left !== "" && right !== ""){
                            let e = [{"user": [msg.senderID]}];
                            if (right.indexOf("|") != -1){
                                let arr = right.split("|");
                                e = e.concat(arr);
                            } else 
                                e.push(right);
                            database.set_command({
                                id: msg.threadID,
                                type: "text",
                                c: left.trim().toLowerCase(),
                                e: e
                            }).catch(console.log);
                        }
                    }
                    function sendRandomImg(folderPath){
                        let fpath = path.join(__dirname,"..","user","data")+"/"+folderPath
                        fs.readdir(fpath,(err,files)=>{
                            let ran = Math.floor(Math.random() * parseInt(files.length)); 
                            return Promise.resolve({
                                attachment: fs.createReadStream(fpath+"/"+files[ran])
                            })
                                .then(a => bot.sendMessage(a, msg.threadID));  
                        });
                    }
                    function isAdmin(id){
                        let flag = false;
                        JSON.parse(fs.readFileSync(configPath,"utf-8")).config.adminID.forEach(el => {
                            if(el == id) flag = true;
                        });
                        return flag;
                    }
                    database.listen(msg.senderID,msg.threadID,msg.body,(msg.attachments != []) ? msg.attachments[0] : null);
                    /* check bad word */
                    let badword = await JSON.parse(fs.readFileSync(path.join(__dirname,"..","user","data","badword.json"),"utf-8"));
                    badword.forEach(e => {
                        if(e == msg.body.toLowerCase()) return bot.removeUserFromGroup(msg.senderID, msg.threadID);
                    });

                    database._getMessage(msg.threadID,msg.body.toLowerCase())
                        .then(async function(res){
                            if(res !== undefined){
                                let ran = await parseInt((Math.random() * (res.length -1)), 10) + 1;
                                let m = res[ran]; 
                                    if(m.indexOf("#sticker_") == 0)
                                        bot.sendMessage({sticker:m.slice(9,m.length)},msg.threadID);
                                    else 
                                        bot.sendMessage(m,msg.threadID);
                            }
                                else 
                                    addData();
                        }).catch(console.log);
                }
                if (msg.type == "event") {
                    if(msg.logMessageType == "log:unsubscribe")
                        bot.addUserToGroup(msg.author, msg.threadID)
                        else 
                    if (msg.logMessageType == "log:subscribe"){
                            msg.logMessageData.addedParticipants.forEach(el => {
                                if(el.userFbId == "100026956369417"){
                                        bot.sendMessage("Ari Bot connected.",msg.threadID);
                                        bot.changeNickname("Ari Bot",msg.threadID,100026956369417)
                                        bot.sendMessage({body:"Gõ help để xem danh sách các lệnh được hỗ trợ 😇",attachment:fs.createReadStream("./utils/src/welcome.gif")},msg.threadID);
                                }
                            });
                    }    
                }
                if (msg.type == "message"){
                    /* process an message */
                    proc(msg);
                    /* database._getdata(msg.senderID,msg.threadID).then(function(e){
                        if(e.a != undefined){
                            let groups = JSON.parse(e.a.info)["group-invited"];
                            let io = JSON.parse(e.a.info);
                            groups.forEach( uf =>{
                                if (uf["gr-id"] == msg.threadID) {
                                    for (let i=0;i<groups.length;++i)
                                        if(groups[i]["gr-id"] == msg.threadID){
                                            groups[i].score++
                                            groups[i].level = parseInt(groups[i].score/30);
                                        }
                                }
                                database._add({
                                    id: msg.senderID,
                                        name: e.a.name,
                                        info: {
                                            "gender": io.gender,
                                            "group-invited": groups, 
                                            "avt-url": io["avt-url"],
                                            "profile-url": io["profile-url"]
                                        },
                                },e.b);
                            });

                        }
                    });  */     
                }  
            });
    });
}
