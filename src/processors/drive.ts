import * as fs from "fs";
import mongoose from "mongoose";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";
import { cleanHtmlToString } from "../helpers/string.helpers";

interface SpotifyData {
  spotify: string;
  downloaded: number;
  artist_downloaded: number;
}

interface ChartmetricData {
  chartmetric: number;
  downloaded: number;
}

export function main(args?: any) {
  // corregirSpotifyBandsConfig();
  // unirDriveConConfigFile();
  // consolidar_artistas();
  // =========================================================
  // console.log("Iniciando....");
  // const configInicialDrive = leerArchivo(
  //   "./data/drive/2025/automatic/new/newDrive.json"
  // );
  // const related = leerArchivo(
  //   "./data/drive/2025/automatic/new/relatedIndex.json"
  // );
  // console.log(
  //   "archivos leídos....",
  //   configInicialDrive.filter((a: any) => !a.name && !!a.spotify_user).length
  // );
  // configInicialDrive.forEach((a: any) => {
  //   if (!a.name && !!a.spotify_user) {
  //     const relatedA = related.find(
  //       (rA: any) => rA.spotify_user === a.spotify_user
  //     );
  //     a.name = relatedA?.name || "";
  //   }
  // });
  // console.log(
  //   "Cambios ",
  //   configInicialDrive.filter((a: any) => !a.name && !!a.spotify_user).length
  // );
  // console.log("actualizando archivo....");
  // crearArchivo(
  //   "./data/drive/2025/automatic/new/newDrive.json",
  //   configInicialDrive
  // );
  // console.log(
  //   "Total: ",
  //   configInicialDrive.length,
  //   configInicialDrive.filter((a: any) => !a.name && !!a.spotify_user).length
  // );
  // extract_related();
  // const fqMap = new Map<string, number>();
  // configInicialDrive.forEach((artist: any) => {
  //   const id = artist?.spotify;
  //   fqMap.set(id, (fqMap.get(id) || 0) + 1);
  // });
  // console.log(
  //   " CONFIG ",
  //   configInicialDrive.length,
  //   Array.from(fqMap.entries()).filter((a: any) => a[1] > 1)
  // );
  // revisar_duplicados();
  //
  // ==============================================================================================
  // consolidar_artistas_new_artist_completo();
  // compilarAlbumes();
  // calcular_artistas_mas_relacionados();
  // consolidar_sitios();
  // consolidar_spotify_ids_para_scrapping();
  // consolidar_chartmetric_ids_para_scrapping();
  // simple_stats();
  // extract_ah_ids();
  // const places_drive_data: any = JSON.parse(
  //   fs.readFileSync("./data/drive/places_drive.json", "utf-8")
  // );
  // console.log(places_drive_data.length);
  // const countryCounts = places_drive_data.reduce(
  //   (counts: { [key: string]: number }, artist: any) => {
  //     const country = artist.country_alpha2;
  //     counts[country] = (counts[country] || 0) + 1;
  //     return counts;
  //   },
  //   {}
  // );
  // // Convertimos a un array de [país, conteo], ordenamos y luego convertimos a objeto nuevamente
  // const sortedCountryCounts = Object.entries(countryCounts)
  //   .sort(([, a], [, b]) => Number(b) - Number(a)) // Orden descendente
  //   .reduce((acc, [country, count]) => {
  //     acc[country] = Number(count);
  //     return acc;
  //   }, {} as { [key: string]: number });
  // console.log(sortedCountryCounts);
  // consolidar_nuevos_artistas_dic();
  // consolidarAlbums();
  // convertAlbumsToDatabase();
  // ============================ CHARTMETRIC
  // extraerConfigFromSprotifyBioToChartmetricSearch();
  // chartmetricSearchResultToCSV();
  // compilarChartmetricUsers();
  // // //  // -// FIN
  // validarDatosCompletos();
  // mongodb+srv://ahcmetrics:FNzgptUweIwGB09g@cluster0.imxovdf.mongodb.net/
  // const stream = fs.createReadStream(
  //   "./data/drive/2025/automatic/spotify/albumsConsolidado_db.json",
  //   { encoding: "utf8" }
  // );
  // let count = 0;
  // let buffer = "";
  // stream.on("data", (chunk) => {
  //   buffer += chunk; // Acumulamos los datos en un buffer
  //   let parts = buffer.split(/[\[\],]/); // Separa por `,` pero mantiene los `[` y `]`
  //   // Procesa cada elemento válido
  //   for (let i = 0; i < parts.length - 1; i++) {
  //     if (parts[i].trim()) count++; // Si no es vacío, es un elemento válido
  //   }
  //   buffer = parts[parts.length - 1]; // Guarda el resto para la próxima lectura
  // });
  // stream.on("end", () => {
  //   console.log(`Cantidad de elementos en el JSON: ${count}`);
  // });
  // stream.on("error", (err) => {
  //   console.error("Error leyendo el archivo:", err);
  // });
  // convertRelatedArtistsId();
  // generateSpotifyConfigFileFromFiles();
  // reassingDBIdsInEvents();
}

function compilarChartmetricUsers() {
  const todosLosArtistas = leerArchivo(
    "./data/drive/2025/automatic/chartmetric_search/all_searches.json"
  ).map((a: any) => a.cm_id);

  const driveCM = leerArchivo(
    "./data/drive/2025/automatic/chartmetric_search/drive.json"
  ).map((a: any) => a.chartmetric_user);

  const configCMArtists = leerArchivo(
    "./data/scrapped/config/chartmetric_bands.json"
  );

  const compiladoMap = new Map<number, number>();
  configCMArtists.forEach((a: any, index: number) => {
    if (!compiladoMap.get(a.chartmetric)) {
      compiladoMap.set(a.chartmetric, a.downloaded);
    }
  });
  console.log(compiladoMap.size);

  const search = [...todosLosArtistas, ...driveCM];
  search.forEach((a: any) => {
    if (!compiladoMap.get(a)) {
      compiladoMap.set(a, 0);
    }
  });
  const result = Array.from(compiladoMap, ([chartmetric, downloaded]) => ({
    chartmetric,
    downloaded,
  }));
  console.log(todosLosArtistas.length, driveCM.length, configCMArtists.length);
  console.log(compiladoMap.size);
  crearArchivo("./data/drive/2025/automatic/chartmetric_bands.json", result);
}
function validarDatosCompletos() {
  const datosED = leerArchivo(
    "./data/drive/2025/chunks/artists_db_entity_directory_0.json"
  );
  const datos = leerArchivo("./data/drive/2025/chunks/artists_db_0.json");
  const mercedes = datos.find((a: any) => a.name === "Silvio Rodríguez");

  const bios = fs.readdirSync("./data/scrapped/spotify/bands/artist_bio") || [];

  const bioMercedes = bios.filter((file: string) =>
    file.includes(mercedes?.spotify)
  );

  const configSpotifyArtists = leerArchivo(
    "./data/scrapped/config/spotify_bands.json"
  );

  const config = configSpotifyArtists.find(
    (c: any) => c.spotify === mercedes?.spotify
  );

  // console.log(config);

  console.log(
    datos.length,
    bioMercedes.length
    // mercedes,
    // `./data/scrapped/spotify/bands/artist_bio/${bioMercedes[0]}`,
    // config
  );

  const conSPSinPic = datos.filter((a: any) => !a.profile_pic && !!a.spotify);
  const conSPSinPicConBio = conSPSinPic
    .map((a: any) => bios.find((file: string) => file.includes(a?.spotify)))
    .filter((a: any) => !!a);
  crearArchivo(
    "./data/drive/2025/automatic/faltantes/spotifyBio.json",
    conSPSinPicConBio
  );
  console.log(conSPSinPic.length, conSPSinPicConBio.length);
}
interface SocialMedia {
  id: number | null;
  url: string[] | null;
}

interface SnUrls {
  obj: Record<string, SocialMedia>;
}

