const sys = require('sys')
const exec = require('child_process').exec;


module.exports = function(command) {
    return new Promise((resolve, reject) => {
        dir = exec(command, function(err, stdout, stderr) {
            if (err) return reject(err);
            resolve(stdout);
        });
        dir.on('exit', function(code) {
            // relax 
        });
    });
}
