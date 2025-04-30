const fs = require("fs");
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

const PROFILES_DIR_PATH =
  "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/places/profiles";
export function main(args?: any) {
  // procesar_har();
  // extract_user_profile();
  // extract_instagram_data();
  // copyProfilePics();
  console.log("=============== INICINAOD   ?????????");

  // console.log("=============== TIMELINE   ?????????");
  // process_timelines();
  console.log("=============== tags in timeline   ?????????");
  extract_tags_in_timeline();
  console.log("=============== genres   ?????????");
  generate_genres_from_tags_in_timeline();
  console.log("=============== stats   ?????????");
  generate_instagram_stats();
  console.log("=============== FIN   ?????????");

  // const files = fs.readdirSync(`${PROFILES_DIR_PATH}/clean`);

  // const data: any[] = [];

  // let totalPosts: number[] = [];
  // files.forEach((file: string) => {
  //   const dataFile = leerArchivo(`${PROFILES_DIR_PATH}/clean/${file}`);
  //   const numberPosts = dataFile?.media_count || 0;
  //   const username: string = file.replace(".json", "");
  //   totalPosts.push(numberPosts);
  //   data.push({
  //     name: username,
  //     postNumber: numberPosts,
  //     pages: Math.ceil(numberPosts / 12),
  //   });
  // });
  // console.log("Promedio ", mean(totalPosts), median(totalPosts));

  // crearArchivo(`${PROFILES_DIR_PATH}/processed/postNumber.json`, data);
}

function copyProfilePics() {
  const dirPath =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/places";
  const users = fs.readdirSync(`${dirPath}/images`);

  let total = 0;
  let imagesURL = "";
  users.forEach((user: any) => {
    if (!["kirstenboschsummerconcerts", "muhle_hunziken"].includes(user)) {
      const images = fs.readdirSync(`${dirPath}/images/${user}`);
      const hd = images.find((image: string) => image.startsWith("HD_"));
      total += !!hd ? 1 : 0;
      if (hd) {
        const newImage = hd.replace("HD_", "");
        const ext = newImage.split(".")[1];
        if (ext !== "jpg") {
          console.log(ext);
        } else {
          fs.copyFileSync(
            `${dirPath}/images/${user}/${newImage}`,
            `${dirPath}/profile_pics/${user}.${ext}`
          );
          imagesURL += `${user}\n`;
        }
      }
    }
  });
  crearArchivo(`${dirPath}/imagesUsers.txt`, imagesURL, false);
  console.log("Total ", total);
}

function extract_instagram_data() {
  const profiles = leerArchivo("./data/har/config/profiles_to_process.json");
  console.log(profiles.length);
  const entityName = "places";
  const result = profiles
    .map((profile: string, index: number) => {
      let data = undefined;
      const dirPath =
        "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download";
      const profilePath = `${dirPath}/${entityName}/profiles/clean/${profile}.json`;
      const profileInfo =
        fs.existsSync(profilePath) && leerArchivo(profilePath);

      if (!profileInfo?.full_name) {
        console.log(profilePath);
      }

      const {
        username,
        full_name,
        city,
        follower_count,
        is_verified,
        following_count,
        media_count,
        category,
        is_business,
        is_unpublished,
        is_private,
        is_regulated_c18,
        latest_reel_media,
        bio_links,
      } = profileInfo;

      const bio_links_count =
        bio_links
          ?.filter((l: any) => l.url.includes("spotify.com/artist"))
          .map(
            (l: any) =>
              l.url
                .replace("https://open.spotify.com/artist/", "")
                .split("?")[0]
          )
          .join(",") || undefined;
      return {
        username,
        full_name,
        city,
        is_verified,
        follower_count,
        following_count,
        media_count,
        category,
        is_business,
        is_unpublished,
        is_private,
        is_regulated_c18,
        latest_reel_media,
        spotify: bio_links_count,
      };
    })
    .filter((a: any) => !!a);

  crearArchivo(
    `./data/drive/2025/automatic/faltantes/${entityName}_profiles.json`,
    result
  );
}

function extractInstagramHDProfilePhotos() {
  let images = fs.readdirSync(
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/images"
  );
  images = images.map((folder: any) => {
    const files = fs.readdirSync(
      "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/images/" +
        folder
    );
    return {
      username: folder,
      hasHD: !!files.find((file: string) => file.startsWith("HD_")),
    };
  });
  // images
  //   // .filter((i: any) => !i.hasHD)
  //   .forEach((i: any) => console.log(`${i.username},${i.hasHD ? 1 : 0}`));

  crearArchivo(
    "./data/drive/2025/automatic/faltantes/instagram_har_places.txt",
    images.map((i: any) => `${i.username},${i.hasHD ? 1 : 0}`).join("\n"),
    false
  );
}

function fixMalformedJSON(raw: string): string {
  const fixed = `[${raw.trim().replace(/,\s*$/, "")}]`; // Quita coma final y lo mete en []
  return fixed;
}

function extract_user_profile() {
  console.log("............");
  const username = "matikbogota";
  const raw = fs.readFileSync(
    `data/scrapped/instagram/scrapped/raw/${username}.json`,
    "utf-8"
  );
  const fixed = `[${raw.trim().replace(/,\s*$/, "")}]`;
  crearArchivo(
    `data/scrapped/instagram/scrapped/ok/${username}.json`,
    fixed,
    false
  );

  // Parsear
  const data = JSON.parse(fixed);

  // Buscar el body que contiene el usuario
  for (const entry of data) {
    if (entry.url.includes("/query")) {
      try {
        const body = JSON.parse(entry.body); // `body` era un string con JSON dentro
        console.log("USER NAME", body?.data?.user);
        // Si contiene el usuario deseado
        if (body?.data?.user?.username === username) {
          console.log(body.data);
          const url = body.data.profile_pic_url;
          const parsedUrl = new URL(url);
          const filename = parsedUrl.pathname.split("/").pop(); // extraer nombre del archivo

          console.log(`🎯 Imagen de ${username}: ${filename}`);
          break;
        }
        // console.log(body);
        console.log("................%%%%%   ................");
      } catch (e) {
        // si el body no es JSON válido, ignorar
        continue;
      }
    }
  }
  console.log("........== ....");
}

