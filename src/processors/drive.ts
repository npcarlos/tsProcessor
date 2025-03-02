import * as fs from "fs";
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
  // unirDriveConConfigFile();
  // consolidar_artistas();
  consolidar_artistas_new_artist_completo();
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

  // ============================ CHARTMETRIC
  extraerConfigFromSprotifyBioToChartmetricSearch();
  chartmetricSearchResultToCSV();
}

interface SocialMedia {
  id: number | null;
  url: string[] | null;
}

interface SnUrls {
  obj: Record<string, SocialMedia>;
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
    "./data/drive/new_artists_drive_consolidado_prev.json"
  );
  const configSpotifyArtists = leerArchivo(
    "./data/scrapped/config/spotify_bands_complete.json"
  );

  const scrappedSpotifyBioFilesUnique = todosLosArtistas
    .filter(
      (artista: any) => !!artista.spotify_user && !artista.chartmetric_user
    )
    .map((artista: any, index: number) => {
      const artistaConfig = configSpotifyArtists.find(
        (spotifyArtistConfig: any) =>
          spotifyArtistConfig.spotify === artista.spotify_user
      );

      const spotifyBio =
        artistaConfig?.artist_downloaded > 0
          ? leerArchivo(
              `./data/scrapped/spotify/bands/artist_bio/${artistaConfig["artist_downloaded"]}_${artistaConfig.spotify}.json`
            )
          : undefined;

      if (index % 5000 === 0) {
        console.log(index);
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
    "./data/scrapped/config/spotify_bands_complete.json"
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
      const spotifyBio = spotifyConfig
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

function consolidar_artistas_new_artist_completo() {
  console.log(
    "=====================    CONSOLIDAR ARTISTAS COMPLETO ========================="
  );

  // Todos los artistas en el drive
  const todosLosArtistas = leerArchivo(
    "./data/drive/new_artists_drive_consolidado_prev.json"
  );
  const infoInicial = leerArchivo("./data/drive/artists_drive_db_output.json");
  const driveInfo = leerArchivo("./data/drive/2025/drive_artists.json");
  console.log(todosLosArtistas.length, infoInicial.length);

  const configSpotifyArtists = leerArchivo(
    "./data/scrapped/config/spotify_bands_complete.json"
  );

  const configChartmetricArtists = leerArchivo(
    "./data/scrapped/config/chartmetric_bands.json"
  );

  const countries = leerArchivo(`./data/geo/mongo/artist_hive.countries.json`);

  console.log(
    "Config: ",
    todosLosArtistas.length,
    ", Info previa: ",
    infoInicial.length,
    ", Drive: ",
    driveInfo.length,
    ", Spotify: ",
    configSpotifyArtists.length,
    ", C M: ",
    configChartmetricArtists.length
  );

  const mocks = leerArchivo("./data/drive/artists_mock.json");

  const all = todosLosArtistas
    .filter(
      (a: any) =>
        a.spotify_user === "27neIga89YKdkCk6Yzv0ni" ||
        a.spotify_user === "7cC14jlZcFQueGrGHDYg51" ||
        a.spotify_user === "5OfRvW5SYGif5Q8LrklFjV" ||
        a.instagram_user === "prevalecen" ||
        a.instagram_user === "lissdasilvaa"
    )
    // .slice(500, 510)
    .map((artistaConfig: any) => {
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
        artistaChartmetricConfig?.downloaded > 0
          ? leerArchivo(
              `./data/scrapped/chartmetric/bands/${artistaChartmetricConfig["downloaded"]}_${artistaChartmetricConfig["chartmetric"]}.json`
            )
          : undefined;

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
        artistaSpotifyConfig?.artist_downloaded > 0
          ? leerArchivo(
              `./data/scrapped/spotify/bands/artist_bio/${artistaSpotifyConfig["artist_downloaded"]}_${artistaSpotifyConfig.spotify}.json`
            )
          : undefined;

      const spotifyExtra =
        artistaSpotifyConfig?.downloaded > 0
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

      const albums = spotifyExtra?.albums?.items;
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

      return {
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
        genres: spotifyBio?.genres ||
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
            albums: [],
            top_tracks: [],
            related_artist_spotify:
              spotifyRelated?.data?.artistUnion?.relatedContent?.relatedArtist
                ?.items ||
              artistaInfoPrevia?.arts?.music?.related_artist_spotify ||
              [],
          },
        },
      };
    });

  crearArchivo("./data/drive/2025/artists_db.json", all);
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
