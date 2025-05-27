let accounts = [];
const viewPasswordButton = document.querySelector('.view--password');

document.addEventListener('DOMContentLoaded', () => {
    getStorageData();
});

function validateAccount() {
    const inputEmail = document.getElementById('userEmail').value;
    const inputPassword = document.getElementById('userPassword').value;

    const accountIndex = accounts.findIndex(accounts => accounts.userEmail === inputEmail);
    if (accountIndex == -1) {
        alert('Account not found');
        return false;
    }

    const account = accounts[accountIndex];

    if (account.userPassword !== inputPassword) {
        alert('Incorrect password');
        return false;
    }

    if (account.userEmail === inputEmail && account.userPassword === inputPassword) {
        alert('Login successful');
    }
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

function getStorageData() {
    accounts = JSON.parse(localStorage.getItem('gokolabAccounts')) || [];
}