import * as fs from "fs";
import * as path from "path";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

export async function main(args?: any) {
  analizar_archivos_duplicados(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/chartmetric/bands"
  );
  analizar_archivos_duplicados(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/spotify/bands/artist_bio"
  );
  analizar_archivos_duplicados(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/spotify/bands/artist_extra"
  );
  generate_chartmetric_config_file();
  extract_socialnetworks_from_cm();
  extract_non_scrapped_cm_ids();
  extract_non_scrapped_cm_ids_sorted();
  // extract_spotify_metadata();
  // extract_available_socialnetworks_from_cm();
  // obtenerEjemplo();
  // get_names_from_instagram();
}

function analizar_archivos_duplicados(dirPath?: string) {
  let DIR_PATH = dirPath || "";
  // DIR_PATH =
  //   "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/chartmetric/bands";
  //   DIR_PATH =
  // "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/spotify/bands/artist_bio";
  //   DIR_PATH =
  // "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/spotify/bands/artist_extra";

  console.log("🔧 Iniciando análisis de archivos duplicados...\n");

  const pastDir = `${DIR_PATH}/past`;

  if (!fs.existsSync(pastDir)) {
    fs.mkdirSync(pastDir);
    console.log(`📁 Carpeta 'past' creada: ${pastDir}\n`);
  }

  console.log("📂 Leyendo directorio...");
  const files = fs.readdirSync(DIR_PATH);
  console.log(`✅ Total de archivos encontrados: ${files.length}\n`);

  // Filter only JSON files (exclude directories like 'past')
  console.log("🔍 Filtrando archivos JSON...");
  const jsonFiles: string[] = [];

  files.forEach((file, index) => {
    if (index % 5000 === 0) {
      console.log(`  Procesando filtrado: ${index}/${files.length}`);
    }
    const fullPath = path.join(DIR_PATH, file);
    try {
      if (
        fs.statSync(fullPath).isFile() &&
        path.extname(file).toLowerCase() === ".json"
      ) {
        jsonFiles.push(file);
      }
    } catch (error) {
      // Skip files that can't be accessed
    }
  });

  console.log(`✅ Archivos JSON válidos: ${jsonFiles.length}\n`);

  // Group files by ID with timestamp info (format: <id>_<timestamp>.json)
  console.log("🗂️  Agrupando archivos por ID...");
  const filesByID: Record<
    string,
    Array<{ filename: string; timestamp: number }>
  > = {};

  jsonFiles.forEach((file, index) => {
    if (index % 5000 === 0) {
      console.log(`  Agrupando: ${index}/${jsonFiles.length}`);
    }
    const match = file.match(/^(.+?)_(\d+)\.json$/);
    if (match) {
      const id = match[1];
      const timestamp = parseInt(match[2], 10);
      if (!filesByID[id]) {
        filesByID[id] = [];
      }
      filesByID[id].push({ filename: file, timestamp });
    }
  });

  const uniqueIds = Object.keys(filesByID).length;
  console.log(`✅ IDs únicos encontrados: ${uniqueIds}\n`);

  // Process each ID: keep the most recent, move others to past
  console.log("🔄 Procesando duplicados...");
  let totalMoved = 0;
  let idsWithDuplicates = 0;
  const entries = Object.entries(filesByID);

  entries.forEach(([id, files], index) => {
    if (index % 5000 === 0) {
      console.log(
        `  Procesando IDs: ${index}/${entries.length} (Movidos: ${totalMoved})`
      );
    }

    if (files.length >= 2) {
      // Sort by timestamp descending (most recent first)
      files.sort((a, b) => b.timestamp - a.timestamp);

      const mostRecent = files[0];
      const oldFiles = files.slice(1);

      // Move old files to past directory
      oldFiles.forEach((file) => {
        const sourcePath = path.join(DIR_PATH, file.filename);
        const destPath = path.join(pastDir, file.filename);
        try {
          fs.renameSync(sourcePath, destPath);
          totalMoved++;
        } catch (error) {
          console.error(`❌ Error moviendo ${file.filename}:`, error);
        }
      });

      idsWithDuplicates++;

      if (idsWithDuplicates <= 10) {
        console.log(
          `  ${id.padEnd(40)} - Kept: ${mostRecent.filename}, Moved: ${
            oldFiles.length
          } files`
        );
      }
    }
  });

  console.log(`\n✅ Procesamiento completado!\n`);

  // Statistics
  console.log("📊 Generando estadísticas...");
  const duplicatedIDs = entries
    .filter(([_, files]) => files.length >= 2)
    .map(([id, files]) => ({ id, count: files.length }))
    .sort((a, b) => b.count - a.count);

  console.log(`\n📊 RESUMEN DE LIMPIEZA:\n`);
  console.log(`📈 Total de archivos JSON iniciales: ${jsonFiles.length}`);
  console.log(`📈 Total de IDs únicos: ${uniqueIds}`);
  console.log(`📈 IDs con duplicados (2+): ${duplicatedIDs.length}`);
  console.log(`📂 Archivos movidos a /past: ${totalMoved}`);
  console.log(`✅ Archivos restantes: ${jsonFiles.length - totalMoved}\n`);

  console.log("🏆 Top 30 IDs que tenían más duplicados:\n");
  duplicatedIDs.slice(0, 30).forEach((item, index) => {
    console.log(
      `${(index + 1).toString().padStart(2)}. ${item.id.padEnd(40)} - ${
        item.count
      } archivos (${item.count - 1} movidos)`
    );
  });

  console.log("\n💾 Guardando resumen...");
  crearArchivo(`${DIR_PATH}_summary.json`, {
    total_files: jsonFiles.length,
    unique_ids: uniqueIds,
    duplicated_ids: duplicatedIDs.length,
    files_moved: totalMoved,
    files_remaining: jsonFiles.length - totalMoved,
    top_duplicates: duplicatedIDs.slice(0, 100),
  });
  console.log(`✅ Resumen guardado en: ${DIR_PATH}_summary.json\n`);
}

