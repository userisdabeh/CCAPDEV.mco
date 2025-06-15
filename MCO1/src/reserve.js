const searchResults = document.getElementById("searchResults");
const searchForm = document.getElementById("searchForm");

searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    searchResults.innerHTML = ""; // Clear previous results

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
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-0900-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-0930-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1000-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1030-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1100-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1130-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1200-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1230-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1300-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1330-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1400-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1430-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1500-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1530-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1600-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1630-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1700-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1730-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1800-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1830-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1900-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-1930-S${i}"></td>
            <td class="clickable-tile" id="${searchedDate}-${searchedLab}-2000-S${i}"></td>
        `;
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    resultsList.appendChild(table);
    searchResults.appendChild(resultsList);

    // Add click event listeners to the clickable tiles
    const clickableTiles = document.querySelectorAll(".clickable-tile");
    clickableTiles.forEach(tile => {
        tile.addEventListener("click", (e) => {
            // Handle the click event for each tile
            e.target.classList.add("selected");
        });
    });
});

function convertToDate(date) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);

    let monthString = null;

    switch (month) {
        case "01":
            monthString = "January";
            break;
        case "02":
            monthString = "February";
            break;
        case "03":
            monthString = "March";
            break;
        case "04":
            monthString = "April";
            break;
        case "05":
            monthString = "May";
            break;
        case "06":
            monthString = "June";
            break;
        case "07":
            monthString = "July";
            break;
        case "08":
            monthString = "August";
            break;
        case "09":
            monthString = "September";
            break;
        case "10":
            monthString = "October";
            break;
        case "11":
            monthString = "November";
            break;
        case "12":
            monthString = "December";
            break;
    }

    return `${monthString} ${day}, ${year}`;
}