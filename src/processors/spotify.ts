import * as fs from "fs";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

export function main(args?: any) {
  // extractAlbumsIDs();
  // processGenres_batch_scrapping();
  // process_batch_scrapping_extra_info();
  // extractNonScrappedAlbumsIDs();
  // extractNonScrappedAlbumsIDsCompilation();
  // unifyScrappedArtistsData();
  // ------------------------------------------------------
  // scrapeRelatedArtists();
  // whichArtistsLeftForRelatedArtists();
  // discoverNewArtistsFromRelated();
}
export function discoverNewArtistsFromRelated() {
  const inDriveDB = leerArchivo(
    // `./data/drive/2025/02 - 06/spotify_drive_new_artists.json`
    `./data/scrapped/config/spotify_bands_complete.json`
  );

  const scrappedRelatedArtists =
    fs.readdirSync("./data/scrapped/spotify/bands/artist_related") || [];

  let newArtists: any[] = [];
  scrappedRelatedArtists.forEach((artistRelated: string) => {
    newArtists = [
      ...newArtists,
      ...leerArchivo(
        `./data/scrapped/spotify/bands/artist_related/${artistRelated}`
      )?.data?.artistUnion?.relatedContent?.relatedArtists?.items.map(
        (artist: any) => artist.id
      ),
    ];
  });
  newArtists = [...new Set(newArtists)].filter(
    (newArtist: string) =>
      !inDriveDB.find(
        (existingArtist: any) => existingArtist.spotify === newArtist
      )
  );
  console.log("Nuevos artistas identificados: ", newArtists.length);

  crearArchivo(
    "./data/drive/2025/02 - 06/newArtists.txt",
    newArtists.map((a: any) => {
      return { spotify: a, downloaded: 0, artist_downloaded: 0 };
    })
  );
}
export function scrapeRelatedArtists() {
  console.log("\n Artistas relacionados:");
  const assets_folder =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/har_logs/correctos_utf8";

  const scrappedRelatedArtists = fs.readdirSync(assets_folder) || [];

  let total = 0;
  scrappedRelatedArtists.forEach((artist: any) => {
    try {
      const dataHAR = leerArchivo(`${assets_folder}/${artist}`);
      const relatedArtistJSON = (dataHAR?.log?.entries || []).find(
        (entry: any) =>
          entry.request?.url?.includes(
            "https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistRelated"
          ) && entry?.request?.method === "GET"
      )?.response?.content?.text;

      if (relatedArtistJSON) {
        crearArchivo(
          `./data/scrapped/spotify/bands/artist_related/${artist.replace(
            ".har",
            ""
          )}.json`,
          JSON.parse(relatedArtistJSON)
        );
        total++;
      } else {
        fs.rmSync(`${assets_folder}/${artist}`);
        console.log("ERROR: ", artist, " => archivo eliminado");
      }
    } catch (error) {
      console.log("ERROR ", artist);
    }
  });
  console.log("Total: ", total);
}

export function whichArtistsLeftForRelatedArtists() {
  const inDriveDB = leerArchivo(
    `./data/scrapped/config/spotify_bands_complete.json`
  );

  const assets_folder =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/har_logs/correctos_utf8";

  const scrappedRelatedArtists = fs.readdirSync(assets_folder);

  const filteredArtists = inDriveDB
    .filter(
      (inDB: any) =>
        !scrappedRelatedArtists.find((scrappedArtist) =>
          scrappedArtist.includes(inDB.spotify)
        )
    )
    .sort((a: any, b: any) => {
      if (a.spotify.toLowerCase() < b.spotify.toLowerCase()) {
        return -1;
      }
      if (a.spotify.toLowerCase() > b.spotify.toLowerCase()) {
        return 1;
      }
      return 0;
    });

  const delta = 7000;
  let inicio = 0;
  crearArchivo(
    "./data/drive/2025/02 - 06/to Python scrapper.txt",
    filteredArtists
      .slice(inicio, inicio + delta)
      .map((a: any) => a.spotify)
      .join("\n"),
    false
  );
  crearArchivo(
    "./data/drive/2025/02 - 06/to Python scrapper 2.txt",
    filteredArtists
      .slice(inicio + delta, inicio + delta * 2)
      .map((a: any) => a.spotify)
      .join("\n"),
    false
  );
  crearArchivo(
    "./data/drive/2025/02 - 06/to Python scrapper 3.txt",
    filteredArtists
      .slice(inicio + delta * 2, inicio + delta * 3)
      .map((a: any) => a.spotify)
      .join("\n"),
    false
  );

  console.log(
    "Spotify related artists: ",
    inDriveDB.length,
    scrappedRelatedArtists.length,
    filteredArtists.length
  );
}
export function unifyScrappedArtistsData() {
  const alreadyScrapped = leerArchivo(
    `./data/drive/2025/02 - 06/drive_spotify_config.json`
  );
  const inDriveDB = leerArchivo(
    `./data/drive/2025/02 - 06/spotify_drive_new_artists.json`
  );

  console.log("NEW ARTSTS Spotify: ", inDriveDB.length, alreadyScrapped.length);
}

