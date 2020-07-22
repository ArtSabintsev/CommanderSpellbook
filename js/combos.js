const url = 'https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:O&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E';

let cachedCombos = {};
let cachedSheets = void 0;

$.getJSON(url, function (data) {
    cachedSheets = data.valueRanges[0].values;
});


/** API Request **/
function fetchDataFromGoogleSheets() {
    let query = document.getElementById("card-input").value;

    if (query.length < 3) {
        return;
    }

    if (cachedCombos[query]) {
        updateTableWithCombos(cachedCombos[query]);
        return;
    }

    parseCombos(cachedSheets, query);
}

/** Parsing Functions **/

function parseCombos(combos, query) {
    var comboData = [];
    for (let c in combos) {
        const combo = [];

        // Fixes Auto-Capitalization issue that return empty arrays when doing comparisons (only visible on mobile)
        query = query.toLowerCase();

        // Filter out Card Names that are empty
        var names = combos[c].slice(0, 10).filter(function (e) {
            return e != "";
        });

        if ((names.join().toLowerCase().indexOf(query) === -1) && (combos[c][12].toLowerCase().indexOf(query) === -1) &&
            (combos[c][13].toLowerCase().indexOf(query) === -1) && (combos[c][14].toLowerCase().indexOf(query) === -1)) {
            continue;
        }

        combo.cardLinks = replaceCardNamesWithLinks(names);
        combo.colorIdentity = combos[c][10];
        combo.colorIdentityName = replaceColorIdentityWithName(combos[c][10]);
        combo.colorIdentityImages = replaceColorIdentityWithImageSources(combos[c][10]);
        combo.prerequisites = splitText(combos[c][11]);
        combo.steps = splitText(combos[c][12]);
        combo.result = splitText(combos[c][13]);
        combo.id = combos[c][14];

        comboData.push(combo);
    }

    var sortOrder = [
        'c', 'w,u,b,r,g', 'w,u,b,r', 'w,u,b,g', 'w,b,r,g', 'w,u,r,g', 'u,b,r,g',
        'w,u,b', 'w,u,r', 'w,u,g', 'w,b,r', 'w,b,g', 'w,r,g', 'u,b,r', 'u,b,g', 'u,r,g', 'b,r,g',
        'w,u', 'w,b', 'w,r', 'w,g', 'u,b', 'u,r', 'u,g', 'b,r', 'b,g', 'r,g',
        'w', 'u', 'b', 'r', 'g'
    ];
    var ordering = Object.fromEntries(sortOrder.map((so, i) => [so, i]));

    comboData.sort(function (a, b) {
        return (ordering[a.colorIdentity] - ordering[b.colorIdentity]);
    });

    return updateTableWithCombos(comboData);
}

function replaceCardNamesWithLinks(names) {
    return names.map(function (e) {
        return `<a href="https://deckbox.org/mtg/${e}">${e}</a>`;
    });
}

function replaceColorIdentityWithName(identity) {
    if (isBlank(identity)) {
        return identity;
    } else {
        const colorMapper = {
            'w': 'white',
            'u': 'blue',
            'b': 'black',
            'r': 'red',
            'g': 'green',
            'c': 'colorless',
            'w,u': 'azorius',
            'w,b': 'orzhov',
            'w,r': 'boros',
            'w,g': 'selesnya',
            'u,b': 'dimir',
            'u,r': 'izzet',
            'u,g': 'simic',
            'b,r': 'rakdos',
            'b,g': 'golgari',
            'r,g': 'gruul',
            'w,u,b': 'esper',
            'w,u,r': 'jeskai',
            'w,u,g': 'bant',
            'w,b,r': 'mardu',
            'w,b,g': 'abzan',
            'w,r,g': 'naya',
            'u,b,r': 'grixis',
            'u,b,g': 'sultai',
            'u,r,g': 'temur',
            'b,r,g': 'jund',
            'w,u,b,r': 'sans-green',
            'w,u,b,g': 'sans-red',
            'w,b,r,g': 'sans-blue',
            'w,u,r,g': 'sans-black',
            'u,r,b,g': 'sans-white',
            'w,u,b,r,g': "wubrg"
        };

        return colorMapper[identity];
    }
}

