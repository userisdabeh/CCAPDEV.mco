document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("passwordForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearErrors();

        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        let hasErrors = false;

        // Validation
        if (!/^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/.test(email)) {
            showError('email', 'Enter a valid DLSU email');
            hasErrors = true;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)) {
            showError('password', 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.');
            hasErrors = true;
        }

        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match.');
            hasErrors = true;
        }

        // If no validation errors, submit the form
        if (!hasErrors) {
            console.log('Form validation passed, submitting to server...');
            form.submit();
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