export function procesar_har() {
  const harData = leerArchivo("./data/har/instagram/danielmichelmn.har");

  const requests = harData.log.entries.filter((entry: any) => {
    const url = entry.request.url;
    const params = entry.request.queryString;

    // Ejemplo: buscar URLs que contengan "example"
    return url.includes("query"); // || params.some((param:any) => param.name === 'miParametro');
  });

  console.log(requests.length);

  const harDataPuerto = leerArchivo("./data/har/instagram/marta_gomez.har");

  //-------------------------------------------------------------------------------------------------
  // Busca una imagen y la guarda como archivo aparte
  const post = harDataPuerto.log.entries.find(
    (entry: any) =>
      entry.request.url ===
      "https://instagram.fbog7-1.fna.fbcdn.net/v/t39.30808-6/455714598_17947879856850016_1540943423838251400_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyLmYzMDgwOC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.fbog7-1.fna.fbcdn.net&_nc_cat=104&_nc_ohc=cf1Qp5MLia4Q7kNvgE1c-yA&_nc_gid=01119f29ce0546bcb8d36ab84058a7bf&edm=APoiHPcAAAAA&ccb=7-5&ig_cache_key=MzQzNjAwNjU0NDU0MDc2MDMwMA%3D%3D.3-ccb7-5&oh=00_AYA7GGWf-HG8uFfNRo5qaSUNuxxAYFQ6sbFqXnSFit7Wzw&oe=674353EA&_nc_sid=22de04"
  );

  const { response, request } = post || {};
  const contentType = response?.headers?.find(
    (h: any) => h.name.toLowerCase() === "content-type"
  )?.value;

  if (contentType?.startsWith("image/")) {
    const url = request.url;
    const base64Content = response?.content?.text; // Contenido en base64
    const extension = contentType?.split("/")[1]; // Obtener extensión (jpg, png, etc.)

    if (base64Content) {
      const filePath = `./data/har/instagram/fotos/imagen_2.${extension}`;
      const buffer = Buffer.from(base64Content, "base64");
      fs.writeFileSync(filePath, buffer);
      console.log(`Guardada: ${filePath}`);
    }
  }
  //-------------------------------------------------------------------------------------------------
  const requestsP = harDataPuerto.log.entries.filter((entry: any) => {
    const url = entry.request.url;
    const params = entry.request.queryString;

    // Ejemplo: buscar URLs que contengan "example"
    return url.includes("query"); // || params.some((param:any) => param.name === 'miParametro');
  });

  // ------------------------  BIOGRAFIA ---------------------------------------------------
  const profileRequest = requestsP.find(
    (entry: any) =>
      !!entry.request.postData.params.find((param: any) =>
        param.value.includes('"render_surface":"PROFILE"')
      )
  );

  console.log(requestsP.length, !!profileRequest, !!post);

  if (profileRequest?.response?.content?.text) {
    const json = JSON.parse(profileRequest?.response?.content?.text);
    console.log(
      json?.data?.user?.username,
      " - ",
      json?.data?.user?.full_name,
      " - ",
      json?.data?.user?.follower_count
    );
  }

  // POSTS
  const postsRQ = requestsP.filter(
    (entry: any) =>
      !!entry.request.postData.params.find((param: any) =>
        param.value.includes("include_relationship_info")
      )
  );

  const postsEDGES = postsRQ
    .filter(
      (RQ: any) =>
        JSON.parse(RQ.response.content.text)?.data
          ?.xdt_api__v1__feed__user_timeline_graphql_connection
    )
    .map(
      (RQ: any) =>
        JSON.parse(RQ.response.content.text)?.data
          ?.xdt_api__v1__feed__user_timeline_graphql_connection.edges
    )
    .reduce((accumulator: any, value: any) => accumulator.concat(value), [])
    .map((post: any) => {
      const date = new Date(post.node.taken_at * 1000);
      return {
        code: post.node.code,
        taken_at: date.toLocaleString(),
        taken_at_day: date.getDay(),
        taken_at_date: date.getDate(),
        taken_at_month: date.getMonth() + 1,
        taken_at_year: date.getFullYear(),
        taken_at_hour: date.getHours(),
        // caption: post.node.caption.text,
        comments: post.node.comment_count,
        like_count: post.node.like_count,
      };
    });

  // Funciones para cálculos
  const calculateStats = (arr: any[], key: string) => {
    const values = arr.map((item) => item[key]);

    // Promedio
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

    // Media
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    // Desviación estándar
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, median, stdDev };
  };

  // Variables a analizar
  const variables = [
    "taken_at_day",
    "taken_at_date",
    "taken_at_month",
    "taken_at_year",
    "taken_at_hour",
    "comments",
    "like_count",
  ];

  // Calcular estadísticas para cada variable
  const results = variables.map((variable) => ({
    variable,
    ...calculateStats(postsEDGES, variable),
  }));
  console.log(
    "POSTS ",
    // JSON.parse(postsRQ[3].response.content.text)?.data
    //   ?.xdt_api__v1__feed__user_timeline_graphql_connection
    results
  );
}

