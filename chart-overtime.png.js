const path = require('path');
const moment = require('moment-timezone');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');


const db = require('./db');

module.exports = async function(req, res) {
    try {
        const allData = await db.getAll();

        const timezone = "GMT"


        let yLabels = []
        let xLabels = []

        //push time stamps
        allData.forEach((log) => {
            const da = moment.utc(log.date);
            const date = moment(log.date).tz(timezone ? timezone : 'GMT').format('YYYY/MMM/DD/HH:mm');
            if (!xLabels.includes(date)) {
                xLabels.push(date);
                yLabels.push(0)
            }
        })

        //rick rolled amount to each ts
        allData.forEach((log) => {
            const date = moment(log.date).tz(timezone ? timezone : 'GMT').format('YYYY/MMM/DD/HH:mm');
            const index = xLabels.indexOf(date);
            yLabels[index]++;
        })

        // Change the width of the chart based on the number of lines in the log
        switch (true) {
            case yLabels.length <= 30:
                var width = 500
                break
            case yLabels.length <= 40:
                var width = 600
                break
            case yLabels.length <= 50:
                var width = 700
                break
            case yLabels.length <= 60:
                var width = 900
                break
            default:
                var width = 1000
                break
        }

        // Chart.js
        const chartJSNodeCanvas = new ChartJSNodeCanvas({
            width,
            height: 400,
            backgroundColour: 'rgb(47, 49, 54)'
        })
        const lineColour = { fill: '8, 174, 228', border: '39, 76, 113', colour: '39, 76, 113' }
        const textColour = { time: '253, 253, 253', state: '253, 253, 253', title: '253, 253, 253' }


        const configuration = {
            type: 'line',
            data: {
                labels: xLabels,
                datasets: [{
                    label: "people rickrolled",
                    data: yLabels,
                    fill: true,
                    color: 'rgb(' + lineColour.colour + ')',
                    backgroundColor: 'rgba(' + lineColour.fill + ', 0.2)',
                    borderColor: 'rgba(' + lineColour.border + ', 1)',
                    borderWidth: 2,
                    steppedLine: true
                }]
            },
            options: {
                elements: {
                    point: {
                        radius: 0
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: "people rickrolled over time",
                        color: 'rgb(' + textColour.title + ')'
                    },
                    legend: {
                        labels: {
                            color: 'rgb(' + textColour.title + ')',
                            font: {
                                size: 15
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "number of people rickrolled",
                            color: 'rgb(' + textColour.title + ')'
                        },
                        beginAtZero: true,
                        ticks: {
                            color: 'rgb(' + textColour.state + ')',
                            fontSize: 15,
                            stepSize: 1,
                            max: 1,
                            callback: function(value) {
                                return value
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: `Time - (${timezone ? timezone : 'GMT'})`,
                            color: 'rgb(' + textColour.title + ')'
                        },
                        ticks: {
                            color: 'rgb(' + textColour.time + ')',
                            fontSize: 13,
                            stepSize: 1
                        }
                    }
                }
            }
        }

        const image = await chartJSNodeCanvas.renderToBuffer(configuration)
        res.contentType('png').send(image)
    } catch (err) {
        console.log(err.stack)
        res.sendFile(path.join(`${__dirname}/../../dist/img/down.png`))
    }
}