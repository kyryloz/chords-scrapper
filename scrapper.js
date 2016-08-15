"use strict";

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

var url = 'http://amdm.ru/akkordi/metallica/';

request(url, function (error, response, html) {

    if (!error) {
        var $ = cheerio.load(html);

        var resultPromises = [];

        $('#tablesort a')
            .slice(0, 40)
            .each(function () {
                var data = $(this);
                var songUrl = data.attr("href");
                resultPromises.push(scrapSong(songUrl));
            });

        Promise.all(resultPromises).then(function(result) {
            save(result);
        }, function(err) {
            console.error("Failed to fetch some item", err);
        });

    } else {
        console.error(error);
    }
});

var id = 0;

var scrapSong = function (songHref) {
    return new Promise(function (fulfill, reject) {
        request("http:" + songHref, function (error, response, html) {
            if (!error) {
                var $ = cheerio.load(html);

                $('.b-podbor').each(function () {
                    var data = $(this);

                    var title = data.find("h1").text();
                    var lyrics = data.find(".b-podbor__text").text();

                    fulfill({
                        id: id++,
                        title: title.replace(", аккорды", ""),
                        lyrics: lyrics
                    });
                });
            } else {
                reject(error);
            }
        });
    });
};

var save = function (result) {
    var dir = "./output";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    console.log("Saving...");

    result.forEach(function (song) {
        var fileName = song.title;
        fs.writeFile(dir + "/" + fileName + ".json", JSON.stringify(song, null, 4), function (err) {
            if (!err) {
                console.log('File successfully written!', song.title);
            } else {
                console.error('Error while writing result', song.title, err);
            }
        });
    });
};