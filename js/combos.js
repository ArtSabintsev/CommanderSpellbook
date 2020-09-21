/** API Request **/
const url = 'https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:Q&ranges=utilities!C2&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E';

let cachedCombos = {};
let cachedSheets = void 0;

$.getJSON(url, function (data) {
    // Reference all Combos
    cachedSheets = data.valueRanges[0].values;

    // Filter out empty rows (using color-identity as a check here)
    cachedSheets = cachedSheets.filter(el => el[11] !== "");

    // Fake a Deeplinked/Permalinked Combo
    linkToCombo();
});

function evaluateSearchQuery() {
    let query = document.getElementById("card-input").value;

    // Fixes Auto-Capitalization issue that return empty arrays when doing comparisons (only visible on mobile)
    query = query.toLowerCase();

    gtag('event', 'User Performed Search', {
        'event_category': 'Search Category',
        'event_label': 'Search Event',
        'value': query
    });

    // !Number.isInteger(query): Checks to see if query is a number, which bypasses the 3-character length limit
    // query.length: Sets a minimum limit of characters to 3 before searching, to make sure live filtering isn't laggy
    if (!Number.isInteger(+query) && query.length < 3) {
        return;
    }

    if (cachedCombos[query]) {
        updateTableWithCombos(cachedCombos[query]);
        return;
    }

    parseCombos(cachedSheets, query);
}

// Generate Permalink
function linkToCombo() {
    var qs = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    // If the query paramater string doesn't have any values, skip this step, 
    // as it means the user did not load the code with any direct combo link or set link.
    if (qs.id !== undefined && Number.isInteger(+qs.id)) {
        const searchInput = document.getElementById('card-input');
        searchInput.setAttribute('value', qs.id);
        evaluateSearchQuery(true);
    } else if (qs.status !== undefined && qs.status.toLowerCase() === "spoiled") {
        const searchInput = document.getElementById('card-input');
        searchInput.setAttribute('value', "spoiled");
        evaluateSearchQuery(true);
    } else if (qs.status !== undefined && qs.status.toLowerCase() === "banned") {
        const searchInput = document.getElementById('card-input');
        searchInput.setAttribute('value', "banned");
        evaluateSearchQuery(true);
    } else if (qs.q !== undefined) {
        const searchInput = document.getElementById('card-input');
        searchInput.setAttribute('value', qs.q);
        evaluateSearchQuery(true);
    }
}

/** Parsing Functions **/