function generate_spotify_bands_config_file() {
  let DIR_PATH = [
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/bands/artist_extra",
  ];

  const configData: Array<{
    spotify: string;
    downloaded: number;
    artist_downloaded: number;
    related_downloaded: number;
  }> = [];
  const seenIds = new Set<string>();
  let duplicatesFound = 0;

  DIR_PATH.forEach((currentPath) => {
    const files = fs.readdirSync(currentPath);

    // Filter only JSON files (exclude directories like 'past')
    const jsonFiles = files.filter((file) => {
      const fullPath = path.join(currentPath, file);
      return (
        fs.statSync(fullPath).isFile() &&
        path.extname(file).toLowerCase() === ".json"
      );
    });

    jsonFiles.forEach((file) => {
      const match = file.match(/^(.+?)_(\d+)\.json$/);
      if (match) {
        const id = match[1];
        const timestamp = parseInt(match[2], 10);

        const feature = currentPath.endsWith("artist_bio")
          ? "artist_downloaded"
          : currentPath.endsWith("artist_extra")
          ? "downloaded"
          : "related_downloaded";

        // Check for duplicates
        if (seenIds.has(id)) {
          console.error(
            `❌ ERROR: ID duplicado encontrado: ${id} (archivo: ${file})`
          );
          duplicatesFound++;
        } else {
          seenIds.add(id);

          const newEntry = {
            spotify: id,
            downloaded: 0,
            artist_downloaded: 0,
            related_downloaded: 0,
          };
          const newData = {
            feature: timestamp,
          };
          configData.push({ ...newEntry, ...newData });
        }
      }
    });
  });
  // Sort by ID for consistency
  configData.sort((a, b) => a.spotify.localeCompare(b.spotify));

  console.log(`\n📊 RESUMEN:\n`);
  console.log(`📈 IDs únicos procesados: ${configData.length}`);
  console.log(`❌ Duplicados encontrados: ${duplicatesFound}`);

  if (duplicatesFound > 0) {
    console.log(
      `\n⚠️  ADVERTENCIA: Se encontraron ${duplicatesFound} IDs duplicados. Revisar arriba.`
    );
  }

  crearArchivo(`${DIR_PATH}_config.json`, configData);
  console.log(
    `\n✅ Archivo de configuración listo ${DIR_PATH}_config.json`,
    configData[0]
  );
}

