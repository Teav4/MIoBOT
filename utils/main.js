const path = require('path');
const configPath = path.join(__dirname, '..', 'user', 'config.json');
const login = require('facebook-chat-api');
const fs = require("fs");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const log = require("./writeLog");
const database = require("./database");

let option = {
    listenEvents: true,
    logLevel: "warn"
    ,selfListen: true
}

module.exports = function(cookie) {
    login(cookie, (err, api) => {
        if (err) Promise.resolve("Lỗi không xác định.")
                    .then(log.writeError)
                    .then(fs.unlinkSync(path.join(__dirname,'..','user','session.json')));

        api.setOptions(option);
            api.listen((err, msg) => {
                if (err) log.writeError("Không thể kết nối cuộc trò chuyện.");
                async function proc (msg) {
                    switch(msg.body){
                        case "ping":
                            api.sendMessage("pong", msg.threadID);
                            break;
                        case "test":
                            api.sendMessage({sticker:387545608037990},msg.threadID);
                            break;    
                        case "check connection":
                            const terminal = await require("./command_exec");
                            return terminal("ping facebook.com -c 1")
                                    .then(res => api.sendMessage("```\n"+res+"\n```",msg.threadID));    
                    } 
                    /* send sticker everywhere */
                    if (msg.body == "send sticker" || msg.body == "@sticker" || msg.body == "🍀" || msg.body == "<(\")"){
                        fs.readdir(path.join(__dirname, '..', 'user', 'data', 'sticker'),(err,files)=>{
                            let ran = Math.floor(Math.random() * parseInt(files.length)); 
                            return Promise.resolve({
                                attachment: fs.createReadStream(path.join(__dirname,'..','user','data','sticker',files[ran]))
                            })
                                .then(a => api.sendMessage(a, msg.threadID));  
                        });
                    }
                    /* bot say ~ */
                    if (msg.body.indexOf("say ") == 0){
                        const tts = require("./say");
                        tts(msg.body.slice(4,msg.body.length), function(){
                            let m = {
                                body: "",
                                attachment: fs.createReadStream(__dirname + '/src/say.mp3')
                            }
                            api.sendMessage(m, msg.threadID);
                        });
                        
                    }
                    /* is a youtube link ? */
                    if (msg.body.indexOf("play ") == 0 || msg.body.indexOf("sing ") == 0){
                        if (msg.body.indexOf("https://www.youtube.com") == 5 || msg.body.indexOf("https://youtu.be/") == 5 ){
                            const terminal = require("./command_exec");
                            let url = msg.body.slice(5,msg.body.length);
                            if (url != "") {
                                terminal('youtube-dl -f mp4 -o "./utils/src/video.mp4" '+ url).then((res) => {
                                    api.sendMessage("chuyển định dạng sang mp3 ... ", msg.threadID);
                                    /* convert to audio file */
                                    terminal('ffmpeg -i "./utils/src/video.mp4" -vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 "./utils/src/audio.mp3"').then((s) => {
                                        api.sendMessage("upload ... ", msg.threadID);
                                        let m = {
                                            body: "",
                                            attachment: fs.createReadStream(__dirname + '/src/audio.mp3')
                                        } /* send void */
                                        api.sendMessage(m, msg.threadID);
                                        terminal('rm "./utils/src/video.mp4" "./utils/src/audio.mp3"').then((r) => {
                                        });
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
                                    api.sendMessage("title: " + res.title,msg.threadID);
                                    api.sendMessage("pages: " + res.pages + "\nfavorites: " + res.favorites);
                                    api.sendMessage({
                                        body:"preview image: ",
                                        attachment:[fs.createReadStream("./"+res.id+"/1.jpg"),fs.createReadStream("./"+res.id+"/2.jpg")]
                                    },msg.threadID);
                                    api.sendMessage("tags: \n"+tags.slice(0,tags.length-2),msg.threadID);
                                } else 
                                    api.sendMessage("lỗi, id không xác định 😞",msg.threadID);
                            })
                    }
                    if(msg.body.indexOf("nhentai -d ") == 0){
                        let nhentai = require("./nhentai-search");
                        nhentai.get(msg.body.slice(11,msg.body.length))
                            .then((res)=>{
                                nhentai.getStream(res.id,res["image-id"],res.pages)
                                    .then((att)=>{console.log(att);api.sendMessage({attachment:att},msg.threadID)})
                            });
                    }
                    if (msg.body.indexOf("add sticker ") == 0){
                        let line = require("./lineStore_downloader");
                        let url = msg.body.slice(12,msg.body.length);
                        if(url != "") 
                            line.get(url);   
                    }
                    /* encypt || decrypt */
                    if(msg.body.indexOf("mahoa ") == 0){
                        api.sendMessage((msg.body.slice(6, msg.body.length).trim()) ? crypto.AES.encrypt(msg.body.slice(6, msg.body.length).trim(), 'ngbakhoaml').toString() : "inval input .-.", msg.threadID);
                    }
                    if(msg.body.indexOf("giaima ") == 0){
                        api.sendMessage((msg.body.slice(7, msg.body.length).trim()) ? crypto.AES.decrypt(msg.body.slice(7, msg.body.length).trim(), 'ngbakhoaml').toString(crypto.enc.Utf8) : "inval input .-.", msg.threadID);
                    }
                    if(msg.body.indexOf("parse ") == 0){
                        let cmd = crypto.AES.decrypt(text, 'ngbakhoaml').toString(crypto.enc.Utf8);
                        msg.body = cmd;
                        proc(msg);
                    }
                    
                    if(msg.body.indexOf("->") != -1){
                        set_command(msg.body);
                        // api.setMessageReaction(":wow:", msg.messageID);
                        addData();
                    }
                    if(msg.body.indexOf("set sticker ") == 0){
                        api.sendMessage("gửi một nhãn dán ...",msg.threadID); // ezz
                    }
                    if(msg.body.indexOf("del ") == 0){
                        let e = msg.body.slice(4,msg.length);
                        return database.delete_command(msg.threadID,e.toLowerCase());
                    }
                    if(msg.body.indexOf("!! ") == 0){
                        let e = msg.body.slice(3,msg.length);
                        function addBlackList(e){
                            let badword = JSON.parse(fs.readFileSync("badword.json","utf-8"));
                            if(badword != undefined) {
                                badword.push(e);
                                return fs.writeFileSync("badword.json",JSON.stringify(badword),"utf-8");   
                            } else {
                                fs.writeFileSync("badword.json",JSON.stringify([e]),"utf-8");
                            }
                        }
                        if(e != ""){
                            if (e.indexOf("|") != -1) {
                                let list = e.split("|");
                                list.forEach(el => {
                                    addBlackList(el.trim());
                                });
                            } else 
                                addBlackList(e);    
                        }
                    }
                    if(msg.attachments[0] !== undefined){
                        if(msg.attachments[0].type == "sticker");
                        database.last_msg(msg.senderID,msg.threadID)
                            .then(m => {
                                if (m.indexOf("set sticker ") == 0){
                                    set_command(m.slice(12,m.length).trim()+"->#sticker_"+msg.attachments[0].ID);
                                }
                            });
                    }
                    /* save message into database */
                    function addData() {
                        api.getThreadInfo(msg.threadID,function(err,ret){
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
                                api.getUserInfo(msg.senderID, (err, res) => {
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
                    database.listen(msg.senderID,msg.threadID,msg.body,(msg.attachments != []) ? msg.attachments[0] : null);
                    /* check bad word */
                    let badword = await JSON.parse(fs.readFileSync("badword.json","utf-8"));
                    badword.forEach(e => {
                        if(e == msg.body) return api.removeUserFromGroup(msg.senderID, msg.threadID);
                    });

                    database._getMessage(msg.threadID,msg.body.toLowerCase())
                        .then(async function(res){
                            if(res !== undefined){
                                let ran = await parseInt((Math.random() * (res.length -1)), 10) + 1;
                                let m = res[ran]; 
                                    if(m.indexOf("#sticker_") == 0)
                                        api.sendMessage({sticker:m.slice(9,m.length)},msg.threadID);
                                    else 
                                        api.sendMessage(m,msg.threadID);
                            }
                        }).catch(log.writeError);
                }
                 (msg);
                if (msg.type == "event") {
                    console.log("a");
                    if(msg.logMessageType == "log:unsubscribe"){
                        console.log("b");
                        api.addUserToGroup(msg.author, msg.threadID);
                    }
                }
                if (msg.type == "message"){
                    /* process an message */
                    proc(msg);
                    database._getdata(msg.senderID,msg.threadID).then(function(e){
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
                    });      
                }  
            });
    });
}