"use strict";

//const baseUrl = "http://tomvopat.com:3000";
const baseUrl = "http://localhost:3000";
const pageSize = Number.MAX_SAFE_INTEGER;
let page = getUrlPage();
if(page == undefined) {
    page = 1;
    setUrlPage(1);
}

let tableData = new Map();
let table = document.querySelector("#tbody");

// Loading file names
let request = new XMLHttpRequest();
request.onload = function() {
    let files = JSON.parse(this.response);
    for(let file of files) {
        let row = tableData.has(file["name"]) ? tableData.get(file["name"]) :  {idx: tableData.size};
        row.name = file.name;
        row.checked = file.checked;
        if(!row.count) row.count = 0;
        tableData.set(file["name"], row);
    }
    updateTable(page);
}
request.open("GET", `${baseUrl}/files`, true);
request.send();

// Loading number of outliers
request = new XMLHttpRequest();
request.onload = function() {
    let files = JSON.parse(this.response);
    for(let file of files) {
        let row = tableData.has(file["name"]) ? tableData.get(file["name"]) :  {idx: tableData.size};
        row.count = file.count;
        tableData.set(file["name"], row);
    }
    updateTable(page);
}
request.open("GET", `${baseUrl}/files-outliercount`, true);
request.send();

function updateTable(page = 1, ascending = true) {
    let values = Array.from(tableData.values());
    // TODO: not working
    // values.sort(function(a, b) {
    //     if(ascending) return a["idx"] >= b["idx"];
    //     else return b["idx"] >= a["idx"];
    // });
    //values = values.slice((page - 1) * pageSize, page * pageSize);

    // clearing table
    table.innerHTML = "";

    for(let val of values) {
        let row = createRow(val);
        table.appendChild(row);
    }
}

function createRow(data) {
    let row = document.createElement("tr");

    // index
    let cell = document.createElement("th");
    let text = document.createTextNode(data["idx"]);
    cell.appendChild(text);
    cell.setAttribute("scope", "row");
    row.appendChild(cell);

    // filename
    cell = row.insertCell();
    let link = document.createElement("a");
    link.setAttribute("href", `./map.html?file=${data.name}`);
    link.innerHTML = data["name"];
    cell.appendChild(link);

    // outlier count
    cell = row.insertCell();
    text = document.createTextNode(data["count"]);
    cell.appendChild(text);

    // checked
    cell = row.insertCell();
    if(data.checked == true) cell.innerHTML = '<i class="fas fa-check-circle"></i>';
    else cell.innerHTML = '<i class="far fa-times-circle"></i>';

    return row;
}

function getUrlPage() {
    let params = new URLSearchParams(document.location.search);
    if(! params.has("page")) return undefined;
    return params.get("page");
}

function setUrlPage(page) {
    window.history.replaceState(null, `Page ${page}`, `?page=${page}`);
}

// function generatePaginaiton(size) {
//     <li class="page-item"><a class="page-link" href="">1</a></li>
//     <li class="page-item"><a class="page-link" href="#">2</a></li>
//     <li class="page-item"><a class="page-link" href="#">3</a></li>
// }
