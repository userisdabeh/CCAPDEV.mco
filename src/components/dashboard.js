let loggedInUser = null;
let accounts = [];
let currentAccount = null;

const loggedInUserElement = document.getElementById('logged--in--element');

document.addEventListener('DOMContentLoaded', () => {
    getStorageData();

    currentAccount = accounts[loggedInUser];

    document.title = `Dashboard - ${currentAccount.email}`;
    loggedInUserElement.textContent = `${currentAccount.firstName} ${currentAccount.lastName}`;
});

loggedInUserElement.addEventListener('click', () => {
    const userMenu = document.getElementById('user--dropdown');

    if (userMenu.style.display === 'block') {
        userMenu.style.display = 'none';
    } else {
        userMenu.style.display = 'block';
    }
});

function getStorageData() {
    accounts = JSON.parse(localStorage.getItem('gokolabAccounts')) || [];
    loggedInUser = sessionStorage.getItem('loggedInUser') || null;
}

function saveToStorage() {
    localStorage.setItem('gokolabAccounts', JSON.stringify(accounts));
    sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
}