function generate_chartmetric_config_file() {
  let DIR_PATH =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/chartmetric/bands";

  const files = fs.readdirSync(DIR_PATH);

  // Filter only JSON files (exclude directories like 'past')
  const jsonFiles = files.filter((file) => {
    const fullPath = path.join(DIR_PATH, file);
    return (
      fs.statSync(fullPath).isFile() &&
      path.extname(file).toLowerCase() === ".json"
    );
  });

  const configData: Array<{ chartmetric: number; downloaded: number }> = [];
  const seenIds = new Set<string>();
  let duplicatesFound = 0;

  jsonFiles.forEach((file) => {
    const match = file.match(/^(.+?)_(\d+)\.json$/);
    if (match) {
      const id = match[1];
      const timestamp = parseInt(match[2], 10);

      // Check for duplicates
      if (seenIds.has(id)) {
        console.error(
          `❌ ERROR: ID duplicado encontrado: ${id} (archivo: ${file})`
        );
        duplicatesFound++;
      } else {
        seenIds.add(id);
        configData.push({
          chartmetric: parseInt(id, 10),
          downloaded: timestamp,
        });
      }
    }
  });

  // Sort by ID for consistency
  configData.sort((a, b) => a.chartmetric - b.chartmetric);

  console.log(`\n📊 RESUMEN:\n`);
  console.log(`📈 Total de archivos JSON: ${jsonFiles.length}`);
  console.log(`📈 IDs únicos procesados: ${configData.length}`);
  console.log(`❌ Duplicados encontrados: ${duplicatesFound}`);

  if (duplicatesFound > 0) {
    console.log(
      `\n⚠️  ADVERTENCIA: Se encontraron ${duplicatesFound} IDs duplicados. Revisar arriba.`
    );
  }

  crearArchivo(`${DIR_PATH}_config.json`, configData);
  console.log(
    `\n✅ Archivo de configuración listo ${DIR_PATH}_config.json`,
    configData[0]
  );
}

