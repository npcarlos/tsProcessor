import * as fs from "fs";

export function main(args?: any) {
  // extractAlbumsIDs();
  // processGenres_batch_scrapping();
  process_batch_scrapping_extra_info();
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
  const nf = new Intl.NumberFormat("es-MX");

  let printData = true;
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
        if (printData) {
          console.log(
            // JSON.stringify(artist_extra_info),
            "\n =========================== ",
            JSON.stringify(artist_scrapped_spotify_config)
          );
          printData = false;
        }
      }
    }
  );

  console.log("NUEVOS ARTISTAS:  " + newArtists.length);

  fs.writeFileSync(
    "./data/drive/new_artists_drive.json",
    JSON.stringify(newArtists, null, 2),
    "utf-8"
  );

  function compare(a: any, b: any) {
    if (a.followers.total < b.followers.total) {
      return 1;
    }
    if (a.followers.total > b.followers.total) {
      return -1;
    }
    return 0;
  }

  fs.writeFileSync(
    "./data/drive/new_artists_drive_names.json",
    JSON.stringify(
      newArtists
        .sort(compare)
        .map(
          (artist: any, index: number) =>
            `${index + 1})  ${artist.name}   -   ${
              artist.popularity
            }    -  ${nf.format(artist.followers.total)}`
        ),
      null,
      2
    ),
    "utf-8"
  );
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

  const uniqueArray = [...new Set(genres)];
  // Convierte el objeto a una cadena de texto en formato JSON
  const jsonString = JSON.stringify(uniqueArray, null, 2);
  console.log(jsonString);

  // Escribe el archivo JSON
  //   fs.writeFileSync("./data/genres.json", jsonString, "utf-8");
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
