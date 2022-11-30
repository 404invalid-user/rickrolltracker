let servers = [{ ws: new WebSocket('wss://US-MI1.SCHOST.US:25577'), colour: 'rgb(122,100,228)', pings: [], name: 'Michigan, USA', errd: false }]

function average(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; };

function serverLocal(url, lowercase) {
    if (lowercase) return url.toLowerCase().replace('ws://', '').replace('wss://', '').split('.')[0];
    return url.replace('ws://', '').replace('wss://', '').split('.')[0];
};

let datasets = [];
for (const server of servers) {
    datasets.push({ label: server.name, color: '#FFFFFF', backgroundColor: server.colour, borderColor: server.colour, data: server.pings, });
    const HTMLserverBox = document.querySelector('.servers');
    HTMLserverBox.innerHTML += `<div class="greys server">
    <div class="cent-flx"><div class="sch-srv-dot" style="background-color:${server.colour};"></div><p>${server.name}</p></div>
    <div class="srv-pings">
        <div><a class="sch-srv-subtitle">Mertic</a> <a class="sch-srv-right sch-srv-subtitle">Ping</a></div>
        <div>
            <a class="sch-srv-left">Maximum</a> <a class="sch-srv-right" id="${server.name}-max"></a>
        </div>
        <div>
            <a class="sch-srv-left">Avarage</a> <a class="sch-srv-right" id="${server.name}-avarage"></a>
        </div>
        <div>
            <a class="sch-srv-left">Minimum</a> <a class="sch-srv-right" id="${server.name}-min"></a>
        </div>
    </div>
</div>`;
};

function offline(name) {
    document.getElementById(name + '-max').innerHTML = '<span style="color:#ff1c1c;">offline</span>';
    document.getElementById(name + '-avarage').innerHTML = '<span style="color:#ff1c1c;">offline</span>';
    document.getElementById(name + '-min').innerHTML = '<span style="color:#ff1c1c;">offline</span>';
}
servers.forEach(server => {
    server.ws.addEventListener('error', () => {
        server.errd = true;
        offline(server.name);
    })
});
const pingChart = new Chart(document.getElementById('pingChart'), {
    type: 'line',
    data: {
        labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        datasets: datasets
    },
    plugins: [],
    options: {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#FFFFFF",
                    font: {
                        size: 15
                    }
                },
            },
        },
        scales: {
            x: {
                gridLines: {
                    zeroLineColor: 'transparent'
                },
                grid: {
                    display: false
                },
                ticks: {
                    display: false
                },
                display: false,
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    fontSize: 15,
                    color: "#FFFFFF",
                    callback: function(value) {
                        return value + 'ms';
                    },
                },
            }
        },
    },
});

function updateStats(server) {
    const maxPing = Math.max(...server.pings);
    const avaragePing = average(server.pings).toFixed(3);
    const minPing = Math.min(...server.pings);
    const ok = 400;
    const bad = 500;
    let maxPingColour = '#00ff1e';
    let avaragePingColor = '#00ff1e';
    let minPingColor = '#00ff1e';
    if (maxPing >= bad) {
        maxPingColour = 'red';
    } else if (maxPing >= ok) {
        maxPingColour = 'orange';
    };
    if (avaragePing >= bad) {
        avaragePingColor = 'red';
    } else if (avaragePing >= ok) {
        avaragePingColor = 'orange';
    };
    if (minPing >= bad) {
        minPingColor = 'red';
    } else if (minPing >= ok) {
        minPingColor = 'orange';
    };
    document.getElementById(server.name + '-max').innerHTML = `<span style="color:${maxPingColour};">${maxPing}ms</span>`;
    document.getElementById(server.name + '-avarage').innerHTML = `<span style="color:${avaragePingColor};">${avaragePing}ms</span>`;
    document.getElementById(server.name + '-min').innerHTML = `<span style="color:${minPingColor};">${minPing}ms</span>`;
}
async function isConnected(server) {
    return new Promise((resolve, reject) => {
        if (!server.ws) return reject();
        if (server.ws.readyState === 1) {
            return resolve();
        } else if (server.ws.readyState === 0) {
            server.ws.addEventListener('open', () => resolve());
        }
    });
}
async function pingServer(server) {
    await isConnected(server).catch(er => offline(server));
    let sendPingDate = Date.now();
    server.ws.send('ping-' + sendPingDate.toString());
    await new Promise((resolve, reject) => {
        let eventListener = (event) => {
            resolve(event.data);
            server.ws.removeEventListener('message', eventListener);
        }
        server.ws.addEventListener('message', eventListener);
    });
    return Date.now() - sendPingDate;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run() {
    for await (const server of servers) {
        for (let x = 0; x < 25; x++) {
            if (server.errd) { offline(server.name); continue; }
            const pingResult = await pingServer(server);
            if (!pingResult) return console.log("no ping");
            server.pings.push(pingResult / 2);
            pingChart.update();
            updateStats(server);
            await wait(Math.max(400 - pingResult));
        }
    };
};
run()