function extract_related() {
  const relatedFiles =
    fs.readdirSync("./data/scrapped/spotify/bands/artist_related") || [];

  const map = new Map<string, any>();

  relatedFiles.forEach((fileName: string) => {
    const infoInicial = leerArchivo(
      `./data/scrapped/spotify/bands/artist_related/${fileName}`
    );
    const related =
      infoInicial?.data?.artistUnion?.relatedContent?.relatedArtists?.items ||
      [];

    related.forEach((relatedArtist: any) => {
      const id = relatedArtist?.id;
      if (!map.get(id)) {
        map.set(id, relatedArtist);
      }
    });
  });

  // {
  //   "id": "0Y5FHnWSAGi9XaE5dmXyzG",
  //   "profile": {
  //     "name": "Isadora Melo"
  //   },
  //   "uri": "spotify:artist:0Y5FHnWSAGi9XaE5dmXyzG",
  //   "visuals": {
  //     "avatarImage": {
  //       "sources": [
  //         {
  //           "height": 640,
  //           "url": "https://i.scdn.co/image/ab6761610000e5eb1ba612e3ba6a70eacd1e7dfa",
  //           "width": 640
  //         },
  //         {
  //           "height": 160,
  //           "url": "https://i.scdn.co/image/ab6761610000f1781ba612e3ba6a70eacd1e7dfa",
  //           "width": 160
  //         },
  //         {
  //           "height": 320,
  //           "url": "https://i.scdn.co/image/ab676161000051741ba612e3ba6a70eacd1e7dfa",
  //           "width": 320
  //         }
  //       ]
  //     }
  //   }
  // },

  const relatedInfo = Array.from(map.values()).map((info) => {
    return {
      spotify_user: info.id,
      name: info.profile.name,
      img: info?.visuals?.avatarImage?.sources?.[0]?.url,
    };
  });
  crearArchivo(
    "./data/drive/2025/automatic/new/relatedIndex.json",
    relatedInfo
  );
  console.log("Related ", relatedFiles.length, relatedInfo[3]);
}
function revisar_duplicados() {
  // const configInicial = leerArchivo(
  //   "./data/scrapped/config/spotify_bands.json"
  // );
  // const fqMap = new Map<string, number>();

  // configInicial.forEach((artist: any) => {
  //   const id = artist?.spotify;
  //   fqMap.set(id, (fqMap.get(id) || 0) + 1);
  // });

  // const fq = Array.from(fqMap.entries());
  // console.log(
  //   fq.length,
  //   fq.filter((fqAct: any) => fqAct[1] > 2)
  // );
  const contarCamposLlenos = (item: any): number => {
    return Object.values(item).filter(
      (value) => value !== "" && value !== null && value !== undefined
    ).length;
  };

  const configInicialDrive = leerArchivo(
    "./data/drive/new_artists_drive_consolidado_prev.json"
  );
  const fqMapDrive_spotify = new Map<string, number>();
  const fqMapDrive_cm = new Map<string, number>();
  const fqMapDrive_instagram = new Map<string, number>();
  const newDriveMap = new Map<string, any>();
  const newDriveMap_ig = new Map<string, any>();
  const newDriveMap_cm = new Map<string, any>();

  configInicialDrive.forEach((artist: any) => {
    const id_spotify = artist?.spotify_user;
    const id_cm = artist?.chartmetric_user;
    const id_instagram = artist?.instagram_user;

    if (!!id_spotify) {
      fqMapDrive_spotify.set(
        id_spotify,
        (fqMapDrive_spotify.get(id_spotify) || 0) + 1
      );

      const existingItem = newDriveMap.get(id_spotify);

      if (
        !existingItem ||
        contarCamposLlenos(artist) > contarCamposLlenos(existingItem)
      ) {
        newDriveMap.set(id_spotify, artist);
      }
    } else if (!!id_instagram) {
      const existingItem = newDriveMap_ig.get(id_instagram);

      if (
        !existingItem ||
        contarCamposLlenos(artist) > contarCamposLlenos(existingItem)
      ) {
        newDriveMap_ig.set(id_instagram, artist);
      }
    } else if (!!id_cm) {
      const existingItem = newDriveMap_cm.get(id_cm);

      if (
        !existingItem ||
        contarCamposLlenos(artist) > contarCamposLlenos(existingItem)
      ) {
        newDriveMap_cm.set(id_cm, artist);
      }
    }

    if (!!id_cm) {
      fqMapDrive_cm.set(id_cm, (fqMapDrive_cm.get(id_cm) || 0) + 1);
    }

    if (!!id_instagram) {
      fqMapDrive_instagram.set(
        id_instagram,
        (fqMapDrive_instagram.get(id_instagram) || 0) + 1
      );
    }
  });

  // const fqDrive_spotify = Array.from(fqMapDrive_spotify.entries());
  // const fqDrive_cm = Array.from(fqMapDrive_cm.entries());
  // const fqDrive_instagram = Array.from(fqMapDrive_instagram.entries());

  // const idsRepetidos_sp = fqDrive_spotify
  //   .filter((fqAct: any) => fqAct[1] != 1)
  //   .map((f: any) => f[0]);
  // const idsRepetidos_cm = fqDrive_cm
  //   .filter((fqAct: any) => fqAct[1] > 1)
  //   .map((f: any) => f[0]);
  // const idsRepetidos_ig = fqDrive_instagram
  //   .filter((fqAct: any) => fqAct[1] > 1)
  //   .map((f: any) => f[0]);

  // const repetidosSP_incompletos = configInicialDrive.filter(
  //   (a: any) => idsRepetidos_sp.includes(a.spotify_user) && !a.name
  // );
  // const idsRepetidosSPIncompletos = repetidosSP_incompletos.map(
  //   (a: any) => a.num
  // );

  // const limpios = configInicialDrive.filter(
  //   (a: any) => !idsRepetidosSPIncompletos.includes(a.num)
  // );

  // crearArchivo(
  //   "./data/drive/new_artists_drive_consolidado_prev (limpio).json",
  //   limpios
  // );

  const mergedMap = new Map([
    ...newDriveMap,
    ...newDriveMap_ig,
    ...newDriveMap_cm,
  ]);

  console.log("generando spotify ids ", new Date());
  const spotifyIds = Array.from(mergedMap.values())
    .filter((a: any) => !!a.spotify_user)
    .sort()
    .map((a: any) => {
      return { spotify: a.spotify_user, downloaded: 0, artist_downloaded: 0 };
    });

  console.log("bios ", new Date());
  const bioFiles =
    fs.readdirSync("./data/scrapped/spotify/bands/artist_bio") || [];

  bioFiles.forEach((file: string, num: number) => {
    const parts = file.replace(".json", "").split("_");
    const artistInConfig = spotifyIds.find(
      (artist: any) => artist.spotify === parts[1]
    );
    if (artistInConfig) {
      artistInConfig.artist_downloaded = Math.max(
        Number(parts[0]),
        Number(artistInConfig.artist_downloaded)
      );
    }
  });

  console.log("extra files ", new Date());
  const extraFiles =
    fs.readdirSync("./data/scrapped/spotify/bands/artist_extra") || [];

  bioFiles.forEach((file: string, num: number) => {
    const parts = file.replace(".json", "").split("_");
    const artistInConfig = spotifyIds.find(
      (artist: any) => artist.spotify === parts[1]
    );
    if (artistInConfig) {
      artistInConfig.downloaded = Math.max(
        Number(parts[0]),
        Number(artistInConfig.downloaded)
      );
    }
  });

  crearArchivo(
    "./data/drive/2025/automatic/new/newDrive.json",
    Array.from(mergedMap.values()).sort((a: any, b: any) => a.num - b.num)
  );

  crearArchivo("./data/drive/2025/automatic/new/newSpotify.json", spotifyIds);

  console.log(
    "\n\n\n",
    bioFiles.length,
    extraFiles.length,
    "NEW DRIVE ",
    configInicialDrive.length,
    mergedMap.size,
    newDriveMap.size,
    newDriveMap_ig.size,
    newDriveMap_cm.size
  );
  // console.log(
  //   "FQ",
  //   fqDrive_spotify.length,
  //   // fqDrive_cm.length,
  //   // fqDrive_instagram.length,
  //   idsRepetidos_sp.length,
  //   "###",
  //   idsRepetidos_sp,
  //   idsRepetidos_cm.length,
  //   idsRepetidos_ig.length,
  //   " \n SP",
  //   repetidosSP_incompletos.length,
  //   // repetidosSP_incompletos.map((a: any) => a.num),
  //   " \n CM",
  //   idsRepetidos_cm,
  //   " \n IG",
  //   idsRepetidos_ig,
  //   // configInicialDrive.filter(
  //   //   (a: any) => idsRepetidos.includes(a.spotify_user) && !a.name
  //   // ).length,

  //   // configInicialDrive.filter(
  //   //   (a: any) => a.spotify_user === "6mosurlsgIVZlWaAqvwiJE"
  //   // )
  //   configInicialDrive.filter(
  //     (a: any) => a.spotify_user === "6mosurlsgIVZlWaAqvwiJE"
  //     // (a: any) => a.spotify_user === "7He11U01wHq1zaIU6GXSKd"
  //     // (a: any) => a.num === 156926
  //   ),
  //   "\n\nLimpios",
  //   limpios.length
  // );
}

function corregirSpotifyBandsConfig() {
  const configInicial = leerArchivo(
    "./data/scrapped/config/spotify_bands.json"
  );
  const configInicial2 = leerArchivo("./data/scrapped/spotify_bands.json");

  console.log(configInicial.length, configInicial2.length);
  console.log(
    "extra ",
    configInicial.filter((a: any) => a.downloaded === 0).length,
    configInicial2.filter((a: any) => a.downloaded === 0).length,
    configInicial.filter((a: any) => a.downloaded === 0).length -
      configInicial2.filter((a: any) => a.downloaded === 0).length
  );
  console.log(
    "bio ",
    configInicial.filter((a: any) => a.artist_downloaded === 0).length,
    configInicial2.filter((a: any) => a.artist_downloaded === 0).length,
    configInicial.filter((a: any) => a.artist_downloaded === 0).length -
      configInicial2.filter((a: any) => a.artist_downloaded === 0).length
  );

  console.log(
    configInicial.find((a: any) => a.spotify === "6uB9xdMh9YcWLWnqhzXgTe")
  );

  const bioFiles =
    fs.readdirSync("./data/scrapped/03_10/spotify/bands/artist_bio") || [];

  bioFiles.forEach((file: string, num: number) => {
    const parts = file.replace(".json", "").split("_");
    const artistInConfig = configInicial.find(
      (artist: any) => artist.spotify === parts[1]
    );
    artistInConfig.artist_downloaded = Number(parts[0]);
  });

  const extraFiles =
    fs.readdirSync("./data/scrapped/03_10/spotify/bands/artist_extra") || [];

  extraFiles.forEach((file: string, num: number) => {
    const parts = file.replace(".json", "").split("_");
    const artistInConfig = configInicial.find(
      (artist: any) => artist.spotify === parts[1]
    );
    artistInConfig.artist_downloaded = Number(parts[0]);
  });

  console.log(
    configInicial.find((a: any) => a.spotify === "6uB9xdMh9YcWLWnqhzXgTe")
  );
  console.log("Corrección ", configInicial.length, bioFiles.length);
  console.log(
    "Corrección ",
    configInicial.filter((a: any) => a.artist_downloaded === 0).length,
    bioFiles.length
  );
  console.log(
    "Corrección ",
    configInicial.filter((a: any) => a.downloaded === 0).length,
    extraFiles.length
  );

  // crearArchivo("./data/scrapped/config/spotify_bands.json", configInicial);
}

const extractSocialLinks = (
  sn_urls: SnUrls,
  networks: string[]
): Record<string, string> => {
  const result: Record<string, string> = {};

  // console.log(sn_urls);

  networks.forEach((network) => {
    const social = sn_urls?.obj?.[network]; // Accede a la red social en el objeto

    if (social) {
      result[network] = social.url?.[0] || (social.id ? String(social.id) : ""); // Obtener URL o ID
    } else {
      result[network] = ""; // Si no existe la red, asignar ""
    }
  });

  return result;
};

function chartmetricSearchResultToCSV() {
  const todosLosArtistas = leerArchivo(
    "./data/drive/2025/automatic/chartmetric_search/nuevos.json"
  );

  const toCSV = todosLosArtistas.map((artista: any) => {
    const socialList = [
      "instagram",
      "youtube",
      "tiktok",
      "songkick",
      "facebook",
      "twitter",
      "website",
    ];
    const socialLinks = extractSocialLinks(artista.sn_urls, socialList);

    return {
      spotify: artista.spt,
      chartmetric_url: artista.cm_id,
      ...socialLinks,
    };
  });

  crearArchivo(
    "./data/drive/2025/automatic/chartmetric_search (to csv).json",
    toCSV
    // mergedSpotify.filter((s) => s.artist_downloaded === 0)
  );
}

function extraerConfigFromSprotifyBioToChartmetricSearch() {
  const todosLosArtistas = leerArchivo(
    // "./data/drive/new_artists_drive_consolidado_prev.json"
    "./data/drive/2025/automatic/new/newDrive.json"
  );
  const drive14000Artistas = leerArchivo(
    // "./data/drive/new_artists_drive_consolidado_prev.json"
    "./data/drive/2025/automatic/new/drive14000.json"
  );
  const configSpotifyArtists = leerArchivo(
    // "./data/scrapped/config/spotify_bands_complete.json"
    "./data/scrapped/config/spotify_bands.json"
  );

  const nuevosChartmetric = drive14000Artistas.filter(
    (a: any) => !!a.chartmetric_user && a.chartmetric_user !== "e"
  );

  console.log(
    "La mamá ha encontrado nuevos chartmentric ",
    nuevosChartmetric.length
  );

  nuevosChartmetric.forEach(
    (a: any) =>
      (todosLosArtistas.find(
        (tA: any) => tA.spotify_user === a.spotify_user
      ).chartmetric_user = a.chartmetric_user)
  );

  const chartmetricQueFaltan = todosLosArtistas.filter(
    (artista: any) => !!artista.spotify_user && !artista.chartmetric_user
  );

  console.log("chartmetricQueFaltan: ", chartmetricQueFaltan.length);

  const scrappedSpotifyBioFilesUnique = chartmetricQueFaltan
    .map((artista: any, index: number) => {
      const artistaConfig = configSpotifyArtists.find(
        (spotifyArtistConfig: any) =>
          spotifyArtistConfig.spotify === artista.spotify_user
      );

      const spotifyBio =
        artistaConfig?.artist_downloaded > 0 &&
        fs.existsSync(
          `./data/scrapped/spotify/bands/artist_bio/${artistaConfig["artist_downloaded"]}_${artistaConfig.spotify}.json`
        )
          ? leerArchivo(
              `./data/scrapped/spotify/bands/artist_bio/${artistaConfig["artist_downloaded"]}_${artistaConfig.spotify}.json`
            )
          : undefined;

      if (index % 5000 === 0) {
        console.log("buscando info para search chartmetric: ", index);
      }
      return spotifyBio
        ? {
            n: spotifyBio?.name,
            spt: spotifyBio?.id,
            img: spotifyBio?.images?.[0]?.url,
            cert: -1,
            cm_id: 0,
            cm_options: [],
            sn_urls: {},
          }
        : undefined;
    })
    .filter((a: any) => !!a && !!a.img);

  console.log(
    "Se encontraron nuevos chartmetric que toca buscar : ",
    scrappedSpotifyBioFilesUnique.length
  );
  crearArchivo(
    "./data/drive/2025/automatic/chartmetric_search.json",
    scrappedSpotifyBioFilesUnique
    // mergedSpotify.filter((s) => s.artist_downloaded === 0)
  );

  console.log("bio ", scrappedSpotifyBioFilesUnique.length);
}

