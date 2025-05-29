let loggedInUser = null;
let accounts = [];
let currentAccount = null;

document.addEventListener('DOMContentLoaded', () => {
    getStorageData();

    currentAccount = accounts[loggedInUser];

    document.title = `Dashboard - ${currentAccount.email}`;
    loggedInUserElement.textContent = `${currentAccount.firstName} ${currentAccount.lastName}`;
});

function getStorageData() {
    accounts = JSON.parse(localStorage.getItem('gokolabAccounts')) || [];
    loggedInUser = sessionStorage.getItem('loggedInUser') || null;
}

function saveToStorage() {
    localStorage.setItem('gokolabAccounts', JSON.stringify(accounts));
    sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
}