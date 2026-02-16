import * as fs from "fs";
import { writeFile } from "fs/promises";
import { tsvToJson } from "../helpers/csvJson.helpers";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

export async function main(args?: any) {
  const dirPath = "./data/drive/2025/10-31";
  // Artists
  // await convertTSVFileToJSON({
  //   cleanDataProcessor: cleanArtistData,
  //   filePath: `${dirPath}/Nuevos Artistas - Bandas.tsv`,
  // });

  // // Artists
  // await convertTSVFileToJSON({
  //   // cleanDataProcessor: cleanArtistData,
  //   filePath: `${dirPath}/linkedTree.tsv`,
  // });

  // Venues
  await convertTSVFileToJSON({
    cleanDataProcessor: cleanVenuesData,
    filePath: `${dirPath}/Sitios - Sitios.tsv`,
  });

  // await convertTSVFileToJSON({
  //   cleanDataProcessor: cleanVenuesData,
  //   filePath: `${dirPath}/GeoData - DATOS.tsv`,
  // });
  // get_usernames_missing_instagram_scrapping();

  // const docs = leerArchivo(
  //   "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/chunks/export/artist_hive.artists_related.json"
  // )
  //   .filter((a: any) => !!a.spotify)
  //   .map((a: any) => a.spotify);

  // console.log(docs.length);
  // crearArchivo(`${dirPath}/spotify_all_db.txt`, docs);

  const sitios = leerArchivo(`${dirPath}/Sitios - Sitios.json`).filter(
    (sitio: any) => !!sitio.instagram && sitio.existe.toLowerCase() !== "no",
  );
  console.log(sitios.length);

  const pics = fs.readdirSync("C:/Users/fnp/Desktop/profile_pics_2");
  const picsDict: { [key: string]: true } = {};
  pics.forEach((sitio: any) => (picsDict[sitio.replace(".jpg", "")] = true));

  const already = fs.readdirSync(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/images",
  );

  const sitiosFaltantes = sitios.filter(
    (sitio: any) =>
      !picsDict[sitio.instagram] &&
      !already.find((alredySitio) => alredySitio === sitio.instagram),
  );
  crearArchivo(
    `${dirPath}/Sitios - Faltantes.json`,
    sitiosFaltantes.map((sitio: any) => sitio.instagram),
  );
  console.log(sitiosFaltantes.length);
}

async function convertTSVFileToJSON(params: {
  cleanDataProcessor?: Function;
  filePath: string;
  outputPath?: string;
}) {
  let { cleanDataProcessor, filePath, outputPath } = params;

  try {
    console.log(`Reading TSV file: ${filePath}`);
    const rawData = await tsvToJson(filePath);

    console.log(`✓ Read ${rawData.length} rows`);

    // Clean and transform data
    let cleanedData = rawData;
    if (cleanDataProcessor) {
      cleanedData = cleanDataProcessor(rawData);
    }

    console.log(
      `✓ Processed ${
        cleanedData.filter((v: any) => !!v.location).length
      } rows with location`,
    );

    console.log(cleanedData[1]);
    console.log(cleanedData[cleanedData.length - 2]);

    if (!outputPath) {
      const lastDotIndex = filePath.lastIndexOf(".");
      outputPath =
        lastDotIndex > -1
          ? filePath.substring(0, lastDotIndex) + ".json"
          : filePath + ".json";
    }

    // Save cleaned data
    await writeFile(outputPath, JSON.stringify(cleanedData, null, 2), "utf-8");
    console.log(`✓ Saved to: ${outputPath}`);

    return cleanedData;
  } catch (error) {
    console.error("Error converting TSV to JSON:", (error as Error).message);
    throw error;
  }
}

const parseNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(parsed) ? null : parsed;
};

// Parse boolean fields
const parseBoolean = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  const str = String(value).toLowerCase().trim();
  return str === "true" || str === "yes" || str === "1" || str === "sí";
};

// Trim all string fields
const trimString = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

