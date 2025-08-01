document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const message = document.getElementById('formMessage');


    function toggleVisibility(icon) {
        const targetId = icon.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;

        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';


        icon.classList.toggle('bi-eye-fill', isHidden);
        icon.classList.toggle('bi-eye-slash-fill', !isHidden);
        icon.setAttribute('aria-label', isHidden ? `Hide ${targetId.replace(/([A-Z])/g, ' $1').toLowerCase()}` : `Show ${targetId.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        icon.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
    }

    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => toggleVisibility(icon));
        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleVisibility(icon);
            }
        });
    });


    const passwordInput = form.password;
    const confirmInput = form.confirmPassword;
    confirmInput.addEventListener('input', () => {
        if (passwordInput.value !== confirmInput.value) {
            showError('confirmPassword', 'Passwords do not match.');
        } else {
            // clear confirmPassword error if they match
            const inputField = document.getElementById('confirmPassword');
            const formControl = inputField.parentElement;
            formControl.classList.remove('error');
            const small = formControl.querySelector('small');
            if (small) {
                small.innerText = '';
                small.style.visibility = 'hidden';
            }
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        message.innerHTML = '';
        clearErrors();

        const firstName = form.firstName.value.trim();
        const lastName = form.lastName.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const terms = form.terms;

        const errors = [];

        // Validation
        if (!/^[a-zA-Z]{3,}$/.test(firstName)) {
            showError('firstName', 'First name must be at least 3 letters');
            errors.push('First name must be at least 3 letters');
        }

        if (!/^[a-zA-Z]{3,}$/.test(lastName)) {
            showError('lastName', 'Last name must be at least 3 letters');
            errors.push('Last name must be at least 3 letters');
        }

        if (!/^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/.test(email)) {
            showError('email', 'Enter a valid DLSU email');
            errors.push('Enter a valid DLSU email');
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)) {
            showError('password', 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.');
            errors.push('Password must be at least 6 characters and include uppercase, lowercase, number, and special character.');
        }

        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match.');
            errors.push('Passwords do not match.');
        }

        if (!terms.checked) {
            showError('terms', "You must agree to the terms");
            errors.push("You must agree to the terms");
        }

        if (errors.length > 0) {
            message.innerHTML = `<div class="error">${errors.join('<br>')}</div>`;
        } else {
            message.innerHTML = `<div class="success">Registering...</div>`;

            const formData = {
                firstName,
                lastName,
                email,
                password,
                confirmPassword
            };

            console.log('Form Data:', formData);

            await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    message.innerHTML = `<div class="success">Registration Successful</div>`;
                } else {
                    message.innerHTML = `<div class="error">${data.message || 'Something went wrong. Please try again.'}</div>`;
                }
            }).catch(err => {
                console.error('Error:', err);
                message.innerHTML = '<div class="error">An error occurred while processing your request.</div>';
            });

            form.reset();
        }
    });

    function showError(fieldId, messageText) {
        const inputField = document.getElementById(fieldId);
        const formControl = inputField.parentElement;
        const small = formControl.querySelector('small');

        formControl.classList.add('error');
        if (small) {
            small.innerText = messageText;
            small.style.visibility = 'visible';
        }
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
