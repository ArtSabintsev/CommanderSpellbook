(function () {
    "use strict";

    window.addEventListener("load", fetchDataFromGoogleSheets);

    // API Request
    function fetchDataFromGoogleSheets() {
        let url = "https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=metrics!A2:C&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E";

        // Fetch Metrics Data
        $.getJSON(url, function (data) {
            let metrics = data.valueRanges[0].values;

            // Update Search Bar
            updateSearchInputWithComboCount(metrics);

            // Update Metrics Modal
            updateModalWithMetrics(metrics);
        });
    }

    function updateSearchInputWithComboCount(metrics) {
        const searchInput = document.getElementById('card-input');
        searchInput.setAttribute('placeholder', `Type at least 3 letters to search ${metrics[0][2]} combos`);
      }

    // Update Metrics Modal
    function updateModalWithMetrics(metrics) {
        const tableBody = document.getElementById('metrics');
        metrics.map(function (metric) {
            const tr = document.createElement('tr');
            const tdMetric = document.createElement('td');
            const tdIdentity = document.createElement('td');
            const tdCount = document.createElement('td');

            tdMetric.innerHTML = `<strong>${metric[0]}</strong>`;
            tdIdentity.innerHTML = `<center>${replaceColorIdentityWithImageSources(metric[1]).join('')}</center>`;
            tdCount.innerHTML = `<center>${metric[2]}</center>`;

            tr.appendChild(tdMetric);
            tr.appendChild(tdIdentity);
            tr.appendChild(tdCount);
            tableBody.appendChild(tr);
        });
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

    function isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

})();