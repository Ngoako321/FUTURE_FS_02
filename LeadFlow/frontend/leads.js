async function loadLeads() {

    try {

        const token = sessionStorage.getItem("leadflow_token");

        const response = await fetch(`${API_BASE}/leads`, {

            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch leads");
        }

        const leads = await response.json();

        const table = document.getElementById("leadsTable");

        table.innerHTML = "";

        leads.forEach(lead => {

            table.innerHTML += `
                <tr>

                    <td>${lead.full_name}</td>

                    <td>${lead.company}</td>

                    <td>${lead.email}</td>

                    <td>${lead.phone || "N/A"}</td>

                    <td>
                        <span class="${lead.status.toLowerCase()}">
                            ${lead.status}
                        </span>
                    </td>

                    <td>

                        <a
                            href="lead-details.html?id=${lead.id}"
                            class="edit-btn"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </a>

                        <button
                            class="delete-btn"
                            onclick="deleteLead(${lead.id})"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(error);

    }

}

async function deleteLead(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this lead?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await  fetch(`${API_BASE}/leads/${id}` {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete lead");
        }

        alert("Lead deleted successfully!");

        loadLeads();

    } catch(error) {
        console.error(error);
        alert("Could not delete lead.");
    }
}

loadLeads();