function unirDriveConConfigFile() {
  // Se debe poner el JSON del CSV del drive completo
  const driveInfo = leerArchivo(
    "./data/drive/new_artists_drive_consolidado_prev.json"
  );

  // El archivo completo de configuración Spotify_bands.json
  const spotifyConfig = leerArchivo(
    "./data/scrapped/config/spotify_bands.json"
  );

  const driveSpotifyIds = driveInfo
    .map((drive: any) => drive.spotify_user)
    .filter((a: any) => !!a);

  const spotifyNewDiscovered = spotifyConfig.filter(
    (spotifyArtist: any) =>
      !driveSpotifyIds.find(
        (driveArtist: any) => driveArtist === spotifyArtist.spotify
      )
  );

  console.log(
    "♫ ♫ Drive: ",
    driveInfo.length,
    ", SpotifyConf: ",
    spotifyConfig.length,
    ", Drive Spoty: ",
    driveSpotifyIds.length,
    ", new: ",
    spotifyNewDiscovered.length
  );

  const newArtistsDriveRows = spotifyNewDiscovered.map(
    (spotifyConfig: any, index: number) => {
      const spotifyBio =
        spotifyConfig &&
        fs.existsSync(
          `./data/scrapped/spotify/bands/artist_bio/${spotifyConfig["artist_downloaded"]}_${spotifyConfig.spotify}.json`
        )
          ? leerArchivo(
              `./data/scrapped/spotify/bands/artist_bio/${spotifyConfig["artist_downloaded"]}_${spotifyConfig.spotify}.json`
            )
          : undefined;
      return {
        num: 113032 + index + 1,
        grupo: "",
        Prioridad: -1,
        popularity:
          spotifyBio?.popularity === undefined ? "" : spotifyBio?.popularity,
        followers:
          spotifyBio?.followers?.total === undefined
            ? ""
            : spotifyBio?.followers?.total,
        spotify_url: spotifyBio?.external_urls?.spotify || "",
        spotify_url_link: spotifyBio?.external_urls?.spotify || "",
        name: spotifyBio?.name || "",
        spotify_user: spotifyConfig.spotify,
        spotify_user_count: 1,
        chartmetric_url: "",
        chartmetric_user: "",
        chartmetric_error: "",
        chartmetric_user_count: "",
        instagram_url: "",
        instagram_user: "",
        "instagram_user count": "",
        youtube: "",
        tiktok: "",
        songkick: "",
        facebook: "",
        twitter: "",
        website: "",
        Inactivo: "",
        video_youtube: "",
      };
    }
  );

  // calculatePriority(newArtistsDriveRows, 100);

  console.log("FIN ", newArtistsDriveRows.length);

  crearArchivo(
    "./data/drive/2025/automatic/drive Nuevos Artistas (con descubrimientos).json",
    newArtistsDriveRows
    // mergedSpotify.filter((s) => s.artist_downloaded === 0)
  );
}

function consolidar_nuevos_artistas_dic() {
  // const scrappedSpotify = leerArchivo(
  //   "./data/scrapped/config/spotify_bands.json"
  // );

  // ========= Archivo de config en Drive (completo)
  const scrappedSpotifyComplete = leerArchivo(
    "./data/scrapped/config/spotify_bands_complete.json"
  );

  const scrappedChartmetric = leerArchivo(
    "./data/scrapped/config/chartmetric_bands.json"
  );
  // const diciembreSpotify = leerArchivo(
  //   "C:/Users/fnp/Desktop/diciembre/DataDiciembre/config/spotify_bands.json"
  // );
  // const diciembreChartmetric = leerArchivo(
  //   "C:/Users/fnp/Desktop/diciembre/DataDiciembre/config/chartmetric_bands.json"
  // );
  // const newArtistsEnero = leerArchivo(
  //   "./data/drive/2025/new_artists_20250108.json"
  // );

  // const spotifyEnero09 = leerArchivo("./data/drive/2025/Enero09/spotify.json");
  // const chartmetricEnero09 = leerArchivo(
  //   "./data/drive/2025/Enero09/chartmetric.json"
  // );

  // console.log("Scrapped Spotify: ", scrappedSpotify.length);
  console.log(
    "Scrapped Spotify scrappedSpotifyComplete ",
    scrappedSpotifyComplete.length
  );
  console.log("Scrapped scrappedChartmetric ", scrappedChartmetric.length);
  // console.log("diciembreSpotify ", diciembreSpotify.length);
  // console.log("diciembreChartmetric ", diciembreChartmetric.length);

  // ========================================= MERGE SPOTIFY
  const spotifyMap = new Map<string, SpotifyData>();

  // Función para actualizar o agregar un objeto en el Map
  const addOrUpdateSpotify = (data: SpotifyData) => {
    const existingData = spotifyMap.get(data.spotify);
    if (existingData) {
      // Si ya existe el spotify, comparamos los valores y tomamos el máximo
      existingData.downloaded = Math.max(
        existingData.downloaded,
        data.downloaded
      );
      existingData.artist_downloaded = Math.max(
        existingData.artist_downloaded,
        data.artist_downloaded
      );
    } else {
      // Si no existe, agregamos el nuevo objeto
      spotifyMap.set(data.spotify, { ...data });
    }
  };

  // Iteramos sobre ambas listas y agregamos o actualizamos el Map
  scrappedSpotifyComplete.forEach(addOrUpdateSpotify);
  // diciembreSpotify.forEach(addOrUpdateSpotify);
  // spotifyEnero09.forEach(addOrUpdateSpotify);

  // ========================================= MERGE CHARTMETRIC
  const chartmetricMap = new Map<string, ChartmetricData>();

  // Función para actualizar o agregar un objeto en el Map
  const addOrUpdateChartmetric = (data: ChartmetricData) => {
    const existingData = chartmetricMap.get(`${data.chartmetric}`);
    if (existingData) {
      // Si ya existe el spotify, comparamos los valores y tomamos el máximo
      existingData.downloaded = Math.max(
        existingData.downloaded,
        data.downloaded
      );
    } else {
      // Si no existe, agregamos el nuevo objeto
      chartmetricMap.set(`${data.chartmetric}`, { ...data });
    }
  };

  // Iteramos sobre ambas listas y agregamos o actualizamos el Map
  scrappedChartmetric.forEach(addOrUpdateChartmetric);
  // diciembreChartmetric.forEach(addOrUpdateChartmetric);
  // chartmetricEnero09.forEach(addOrUpdateChartmetric);

  // ===================================================================== Compare to newArtists
  // const faltantesScrapeConfigSpotify = newArtistsEnero.filter(
  //   (artistEnero: any) =>
  //     !!artistEnero.spotify && !spotifyMap.get(artistEnero.spotify)
  // );
  // const faltantesScrapeConfigChartmetric = newArtistsEnero.filter(
  //   (artistEnero: any) =>
  //     !!artistEnero.chartmetric &&
  //     !chartmetricMap.get(`${artistEnero.chartmetric}`)
  // );

  // console.log(
  //   "Faltantes desde Nuevos Artistas==>> ",
  //   faltantesScrapeConfigSpotify.length,
  //   faltantesScrapeConfigChartmetric.length
  // );

  // faltantesScrapeConfigSpotify
  //   .map((e: any) => {
  //     return { spotify: e.spotify, downloaded: 0, artist_downloaded: 0 };
  //   })
  //   .forEach(addOrUpdateSpotify);
  // faltantesScrapeConfigChartmetric
  //   .map((e: any) => {
  //     return { chartmetric: Number(e.chartmetric), downloaded: 0 };
  //   })
  //   .forEach(addOrUpdateChartmetric);

  // Al final, devolvemos la lista de objetos únicos con los valores máximos
  const mergedSpotify = Array.from(spotifyMap.values());
  mergedSpotify.sort((a, b) => a.spotify.localeCompare(b.spotify));

  console.log(
    "MERGED  ",
    mergedSpotify.filter((s) => s.downloaded === 0).length,
    " - ",
    mergedSpotify.filter((s) => s.artist_downloaded === 0).length,
    " / ",
    mergedSpotify.length
  );

  // Al final, devolvemos la lista de objetos únicos con los valores máximos
  const mergedChartmetric = Array.from(chartmetricMap.values());
  mergedChartmetric.sort((a, b) => a.chartmetric - b.chartmetric);

  console.log(
    "MERGED CM: ",
    mergedChartmetric.filter((s) => s.downloaded === 0).length,
    " / ",
    mergedChartmetric.length
  );

  crearArchivo(
    "./data/drive/2025/spotify_bands.json",
    mergedSpotify
    // mergedSpotify.filter((s) => s.artist_downloaded === 0)
  );
  crearArchivo("./data/drive/2025/chartmetric_bands.json", mergedChartmetric);
}

function calcular_artistas_mas_relacionados() {
  console.log("Organizando nuevos artistas por frecuencia...");
  const relatedFiles =
    fs.readdirSync("./data/scrapped/spotify/bands/artist_related") || [];

  const repeticionesMap = new Map<string, number>();

  console.log(relatedFiles.length);

  let print = 0;

  relatedFiles.forEach((fileName: string) => {
    const infoInicial = leerArchivo(
      `./data/scrapped/spotify/bands/artist_related/${fileName}`
    );
    const related =
      infoInicial?.data?.artistUnion?.relatedContent?.relatedArtists?.items ||
      [];

    related.forEach((relatedArtist: any) => {
      const id = relatedArtist?.id;
      repeticionesMap.set(id, (repeticionesMap.get(id) || 0) + 1);
    });
    if (print === 0) {
      console.log(
        `./data/scrapped/spotify/bands/artist_related/${fileName}`,
        related.length,
        Array.from(repeticionesMap.entries()).length
      );
    }
    print++;
  });

  // Convertir el Map a un array de objetos y ordenarlo por repeticiones descendente
  const repeticiones = Array.from(repeticionesMap.entries())
    .map(([id, reps]) => ({ id, reps }))
    .sort((a, b) => b.reps - a.reps);

  console.log("Total ", Array.from(repeticionesMap.entries()).length);
  crearArchivo(
    "./data/drive/2025/newArtists_sorted_reps.json",
    repeticiones.map((artista: any) => {
      return {
        spotify: artista.id,
        downloaded: 0,
        artist_downloaded: 0,
        // reps: artista.reps,
      };
    })
  );

  console.log("fin de nuevos artistas");
}

