import * as fs from "fs";

export function main(args?: any) {
  // check_status();
  const config_data: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  );

  fs.writeFileSync(
    "./data/scrapped/config/spotify_bands.json",
    JSON.stringify(
      config_data.map((artist: any) => {
        return { ...artist, artist_downloaded: 0 };
      }),
      null,
      2
    ),
    "utf-8"
  );

  // find
  // console.log(findDuplicates(config_data));
}

// Función para verificar duplicados en el arreglo
function findDuplicates(arr: any[]): {
  duplicates: any[];
  hasDuplicates: boolean;
} {
  const seen = new Set<string>();
  const duplicates: any[] = [];

  for (const item of arr) {
    if (seen.has(item.spotify)) {
      duplicates.push(item);
    } else {
      seen.add(item.spotify);
    }
  }

  return {
    duplicates,
    hasDuplicates: duplicates.length > 0,
  };
}

export function check_status() {
  const config_data: any = JSON.parse(
    fs.readFileSync("./data/scrapped/config/spotify_bands.json", "utf-8")
  );

  console.log("SPOTIFY Scrapped .... ", config_data[5]);
  let total = 0;
  let errors = "";

  config_data.forEach((artist: any) => {
    if (!!artist["spotify"]) {
      const scrapped_filename = `${artist["downloaded"]}_${artist["spotify"]}`;
      try {
        const artist_data: any = JSON.parse(
          fs.readFileSync(
            `./data/scrapped/spotify/bands/artist_extra/${scrapped_filename}.json`,
            "utf-8"
          )
        );
        if (!!artist_data?.albums?.error) {
          console.log("Total ", ++total, scrapped_filename);
          artist["downloaded"] = 0;
        }
      } catch (error) {
        errors += scrapped_filename + "\n";
      }
    }
  });
  fs.writeFileSync(
    "./data/scrapped/config/spotify_bands_2.json",
    JSON.stringify(
      config_data.filter((artist: any) => !!artist["spotify"]),
      null,
      2
    ),
    "utf-8"
  );
  if (!!errors) {
    fs.writeFileSync(
      "./data/scrapped/config/spotify_bands_2_errors.json",
      errors,
      "utf-8"
    );
  }
}
