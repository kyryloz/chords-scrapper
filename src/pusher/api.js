import * as request from "request";

const BACKEND_ENDPOINT = "http://localhost:8081/api";
const authBearer = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiS2lyaWxsIFphcHlsYXlldiIsImlkIjo1LCJleHAiOjE0NzkwMTAwOTAsImlhdCI6MTQ3MzAxMDA5MCwiZW1haWwiOiJ6YXB5bGFldkBnbWFpbC5jb20ifQ.0BYvBazmnzXJ9eFQ-7pSXf2F80XikqmrLm-du0-qmwg";

export default class Api {

    postSong(song) {
        console.log("Post song:", song.title);

        request.post({
            url: `${BACKEND_ENDPOINT}/songs`,
            json: true,
            body: song,
            headers: {
                "Authorization" : authBearer
            }
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode == 200) {
                    console.log("Post song success:", body.title);
                } else {
                    console.error(body);
                }
            } else {
                console.error("Post song error:",
                    response.statusCode, response.body.message, song.title);
            }
        });
    }

    postPerformer(performerName, callback) {
        console.log("Post performer:", performerName);

        request.post({
            url: `${BACKEND_ENDPOINT}/performers`,
            json: true,
            headers: {
                "Authorization" : authBearer
            },
            body: {
                name: performerName
            }
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode == 200) {
                    console.log("Post performer success:", body.name, body.id);
                    callback(null, body);
                } else {
                    callback(body);
                }
            } else {
                callback(error);
                console.error("Post performer error:",
                    response.statusCode, response.body.message, performerName);
            }
        });
    }

    getPerformers(callback) {
        request.get({
            url: `${BACKEND_ENDPOINT}/performers`,
            json: true,
            headers: {
                "Authorization" : authBearer
            }
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode == 200) {
                    callback(null, body.content);
                } else {
                    callback(body);
                }
            } else {
                callback(error);
            }
        });
    }

    getPerformerByName(name, callback) {
        request.get({
            url: `${BACKEND_ENDPOINT}/performers/search/${name}`,
            json: true,
            headers: {
                "Authorization" : authBearer
            }
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode == 200) {
                    callback(null, body);
                } else {
                    callback(404);
                }
            } else {
                callback(error);
            }
        });
    }

    postSongs(songs) {
        console.log("Post songs, amount:", songs.length);

        request.post({
            url: `${BACKEND_ENDPOINT}/songs/batch`,
            json: true,
            body: songs,
            headers: {
                "Authorization" : authBearer
            }
        }, (error, response, body) => {
            if (!error) {
                if (response.statusCode == 200) {
                    console.log("Post songs success, amount created:", body.length);
                } else {
                    console.error(body);
                }
            } else {
                console.error("Post songs error:", response.statusCode, response.body.message);
            }
        });
    }
}