let accounts = [];
const createUserForm = document.querySelector('.create--account--form');

document.addEventListener('DOMContentLoaded', function() {
    getStorageData();
});

createUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    createAccount();
})

function createAccount() {
    const newUserFirstName = document.getElementById('newUserFirstName').value;
    const newUserLastName = document.getElementById('newUserLastName').value;
    const newUserEmail = document.getElementById('newUserEmail').value;
    const newUserPassword = document.getElementById('newUserPassword').value;
    const newUserConfirmPassword = document.getElementById('newUserConfirmPassword').value;

    if (newUserPassword !== newUserConfirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (accounts.findIndex(account => account.email === newUserEmail) !== -1) {
        alert('Email already exists!');
        return;
    }

    const newUser = {
        firstName: newUserFirstName,
        lastName: newUserLastName,
        email: newUserEmail,
        password: newUserPassword
    };

    accounts.push(newUser);
    saveToStorage();
    alert('Account created successfully!');
    createUserForm.reset();
    window.location.href = 'index.html';
}
 
function getStorageData() {
    accounts = JSON.parse(localStorage.getItem('gokolabAccounts')) || [];
}

function saveToStorage() {
    localStorage.setItem('gokolabAccounts', JSON.stringify(accounts));
}