import * as fs from "fs";

export function main(args?: any) {
  // consolidar_artistas();
  // consolidar_spotify_ids_para_scrapping();
  consolidar_chartmetric_ids_para_scrapping();
}

function consolidar_artistas() {
  const artist_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive.json", "utf-8")
  );

  const nonEmptyFields = ["instagram", "spotify", "chartmetric", "name"];
  const existingDriveArtists = artist_drive_data.filter((artist: any) => {
    return nonEmptyFields.some((field) => !!artist[field]);
  });

  const existingDriveArtistsOutput = existingDriveArtists.map((artist: any) => {
    return {
      artistType: "musician",
      name: artist["name"] || "",
      username: artist["instagram"] || "",
      subtitle: "",
      verified_status: 1,
      profile_pic: "",
      photo: "",
      description: "",
      is_active: artist["is_active"] || "",

      country: artist["country"] || "",
      city: artist["city"] || "",

      since: 0,
      home_city: "",
      genres: {
        music: [],
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

      general_rate: 4.6,
      followers: 0,
      event_followers: 0,
      stats: {
        rating: {
          overall: 1.9526856251219205,
          talent: 0.25238794935722564,
          performance: 0.48012940099588236,
          proffesionalism: 3.7132583055733512,
          stage_presence: 4.569076484520532,
          charisma: 4.315508331689809,
          timeliness: 4.776021096801581,
          communication: 1.4758946837965081,
          respectfulness: 1.8984376596560317,
          total_rates: 8290,
        },
      },
      arts: {
        music: {
          albums: [],
        },
      },
    };
  });

  fs.writeFileSync(
    "./data/drive/artists_drive_db_output.json",
    JSON.stringify(existingDriveArtistsOutput, null, 2),
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
      console.log(driveChartmetricID);
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
