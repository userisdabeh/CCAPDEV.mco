let gokoLabRooms = [];

function getStorageData() {
    gokoLabRooms = JSON.parse(localStorage.getItem('gokoLabRooms')) || [];
}

function saveStorageData() {
    localStorage.setItem('gokoLabRooms', JSON.stringify(gokoLabRooms));
}