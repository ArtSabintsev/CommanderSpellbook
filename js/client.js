(function () {
    "use strict";

    const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet";
    const BLUE = "?ranges=blue!A2:P";
    const SULTAI = "&ranges=sultai!A2:P";
    const KEY = "&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E";

    window.addEventListener("load", fetchDataFromGoogleSheets);

    function fetchDataFromGoogleSheets() {
        const url = BASE_URL + BLUE + SULTAI + KEY;

        var request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send(null);

        const response = request.responseText;
        const parsed_response = JSON.parse(response);

        var data = [];
        const sheets = parsed_response.valueRanges;
        for (let s in sheets) {
            const combos = sheets[s].values;
            for (let c in combos) {
                const combo = [];
                combo.cardLinks = replaceCardNamesWithLinks(combos[c].slice(0, 10));
                combo.nicknames = combos[c][11].split(',');
                combo.tutorial = replaceTutorialWithLink(combos[c][12]);
                combo.colorIdentityImages = replaceColorIdentityWithImageSources(combos[c][15]);
                combo.boardState = splitDescription(combos[c][10]);
                combo.description = splitDescription(combos[c][14]);
                combo.result = splitDescription(combos[c][13]);
                data.push(combo);
            }
        }

        storeData(data);
    }

    function replaceCardNamesWithLinks(names) {
        var cards = names.filter(function (e) {
            return e != "";
        });

        return cards.map(function (e) {
            return `<a href="https://deckbox.org/mtg/${e}">${e}</a>`;
        });
    }

    function replaceTutorialWithLink(tutorial) {
        if (tutorial != "") {
         return `<a href="${tutorial}">Tutorial</a>`;
        } else {
            return "N/A";
        }
    }

    function splitDescription(desc) {
        return desc.split(".").filter(t => t.length > 0);
    }

    function replaceColorIdentityWithImageSources(identity) {
        const colors = identity.split(",");
        const imagePaths = {
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
            const tdCardLinks = document.createElement('td');
            const tdColorIdentity = document.createElement('td');
            const tdNicknames = document.createElement('td');
            const tdTutorial = document.createElement('td');
            const tdBoardState = document.createElement('td');
            const tdDescription = document.createElement('td');
            const tdResult = document.createElement('td');

            tdCardLinks.innerHTML = `<ol>${combo.cardLinks.map(e => `<li>${e}</li>`).join('')}<ol>`;
            tdColorIdentity.innerHTML = `<center>${combo.colorIdentityImages.join('')}</center>`;
            tdTutorial.innerHTML = `${combo.tutorial}`;
            tdNicknames.innerHTML = `<ul>${combo.nicknames.map(e => `<li>${e}</li>`).join('')}<ul>`;
            tdBoardState.innerHTML = `<ul>${combo.boardState.map(e => `<li>${e}</li>`).join('')}<ul>`;
            tdDescription.innerHTML = `<ol>${combo.description.map(e => `<li>${e}</li>`).join('')}<ol>`;
            tdResult.innerHTML = `<ul>${combo.result.map(e => `<li>${e}</li>`).join('')}<ul>`;

            tr.appendChild(tdCardLinks);
            tr.appendChild(tdColorIdentity);
            tr.appendChild(tdNicknames);
            tr.appendChild(tdTutorial);
            tr.appendChild(tdBoardState);
            tr.appendChild(tdDescription);
            tr.appendChild(tdResult);

            tableBody.appendChild(tr);
        });
    }

})();