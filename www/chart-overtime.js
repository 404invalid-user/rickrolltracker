function makeChart(data) {


    let yLabels = []
    let xLabels = []
    const lineColour = { fill: '8, 174, 228', border: '39, 76, 113', colour: '39, 76, 113' }
    const textColour = { time: '253, 253, 253', state: '253, 253, 253', title: '253, 253, 253' }

    //push time stamps
    data.forEach((log) => {
        const da = moment.utc(log.date);
        const date = moment(log.date).format('YYYY / MMM / DD / HH:mm');
        if (!xLabels.includes(date)) {
            xLabels.push(date);
            yLabels.push(0)
        }
    })

    //rick rolled amount to each ts
    data.forEach((log) => {
        const date = moment(log.date).format('YYYY / MMM / DD / HH:mm');
        const index = xLabels.indexOf(date);
        yLabels[index]++;
    })

    const config = {
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
                steppedLine: true,
                cubicInterpolationMode: 'monotone',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
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
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: `Time - (YYYY / MMM / DD / HH:mm)`,
                        color: 'rgb(' + textColour.title + ')'
                    },
                    ticks: {
                        color: 'rgb(' + textColour.time + ')',
                        fontSize: 13,
                        stepSize: 1
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "number of people rickrolled",
                        color: 'rgb(' + textColour.title + ')'
                    },
                    display: true,
                    ticks: {
                        color: 'rgb(' + textColour.state + ')',
                        fontSize: 15,
                        stepSize: 1,
                        max: 1,
                        callback: function(value) {
                            return value
                        }
                    }
                }
            }
        },
    };




    const pingChart = new Chart(document.getElementById('chatovertime'), config);

}



async function run() {
    let res;
    try {
        res = await axios.get('/chart/overtime');
    } catch (err) {
        console.log(err.stack || err);
    }

    makeChart(res.data);

}

run()