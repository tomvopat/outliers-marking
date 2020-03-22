"use strict";

let mongoose = require("mongoose");
let locationSchema = mongoose.Schema({
    file: String,
    timestamp: Number,
    provide: String,
    longitude: Number,
    latitude: Number,
    accuracy: Number,
    outlier: Boolean
}, {
    collection: "locations"
});

let Location = mongoose.model("Location", locationSchema);

module.exports = Location;
