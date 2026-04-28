let chart;

function initChart() {
    const ctx = document.getElementById("chart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Supply",
                    data: [],
                    borderColor: "#22c55e",
                    tension: 0.4
                },
                {
                    label: "Demand",
                    data: [],
                    borderColor: "#ef4444",
                    tension: 0.4
                }
            ]
        },
        options: {
            plugins: {
                legend: { labels: { color: "#ccc" } }
            },
            scales: {
                x: { ticks: { color: "#aaa" } },
                y: { ticks: { color: "#aaa" } }
            }
        }
    });
}

async function fetchData() {
    try {
        const res = await fetch("http://127.0.0.1:5000/simulate");
        const data = await res.json();

        let supply = data.supply;
        let demand = data.demand;
        let result = data.result;

        document.getElementById("supply").textContent = supply + " MW";
        document.getElementById("demand").textContent = demand + " MW";

        let statusEl = document.getElementById("status");
        statusEl.textContent = result.status;
        statusEl.className = "status " + result.status.toLowerCase();

        // Logs
        const log = document.getElementById("log");
        log.innerHTML = "";
        result.actions.forEach(action => {
            let li = document.createElement("li");
            li.textContent = action;
            log.appendChild(li);
        });

        // Carbon
        let carbon = Math.floor(Math.random() * 50) + 20;
        document.getElementById("carbon").textContent = carbon;
        document.getElementById("bar").style.width = carbon + "%";

        // Chart update
        if (chart.data.labels.length > 10) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }

        chart.data.labels.push("");
        chart.data.datasets[0].data.push(supply);
        chart.data.datasets[1].data.push(demand);
        chart.update();

    } catch (err) {
        console.error(err);
    }
}

initChart();
setInterval(fetchData, 3000);