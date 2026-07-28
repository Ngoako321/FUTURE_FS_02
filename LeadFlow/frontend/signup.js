document.getElementById("signupForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords don't match.");
        return;
    }
 
    const account = {
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        password
    };
 
    try {
 
        const response = await fetch(`${API_BASE}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(account)
        });
 
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
 
        alert("Account created! Please log in.");
        window.location.href = "login.html";
 
    } catch (error) {
        console.error(error);
        alert("Could not create account. Check that the API's /signup route exists.");
    }
});
 