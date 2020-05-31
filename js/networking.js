(function () {
    "use strict";

    const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet";
    const BLUE = "?ranges=blue!A2:P";
    const SULTAI = "&ranges=sultai!A2:P";
    const KEY = "&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E";

    let database;

    window.addEventListener("load", fetchDataFromGoogleSheets);

    function fetchDataFromGoogleSheets() {
        let url = BASE_URL + BLUE + SULTAI + KEY;

        var request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send(null);

        let response = request.responseText;
        let parsed_response = JSON.parse(response);

        let data = [];
        let sheets = parsed_response.valueRanges;
        for (let s in sheets) {
            let combos = sheets[s].values;
            for (let c in combos) {
                let combo = [];
                combo.cardLinks = replaceCardNamesWithLinks(combos[c].slice(0, 10));
                combo.colorIdentityImages = replaceColorIdentityWithImagePaths(combos[c][15]);
                combo.boardState = splitDescription(combos[c][10]);
                combo.description = splitDescription(combos[c][14]);
                data.push(combo);
            }
        }

        storeData(data);
    }

    function replaceCardNamesWithLinks(names) {
        let cards = names.filter(function (e) {
            return e != "";
        });

        return cards.map(function (e) {
            return '<a href="https://deckbox.org/mtg/" + e>e</a>';
        });
    }

    function splitDescription(desc) {
        return desc.split(".");
    }

    function replaceColorIdentityWithImagePaths(identity) {
        var colors = identity.split(",");
        let imagePaths = {
            "white": "images/mana/manaw.png",
            "blue": "images/mana/manau.png",
            "black": "images/mana/manab.png",
            "red": "images/mana/manar.png",
            "green": "images/mana/manag.png"
        };

        return colors.map(function (color) {
            return imagePaths[color];
        });
    }

    function storeData(data) {
        for (i in data) {
            let entryRow = document.createElement("tr");
        }
    }

})();