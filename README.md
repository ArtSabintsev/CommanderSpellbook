# Commander Spellbook

## Background 
The Commander Spellbook website was created to catalogue and centralize all reasonable [Magic: the Gathering combos](https://magic.wizards.com/en) for singleton formats.

The idea to catalogue combos started off as a [Discord Server](https://discord.gg/DkAyVJG) in February 2020. Once we reached 5000+ members and 1000+ combos in May 2020, we began working on a website.

At present, this repository is the OSS version of the website, which itself is a GitHub page. 

- The URL for the site is: http://www.CommanderSpellbook.com
- The database is hosted on [Google Sheets](https://docs.google.com/spreadsheets/d/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/edit#gid=0). 
- The Google Sheets API for all the combos can be found [here](https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:P&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E). 


## Decisions
First and foremost, I am not a web developer, and I don't pretend to be one. While I enjoy architecture patterns and best coding practices, I did none of that here, as my goal was to move the combos out of Discord and into a better long-term solution.

Next, I decided that I wanted to make the financial upkeep for this project as cheap as possible. At the moment, here is what I pay for with respect to this project:

- Discord Nitro: $99/year
- Domain Name: $20/year
- GitHub: $0/year
- Google Sheets: $0/year
