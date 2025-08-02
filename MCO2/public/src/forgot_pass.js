document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("passwordForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors();
        clearTopMessage();

        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        const errors = [];

        // Email validation
        if (!/^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/.test(email)) {
            showError('email', 'Enter a valid DLSU email');
            errors.push('Invalid email');
        }

        // Password complexity
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)) {
            showError('password', 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.');
            errors.push('Password complexity requirement not met');
        }

        // Match
        if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match.');
            errors.push('Passwords do not match');
        }

        if (errors.length > 0) {
            showTopMessage('Please fix the errors and try again.', 'error');
            return;
        }

        showTopMessage('Resetting password...', 'info');

        try {
            const res = await fetch('/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password, confirmPassword }),
            redirect: 'follow'
        });

        if (res.redirected) {
            showTopMessage('Password has been reset successfully. You can now log in.', 'success');
            form.reset();
            return;
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await res.json();
            if (res.ok && data.success) {
                showTopMessage('Password has been reset successfully. You can now log in.', 'success');
                form.reset();
            } else {
                if (data.errors) {
                    for (const [field, msg] of Object.entries(data.errors)) {
                        showError(field, msg);
                    }
                }
                showTopMessage(data.message || 'Failed to reset password.', 'error');
            }
        } else {
            if (res.ok) {
                showTopMessage('Password has been reset successfully. You can now log in.', 'success');
                form.reset();
            } else {
                showTopMessage('Unexpected response from server.', 'error');
            }
        }
    } catch (err) {
        console.error('Fetch error detail:', err);
        showTopMessage('An error occurred while processing your request: ' + err.message, 'error');
    }
    });

    const passwordInput = form.password;
    const confirmInput = form.confirmPassword;
    if (confirmInput && passwordInput) {
        let timer;
        confirmInput.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (passwordInput.value !== confirmInput.value) {
                    showError('confirmPassword', 'Passwords do not match.');
                } else {
                    clearFieldError('confirmPassword');
                }
            }, 200);
        });
    }

    function showError(fieldId, messageText) {
        const inputField = document.getElementById(fieldId);
        if (!inputField) return;
        const formControl = inputField.closest('.form-control');
        if (!formControl) return;
        const small = formControl.querySelector('small');

        formControl.classList.add('error');
        if (small) {
            small.innerText = messageText;
            small.style.visibility = 'visible';
        }
    }

    function clearFieldError(fieldId) {
        const inputField = document.getElementById(fieldId);
        if (!inputField) return;
        const formControl = inputField.closest('.form-control');
        if (!formControl) return;
        formControl.classList.remove('error');
        const small = formControl.querySelector('small');
        if (small) {
            small.innerText = '';
            small.style.visibility = 'hidden';
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

    function showTopMessage(html, type) {
        clearTopMessage();

        const container = document.createElement('div');
        container.setAttribute('data-generated', '1');
        container.style.textAlign = 'center';
        container.style.marginBottom = '20px';
        container.style.padding = '10px';
        container.style.borderRadius = '5px';
        container.style.fontWeight = '500';
        if (type === 'error') {
            container.style.color = '#e74c3c';
            container.style.background = 'rgba(231, 76, 60, 0.1)';
        } else if (type === 'success') {
            container.style.color = '#1f7d1f';
            container.style.background = 'rgba(31, 125, 31, 0.1)';
        } else {
            container.style.color = '#333';
            container.style.background = 'rgba(0,0,0,0.03)';
        }
        container.innerHTML = html;

        const heading = form.querySelector('h1');
        if (heading) {
            heading.insertAdjacentElement('afterend', container);
        } else {
            form.prepend(container);
        }
    }

    function clearTopMessage() {
        const existing = document.querySelector('.error-message[data-generated], div[data-generated="1"]');
        if (existing) existing.remove();
    }

    function eyePass(icon) {
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

    document.querySelectorAll('.eye-toggle').forEach(icon => {
        icon.addEventListener('click', () => eyePass(icon));
        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                eyePass(icon);
            }
        });
    });
});
