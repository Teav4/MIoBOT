/* -- import module -- */
const fs =require("fs");
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/* configure database path */
const userPath = path.join(__dirname,"..","user","data","user.sqlite");
const groupPath = path.join(__dirname,"..","user","data","group.sqlite");
const chat_historyPath = path.join(__dirname,"..","user","data","chat-history.sqlite");

const user_db = new sqlite3.Database(userPath);

/*@param 
 * a.id : user id 
 * a.name : facebook user name
 * a.info : user info {JSON}, example: {"gender": "female", "age":14, "group-invited": [{"gr-id":"2280940368589017","nick-name": "tea", "score": 255, "level": 14} ], "avt-url":"https://scontent.fdad2-1.fna.fbcdn.net/v/t1.0-9/33395771_213719562744788_8610615005559128064_n.jpg?_nc_cat=0&oh=b3f73cc29c11a8f92e2c739fafd5e57a&oe=5BCDEC15","profile-url": "https://www.facebook.com/da.tra.1671"}
 * b.id : group id 
 * b.name : group nameGROUP
 * b.user : group user list {JSON}, example: [{"id":"100023202380649","name":"Phạm Lê Thảo Nguyên", "user-id":1},{"id":"100006360818148","name":"Nguyễn Lê Viết Anh", "user-id":2}]
 *    
 */ 
module.exports._add = function(a,b){
    user_db.serialize(function(){
        //user_db.run("CREATE TABLE IF NOT EXISTS `USER` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `user-id` INTEGER NOT NULL, `name` TEXT, `info` BLOB )");
        user_db.get("SELECT id FROM USER WHERE `user-id` = ?",a.id, function(err,e){
            if (err) console.log(err);
            if (e == undefined){
                user_db.run("INSERT INTO USER (`user-id`,name,info) VALUES (?,?,?)",[a.id,a.name,JSON.stringify(a.info)]);       
              } else {
                user_db.run("UPDATE USER SET name = ?, info = ? WHERE `user-id` = ?",[a.name,JSON.stringify(a.info),a.id]);               
              }   
        });
        //user_db.run("CREATE TABLE IF NOT EXISTS `GROUP` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `group-id` INTEGER, `name` TEXT, `user` TEXT NOT NULL )");
        user_db.get("SELECT id FROM `GROUP` WHERE `group-id` = ?",b.id, function(err,e){
            if (err) console.log(err);
            if (e == undefined){
                user_db.run("INSERT INTO `GROUP` (`group-id`,name,user) VALUES (?,?,?)",[b.id,b.name,JSON.stringify(b.user)]);
            } else {
                user_db.run("UPDATE `GROUP` SET name = ?,user = ? WHERE `group-id` = ?",[b.name,JSON.stringify(b.user),b.id]);
            }
        })
    });
}
module.exports._getdata = function(a,b){
    return new Promise((resolve,reject) => {
        user_db.serialize(function(){
            user_db.get("SELECT info FROM USER WHERE `user-id` = ?",a,function(err,e){
                if (err) reject(err) 
                else
                    user_db.get("SELECT user FROM `GROUP` WHERE `group-id` = ?",b,function(err,f){
                        if (err) reject(err)
                        else resolve({a:e,b:f});
                    });
            });
        });
    });
}  
/* @param
 * i.id : conversation id
 * i.type: command type
 * i.c : [string] command 
 * i.e : [array] & reply command. example: [{"user":100023202380649},"pong","not pong"]
 */
module.exports.set_command = function(i){
    return new Promise((resolve, reject) => {
        user_db.serialize(function(){
            user_db.get("SELECT dataset FROM CUSTOM WHERE conversation = ?",i.id,function(err,e){
                if (err) throw reject(err);
                if (e == undefined){
                    let r = {}; r[`${i.c}`] = i.e;
                    user_db.run("INSERT INTO CUSTOM (conversation,type,dataset) VALUES (?,?,?)",[i.id,i.type,JSON.stringify(r)]);
                } else {
                    let r = JSON.parse(e.dataset);
                    if (r[`${i.c}`] != undefined){
                        for(j=1;j<i.e.length;++j){
                            r[`${i.c}`].push(i.e[j]);
                        } 
                        let flag = false;
                        r[`${i.c}`][0].user.forEach(el => {
                            if(el == i.e[0].user[0]) flag = true;
                        });
                        if (!flag) r[`${i.c}`][0].user.push(i.e[0].user[0]);
                    } else
                        r[`${i.c}`] = i.e;
                    user_db.run("UPDATE CUSTOM SET dataset = ?,type = ? WHERE conversation =?",[JSON.stringify(r),i.type,i.id]);
                } 
            })
        });
    });
}
module.exports._getMessage = function(id,m){
    return new Promise((resolve,reject) => {
        user_db.serialize(function(){
            user_db.get("SELECT dataset FROM CUSTOM WHERE conversation = ?",id,function(err,res){
                if (err) throw reject(err)
                else 
                    if(res != undefined) 
                        resolve(JSON.parse(res.dataset)[`${m}`]);
            });
        });
    });
}
module.exports.delete_command = function(){

}


