import fs from "fs";
import path from "path";
import jsonfile from "jsonfile";
import async from "async";
import Api from "./api";

const GENERATE_RANDOM_NAMES = true;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SOURCE_DIRECTORY = "./output";
const API = new Api;

processOutput();

function processOutput() {
    fs.readdir(SOURCE_DIRECTORY, function (err, files) {
        if (err) {
            console.error("Could not list the directory", err);
            process.exit(1);
        }

        async.reduce(files, [], (result, file, callback) => {
            var filePath = path.join(SOURCE_DIRECTORY, file);
            var song = jsonfile.readFileSync(filePath);

            if (GENERATE_RANDOM_NAMES) {
                song.performerName = appendRandomChar(song.performerName);
            }

            function pushResult(performer) {
                song.performerId = performer.id;
                result.push(song);
                callback(null, result);
            }

            API.getPerformerByName(song.performerName, (err, performer) => {
                if (!err) {
                    pushResult(performer);
                } else {
                    if (err === 404) {
                        console.log(`Performer with name ${song.performerName} not found, create new`);
                        API.postPerformer(song.performerName, (err, performer) => {
                            if (!err) {
                                pushResult(performer);
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        callback(err);
                    }
                }
            });
        }, (err, result) => {
            if (!err) {
                API.postSongs(result);
            } else {
                console.error(err);
            }
        });
    });
}

function appendRandomChar(performerName) {
    var char = ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    return char + "_" + performerName;
}