function extract_socialnetworks_from_cm() {
  let DIR_PATH =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/chartmetric/bands";

  const files = fs.readdirSync(DIR_PATH);

  const chartmetricData: Record<string, { [social_network: string]: any }> = {};
  const processedIds = new Set<string>(); // Track processed IDs for fast lookup

  const social_networks = [
    "tiktok",
    "discogs",

    "tunefind",
    "tidal",
    "spotify",
    "musicbrainz",
    "anghami",
    "amazon",
    "deezer",
    "website",
    "jambase",
    "bandsintown",
    "youtubeforartist",
    "twitter",
    "youtube",
    "wikipedia",
    "songkick",
    "audiomack",
    "genius",
    "lastfm",
    "pandora",
    "facebook",
    "shazam",
    "itunes",
    "instagram",
    "boomplay",

    "soundcloud",
    "melon",
    "tvmaze",
    "snap",
    "line",
    "twitch",
    "gtrends",
    // 'pendingBulkupdate',
    //    'permanentlyFailed',
    //      'douyin',
    // 'bilibili',
    // 'weibosupertopic',
    "weibo",
    // "instagram",
    // "youtube",
    // "facebook",
    // "twitter",
    // "tiktok",
    // // "weibo",
    // // "vk",
    // "website",
    // "wikipedia",
    // "bandcamp",
    // "pandora",
    // // "snapchat",
    // "official_merch",
    // "official_fanclub",
    // "shazam",
    // "spotify",
    // "itunes",
    // "amazon",
    // "deezer",
    // "soundcloud",
    // "anghami",
    // "tunefind",
    // // "line_music",
    // // "melon",
    // // "tvmaze",
    // // "jambase",
    // "tidal",
    // // "boomplay"
  ];

  const bio_features = [
    "id",
    "name",
    "gender",
    "band",
    "band_members",
    "booking_agent",
    "continent",
    "code2",
    "city",
    "description",
    "image_url",
    "inactive",
    "date_of_birth",
    "date_of_death",
    "claimStatus",
    "verified",
    "sp_followers",
    "sp_monthly_listeners",
    "ins_followers",
  ];

  const usersNotFulledScrapped: any[] = [];
  const allGenres: any[] = [];

  files
    // .filter((file) => ["11_1738797747.json"].includes(file))
    .forEach((file: string, index: number) => {
      if (index % 1000 === 0) {
        console.log(index);
      }
      // 1033486_1758672485.json
      if (file.endsWith(".json")) {
        try {
          const match = file.match(/^(.+?)_(\d+)\.json$/);

          const charmetricRow = leerArchivo(`${DIR_PATH}/${file}`);

          const row_bio_data = charmetricRow.initial?.obj || {};
          const bio_data: Record<string, string> = {};

          Object.keys(row_bio_data)
            .filter((feature) => bio_features.includes(feature))
            .forEach((feature: any) => {
              const url = row_bio_data[feature];

              if (url) {
                bio_data[feature] = url;
              }
            });

          const row_social_networks = charmetricRow.sn_urls?.obj || {};
          const sn_users: Record<string, string> = {};

          Object.keys(row_social_networks)
            .filter((sn) => social_networks.includes(sn))
            .forEach((sn) => {
              const url = Array.isArray(row_social_networks[sn].url)
                ? row_social_networks[sn].url[0]
                : row_social_networks[sn].url;

              if (url) {
                sn_users[sn] = url;
              }
            });

          // console.log(Object.keys(row_bio_data));
          // console.log(bio_data);
          // console.log(sn_users);

          const genres_primary = row_bio_data.genres?.primary?.name
            ? [row_bio_data.primary?.name || row_bio_data.primary?.id]
            : [];
          const genres_secondary = (row_bio_data.genres?.secondary || []).map(
            (g: any) => g.name || g.id || g
          );
          const genres_sub = (row_bio_data.genres?.sub || []).map(
            (g: any) => g.name || g.id || g
          );

          const genres: any[] = [
            ...genres_primary,
            ...genres_secondary,
            ...genres_sub,
          ].filter((g) => !!g);

          allGenres.push([
            row_bio_data.genres?.primary,
            ...(row_bio_data.genres?.secondary || []),
            ...(row_bio_data.genres?.sub || []),
          ]);
          // ==== related =========================================================
          const row_related = charmetricRow.similar?.obj || [];
          const related_cm: any[] = [];

          // console.log("RElated", row_related.length);
          row_related.forEach((related: any) => {
            const bio_data_related: Record<string, string> = {};
            // console.log(related.id);

            Object.keys(related)
              .filter((feature) => bio_features.includes(feature))
              .forEach((feature: any) => {
                const url = related[feature];

                if (url) {
                  bio_data_related[feature] = url;
                }
              });
            let related_genres_primary: any[] = [];
            let related_genres_secondary: any[] = [];
            try {
              related_genres_primary = (related.genres || []).map(
                (g: any) => g.name || g.id || g
              );
              related_genres_secondary = (related.subgenres || []).map(
                (g: any) => g.name || g.id || g
              );
            } catch (error) {
              console.error(error);
            }
            const related_genres = [
              ...related_genres_primary,
              ...related_genres_secondary,
            ];

            allGenres.push([...related.genres, ...related.subgenres]);

            const relatedId = `${bio_data_related["id"]}`;

            if (!processedIds.has(relatedId)) {
              chartmetricData[relatedId] = {
                ...bio_data_related,
                genres: related_genres,
                added_by_related: true,
              };
              processedIds.add(relatedId);
            }
            related_cm.push(bio_data_related["id"]);
          });

          if (match && match[1]) {
            const mainId = match[1];
            chartmetricData[mainId] = {
              ...bio_data,
              ...sn_users,
              genres,
              related_cm,
              sn_scraped: !!charmetricRow.sn_urls?.obj,
            };
            processedIds.add(mainId);

            if (!charmetricRow.sn_urls) {
              usersNotFulledScrapped.push(parseInt(mainId));
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    });

  const uniqueMap = new Map<
    number,
    { id: number; name: string; type?: string; source?: string }
  >();
  const invalidItems: any[] = [];

  // Aplanar el array de arrays y filtrar valores null/undefined
  const flatGenres = allGenres.flat().filter((item) => item != null);

  flatGenres.forEach((item) => {
    // Verificar formato válido
    if (
      item.id &&
      typeof item.id === "number" &&
      item.name &&
      typeof item.name === "string"
    ) {
      // Map automáticamente reemplaza duplicados, preservando type y source
      const genreData: {
        id: number;
        name: string;
        type?: string;
        source?: string;
      } = {
        id: item.id,
        name: item.name,
      };

      if (item.type) genreData.type = item.type;
      if (item.source) genreData.source = item.source;

      uniqueMap.set(item.id, genreData);
    } else {
      invalidItems.push(item);
    }
  });

  // Convertir Map a array
  const uniqueGenres = Array.from(uniqueMap.values());
  crearArchivo(`${DIR_PATH}_unique_genres.json`, uniqueGenres);
  // crearArchivo(`${DIR_PATH}_invalid_genres.json`, invalidItems);

  console.log("Total: ", Object.keys(chartmetricData).length);
  crearArchivo(`${DIR_PATH}_sn.json`, chartmetricData);
  crearArchivo(`${DIR_PATH}_not_scrapped.json`, usersNotFulledScrapped);
}

function extract_non_scrapped_cm_ids() {
  let file =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/chartmetric/bands_not_scrapped.json";

  const ids = leerArchivo(file);
  console.log(ids.length);

  crearArchivo(
    file.replace("bands_non_scrapped", "chartmetric_bands.json"),
    ids.map((id: number) => {
      return { chartmetric: id, downloaded: 0 };
    })
  );
}

function extract_spotify_metadata() {
  const DIR_PATH = "./data/scrapped/spotify/bands/artist_bio";

  const files = fs.readdirSync(DIR_PATH);

  const artists: Record<
    string,
    {
      id: string;
      img: string;
      followers?: number;
      genres: string[];
      name: string;
      popularity: number;
    }
  > = {};
  files.forEach((file) => {
    const bio = leerArchivo(`${DIR_PATH}/${file}`);
    try {
      artists[bio.id] = {
        id: bio.id,
        img: bio.images?.[0]?.url,
        followers: bio.followers.total,
        genres: bio.genres,
        name: bio.name,
        popularity: bio.popularity,
      };
    } catch (error) {
      console.error("error con el archivo ", file);
      console.error(error);
    }
  });
  crearArchivo(`${DIR_PATH}.extract.json`, Object.values(artists));
}

function extract_available_socialnetworks_from_cm() {
  const DIR_PATH = "./data/scrapped/chartmetric/bands";

  const files = fs.readdirSync(DIR_PATH);
  let snList: any[] = [];

  files.forEach((file, index: number) => {
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados (${Math.round(((index + 1) * 100) / files.length)})  ${
          index + 1
        } / ${files.length} registros de Chartmetric`
      );
    }
    try {
      const artist = leerArchivo(`${DIR_PATH}/${file}`);

      const a_sn = Object.keys(artist?.sn_urls?.obj || {});
      snList = [...new Set([...snList, ...a_sn])];
    } catch (error) {
      console.error("error con el archivo ", file);
      console.error(error);
    }
  });

  console.log(snList.length);
  console.log(snList);
}

function obtenerEjemplo() {
  const sn: Record<string, string | null> = {
    spotify: null,
    chartmetric: null,
    tiktok: null,
    discogs: null,
    tunefind: null,
    tidal: null,
    musicbrainz: null,
    anghami: null,
    amazon: null,
    deezer: null,
    website: null,
    jambase: null,
    bandsintown: null,
    youtubeforartist: null,
    twitter: null,
    youtube: null,
    wikipedia: null,
    songkick: null,
    audiomack: null,
    genius: null,
    lastfm: null,
    pandora: null,
    facebook: null,
    shazam: null,
    itunes: null,
    instagram: null,
    boomplay: null,
    soundcloud: null,
    melon: null,
    tvmaze: null,
    snap: null,
    line: null,
    twitch: null,
    gtrends: null,
    weibo: null,
  };

  console.log("Buscando ejemplos....");

  const DIR_PATH = "./data/scrapped/chartmetric/bands";
  const files = fs.readdirSync(DIR_PATH);

  // Lista de claves de sn
  const snKeys = Object.keys(sn);

  let faltantesL = snKeys.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if ((i + 1) % 5000 === 0) {
      console.log(
        `  - Procesados (${Math.round(((i + 1) * 100) / files.length)})  ${
          i + 1
        } / ${files.length} registros de Chartmetric`
      );
    }

    try {
      const artist = leerArchivo(`${DIR_PATH}/${file}`);

      // URLs que vienen desde el archivo del artista
      const artistSN = artist?.sn_urls?.obj || {};

      // Recorremos solo los SN que están null
      snKeys.forEach((key) => {
        if (sn[key] === null && artistSN[key]?.url?.[0]) {
          sn[key] = artistSN[key]?.url[0];
        }
      });

      // ✔️ Si ya no hay ningún null, detener el proceso
      const faltantes = snKeys.filter((key) => sn[key] === null);
      if (faltantesL != faltantes.length) {
        console.log(
          "se encontraron ",
          faltantesL - faltantes.length,
          "    faltan: ",
          faltantes.length
        );
        faltantesL = faltantes.length;
      }

      if (faltantes.length === 0) {
        console.log("Todos los SN fueron encontrados, deteniendo proceso.");
        break;
      }
    } catch (error) {
      console.error("Error con el archivo ", file);
      console.error(error);
    }
  }

  console.log("Resultado final SN:");
  console.log(sn);

  return sn;
}

function extract_non_scrapped_cm_ids_sorted() {
  let artists_drive_json = leerArchivo(
    `./data/drive/2025/10-31/Nuevos Artistas - Bandas.json`
  )
    .filter((a: any) => !!a.chartmetric_user && a.chartmetric !== "e")
    .map((a: any) => {
      return { num: a.num, cm: a.chartmetric_user };
    });

  const record = Object.fromEntries(
    artists_drive_json.map((item: { num: number; cm: number }) => [
      item.num,
      item,
    ])
  );
  let artists_old_db = leerArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.artists.json`
  ).filter((a: any) => !!a.chartmetric);

  let nuevos = 0;
  artists_old_db.forEach((a: any) => {
    if (!record[a.num]) {
      record[a.num] = { num: a.num, cm: a.chartmetric };
      nuevos++;
    }
  });

  let chartmetric_artists = leerArchivo(
    `./data/scrapped/chartmetric/bands_sn.json`
  );

  // Función auxiliar para obtener datos de chartmetric
  const getChartmetricValue = (id: number) => {
    const scrapped = chartmetric_artists[id];
    return {
      cm: id,
      scrapped: !!scrapped,
      related: scrapped?.related_cm ?? [],
      added_by_related: scrapped?.added_by_related ?? false,
      sn_scraped: scrapped?.sn_scraped ?? false,
    };
  };

  // 1️⃣ Obtener todos los valores del record
  const recordValues = Object.values(record);

  // 2️⃣ Ordenar por num
  recordValues.sort((a, b) => a.num - b.num);

  // 3️⃣ Extraer los cm
  const cmList = recordValues.map((item) => item.cm);

  // 4️⃣ Eliminar duplicados
  const uniqueCmList = Array.from(new Set(cmList));

  // 5️⃣ Procesar cada elemento y sus relacionados en orden
  const allItems: Array<{
    cm: number;
    scrapped: boolean;
    related: number[];
    added_by_related: boolean;
    sn_scraped: boolean;
  }> = [];

  uniqueCmList.forEach((id: number) => {
    // Agregar el elemento principal
    const mainItem = getChartmetricValue(id);
    allItems.push(mainItem);

    // Agregar los relacionados (solo primer nivel, sin sus relacionados)
    mainItem.related.forEach((relatedId: number) => {
      const relatedItem = getChartmetricValue(relatedId);
      allItems.push(relatedItem);
    });
  });

  // 6️⃣ Filtrar por sn_scraped === false
  const notScraped = allItems.filter((item) => !item.sn_scraped);

  // 7️⃣ Extraer solo los IDs manteniendo el orden
  const idsToScrape = notScraped.map((item) => item.cm);

  // 8️⃣ Eliminar duplicados manteniendo el orden (primer aparición)
  const uniqueIdsToScrape = Array.from(new Set(idsToScrape));

  console.log("Total artistas originales:", uniqueCmList.length);
  console.log("Total con relacionados (con duplicados):", allItems.length);
  console.log("Total sin scrappear:", notScraped.length);
  console.log("IDs únicos a scrappear:", uniqueIdsToScrape.length);

  // Mostrar ejemplo
  const ejemplo = allItems.find((e) => e.related.length > 0);
  if (ejemplo) {
    console.log("\nEjemplo de item con relacionados:");
    console.log(ejemplo);
  }

  // Guardar resultado
  crearArchivo(
    "./data/scrapped/chartmetric/ids_to_scrape_sorted.json",
    uniqueIdsToScrape.map((id: any) => {
      return { chartmetric: id, downloaded: 0 };
    })
  );

  console.log("\nEstadísticas:");
  console.log("  - Artists drive JSON:", artists_drive_json.length);
  console.log("  - Record total:", Object.keys(record).length);
  console.log("  - Nuevos agregados:", nuevos);
  console.log("  - IDs únicos a procesar:", uniqueIdsToScrape.length);
}

function get_names_from_instagram() {
  const DIR_PATH =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/profiles/clean";
  const files = fs.readdirSync(DIR_PATH);

  const names = files.map((file) => {
    const data = leerArchivo(`${DIR_PATH}/${file}`);
    return { username: data?.username || "", name: data?.full_name || "" };
  });

  crearArchivo(DIR_PATH.replace("profiles/clean", "names.json"), names);
}