export function extractNonScrappedAlbumsIDsCompilation() {
  const albumsDescargados = leerArchivo(
    `C:/Users/fnp/Documents/Proyectos/QuarenDevs/2022/bookmarks/ah-mock-api/assets/mocks/domain/artists/tracksByAlbumList_04_09_2024.json`
  );

  const listaCompleta = leerArchivo("./data/drive/2025/spotify_albums.json");

  const listaFaltantes = listaCompleta.filter(
    (porDescargar: string) =>
      !Object.keys(albumsDescargados).find(
        (descargado: string) => descargado === porDescargar
      )
  );

  console.log(
    " ALBUMS descargados: ",
    Object.keys(albumsDescargados).length,
    listaCompleta.length,
    listaFaltantes.length
  );

  crearArchivo(
    "./data/drive/2025/spotify_albums_faltantes.json",
    listaFaltantes.map((id: string) => {
      return { albumID: id, downloaded: 0 };
    })
  );
}

export function extractAlbumsIDs() {
  const data: any = JSON.parse(
    fs.readFileSync("./data/spotify/output_20_08_2024.json", "utf-8")
  );

  console.log("hay ", Object.keys(data).length, " en spotify");
  let albumsIds: string[] = [];

  Object.keys(data).forEach((artistSpotifyId) => {
    const artistInfo = data[artistSpotifyId];
    if (artistInfo?.albums?.total > 0) {
      const currentArtistAlbums = artistInfo?.albums?.items
        // .filter((album: any) => album.total_tracks > 20)
        .map((album: any) => album.id);
      albumsIds = [...albumsIds, ...currentArtistAlbums];
    }
  });

  fs.writeFileSync(
    "./data/spotify/albums/ids_04_09_2024.json",
    JSON.stringify(albumsIds, null, 2),
    "utf-8"
  );
}

