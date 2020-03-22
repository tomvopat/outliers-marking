// importing modules
let express = require("express");
let bodyParser = require("body-parser");
let path = require("path");
let mongoose = require("mongoose");

// importing models
let Location = require("./models/location.js");
let File = require("./models/file.js");

// constants
const PORT = 3000;

// initialize express app
const app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))

// connect to DB
const uri = "mongodb://localhost:27017/outliers";
mongoose.connect(uri, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// REST API

// retrieving all positions from given file
app.get("/positions", function(req, res, next) {
    const file = req.query["file"];
    Location.find({file: file}, function(err, result) {
        if(err) {
            console.log("err: " + err);
            res.json([]);
        } else {
            res.json(result);
        }
    })
});

// get all files
app.get("/files", function(req, res, next) {
    File.find(function(err, result) {
        if(err) {
            console.log(err);
            res.json([]);
        } else {
            res.json(result);
        }
    });
});

// get file by name
app.get("/file", function(req, res, next) {
    const name = req.query["name"];
    File.findOne({name: name}, function(err, result) {
        if(err) {
            console.log(err);
            res.json([]);
        } else {
            res.json(result);
        }
    });
});

app.get("/files-outliercount", function(req, res, next) {
    Location.aggregate([
        {$match: {outlier: true}},
        {$group: {
            _id: "$file",
            count: {$sum: 1}
        }},
        {$project: {
            "_id": false,
            "name": "$_id",
            "count": true
        }}
    ]).exec(function(err, doc) {
        if(err) {
            console.log("err: " + err);
            res.json([]);
        } else {
            res.json(doc);
        }
    });
});

// set given position to be outlier {id: pointId}
app.post("/set-fake", function(req, res) {
    const id = req.query["id"];
    const outlier = req.body["outlier"];
    if(outlier == undefined) {
        console.log("missing body")
        res.status(404);
        return;
    }
    Location.findByIdAndUpdate(id, {$set: {outlier: outlier}}, {new: true}, function(err, doc) {
        if(err) {
            console.log("err: " + err);
            res.json({});
        } else {
            res.json(doc);
        }
    });
});

// set given files as checked {file: fileName}
app.post("/set-checked", function(req, res) {
    const file = req.query["file"];
    const checked = req.body["checked"];
    if(checked == undefined) {
        console.log("err: done undefined")
        res.status(404);
        return;
    }
    File.findOneAndUpdate({name: file}, {$set: {checked: checked}}, {new: true}, function(err, doc) {
        if(err) {
            console.log("err: " + err);
            res.json({});
        } else {
            res.json(doc);
        }
    });
});

// start app

app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}.`)
});
