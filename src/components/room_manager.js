let gokoLabRooms = [];
let currentEditingRoomID = null; // Add this to track which room is being edited

const addRoomButton = document.getElementById('addRoomBtn');
const addRoomForm = document.getElementById('addRoomForm');
const addRoomPopup = document.getElementById('addRoomPopup');
const editRoomPopup = document.getElementById('editRoomPopup');
const editRoomForm = document.getElementById('editRoomForm');
const cancelAddRoomButton = document.getElementById('cancelAddRoomBtn');
const roomListContent = document.getElementById('roomsListContent');
const searchRoomForm = document.getElementById('searchRoomForm');   

document.addEventListener('DOMContentLoaded', () => {
    getStorageData();
    displayRooms();
});

addRoomButton.addEventListener('click', (e) => {
    e.preventDefault();
    addRoomPopup.style.display = 'flex';
});

addRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newRoomName = document.getElementById('newRoomName').value.trim();
    const newRoomSlots = parseInt(document.getElementById('newRoomSlots').value, 10);
    const newRoomStatus = document.getElementById('newRoomStatus').value;

    const isRoomExisting = gokoLabRooms.some(room => room.name.toLowerCase() === newRoomName.toLowerCase());

    if (isRoomExisting) {
        alert('Room with this name already exists.');
        return;
    }

    const maxRoomID = gokoLabRooms.length > 0 ? Math.max(...gokoLabRooms.map(room => room.roomID)) : 0;

    const newRoom = {
        roomID: maxRoomID + 1,
        name: newRoomName,
        slots: newRoomSlots,
        status: newRoomStatus
    };

    gokoLabRooms.push(newRoom);
    saveStorageData();
    addRoomForm.reset();
    closeAddRoomPopup();
    displayRooms();
});

cancelAddRoomButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeAddRoomPopup();
});

searchRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();

    roomListContent.innerHTML = '';

    const searchInput = document.getElementById('searchRoom').value.trim().toLowerCase();

    const filteredRooms = gokoLabRooms.filter(room => room.name.toLowerCase().includes(searchInput));

    if (filteredRooms.length === 0) {
        const noResultsMessage = document.createElement('tr');
        noResultsMessage.innerHTML = `
            <td colspan="4" class="norooms--message">No rooms found matching "${searchInput}".</td>
        `;
        roomListContent.appendChild(noResultsMessage);
        return;
    }

    filteredRooms.forEach((room, index) => {
        const newRoomItem = document.createElement('tr');
        newRoomItem.innerHTML = `
            <td class="room--name--data">${room.name}</td>
            <td class="room--slots--data">${room.slots}</td>
            <td class="room--status--data">
                <p class="${room.status === 'active' ? 'active--status' : 'inactive--status'}">
                    ${room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </p>
            </td>
            <td class="room--actions--data">
                <svg xmlns="http://www.w3.org/2000/svg" onclick="deleteRoom(${room.roomID})" class="bi bi-trash3 delete--icon" viewBox="0 0 16 16" title="Delete Room"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="delete--icon" onclick="toggleEditPopup(${room.roomID})" title="Edit Room"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
            </td>
        `;

        roomListContent.appendChild(newRoomItem);
    });
});

function displayRooms() {
    roomListContent.innerHTML = '';

    if (gokoLabRooms.length === 0) {
        const noRoomsMessage = document.createElement('tr');
        noRoomsMessage.innerHTML = `
            <td colspan="4" class="norooms--message">No rooms available. Please add a room.</td>
        `;
        roomListContent.appendChild(noRoomsMessage);
        return;
    }

    gokoLabRooms.forEach((room, index) => {
        const newRoomItem = document.createElement('tr');
        newRoomItem.innerHTML = `
            <td class="room--name--data">${room.name}</td>
            <td class="room--slots--data">${room.slots}</td>
            <td class="room--status--data">
                <p class="${room.status === 'active' ? 'active--status' : 'inactive--status'}">
                    ${room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </p>
            </td>
            <td class="room--actions--data">
                <svg xmlns="http://www.w3.org/2000/svg" onclick="deleteRoom(${room.roomID})" class="bi bi-trash3 delete--icon" viewBox="0 0 16 16" title="Delete Room"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="delete--icon" onclick="toggleEditPopup(${room.roomID})" title="Edit Room"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
            </td>
        `;

        roomListContent.appendChild(newRoomItem);
    });
}

function toggleEditPopup(roomID) {
    currentEditingRoomID = roomID; // Store the room ID being edited
    editRoomPopup.style.display = 'flex';
    renderEditRoomForm(roomID);
}

editRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const roomToEditIndex = gokoLabRooms.findIndex(room => room.roomID === currentEditingRoomID);
    const roomToEdit = gokoLabRooms[roomToEditIndex];

    const toEditRoomName = document.getElementById('toEditRoomName').value.trim();
    const toEditRoomSlots = parseInt(document.getElementById('toEditRoomSlots').value.trim(), 10);
    const toEditRoomStatus = document.getElementById('toEditRoomStatus').value;

    // Check if the new name already exists (but allow keeping the same name)
    const isRoomExisting = gokoLabRooms.some(room => 
        room.name.toLowerCase() === toEditRoomName.toLowerCase() && 
        room.roomID !== currentEditingRoomID
    );

    if (isRoomExisting) {
        alert('Room with this name already exists.');
        return;
    }

    roomToEdit.name = toEditRoomName;
    roomToEdit.slots = toEditRoomSlots;
    roomToEdit.status = toEditRoomStatus;
    gokoLabRooms[roomToEditIndex] = roomToEdit;
    saveStorageData();
    editRoomForm.reset();
    closeEditRoomPopup();
    displayRooms();
});

function deleteRoom(roomID) {
    if (confirm('Are you sure you want to delete this room?')) {
        const roomToDeleteIndex = gokoLabRooms.findIndex(room => room.roomID === roomID);
        gokoLabRooms.splice(roomToDeleteIndex, 1);
        saveStorageData();
        displayRooms();   
    }
}

function renderEditRoomForm(roomID) {
    const roomToEditIndex = gokoLabRooms.findIndex(room => room.roomID === roomID);
    const roomToEdit = gokoLabRooms[roomToEditIndex];

    document.getElementById('toEditRoomName').value = roomToEdit.name;
    document.getElementById('toEditRoomSlots').value = roomToEdit.slots;
    document.getElementById('toEditRoomStatus').value = roomToEdit.status;
}

function closeAddRoomPopup() {
    addRoomForm.reset();
    addRoomPopup.style.display = 'none';
}

function closeEditRoomPopup() {
    editRoomForm.reset();
    editRoomPopup.style.display = 'none';
    currentEditingRoomID = null; // Reset the editing room ID
}

function getStorageData() {
    gokoLabRooms = JSON.parse(localStorage.getItem('gokoLabRooms')) || [];
}

function saveStorageData() {
    localStorage.setItem('gokoLabRooms', JSON.stringify(gokoLabRooms));
}