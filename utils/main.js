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
    ,selfListen: false
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
                            return api.sendMessage("pong", msg.threadID);
                        case "test":
                            console.log(msg);
                            
                            break;
                        case "check connection":
                            const terminal = await require("./command_exec");
                            return terminal("ping facebook.com -c 1")
                                    .then(res => api.sendMessage("```\n"+res+"\n```",msg.threadID));    
                        case "send sticker", "@sticker":
                            let count = await fs.readFileSync(path.join(__dirname, '..', 'user', 'data', 'sticker','stickerNumber'), 'utf-8');
                            let random = await Math.floor(Math.random() * parseInt(count)); 
                            return Promise.resolve({
                                attachment: fs.createReadStream(path.join(__dirname,'..','user','data','sticker',random+'.png'))
                            })
                                .then(a => api.sendMessage(a, msg.threadID));      
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
                    /* encypt || decrypt */
                    if(msg.body.indexOf("mahoa ") == 0){

                    }
                    if(msg.body.indexOf("giaima ") == 0){

                    }
                    
                    if(msg.body.indexOf("->") != -1){
                        let ind = msg.body.indexOf("->");
                        let right = msg.body.slice(msg.body.indexOf("->")+2,msg.body.length);
                        let left =  msg.body.slice(0,msg.body.indexOf("->"));
                        if (left !== "" && right !== ""){
                            let e = [{"user": [msg.senderID]}];
                            if (right.indexOf("|") != -1){
                                let arr = right.split("|");
                                e = e.concat(arr);
                                console.log(e);
                            } else 
                                e.push(right);
                            database.set_command({
                                id: msg.threadID,
                                type: "text",
                                c: left.trim().toLowerCase(),
                                e: e
                            }).catch(console.log);
                        }
                        // api.setMessageReaction(":wow:", msg.messageID);
                    }
                    /* save message into database */
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
                    database._getMessage(msg.threadID,msg.body.toLowerCase())
                        .then(async function(res){
                            if(res !== undefined){
                                let ran = await parseInt((Math.random() * (res.length -1)), 10) + 1;
                                api.sendMessage(res[ran],msg.threadID);
                            }
                            
                        }).catch(log.writeError);
                }
                if (msg.type == "message"){
                    /* process an message */
                    proc(msg);                   
                }  
            });
    });
}