function process_timelines() {
  const timelinesPath = PROFILES_DIR_PATH;

  const files = fs.readdirSync(`${timelinesPath}/timeline`);

  const timelineSummary: Record<string, any> = {};
  let lastUserId: string = "";
  let userIndex = 0;
  console.log("****   ", files.length);
  files.forEach((file: string) => {
    const content = leerArchivo(`${timelinesPath}/timeline/${file}`);
    const match = file.match(/^(.*)_\d+\.json$/);
    const userId = match ? match[1] : null;

    if (userId) {
      if (!(userId in timelineSummary)) {
        timelineSummary[userId] = [];
      }
      if (lastUserId != userId) {
        lastUserId = userId;
        userIndex++;
        if (userIndex % 200 == 0) {
          console.log(lastUserId);
        }
      }

      const posts = content.map((post: any) => {
        const info = post.node;
        // try {
        return {
          userIdPlace: userId,
          code: info.code,
          // "pk": "3625868281207153050",
          // "id": "3625868281207153050_328427237",
          // "ad_id": null,
          // "boosted_status": null,
          // "boost_unavailable_identifier": null,
          // "boost_unavailable_reason": null,
          caption: info.caption?.text,
          created_at: info?.caption?.created_at,
          // "caption": {
          //     "has_translation": true,
          //     "created_at": 1746457204,
          //     "pk": "18406909060099998",
          //     "text": "CECÍLIA VIVA na PORTA\nVIOLETA DE OUTONO / EMA STONED / BIKE\nQuinta - 15/05/2025 \n\nAdquira seu INGRESSO no LINK DA BIO\n\nCECÍLIA VIVA na Porta\n- Ingresso tipo 1 - APOIADOR - $35 \ningresso para o show\n\n- Ingresso tipo 2 - AMIGO - $100 \ningresso para o show, \ncarteirinha sócio cultural Cecília \nPoster do show \n \n - Ingresso tipo 3 - AFILIADO - $180\nIngresso para o show, \ncarteirinha sócio cultural Cecília \nEcobag Cecília Viva\nPoster do Show\nCamiseta Cecília Viva\n\n- Ingresso tipo 4 - SÓCIO - $380\ningresso para o show\ncarteirinha sócio cultural Cecília \nEcobag Cecília Viva\nPoster do Show\nCamiseta Cecília Viva\nVINIL DUPLO COLETÂNEA CECILIA VIVA\n18 musicas, de 18 artistas, gravadas ao vivo em eventos da CECÍLIA: AZYMUTH, \nAS MERCENARIAS, KIKO DINUCCI, TEST , \nRAKTA & DEAF KIDS, EMA STONED entre outros. \n\nCARTEIRINHA SÓCIO CULTURAL CECÍLIA \n- Direito à preferencia na compra de ingressos para eventos realizados pela Cecilia . \n- Desconto em ingressos de eventos realizados pela Cecilia. \n- Eventos exclusivos\n- Desconto em bebidas\n- Desconto em produtos da Cecilia (camiseta, vinil)\n- Desconto em estabelecimentos parceiros com a Cecilia \n\nConfere abaixo:\n\n- @secilianshop – desconto de 10% na compra de discos\n- @subdiscos – desconto de 20% na compra de discos do selo @nadanadadiscos \n- @estudioaurora – desconto de 10% válido para 1 ensaio por mês\n- @yerba.ppd e @prego.secosemolhados – desconto de 10% na compra de livros e um expresso na compra de qualquer produto no Prego\n@_____porta_____ - desconto de 10% em um drink do dia\n\nCecília Viva na PORTA\n15/05/2025 - quinta,19 hrs\n\nApoio @purpleproducoes e @_____porta_____ \nArte @camillajaded e @eri.kat"
          // },
          caption_is_edited: info.caption_is_edited,
          // "feed_demotion_control": null,
          // "feed_recs_demotion_control": null,
          taken_at: info.taken_at,
          taken_at_datetime: new Date((info.taken_at || 0) * 1000),
          taken_at_date: new Date((info.taken_at || 0) * 1000)
            .toISOString()
            .substring(0, 10),
          taken_at_time: Number(
            new Date((info.taken_at || 0) * 1000)
              .toISOString()
              .substring(11, 16)
              .replace(":", "")
          ),
          // "inventory_source": null,
          // "video_versions": null,
          // "is_dash_eligible": null,
          // "number_of_qualities": null,
          // "video_dash_manifest": null,
          // "image_versions2": {
          //     "candidates": [
          //         {
          //             "url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-15/495441359_18511808947043238_7825497724830637652_n.jpg?stp=dst-jpg_e35_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4MTM1MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=YpjWxUpN8IkQ7kNvwEvscIE&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzYyNTg2ODI3MTE0MDgwODQ0OQ%3D%3D.3-ccb7-5&oh=00_AfLpGehf0sOIKCKJj1A2F876dZ3_UF_R4sl8yrnBAGPLBw&oe=68298BB1&_nc_sid=7a9f4b",
          //             "height": 1350,
          //             "width": 1080
          //         }
          //     ]
          // },
          // "sharing_friction_info": {
          //     "bloks_app_url": null,
          //     "should_have_sharing_friction": false
          // },
          is_paid_partnership: info.is_paid_partnership,
          sponsor_tags: info.sponsor_tags,
          // "affiliate_info": null,
          // "original_height": 612,
          // "original_width": 612,
          // "organic_tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYTQwYTRjNDdkMzZiNDM1ZThhZDc1ZjM1ZWFkZTlmNTIzNjI1ODY4MjgxMjA3MTUzMDUwIiwic2VydmVyX3Rva2VuIjoiMTc0NzE3NjAxMjQ3MXwzNjI1ODY4MjgxMjA3MTUzMDUwfDUwMjcxNjQ4NTU0fDBkNjk2ODgyMDUxMzBjMWJlNTI0Y2EyMGUwNTQ1MjgzY2FiYjBhMjYwYTU5NDVhZjU3MjA3NGUwNWJkZWYyMGUifSwic2lnbmF0dXJlIjoiIn0=",
          link: info.link,
          story_cta: null,
          "user.username": info.user.username,
          "user.fullname": info.user.full_name,
          "user.is_verified": info.user.is_verified,
          // "user": {
          //     "pk": "328427237",
          //     "username": "ceciliacultural",
          //     "profile_pic_url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-19/488412657_1162421598682897_166718219638755784_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=6eu5QeuhmhkQ7kNvwGQ5WPg&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfI7Nz6M7-jzC3Y9NWpIfnTuUUH19dd_FAbIDvJ54o9Yug&oe=6829B052&_nc_sid=7a9f4b",
          //     "is_private": false,
          //     "is_embeds_disabled": false,
          //     "is_unpublished": false,
          //     "is_verified": false,
          //     "friendship_status": {
          //         "following": false,
          //         "is_bestie": false,
          //         "is_feed_favorite": false,
          //         "is_restricted": false
          //     },
          //     "latest_besties_reel_media": null,
          //     "latest_reel_media": 0,
          //     "live_broadcast_visibility": null,
          //     "live_broadcast_id": null,
          //     "seen": null,
          //     "supervision_info": null,
          //     "id": "328427237",
          //     "hd_profile_pic_url_info": {
          //         "url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-19/488412657_1162421598682897_166718219638755784_n.jpg?_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=6eu5QeuhmhkQ7kNvwGQ5WPg&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKzrsZeT4IId8RSjxJXsLYf81EW_puwo5XdLaUR_1y30w&oe=6829B052&_nc_sid=7a9f4b"
          //     },
          //     "full_name": "Cecília Cultural",
          //     "__typename": "XDTUserDict"
          // },
          // "group": null,
          "owner.username": info.owner.username,
          "owner.is_verified": info.owner.is_verified,
          "coauthor_producers.username": info.coauthor_producers.map(
            (user: any) => user.username
          ),
          "coauthor_producers.fullname": info.coauthor_producers.map(
            (user: any) => user.full_name
          ),
          "coauthor_producers.is_verified": info.coauthor_producers.map(
            (user: any) => user.is_verified
          ),
          "invited_coauthor_producers.username":
            info.invited_coauthor_producers.map((user: any) => user.username),
          "invited_coauthor_producers.fullname":
            info.invited_coauthor_producers.map((user: any) => user.full_name),
          "invited_coauthor_producers.is_verified":
            info.invited_coauthor_producers.map(
              (user: any) => user.is_verified
            ),
          // "owner": {
          //     "pk": "328427237",
          //     "profile_pic_url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-19/488412657_1162421598682897_166718219638755784_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=6eu5QeuhmhkQ7kNvwGQ5WPg&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfI7Nz6M7-jzC3Y9NWpIfnTuUUH19dd_FAbIDvJ54o9Yug&oe=6829B052&_nc_sid=7a9f4b",
          //     "username": "ceciliacultural",
          //     "friendship_status": {
          //         "is_feed_favorite": false,
          //         "following": false,
          //         "is_restricted": false,
          //         "is_bestie": false
          //     },
          //     "is_embeds_disabled": false,
          //     "is_unpublished": false,
          //     "is_verified": false,
          //     "show_account_transparency_details": true,
          //     "supervision_info": null,
          //     "transparency_product": null,
          //     "transparency_product_enabled": false,
          //     "transparency_label": null,
          //     "ai_agent_owner_username": null,
          //     "id": "328427237",
          //     "__typename": "XDTUserDict",
          //     "is_private": false
          // },
          // "coauthor_producers": [
          //     {
          //         "pk": "350516929",
          //         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/482917676_864236415778610_156621784342524646_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=hUfnZiH-TAgQ7kNvwEGAuWv&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKOidHpG6N2CoCtWqUQIUzjJVZgy23MOD9QeMl0EWVu_A&oe=68298543&_nc_sid=7a9f4b",
          //         "is_unpublished": null,
          //         "username": "emastoned",
          //         "id": "350516929",
          //         "__typename": "XDTUserDict",
          //         "full_name": "Ema Stoned",
          //         "is_verified": false,
          //         "friendship_status": {
          //             "following": false,
          //             "blocking": false,
          //             "is_feed_favorite": false,
          //             "outgoing_request": false,
          //             "followed_by": false,
          //             "incoming_request": false,
          //             "is_restricted": false,
          //             "is_bestie": false
          //         },
          //         "supervision_info": null
          //     },
          //     {
          //         "pk": "51917621675",
          //         "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/275099330_361565289137472_2756104158376278478_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=vQxvNwyRYsMQ7kNvwFfyfKw&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfLM-CocElbFMdR0t_OaycvkgApJhagbzpS3KhXDJEdHLg&oe=68298E6C&_nc_sid=7a9f4b",
          //         "is_unpublished": null,
          //         "username": "_____porta_____",
          //         "id": "51917621675",
          //         "__typename": "XDTUserDict",
          //         "full_name": "PORTA",
          //         "is_verified": false,
          //         "friendship_status": {
          //             "following": false,
          //             "blocking": false,
          //             "is_feed_favorite": false,
          //             "outgoing_request": false,
          //             "followed_by": false,
          //             "incoming_request": false,
          //             "is_restricted": false,
          //             "is_bestie": false
          //         },
          //         "supervision_info": null
          //     },
          //     {
          //         "pk": "5454055062",
          //         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/18382028_217574178747499_6957689364155465728_a.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=rQLRPXARLUQQ7kNvwE8Vml0&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKIjUhv7G2mlKhGb2ls31Zs8DoNMtDw327xgrxyQgR7lg&oe=6829B7DB&_nc_sid=7a9f4b",
          //         "is_unpublished": null,
          //         "username": "purpleproducoes",
          //         "id": "5454055062",
          //         "__typename": "XDTUserDict",
          //         "full_name": "Purple",
          //         "is_verified": false,
          //         "friendship_status": {
          //             "following": false,
          //             "blocking": false,
          //             "is_feed_favorite": false,
          //             "outgoing_request": false,
          //             "followed_by": false,
          //             "incoming_request": false,
          //             "is_restricted": false,
          //             "is_bestie": false
          //         },
          //         "supervision_info": null
          //     },
          //     {
          //         "pk": "464095257",
          //         "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/383783542_1481657845991340_1498487277648022225_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=XptAbIbU8c8Q7kNvwHbTnbq&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfJJrIOdKLTFUc_0NFNdjZaaLhQG7UQGCx-3wtDFuqMdFQ&oe=68299188&_nc_sid=7a9f4b",
          //         "is_unpublished": null,
          //         "username": "violetadeoutono",
          //         "id": "464095257",
          //         "__typename": "XDTUserDict",
          //         "full_name": "Violeta de Outono",
          //         "is_verified": false,
          //         "friendship_status": {
          //             "following": false,
          //             "blocking": false,
          //             "is_feed_favorite": false,
          //             "outgoing_request": false,
          //             "followed_by": false,
          //             "incoming_request": false,
          //             "is_restricted": false,
          //             "is_bestie": false
          //         },
          //         "supervision_info": null
          //     },
          //     {
          //         "pk": "1252283637",
          //         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/496346731_18508039405059638_3611412978315541351_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=IAzokBOOMBEQ7kNvwGuiQsS&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfL6JFnX9qst9Zi83Pa1NOqVd1wHYC3KNSEF46ff0zR3Hw&oe=6829B011&_nc_sid=7a9f4b",
          //         "is_unpublished": null,
          //         "username": "bikeoficial",
          //         "id": "1252283637",
          //         "__typename": "XDTUserDict",
          //         "full_name": "BIKE",
          //         "is_verified": false,
          //         "friendship_status": {
          //             "following": false,
          //             "blocking": false,
          //             "is_feed_favorite": false,
          //             "outgoing_request": false,
          //             "followed_by": false,
          //             "incoming_request": false,
          //             "is_restricted": false,
          //             "is_bestie": false
          //         },
          //         "supervision_info": null
          //     }
          // ],
          // "invited_coauthor_producers": [],
          // "follow_hashtag_info": null,
          // "title": null,
          comment_count: info.comment_count,
          // "comments_disabled": null,
          // "commenting_disabled_for_viewer": null,
          // "like_and_view_counts_disabled": false,
          // "has_liked": false,
          top_likers_count: info.top_likers?.length,
          facepile_top_likers: info.facepile_top_likers?.length,
          like_count: info.like_count,
          // "preview": null,
          // "can_see_insights_as_brand": false,
          // "social_context": [],
          view_count: info.view_count,
          // "can_reshare": null,
          // "can_viewer_reshare": true,
          // "ig_media_sharing_disabled": false,
          // "photo_of_you": false,
          // "product_type": "carousel_container",
          // "media_type": 8,
          "usertags.username": info.usertags?.in?.map(
            (user: any) => user.user.username
          ),
          "usertags.fullname": info.usertags?.in?.map(
            (user: any) => user.user.full_name
          ),
          "usertags.is_verified": info.usertags?.in?.map(
            (user: any) => user.user.is_verified
          ),
          // "usertags": {
          //     "in": [
          //         {
          //             "user": {
          //                 "pk": "273421501",
          //                 "full_name": "Camilla",
          //                 "username": "camillajaded",
          //                 "profile_pic_url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-19/461049011_1280981103067463_3592714859599288467_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=OLuELQYfqyUQ7kNvwFk5fBa&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKm7jiHBykRGWdIQ7H8YN2jshC1M-5pJqhA1aXtnGDBmw&oe=6829B28B&_nc_sid=7a9f4b",
          //                 "is_verified": false,
          //                 "id": "273421501"
          //             },
          //             "position": [
          //                 0.7729468599,
          //                 0.1509661836
          //             ]
          //         },
          //         {
          //             "user": {
          //                 "pk": "350516929",
          //                 "full_name": "Ema Stoned",
          //                 "username": "emastoned",
          //                 "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/482917676_864236415778610_156621784342524646_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=hUfnZiH-TAgQ7kNvwEGAuWv&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKOidHpG6N2CoCtWqUQIUzjJVZgy23MOD9QeMl0EWVu_A&oe=68298543&_nc_sid=7a9f4b",
          //                 "is_verified": false,
          //                 "id": "350516929"
          //             },
          //             "position": [
          //                 0.7693236715,
          //                 0.7439613527000001
          //             ]
          //         },
          //         {
          //             "user": {
          //                 "pk": "464095257",
          //                 "full_name": "Violeta de Outono",
          //                 "username": "violetadeoutono",
          //                 "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/383783542_1481657845991340_1498487277648022225_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=XptAbIbU8c8Q7kNvwHbTnbq&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfJJrIOdKLTFUc_0NFNdjZaaLhQG7UQGCx-3wtDFuqMdFQ&oe=68299188&_nc_sid=7a9f4b",
          //                 "is_verified": false,
          //                 "id": "464095257"
          //             },
          //             "position": [
          //                 0.3888888889,
          //                 0.6256038647000001
          //             ]
          //         },
          //         {
          //             "user": {
          //                 "pk": "1252283637",
          //                 "full_name": "BIKE",
          //                 "username": "bikeoficial",
          //                 "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/496346731_18508039405059638_3611412978315541351_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=IAzokBOOMBEQ7kNvwGuiQsS&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfL6JFnX9qst9Zi83Pa1NOqVd1wHYC3KNSEF46ff0zR3Hw&oe=6829B011&_nc_sid=7a9f4b",
          //                 "is_verified": false,
          //                 "id": "1252283637"
          //             },
          //             "position": [
          //                 0.3236714976,
          //                 0.8164251208000001
          //             ]
          //         },
          //         {
          //             "user": {
          //                 "pk": "1480238672",
          //                 "full_name": "€rikaaraujo",
          //                 "username": "eri.kat",
          //                 "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/461762461_1266064488078687_5067500384864731464_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=k3iQ4bgfTfAQ7kNvwHnYOAz&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfJvzsCZav_Htwdn76iRxqvhGQF8QOqyd9e1duAnuHAfGw&oe=6829844F&_nc_sid=7a9f4b",
          //                 "is_verified": false,
          //                 "id": "1480238672"
          //             },
          //             "position": [
          //                 0.7741545894,
          //                 0.0362318841
          //             ]
          //         },
          //         {
          //             "user": {
          //                 "pk": "5454055062",
          //                 "full_name": "Purple",
          //                 "username": "purpleproducoes",
          //                 "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/18382028_217574178747499_6957689364155465728_a.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=rQLRPXARLUQQ7kNvwE8Vml0&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKIjUhv7G2mlKhGb2ls31Zs8DoNMtDw327xgrxyQgR7lg&oe=6829B7DB&_nc_sid=7a9f4b",
          //                 "is_verified": false,
          //                 "id": "5454055062"
          //             },
          //             "position": [
          //                 0.6775362319,
          //                 0.8852657005000001
          //             ]
          //         },
          //         {
          //             "user": {
          //                 "pk": "51917621675",
          //                 "full_name": "PORTA",
          //                 "username": "_____porta_____",
          //                 "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/275099330_361565289137472_2756104158376278478_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=vQxvNwyRYsMQ7kNvwFfyfKw&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfLM-CocElbFMdR0t_OaycvkgApJhagbzpS3KhXDJEdHLg&oe=68298E6C&_nc_sid=7a9f4b",
          //                 "is_verified": false,
          //                 "id": "51917621675"
          //             },
          //             "position": [
          //                 0.30555555560000003,
          //                 0.2608695652
          //             ]
          //         }
          //     ]
          // },
          media_overlay_info: null,
          carousel_parent_id: null,
          carousel_media_count: info.carousel_media_count,
          // "carousel_media": [
          //     {
          //         "id": "3625868271140808449_328427237",
          //         "pk": "3625868271140808449",
          //         "accessibility_caption": "Photo shared by Cecília Cultural on May 05, 2025 tagging @camillajaded, @emastoned, @violetadeoutono, @bikeoficial, @eri.kat, @purpleproducoes, and @_____porta_____. Puede ser una imagen de texto.",
          //         "is_dash_eligible": null,
          //         "video_dash_manifest": null,
          //         "media_type": 1,
          //         "original_height": 1350,
          //         "original_width": 1080,
          //         "inventory_source": null,
          //         "user": null,
          //         "usertags": {
          //             "in": [
          //                 {
          //                     "user": {
          //                         "pk": "273421501",
          //                         "full_name": "Camilla",
          //                         "username": "camillajaded",
          //                         "profile_pic_url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-19/461049011_1280981103067463_3592714859599288467_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=OLuELQYfqyUQ7kNvwFk5fBa&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKm7jiHBykRGWdIQ7H8YN2jshC1M-5pJqhA1aXtnGDBmw&oe=6829B28B&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "273421501"
          //                     },
          //                     "position": [
          //                         0.7729468599,
          //                         0.1509661836
          //                     ]
          //                 },
          //                 {
          //                     "user": {
          //                         "pk": "350516929",
          //                         "full_name": "Ema Stoned",
          //                         "username": "emastoned",
          //                         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/482917676_864236415778610_156621784342524646_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=hUfnZiH-TAgQ7kNvwEGAuWv&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKOidHpG6N2CoCtWqUQIUzjJVZgy23MOD9QeMl0EWVu_A&oe=68298543&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "350516929"
          //                     },
          //                     "position": [
          //                         0.7693236715,
          //                         0.7439613527000001
          //                     ]
          //                 },
          //                 {
          //                     "user": {
          //                         "pk": "464095257",
          //                         "full_name": "Violeta de Outono",
          //                         "username": "violetadeoutono",
          //                         "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/383783542_1481657845991340_1498487277648022225_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=XptAbIbU8c8Q7kNvwHbTnbq&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfJJrIOdKLTFUc_0NFNdjZaaLhQG7UQGCx-3wtDFuqMdFQ&oe=68299188&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "464095257"
          //                     },
          //                     "position": [
          //                         0.3888888889,
          //                         0.6256038647000001
          //                     ]
          //                 },
          //                 {
          //                     "user": {
          //                         "pk": "1252283637",
          //                         "full_name": "BIKE",
          //                         "username": "bikeoficial",
          //                         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/496346731_18508039405059638_3611412978315541351_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=IAzokBOOMBEQ7kNvwGuiQsS&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfL6JFnX9qst9Zi83Pa1NOqVd1wHYC3KNSEF46ff0zR3Hw&oe=6829B011&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "1252283637"
          //                     },
          //                     "position": [
          //                         0.3236714976,
          //                         0.8164251208000001
          //                     ]
          //                 },
          //                 {
          //                     "user": {
          //                         "pk": "1480238672",
          //                         "full_name": "€rikaaraujo",
          //                         "username": "eri.kat",
          //                         "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/461762461_1266064488078687_5067500384864731464_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=k3iQ4bgfTfAQ7kNvwHnYOAz&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfJvzsCZav_Htwdn76iRxqvhGQF8QOqyd9e1duAnuHAfGw&oe=6829844F&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "1480238672"
          //                     },
          //                     "position": [
          //                         0.7741545894,
          //                         0.0362318841
          //                     ]
          //                 },
          //                 {
          //                     "user": {
          //                         "pk": "5454055062",
          //                         "full_name": "Purple",
          //                         "username": "purpleproducoes",
          //                         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/18382028_217574178747499_6957689364155465728_a.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=rQLRPXARLUQQ7kNvwE8Vml0&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKIjUhv7G2mlKhGb2ls31Zs8DoNMtDw327xgrxyQgR7lg&oe=6829B7DB&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "5454055062"
          //                     },
          //                     "position": [
          //                         0.6775362319,
          //                         0.8852657005000001
          //                     ]
          //                 },
          //                 {
          //                     "user": {
          //                         "pk": "51917621675",
          //                         "full_name": "PORTA",
          //                         "username": "_____porta_____",
          //                         "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/275099330_361565289137472_2756104158376278478_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=vQxvNwyRYsMQ7kNvwFfyfKw&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfLM-CocElbFMdR0t_OaycvkgApJhagbzpS3KhXDJEdHLg&oe=68298E6C&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "51917621675"
          //                     },
          //                     "position": [
          //                         0.30555555560000003,
          //                         0.2608695652
          //                     ]
          //                 }
          //             ]
          //         },
          //         // "image_versions2": {
          //         //     "candidates": [
          //         //         {
          //         //             "url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-15/495441359_18511808947043238_7825497724830637652_n.jpg?stp=c0.135.1080.1080a_dst-jpg_e35_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwODB4MTM1MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=YpjWxUpN8IkQ7kNvwEvscIE&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzYyNTg2ODI3MTE0MDgwODQ0OQ%3D%3D.3-ccb7-5&oh=00_AfKeSjRGl11RWUp-RajCgATOvuD0SWpthUYjELw7S3sX6g&oe=68298BB1&_nc_sid=7a9f4b",
          //         //             "height": 150,
          //         //             "width": 150
          //         //         }
          //         //     ]
          //         // },
          //         "carousel_parent_id": "3625868281207153050_328427237",
          //         "sharing_friction_info": {
          //             "bloks_app_url": null,
          //             "should_have_sharing_friction": false
          //         },
          //         "preview": "ACIqXvimFuMgfX25xSlj9aNpweozzValjlbI6eufwB/rihSGUGk2kc+pB/KnhGUfjn6ZpPR77+YC+U3bpRTd59f1oo9/y/EBoXP+cUpbPyk/n0pjEnp2/WmYPuf/ANdVvuBbLAen4UeYOSagAwKQuDwalxvr2ES/J7UUyijUBrZI4OKVeBg8n1pMUYqyhSKRCOejdqdUaKBnjvQ+wiSiiigD/9k=",
          //         "organic_tracking_token": null,
          //         "saved_collection_ids": null,
          //         "has_viewer_saved": null,
          //         "video_versions": null,
          //         "media_overlay_info": null,
          //         "display_uri": null,
          //         "number_of_qualities": null,
          //         "taken_at": 1746457202,
          //         "previous_submitter": null,
          //         "link": null,
          //         "story_cta": null,
          //         "has_liked": null,
          //         "like_count": null,
          //         "logging_info_token": null,
          //         "owner": null
          //     },
          //     {
          //         "id": "3625868271275037903_328427237",
          //         "pk": "3625868271275037903",
          //         "accessibility_caption": "Photo shared by Cecília Cultural on May 05, 2025 tagging @violetadeoutono. Puede ser una imagen en blanco y negro de 3 personas.",
          //         "is_dash_eligible": null,
          //         "video_dash_manifest": null,
          //         "media_type": 1,
          //         "original_height": 1795,
          //         "original_width": 1440,
          //         "inventory_source": null,
          //         "user": null,
          //         "usertags": {
          //             "in": [
          //                 {
          //                     "user": {
          //                         "pk": "464095257",
          //                         "full_name": "Violeta de Outono",
          //                         "username": "violetadeoutono",
          //                         "profile_pic_url": "https://instagram.fbog4-3.fna.fbcdn.net/v/t51.2885-19/383783542_1481657845991340_1498487277648022225_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-3.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=XptAbIbU8c8Q7kNvwHbTnbq&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfJJrIOdKLTFUc_0NFNdjZaaLhQG7UQGCx-3wtDFuqMdFQ&oe=68299188&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "464095257"
          //                     },
          //                     "position": [
          //                         0.5350241546,
          //                         0.6485507246000001
          //                     ]
          //                 }
          //             ]
          //         },
          //         "image_versions2": {
          //             "candidates": [
          //                 {
          //                     "url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-15/495511355_18511808956043238_3872351670630787053_n.jpg?stp=c0.177.1440.1440a_dst-jpg_e35_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTc5NS5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=DnmHVmFtOcwQ7kNvwHPX3m_&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzYyNTg2ODI3MTI3NTAzNzkwMw%3D%3D.3-ccb7-5&oh=00_AfI5DnJy3uhoG-yXMvR9nv8RNvrUWN5uvKUSOxUGXY2gVg&oe=6829861B&_nc_sid=7a9f4b",
          //                     "height": 150,
          //                     "width": 150
          //                 }
          //             ]
          //         },
          //         "carousel_parent_id": "3625868281207153050_328427237",
          //         "sharing_friction_info": {
          //             "bloks_app_url": null,
          //             "should_have_sharing_friction": false
          //         },
          //         "preview": "ACIqjEUzr87E9Mf59qctmnzNKSQBnPp9KtzyxqMowYIQHxzj64/Gq0l/brIEXLBsZYn5cH8M8UgK8dpDcgmI/d6gjB5qpLE8Qyc4PORV03kULSKvDsRgjlSB05FS3EiuinPDJnoMdOn4UAZPkyHsPyH+FFaCTIFAyDgD0ooAwgSOB3q1dReSVUjDbAWz6mpZ7F45CgHYuB/s/wD1qlugJo4pP4n+U49Qcf5FMDOiQu2BzUru2wR5+XOcf57VKWCoExgxnk/3t2c5+mAMVUZsmgBKKurYyEA7G5HpRQBszSJOMtneudpB5yf6eorJuV8p/wB22RuypxjBxn6cfrUeTn8aJeVP40gIJGBJOc5qxaN5OXZQTxtJ7e4H8v0qie1XQcxrn3/nTAuG/Y87qKzSBRQB/9k=",
          //         "organic_tracking_token": null,
          //         "saved_collection_ids": null,
          //         "has_viewer_saved": null,
          //         "video_versions": null,
          //         "media_overlay_info": null,
          //         "display_uri": null,
          //         "number_of_qualities": null,
          //         "taken_at": 1746457202,
          //         "previous_submitter": null,
          //         "link": null,
          //         "story_cta": null,
          //         "has_liked": null,
          //         "like_count": null,
          //         "logging_info_token": null,
          //         "owner": null
          //     },
          //     {
          //         "id": "3625868270989934220_328427237",
          //         "pk": "3625868270989934220",
          //         "accessibility_caption": "Photo shared by Cecília Cultural on May 05, 2025 tagging @emastoned. Puede ser una imagen de 2 personas.",
          //         "is_dash_eligible": null,
          //         "video_dash_manifest": null,
          //         "media_type": 1,
          //         "original_height": 1332,
          //         "original_width": 1066,
          //         "inventory_source": null,
          //         "user": null,
          //         "usertags": {
          //             "in": [
          //                 {
          //                     "user": {
          //                         "pk": "350516929",
          //                         "full_name": "Ema Stoned",
          //                         "username": "emastoned",
          //                         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/482917676_864236415778610_156621784342524646_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=hUfnZiH-TAgQ7kNvwEGAuWv&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfKOidHpG6N2CoCtWqUQIUzjJVZgy23MOD9QeMl0EWVu_A&oe=68298543&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "350516929"
          //                     },
          //                     "position": [
          //                         0.652173913,
          //                         0.7632850242
          //                     ]
          //                 }
          //             ]
          //         },
          //         "image_versions2": {
          //             "candidates": [
          //                 {
          //                     "url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-15/495475756_18511808965043238_4420222279068262663_n.jpg?stp=c0.133.1066.1066a_dst-jpg_e35_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjEwNjZ4MTMzMi5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=lIpvIsNrq9kQ7kNvwHa-N6G&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzYyNTg2ODI3MDk4OTkzNDIyMA%3D%3D.3-ccb7-5&oh=00_AfJEj7aW6npXyGNbMkRngnkDDuJdw4lbaMUHXpc6V1c-rQ&oe=6829ADC8&_nc_sid=7a9f4b",
          //                     "height": 150,
          //                     "width": 150
          //                 }
          //             ]
          //         },
          //         "carousel_parent_id": "3625868281207153050_328427237",
          //         "sharing_friction_info": {
          //             "bloks_app_url": null,
          //             "should_have_sharing_friction": false
          //         },
          //         "preview": "ACIqwk70Mc8dqXgc1YhSNiA/cNnnHI6fh3pCSKee1PVN3zE49B60oQZIJwMEj39qdAEbh/T9aYMuKMgEZPHpRU+w9iP1ooIMfOTzWhbIhG89QeCf8KoKp7dqvxlFQdegP4n05posY4UHsSPT3qVVWIbud3UAfyqJIs5fsePofw9acVEYDDqOvvSbE+xL9uxwV5FFZRY0UBykqYzipWl+U9BgAAfTiqQNSN0P1oWgyaVzkYOAOfb8qY8+5QO/ekl7fSq5pbjaHbqKKKAP/9k=",
          //         "organic_tracking_token": null,
          //         "saved_collection_ids": null,
          //         "has_viewer_saved": null,
          //         "video_versions": null,
          //         "media_overlay_info": null,
          //         "display_uri": null,
          //         "number_of_qualities": null,
          //         "taken_at": 1746457202,
          //         "previous_submitter": null,
          //         "link": null,
          //         "story_cta": null,
          //         "has_liked": null,
          //         "like_count": null,
          //         "logging_info_token": null,
          //         "owner": null
          //     },
          //     {
          //         "id": "3625868271015162283_328427237",
          //         "pk": "3625868271015162283",
          //         "accessibility_caption": "Photo shared by Cecília Cultural on May 05, 2025 tagging @bikeoficial. Puede ser una imagen de 4 personas y helicóptero.",
          //         "is_dash_eligible": null,
          //         "video_dash_manifest": null,
          //         "media_type": 1,
          //         "original_height": 1800,
          //         "original_width": 1440,
          //         "inventory_source": null,
          //         "user": null,
          //         "usertags": {
          //             "in": [
          //                 {
          //                     "user": {
          //                         "pk": "1252283637",
          //                         "full_name": "BIKE",
          //                         "username": "bikeoficial",
          //                         "profile_pic_url": "https://instagram.fbog4-2.fna.fbcdn.net/v/t51.2885-19/496346731_18508039405059638_3611412978315541351_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fbog4-2.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=IAzokBOOMBEQ7kNvwGuiQsS&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AfL6JFnX9qst9Zi83Pa1NOqVd1wHYC3KNSEF46ff0zR3Hw&oe=6829B011&_nc_sid=7a9f4b",
          //                         "is_verified": false,
          //                         "id": "1252283637"
          //                     },
          //                     "position": [
          //                         0.5338164251,
          //                         0.7717391304
          //                     ]
          //                 }
          //             ]
          //         },
          //         "image_versions2": {
          //             "candidates": [
          //                 {
          //                     "url": "https://instagram.fbog4-1.fna.fbcdn.net/v/t51.2885-15/495459549_18511808989043238_5262573356198061563_n.jpg?stp=c0.180.1440.1440a_dst-jpg_e35_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTgwMC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fbog4-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QGvmwuuWnadiQOi0pbAXFDw61pg42gvYWjP3XskF5SIob0syORHvS-vghY7vJwfPRU&_nc_ohc=8NrTk0DxRUIQ7kNvwEdrr_D&_nc_gid=LxlT62kkrskf7njUpWsikQ&edm=AP4sbd4BAAAA&ccb=7-5&ig_cache_key=MzYyNTg2ODI3MTAxNTE2MjI4Mw%3D%3D.3-ccb7-5&oh=00_AfJrQUlB_oSAX-gPCxBn4mJKP_3fIpHDBsY9KyHY3QyWBw&oe=6829A2B1&_nc_sid=7a9f4b",
          //                     "height": 150,
          //                     "width": 150
          //                 }
          //             ]
          //         },
          //         "carousel_parent_id": "3625868281207153050_328427237",
          //         "sharing_friction_info": {
          //             "bloks_app_url": null,
          //             "should_have_sharing_friction": false
          //         },
          //         "preview": "ACIq0DgcnpUfm84UFiDg46/XHerH2VRyxLevp+VQXTKi+WvBOOB2Gecgc4/nSGV5RM3AOD7fpkc/1rNnidMpjd6kdOefzq4Lgwhgy/MOST1I6/U/n0980x3MynJxt7EY59vXj60wKX2Yf3h+RoqcLH3DfmP8aKLeor+SOl3bqgMeXDHooOB7n3+nSpQOKqPMokC57HI+uMUAMuoPMG5fvjp7j0pjJGFCNgcZ689PrVwmqU0Cs4J/iPI+g7UDMcyLnheO3NFWDp8ueCuPx/wopknQsA4weh/CqD28e8KABwTx1yMYOfrV0VnqSblh7f4Uhlp3Ealm6AZNZk1yHGQGBA9fX0x3rUcZUg88VhQgeW/swx+tDGR+Y/ofzP8AjRUlFSI//9k=",
          //         "organic_tracking_token": null,
          //         "saved_collection_ids": null,
          //         "has_viewer_saved": null,
          //         "video_versions": null,
          //         "media_overlay_info": null,
          //         "display_uri": null,
          //         "number_of_qualities": null,
          //         "taken_at": 1746457202,
          //         "previous_submitter": null,
          //         "link": null,
          //         "story_cta": null,
          //         "has_liked": null,
          //         "like_count": null,
          //         "logging_info_token": null,
          //         "owner": null
          //     }
          // ],
          location: info.location,
          // "has_audio": null,
          // "clips_metadata": null,
          // "clips_attribution_info": null,
          // "accessibility_caption": null,
          // "audience": null,
          // "display_uri": null,
          // "media_cropping_info": null,
          // "profile_grid_thumbnail_fitting_style": "UNSET",
          // "thumbnails": null,
          // "timeline_pinned_user_ids": [
          //     "51917621675"
          // ],
          upcoming_event: info.upcoming_event,
          // "logging_info_token": null,
          // "explore": null,
          // "main_feed_carousel_starting_media_id": null,
          // "is_seen": null,
          // "open_carousel_submission_state": "closed",
          // "previous_submitter": null,
          // "all_previous_submitters": null,
          // "headline": null,
          comments: info.comments,
          fb_like_count: info.fb_like_count,
          // "saved_collection_ids": null,
          // "has_viewer_saved": null,
          // "media_level_comment_controls": null,
          // "__typename": "XDTMediaDict"
        };
        // } catch (error) {
        //   console.error(error);
        //   break;
        //   return null;
        // }
      });
      timelineSummary[userId].push(...posts);
    }
  });

  const allPosts = Object.values(timelineSummary).flat();
  console.log(allPosts.length);
  if (!fs.existsSync(`${timelinesPath}/processed`)) {
    fs.mkdirSync(`${timelinesPath}/processed`);
  }
  crearArchivo(`${timelinesPath}/processed/posts.json`, allPosts);
  // crearArchivo(`${timelinesPath}/processed/relatedUsers.json`, Object.values(timelineSummary).map((profile:any)=>));
}

