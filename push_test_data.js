var request = require('request');
var fs = require("fs");
var path = require('path');
var jsonfile = require('jsonfile');
var async = require("async");

var targetDir = "./output";
var existedPerformers = [];

getPerformers(function (data) {
    existedPerformers = data;
    processOutput();
});

function processOutput() {
    fs.readdir(targetDir, function (err, files) {
        if (err) {
            console.error("Could not list the directory", err);
            process.exit(1);
        }

        async.reduce(files, [], function (result, file, callback) {
            var filePath = path.join(targetDir, file);
            var song = jsonfile.readFileSync(filePath);

            var found = existedPerformers.filter(function (performer) {
                return performer.name === song.performerName;
            });

            if (found.length) {
                song.performerId = found[0].id;
                result.push(song);
                callback(null, result);
            } else {
                postPerformer(song.performerName, function (performer) {
                    song.performerId = performer.id;
                    result.push(song);
                    callback(null, result);
                });
            }
        }, function(err, result) {
            if (!err) {
                result.forEach(function (song) {
                    postSong(song);
                })
            } else {
                console.error(err);
            }
        });
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
    console.log("Post performer...", performer);

    request({
        url: 'http://localhost:8081/api/performers',
        method: "POST",
        json: true,
        body: {
            name: performer
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Post performer success!", body.name, body.id);
            existedPerformers.push(body);
            callback(body);
        } else {
            console.error(error, performer);
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

function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}
