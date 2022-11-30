const express = require('express');
const useragent = require('express-useragent');
const db = require('./db');

const geoip = require('geoip-lite');
const app = express();
app.use(express.json());
app.disable('x-powered-by');
app.use(useragent.express());
app.set('trust proxy', true);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/www'))

const port = process.env.PORT || 8080;





app.get('/', (req, res) => {
    rrAnalytics(req);
    res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

});
app.get('/stats', (req, res) => {
    res.sendFile(__dirname + "/www/index.html");
});


app.get('/chart/overtime.png', require('./chart-overtime.png.js'));
app.get('/chart/overtime', require('./chart-overtime.js'));

app.listen(port, () => {
    console.log("Ready!");
    console.log("app listening on " + port);
})




async function rrAnalytics(req) {
    let ref = req.query.ref;
    if (!ref) {
        ref = req.query.r;
    }
    const ipv4 = req.ip.split(':')[req.ip.split(':').length - 1];
    const ipv6 = req.ip.replace(ipv4);
    const geo = await geoip.lookup(ipv4);

    const data = {
        ref: ref,
        language: req.headers["accept-language"].split(';')[0].split(',')[0],
        country: geo ? geo.country : "unknown",
        region: geo ? geo.region : "unknown",
        browser: req.useragent.browser,
        browserVersion: req.useragent.version,
        os: req.useragent.os,
        platform: req.useragent.platform,
        date: Date.now()
    }

    db.add(data)
}