export function process_batch_scrapping_extra_info() {
  const scrapped_spotify_config: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  );
  const drive_artists_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive.json", "utf-8")
  );

  const newArtists: any[] = [];
  let albumsList: string[] = [];
  let singlesList: string[] = [];
  let numArtistas = 0;

  let stats: { [key: string]: number } = {};

  const nf = new Intl.NumberFormat("es-MX");

  let printData = true;
  console.log(
    " Total de todo: ",
    scrapped_spotify_config.length,
    scrapped_spotify_config.filter((a: any) => !!a.downloaded).length,

    "\n\n"
    // scrapped_spotify_config[100]
  );
  scrapped_spotify_config.forEach(
    (artist_scrapped_spotify_config: {
      spotify: string;
      downloaded: number;
      artist_downloaded: number;
    }) => {
      const artist_drive_info = drive_artists_data.find(
        (drive_artist: any) =>
          drive_artist.spotify === artist_scrapped_spotify_config.spotify
      );

      if (artist_scrapped_spotify_config["downloaded"] > 0) {
        const artist_extra_info: any = JSON.parse(
          fs.readFileSync(
            `./data/scrapped/spotify/bands/artist_extra/${artist_scrapped_spotify_config["downloaded"]}_${artist_scrapped_spotify_config["spotify"]}.json`,
            "utf-8"
          )
        );

        // if (
        //   artist_scrapped_spotify_config.spotify === "2Otnykd696YidQYfEGVmNq"
        // ) {
        //   console.log(artist_extra_info.albums);
        // }
        // console.log(
        //   artist_scrapped_spotify_config.spotify,
        //   artist_extra_info.albums
        // );

        // ================================ ARTISTAS RELACIONADOS  ===================================================
        if (artist_extra_info?.related_artists) {
          artist_extra_info?.related_artists?.artists?.forEach(
            (related: any) => {
              const existsInScrapped = !!scrapped_spotify_config.find(
                (alreadyScrapped: {
                  spotify: string;
                  downloaded: number;
                  artist_downloaded: number;
                }) => alreadyScrapped.spotify === related.id
              );
              const existsInNew = !!newArtists.find(
                (newArtist: any) => newArtist.id === related.id
              );

              if (!existsInScrapped && !existsInNew) {
                newArtists.push(related);
              }
            }
          );
        }

        if (!stats[artist_scrapped_spotify_config.spotify]) {
          stats[artist_scrapped_spotify_config.spotify] = 0;
        }
        // ============================== ALBUMS ===================================================================
        if (artist_extra_info?.albums) {
          numArtistas++;
          const albums = (artist_extra_info?.albums.items || [])
            .filter((album: any) => album.album_type === "album")
            .map((album: any) => album.id);

          albumsList = [...albumsList, ...albums];

          stats[artist_scrapped_spotify_config.spotify] = albums.length;

          const singles = (artist_extra_info?.albums.items || [])
            .filter((album: any) => album.album_type === "single")
            .map((album: any) => album.id);

          singlesList = [...singlesList, ...singles];
        }

        if (printData) {
          console.log(
            // JSON.stringify(artist_extra_info),
            "\n ============================ ",
            JSON.stringify(artist_scrapped_spotify_config)
          );
          printData = false;
        }
      }
    }
  );

  albumsList = [...new Set(albumsList)];
  singlesList = [...new Set(singlesList)];

  console.log("NUEVOS ARTISTAS:  " + newArtists.length);
  console.log(
    "ALBUMS:  Total: " + albumsList.length,
    " - Artistas: ",
    numArtistas,
    " || Promedio: ",
    albumsList.length / numArtistas
  );
  console.log(
    "SINGLES ",
    singlesList.length,
    " || ",
    singlesList.length / numArtistas
  );

  // console.log(stats);
  // fs.writeFileSync(
  //   "./data/drive/new_artists_drive.json",
  //   JSON.stringify(newArtists, null, 2),
  //   "utf-8"
  // );

  // function compare(a: any, b: any) {
  //   if (a.followers.total < b.followers.total) {
  //     return 1;
  //   }
  //   if (a.followers.total > b.followers.total) {
  //     return -1;
  //   }
  //   return 0;
  // }

  // fs.writeFileSync(
  //   "./data/drive/new_artists_drive_names.json",
  //   JSON.stringify(
  //     newArtists.sort(compare).map((artist: any, index: number) => {
  //       return {
  //         num: index + 1,
  //         name: artist.name,
  //         popularity: artist.popularity,
  //         // followers: nf.format(artist.followers.total),
  //         followers: artist.followers.total,
  //         spotify_url: artist.external_urls.spotify,
  //       };
  //     }),
  //     null,
  //     2
  //   ),
  //   "utf-8"
  // );

  crearArchivo("./data/drive/2025/spotify_albums.json", albumsList.sort());
}

export function processJsonFile(filePath: string): any {
  const data: any = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const artists = Object.values(data);

  const withAlbums = artists.filter((a: any) => !!a.albums.items?.length);
  console.log(withAlbums.length);

  console.log(
    withAlbums.map(
      (a: any) =>
        `${a.info.name} - ${a.albums.items.length} - ${a.info.external_urls.spotify}`
    )
  );
}

