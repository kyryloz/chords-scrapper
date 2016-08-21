"use strict";

import fs from "fs";
import path from "path";
import jsonfile from "jsonfile";
import async from "async";
import Api from "./api";

const GENERATE_RANDOM_NAMES = true;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SOURCE_DIRECTORY = "./output";
const STORED_PERFORMERS = [];
const API = new Api;

API.getPerformers(data => {
    STORED_PERFORMERS.push(...data);
    processOutput();
});

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

            var found = STORED_PERFORMERS.filter(performer => {
                return performer.name === song.performerName;
            });

            if (found.length) {
                song.performerId = found[0].id;
                result.push(song);
                callback(null, result);
            } else {
                API.postPerformer(song.performerName, performer => {
                    STORED_PERFORMERS.push(performer);

                    song.performerId = performer.id;

                    result.push(song);
                    callback(null, result);
                });
            }
        }, (err, result) => {
            if (!err) {
                result.forEach(song => API.postSong(song));
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