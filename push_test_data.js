var request = require('request');
var fs = require("fs");
var path = require('path');
var jsonfile = require('jsonfile');

var targetDir = "./output";
var existedPerformers = [];

getPerformers(function (data) {
    existedPerformers = data;
    console.log(existedPerformers);
    processOutput();
});

function processOutput() {
    fs.readdir(targetDir, function (err, files) {
        if (err) {
            console.error("Could not list the directory", err);
            process.exit(1);
        }

        files.forEach(function (file) {
            var filePath = path.join(targetDir, file);
            var song = jsonfile.readFileSync(filePath);

            var found = existedPerformers.filter(function (performer) {
                return performer.name === song.performerName;
            });

            if (found) {
                var performer = found[0];
                song.performerId = performer.id;
                postSong(song);
            }
        })
    });
}

function postSong(song) {
    request({
        url: 'http://localhost:8081/api/songs',
        method: "POST",
        json: true,
        body: song
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Success!", song.title);
        } else {
            console.error(error, song.title);
        }
    });
}

function postPerformer(performer, callback) {
    console.log("Post performer...", performer.name);

    $.ajax({
        url: "http://localhost:8081/api/performers",
        dataType: 'json',
        type: 'POST',
        data: performer,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        success: function (data) {
            console.log("Post performer success!", data.name);
            callback(data);
        },
        error: function (xhr, status, err) {
            console.error(status, err.toString(), data.title);
        }
    });
}

function getPerformers(callback) {
    request('http://localhost:8081/api/performers', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body));
        }
    });
}
