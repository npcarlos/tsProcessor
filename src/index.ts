// Import all processors
import * as db from "./newProcessors/db";
import * as drive_converter from "./newProcessors/drive_converter";
import * as geoProcessor from "./newProcessors/geoProcessor";
import * as instagram_artists from "./newProcessors/instagram_artists";
import * as instagram_scrapers from "./newProcessors/instagram_scrapers";
import * as linked_tree from "./newProcessors/linked_tree";
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
  geoProcessor,

  // Data processors
  spotify,
  chartmetric,
  scrapers,
  drive_converter,
  drive,

  // Instagram processors
  instagram_scrapers,
  instagram_artists,
  har_instagram,

  posts_analytics,

  // Linked Tree
  linked_tree,

  // Database processors
  db,
};

// Configuration: Only list the ones you want to ENABLE
const enabledProcessors: (keyof typeof processors)[] = [
  // "geoProcessor",
  // "spotify",
  // "instagram_scrapers",
  // "drive_converter",
  "har_instagram",
  // "scrapers",
  // "db",
  // "instagram_artists",
  // "linked_tree",
  // "posts_analytics",
  // "drive",
];

// Execute enabled processors
function main() {
  enabledProcessors.forEach((processorKey) => {
    processors[processorKey].main();
  });

  /*
  const todo = leerArchivo(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/social_media_users/by_network/linktr_ee.json",
  );
  const linkedTree = leerArchivo(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/10-31/linkedTree.json",
  );

  // Crear Map de username a full_name para evitar duplicados
  const usernameToFullName = new Map<string, string>();
  todo.accounts.forEach((account: any) => {
    if (account.username && account.full_name) {
      // Si el username ya existe, no lo sobrescribe (evita duplicados)
      if (!usernameToFullName.has(account.username)) {
        usernameToFullName.set(account.username, account.full_name);
      }
    }
  });

  console.log(`Total accounts: ${todo.accounts.length}`);
  console.log(`Unique usernames: ${usernameToFullName.size}`);

  linkedTree.forEach((account: any) => {
    account.name = usernameToFullName.get(account.username) || "";
  });
  crearArchivo(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/10-31/linkedTree2.json",
    linkedTree,
  );
*/

  console.log("-- FIN --!");
}

main();
