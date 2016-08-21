import cheerio from "cheerio";

export default class DomParser {

    constructor() {
        this.id = 0;
    }

    getLinks(html) {
        const $ = cheerio.load(html);

        const links = [];

        $('#tablesort a')
            .each(function () {
                var data = $(this);
                links.push(data.attr("href"));
            });

        return links;
    }

    getSong(html) {
        const $ = cheerio.load(html);

        var songDiv = $('.b-podbor');

        const title = songDiv.find("h1").text();
        const lyrics = songDiv.find(".b-podbor__text").text();
        const titleAndPerformer = title.replace(", аккорды", "").split("-");

        return {
            id: this.id++,
            performerName: titleAndPerformer[0].trim(),
            title: titleAndPerformer[1].trim(),
            lyrics: lyrics
        };
    }
}