import * as asobares from "./processors/asobares";
import * as chartmetric from "./processors/chartmetric";
import * as countries from "./processors/countries";
import * as drive from "./processors/drive";
import * as instagramHar from "./processors/har_instagram";
import * as scrapped from "./processors/scrapped";
import * as spotify from "./processors/spotify";

spotify.main();
countries.main();
drive.main();
scrapped.main();
instagramHar.main();
asobares.main();
chartmetric.main();
// const result = spotify.processGenres("./data/spotify/output_02_09_2024.json");

// const result = countries.processJsonFile("./data/geo/continents.json");

// spotify.join_files(
//   [
//     "./data/chunks/example (10).json",
//     "./data/chunks/example (11).json",
//     "./data/chunks/example (12).json",
//     "./data/chunks/example (13).json",
//     "./data/chunks/example (14).json",
//     "./data/chunks/example (15).json",
//     "./data/chunks/example (16).json",
//   ],
//   "./data/pre/spotify.json"
// );
console.log("FIN");
