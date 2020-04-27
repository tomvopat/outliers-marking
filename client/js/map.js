"use strict";

const baseUrl = "http://localhost:3000";

let urlParams = new URLSearchParams(document.location.search);
let fileName = urlParams.get("file");

// global vars
let center_pos = {
    lat: 60.192059,
    lng: 24.945831
};

let map = new google.maps.Map(
    document.getElementById('map'),
    {
        center: center_pos,
        zoom: 8,
        scaleControl: true
    }
);

let file = null;
let positionsMap = new Map();
let markersMap = new Map();
let circleMap = new Map();
let polyline = null;

// setting controls
let currentFile = document.querySelector("#file-caption");
let checkedButton = document.querySelector("#checked-button");
checkedButton.onclick = function() {
    if(file === null) return;
    setChecked(! file["checked"]);
};

let request = new XMLHttpRequest();
request.open("GET", `${baseUrl}/file?name=${fileName}`);
request.onload = function() {
    if(request.status == 200) {
        file = JSON.parse(this.response);
        currentFile.innerHTML = file["name"];
        checkedButton.removeAttribute("disabled");
        switchButton(checkedButton, !file["checked"])
        displayMarkers(file);
    } else {
        alert("File not found.");
    }
};
request.send();


//-----------------------------------------------------
//-----------------------------------------------------

function fileNotFound() {
    // TODO
}

function setChecked(status) {
    if(status == undefined) return;

    let request = new XMLHttpRequest();
    console.log(file["name"]);
    request.open("POST", `${baseUrl}/set-checked?file=${file["name"]}`, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onload = function() {
        if(request.status == 200) {
            file["checked"] = status;
            switchButton(checkedButton, !status);
        } else {
            alert("Some Error...");
        }

    }
    request.send(JSON.stringify({checked: status}));
}

function switchButton(button, positive) {
    if(positive === true) {
        button.setAttribute("class", "btn btn-outline-success");
        button.innerHTML = 'Mark Checked';
    } else {
        button.setAttribute("class", "btn btn-outline-danger");
        button.innerHTML = 'Mark Unchecked';
    }
}

function displayMarkers(file) {
    let request = new XMLHttpRequest();
    let url = `${baseUrl}/positions?file=${file["name"]}`;
    request.open('GET', url, true);
    request.onload = function() {
        let positions = JSON.parse(this.response);
        positions.sort((a, b) => a.timestamp - b.timestamp);
        for(let pos of positions) {
            positionsMap.set(pos["_id"], pos);
            let infoWindow = createInfoWindow(pos);
            let marker = createMarker(pos, infoWindow);
            markersMap.set(marker, pos);
            let circle = createCircle(pos);
            circleMap.set(circle, pos);
        }
        createPolyline();
        let firstPos = positionsMap.values().next();
        map.setCenter({
            lat: firstPos.value["latitude"],
            lng: firstPos.value["longitude"]
        });
        map.setZoom(15);
    }
    request.send();
}

function createMarker(pos, infoWindow) {
    const coord = {
        lat: pos.latitude,
        lng: pos.longitude
    };
    let icon = pos["outlier"] ? 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' : undefined;
    let marker = new google.maps.Marker({
        position: coord,
        //label: label,
        map: map,
        icon: icon
    });

    marker.addListener("click", function() {
        infoWindow.open(map, marker);
    })

    marker.addListener("dblclick", function() {
        setOutlier(marker);
    });
    return marker;
}

function createCircle(pos) {
    const coord = {
        lat: pos.latitude,
        lng: pos.longitude
    };

    return new google.maps.Circle ({
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "grey",
        fillOpacity: .3,
        radius: Math.pow(pos.accuracy / 150, 2),
        strokeColor: "white",
        strokeWeight: .7,
        map: map,
        center: coord
    });
}

function createInfoWindow(position) {
    const content = `
        <table>
        <tr><th>id:</th><td>${position["_id"]}</td></tr>
        <tr><th>timestamp:</th><td>${new Date(position["timestamp"] * 1000)}</td></tr>
        <tr><th>provide:</th><td>${position["provide"]}</td></tr>
        <tr><th>accuracy:</th><td>${position["accuracy"]}</td></tr>
        <tr><th>outlier:</th><td>${position["outlier"]}</td></tr>
        <table>
    `;
    let infoWindow = new google.maps.InfoWindow({
        content: content
    });
    return infoWindow;
}

function setOutlier(marker) {
    let pos = markersMap.get(marker);
    let request = new XMLHttpRequest();
    request.open("POST", `${baseUrl}/set-fake?id=${pos["_id"]}`, true);
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.onload = function() {
        if(request.status == 200) {
            pos["outlier"] = !pos["outlier"];
            let newInfoWindow = createInfoWindow(pos);
            let newMarker = createMarker(pos, newInfoWindow);
            marker.setMap(null);
            markersMap.delete(pos);
            markersMap.set(newMarker, pos);
            createPolyline();
        } else {
            alert("Some Error")
        }
    }
    request.send(JSON.stringify({outlier: !pos["outlier"]}));
}

function createPolyline() {
    // extracting coordinates
    let coords = [];
    for(let point of positionsMap.values()) {
        if(point["outlier"] == true) continue;
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