function extract_tags_in_timeline() {
  const timelinesPath = PROFILES_DIR_PATH;

  const files = fs.readdirSync(`${timelinesPath}/timeline`);

  const timelineSummary: Record<string, any> = {};
  let lastUserId: string = "";
  let userIndex = 0;

  console.log("****   ", files.length);
  files.forEach((file: string) => {
    const content = leerArchivo(`${timelinesPath}/timeline/${file}`);
    const match = file.match(/^(.*)_\d+\.json$/);
    const userId = match ? match[1] : null;

    if (userId) {
      if (!(userId in timelineSummary)) {
        timelineSummary[userId] = [];
      }
      if (lastUserId != userId) {
        lastUserId = userId;
        userIndex++;
        if (userIndex % 200 == 0) {
          console.log(lastUserId);
        }
      }

      const posts = content.map((post: any) => {
        const info = post.node;
        // try {
        return {
          "user.username": info.user.username,
          "owner.username": info.owner.username,
          "coauthor_producers.username": info.coauthor_producers.map(
            (user: any) => user.username
          ),
          "invited_coauthor_producers.username":
            info.invited_coauthor_producers.map((user: any) => user.username),
          "usertags.username": info.usertags?.in?.map(
            (user: any) => user.user.username
          ),
          carousel_media_tags: info.carousel_media?.map((media: any) =>
            media.usertags?.in?.map((tag: any) => tag.user?.username)
          ),
        };
      });

      const usernamesInPost = posts.map((post: any) => {
        const usernames: string[] = [];

        Object.values(post).forEach((value) => {
          if (typeof value === "string") {
            usernames.push(value);
          } else if (Array.isArray(value)) {
            value.forEach((inner) => {
              if (typeof inner === "string") {
                usernames.push(inner);
              } else if (Array.isArray(inner)) {
                inner.forEach((nested) => {
                  if (typeof nested === "string") {
                    usernames.push(nested);
                  }
                });
              }
            });
          }
        });
        return usernames;
      });

      // console.log("XXX XXXX  xXXXXXX");
      // console.log(...new Set(usernamesInPost.flat()).values());
      // console.log("XXX XXXX  xXXXXXX");
      // console.log("==================", posts);
      // timelineSummary[userId].push(...posts);
      timelineSummary[userId] = [
        ...new Set([
          ...timelineSummary[userId],
          ...usernamesInPost.flat(),
        ]).values(),
      ].sort();
    }
  });

  // console.log(timelineSummary);
  // const allPosts = Object.values(timelineSummary).flat();
  // console.log(allPosts.length);
  if (!fs.existsSync(`${timelinesPath}/processed`)) {
    fs.mkdirSync(`${timelinesPath}/processed`);
  }
  crearArchivo(`${timelinesPath}/processed/tags.json`, timelineSummary);
  // crearArchivo(`${timelinesPath}/processed/relatedUsers.json`, Object.values(timelineSummary).map((profile:any)=>));
}

