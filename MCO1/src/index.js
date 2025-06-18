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

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "johndoe@dlsu.edu.ph") {
        return loginRegularUser(password);
    } else if (email === "juandelacruz@dlsutech.edu.ph") {
        return loginTechUser(password);
    } else {
        alert("Email not recognized.");
        return false;
    }
}

function loginRegularUser(password) {
    if (password === "1234") {
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect password for regular user.");
    }
    return false;
}

function loginTechUser(password) {
    if (password === "1234") {
        window.location.href = "tech_dashboard.html";
    } else {
        alert("Incorrect password for tech user.");
    }
    return false;
}
