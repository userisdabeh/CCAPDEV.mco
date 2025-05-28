let accounts = [];
const changePasswordForm = document.querySelector('.forgot--password--form');

document.addEventListener('DOMContentLoaded', function() {
    getStorageData();

    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userEmail = document.getElementById('userEmail').value;
        const newPassword = document.getElementById('newChangePassword').value;
        const confirmNewPassword = document.getElementById('confirmChangePassword').value;

        const userIndex = findUserEmail(userEmail);
        if (userIndex === -1) {
            alert('Email not found!');
            return;
        }

        const isSamePassword = validatePasswordInput(newPassword, confirmNewPassword);
        if (!isSamePassword) {
            alert('Passwords do not match!');
            return;
        }

        const userToUpdate = accounts[userIndex];
        userToUpdate.password = newPassword;
        saveToStorage();
        alert('Password changed successfully!');
        changePasswordForm.reset();
        window.location.href = 'index.html';
    });
});

function validatePasswordInput(newPassword, confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
        return false;
    }

    return true;
}

function findUserEmail(email) {
    const userIndex = accounts.findIndex(account => account.email === email);

    return userIndex;
}

function getStorageData() {
    accounts = JSON.parse(localStorage.getItem('gokolabAccounts')) || [];
}

function saveToStorage() {
    localStorage.setItem('gokolabAccounts', JSON.stringify(accounts));
}