function consolidar_artistas_new_artist_completo() {
  console.log(
    "\n=====================    CONSOLIDAR ARTISTAS COMPLETO =========================\n\n",
    new Date()
  );

  // Todos los artistas en el drive
  const todosLosArtistas = leerArchivo(
    // "./data/drive/new_artists_drive_consolidado_prev.json"
    "./data/drive/2025/automatic/new/newDrive.json"
  );
  const infoInicial = leerArchivo("./data/drive/artists_drive_db_output.json");
  const driveInfo = leerArchivo("./data/drive/2025/drive_artists.json");
  console.log(todosLosArtistas.length, infoInicial.length);

  const configSpotifyArtists = leerArchivo(
    "./data/scrapped/config/spotify_bands.json"
  );

  const configChartmetricArtists = leerArchivo(
    "./data/scrapped/config/chartmetric_bands.json"
  );

  const countries = leerArchivo(`./data/geo/mongo/artist_hive.countries.json`);

  console.log(
    new Date(),
    "\n\n",
    "Config: ",
    todosLosArtistas.length,
    ", Info previa: ",
    infoInicial.length,
    ", Drive: ",
    driveInfo.length,
    ", Spotify: ",
    configSpotifyArtists.length,
    ", CM: ",
    configChartmetricArtists.length
  );

  const mocks = leerArchivo("./data/drive/artists_mock.json");

  const all = todosLosArtistas
    // .filter(
    //   (a: any) =>
    //     //     a.spotify_user === "27neIga89YKdkCk6Yzv0ni" ||
    //     //     a.spotify_user === "7cC14jlZcFQueGrGHDYg51" ||
    //     //     // a.spotify_user === "5OfRvW5SYGif5Q8LrklFjV" ||
    //     //     // a.instagram_user === "prevalecen" ||
    //     //     a.instagram_user === "lissdasilvaa"
    //     a.num === 393
    // )
    // .slice(0, 5000)
    .map((artistaConfig: any, artistIndex: number) => {
      // Drive
      const artistaDrive = !!artistaConfig.spotify_user
        ? driveInfo.find(
            (artistaEnDrive: any) =>
              (!!artistaConfig.spotify_user &&
                artistaEnDrive.spotify_user === artistaConfig.spotify_user) ||
              (!!artistaConfig.instagram_user &&
                artistaEnDrive.instagram_user === artistaConfig.instagram)
          )
        : undefined;

      const artistaInfoPrevia = infoInicial.find(
        (artistaEnInfoPrevia: any) =>
          (!!artistaConfig.spotify_user &&
            artistaEnInfoPrevia.spotify === artistaConfig.spotify_user) ||
          (!!artistaConfig.instagram_user &&
            !!artistaDrive &&
            !!artistaDrive.instagram_user &&
            !!artistaEnInfoPrevia.instagram &&
            artistaDrive.instagram_user === artistaEnInfoPrevia.instagram)
      );

      const artistaMock = artistaConfig?.spotify_user
        ? mocks.find(
            (artistaEnMock: any) =>
              artistaEnMock.spotify === artistaConfig?.spotify_user
          )
        : undefined;

      const artistaChartmetricConfig = !!artistaConfig?.chartmetric_user
        ? configChartmetricArtists.find(
            (artistEnCM: any) =>
              artistEnCM.chartmetric === artistaConfig?.chartmetric_user
          )
        : undefined;

      const chartmetricBio =
        artistaChartmetricConfig?.downloaded > 0 &&
        fs.existsSync(
          `./data/scrapped/chartmetric/bands/${artistaChartmetricConfig["downloaded"]}_${artistaChartmetricConfig["chartmetric"]}.json`
        )
          ? leerArchivo(
              `./data/scrapped/chartmetric/bands/${artistaChartmetricConfig["downloaded"]}_${artistaChartmetricConfig["chartmetric"]}.json`
            )
          : undefined;

      // console.log(
      //   artistaChartmetricConfig,
      //   // `./data/scrapped/chartmetric/bands/${artistaChartmetricConfig["downloaded"]}_${artistaChartmetricConfig["chartmetric"]}.json`,
      //   chartmetricBio
      // );

      // if (artistaChartmetricConfig?.downloaded > 0) {
      //   if (
      //     fs.existsSync(
      //       `./data/scrapped/chartmetric/bands/${artistaChartmetricConfig["downloaded"]}_${artistaChartmetricConfig["chartmetric"]}.json`
      //     )
      //   ) {
      //     // File exists in path
      //   } else {
      //     const scrappedChartmetricFiles =
      //       fs.readdirSync("./data/scrapped/chartmetric/bands") || [];

      //     const files = scrappedChartmetricFiles.filter((f) =>
      //       f.includes(`_${artistaChartmetricConfig["chartmetric"]}`)
      //     );

      //     if (!!files && files.length) {
      //       console.log("Se encontraron estos archivos: ", files);
      //     }
      //     console.log(
      //       `${artistaChartmetricConfig["downloaded"]}_${artistaChartmetricConfig["chartmetric"]}.json`
      //     );
      //     // File doesn't exist in path
      //   }
      // }

      const artistaSpotifyConfig = !!artistaConfig?.spotify_user
        ? configSpotifyArtists.find(
            (artistEnSpotifyConfig: any) =>
              artistEnSpotifyConfig.spotify === artistaConfig?.spotify_user
          )
        : undefined;

      const spotifyBio =
        artistaSpotifyConfig?.artist_downloaded > 0 &&
        fs.existsSync(
          `./data/scrapped/spotify/bands/artist_bio/${artistaSpotifyConfig["artist_downloaded"]}_${artistaSpotifyConfig.spotify}.json`
        )
          ? leerArchivo(
              `./data/scrapped/spotify/bands/artist_bio/${artistaSpotifyConfig["artist_downloaded"]}_${artistaSpotifyConfig.spotify}.json`
            )
          : undefined;

      const spotifyExtra =
        artistaSpotifyConfig?.downloaded > 0 &&
        fs.existsSync(
          `./data/scrapped/spotify/bands/artist_extra/${artistaSpotifyConfig["downloaded"]}_${artistaSpotifyConfig.spotify}.json`
        )
          ? leerArchivo(
              `./data/scrapped/spotify/bands/artist_extra/${artistaSpotifyConfig["downloaded"]}_${artistaSpotifyConfig.spotify}.json`
            )
          : undefined;

      const spotifyRelated =
        !!artistaConfig?.spotify_user &&
        fs.existsSync(
          `./data/scrapped/spotify/bands/artist_related/${artistaConfig.spotify}.json`
        )
          ? leerArchivo(
              `./data/scrapped/spotify/bands/artist_related/${artistaConfig.spotify}.json`
            )
          : undefined;

      const albums = spotifyExtra?.albums?.items || [];
      const lastAlbum =
        albums && albums.length > 0 ? albums[albums.length - 1] : null;

      const top_tracks = spotifyExtra
        ? spotifyExtra["top-tracks"]
        : { tracks: [] };

      const countryCode =
        artistaInfoPrevia?.["country"] ||
        artistaInfoPrevia?.initial?.obj?.code2;

      const artistCountryId = !!countryCode
        ? countries.find((country: any) => country.alpha2 === countryCode)?._id
        : null;

      const languages = !!countryCode
        ? countries.find((country: any) => country.alpha2 === countryCode)
            ?.languages
        : undefined;

      // console.log(
      //   "\n",
      //   artistaConfig?.name || "N.N.",
      //   "\nPrevia: ",
      //   !!artistaInfoPrevia,
      //   "Drive ",
      //   !!artistaDrive,
      //   "Mock ",
      //   !!artistaMock,
      //   "CM ",
      //   // artistaChartmetricConfig,
      //   !!chartmetricBio,
      //   "spt",
      //   // artistaSpotifyConfig,
      //   !!spotifyBio,
      //   "spt extra",
      //   // artistaSpotifyConfig,
      //   !!spotifyExtra,
      //   "related ",
      //   !!spotifyRelated
      // );

      // if (artistaConfig.instagram_user === "lissdasilvaa") {
      //   console.log("##### \n", artistaInfoPrevia, "\n\n\n", artistaDrive);
      // }

      const createdAt = new Date();

      if (artistIndex % 20000 === 0) {
        console.log("... ", artistIndex, " ....");
      }

      //   {
      //     "album_type": "album",
      //     "total_tracks": 20,
      //     "available_markets": [
      //     ],
      //     "external_urls": {
      //         "spotify": "https://open.spotify.com/album/7pLfqv8Fr604oPSrMax7t3"
      //     },
      //     "href": "https://api.spotify.com/v1/albums/7pLfqv8Fr604oPSrMax7t3",
      //     "id": "7pLfqv8Fr604oPSrMax7t3",
      //     "images": [
      //         {
      //             "url": "https://i.scdn.co/image/ab67616d0000b273397b1525e21d15cad7c804e7",
      //             "height": 640,
      //             "width": 640
      //         },
      //         {
      //             "url": "https://i.scdn.co/image/ab67616d00001e02397b1525e21d15cad7c804e7",
      //             "height": 300,
      //             "width": 300
      //         },
      //         {
      //             "url": "https://i.scdn.co/image/ab67616d00004851397b1525e21d15cad7c804e7",
      //             "height": 64,
      //             "width": 64
      //         }
      //     ],
      //     "name": "El Rey de la Montaña (Banda Sonora Original)",
      //     "release_date": "2023-09-22",
      //     "release_date_precision": "day",
      //     "type": "album",
      //     "uri": "spotify:album:7pLfqv8Fr604oPSrMax7t3",
      //     "artists": [
      //         {
      //             "external_urls": {
      //                 "spotify": "https://open.spotify.com/artist/1XPFAsXCMflKBKZuNIkru3"
      //             },
      //             "href": "https://api.spotify.com/v1/artists/1XPFAsXCMflKBKZuNIkru3",
      //             "id": "1XPFAsXCMflKBKZuNIkru3",
      //             "name": "Los Rolling Ruanas",
      //             "type": "artist",
      //             "uri": "spotify:artist:1XPFAsXCMflKBKZuNIkru3"
      //         }
      //     ],
      //     "album_group": "album"
      // },

      // export interface TrackTemplate {
      //   artists: ArtistInTrack[];
      //   album?: AlbumTemplate;
      //   disc_number: number;
      //   duration_ms: number;
      //   explicit: boolean;
      //   id: string;
      //   name: string;
      //   track_number: number;
      // }

      // export interface AlbumTemplate extends EntityTemplate {
      //   name: string;
      //   images: [
      //     {
      //       height: number | string;
      //       url: string;
      //       width: number | string;
      //     }
      //   ];
      //   release_date: string;
      //   release_date_precision: string;
      //   spotify: {
      //     id: string;
      //     url: string;
      //   };
      //   total_tracks: number;
      //   tracks: TrackTemplate[];
      // }

      const albumsInfo = albums.map((album: any) => {
        const albumInfo = fs.existsSync(
          `./data/scrapped/spotify/albums/${album.id}.json`
        )
          ? leerArchivo(`./data/scrapped/spotify/albums/${album.id}.json`)
          : undefined;

        return {
          name: album.name,
          images: album.images,
          release_date: album.release_date,
          release_date_precision: album.release_date_precision,
          spotify: {
            id: album.id,
            url: album.external_urls?.spotify,
          },
          total_tracks: album?.total_tracks,
          tracks:
            albumInfo?.tracks?.items?.map((track: any) => {
              return {
                artists: track.artists,

                disc_number: track.disc_number,
                duration_ms: track.duration_ms,
                explicit: track.explicit,
                id: track.id,
                name: track.name,
                track_number: track.track_number,
              };
            }) || [],
        };
      });

      return {
        _id: { $oid: new mongoose.Types.ObjectId().toHexString() },
        artistType: "musician",
        is_inactive:
          artistaInfoPrevia?.["is_inactive"] || artistaConfig["Inactivo"] || 0,
        num: artistaConfig["num"] || -1,
        name:
          spotifyBio?.name ||
          artistaInfoPrevia?.["name"] ||
          artistaConfig["name"] ||
          null,
        username:
          artistaInfoPrevia?.["username"] ||
          artistaConfig["instagram_user"] ||
          null,
        subtitle: artistaInfoPrevia?.["subtitle"] || "",
        verified_status: artistaInfoPrevia?.["verified_status"] || 1,
        profile_pic:
          artistaInfoPrevia?.["profile_pic"] ||
          (spotifyBio?.images?.length
            ? spotifyBio?.images?.[0].url
            : undefined) ||
          "",
        photo: artistaInfoPrevia?.["photo"] || "",
        description: cleanHtmlToString(
          chartmetricBio?.initial?.obj?.description ||
            artistaInfoPrevia?.["description"] ||
            ""
        ),

        country: artistCountryId,
        city: artistaInfoPrevia?.["city"] || artistaConfig["Inactivo"] || null,
        since:
          lastAlbum && lastAlbum.release_date
            ? `${lastAlbum.release_date}T00:00:00-05:00`
            : null,
        home_city: artistaInfoPrevia?.["home_city"] || "",
        genres: (!!spotifyBio?.genres?.length && {
          music: spotifyBio.genres,
        }) ||
          artistaInfoPrevia?.["genres"] || {
            music: [],
          },
        spoken_languages:
          languages || artistaInfoPrevia?.["spoken_languages"] || [],
        stage_languages:
          languages || artistaInfoPrevia?.["stage_languages"] || [],
        arts_languages:
          languages || artistaInfoPrevia?.["arts_languages"] || [],
        website:
          artistaInfoPrevia?.["website"] || artistaConfig["website"] || "",
        email: artistaInfoPrevia?.["email"] || artistaConfig["website"] || "",
        mobile_phone:
          artistaInfoPrevia?.["mobile_phone"] || artistaConfig["website"] || "",
        whatsapp:
          artistaInfoPrevia?.["whatsapp"] || artistaConfig["website"] || "",
        facebook:
          artistaInfoPrevia?.["facebook"] ||
          artistaConfig["website"] ||
          artistaConfig["facebook"] ||
          "",
        tiktok:
          artistaInfoPrevia?.["tiktok"] ||
          artistaConfig["website"] ||
          artistaConfig["tiktok"] ||
          "",
        twitter:
          artistaInfoPrevia?.["twitter"] || artistaConfig["twitter"] || "",
        twitch: artistaInfoPrevia?.["twitch"] || artistaConfig["website"] || "",
        instagram:
          artistaInfoPrevia?.["instagram"] ||
          artistaConfig["instagram_user"] ||
          "",
        spotify:
          artistaInfoPrevia?.["spotify"] || artistaConfig["spotify_user"] || "",
        soundcloud: artistaInfoPrevia?.["soundcloud"] || "",
        songkick:
          artistaInfoPrevia?.["songkick"] || artistaConfig["songkick"] || "",
        youtube:
          artistaInfoPrevia?.["youtube"] || artistaConfig["youtube"] || "",
        youtube_widget_id:
          artistaMock?.["youtube_widget_id"] ||
          artistaInfoPrevia?.["youtube_widget_id"] ||
          "",
        chartmetric:
          artistaInfoPrevia?.["chartmetric"] ||
          artistaConfig["chartmetric_user"] ||
          "",
        spotify_data: !!spotifyBio
          ? {
              followers: spotifyBio?.followers?.total || 0,
              name: spotifyBio?.name || 0,
              popularity: spotifyBio?.popularity || 0,
            }
          : artistaInfoPrevia?.["spotify_data"] || {},

        chartmetric_data: !!chartmetricBio
          ? {
              name: chartmetricBio?.initial?.obj?.name || "",
              sp_where_people_listen:
                chartmetricBio?.cmStats?.obj?.sp_where_people_listen,
              stats: chartmetricBio?.cmStats?.obj?.latest,
            }
          : artistaInfoPrevia?.["chartmetric_data"] || {},
        general_rate: Math.random() * 2 + 3,
        followers: 0,
        event_followers: 0,
        stats: {
          rating: {
            overall: Math.random() * 2 + 3,
            talent: Math.random() * 2 + 3,
            performance: Math.random() * 2 + 3,
            proffesionalism: Math.random() * 2 + 3,
            stage_presence: Math.random() * 2 + 3,
            charisma: Math.random() * 2 + 3,
            timeliness: Math.random() * 2 + 3,
            communication: Math.random() * 2 + 3,
            respectfulness: Math.random() * 2 + 3,
            total_rates: 269 + Math.floor(Math.random() * 2500),
          },
        },
        arts: {
          music: {
            albums: [], // albumsInfo,
            top_tracks: top_tracks,
            related_artist_spotify:
              spotifyRelated?.data?.artistUnion?.relatedContent?.relatedArtist
                ?.items ||
              artistaInfoPrevia?.arts?.music?.related_artist_spotify ||
              [],
          },
        },
        followed_by: [],
        followed_profiles: [],
        createdAt: createdAt,
        updatedAt: createdAt,
        __v: 0,
      };
    });

  // const fakeChartmetricFiles =
  //   fs.readdirSync("D:/har/scrapped/chartmetric/bands") || [];

  // const files = fakeChartmetricFiles.map((f) => {
  //   const partes = f.replace(".json", "").split("_");
  //   return partes[0] + " " + partes[1];
  // });

  // crearArchivo("./data/drive/2025/fake_chartmetric.json", files);

  console.log("Creando Database", new Date());

  // Función para dividir una lista en chunks de tamaño `size`
  function chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }
  const chunkSize = 1000000;

  // 🟢 Dividir `all` en partes de `chunkSize`
  const chunks = chunkArray(all, chunkSize);
  console.log("total chunks: ", chunks.length);
  // 🔹 Guardar cada chunk con un sufijo (_0, _1, _2, ...)
  chunks.forEach((chunk, index) => {
    console.log("   CHUNK ", index + 1);
    const filename = `./data/drive/2025/chunks/artists_db_${index}.json`;
    crearArchivo(filename, chunk);

    console.log("Creando índice Entity Directories (chunk) ", index + 1);

    crearArchivo(
      `./data/drive/2025/chunks/artists_db_entity_directory_${index}.json`,
      chunk.map((a: any) => {
        return {
          id: a._id,
          entityType: "Artist",
          profile_pic: a.profile_pic,
          name: a.name,
          username: a.username,
          subtitle: a.subtitle,
          verified_status: a.verified_status,
          isActive: a.isActive,
          location: [],
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          __v: 0,
        };
      })
    );
  });

  // crearArchivo("./data/drive/2025/artists_db.json", all);

  console.log(" FIN ", new Date());
}