function generate_genres_from_tags_in_timeline() {
  const artistasFull = leerArchivo(
    "./data/drive/2025/chunks/export/artist_hive.artists_related.json"
  );

  const artistsWithGenres: Record<string, any> = {};
  const placesWithGenres: Record<string, any> = {};

  artistasFull
    .filter(
      (artist: any) => !!artist.genres?.music?.length && !!artist.instagram
    )
    .forEach((artist: any) => {
      artistsWithGenres[artist.instagram] = artist.genres.music;
    });

  const timelinesPath = PROFILES_DIR_PATH;
  const tags = leerArchivo(`${timelinesPath}/processed/tags.json`);

  const placesFull = leerArchivo(
    "./data/drive/2025/chunks/export/artist_hive.places.json"
  );

  let totalSitios = 0;

  placesFull.forEach((place: any, index: number) => {
    if (index % 200 === 0) {
      console.log(place.instagram);
    }
    const tagsInPlace = tags[place.instagram];
    if (tagsInPlace) {
      const genres = [
        ...new Set(
          tagsInPlace
            .map((tag: string) => artistsWithGenres[tag])
            .flat()
            .filter(Boolean)
        ),
      ];
      totalSitios += !!genres.length ? 1 : 0;
      if (!!genres.length) {
        placesWithGenres[place.instagram] = genres;
      }
    }
  });

  console.log(placesFull.length, " => ", totalSitios);
  crearArchivo(
    `${timelinesPath}/processed/places_genres.json`,
    placesWithGenres
  );
}

