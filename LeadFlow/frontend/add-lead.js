const form = document.getElementById("leadForm");
const submitBtn = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const lead = {

        full_name: document.getElementById("full_name").value.trim(),
        company: document.getElementById("company").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        source: document.getElementById("source").value.trim(),
        status: document.getElementById("status").value.trim(),
        notes: document.getElementById("notes").value.trim()

    };

    submitBtn.disabled = true;
    const originalLabel = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    try {

        const token = sessionStorage.getItem("leadflow_token");

        const response = await fetch(`${API_BASE}/leads`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(lead)

        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();

        alert(data.message || "Lead saved!");

        window.location.href = "leads.html";

    }

    catch (error) {

        console.error(error);

        alert("Could not save lead. Is the API running at " + API_BASE + "?");

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;

    }

});


