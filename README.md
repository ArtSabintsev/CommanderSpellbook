# Commander Spellbook

## Background 
The Commander Spellbook website was created to catalog and centralize all reasonable [Magic: the Gathering combos](https://magic.wizards.com/en) for singleton formats. For this reason, the [Official Commander Banlist](https://mtgcommander.net/index.php/banned-list/) is ignored.

The idea to catalog combos started off as a [Discord Server](https://discord.gg/DkAyVJG) in February 2020. Once the Discord reached ~5000 members and ~1000 combos in May 2020, I began working on a website.

## Process
**TL;DR: I optimzied for community and made everything Open Source.**

Many individuals have tried to build a combo database over the last decade, but they've all failed due to the headache involved in finding those combos and keeping them updated in a Forum Post or Blog up to date. Many of the issues revolved around a single individual being the gatekeeper. Therefore, I've opted to solve for that problem by enlisting the community to catalog combos via Discord (which is how we obtained over a thousand of combos in a matter of months). I also opted to host the website and the database for free, forever, so people can take over this project by cloning this repository, or the Google Sheet, respectively, if I ever step away. This mindset allowed me to find other individuals passionate about working on this project in their free time.

## Website
First and foremost, I am an iOS developer, and _not_ a web developer. I am also not going to pretend to be a web developer, so therefore, a good chunk of the site's code is fairly ugly, due to me _frankensteining_ this website together via Bootstrap tutorials and code snippets I've found online. While I enjoy architecture patterns and implementing best practices, I did very little to none of that here, as my goal was to move the combos from out of Discord and into a better long-term solution -- this website.

I also decided that I wanted to make the financial upkeep for this project as cheap as possible. At the moment, here is what I pay for with respect to this project:

- Discord Nitro: **$99/year**
- Domain Name: **$20/year**
- GitHub: **Free**
- Google Sheets: **Free**
- Cloudflare: **Free (for now)**
- LetsEncrypt SSL Certificate: **Free**

## Links
- The website is hosted off this repository for free using Github Pages: http://www.CommanderSpellbook.com
- The database is hosted for free on [Google Sheets](https://docs.google.com/spreadsheets/d/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/edit#gid=0). 
- The Google Sheets API for all the combos can be found [here](https://sheets.googleapis.com/v4/spreadsheets/1JJo8MzkpuhfvsaKVFVlOoNymscCt-Aw-1sob2IhpwXY/values:batchGet?ranges=combos!A2:P&key=AIzaSyDzQ0jCf3teHnUK17ubaLaV6rcWf9ZjG5E). 

## Special Thanks
Massive thanks to [@harryfino](https://github.com/harryfino), creator of the [Moxfield](https://www.moxfield.com) project, for helping me solve my CSS headaches.