function compilarAlbumes() {
  const spotify_config_data: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  ).filter((a: any) => a.downloaded > 0);

  let num = 0;
  const albums = spotify_config_data.map((config: any) => {
    const path = `./data/scrapped/spotify/bands/artist_extra/${config["downloaded"]}_${config.spotify}.json`;
    const spotifyBio =
      config?.downloaded > 0 && fs.existsSync(path)
        ? leerArchivo(path)
        : undefined;
    return spotifyBio?.albums?.items || [];
  });

  crearArchivo("./data/drive/2025/automatic/new/albums.json", albums);
  // .map((a: any) => a.albums);
  // .filter((a: any) => !!a);

  console.log(num);
  console.log(spotify_config_data.length);
}

function calculatePriority(artists: any[], segments: number) {
  // Encontrar el máximo de seguidores para normalización
  const maxFollowers = Math.max(...artists.map((artist) => artist.followers));

  // Pesos de popularidad y seguidores
  const weightPopularity = 0.7;
  const weightFollowers = 0.3;

  // Calcular prioridad para cada artista
  const artistsWithPriority = artists.map((artist) => {
    const normalizedFollowers = (artist.followers / maxFollowers) * 100;
    const priority =
      weightPopularity * artist.popularity +
      weightFollowers * normalizedFollowers;
    return { artist, priority };
  });

  // Ordenar por prioridad descendente
  artistsWithPriority.sort((a, b) => b.priority - a.priority);

  // Dividir en segmentos
  const segmentSize = artistsWithPriority.length / segments;
  return artistsWithPriority.map((item, index) => ({
    ...item,
    segment: Math.floor(index / segmentSize) + 1,
  }));
}

