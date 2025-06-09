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