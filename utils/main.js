const path = require('path');
const configPath = path.join(__dirname, '..', 'user', 'config.json');
const login = require('facebook-chat-api');
const fs = require("fs");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const log = require("./writeLog");
var database = require("./insertDB.js");

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
                            return api.sendMessage("pong", msg.threadID);
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
                                .then(a => api.sendMessage(a, msg.threadID))
                                .catch(log.writeError("Send sticker error"));        
                    }
                    /* save message into databse */
                    let _path = (msg.isGroup && msg.isGroup != undefined) ? path.join(__dirname,'..','user','data','conversations','groups',msg.threadID+'.db') : path.join(__dirname,'..','user','data','conversations','users',msg.threadID+'.db');
                    try {database.insert(msg,_path) } catch(e) {proc(msg,_path)}
                    
                }
                if (msg.type == "message"){
                    /* process an message */
                    proc(msg);
                }
                console.log(msg);    
            });
    });
}