function cleanArtistData<T extends Record<string, any>>(rawData: T[]): any[] {
  return rawData
    .map((row) => {
      // Parse numeric fields

      const coordinates = (row.location || "").includes(",")
        ? row.location.split(",")
        : null;

      // Example transformations - adjust field names based on your actual TSV columns
      return {
        ...row,
        // Example: Parse numeric fields
        num: parseNumber(row.num),
        popularity: parseNumber(row.popularity),
        followers: parseNumber(row.followers),
        spotify_user_count: parseNumber(row.spotify_user_count),
        chartmetric_user: parseNumber(row.chartmetric_user),
        chartmetric_user_count: parseNumber(row.chartmetric_user_count),
        total_audience_capacity: parseNumber(row.total_audience_capacity),
        lat: coordinates ? parseNumber(coordinates[0]) : null,
        lng: coordinates ? parseNumber(coordinates[1]) : null,
        // price: parseNumber(row.price),
        // latitude: parseNumber(row.latitude),
        // longitude: parseNumber(row.longitude),

        // Example: Parse boolean fields
        // active: parseBoolean(row.active),
        // verified: parseBoolean(row.verified),

        // Example: Trim string fields
        name: trimString(row.name),
        address: trimString(row.address),

        // Example: Create computed fields
        // fullAddress: `${trimString(row.address)}, ${trimString(row.city)}`,
        // hasLocation: !!(parseNumber(row.latitude) && parseNumber(row.longitude)),
        // lastUpdated: new Date().toISOString(),
      };
    })
    .filter(
      (row) =>
        !!row.instagram_user || !!row.chartmetric_user || !!row.spotify_user,
      // !!row.spotify_user
    )
    .sort((a, b) => (a.num || 0) - (b.num || 0));
  // .map((a) => a.spotify_user);
}
/**
 * Clean and transform venues data
 * @param rawData - Raw data from TSV file
 * @returns Cleaned and transformed data
 */
function cleanVenuesData<T extends Record<string, any>>(rawData: T[]): any[] {
  return rawData.map((row) => {
    const coordinates = (row.location || "").includes(",")
      ? row.location.split(",")
      : null;

    // Example transformations - adjust field names based on your actual TSV columns
    return {
      ...row,
      // Example: Parse numeric fields
      consecutive: parseNumber(row.consecutive),
      total_audience_capacity: parseNumber(row.total_audience_capacity),
      lat: coordinates ? parseNumber(coordinates[0]) : null,
      lng: coordinates ? parseNumber(coordinates[1]) : null,
      // price: parseNumber(row.price),
      // latitude: parseNumber(row.latitude),
      // longitude: parseNumber(row.longitude),

      // Example: Parse boolean fields
      // active: parseBoolean(row.active),
      // verified: parseBoolean(row.verified),

      // Example: Trim string fields
      name: trimString(row.name),
      address: trimString(row.address),

      // Example: Create computed fields
      // fullAddress: `${trimString(row.address)}, ${trimString(row.city)}`,
      // hasLocation: !!(parseNumber(row.latitude) && parseNumber(row.longitude)),
      // lastUpdated: new Date().toISOString(),
    };
  });
}

function get_usernames_missing_instagram_scrapping() {
  const scrappedDirPath =
    "C:/Users/fnp/Documents/Artist Hive/Data Octubre 2025/places_3";
  const alreadyScrapped = fs.readdirSync(`${scrappedDirPath}/clean`);
  const elementsInDrive = leerArchivo(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/10-31/Sitios - Sitios.json",
  );

  const elementsInDriveWithInstagram = elementsInDrive
    .filter(
      (entity: any) =>
        !!entity.instagram &&
        !alreadyScrapped.find(
          (scrappedEntity: string) =>
            scrappedEntity === `${entity.instagram}.json`,
        ),
    )
    .map((entity: any) => entity.instagram);

  console.log("Non scrapped ", elementsInDriveWithInstagram.length);
  crearArchivo(
    `${scrappedDirPath}/processed/instagram_missing_scrapped.txt`,
    elementsInDriveWithInstagram.join("\n"),
    false,
  );
}
