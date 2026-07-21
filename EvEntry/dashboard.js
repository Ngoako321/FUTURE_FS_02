// ----------Monthly Leads (Line Chart)


const monthlyChart = new Chart(document.getElementById("monthlyChart"), {

    type: "line",

    data: {

        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

        datasets: [{
            label: "Leads",

            data: [12, 19, 30, 42, 55, 70],

            borderColor: "#2563eb",

            backgroundColor: "rgba(37,99,235,.2)",

            fill: true,

            tension: .4
        }]
    }
});


// Lead Status (Pie Chart) 


const statusChart = new Chart(document.getElementById("statusChart"), {

    type: "pie",

    data: {

        labels: ["New", "Contacted", "Converted"],

        datasets: [{

            data: [25, 45, 30],

            backgroundColor: [

                "#3b82f6",

                "#f5930b",

                "#22c55e"
            ]
        }]
    }
});


// Lead Sources (Bar Chart)

const sourceChart = new Chart(document.getElementById("sourceChart"), {

    type: "bar",

    data: {

        labels: [

            "Website",

            "Facebook",

            "LinkedIn",

            "Referral",

            "Instagram"
        ],

        datasets: [{

            label: "Leads",

            data: [60, 35, 48, 15, 22],

            backgroundColor: "#2563eb"
        }]
    },

    options: {

        responsive: true,

        scales: {

            y: {
                beginAtZero: true
            }
        }
    }
});

