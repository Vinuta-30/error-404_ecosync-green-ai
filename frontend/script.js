function addLog(msg) {
    const log = document.getElementById("log");
    const li = document.createElement("li");
    li.textContent = msg;
    log.prepend(li);

    if (log.children.length > 5) {
        log.removeChild(log.lastChild);
    }
}

setInterval(() => {

    let supply = Math.floor(Math.random() * 50) + 80;
    let demand = Math.floor(Math.random() * 60) + 90;
    let carbon = Math.floor(Math.random() * 60) + 20;

    document.getElementById("supply").textContent = supply + " MW";
    document.getElementById("demand").textContent = demand + " MW";
    document.getElementById("carbon").textContent = carbon;
    document.getElementById("bar").style.width = carbon + "%";

    let statusEl = document.getElementById("status");

    if (demand > supply) {
        statusEl.textContent = "CRITICAL";
        statusEl.className = "status critical";
        addLog("⚠ High load — EV charging paused");
    } else if (demand > supply - 10) {
        statusEl.textContent = "WARNING";
        statusEl.className = "status warning";
        addLog("⚠ Adjusting grid...");
    } else {
        statusEl.textContent = "STABLE";
        statusEl.className = "status stable";
        addLog("✅ Stable operation");
    }

}, 3000);