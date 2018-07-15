/*# import module*/
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const login = require('./node_modules/index');

var sys = require('sys')
var exec = require('child_process').exec;
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('History.sqlite');
var crypto = require('crypto-js');

module.exports = function(userCookie) {
    login(userCookie, (err, api) => {
        var setOptions = function(evt, logs) {
            logl = logs || 'warn'
            event = evt || false
            option = {
                listenEvents: evt,
                logLevel: logl,
                selfListen: true
            }
            api.setOptions(option);
        }

        setOptions(true);

        function viewlog(e) {
            if (e.type != 'read_receipt' && e.type != 'typ')
                console.log(`-------------------------------------------\n|${e.type} | ${e.senderID}\n>  ${e.body}`);
        }

        function downloadLineImg(start, end) {
            if (start > end) return true;

            var url = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${start}/ANDROID/sticker.png;compress=true`

            request({
                    uri: url
                })
                .pipe(fs.createWriteStream('./line_src/' + start + '.png'))
                .on('close', function() {});
            downloadLineImg(start + 1, end);
        }

        function sendAudioWithText(text, type, threadID) {
            if (text.length > 1200) return api.sendMessage('đm gửi chi lắm thế :)', threadID);
            if (type == 'en') type = 'en-US'
            if (type == 'm') type = 'vi'
            var url = `https://www.bing.com/tspeak?&format=audio/mp3&language=${type}&IG=5CD131BD1E75424EBDB9FE297250F65A&IID=translator.5034.2&text=${encodeURI(text)}`
            request({
                    uri: url
                })
                .pipe(fs.createWriteStream('audio.mp3'))
                .on('close', function() {
                    var msg = {
                        body: "",
                        attachment: fs.createReadStream(__dirname + '/audio.mp3')
                    }
                    api.sendMessage(msg, threadID);
                });
        }

        function googleTTS(text, threadID) {
            var url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`
            request({
                    uri: url
                })
                .pipe(fs.createWriteStream('audio.mp3'))
                .on('close', function() {
                    var msg = {
                        body: "",
                        attachment: fs.createReadStream(__dirname + '/audio.mp3')
                    }
                    api.sendMessage(msg, threadID);
                });
        }


        function imageOrginalSearch(uri, threadID) {
            var url = 'https://iqdb.org/?url=' + encodeURIComponent(uri)
            request(url, (err, response, body) => {
                if (err) return api.sendMessage('lỗi .-.', threadID);
                $ = cheerio.load(body);
                var d = $(body).find('td .image');
                console.log(d); // Khu vực đang xây dựng ..
            });
        }

        function encrypt (text) {
            return (text) ? crypto.AES.encrypt(text, 'ngbakhoaml').toString() : "inval input .-.";
        }
        
        function decrypt (text) {
            return (text) ? crypto.AES.decrypt(text, 'ngbakhoaml').toString(crypto.enc.Utf8) : "inval input .-.";
        }

        function SaveHistory(message) {
            try {
                var sql = `CREATE TABLE IF NOT EXISTS "${message.threadID}" (
                        ID	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        SenderID	INT DEFAULT NULL,
                        Message	TEXT DEFAULT NULL,
                        Attachments	TEXT DEFAULT NULL,
                        TIME   DATETIME NOT NULL
                        );`
                db.run(sql, function() {
                    var Attach = null
                    if (message.attachments != [])
                        Attach = JSON.stringify(message.attachments[0]);

                    db.run(`INSERT INTO "${message.threadID}" (SenderID, Message, TIME, Attachments) VALUES (?,?,date('now'),?)`, [message.senderID, message.body, Attach]);
                });
            } catch (e) {
                console.log('lỗi');
                SaveHistory(message);
            }

        }

        function DB(type, threadID, Q, R) {
            var DB = require('./insertDB');
            if (Q != undefined) {
                if (type == 'SET')
                    DB.GET(Q, (row) => {
                        if (row === undefined)
                            if (R != undefined)
                                return DB.SET(Q, R);
                        return DB.UPDATE(Q, R);
                    });

                if (type == 'GET') {
                    DB.GET(Q, (row) => {
                        if (row != undefined)
                            api.sendMessage(row.R, threadID);
                    })
                }

                if (type == 'DEL') {
                    DB.DEL(Q);
                }
            }

        }

        function stk(url, threadID) {
            request(url, (err, response, body) => {
                if (!err) {
                    $ = cheerio.load(body);
                    var ds = $(body).find('span.mdCMN09Image');
                    var str = ds[0].attribs.style
                    var id = parseInt(str.slice(str.indexOf('/sticker/') + 9, str.length - 36))
                    downloadLineImg(id, id + ds.length - 1, threadID)
                    api.sendMessage(`đã tải ${ds.length} file @@`, threadID);
                }

            });
        }

        function sendImage(threadID) {
            var ran = Math.floor(Math.random() * 119) + 1;
            var msg = {
                body: "",
                attachment: fs.createReadStream(__dirname + '/mhr/' + ran + '.jpg')
            }
            api.sendMessage(msg, threadID);
            return true; 
        }

        function command_exec(command, callback) {
            dir = exec(command, function(err, stdout, stderr) {
                if (err) return console.log('lỗi');
                callback(stdout);
            });

            dir.on('exit', function(code) {
                // ...
            });
        }

        function sendAudioInYoutube(url, threadID) {
            command_exec('youtube-dl -f mp4 -o "./src/video.mp4" '+ url , (res) => {
                api.sendMessage("chuyển định dạng sang mp3 ... ", threadID);
                command_exec('ffmpeg -i "./src/video.mp4" -vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 "./src/audio.mp3"', (s) => {
                    api.sendMessage("upload ... ", threadID);
                    var msg = {
                        body: "",
                        attachment: fs.createReadStream(__dirname + '/src/audio.mp3')
                    }
                    api.sendMessage(msg, threadID);
                    command_exec('rm "./src/video.mp4" "./src/audio.mp3"', (r) => {
                    });
                });
            });
        }

        api.listen((err, message) => {
            if (err) return console.log('lỗi, không thể kết nối đến sever');

            

            function proc(message) {
                if (message.threadID == '2280940368589017' && message.body == '😍' || message.body == '<(")' || message.body == '@sticker' || message.body == '🍀')
                sendImage(message.threadID);

                if (message.type == 'message') {
                    SaveHistory(message);

                    if (message.body.indexOf('|') != -1) {
                        msg = message.body.toLowerCase();
                        var str = msg.split('|');
                        DB('SET', message.threadID, str[0].trim(), str[1].trim());
                        api.setMessageReaction(":like:", message.messageID);
                    }

                    if (message.body.indexOf('del ') == 0) {
                        msg = message.body.toLowerCase();
                        DB('DEL', message.threadID, msg.slice(4, msg.length));
                        api.setMessageReaction(":like:", message.messageID);
                    }

                    if (message.body.indexOf('say ') == 0) {
                        if (message.body.indexOf("say https://www.youtube.com") == 0){
                            //api.sendMessage("bắt đầu download ...");
                            //sendAudioInYoutube(message.body.slice(4, message.length), message.threadID);
                            return null;
                        } else {
                        
                        var lcode = ['_m', 'vi', 'ja', 'en']
                        var flag = false
                        for (var i = 0; i < lcode.length; i++)
                            if (message.body.indexOf(lcode[i]) == 4) {
                                sendAudioWithText(message.body.slice(7, message.length), lcode[i], message.threadID);
                                flag = true
                                break;
                            }

                        if (!flag) {
                            var text = message.body.slice(4, message.length);
                            googleTTS(text, message.threadID);
                            //sendAudioWithText(text,'vi', message.threadID);
                        }
                        }
                    }

                    if (message.body.indexOf("mahoa ") == 0) {
                        api.sendMessage(encrypt(message.body.slice(6, message.body.length).trim()), message.threadID);
                    }

                    if (message.body.indexOf("giaima ") == 0) {
                        api.sendMessage(decrypt(message.body.slice(7, message.body.length).trim()), message.threadID);
                    }

                    if (message.body.indexOf('#!bash ') == 0) {
                        if (message.senderID != '100023202380649')
                            api.sendMessage('bạn không đủ quyền để thực hiện lệnh này')
                        else {
                            var command = message.body.slice(7, message.body.length);
                            command_exec(command, (res) => {
                                api.sendMessage('```\n' + res + '\n```', threadID);
                            });
                        }
                    }

                    if (message.body.indexOf("parse ") == 0) {
                        var r = decrypt(message.body.slice(6, message.body.length).trim());
                        message.body = r;
                        proc(message);
                    }
                }
            
            }
            /* END - Function*/
            proc(message);
            DB('GET', message.threadID.toString(), message.body);
            // console.log(message);

            viewlog(message);
        });

    });
}