export function processGenres_batch_scrapping(): any {
  const bio_dir = "./data/scrapped/spotify/bands/artist_bio";
  const files = fs.readdirSync(bio_dir);

  let genres: string[] = [];
  files.forEach((artistBioFile) => {
    const data: any = JSON.parse(
      fs.readFileSync(`${bio_dir}/${artistBioFile}`, "utf-8")
    );
    const artistGenres = data.genres || [];
    genres = [...genres, ...artistGenres];
  });

  const data_new_artists: any = JSON.parse(
    fs.readFileSync(`./data/drive/new_artists_drive.json`, "utf-8")
  );

  data_new_artists.forEach((artist: any) => {
    if (!!artist.genres.length) {
      genres = [...genres, ...artist.genres];
    }
  });

  const uniqueArray = [...new Set(genres)].sort();
  // Convierte el objeto a una cadena de texto en formato JSON
  const jsonString = JSON.stringify(uniqueArray, null, 2);
  console.log(jsonString);

  // Escribe el archivo JSON
  fs.writeFileSync("./data/genres.json", jsonString, "utf-8");
}

export function processGenres(filePath: string): any {
  const data: any = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const artists = Object.values(data);
  console.log(artists.length);
  let genres: string[] = [];

  artists.forEach((artist: any, index: number) => {
    genres = [...genres, ...artist.info.genres];
  });
  console.log("genres", genres.length);
  const uniqueArray = [...new Set(genres)];

  // Convierte el objeto a una cadena de texto en formato JSON
  const jsonString = JSON.stringify(uniqueArray, null, 2);
  console.log(jsonString);

  // Escribe el archivo JSON
  //   fs.writeFileSync("./data/genres.json", jsonString, "utf-8");
}

export function processFollowers(filePath: string): any {
  const data: any = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const artists = Object.values(data);

  console.log(artists.filter((artist: any) => !artist.info.followers).length);

  const frequencyTable: { [key: string]: number } = {};

  const bins = 1000;

  artists.forEach((artist: any, index: number) => {
    const followers = Math.floor(artist.info.followers.total / bins) * bins;
    const key = `${followers}`;
    if (frequencyTable[key]) {
      frequencyTable[key]++;
    } else {
      frequencyTable[key] = 1;
    }
    // console.log(
    //   artist.info.name,
    //   artist.info.followers.total,

    // );
  });

  console.log(frequencyTable);

  console.log(
    artists
      .filter((artist: any) => artist.info.followers.total > 50000)
      .map((artist: any) => {
        return {
          name: artist.info.name,
          url: artist.info.external_urls.spotify,
          followers: artist.info.followers.total.toLocaleString("fr-FR"),
        };
      })
  );
}