function parseCombos(combos, query) {
    var comboData = [];
    for (let c in combos) {
        const combo = [];

        // Validate that required rows have data
        if (combos[c][0] == null) {
            continue;
        } else if (combos[c][1] == null) {
            continue;
        } else if (combos[c][2] == null) {
            continue;
        } else if (combos[c][11] == null) {
            continue;
        } else if (combos[c][12] == null) {
            continue;
        } else if (combos[c][13] == null) {
            continue;
        } else if (combos[c][14] == null) {
            continue;
        } else if (combos[c][15] == null) {
            continue;
        } else if (combos[c][16] == null) {
            continue;
        }

        // Filter out Card Names that are empty
        var names = combos[c].slice(1, 11).filter(function (e) {
            return e != "";
        });

        // If number is an integer, skip all combos that do not exactly match the integer.
        // e.g. if ID is 21, match 21, but skip 211, 212, 121, 321, etc.
        if (Number.isInteger(+query)) {
            if (combos[c][0] != query) {
                continue;
            }
        }

        // Filter all combos based on query
        if (query === "mana") {
            // Skip over any search that searches for mana, since the color identity rows use :manax: text to render the image and return all combos.
            continue;
        } else if (query === "banned" && combos[c][15] !== "FALSE") {} else if (query === "spoiled" && combos[c][16] !== "FALSE") {} else if (query === replaceColorIdentityWithName(combos[c][11]).toLowerCase()) {} else if ((names.join().toLowerCase().indexOf(query) === -1) && // Checks to see if query matches the name of a card
            (combos[c][0].toLowerCase().indexOf(query) === -1) && // Checks to see if query matches a Combo ID
            (combos[c][13].toLowerCase().indexOf(query) === -1) && // Checks to see if query matches Combo Steps
            (combos[c][14].toLowerCase().indexOf(query) === -1) // Checks to see if query matches Combo Results
        ) {
            continue;
        }

        combo.cardLinks = replaceCardNamesWithLinks(names);
        combo.colorIdentity = combos[c][11];
        combo.colorIdentityName = replaceColorIdentityWithName(combos[c][11]);
        combo.colorIdentityImages = replaceColorIdentityWithImageSources(combos[c][11]);
        combo.prerequisites = splitText(combos[c][12]);
        combo.steps = splitText(combos[c][13]);
        combo.result = splitText(combos[c][14]);
        combo.cardsInCombo = names.length;
        combo.id = combos[c][0];
        combo.edhLegality = parseLegality(combos[c][15], "EDH/Commander");
        combo.newSpoiledCard = parseNewSpoiledCard(combos[c][16]);

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

    updateTableWithCombos(comboData);
    cachedCombos[query] = comboData;
}

function replaceCardNamesWithLinks(names) {
    return names.map(function (e) {
        // MTGIFY Links
        // return `<auto-card name="${e}">${e}</auto-card>`;

        // MTGIFY Images
        // return `<auto-card-image>${e}</auto-card-image>`;

        // Deckbox Links and Images
        // return `<a href="https://deckbox.org/mtg/${e}">${e}</a>`;

        // Deckbox Images. Scryfall Links. See js/tooltips.js
        return `<a href="https://www.scryfall.com/search?q=${e}" id="https://deckbox.org/mtg/${e}">${e}</a>`;
    });
}

function replaceColorIdentityWithName(identity) {
    if (isBlank(identity)) {
        return "Unknown";
    } else {
        const colorMapper = {
            'w': 'Mono-White',
            'u': 'Mono-Blue',
            'b': 'Mono-Black',
            'r': 'Mono-Red',
            'g': 'Mono-Green',
            'c': 'Colorless',
            'w,u': 'Azorius',
            'w,b': 'Orzhov',
            'w,r': 'Boros',
            'w,g': 'Selesnya',
            'u,b': 'Dimir',
            'u,r': 'Izzet',
            'u,g': 'Simic',
            'b,r': 'Rakdos',
            'b,g': 'Golgari',
            'r,g': 'Gruul',
            'w,u,b': 'Esper',
            'w,u,r': 'Jeskai',
            'w,u,g': 'Bant',
            'w,b,r': 'Mardu',
            'w,b,g': 'Abzan',
            'w,r,g': 'Naya',
            'u,b,r': 'Grixis',
            'u,b,g': 'Sultai',
            'u,r,g': 'Temur',
            'b,r,g': 'Jund',
            'u,b,r,g': 'Sans-White',
            'w,b,r,g': 'Sans-Blue',
            'w,u,r,g': 'Sans-Black',
            'w,u,b,g': 'Sans-Red',
            'w,u,b,r': 'Sans-Green',
            'w,u,b,r,g': "WUBRG"
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
    text = text.replace(/:manax:/g, `<img src="images/mana/manax.png" width="${width}" alt="X mana" loading="lazy">`);
    text = text.replace(/:manawp:/g, `<img src="images/mana/manawp.png" width="${width}" alt="White Phyrexian mana" loading="lazy">`);
    text = text.replace(/:manaup:/g, `<img src="images/mana/manaup.png" width="${width}" alt="Blue Phyrexian manaa" loading="lazy">`);
    text = text.replace(/:manabp:/g, `<img src="images/mana/manabp.png" width="${width}" alt="Black Phyrexian mana" loading="lazy">`);
    text = text.replace(/:manarp:/g, `<img src="images/mana/manarp.png" width="${width}" alt="Red Phyrexian mana" loading="lazy">`);
    text = text.replace(/:managp:/g, `<img src="images/mana/managp.png" width="${width}" alt="Green Phyrexian mana" loading="lazy">`);
    text = text.replace(/:manat:/g, `<img src="images/mana/manat.png" width="${width}" alt="Tap symbol" loading="lazy">`);
    text = text.replace(/:manaq:/g, `<img src="images/mana/manaq.png" width="${width}" alt="Untap symbol" loading="lazy">`);
    text = text.replace(/:mana2w:/g, `<img src="images/mana/mana2w.png" width="${width}" alt="2/W mana" loading="lazy">`);
    text = text.replace(/:mana2u:/g, `<img src="images/mana/mana2u.png" width="${width}" alt="2/U mana" loading="lazy">`);
    text = text.replace(/:mana2b:/g, `<img src="images/mana/mana2b.png" width="${width}" alt="2/B mana" loading="lazy">`);
    text = text.replace(/:mana2r:/g, `<img src="images/mana/mana2r.png" width="${width}" alt="2/R mana" loading="lazy">`);
    text = text.replace(/:mana2g:/g, `<img src="images/mana/mana2g.png" width="${width}" alt="2/G mana" loading="lazy">`);
    text = text.replace(/:manae:/g, `<img src="images/mana/manae.png" width="${width}" alt="Energy symbol" loading="lazy">`);

    return text;
}

function parseLegality(legal, format) {
    if (legal === "FALSE") {
        return null;
    } else {
        return `Banned in ${format}`;
    }
}

function parseNewSpoiledCard(spoiled) {
    if (spoiled === "FALSE") {
        return null;
    } else {
        return `Spoiled in forthcoming set.`;
    }
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
        const tdMeta = document.createElement('td');

        tdCardLinks.id = "tdCardLinks";
        tdColorIdentity.id = "tdColorIdentity";
        tdPrerequisites.id = "tdPrerequisites";
        tdDescription.id = "tdDescription";
        tdResult.id = "tdResult";
        tdMeta.id = "tdComboID";
        tdMeta.setAttribute('data-cardsInCombo', combo.cardsInCombo);

        tdCardLinks.innerHTML = `<ol>${combo.cardLinks.map(e => `<li>${e}</li>`).join('')}<ol>`;
        tdColorIdentity.innerHTML = `<center>${combo.colorIdentityImages.join('')}</center>`;
        tdPrerequisites.innerHTML = `<ul>${combo.prerequisites.map(e => `<li>${e}</li>`).join('')}<ul>`;
        tdDescription.innerHTML = `<ol>${combo.steps.map(e => `<li>${e}</li>`).join('')}<ol>`;
        tdResult.innerHTML = `<ul>${combo.result.map(e => `<li>${e}</li>`).join('')}<ul>`;
        tdMeta.innerHTML = `<ul>
            <li>Combo ID: ${combo.id}</li> 
            <li>Color Identity: ${combo.colorIdentityName}</li> 
                ${combo.edhLegality === null ? '' : '<font color="#d9534f"><li><strong>'+combo.edhLegality+'</strong></li><font>'}
                ${combo.newSpoiledCard === null ? '' : '<strong><font color="#5cb85c"><li>'+combo.newSpoiledCard+'</strong></li><font>'}
            </ul>
            <p><center><button type="button" class="btn btn-outline-info" id="copyButton" onclick="copyComboID(${combo.id})">Copy Combo Link</button></center></p>`;

        tr.appendChild(tdCardLinks);
        tr.appendChild(tdColorIdentity);
        tr.appendChild(tdPrerequisites);
        tr.appendChild(tdDescription);
        tr.appendChild(tdResult);
        tr.appendChild(tdMeta);

        tableBody.appendChild(tr);
    });

    filterCombos(combos.length);
}

// Filter by Search Input
function filterCombos(comboCount) {
    $("#combos tr").filter(function () {
        $(this).toggle(inIdentity($(this)) && numberOfCards($(this)));
    });

    document.getElementById('card-input-results').innerHTML = `${comboCount} Results`;

    tableStriping();
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

// Filter by Number of Cards in a Combo
function numberOfCards(context) {
    card2 = document.querySelector('#mana2 > .image-checkbox').classList.contains('checked');
    card3 = document.querySelector('#mana3 > .image-checkbox').classList.contains('checked');
    card4 = document.querySelector('#mana4 > .image-checkbox').classList.contains('checked');
    card5 = document.querySelector('#mana5 > .image-checkbox').classList.contains('checked');
    card6 = document.querySelector('#mana6 > .image-checkbox').classList.contains('checked');
    card7 = document.querySelector('#mana7p > .image-checkbox').classList.contains('checked');

    cardsInCombo = context.children("#tdComboID")[0].getAttribute("data-cardsInCombo");

    if (!card2 && cardsInCombo == 2) {
        return false;
    }

    if (!card3 && cardsInCombo == 3) {
        return false;
    }

    if (!card4 && cardsInCombo == 4) {
        return false;
    }

    if (!card5 && cardsInCombo == 5) {
        return false;
    }

    if (!card6 && cardsInCombo == 6) {
        return false;
    }

    if (!card7 && cardsInCombo >= 7) {
        return false;
    }

    return true;
}

// Re-apply table striping on search
function tableStriping() {
    $("tr:visible").each(function (index) {
        $(this).css("background-color", !!(index & 1) ? "rgba(0,0,0,.05)" : "rgba(0,0,0,0)");
    });
}


function copyComboID(id) {
    gtag('event', 'User Copied Combo Link', {
        'event_category': 'Copy Category',
        'event_label': 'Copy Event',
        'value': id
    });

    var $temp = $("<input>");
    $("body").append($temp);
    let linkToCopy = `https://CommanderSpellbook.com/?id=${id}`;
    $temp.val((linkToCopy.toString())).select();
    document.execCommand("copy");
    $temp.remove();

    var snackbar = document.getElementById("snackbar");
    snackbar.className = "show";
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 2000);

    window.requestAnimationFrame(function () {
        const button = document.getElementById('copyButton');
        button.blur();
    });
}