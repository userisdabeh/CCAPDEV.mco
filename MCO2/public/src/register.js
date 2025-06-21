
function userBtn(){
    const btn = document.getElementById('btn');
    const studentBtn = document.querySelectorAll('.toggle-btn')[0];
    const techBtn = document.querySelectorAll('.toggle-btn')[1];

    studentBtn.addEventListener('click', () => {
        btn.style.left = '0';
    });

    techBtn.addEventListener('click', () => {
        btn.style.left = '160px';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const message = document.getElementById('formMessage');

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        message.innerHTML = '';
        clearErrors();

        const firstName = form.firstName.value.trim();
        const lastName = form.lastName.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const terms = form.terms.value;

        // Validation
        if (!/^[a-zA-Z]{3,}$/.test(firstName)) {
        showError('firstName', 'First name must be at least 3 letters');
        }

        if (!/^[a-zA-Z]{3,}$/.test(lastName)) {
        showError('lastName', 'Last name must be at least 3 letters');
        }

        if (!/^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/.test(email)) {
        showError('email', 'Enter a valid DLSU email');
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)) {
        showError('password', 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.');
        }

        if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match.');
        }
        
        if (!terms.checked) {
        showError('terms', "You must agree to the terms");
        }

        if (errors.length > 0) {
        message.innerHTML = `<div class="error">${errors.join('<br>')}</div>`;
        } else {
        message.innerHTML = `<div class="success">Registration successful!</div>`;
        form.reset();
        }
    });

    function showError(fieldId, messageText) {
    const inputField = document.getElementById(fieldId);
    const formControl = inputField.parentElement;
    const small = formControl.querySelector('small');

    formControl.classList.add('error');
    small.innerText = messageText;
    small.style.visibility = 'visible';
}

    function clearErrors() {
    const controls = form.querySelectorAll('.form-control');
    controls.forEach(control => {
        control.classList.remove('error');
        const small = control.querySelector('small');
        if (small) {
            small.innerText = '';
            small.style.visibility = 'hidden';
        }
    });
}

});