export function join_files(files: string[], bundle: string) {
  const origin_data: any = JSON.parse(fs.readFileSync(bundle, "utf-8"));
  console.log(
    Object.values(origin_data).filter((artist: any) => !artist.info.name)
      .length,
    "/",
    Object.values(origin_data).length
  );

  files.forEach((file) => {
    const data: any = JSON.parse(fs.readFileSync(file, "utf-8"));
    Object.keys(data).forEach((artistId) => {
      origin_data[artistId] = data[artistId];
    });
  });

  console.log(
    Object.values(origin_data).filter((artist: any) => !artist.info.name)
      .length,
    Object.values(origin_data).filter((artist: any) => !!artist.info.name)
      .length
  );

  let str = "";
  Object.values(origin_data).forEach((artist: any, index: number) => {
    //     // if (artist.info.followers.total > 10000) {
    //       console.log(artist.info.name);
    //     // }
    if (!artist.info.name) {
      str += `"${artist.id}", `;
    }
    // if (index % 50 === 0) {
    //     str = "";
    // }
  });
  console.log(str, "\n\n\n");

  // Convierte el objeto a una cadena de texto en formato JSON
  const jsonString = JSON.stringify(origin_data, null, 2);

  // Escribe el archivo JSON
  //   fs.writeFileSync("./data/output.json", jsonString, "utf-8");
}
function extractNonScrappedAlbumsIDs() {
  const albumTracksInfo: any = JSON.parse(
    fs.readFileSync(
      `C:/Users/fnp/Documents/Proyectos/QuarenDevs/2022/bookmarks/ah-mock-api/assets/mocks/domain/artists/tracksByAlbumList_04_09_2024.json`,
      "utf-8"
    )
  );

  const alreadyScrapped = Object.keys(albumTracksInfo);

  console.log(alreadyScrapped.length, alreadyScrapped[0]);
  let missingScrapped: any[] = [];

  const scrapped_spotify_config: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  );
  const drive_artists_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive.json", "utf-8")
  );

  let printData = true;
  let totalAlbums = 0;
  scrapped_spotify_config.forEach(
    (artist_scrapped_spotify_config: {
      spotify: string;
      downloaded: number;
      artist_downloaded: number;
    }) => {
      const artist_drive_info = drive_artists_data.find(
        (drive_artist: any) =>
          drive_artist.spotify === artist_scrapped_spotify_config.spotify
      );

      if (artist_drive_info) {
        const artist_extra_info: any = JSON.parse(
          fs.readFileSync(
            `./data/scrapped/spotify/bands/artist_extra/${artist_scrapped_spotify_config["downloaded"]}_${artist_scrapped_spotify_config["spotify"]}.json`,
            "utf-8"
          )
        );

        if (!!artist_extra_info?.albums?.items?.length) {
          // const ids = artist_extra_info?.albums?.items.map((album:any )=> album.id)
          totalAlbums += artist_extra_info?.albums?.items?.length;

          missingScrapped = [
            ...missingScrapped,
            ...artist_extra_info?.albums?.items
              .map((album: any) => album.id)
              .filter((smallId: string) => !alreadyScrapped.includes(smallId)),
          ];
        }
      }
    }
  );

  fs.writeFileSync(
    "./data/spotify/albums/no_scraped_albums.json",
    JSON.stringify(missingScrapped, null, 2),
    "utf-8"
  );
}

function extract_related_bios_batch() {
  const bio_dir = "./data/scrapped/spotify/bands/artist_extra";
  const files = fs.readdirSync(bio_dir);
  const spotify_scrapped_config: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  );
  const drive_artists_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive.json", "utf-8")
  );

  console.log("ANTES ", spotify_scrapped_config.length);
  const times: number[] = [];
  const artistas: any[] = [];
  let print = true;
  files.forEach((artistBioFile) => {
    const data: any = JSON.parse(
      fs.readFileSync(`${bio_dir}/${artistBioFile}`, "utf-8")
    );
    const scrappedTimestamp = Number(
      artistBioFile.split(".json")[0].split("_")[0]
    );
    const spotify = artistBioFile.split(".json")[0].split("_")[1];
    const relatedArtists = data.related_artists?.artists || [];

    relatedArtists.forEach((relatedArtist: any) => {
      fs.writeFileSync(
        `./data/scrapped/spotify/bands/artist_bio/automatic/${scrappedTimestamp}_${relatedArtist.id}.json`,
        JSON.stringify(relatedArtist, null, 2),
        "utf-8"
      );

      const existingRelated = spotify_scrapped_config.find(
        (artist: any) => artist.spotify === relatedArtist.id
      );

      // Se debe actualizar config/spotify_bands.json
      // No se había registrado
      if (!existingRelated) {
        spotify_scrapped_config.push({
          spotify: relatedArtist.id,
          downloaded: 0,
          artist_downloaded: scrappedTimestamp,
        });
      }
      // Han pasado más de 7 días
      else if (
        scrappedTimestamp - existingRelated?.artist_downloaded >
        7 * 24 * 60 * 60
      ) {
        existingRelated.artist_downloaded = scrappedTimestamp;
      }
    });

    artistas.push({
      name: drive_artists_data.find((artist: any) => artist.spotify === spotify)
        .name,
      related: relatedArtists,
    });
  });

  fs.writeFileSync(
    "./data/scrapped/config/spotify_bands_complete.json",
    JSON.stringify(spotify_scrapped_config, null, 2),
    "utf-8"
  );
}
