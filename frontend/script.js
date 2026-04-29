let chart;
const labels = [];
const demandData = [];
const supplyData = [];
const previousValues = { supply: null, demand: null, carbon: null, status: null };

const REFRESH_MS = 3000;
const MAX_POINTS = 10;
let firstLoad = true;
let stressUntil = 0;
let stressLevel = 0;
let baseSupply = 118;
let baseDemand = 132;
const DEMO_DATA = { supply: 120, demand: 140, result: { status: "critical" }, carbon: 32 };
const aiLogs = [];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function animateNumber(element, target, suffix = "", decimals = 0, duration = 700) {
  if (!element) return;
  const previous = Number(element.dataset.value || 0);
  const start = Number.isFinite(previous) ? previous : 0;
  const end = Number(target);
  if (!Number.isFinite(end)) {
    element.textContent = `${target}${suffix}`;
    return;
  }

  const startAt = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;
    element.textContent = `${current.toFixed(decimals)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
    else element.dataset.value = `${end}`;
  };
  requestAnimationFrame(step);
}

function getStatusClass(statusValue) {
  const normalized = String(statusValue || "").toLowerCase();
  if (normalized === "stable") return "stable";
  if (normalized === "critical") return "critical";
  if (normalized === "warning") return "warning";
  return "neutral";
}

function calculateStatus(demand, supply) {
  if (demand > supply) return "critical";
  if (Math.abs(demand - supply) <= 8) return "warning";
  return "stable";
}

function ensureAIFeedPanel() {
  if (document.getElementById("aiFeed")) return;
  const insightCard = document.getElementById("insightCard");
  if (!insightCard) return;

  const panel = document.createElement("div");
  panel.id = "aiFeedPanel";
  panel.className = "ai-feed-panel";

  const title = document.createElement("div");
  title.className = "ai-feed-title";
  title.textContent = "AI Decision Feed";

  const feed = document.createElement("pre");
  feed.id = "aiFeed";
  feed.className = "ai-feed";

  panel.appendChild(title);
  panel.appendChild(feed);
  insightCard.appendChild(panel);
}

function pushAIFeedLog(message) {
  ensureAIFeedPanel();
  const feed = document.getElementById("aiFeed");
  if (!feed) return;
  const stamp = new Date().toLocaleTimeString();
  aiLogs.push(`[${stamp}] ${message}`);
  if (aiLogs.length > 5) aiLogs.shift();
  feed.textContent = aiLogs.join("\n");
  feed.scrollTop = feed.scrollHeight;
}

function updateTrend(elementId, current, previous, invert = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (previous === null || previous === undefined) {
    el.textContent = "No previous data";
    el.className = "trend neutral";
    return;
  }
  if (current === previous) {
    el.textContent = "No change";
    el.className = "trend neutral";
    return;
  }
  const increased = current > previous;
  const trendUp = invert ? !increased : increased;
  const diff = Math.abs(current - previous).toFixed(0);
  el.textContent = `${trendUp ? "↑" : "↓"} ${diff} vs last update`;
  el.className = `trend ${trendUp ? "up" : "down"}`;
}

function normalizeData(raw) {
  const hasRaw = raw && Number.isFinite(Number(raw.supply)) && Number.isFinite(Number(raw.demand));
  const now = Date.now() / 1000;

  if (hasRaw) {
    baseSupply = baseSupply * 0.7 + Number(raw.supply) * 0.3;
    baseDemand = baseDemand * 0.7 + Number(raw.demand) * 0.3;
  } else {
    // Keep simulation base in realistic operating ranges.
    baseSupply = clamp(baseSupply + Math.sin(now / 11) * 0.35, 110, 130);
    baseDemand = clamp(baseDemand + Math.sin(now / 9) * 0.45, 120, 150);
  }

  const supplyWave = Math.sin(now / 4) * 8;
  const demandWave = Math.sin(now / 2) * 15;
  const supplyNoise = Math.random() * 6 - 3;
  const demandNoise = Math.random() * 10 - 5;

  const stressActive = Date.now() < stressUntil;
  if (stressActive) {
    stressLevel = Math.max(stressLevel, 50);
    stressLevel = clamp(stressLevel + Math.sin(now * 4) * 1.8, 45, 62);
  } else if (stressLevel > 0) {
    stressLevel = Math.max(0, stressLevel - 7.5);
  }

  const supply = clamp(Math.round((hasRaw ? baseSupply : DEMO_DATA.supply) + supplyWave + supplyNoise), 90, 140);
  const demand = clamp(Math.round((hasRaw ? baseDemand : DEMO_DATA.demand) + demandWave + demandNoise + stressLevel), 100, 170);
  const status = stressActive ? "critical" : calculateStatus(demand, supply);
  const carbon = Math.max(0, Math.round((demand - supply) * 0.5));

  return {
    supply,
    demand,
    carbon,
    result: { status },
    insight: `CO2 Impact: ${carbon} kg saved`
  };
}

function removeLoadingState() {
  document.querySelectorAll(".loading").forEach((el) => {
    el.classList.remove("loading");
    el.classList.add("loaded");
  });
}

function refreshFeedback() {
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.remove("updated");
    void card.offsetWidth;
    card.classList.add("updated");
  });

  const toast = document.getElementById("toast");
  if (toast) {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1100);
  }
}

function updateLastUpdated() {
  const el = document.getElementById("lastUpdated");
  if (el) el.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
}

function updateUI(data) {
  const supplyEl = document.getElementById("supply");
  const demandEl = document.getElementById("demand");
  const carbonEl = document.getElementById("carbon");
  const statusEl = document.getElementById("status");
  const barEl = document.getElementById("bar");
  const insightEl = document.getElementById("insight");
  const liveStatusEl = document.getElementById("liveStatus");

  const supply = Number(data?.supply ?? DEMO_DATA.supply);
  const demand = Number(data?.demand ?? DEMO_DATA.demand);
  const statusValue = data?.result?.status || data?.status || "stable";
  const carbon = Math.max(0, Number(data?.carbon ?? 0));

  animateNumber(supplyEl, supply, " MW", 0);
  animateNumber(demandEl, demand, " MW", 0);
  animateNumber(carbonEl, carbon, " kg saved", 0);

  if (statusEl) {
    const cls = getStatusClass(statusValue);
    const dot = cls === "critical" ? "🔴" : cls === "warning" ? "🟠" : "🟢";
    statusEl.textContent = `${dot} ${statusValue}`;
    statusEl.className = `status ${cls}`;
  }
  if (liveStatusEl) {
    const cls = getStatusClass(statusValue);
    liveStatusEl.style.boxShadow = cls === "critical" ? "0 0 16px rgba(239,68,68,0.45)" : "0 0 16px rgba(34,197,94,0.28)";
  }
  if (insightEl) insightEl.textContent = data?.insight || `CO2 Impact: ${carbon} kg saved`;
  if (barEl) barEl.style.width = `${clamp(Math.round((carbon / 40) * 100), 0, 100)}%`;

  updateTrend("supplyTrend", supply, previousValues.supply);
  updateTrend("demandTrend", demand, previousValues.demand, true);
  updateTrend("carbonTrend", carbon, previousValues.carbon, true);
  updateTrend("statusTrend", Number(statusValue === "critical"), previousValues.status);

  previousValues.supply = supply;
  previousValues.demand = demand;
  previousValues.carbon = carbon;
  previousValues.status = Number(statusValue === "critical");

  if (statusValue === "critical") {
    pushAIFeedLog("Demand spike detected. Rebalancing supply mix.");
  } else if (statusValue === "warning") {
    pushAIFeedLog("Analyzing load drift. Optimizing dispatch.");
  } else {
    pushAIFeedLog("Grid stabilized. Maintaining efficient baseline.");
  }
}

function updateChart(data) {
  if (!chart) return;
  try {
    labels.push(new Date().toLocaleTimeString());
    demandData.push(Number(data?.demand ?? 0));
    supplyData.push(Number(data?.supply ?? 0));
    if (labels.length > MAX_POINTS) {
      labels.shift();
      demandData.shift();
      supplyData.shift();
    }
    chart.data.labels = labels;
    chart.data.datasets[0].data = demandData;
    chart.data.datasets[1].data = supplyData;
    chart.update();
  } catch (error) {
    console.error("Chart update failed:", error);
  }
}

async function fetchData() {
  let payload = null;
  try {
    const res = await fetch("http://127.0.0.1:5000/simulate");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    payload = await res.json();
  } catch (error) {
    console.error("Fetch failed, using simulated telemetry:", error);
  }

  try {
    const liveData = normalizeData(payload);
    console.log("simulate:", liveData);
    updateUI(liveData);
    updateLastUpdated();
    updateChart(liveData);

    if (firstLoad) {
      removeLoadingState();
      firstLoad = false;
    } else {
      refreshFeedback();
    }
  } catch (error) {
    console.error("UI update failed:", error);
  }
}

function createGradient(ctx, area, colorTop, colorBottom) {
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);
  return gradient;
}

function initChart() {
  if (chart) return;
  if (typeof Chart === "undefined") return;
  const canvas = document.getElementById("chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Demand",
          data: demandData,
          borderColor: "#fb7185",
          backgroundColor: (context) => {
            const area = context.chart.chartArea;
            if (!area) return "rgba(251, 113, 133, 0.1)";
            return createGradient(context.chart.ctx, area, "rgba(251, 113, 133, 0.11)", "rgba(251, 113, 133, 0)");
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 2
        },
        {
          label: "Supply",
          data: supplyData,
          borderColor: "#4ade80",
          backgroundColor: (context) => {
            const area = context.chart.chartArea;
            if (!area) return "rgba(74, 222, 128, 0.1)";
            return createGradient(context.chart.ctx, area, "rgba(74, 222, 128, 0.11)", "rgba(74, 222, 128, 0)");
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: "easeOutQuart" },
      plugins: {
        legend: { labels: { color: "#94a3b8", usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.78)",
          borderColor: "rgba(148, 163, 184, 0.24)",
          borderWidth: 1,
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          cornerRadius: 12,
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
        y: { grid: { color: "rgba(148, 163, 184, 0.045)" }, ticks: { color: "#94a3b8" } }
      }
    }
  });
}

function updateThemeButtonText() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  toggle.textContent = document.body.classList.contains("light-theme") ? "🌞" : "🌙";
}

function initTheme() {
  const storedTheme = localStorage.getItem("ecosync-theme");
  if (storedTheme === "light") document.body.classList.add("light-theme");
  updateThemeButtonText();
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    localStorage.setItem("ecosync-theme", document.body.classList.contains("light-theme") ? "light" : "dark");
    updateThemeButtonText();
  });
}

function initStressButton() {
  const navRight = document.querySelector(".nav-right");
  if (!navRight || document.getElementById("stressBtn")) return;
  const btn = document.createElement("button");
  btn.id = "stressBtn";
  btn.type = "button";
  btn.textContent = "⚡ Simulate Grid Stress";
  btn.className = "theme-toggle";
  btn.style.padding = "6px 12px";
  btn.addEventListener("click", () => {
    stressLevel = 50 + Math.random() * 10;
    stressUntil = Date.now() + 6500;
    pushAIFeedLog("Emergency protocol triggered. Simulating grid stress.");
    fetchData();
  });
  navRight.prepend(btn);
}

initTheme();
initStressButton();
initChart();
fetchData();
setInterval(fetchData, REFRESH_MS);
