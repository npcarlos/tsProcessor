const fs = require("fs");
import { leerArchivo } from "../helpers/files.helpers";

export function main(args?: any) {
  procesar_har();
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
