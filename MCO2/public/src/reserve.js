const searchResults = document.getElementById("searchResults");
const searchForm = document.getElementById("searchForm");

searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    searchResults.innerHTML = "";

    const searchedLab = searchForm.roomSelect.value;
    const searchedDate = searchForm.dateSelect.value;

    const stringedDate = convertToDate(searchedDate);

    const textResultsDiv = document.createElement("div");
    textResultsDiv.className = "text--results";
    textResultsDiv.innerHTML = `<h4>${searchedLab}</h4><p class="disabled-text">${stringedDate}</p>`;
    searchResults.appendChild(textResultsDiv);

    const resultsList = document.createElement("div");
    resultsList.className = "results--list";

    const table = document.createElement("table");
    table.className = "seat--selector";

    const colgroup = document.createElement("colgroup");
    colgroup.innerHTML = `<col style="width: 20%;">`;
    table.appendChild(colgroup);

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Seat</th>
            <th colspan="2">9:00</th>
            <th colspan="2">10:00</th>
            <th colspan="2">11:00</th>
            <th colspan="2">12:00</th>
            <th colspan="2">13:00</th>
            <th colspan="2">14:00</th>
            <th colspan="2">15:00</th>
            <th colspan="2">16:00</th>
            <th colspan="2">17:00</th>
            <th colspan="2">18:00</th>
            <th colspan="2">19:00</th>
            <th colspan="2">20:00</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (let i = 1; i <= 20; i++) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="seat--label">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m320-80 40-280H160l360-520h80l-40 320h240L400-80h-80Z"/></svg>
                    <p>${i}</p>
                </div>
            </td>
            ${generateTimeSlots(searchedDate, searchedLab, i)}
        `;
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    resultsList.appendChild(table);
    searchResults.appendChild(resultsList);

    addTileListeners();
});

function convertToDate(date) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return `${months[parseInt(month) - 1]} ${day}, ${year}`;
}

function generateTimeSlots(date, lab, seatNumber) {
    const times = [
        "0900", "0930", "1000", "1030", "1100", "1130",
        "1200", "1230", "1300", "1330", "1400", "1430",
        "1500", "1530", "1600", "1630", "1700", "1730",
        "1800", "1830", "1900", "1930", "2000"
    ];

    return times.map(time =>
        `<td class="clickable-tile" id="${date}-${lab}-${time}-S${seatNumber}"></td>`
    ).join("");
}

function addTileListeners() {
    const clickableTiles = document.querySelectorAll(".clickable-tile");
    clickableTiles.forEach(tile => {
        tile.addEventListener("click", (e) => {
            e.target.classList.toggle("selected");
            updateSelectedList();
        });
    });
}

function updateSelectedList() {
    const selectedTiles = document.querySelectorAll(".clickable-tile.selected");
    const selectedList = document.getElementById("selectedList");

    selectedList.innerHTML = "";

    selectedTiles.forEach(tile => {
        const li = document.createElement("li");
        li.textContent = tile.id;
        selectedList.appendChild(li);
    });
}

document.getElementById("submitSelection").addEventListener("click", () => {
    const selectedTiles = document.querySelectorAll(".clickable-tile.selected");
    const selectedIDs = Array.from(selectedTiles).map(tile => tile.id);

    const reservationData = {
        selected: selectedIDs,
        timestamp: new Date().toISOString()
    };

    document.getElementById("jsonOutput").textContent = JSON.stringify(reservationData, null, 2);
    alert("Reservation data has been generated. Check the JSON output below.");
});