function consolidar_sitios() {
  const places_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/places_drive_04_25.json", "utf-8")
  );
  const continents = leerArchivo(
    `./data/geo/mongo/artist_hive.continents.json`
  );

  const countries = leerArchivo(`./data/geo/mongo/artist_hive.countries.json`);

  const nonEmptyFields = ["instagram", "spotify", "chartmetric", "name"];
  const existingDrivePlaces = places_drive_data.filter((place: any) => {
    return (
      !!place["location"] && nonEmptyFields.some((field) => !!place[field])
    );
  });

  const existingDrivePlacesOutput = existingDrivePlaces.map((place: any) => {
    const placeCountryInfo = !!place["country_alpha2"]
      ? countries.find(
          (country: any) => country.alpha2 === place["country_alpha2"]
        )
      : null;

    const continent = continents.find(
      (continent: any) =>
        placeCountryInfo?.continent?.["$oid"] === continent._id?.["$oid"]
    );

    return {
      name: place["name"] || "",
      username: place["instagram"] || "",
      place_type: place["place_type"] || "",
      music_genre: "",
      country: placeCountryInfo?._id || "",
      country_search: `${continent?.name || ""} ${
        continent?.i18n?.es?.name || ""
      }  ${continent?.i18n?.fr?.name || ""} ${
        continent?.i18n?.de?.name || ""
      }  ${placeCountryInfo?.name || ""} ${placeCountryInfo?.native || ""} ${
        placeCountryInfo?.i18n?.en?.name || ""
      } ${placeCountryInfo?.i18n?.fr?.name || ""} ${
        placeCountryInfo?.i18n?.de?.name || ""
      }`,
      country_name: place["country"] || "",
      country_alpha2: place["country_alpha2"] || "",
      state: place["state"] || "",
      city: place["city"] || "",
      address: place["address"] || "",
      address_complement: place["address_complement"] || "",
      district: place["district"] || "",
      neighbour: place["neighbour"] || "",
      zipcode: place["zipcode"] || "",
      location: place["location"] || "",

      "Sede principal": "",

      email: `${place["email"] || ""}`,
      phone: place["phone"] || "",
      public_private: "",
      facebook: `${place["facebook"] || ""}`,
      instagram: `${place["instagram"]}` || "",
      twitter: `${place["twitter"]}` || "",
      website: place["website"] || "",
      promoter: "",
      tiktok: place["tiktok"] || "",
      profile_pic: place["ig_img"] ? `s3://public/${place["ig_img"]}` : "",
      image_gallery: [
        { src: "s3://public/galeria/lp_1.jpg" },
        { src: "s3://public/galeria/lp_2.jpg" },
        { src: "s3://public/galeria/lp_3.jpg" },
        { src: "s3://public/galeria/lp_4.jpg" },
        { src: "s3://public/galeria/lp_5.jpg" },
      ],

      genres: {
        music: [
          // "salsa",
          // "timba",
          // "músicas improvisadas",
          // "jazz",
          // "fusiones",
          // "cumbia",
          // "porro",
          // "ska",
          // "crossover",
        ],
      },

      total_audience_capacity:
        place["total_audience_capacity"] === ""
          ? -1
          : Number(place["total_audience_capacity"]),

      stages: [
        {
          name: "main",
          dimensions: {
            height: 2,
            length: 2,
            width: 4,
            roof: 8,
            unitMeasure: "mts",
          },
          lights: {},
          video: {},
          screens: {},
        },
      ],
      backline: [
        {
          instrumentName: "Batería",
          components: [
            {
              name: "Bombo de 22 pulgadas",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "2 Bases de Snare 13 pulgadas",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "1 Tom de aire de 10 pulgadas",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "1 Tom de aire de 12 pulgadas",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "1 Tom de Piso de 14 pulgadas",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "1 Tom de Piso de 16 pulgadas",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "6 Bases para Platillos",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "1 Máquina de Hi-Hat",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "2 Pedales de Bombo",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "1 Silla de Batería",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "1 Alfombra de 2x2",
              amount: 3,
              brand: "Yamaha",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
          ],
          brands: ["Tama Starclassic", "DW Collector Series", "Yamaha Oak"],
        },
        {
          instrumentName: "Micrófonos",
          components: [
            {
              name: "Micrófono de voz SM58",
              amount: 3,
              brand: "Shure",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "Micrófono percusión SM57",
              amount: 5,
              brand: "Shure",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "Amplificador Bajo",
              amount: 1,
              brand: "Ampeg",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
            {
              name: "Cabina de sonido tarima",
              amount: 5,
              brand: "BEHRINGER",
              voltage: 110,
              power: 20,
              power_measure: "Watts",
              dimensions: {
                height: 4,
                length: 2,
                width: 3,
                unitMeasure: "mts",
                weight: 40,
                weightUnit: "kg",
              },
            },
          ],
        },
      ],
      dressing_room: {
        number_of_full_length_mirrors: 3,
        number_of_non_full_length_mirrors: 3,
        dimensions: {
          height: 2,
          length: 2,
          width: 4,
          roof: 8,
          unitMeasure: "mts",
        },
        lights: [],
        chairs: [],
        beds: [],
      },
      stats: {
        rating: {
          overall: Math.random() * 2 + 3,
          stage: Math.random() * 2 + 3,
          sound: Math.random() * 2 + 3,
          backline: Math.random() * 2 + 3,
          lights: Math.random() * 2 + 3,
          dressing_room: Math.random() * 2 + 3,
          hospitality_food: Math.random() * 2 + 3,
          hospitality_drinks: Math.random() * 2 + 3,
          timeliness: Math.random() * 2 + 3,
          communication: Math.random() * 2 + 3,
          transportation: Math.random() * 2 + 3,
          logistic: Math.random() * 2 + 3,
          location: Math.random() * 2 + 3,
          seating_capacity: Math.random() * 2 + 3,
          total_rates: Math.round(Math.random() * 10000),
        },
      },
    };
  });

  fs.writeFileSync(
    "./data/drive/places_drive_db_output2.json",
    JSON.stringify(
      existingDrivePlacesOutput.filter((place: any) => !!place.name),
      null,
      2
    ),
    "utf-8"
  );

  console.log("Creando índice Entity Directories (chunk) ");

  crearArchivo(
    `./data/drive/2025/chunks/places_db_entity_directory.json`,
    existingDrivePlacesOutput.map((p: any) => {
      const [latitude, long] = p.location.split(",").map(Number);
      return {
        id: p._id,
        entityType: "Place",
        profile_pic: p.profile_pic,
        name: p.name,
        username: p.username,
        subtitle: p.subtitle,
        verified_status: p.verified_status,
        isActive: p.isActive,
        search_cache: [p.name, p.username, p.country_search, p.city].join(" "),
        location: [
          {
            country_name: p.country_name,
            country_alpha2: p.country_alpha2,
            state: p.state,
            city: p.city,
            address: p.address,
            latitude: latitude,
            longitude: long,
            locationPrecision: "POINT",
          },
        ],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        __v: 0,
      };
    })
  );
}

function consolidar_artistas() {
  console.log(
    "=====================    CONSOLIDAR ARTISTAS ========================="
  );
  const artist_drive_data: any = leerArchivo(
    "./data/drive/new_artists_drive_consolidado_prev.json"
  );

  const nonEmptyFields = ["instagram", "spotify", "chartmetric", "name"];
  const existingDriveArtists = artist_drive_data.filter((artist: any) => {
    return nonEmptyFields.some((field) => !!artist[field]);
  });

  // check_status();
  const chartmetric_config_data: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/chartmetric_bands.json", "utf-8")
  );

  // find
  const spotify_config_data: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  );

  console.log("Artistas con al menos un dato: ", existingDriveArtists.length);

  const existingDriveArtistsOutput = existingDriveArtists.map(
    (artist: any, index: number) => {
      const spotify_artist_config_data = artist["spotify_user"]
        ? spotify_config_data.find(
            (spotify_config_artist: any) =>
              spotify_config_artist.spotify === artist["spotify_user"]
          )
        : undefined;

      let spotify_artist_data = undefined;
      let spotify_artist_extra_data = undefined;
      if (spotify_artist_config_data) {
        if (spotify_artist_config_data["artist_downloaded"] > 0) {
          spotify_artist_data = JSON.parse(
            fs.readFileSync(
              `./data/scrapped/spotify/bands/artist_bio/${spotify_artist_config_data["artist_downloaded"]}_${spotify_artist_config_data["spotify"]}.json`,
              "utf-8"
            )
          );
        }

        if (spotify_artist_config_data["downloaded"] > 0) {
          spotify_artist_extra_data = JSON.parse(
            fs.readFileSync(
              `./data/scrapped/spotify/bands/artist_extra/${spotify_artist_config_data["downloaded"]}_${spotify_artist_config_data["spotify"]}.json`,
              "utf-8"
            )
          );
        }
      }
      const chartmetric_artist_config_data = artist["chartmetric"]
        ? chartmetric_config_data.find(
            (chartmetric_config_artist: any) =>
              parseInt(chartmetric_config_artist.chartmetric) ===
              Number(artist["chartmetric"])
          )
        : undefined;

      let chartmetric_artist_data = undefined;
      if (
        chartmetric_artist_config_data &&
        chartmetric_artist_config_data["downloaded"] > 0
      ) {
        chartmetric_artist_data = JSON.parse(
          fs.readFileSync(
            `./data/scrapped/chartmetric/bands/${chartmetric_artist_config_data["downloaded"]}_${chartmetric_artist_config_data["chartmetric"]}.json`,
            "utf-8"
          )
        );
      }
      const albums = spotify_artist_extra_data?.albums?.items;
      const lastAlbum =
        albums && albums.length > 0 ? albums[albums.length - 1] : null;

      const top_tracks = spotify_artist_extra_data
        ? spotify_artist_extra_data["top-tracks"]
        : { tracks: [] };

      const related_artists = spotify_artist_extra_data
        ? spotify_artist_extra_data["related_artists"]
        : { artists: [] };

      if (index % 100 === 0) {
        console.log("artista ", index + 1, ": ", artist["name"]);
      }
      // return {}
      return {
        artistType: "musician",
        name: artist["name"] || "",
        username: artist["instagram"] || "",
        subtitle: "",
        verified_status: 1,
        profile_pic:
          (spotify_artist_data?.images || []).find(
            (image: any) => image.height === 640
          )?.url || "",
        photo: "",
        description: cleanHtmlToString(
          chartmetric_artist_data?.initial?.obj?.description || ""
        ),
        is_active:
          chartmetric_artist_data?.initial?.obj?.inactive ||
          artist["is_active"] ||
          "",

        country:
          chartmetric_artist_data?.initial?.obj?.code2 ||
          artist["country"] ||
          null,
        city: artist["city"] || "",

        since:
          lastAlbum && lastAlbum.release_date
            ? `${lastAlbum.release_date}T00:00:00-05:00`
            : null,
        home_city: "",
        genres: {
          music: spotify_artist_data?.genres || [],
        },
        spoken_languages: [],
        stage_languages: [],
        arts_languages: [],

        website: artist["website"] || "",
        email: artist["email"] || "",
        mobile_phone: artist["mobile_phone"] || "",
        whatsapp: artist["whatsapp"] || "",

        facebook: artist["facebook"] || "",
        tiktok: artist["tiktok"] || "",
        twitch: artist["twitch"] || "",
        instagram: artist["instagram"] || "",
        spotify: artist["spotify"] || "",
        soundcloud: artist["soundcloud"] || "",
        youtube: artist["youtube"] || "",
        youtube_widget_id: artist["youtube_widget_id"] || "",
        chartmetric: artist["chartmetric"] || "",

        spotify_data: {
          followers: spotify_artist_data?.followers?.total || 0,
          name: spotify_artist_data?.name || 0,
          popularity: spotify_artist_data?.popularity || 0,
        },
        chartmetric_data: {
          name: chartmetric_artist_data?.initial?.obj?.name || "",
          sp_where_people_listen:
            chartmetric_artist_data?.cmStats?.obj?.sp_where_people_listen,
          stats: chartmetric_artist_data?.cmStats?.obj?.latest,
        },

        general_rate: Math.random() * 2 + 3,
        followers: 0,
        event_followers: 0,
        stats: {
          rating: {
            overall: Math.random() * 2 + 3,
            talent: Math.random() * 2 + 3,
            performance: Math.random() * 2 + 3,
            proffesionalism: Math.random() * 2 + 3,
            stage_presence: Math.random() * 2 + 3,
            charisma: Math.random() * 2 + 3,
            timeliness: Math.random() * 2 + 3,
            communication: Math.random() * 2 + 3,
            respectfulness: Math.random() * 2 + 3,
            total_rates: 269 + Math.floor(Math.random() * 2500),
          },
        },
        arts: {
          music: {
            albums: [],
            top_tracks:
              top_tracks?.tracks.map((track: any) => {
                return {
                  album: {
                    album_type: "album",
                    artists: track.album.artists.map((artist: any) => {
                      return {
                        id: artist.id,
                        name: artist.name,
                      };
                    }),
                    //   [
                    //   {
                    //     // external_urls: {
                    //     //   spotify:
                    //     //     "https://open.spotify.com/artist/3UxjBvP0pvz35UevSs25eh",
                    //     // },
                    //     // href: "https://api.spotify.com/v1/artists/3UxjBvP0pvz35UevSs25eh",
                    //     // id: "3UxjBvP0pvz35UevSs25eh",
                    //     name: "Ennui Bogotá",
                    //     // type: "artist",
                    //     // uri: "spotify:artist:3UxjBvP0pvz35UevSs25eh",
                    //   },
                    // ],

                    // external_urls: {
                    //   spotify:
                    //     "https://open.spotify.com/album/0zhmVMJVKMddTgS9Lpm3Oj",
                    // },
                    // href: "https://api.spotify.com/v1/albums/0zhmVMJVKMddTgS9Lpm3Oj",
                    id: track.album.id,
                    images: track.album.images,
                    is_playable: true,
                    name: track.album.name,
                    release_date: track.album.release_date,
                    release_date_precision: track.album.release_date_precision,
                    total_tracks: track.album.total_tracks,
                    type: track.album.type,
                    // uri: "spotify:album:0zhmVMJVKMddTgS9Lpm3Oj",
                  },
                  artists: track.artists.map((artist: any) => {
                    return {
                      id: artist.id,
                      name: artist.name,
                    };
                  }),
                  // [
                  // {
                  //   external_urls: {
                  //     spotify:
                  //       "https://open.spotify.com/artist/3UxjBvP0pvz35UevSs25eh",
                  //   },
                  //   href: "https://api.spotify.com/v1/artists/3UxjBvP0pvz35UevSs25eh",
                  //   id: "3UxjBvP0pvz35UevSs25eh",
                  //   name: "Ennui Bogotá",
                  //   type: "artist",
                  //   uri: "spotify:artist:3UxjBvP0pvz35UevSs25eh",
                  // },
                  // ],

                  disc_number: track.disc_number,
                  duration_ms: track.duration_ms,
                  // explicit: false,
                  // external_ids: {
                  //   isrc: "PEBQ91612219",
                  // },
                  // external_urls: {
                  //   spotify:
                  //     "https://open.spotify.com/track/7aGijbDrGiQljyhW1uzzPC",
                  // },
                  // href: "https://api.spotify.com/v1/tracks/7aGijbDrGiQljyhW1uzzPC",
                  id: track.id,
                  // is_local: false,
                  // is_playable: true,
                  name: track.name,
                  popularity: track.popularity,
                  // preview_url:
                  //   "https://p.scdn.co/mp3-preview/260585c09c913acf2fbf16459a2745dc0023b055?cid=443b515a44c7481c883ae25f747e80ca",
                  track_number: track.track_number,
                  type: track.type,
                  // uri: "spotify:track:7aGijbDrGiQljyhW1uzzPC",
                };
              }) || [],
            related_artist_spotify:
              related_artists?.artists.map((artist: any) => artist.id) || [],
          },
        },
      };
    }
  );

  crearArchivo(
    "./data/drive/2025/automatic/allArtists (Completo).json",
    existingDriveArtistsOutput
    // mergedSpotify.filter((s) => s.artist_downloaded === 0)
  );

  /*
  fs.writeFileSync(
    "./data/drive/artists_drive_db_output.json",
    JSON.stringify(
      existingDriveArtistsOutput.filter((artist: any) => !!artist.name),
      // .slice(0, 20),
      null,
      2
    ),
    "utf-8"
  );

  fs.writeFileSync(
    "./data/drive/artists_drive_spotify.json",
    JSON.stringify(
      existingDriveArtistsOutput
        .filter((artist: any) => !!artist.spotify)
        .map((artist: any) => artist.spotify),
      null,
      2
    ),
    "utf-8"
  );

  fs.writeFileSync(
    "./data/drive/artists_drive_chartmetric.json",
    JSON.stringify(
      existingDriveArtistsOutput
        .filter((artist: any) => !!artist.chartmetric)
        .map((artist: any) => artist.chartmetric),
      null,
      2
    ),
    "utf-8"
  );
  */
}

