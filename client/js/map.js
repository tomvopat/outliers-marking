"use strict";

const baseUrl = "http://localhost:3000";

let urlParams = new URLSearchParams(document.location.search);
let fileName = urlParams.get("file");

let currentFile = document.querySelector("#file");
currentFile.innerHTML = `File: ${fileName}`;

// global vars
let center_pos = {
    lat: 60.192059,
    lng: 24.945831
};

let map = new google.maps.Map(
    document.getElementById('map'),
    {
        center: center_pos,
        zoom: 8
    }
);
let positionsMap = new Map();
let markersMap = new Map();
let polyline = null;

// displaying markers on the map
let request = new XMLHttpRequest();
let url = `${baseUrl}/positions?file=${fileName}`;
request.open('GET', url, true);
request.onload = function() {
    let positions = JSON.parse(this.response);
    positions.sort((a, b) => a.timestamp - b.timestamp);
    for(let pos of positions) {
        positionsMap.set(pos["_id"], pos);
        if(pos["outlier"] == true) continue;
        let infoWindow = createInfoWindow(pos);
        let marker = createMarker(pos, infoWindow);
        markersMap.set(marker, pos);
    }
    createPolyline();
    let firstPos = positionsMap.values().next();
    map.setCenter({
        lat: firstPos.value["latitude"],
        lng: firstPos.value["longitude"]
    });
    map.setZoom(25);
}
request.send();

// setting file as checked
let finishButton = document.querySelector("#finished");
finishButton.onclick = function() {
   let request = new XMLHttpRequest();
   request.open("POST", `${baseUrl}/set-done?file=${fileName}`, true);
   request.onload = function() {
       if(request.status == 200) {
           alert("File marked as finished");
           document.location.href = "./main.html";
       } else {
           alert("Some Error...");
       }

   }
   request.send();
};


function createMarker(position, infoWindow) {
    const coord = {
        lat: position.latitude,
        lng: position.longitude
    };
    let marker = new google.maps.Marker({
        position: coord,
        //label: label,
        map: map
    });

    marker.addListener("click", function() {
        infoWindow.open(map, marker);
    })

    marker.addListener("dblclick", function() {
        setOutlier(marker);
    });
    return marker;
}

//OK
function createInfoWindow(position) {
    const content = `
        <table>
        <tr><td>id:</td><td>${position["_id"]}</td></tr>
        <tr><td>timestamp:</td><td>${new Date(position["timestamp"] * 1000)}</td></tr>
        <tr><td>provide:</td><td>${position["provide"]}</td></tr>
        <tr><td>accuracy:</td><td>${position["accuracy"]}</td></tr>
        <table>
    `;
    let infoWindow = new google.maps.InfoWindow({
        content: content
    });
    return infoWindow;
}

function setOutlier(marker) {
    let position = markersMap.get(marker);
    let request = new XMLHttpRequest();
    request.open("POST", `${baseUrl}/set-fake?id=${position["_id"]}`, true);
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.onload = function() {
        if(request.status == 200) {
            marker.setMap(null);
            position["outlier"] = true;
            createPolyline();
        } else {
            alert("Some Error")
        }
    }
    request.send();
}

// OK
function createPolyline() {
    // extracting coordinates
    let coords = [];
    for(let point of positionsMap.values()) {
        if(point.outlier == true) continue;
        coords.push({
            lat: point.latitude,
            lng: point.longitude
        });
    }

    //removing old polyline
    if(polyline != null) polyline.setMap(null);

    // drawing new polyline
    polyline =  new google.maps.Polyline({path: coords});
    polyline.setMap(map);
}
