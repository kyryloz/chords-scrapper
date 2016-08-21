import jsonfile from "jsonfile";
import request from "request";
import DomParser from "./dom-parser";
import async from "async";

const SCRAP_URL = 'http://amdm.ru/akkordi/metallica/';
const TARGET_DIR = "output";
const DOM_PARSER = new DomParser;

request(SCRAP_URL, function (error, response, html) {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    const performerSongLinks = DOM_PARSER.getLinks(html);

    var asyncQueue = async.queue((link, callback) => {
        console.log("Process:", link);
        setTimeout(() => {
            scrapSong(link, function(err, result) {
                if (!err) {
                    callback(null, result);
                } else {
                    console.log("Failed to process link:", link);
                }
            });
        }, 200);
    }, 1);

    performerSongLinks.forEach(link => asyncQueue.push(link, (err, result) => err || save(result)));

    asyncQueue.drain = () => console.log("All done!");
});

var scrapSong = function (songHref, callback) {
    request(`http:${songHref}`, function (error, response, html) {
        if (!error) {
            const song = DOM_PARSER.getSong(html);
            callback(null, song);
        } else {
            callback(error);
        }
    });
};

var save = function (song) {
    var fileName = `${TARGET_DIR}/${song.title}.json`;
    jsonfile.writeFile(fileName, song, function (err) {
        if (!err) {
            console.log('File successfully written:', fileName);
        } else {
            console.error('Error while writing file:', fileName);
        }
    });
};