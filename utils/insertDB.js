const fs =require("fs");
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function conversation_path (isGroup,threadID) {
    const _path = (isGroup) ? path.join(__dirname,'..','user','data','conversations','groups',threadID+'.db') : path.join(__dirname,'..','user','data','conversations','users',threadID+'.db');

    if (!fs.existsSync(_path)) 
        fs.writeFileSync(_path,'');
    console.log(_path);    
    return _path;    
}

module.exports.insert = function (msg,_path) {
    const data = new sqlite3.Database(_path);
    data.serialize( function() {
        /* save message history */
        data.run("CREATE TABLE IF NOT EXISTS THREAD ( ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, SENDER_ID INT DEFAULT NULL, MESSAGE TEXT DEFAULT NULL, ATTACHMENTS TEXT DEFAULT NULL, TIME DATETIME NOT NULL);");
        const attachment = (msg.attachments == [] || msg.attachments == undefined) ? null : JSON.stringify(msg.attachments[0]);
        data.run("INSERT INTO THREAD (SENDER_ID,MESSAGE,TIME,ATTACHMENTS) VALUES (?,?,date('now'),?)", [msg.senderID,msg.body,attachment]);

        /* score */
        data.run("CREATE TABLE IF NOT EXISTS SCORES (ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,USER_ID VARCHAR(20),SCORE INT DEFAULT 0);");
              data.get("SELECT SCORE FROM SCORES WHERE USER_ID = ?",msg.senderID, (err,row)=>{
                  if (err) console.log(err);
                  if (row == undefined) {
                    let score = 1;
                    data.run("INSERT INTO SCORES (USER_ID,SCORE) VALUES (?,?)",[msg.senderID,score]);  
                  } else {
                    let score = ++row.SCORE;
                    data.run("UPDATE SCORES SET SCORE = ? WHERE USER_ID = ?",[score,msg.senderID]);               
                  }   
              });
    });    
}
module.exports.set = function(msg) {
    const _path = (msg.isGroup) ? path.join(__dirname,'..','user','data','conversations','groups',msg.threadID+'.db') : path.join(__dirname,'..','user','data','conversations','users',msg.threadID+'.db');

    if (!fs.existsSync(_path)) 
        fs.writeFileSync(_path,'');
    const s = msg.toLowerCase().split("->");
    const [q,r] = [s[1],s[2]];
    const data = new sqlite3.Database(_path);
    data.serialize( function() {
        data.run("CREATE TABLE IF NOT EXISTS RESP ID INTEGER PRIMARY KEY AUTOINCREMENT,USER_ID VARCHAR(20),Q VARCHAR(500),R VARCHAR(500),TIME VARCHAR(10));");
        data.get("SELECT R FROM RESP WHERE Q = ?",q, (err,row)=>{
            if (err) console.log(err);
            if (row.R == undefined) 
                data.run("INSERT INTO RESP (USER_ID,Q,R,TIME) VALUES (?,?,?,date('now'))",[msg.senderID,q,r])
            else 
                data.run("UPDATE RESP SET R = ?, USER_ID = ? WHERE Q = ?",[r,msg.senderID,q]);
        });
    });
}