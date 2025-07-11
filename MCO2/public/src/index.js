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

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    let errors = 0;

    console.log("Email:", emailInput.value.trim());
    console.log("Password:", passwordInput.value.trim());

    // Validate email
    if (!validateEmail(emailInput.value.trim())) {
        document.getElementById('email-error-frontend').innerText = "Please enter a valid DLSU email address.";
        errors++;
    }

    // Validate password
    if (!validatePassword(passwordInput.value.trim())) {
        document.getElementById('password-error-frontend').innerText = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.";
        errors++;
    }

    if (errors > 0) {
        return; // Stop form submission if there are validation errors
    } else {
        loginForm.submit(); // Submit the form if validation passes
    }

   
});

function validateEmail(email) {
    const re = /^[a-z]+([._][a-z]+)*@dlsu\.edu\.ph$/i;
    return re.test(email.trim());
}

function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password.trim());
}