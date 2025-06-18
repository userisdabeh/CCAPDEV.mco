function eyePass() {
    const eyeIcon = document.getElementById("eyeIcon");
    const password = document.getElementById("password");

    if (password.type === "password") {
        password.type = "text";
        eyeIcon.className = "bi bi-eye-fill";
    } else {
        password.type = "password";
        eyeIcon.className = "bi bi-eye-slash-fill";
    }
}
function loginUser(event) {
    event.preventDefault(); 

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "johndoe@dlsu.edu.ph" && password === "1234") {
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid email or password. Please try again.");
    }

    return false;
}
