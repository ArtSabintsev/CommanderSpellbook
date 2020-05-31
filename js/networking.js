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
                combo.colorIdentityImages = replaceColorIdentityWithImageSources(combos[c][15]);
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
            return `<a href="https://deckbox.org/mtg/${e}">${e}</a>`;
        });
    }

    function splitDescription(desc) {
        return desc.split(".");
    }

    function replaceColorIdentityWithImageSources(identity) {
        var colors = identity.split(",");
        let imagePaths = {
            "white": '<img src="images/mana/manaw.png" width="40" alt="white">',
            "blue": '<img src="images/mana/manau.png" width="40" alt="blue">',
            "black": '<img src="images/mana/manab.png" width="40" alt="black">',
            "red": '<img src="images/mana/manar.png" width="40" alt="red">',
            "green": '<img src="images/mana/manag.png" width="40" alt="green">'
        };

        return colors.map(function (color) {
            return imagePaths[color];
        });
    }

    function storeData(data) {
        const tableBody = document.getElementById('combos');
        data.map(function (combo) {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            const td4 = document.createElement('td');
            td1.innerHTML = `<ol>${combo.cardLinks.map(e => `<li>${e}</li>`)}<ol>`;
            td2.innerHTML = combo.colorIdentityImages;
            td3.innerHTML = `<ol>${combo.boardState.map(e => `<li>${e}</li>`)}<ol>`;
            td4.innerHTML = `<ol>${combo.description.map(e => `<li>${e}</li>`)}<ol>`;

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tableBody.appendChild(tr);
        });
    }

})();