function generate_instagram_stats() {
  //   const timelinesPath =
  //     "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/places/profiles";
  //   const posts = leerArchivo(`${timelinesPath}/processed/posts.json`);

  //   console.log(posts.length);
  // }

  // function generate_instagram_stats_raw() {
  const timelinesPath = PROFILES_DIR_PATH;

  const files = fs.readdirSync(`${timelinesPath}/timeline`);

  const timelineSummary: Record<string, any> = {};
  let lastUserId: string = "";
  let userIndex = 0;

  console.log("****   ", files.length);
  files.forEach((file: string) => {
    const content = leerArchivo(`${timelinesPath}/timeline/${file}`);
    const match = file.match(/^(.*)_\d+\.json$/);
    const userId = match ? match[1] : null;

    if (userId) {
      if (!(userId in timelineSummary)) {
        timelineSummary[userId] = {};
      }
      if (lastUserId != userId) {
        lastUserId = userId;
        userIndex++;
        if (userIndex % 200 == 0) {
          console.log(lastUserId, content.length);
        }
      }

      timelineSummary[userId].totalPosts =
        (timelineSummary[userId].totalPosts || 0) + content.length;

      const creationTime: number[] = [];
      content.forEach((post: any) => {
        const postInfo = post.node || {};

        if (postInfo.taken_at) {
          creationTime.push(postInfo.taken_at);
        }
      });
      timelineSummary[userId].creationTime = [
        ...(timelineSummary[userId].creationTime || []),
        ...creationTime,
      ].sort();
    }
  });

  Object.keys(timelineSummary).forEach((key) => {
    timelineSummary[key].name = key;
    timelineSummary[key].deltaCreatedTime = timelineSummary[key].creationTime
      .map((v: number, i: number, a: number[]) => {
        const diff = v - (a[i - 1] || 0);
        return diff != v ? diff : -v;
      })
      .filter((v: number) => v >= -1000000000);

    timelineSummary[key].minDeltaCreatedTime = Math.min(
      ...timelineSummary[key].deltaCreatedTime
    );
    timelineSummary[key].maxDeltaCreatedTime = Math.max(
      ...timelineSummary[key].deltaCreatedTime
    );
    timelineSummary[key].meanDeltaCreatedTime = mean(
      timelineSummary[key].deltaCreatedTime
    );
    timelineSummary[key].medianDeltaCreatedTime = median(
      timelineSummary[key].deltaCreatedTime
    );

    const human: string[] = [
      "minDeltaCreatedTime",
      "maxDeltaCreatedTime",
      "meanDeltaCreatedTime",
      "medianDeltaCreatedTime",
    ];

    human.forEach((attribute: string) => {
      timelineSummary[key][`${attribute}_H`] = forHumans(
        timelineSummary[key][attribute]
      );
    });

    timelineSummary[key].minCreatedTime = Math.min(
      ...timelineSummary[key].creationTime
    );
    timelineSummary[key].maxCreatedTime = Math.max(
      ...timelineSummary[key].creationTime
    );
    timelineSummary[key].minCreatedTimeDate = new Date(
      (timelineSummary[key].minCreatedTime || 0) * 1000
    );
    timelineSummary[key].maxCreatedTimeDate = new Date(
      (timelineSummary[key].maxCreatedTime || 0) * 1000
    );
  });

  const copy = [
    "name",
    "totalPosts",
    "minDeltaCreatedTime",
    "maxDeltaCreatedTime",
    "meanDeltaCreatedTime",
    "medianDeltaCreatedTime",
    "minDeltaCreatedTime_H",
    "maxDeltaCreatedTime_H",
    "meanDeltaCreatedTime_H",
    "medianDeltaCreatedTime_H",
    "minCreatedTime",
    "maxCreatedTime",
    "minCreatedTimeDate",
    "maxCreatedTimeDate",
  ];

  const res = Object.values(timelineSummary)
    .map((data: any) =>
      copy.reduce((o: any, k: string) => ((o[k] = data[k]), o), {})
    )
    .sort(
      (a: any, b: any) => a.medianDeltaCreatedTime - b.medianDeltaCreatedTime
    );

  // console.log(res);
  crearArchivo(`${timelinesPath}/processed/stats.json`, res);
}

function mean(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}
function median(values: number[]): number {
  if (values.length === 0) {
    // throw new Error("Input array is empty");
    return -1;
  }

  // Sorting values, preventing original array
  // from being mutated.
  values = [...values].sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
}

function forHumans(seconds: number) {
  var levels = [
    [Math.floor(seconds / 31536000), "years"],
    [Math.floor((seconds % 31536000) / 86400), "days"],
    [Math.floor(((seconds % 31536000) % 86400) / 3600), "hours"],
    [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), "minutes"],
    [(((seconds % 31536000) % 86400) % 3600) % 60, "seconds"],
  ];

  var returntext = "";

  for (var i = 0, max = levels.length; i < max; i++) {
    if (levels[i][0] === 0) continue;
    const amount: number = <number>levels[i][0];
    const units: string = <string>levels[i][1];
    returntext +=
      " " +
      Math.ceil(amount) +
      " " +
      (levels[i][0] === 1
        ? units.substring(0, units.length - 1)
        : levels[i][1]);
  }
  return returntext.trim();
}
