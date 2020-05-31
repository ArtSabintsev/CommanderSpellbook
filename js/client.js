(function () {
    "use strict";

    window.addEventListener("load", fetchDataFromGoogleSheets);

    function fetchDataFromGoogleSheets() {
        const url = "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:P&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E";

        var request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send(null);

        const response = request.responseText;
        const parsed_response = JSON.parse(response);

        var data = [];
        const combos = parsed_response.valueRanges[0].values;
        for (let c in combos) {
            const combo = [];
            combo.cardLinks = replaceCardNamesWithLinks(combos[c].slice(0, 10));
            combo.colorIdentityImages = replaceColorIdentityWithImageSources(combos[c][10]);
            combo.boardState = splitText(combos[c][11]);
            combo.description = splitText(combos[c][12]);
            combo.result = splitText(combos[c][13]);
            data.push(combo);
        }

        storeData(data);
    }

    function replaceCardNamesWithLinks(cardNames) {
        var names = cardNames.filter(function (e) {
            return e != "";
        });

        return names.map(function (e) {
            return `<a href="https://deckbox.org/mtg/${e}">${e}</a>`;
        });
    }

    function splitText(description) {
        const replacementChar = "|||";
        var desc = description.replace(/\./g, replacementChar);

        const width = 20;
        desc = desc.replace(/:manaw:/g, `<img src="images/mana/manaw.png" width="${width}" alt="white">`);
        desc = desc.replace(/:manau:/g, `<img src="images/mana/manau.png" width="${width}" alt="blue">`);
        desc = desc.replace(/:manab:/g, `<img src="images/mana/manab.png" width="${width}" alt="black">`);
        desc = desc.replace(/:manar:/g, `<img src="images/mana/manar.png" width="${width}" alt="red">`);
        desc = desc.replace(/:manag:/g, `<img src="images/mana/manag.png" width="${width}" alt="green">`);
        desc = desc.replace(/:manac:/g, `<img src="images/mana/manac.png" width="${width}" alt="colorless">`);
        desc = desc.replace(/:mana1:/g, `<img src="images/mana/mana1.png" width="${width}" alt="1 mana">`);
        desc = desc.replace(/:mana2:/g, `<img src="images/mana/mana2.png" width="${width}" alt="2 mana">`);
        desc = desc.replace(/:mana3:/g, `<img src="images/mana/mana3.png" width="${width}" alt="3 mana">`);
        desc = desc.replace(/:mana4:/g, `<img src="images/mana/mana3.png" width="${width}" alt="4 mana">`);
        desc = desc.replace(/:mana5:/g, `<img src="images/mana/mana3.png" width="${width}" alt="5 mana">`);
        desc = desc.replace(/:mana6:/g, `<img src="images/mana/mana3.png" width="${width}" alt="6 mana">`);
        desc = desc.replace(/:mana7:/g, `<img src="images/mana/mana3.png" width="${width}" alt="7 mana">`);
        desc = desc.replace(/:mana8:/g, `<img src="images/mana/mana3.png" width="${width}" alt="8 mana">`);
        desc = desc.replace(/:mana9:/g, `<img src="images/mana/mana3.png" width="${width}" alt="9 mana">`);
        desc = desc.replace(/:mana10:/g, `<img src="images/mana/mana3.png" width="${width}" alt="10 mana">`);
        desc = desc.replace(/:mana11:/g, `<img src="images/mana/mana3.png" width="${width}" alt="11 mana">`);
        desc = desc.replace(/:mana12:/g, `<img src="images/mana/mana3.png" width="${width}" alt="12 mana">`);
        desc = desc.replace(/:mana13:/g, `<img src="images/mana/mana3.png" width="${width}" alt="13 mana">`);
        desc = desc.replace(/:mana14:/g, `<img src="images/mana/mana3.png" width="${width}" alt="14 mana">`);
        desc = desc.replace(/:mana15:/g, `<img src="images/mana/mana3.png" width="${width}" alt="15 mana">`);
        desc = desc.replace(/:mana16:/g, `<img src="images/mana/mana3.png" width="${width}" alt="16 mana">`);
        desc = desc.replace(/:mana20:/g, `<img src="images/mana/mana3.png" width="${width}" alt="20 mana">`);

        return desc.split(replacementChar).filter(t => t.length > 0);
    }

    function replaceColorIdentityWithImageSources(identity) {
        const colors = identity.split(",");
        const imagePaths = {
            "w": '<img src="images/mana/manaw.png" width="40" alt="white">',
            "u": '<img src="images/mana/manau.png" width="40" alt="blue">',
            "b": '<img src="images/mana/manab.png" width="40" alt="black">',
            "r": '<img src="images/mana/manar.png" width="40" alt="red">',
            "g": '<img src="images/mana/manag.png" width="40" alt="green">',
            "c": '<img src="images/mana/manac.png" width="40" alt="colorless">'
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
            const tdBoardState = document.createElement('td');
            const tdDescription = document.createElement('td');
            const tdResult = document.createElement('td');

            tdCardLinks.innerHTML = `<ol>${combo.cardLinks.map(e => `<li>${e}</li>`).join('')}<ol>`;
            tdColorIdentity.innerHTML = `<center>${combo.colorIdentityImages.join('')}</center>`;
            tdBoardState.innerHTML = `<ul>${combo.boardState.map(e => `<li>${e.trim()}</li>`).join('')}<ul>`;
            tdDescription.innerHTML = `<ol>${combo.description.map(e => `<li>${e.trim()}</li>`).join('')}<ol>`;
            tdResult.innerHTML = `<ul>${combo.result.map(e => `<li>${e.trim()}</li>`).join('')}<ul>`;

            tr.appendChild(tdCardLinks);
            tr.appendChild(tdColorIdentity);
            tr.appendChild(tdBoardState);
            tr.appendChild(tdDescription);
            tr.appendChild(tdResult);

            tableBody.appendChild(tr);
        });
    }

})();