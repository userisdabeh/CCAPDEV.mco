let accounts = [];
let loggedInUser = null;

const viewPasswordButton = document.querySelector('.view--password');
const loginForm = document.querySelector('.login--form');

document.addEventListener('DOMContentLoaded', () => {
    getStorageData();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputEmail = document.getElementById('userEmail').value;
    const inputPassword = document.getElementById('userPassword').value;

    if (inputEmail === 'superadmin' && inputPassword === 'batman') {
        loggedInUser = 'superadmin';
        saveToStorage();
        loginForm.reset();
        window.location.href = 'admin.html';
        return;
    }

    if (!validateEmail(inputEmail)) {
        alert('Please enter a valid DLSU email address.');
        loginForm.reset();
        return;
    };

    const isValid = validateAccount(inputEmail, inputPassword);

    if (isValid) {
        const currentUserIndex = accounts.findIndex(account => account.email === inputEmail);
        console.log(currentUserIndex);
        loggedInUser = currentUserIndex;
        saveToStorage();
        console.log(loggedInUser);
        loginForm.reset();
        window.location.href = 'dashboard.html';
    }
});

function validateEmail(email) {
    const emailPattern = /^[a-zA-Z._]+@dlsu\.edu\.ph$/;

    return emailPattern.test(email);
}

function validateAccount(inputEmail, inputPassword) {
    const accountIndex = accounts.findIndex(accounts => accounts.email === inputEmail);
    if (accountIndex == -1) {
        alert('Account not found');
        return false;
    }

    const account = accounts[accountIndex];

    if (account.password !== inputPassword) {
        alert('Incorrect password');
        return false;
    }

    if (account.email === inputEmail && account.password === inputPassword) {
        return true;
    }
}

function getStorageData() {
    accounts = JSON.parse(localStorage.getItem('gokolabAccounts')) || [];
    loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser')) || null;
}

function saveToStorage() {
    localStorage.setItem('gokolabAccounts', JSON.stringify(accounts));
    sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
}

viewPasswordButton.addEventListener('click', () => {
    const passwordInput = document.getElementById('userPassword');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        viewPasswordButton.textContent = 'Hide Password';
    }
    else {
        passwordInput.type = 'password';
        viewPasswordButton.textContent = 'View Password';
    }
});