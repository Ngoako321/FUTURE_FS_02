// check if user is logged in
const token = sessionStorage.getItem("leadflow_token");

if (!token) {
    window.location.href = "login.html";
}

function logout() {
    sessionStorage.removeItem("leadflow_token");
    window.location.href = "login.html";
    
}
