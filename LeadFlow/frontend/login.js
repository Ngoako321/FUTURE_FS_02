document.getElementById("loginForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const credentials = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
    };

    try {

        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(credentials)
        });
 
        if (!response.ok) {
            throw new Error("Invalid email or password");
        }
 
        const data = await response.json();
 
        if (data.token) {
            sessionStorage.setItem("leadflow_token", data.token);
        }
 
        window.location.href = "dashboard.html";
 
    } catch (error) {
        console.error(error);
        alert("Could not log in. Check your credentials, or that the API's /login route exists.");
    }
});