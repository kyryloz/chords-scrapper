import * as request from "request";

const BACKEND_ENDPOINT = "http://localhost:8081/api";

export default class Api {

    postSong(song) {
        console.log("Post song:", song.title);

        request.post({
            url: `${BACKEND_ENDPOINT}/songs`,
            json: true,
            body: song
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log("Post song success:", body.title);
            } else {
                console.error(error, song.title);
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
            body: {
                name: performerName
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log("Post performer success:", body.name, body.id);
                callback(body);
            } else {
                console.error("Post performer error:",
                    response.statusCode, response.body.message, performerName);
            }
        });
    }

    getPerformers(callback) {
        request.get(`${BACKEND_ENDPOINT}/performers`, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                callback(JSON.parse(body));
            } else {
                console.error("Get performers error:",
                    response.statusCode, response.body.message);
            }
        });
    }
}