const HorribleSubsApi = require("horriblesubs-api");

const horriblesubs = new HorribleSubsApi();

let myAnime = [];
horriblesubs
  .getAllAnime()
  .then(res => {
    console.log(res);
    myAnime = res.filter(elem => elem.title.startsWith("One Piece"));
    myAnime.forEach(anime => {
      horriblesubs
        .getAnimeData(anime)
        .then(res => {
          console.log(res);
          console.log("LOL", Object.keys(res.episodes["1"]).length);
        })
        .catch(err => console.log(err));
      debugger;
    });
  })
  .catch(err => console.error(err));
