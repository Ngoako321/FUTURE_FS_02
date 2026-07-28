const params = new URLSearchParams(window.location.search);
const leadId = params.get("id");

let currentLead = null;
let editing = false;

const els = {
    
    name: document.getElementById("leadName"),
    statusBadge: document.getElementById("leadStatusBadge"),
    company: document.getElementById("leadCompany"),
    email: document.getElementById("leadEmail"),
    phone: document.getElementById("leadPhone"),
    source: document.getElementById("leadSource"),
    date: document.getElementById("leadDate"),
    notes: document.getElementById("leadNotes"),
    editBtn: document.getElementById("editBtn"),
    deleteBtn: document.getElementById("deleteBtn")
};

async function loadLead() {

    if (!leadId) {
        els.name.textContent = "No lead selected";
        els.editBtn.style.display = "none";
        els.deleteBtn.style.display = "none";
        return;
    }

    try {

        // prefer a single-record endpoint i API supports it.

        const token = sessionStorage.getItem("leadflow_token");

        let response = await fetch(`${API_BASE}/leads/${leadId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        let lead;

        if (response.ok) {
            lead = await response.json();

        }
        else {

            const listResponse = await fetch(`${API_BASE}/leads`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!listResponse.ok) throw new Error("Could not fetch leads");
            const leads = await listResponse.json();
            lead = leads.find(l => String(l.id) === String(leadId));
            if (!lead) throw new Error("Lead not found");

        }
        currentLead = lead;
        renderLead(lead);

    }
    catch (error) {
        console.error(error);
        els.name.textContent = "Couldn't load this lead";
        els.editBtn.style.display = "none";
        els.deleteBtn.style.display = "none";
    }
}
 
function renderLead(lead) {
    els.name.textContent = lead.full_name;
    els.statusBadge.textContent = lead.status;
    els.statusBadge.className = `status ${lead.status.toLowerCase()}`;
    els.company.textContent = lead.company;
    els.email.textContent = lead.email;
    els.phone.textContent = lead.phone || "N/A";
    els.source.textContent = lead.source || "N/A";
    els.date.textContent = lead.created_at
        ? new Date(lead.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
        : "N/A";
    els.notes.textContent = lead.notes || "No notes yet.";
}
 
function enterEditMode() {
 
    editing = true;
 
    els.company.innerHTML = `<input type="text" id="editCompany" value="${escapeAttr(currentLead.company)}">`;
    els.email.innerHTML = `<input type="email" id="editEmail" value="${escapeAttr(currentLead.email)}">`;
    els.phone.innerHTML = `<input type="text" id="editPhone" value="${escapeAttr(currentLead.phone || "")}">`;
 
    els.source.innerHTML = `
        <select id="editSource">
            ${["Website", "Facebook", "Instagram", "LinkedIn", "Referral", "Email Campaign"]
                .map(s => `<option value="${s}" ${s === currentLead.source ? "selected" : ""}>${s}</option>`)
                .join("")}
        </select>`;
 
    els.statusBadge.innerHTML = `
        <select id="editStatus">
            ${["New", "Contacted", "Converted"]
                .map(s => `<option value="${s}" ${s === currentLead.status ? "selected" : ""}>${s}</option>`)
                .join("")}
        </select>`;
 
    els.notes.innerHTML = `<textarea id="editNotes" rows="4" style="width:100%;">${escapeHtml(currentLead.notes || "")}</textarea>`;
 
    els.editBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save`;
}
 
async function saveEdits() {
 
    const updated = {
        ...currentLead,
        company: document.getElementById("editCompany").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        phone: document.getElementById("editPhone").value.trim(),
        source: document.getElementById("editSource").value,
        status: document.getElementById("editStatus").value,
        notes: document.getElementById("editNotes").value.trim()
    };
 
    try {

        const token = sessionStorage.getItem("leadflow_token");
 
        const response = await fetch(`${API_BASE}/leads/${leadId}`, {

            method: "PUT",

            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updated)
        });
 
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
 
        currentLead = updated;
        editing = false;
        renderLead(currentLead);
        els.editBtn.innerHTML = `<i class="fa-solid fa-pen"></i> Edit`;
 
    } catch (error) {
        console.error(error);
        alert("Could not save changes. Is the API running at " + API_BASE + "?");
    }
}
 
els.editBtn.addEventListener("click", () => {
    if (!currentLead) return;
    if (editing) {
        saveEdits();
    } else {
        enterEditMode();
    }
});
 
els.deleteBtn.addEventListener("click", async () => {
 
    if (!currentLead) return;
 
    const confirmed = confirm("Are you sure you want to delete this lead?");
    if (!confirmed) return;
 
    try {

        const token = sessionStorage.getItem("leadflow_token");
 
        const response = await fetch(`${API_BASE}/leads/${leadId}`, {
            
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
 
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
 
        alert("Lead deleted successfully!");
        window.location.href = "leads.html";
 
    } catch (error) {
        console.error(error);
        alert("Could not delete lead.");
    }
});
 
function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}
 
function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
}
 
loadLead();