function consolidar_spotify_ids_para_scrapping() {
  const artist_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive_spotify.json", "utf-8")
  );
  const spotify_config: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  );

  console.log(artist_drive_data.length, spotify_config.length);

  artist_drive_data.forEach((driveSpotifyID: string) => {
    const artistInConfig = spotify_config.find(
      (artist_config: any) => artist_config.spotify === driveSpotifyID
    );
    if (!artistInConfig) {
      console.log(driveSpotifyID);
      spotify_config.push({ spotify: driveSpotifyID, downloaded: 0 });
    }
  });

  fs.writeFileSync(
    "./data/scrapped/config/spotify_bands.json",
    JSON.stringify(spotify_config, null, 2),
    "utf-8"
  );
}

function consolidar_chartmetric_ids_para_scrapping() {
  const artist_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive_chartmetric.json", "utf-8")
  );
  const chartmetric_config: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/chartmetric_bands.json", "utf-8")
  );

  console.log(artist_drive_data.length, chartmetric_config.length);

  artist_drive_data.forEach((driveChartmetricID: number) => {
    const artistInConfig = chartmetric_config.find(
      (artist_config: any) => artist_config.chartmetric === driveChartmetricID
    );
    if (!artistInConfig) {
      // console.log(driveChartmetricID);
      chartmetric_config.push({
        chartmetric: driveChartmetricID,
        downloaded: 0,
      });
    }
  });

  fs.writeFileSync(
    "./data/scrapped/config/chartmetric_bands.json",
    JSON.stringify(
      chartmetric_config.filter((artist: any) => !!artist.chartmetric),
      null,
      2
    ),
    "utf-8"
  );
}

function simple_stats() {
  const path =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2022/bookmarks/ah-mock-api/assets/mocks/parametrics/general/countries/fullCountriesTips.json";
  const data: any = JSON.parse(fs.readFileSync(path, "utf-8"));
  // console.log(
  //   "Total paiese ",
  //   data.filter((pais: any) => !pais.alpha2).map((pais: any) => pais.name)
  // );

  const dataArtists: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive_db_output.json", "utf-8")
  );
  const countryCounts = dataArtists.reduce(
    (counts: { [key: string]: number }, artist: any) => {
      const country = artist.country;
      counts[country] = (counts[country] || 0) + 1;
      return counts;
    },
    {}
  );

  // Convertimos a un array de [país, conteo], ordenamos y luego convertimos a objeto nuevamente
  const sortedCountryCounts = Object.entries(countryCounts)
    .sort(([, a], [, b]) => Number(b) - Number(a)) // Orden descendente
    .reduce((acc, [country, count]) => {
      acc[country] = Number(count) / 10;
      return acc;
    }, {} as { [key: string]: number });

  console.log("Artistas");
  console.log(sortedCountryCounts);

  const dataPlaces: any = JSON.parse(
    fs.readFileSync("./data/drive/places_drive_db_output.json", "utf-8")
  );
  const countryCountsPlaces = dataPlaces.reduce(
    (counts: { [key: string]: number }, place: any) => {
      const country = place.country_alpha2;
      counts[country] = (counts[country] || 0) + 1;
      return counts;
    },
    {}
  );

  // Convertimos a un array de [país, conteo], ordenamos y luego convertimos a objeto nuevamente
  const sortedCountryCountsPlaces = Object.entries(countryCountsPlaces)
    .sort(([, a], [, b]) => Number(b) - Number(a)) // Orden descendente
    .reduce((acc, [country, count]) => {
      acc[country] = Number(count);
      return acc;
    }, {} as { [key: string]: number });

  console.log("Places");
  console.log(sortedCountryCountsPlaces);

  const paises: any[] = [
    // "mx",
    // "us",
    // "es",
    // "ar",
    // "cl",
    // "be",
    // "fr",
    // "de",
    // "gb",
    // "br",
    // "ve",
    // "ec",
    // "it",
    // "se",
    // "pr",
    // "nl",
    // "ca",
    // "au",
    // "ch",
    // "cr",
    // "tr",
  ];

  paises.forEach((pais) => {
    console.log(
      "==============   ",
      pais,
      "    ==========\n",
      dataArtists
        .filter((artist: any) => artist.country === pais)
        .map((artist: any) => artist.username)
    );
  });
}
function extract_ah_ids() {
  const places_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/places_drive_db_output.json", "utf-8")
  );
  const artists_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive_db_output.json", "utf-8")
  );

  const artists = artists_drive_data
    .map((artist: any) => artist.username)
    .filter((v: any) => !!v);
  const places = places_drive_data
    .map((place: any) => place.username)
    .filter((v: any) => !!v);

  fs.writeFileSync(
    "./data/drive/ah_ids.json",
    JSON.stringify({ artists, places }, null, 2),
    "utf-8"
  );
}

function juntarArtistasAutomaticosYManuales() {
  const allArtists: any = JSON.parse(
    fs.readFileSync("./data/drive/all_artists.json", "utf-8")
  );

  const spotify_config_artist: any = JSON.parse(
    fs.readFileSync(
      "./data/scrapped/config/spotify_bands_complete.json",
      "utf-8"
    )
  );
  // Encontrar el máximo de seguidores para normalización
  const maxFollowers = Math.max(
    ...allArtists.map((artist: any) => artist.followers)
  );

  // Pesos de popularidad y seguidores
  const weightPopularity = 0.7;
  const weightFollowers = 0.3;

  allArtists.forEach((artist: any) => {
    if (!!artist.spotify_user && !Number(artist.popularity)) {
      const artistConfig = spotify_config_artist.find(
        (sa: any) => sa.spotify === artist.spotify_user
      );
      if (artistConfig) {
        let artistInfo: any;
        try {
          artistInfo = JSON.parse(
            fs.readFileSync(
              `./data/scrapped/spotify/bands/artist_bio/${artistConfig.artist_downloaded}_${artistConfig.spotify}.json`,
              "utf-8"
            )
          );
        } catch (e) {}

        artist.popularity = artistInfo?.popularity || 0;
        artist.followers = artistInfo?.followers?.total || 0;
      }
    }
    artist.popularity = Number(artist.popularity);

    artist.followers = Number(artist.followers);
    const normalizedFollowers = (artist.followers / maxFollowers) * 100;

    artist.priority = Math.round(
      weightPopularity * artist.popularity +
        weightFollowers * normalizedFollowers
    );
    const segment_interval = 5;
    artist.priority_group =
      Math.floor(artist.priority / segment_interval) * segment_interval;
  });

  console.log(
    allArtists.reduce((frequencies: any, artist: any) => {
      // Incrementar el conteo de la prioridad actual
      frequencies[artist.priority_group] =
        (frequencies[artist.priority_group] || 0) + 1;
      return frequencies;
    }, {})
  );

  console.log(
    Math.max(...allArtists.map((artist: any) => artist.priority)),
    Math.min(...allArtists.map((artist: any) => artist.priority))
  );

  // const sorted = [...allArtists].sort((a: any, b: any) => {
  //   let popularity = b.popularity - a.popularity;
  //   let followers = b.followers - a.followers;
  //   if (popularity === 0) {
  //     return followers;
  //   }
  //   return popularity;
  // });

  // allArtists.forEach((artist: any) => {
  //   artist.priority_group = sorted.findIndex((a: any) => a.num === artist.num);
  // });

  fs.writeFileSync(
    "./data/drive/all_artists_filled.json",
    JSON.stringify(allArtists, null, 2),
    "utf-8"
  );
  console.log("Total: ", allArtists.length, !Number(12));
}

