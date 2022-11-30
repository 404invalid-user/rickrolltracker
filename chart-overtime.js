const db = require('./db');

module.exports = async function(req, res) {
    const allData = await db.getAll();
    const resdata = [];
    for (const dat of allData) {
        resdata.push({ date: dat.date });
    }
    res.json(resdata);
}