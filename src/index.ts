import * as spotify from "./processors/spotify";

const result = spotify.processJsonFile("./data/output.json");

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
