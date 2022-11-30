const fs = require('fs');
const filePath = __dirname + "/the-rickrolled.json";
let file = JSON.parse(fs.readFileSync(filePath, 'utf8'));

module.exports.add = async function(data) {
    file.push(data);
    fs.writeFileSync(filePath, JSON.stringify(file, null, 2));
}


module.exports.getAll = function() {
    return file;
}