function consolidarAlbums() {
  // const configSpotifyArtists = leerArchivo(
  //   "./data/scrapped/config/spotify_bands.json"
  // ).filter((a: any) => a.downloaded > 0);

  // const albumsList: string[] = [];
  // const albumsAllArtist = configSpotifyArtists.forEach(
  //   (configA: any, artistIndex: number) => {
  //     const extraInfoFile = `./data/scrapped/spotify/bands/artist_extra/${configA.downloaded}_${configA.spotify}.json`;
  //     const extraInfo = fs.existsSync(extraInfoFile)
  //       ? leerArchivo(extraInfoFile)
  //       : undefined;

  //     if (artistIndex === 10) {
  //       console.log(extraInfoFile, extraInfo);
  //     }
  //     const albumsInArtist =
  //       extraInfo?.albums?.items?.filter(
  //         (album: any) => album.album_type === "album"
  //       ) || [];

  //     albumsInArtist.forEach((album: any) => {
  //       albumsList.push(album.id);
  //     });
  //   }
  // );
  // // .filter((x: any) => !!x);

  // console.log(
  //   // albumsAllArtist.length,
  //   albumsList.length,
  //   [...new Set(albumsList)].length
  // );

  // const albumsDir = fs.readdirSync("./data/scrapped/spotify/albums");
  const bioPath = "./data/scrapped/spotify/bands/artist_extra";
  const biosDir = fs.readdirSync(bioPath);

  const biosMap = new Map<string, any>();

  console.log("Total archivos por leer: ", biosDir.length);

  biosDir.forEach((bioFile: any, artistIndex: number) => {
    try {
      const spotifyId = bioFile.replace(".json", "").split("_")[1];
      const extraInfo = fs.existsSync(`${bioPath}/${bioFile}`)
        ? leerArchivo(`${bioPath}/${bioFile}`)
        : undefined;

      if (artistIndex + (1 % 1000) === 0) {
        console.log(extraInfo);
      }
      const albumsInArtist = (
        extraInfo?.albums?.items?.filter(
          (album: any) => album.album_type === "album"
        ) || []
      ).map((album: any) => {
        const albumInfo = fs.existsSync(
          `./data/scrapped/spotify/albums/${album.id}.json`
        )
          ? leerArchivo(`./data/scrapped/spotify/albums/${album.id}.json`)
          : undefined;

        return {
          name: album.name,
          images: album.images,
          release_date: album.release_date,
          release_date_precision: album.release_date_precision,
          spotify: {
            id: album.id,
            url: album.external_urls?.spotify,
          },
          total_tracks: album?.total_tracks,
          tracks:
            albumInfo?.tracks?.items?.map((track: any) => {
              return {
                artists: track.artists,

                disc_number: track.disc_number,
                duration_ms: track.duration_ms,
                explicit: track.explicit,
                id: track.id,
                name: track.name,
                track_number: track.track_number,
              };
            }) || [],
        };
      });

      if (albumsInArtist.length > 0) {
        biosMap.set(spotifyId, albumsInArtist);
      }
    } catch (error) {
      console.log("ERROR...... ", artistIndex, "  ", `${bioPath}/${bioFile}`);
      console.log(error);
      throw Error("Parar");
    }
  });

  crearArchivo(
    "./data/drive/2025/automatic/spotify/albumsConsolidado.json",
    Array.from(biosMap, ([spotify, albums]) => ({
      spotify,
      albums,
    }))
  );

  console.log("Total: ", biosDir.length, biosMap.size);
}

function convertAlbumsToDatabase() {
  const info = leerArchivo(
    "./data/drive/2025/automatic/spotify/albumsConsolidado.json"
  );
  // console.log(JSON.stringify(info[0].albums, null, 2));

  const albumsMap = new Map<string, any>();
  let totalDescargados = 0;

  info.forEach((artist: any) => {
    artist.albums.forEach((album: any) => {
      if (
        true ||
        album.spotify.id === "000uAiBjY6I5LQnPBHyytH" ||
        album.spotify.id === "7fJEer6X6zpSWW7Rbm2w7t"
      ) {
        const albumFile = `./data/scrapped/spotify/albums/${album.spotify.id}.json`;
        const albumDownloadedInfo = fs.existsSync(albumFile)
          ? leerArchivo(albumFile)
          : undefined;

        let artistsIds = albumDownloadedInfo?.artists?.map(
          (artistInAlbum: any) => artistInAlbum.id
        ) || [artist.spotify];

        // console.log("ARTIST !!!!!! !!!! ", artist);

        const tracks = (albumDownloadedInfo?.tracks?.items || []).map(
          (track: any) => {
            const { disc_number, duration_ms, id, name, track_number } = track;
            return {
              artists: track.artists.map((artistTrack: any) => {
                return { name: artistTrack.name, id: artistTrack.id };
              }),
              // Disc numbers
              d_n: disc_number,
              // Duration
              dur: duration_ms,
              id,
              // Name
              n: name,
              // Track number
              num: track_number,
            };
          }
        );

        const albumFinalInfo = {
          // Album Id
          aId: album.spotify.id,
          // name
          n: albumDownloadedInfo?.name || album.name,
          // Artist Spotify Ids
          asp: artistsIds,
          // Images
          img: (album.images || []).map((image: any) => {
            return {
              url: image.url.replace("https://i.scdn.co/image/", ""),
              s: image.height,
            };
          }),
          // Release date
          rd: album.release_date,
          // Release date
          rdp: album.release_date_precision,
          // Total Tracks
          nt: album.total_tracks,
          // Tracks
          t: tracks,
          // Label
          lab: albumDownloadedInfo?.label,
          // Index
          idx: artistsIds.join(","),
        };

        if (!albumsMap.get(albumFinalInfo.aId)) {
          albumsMap.set(albumFinalInfo.aId, albumFinalInfo);
        }
      }
    });
  });

  // Función para dividir una lista en chunks de tamaño `size`
  function chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  }
  const chunkSize = 150000;

  // 🟢 Dividir `all` en partes de `chunkSize`
  const chunks = chunkArray(Array.from(albumsMap.values()), chunkSize);
  console.log("Total albums: ", albumsMap.size);
  console.log("total chunks: ", chunks.length);

  chunks.forEach((chunk, chunkNumber) => {
    crearArchivo(
      `./data/drive/2025/automatic/spotify/albums/albumsConsolidado_db_${chunkNumber}.json`,
      Array.from(chunk)
    );
  });
}

// ============================   Related  ===================================

function convertRelatedArtistsId() {
  const data = leerArchivo(
    "./data/drive/2025/chunks/export/artist_hive.artists.json"
  );
  const videos = leerArchivo("./data/drive/2025/chunks/export/yt_videos.json");

  const spotifyIds: Record<string, any> = {};
  const numIds: Record<string, any> = {};

  const idsArray = data
    .filter((artist: any) => !!artist?.spotify)
    .map((artist: any) => {
      return { spotify: artist.spotify, dbid: artist["_id"]["$oid"] };
    });

  idsArray.forEach((artist: any) => (spotifyIds[artist.spotify] = artist.dbid));
  data.forEach((artist: any) => (numIds[artist.num] = artist));

  const related = data.filter(
    (artist: any) => artist?.arts?.music?.related_artist_spotify?.length
  );

  related.forEach((artist: any) => {
    numIds[artist.num].arts.music.related_artists =
      artist?.arts?.music?.related_artist_spotify.map(
        (relatedArtist: string) => spotifyIds[relatedArtist]
      );
  });

  videos.forEach((video: any) => {
    numIds[video.num].youtube_widget_id =
      numIds[video.num].youtube_widget_id || video.video_youtube_auto;
  });

  crearArchivo(
    "./data/drive/2025/chunks/export/artist_hive.artists_related.json",
    data
  );
}

// =========================== CONFIG FILES =================================

function generateSpotifyConfigFileFromFiles() {
  const dirPath = `./data/scrapped/spotify/bands`;

  const spotifyConfig: Record<string, any> = {}; // Diccionario por spotify ID
  const sliceLimit = 1000000;
  const logModule = 10000;

  console.log("BIOS....");
  const bios = fs.readdirSync(`${dirPath}/artist_bio`).reverse();

  bios.slice(0, sliceLimit).forEach((bioFile: string, index: number) => {
    const parts = bioFile.replace(".json", "").split("_");
    const spotifyId = parts[1];
    const artistDownloaded = Number(parts[0]);

    if (spotifyConfig[spotifyId]) {
      spotifyConfig[spotifyId].artist_downloaded = Math.max(
        artistDownloaded,
        spotifyConfig[spotifyId].artist_downloaded
      );
    } else {
      spotifyConfig[spotifyId] = {
        spotify: spotifyId,
        downloaded: 0,
        artist_downloaded: artistDownloaded,
        related_downloaded: 0,
      };
    }

    if (index % logModule === 0) {
      console.log(index);
    }
  });
  console.log("EXTRAS....");

  const extras = fs.readdirSync(`${dirPath}/artist_extra`).reverse();

  extras.slice(0, sliceLimit).forEach((bioFile: string, index: number) => {
    const parts = bioFile.replace(".json", "").split("_");
    const spotifyId = parts[1];
    const downloaded = Number(parts[0]);

    if (spotifyConfig[spotifyId]) {
      spotifyConfig[spotifyId].downloaded = Math.max(
        downloaded,
        spotifyConfig[spotifyId].downloaded
      );
    } else {
      spotifyConfig[spotifyId] = {
        spotify: spotifyId,
        downloaded: downloaded,
        artist_downloaded: 0,
        related_downloaded: 0,
      };
    }

    if (index % logModule === 0) {
      console.log(index);
    }
  });

  console.log("RELATED....");
  const related = fs.readdirSync(`${dirPath}/artist_related`);

  related.slice(0, sliceLimit).forEach((bioFile: string, index: number) => {
    const parts = bioFile.replace(".json", "").split("_");
    const spotifyId = parts[1];
    const relatedDownloaded = 100;

    if (spotifyConfig[spotifyId]) {
      spotifyConfig[spotifyId].related_download = Math.max(
        relatedDownloaded,
        spotifyConfig[spotifyId].related_download
      );
    } else {
      spotifyConfig[spotifyId] = {
        spotify: spotifyId,
        downloaded: 0,
        artist_downloaded: 0,
        related_downloaded: relatedDownloaded,
      };
    }

    if (index % logModule === 0) {
      console.log(index);
    }
  });

  console.log(bios.length, " vs ", Object.values(spotifyConfig).length);

  crearArchivo(
    `./data/scrapped/config/new/sportify_bands.json`,
    Object.values(spotifyConfig)
  );

  // console.log(spotifyConfig);
}

function reassingDBIdsInEvents() {
  const eventos = leerArchivo(
    "./data/drive/2025/chunks/export/artist_hive.events.json"
  );
  const artistas = leerArchivo(
    "./data/drive/2025/chunks/export/artist_hive.artists.json"
  );
  const places = leerArchivo(
    "./data/drive/2025/chunks/export/artist_hive.places.json"
  );

  eventos.forEach((evento: any) => {
    const pos = Math.floor(Math.random() * places.length);
    evento.place = places[pos]._id;

    evento.artists.map((art: any) => {
      const posA = Math.floor(Math.random() * artistas.length);
      return artistas[posA]._id;
    });
  });

  console.log(eventos[0]);

  crearArchivo(
    "./data/drive/2025/chunks/export/artist_hive.events_new.json",
    eventos
  );
}
