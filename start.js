const fs = require("fs");
const log = require("./utils/writeLog");

function script(data) {

    if (fs.existsSync('./user/session.json')) {
        const MIo = require("./utils/main.js");
        let cookie = { appState: JSON.parse(fs.readFileSync("./user/session.json", "utf8")) }
            log.comp("Starting ... ");
            try {
                MIo(cookie);
            } catch(e) {
                log.writeError("Lỗi không xác định");
                log.warning("Restarting ... ");
                MIo(cookie);
            }

    } else {
        log.warning("Đang tạo file cookies ... ");
            const login = require('facebook-chat-api');
            login({email: data.user[0].email, password: data.user[0].password}, (err, bot) => {
                if(err) return console.error(err);
                fs.writeFileSync('./user/session.json', JSON.stringify(bot.getAppState()));
                script(data);
            });
    }
}

let data = JSON.parse(fs.readFileSync("./user/config.json"));
if (data.user[0].email == "FACEBOOK_USERNAME_OR_EMAIL" || data.user[0].password == "YOUR_PASSWORD")
    log.writeError("Lỗi, file /user/config.json chưa định dạng")
else 
    script(data);
