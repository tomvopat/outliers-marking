"use strict";

let mongoose = require("mongoose");
let fileSchema = mongoose.Schema({
    name: String,
    checked: Boolean
}, {
    collection: "files"
});

let File = mongoose.model("File", fileSchema);

module.exports = File;
