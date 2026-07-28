const CHART_COLORS = {
    primary: "#22D3EE",
    secondary: "#818CF8",
    success: "#34D399",
    warning: "#FACC15",
    danger: "#F87171",
    text: "#8B96AC",
    grid: "rgba(255, 255, 255, 0.08)"
};

Chart.defaults.color = CHART_COLORS.text;
Chart.defaults.font.family = "Inter, sans-serif";

async function loadDashboard() {

    try {

        const token = sessionStorage.getItem("leadflow_token");
        const response = await fetch(`${API_BASE}/leads` {

            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Could not fetch leads");
        }

        const leads = await response.json();

        renderStats(leads);
        renderRecentLeads(leads);
        renderMonthlyChart(leads);
        renderStatusChart(leads);
        renderSourceChart(leads);

    } catch (error) {

        console.error("Dashboard error:", error);

        const tbody = document.getElementById("recentLeadsBody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4">Couldn't load leads. Is the API running at ${typeof API_BASE !== "undefined" ? API_BASE : "the configured URL"}?</td></tr>`;
        }
    }
}

function renderStats(leads) {

    const newLeads = leads.filter(lead => lead.status === "New").length;
    const contactedLeads = leads.filter(lead => lead.status === "Contacted").length;
    const convertedLeads = leads.filter(lead => lead.status === "Converted").length;

    document.getElementById("newLeads").textContent = newLeads;
    document.getElementById("contactedLeads").textContent = contactedLeads;
    document.getElementById("convertedLeads").textContent = convertedLeads;
    document.getElementById("totalLeads").textContent = leads.length;
}

function renderRecentLeads(leads) {

    const tbody = document.getElementById("recentLeadsBody");

    // Most recently added first, capped at 5 rows.
    const recent = [...leads]
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No leads yet. <a href="add-lead.html" class="edit-btn">Add one</a>.</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map(lead => `
        <tr>
            <td>${escapeHtml(lead.full_name)}</td>
            <td>${escapeHtml(lead.company)}</td>
            <td><span class="${lead.status.toLowerCase()}">${escapeHtml(lead.status)}</span></td>
            <td>
                <a href="lead-details.html?id=${lead.id}" class="view-btn">
                    <i class="fa-solid fa-eye"></i>
                    View
                </a>
            </td>
        </tr>
    `).join("");
}

function renderMonthlyChart(leads) {

    const counts = {};

    leads.forEach(lead => {
        const date = lead.created_at ? new Date(lead.created_at) : null;
        const label = date && !isNaN(date)
            ? date.toLocaleString("default", { month: "short", year: "2-digit" })
            : "Unknown";
        counts[label] = (counts[label] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    new Chart(document.getElementById("monthlyChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Leads",
                data,
                borderColor: CHART_COLORS.primary,
                backgroundColor: "rgba(34, 211, 238, 0.15)",
                tension: 0.35,
                fill: true,
                pointBackgroundColor: CHART_COLORS.primary
            }]
        },
        options: chartOptions()
    });
}

function renderStatusChart(leads) {

    const statuses = ["New", "Contacted", "Converted"];
    const counts = statuses.map(s => leads.filter(l => l.status === s).length);

    new Chart(document.getElementById("statusChart"), {
        type: "doughnut",
        data: {
            labels: statuses,
            datasets: [{
                data: counts,
                backgroundColor: [CHART_COLORS.warning, CHART_COLORS.secondary, CHART_COLORS.success],
                borderColor: "#111826",
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom", labels: { color: CHART_COLORS.text } }
            }
        }
    });
}

function renderSourceChart(leads) {

    const counts = {};
    leads.forEach(lead => {
        const source = lead.source || "Unknown";
        counts[source] = (counts[source] || 0) + 1;
    });

    new Chart(document.getElementById("sourceChart"), {
        type: "bar",
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: "Leads",
                data: Object.values(counts),
                backgroundColor: CHART_COLORS.primary,
                borderRadius: 6
            }]
        },
        options: chartOptions()
    });
}

function chartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.text } },
            y: {
                grid: { color: CHART_COLORS.grid },
                ticks: { color: CHART_COLORS.text, precision: 0 },
                beginAtZero: true
            }
        }
    };
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

loadDashboard();