function replaceColorIdentityWithImageSources(identity) {
    if (isBlank(identity)) {
        return "";
    } else {
        const colors = identity.split(",");
        const imagePaths = {
            'w': '<img src="images/mana/manaw.png" width="40" alt="white">',
            'u': '<img src="images/mana/manau.png" width="40" alt="blue">',
            'b': '<img src="images/mana/manab.png" width="40" alt="black">',
            'r': '<img src="images/mana/manar.png" width="40" alt="red">',
            'g': '<img src="images/mana/manag.png" width="40" alt="green">',
            'c': '<img src="images/mana/manac.png" width="40" alt="colorless">'
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

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function replaceTextWithManaImages(text) {
    const width = 20;
    text = text.replace(/:manaw:/g, `<img src="images/mana/manaw.png" width="${width}" alt="white mana" loading="lazy">`);
    text = text.replace(/:manau:/g, `<img src="images/mana/manau.png" width="${width}" alt="blue mana" loading="lazy">`);
    text = text.replace(/:manab:/g, `<img src="images/mana/manab.png" width="${width}" alt="black mana" loading="lazy">`);
    text = text.replace(/:manar:/g, `<img src="images/mana/manar.png" width="${width}" alt="red mana" loading="lazy">`);
    text = text.replace(/:manag:/g, `<img src="images/mana/manag.png" width="${width}" alt="green mana" loading="lazy">`);
    text = text.replace(/:manac:/g, `<img src="images/mana/manac.png" width="${width}" alt="colorless mana" loading="lazy">`);
    text = text.replace(/:manabg:/g, `<img src="images/mana/manabg.png" width="${width}" alt="golgari mana" loading="lazy">`);
    text = text.replace(/:manabr:/g, `<img src="images/mana/manabr.png" width="${width}" alt="rakdos mana" loading="lazy">`);
    text = text.replace(/:managu:/g, `<img src="images/mana/managu.png" width="${width}" alt="simic mana" loading="lazy">`);
    text = text.replace(/:managw:/g, `<img src="images/mana/managw.png" width="${width}" alt="selesnya mana" loading="lazy">`);
    text = text.replace(/:manarg:/g, `<img src="images/mana/manarg.png" width="${width}" alt="gruul mana" loading="lazy">`);
    text = text.replace(/:manarw:/g, `<img src="images/mana/manarw.png" width="${width}" alt="boros mana" loading="lazy">`);
    text = text.replace(/:manaub:/g, `<img src="images/mana/manaub.png" width="${width}" alt="dimir mana" loading="lazy">`);
    text = text.replace(/:manaur:/g, `<img src="images/mana/manaur.png" width="${width}" alt="izzet mana" loading="lazy">`);
    text = text.replace(/:manawb:/g, `<img src="images/mana/manawb.png" width="${width}" alt="orzhov mana" loading="lazy">`);
    text = text.replace(/:manawu:/g, `<img src="images/mana/manawu.png" width="${width}" alt="azorius mana" loading="lazy">`);
    text = text.replace(/:manas:/g, `<img src="images/mana/manas.png" width="${width}" alt="snow mana" loading="lazy">`);
    text = text.replace(/:mana0:/g, `<img src="images/mana/mana0.png" width="${width}" alt="0 mana" loading="lazy">`);
    text = text.replace(/:mana1:/g, `<img src="images/mana/mana1.png" width="${width}" alt="1 mana" loading="lazy">`);
    text = text.replace(/:mana2:/g, `<img src="images/mana/mana2.png" width="${width}" alt="2 mana" loading="lazy">`);
    text = text.replace(/:mana3:/g, `<img src="images/mana/mana3.png" width="${width}" alt="3 mana" loading="lazy">`);
    text = text.replace(/:mana4:/g, `<img src="images/mana/mana4.png" width="${width}" alt="4 mana" loading="lazy">`);
    text = text.replace(/:mana5:/g, `<img src="images/mana/mana5.png" width="${width}" alt="5 mana" loading="lazy">`);
    text = text.replace(/:mana6:/g, `<img src="images/mana/mana6.png" width="${width}" alt="6 mana" loading="lazy">`);
    text = text.replace(/:mana7:/g, `<img src="images/mana/mana7.png" width="${width}" alt="7 mana" loading="lazy">`);
    text = text.replace(/:mana8:/g, `<img src="images/mana/mana8.png" width="${width}" alt="8 mana" loading="lazy">`);
    text = text.replace(/:mana9:/g, `<img src="images/mana/mana9.png" width="${width}" alt="9 mana" loading="lazy">`);
    text = text.replace(/:mana10:/g, `<img src="images/mana/mana10.png" width="${width}" alt="10 mana" loading="lazy">`);
    text = text.replace(/:mana11:/g, `<img src="images/mana/mana11.png" width="${width}" alt="11 mana" loading="lazy">`);
    text = text.replace(/:mana12:/g, `<img src="images/mana/mana12.png" width="${width}" alt="12 mana" loading="lazy">`);
    text = text.replace(/:mana13:/g, `<img src="images/mana/mana13.png" width="${width}" alt="13 mana" loading="lazy">`);
    text = text.replace(/:mana14:/g, `<img src="images/mana/mana14.png" width="${width}" alt="14 mana" loading="lazy">`);
    text = text.replace(/:mana15:/g, `<img src="images/mana/mana15.png" width="${width}" alt="15 mana" loading="lazy">`);
    text = text.replace(/:mana16:/g, `<img src="images/mana/mana16.png" width="${width}" alt="16 mana" loading="lazy">`);
    text = text.replace(/:mana20:/g, `<img src="images/mana/mana20.png" width="${width}" alt="20 mana" loading="lazy">`);
    text = text.replace(/:manawp:/g, `<img src="images/mana/manawp.png" width="${width}" alt="White Phyrexian mana" loading="lazy">`);
    text = text.replace(/:manaup:/g, `<img src="images/mana/manaup.png" width="${width}" alt="Blue Phyrexian manaa" loading="lazy">`);
    text = text.replace(/:manabp:/g, `<img src="images/mana/manabp.png" width="${width}" alt="Black Phyrexian mana" loading="lazy">`);
    text = text.replace(/:manarp:/g, `<img src="images/mana/manarp.png" width="${width}" alt="Red Phyrexian mana" loading="lazy">`);
    text = text.replace(/:managp:/g, `<img src="images/mana/managp.png" width="${width}" alt="Green Phyrexian mana" loading="lazy">`);

    return text;
}

// Update Combos Tables
function updateTableWithCombos(combos) {
    const tableBody = document.getElementById('combos');
    combos.map(function (combo) {
        const tr = document.createElement('tr');
        const tdCardLinks = document.createElement('td');
        const tdColorIdentity = document.createElement('td');
        const tdPrerequisites = document.createElement('td');
        const tdDescription = document.createElement('td');
        const tdResult = document.createElement('td');
        const tdComboID = document.createElement('td');

        tdCardLinks.id = "tdCardLinks";
        tdColorIdentity.id = "tdColorIdentity";
        tdPrerequisites.id = "tdPrerequisites";
        tdDescription.id = "tdDescription";
        tdResult.id = "tdResult";
        tdComboID.id = "tdComboID";

        tdCardLinks.innerHTML = `<ol>${combo.cardLinks.map(e => `<li>${e}</li>`).join('')}<ol>`;
        tdColorIdentity.innerHTML = `<center>${combo.colorIdentityImages.join('')}</center>`;
        tdPrerequisites.innerHTML = `<ul>${combo.prerequisites.map(e => `<li>${e}</li>`).join('')}<ul>`;
        tdDescription.innerHTML = `<ol>${combo.steps.map(e => `<li>${e}</li>`).join('')}<ol>`;
        tdResult.innerHTML = `<ul>${combo.result.map(e => `<li>${e}</li>`).join('')}<ul>`;
        tdComboID.innerHTML = `<center>${combo.id}</center>`;

        tr.appendChild(tdCardLinks);
        tr.appendChild(tdColorIdentity);
        tr.appendChild(tdPrerequisites);
        tr.appendChild(tdDescription);
        tr.appendChild(tdResult);
        tr.appendChild(tdComboID);

        tableBody.appendChild(tr);
    });

    filterCombos();
}

// Filter by Search Input
function filterCombos() {
    filter = $("#card-input").val().toLowerCase();
    $("#combos tr").filter(function () {
        let matchedText = $(this).text().toLowerCase().indexOf(filter);
        $(this).toggle(matchedText > -1 && inIdentity($(this)));
    });
}

// Filter by Color Identity
function inIdentity(context) {
    colorless = document.querySelector('#manaC > .image-checkbox').classList.contains('checked');
    white = document.querySelector('#manaW > .image-checkbox').classList.contains('checked');
    blue = document.querySelector('#manaU > .image-checkbox').classList.contains('checked');
    black = document.querySelector('#manaB > .image-checkbox').classList.contains('checked');
    red = document.querySelector('#manaR > .image-checkbox').classList.contains('checked');
    green = document.querySelector('#manaG > .image-checkbox').classList.contains('checked');

    tdColorless = context.children("#tdColorIdentity").children().prop("outerHTML").indexOf("colorless") > -1;
    if (!colorless && tdColorless) {
        return false;
    }

    tdWhite = context.children("#tdColorIdentity").children().prop("outerHTML").indexOf("white") > -1;
    if (!white && tdWhite) {
        return false;
    }

    tdBlue = context.children("#tdColorIdentity").children().prop("outerHTML").indexOf("blue") > -1;
    if (!blue && tdBlue) {
        return false;
    }

    tdBlack = context.children("#tdColorIdentity").children().prop("outerHTML").indexOf("black") > -1;
    if (!black && tdBlack) {
        return false;
    }

    tdRed = context.children("#tdColorIdentity").children().prop("outerHTML").indexOf("red") > -1;
    if (!red && tdRed) {
        return false;
    }

    tdGreen = context.children("#tdColorIdentity").children().prop("outerHTML").indexOf("green") > -1;
    if (!green && tdGreen) {
        return false;
    }

    return true;
}