"use strict";

const baseUrl = "http://localhost:3000";

let request = new XMLHttpRequest();
request.open("GET", `${baseUrl}/files`, true);
request.onload = function() {
    let files = JSON.parse(this.response);
    let table = document.querySelector("#tbody");
    createTable(table, files);
};
request.send();


function createTable(table, data) {
    let i = 0;
    for(let entry of data) {
        if(entry["checked"] == true) {
            i++;
            continue;
        }

        // ID
        let row = table.insertRow();
        let cell = document.createElement("th");
        let text = document.createTextNode(i++);
        cell.appendChild(text);
        cell.setAttribute("scope", "row");
        row.appendChild(cell);

        // name
        cell = row.insertCell();
        text = document.createTextNode(entry["name"])
        cell.appendChild(text);

        // button to the map page
        cell = row.insertCell();
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-primary")
        button.innerHTML = "Open";
        button.onclick = function() {
            document.location.href = `./map.html?file=${entry.name}`;
        };
        cell.appendChild(button);

    }
}
