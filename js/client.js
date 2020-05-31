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

        updateSearchInputWithComboCount(data);
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

    function replaceColorIdentityWithImageSources(identity) {
        if (isBlank(identity)) {
            return identity;
        } else {
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
    }

    function splitText(description) {
        if (isBlank(description)) {
            return description;
        } else {
            const replacementChar = "|||";

            var desc = description.replace(/\./g, replacementChar);

            desc = replaceTextWithManaImages(desc);

            return desc.trim().split(replacementChar).filter(t => t.length > 0);
        }
    }

    function updateSearchInputWithComboCount(data) {
        const searchInput =  document.getElementById('card-input');
        searchInput.setAttribute('placeholder', `Search ${data.length} combos by typing in a Magic Card...`);
        
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
            tdBoardState.innerHTML = `<ul>${combo.boardState.map(e => `<li>${e}</li>`).join('')}<ul>`;
            tdDescription.innerHTML = `<ol>${combo.description.map(e => `<li>${e}</li>`).join('')}<ol>`;
            tdResult.innerHTML = `<ul>${combo.result.map(e => `<li>${e}</li>`).join('')}<ul>`;

            tr.appendChild(tdCardLinks);
            tr.appendChild(tdColorIdentity);
            tr.appendChild(tdBoardState);
            tr.appendChild(tdDescription);
            tr.appendChild(tdResult);

            tableBody.appendChild(tr);
        });
    }

    /* Helper Functions */

    function isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    function replaceTextWithManaImages(text) {
        const width = 20;
        text = text.replace(/:manaw:/g, `<img src="images/mana/manaw.png" width="${width}" alt="white">`);
        text = text.replace(/:manau:/g, `<img src="images/mana/manau.png" width="${width}" alt="blue">`);
        text = text.replace(/:manab:/g, `<img src="images/mana/manab.png" width="${width}" alt="black">`);
        text = text.replace(/:manar:/g, `<img src="images/mana/manar.png" width="${width}" alt="red">`);
        text = text.replace(/:manag:/g, `<img src="images/mana/manag.png" width="${width}" alt="green">`);
        text = text.replace(/:manac:/g, `<img src="images/mana/manac.png" width="${width}" alt="colorless mana">`);
        text = text.replace(/:manabg:/g, `<img src="images/mana/manabg.png" width="${width}" alt="golgarai mana">`);
        text = text.replace(/:manabr:/g, `<img src="images/mana/manabr.png" width="${width}" alt="rakdos mana">`);
        text = text.replace(/:managu:/g, `<img src="images/mana/managu.png" width="${width}" alt="simic mana">`);
        text = text.replace(/:managw:/g, `<img src="images/mana/managw.png" width="${width}" alt="selesnya mana">`);
        text = text.replace(/:manarg:/g, `<img src="images/mana/manarg.png" width="${width}" alt="gruul mana">`);
        text = text.replace(/:manarw:/g, `<img src="images/mana/manarw.png" width="${width}" alt="boros mana">`);
        text = text.replace(/:manaub:/g, `<img src="images/mana/manaub.png" width="${width}" alt="dimir mana">`);
        text = text.replace(/:manaur:/g, `<img src="images/mana/manaur.png" width="${width}" alt="izzet mana">`);
        text = text.replace(/:manawb:/g, `<img src="images/mana/manawb.png" width="${width}" alt="orzhov mana">`);
        text = text.replace(/:manawu:/g, `<img src="images/mana/manawu.png" width="${width}" alt="azorius mana">`);
        text = text.replace(/:mana1:/g, `<img src="images/mana/mana1.png" width="${width}" alt="1 mana">`);
        text = text.replace(/:mana2:/g, `<img src="images/mana/mana2.png" width="${width}" alt="2 mana">`);
        text = text.replace(/:mana3:/g, `<img src="images/mana/mana3.png" width="${width}" alt="3 mana">`);
        text = text.replace(/:mana4:/g, `<img src="images/mana/mana3.png" width="${width}" alt="4 mana">`);
        text = text.replace(/:mana5:/g, `<img src="images/mana/mana3.png" width="${width}" alt="5 mana">`);
        text = text.replace(/:mana6:/g, `<img src="images/mana/mana3.png" width="${width}" alt="6 mana">`);
        text = text.replace(/:mana7:/g, `<img src="images/mana/mana3.png" width="${width}" alt="7 mana">`);
        text = text.replace(/:mana8:/g, `<img src="images/mana/mana3.png" width="${width}" alt="8 mana">`);
        text = text.replace(/:mana9:/g, `<img src="images/mana/mana3.png" width="${width}" alt="9 mana">`);
        text = text.replace(/:mana10:/g, `<img src="images/mana/mana3.png" width="${width}" alt="10 mana">`);
        text = text.replace(/:mana11:/g, `<img src="images/mana/mana3.png" width="${width}" alt="11 mana">`);
        text = text.replace(/:mana12:/g, `<img src="images/mana/mana3.png" width="${width}" alt="12 mana">`);
        text = text.replace(/:mana13:/g, `<img src="images/mana/mana3.png" width="${width}" alt="13 mana">`);
        text = text.replace(/:mana14:/g, `<img src="images/mana/mana3.png" width="${width}" alt="14 mana">`);
        text = text.replace(/:mana15:/g, `<img src="images/mana/mana3.png" width="${width}" alt="15 mana">`);
        text = text.replace(/:mana16:/g, `<img src="images/mana/mana3.png" width="${width}" alt="16 mana">`);
        text = text.replace(/:mana20:/g, `<img src="images/mana/mana3.png" width="${width}" alt="20 mana">`);

        return text;
    }

})();