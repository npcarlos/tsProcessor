import * as fs from "fs";

export function main(args?: any) {}

export function extractAlbumsIDs() {
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
