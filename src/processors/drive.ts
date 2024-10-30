import * as fs from "fs";
import { cleanHtmlToString } from "../helpers/string.helpers";

export function main(args?: any) {
  // consolidar_artistas();
  // consolidar_sitios();
  // consolidar_spotify_ids_para_scrapping();
  // consolidar_chartmetric_ids_para_scrapping();
}

function consolidar_sitios() {
  const places_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/places_drive.json", "utf-8")
  );

  const nonEmptyFields = ["instagram", "spotify", "chartmetric", "name"];
  const existingDrivePlaces = places_drive_data.filter((place: any) => {
    return (
      !!place["location"] && nonEmptyFields.some((field) => !!place[field])
    );
  });

  const existingDrivePlacesOutput = existingDrivePlaces.map((place: any) => {
    return {
      name: place["name"] || "",
      username: place["instagram"] || "",
      place_type: place["place_type"] || "",
      music_genre: "",
      country: place["country"] || "",
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
      profile_pic: "",
      image_gallery: [
        { src: "s3://public/galeria/lp_1.jpg" },
        { src: "s3://public/galeria/lp_2.jpg" },
        { src: "s3://public/galeria/lp_3.jpg" },
        { src: "s3://public/galeria/lp_4.jpg" },
        { src: "s3://public/galeria/lp_5.jpg" },
      ],

      genres: {
        music: [
          "salsa",
          "timba",
          "músicas improvisadas",
          "jazz",
          "fusiones",
          "cumbia",
          "porro",
          "ska",
          "crossover",
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
          overall: 0.7341335884211364,
          stage: 4.992712277223668,
          sound: 2.2198114813543954,
          backline: 0.6555007014728664,
          lights: 2.228682229309499,
          dressing_room: 2.49464302154375,
          hospitality_food: 3.2476047703406072,
          hospitality_drinks: 0.07304123198966117,
          timeliness: 0.6993761803171261,
          communication: 1.9933898897972568,
          transportation: 2.103412855512059,
          logistic: 2.7721849091316764,
          location: 2.5536700451747616,
          seating_capacity: 3.491467082819754,
          total_rates: 5613,
        },
      },
    };
  });

  fs.writeFileSync(
    "./data/drive/places_drive_db_output.json",
    JSON.stringify(
      existingDrivePlacesOutput.filter((place: any) => !!place.name),
      null,
      2
    ),
    "utf-8"
  );
}

function consolidar_artistas() {
  const artist_drive_data: any = JSON.parse(
    fs.readFileSync("./data/drive/artists_drive.json", "utf-8")
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

  const existingDriveArtistsOutput = existingDriveArtists.map((artist: any) => {
    const spotify_artist_config_data = artist["spotify"]
      ? spotify_config_data.find(
          (spotify_config_artist: any) =>
            spotify_config_artist.spotify === artist["spotify"]
        )
      : undefined;

    let spotify_artist_data = undefined;
    if (spotify_artist_config_data) {
      spotify_artist_data = JSON.parse(
        fs.readFileSync(
          `./data/scrapped/spotify/bands/artist_bio/${spotify_artist_config_data["artist_downloaded"]}_${spotify_artist_config_data["spotify"]}.json`,
          "utf-8"
        )
      );
    }
    const chartmetric_artist_config_data = artist["chartmetric"]
      ? chartmetric_config_data.find(
          (chartmetric_config_artist: any) =>
            chartmetric_config_artist.chartmetric === artist["chartmetric"]
        )
      : undefined;

    let chartmetric_artist_data = undefined;
    if (chartmetric_artist_config_data) {
      chartmetric_artist_data = JSON.parse(
        fs.readFileSync(
          `./data/scrapped/chartmetric/bands/${chartmetric_artist_config_data["downloaded"]}_${chartmetric_artist_config_data["chartmetric"]}.json`,
          "utf-8"
        )
      );
    }

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

      since: 0,
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
    JSON.stringify(
      existingDriveArtistsOutput.filter((artist: any) => !!artist.name),
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
