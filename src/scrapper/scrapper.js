import jsonfile from "jsonfile";
import request from "request";
import DomParser from "./dom-parser";
import async from "async";

const SCRAP_URL = 'http://amdm.ru/akkordi/metallica/';
const REQUEST_RATE_MS = 300;
const TOO_MANY_REQUESTS_TIMEOUT_MS = 30000;
const TARGET_DIR = "output";
const DOM_PARSER = new DomParser;

request(SCRAP_URL, (error, response, html) => {
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
                    console.error(err, "Failed to process link:", link);
                    callback(err);
                }
            });
        }, REQUEST_RATE_MS);
    }, 1);

    performerSongLinks.forEach(link => asyncQueue.push(link, (err, result) => err || save(result)));

    asyncQueue.drain = () => console.log("All done!");
});

function scrapSong(songHref, callback) {
    request(`http:${songHref}`, (error, response, html) => {

        const extractSong = () => {
            const song = DOM_PARSER.getSong(html);

            if (song) {
                callback(null, song);
            } else {
                callback("Can't scrap song");
            }
        };

        if (!error) {

            if (response.statusCode === 200) {
                extractSong();
            } else if (response.statusCode === 429) {
                // too many requests, so wait a little
                console.warn("Too many requests, wait 30 sec");
                setTimeout(() => extractSong(), TOO_MANY_REQUESTS_TIMEOUT_MS);
            }
        } else {
            callback(error);
        }
    });
}

function save(song) {
    var fileName = `${TARGET_DIR}/${song.title}.json`;
    jsonfile.writeFile(fileName, song, err => {
        if (!err) {
            console.log('File successfully written:', fileName);
        } else {
            console.error('Error while writing file:', fileName);
        }
    });
}