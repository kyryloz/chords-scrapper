var request = require('request');
var fs = require("fs");
var path = require('path');
var jsonfile = require('jsonfile');
var sync = require('sync');

var targetDir = "./output";
var existedPerformers = [];
var postedPerformers = [];

getPerformers(function (data) {
    existedPerformers = data;
    console.log(existedPerformers);
    processOutput();
});

var bindPerformerIdAndPostSong = function (existedPerformer, song) {
    song.performerId = existedPerformer.id;
    postSong(song);
};

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

            console.log("Process song", song.title);

            if (found.length) {
                bindPerformerIdAndPostSong(found[0], song);
            } else {
                if (contains(postedPerformers, song.performerName)) {
                    console.log("yes");
                    bindPerformerIdAndPostSong(found[0], song);
                } else {
                    console.log("no");

                    console.log("sync start");

                    sync(function() {
                        var result = postPerformer.sync(null, song.performerName, bindPerformerIdAndPostSong, song);
                        console.log(result);
                    });

                    console.log("sync end");

                }
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
    postedPerformers.push(performer);
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
            callback(null, body);
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
