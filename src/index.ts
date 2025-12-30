// Import all processors
import * as db from "./newProcessors/db";
import * as drive_converter from "./newProcessors/drive_converter";
import * as instagram_scrapers from "./newProcessors/instagram_scrapers";
import * as posts_analytics from "./newProcessors/posts_analytics";
import * as scrapers from "./newProcessors/scrapers";
import * as analyzeGeoData from "./processors/analyzeGeoData";
import * as applyAliases from "./processors/applyAliases";
import * as chartmetric from "./processors/chartmetric";
import * as completeStates from "./processors/completeStates";
import * as drive from "./processors/drive";
import * as generateCities from "./processors/generateCities";
import * as generateStates from "./processors/generateStates";
import * as har_instagram from "./processors/har_instagram";
import * as spotify from "./processors/spotify";
import * as verifyStates from "./processors/verifyStates";

// Processors registry - Register once
const processors = {
  // Geographic data processors
  analyzeGeoData,
  generateStates,
  generateCities,
  applyAliases,
  verifyStates,
  completeStates,

  // Data processors
  spotify,
  chartmetric,
  scrapers,
  drive_converter,
  drive,

  // Instagram processors
  instagram_scrapers,
  har_instagram,

  posts_analytics,

  // Database processors
  db,
};

// Configuration: Only list the ones you want to ENABLE
const enabledProcessors: (keyof typeof processors)[] = [
  // "instagram_scrapers",
  // "drive_converter",
  // "har_instagram",
  // "scrapers",
  // "db",
  // "spotify",
  // "posts_analytics",
  // "drive",
];

// Execute enabled processors
function main() {
  enabledProcessors.forEach((processorKey) => {
    processors[processorKey].main();
  });

  console.log("FIN");
}

main();
