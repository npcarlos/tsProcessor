import * as fs from "fs";

import * as cheerio from "cheerio";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

interface BarData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  musicGenre?: string;
  image?: string;
  ciudad?: string;
}

export function main(args?: any) {
  // readInstagramUsers();
  // extractAlbumsIdUpdate();
}

export function extractAlbumsIdUpdate() {
  const artistsFolder = "./data/drive/2025/spotify";
  const artists = fs.readdirSync(`${artistsFolder}/artists`);

  let ids: any[] = [];
  artists.forEach((artistFile) => {
    const artistId = artistFile.replace(".json", "").split("_")[1];
    // if (
    //   true ||
    //   [
    //     "27neIga89YKdkCk6Yzv0ni",
    //     "5wVJiZKzEWvrxHyP5WhDFu",
    //     "4FmrAtWfKHAIysakSpmatx",
    //     "1MbehwcqhGMlU79kDBYOxo",
    //   ].includes(artistId)
    // )
    {
      const artistInfo = leerArchivo(`${artistsFolder}/artists/${artistFile}`);

      const albums = artistInfo.albums.items.filter(
        (album: any) => album.album_type === "album"
      );
      if (albums.length) {
        ids.push(...albums.map((album: any) => album.id));
      }
    }
    // if (
    //   [
    //     "27neIga89YKdkCk6Yzv0ni",
    //     "5wVJiZKzEWvrxHyP5WhDFu",
    //     "4FmrAtWfKHAIysakSpmatx",
    //     "1MbehwcqhGMlU79kDBYOxo",
    //   ].includes(artistId)
    // ) {
    //   console.log(artistId);
    //   console.log(
    //     artistInfo.albums.items
    //       .filter((album: any) => album.album_type === "album")
    //       .map((album: any) => album.name)
    //       .join("\n")
    //   );
    // }
  });

  const downloadedAlbums = fs.readdirSync(`./data/scrapped/spotify/albums`);
  const faltantes = ids.filter(
    (id: string) =>
      !downloadedAlbums.find((album: string) => album === `${id}.json`)
  );

  crearArchivo(`${artistsFolder}/ids.txt`, faltantes.join("\n"), false);
}

function readInstagramUsers() {
  const asobaresFolder = "./data/drive/2025/asobares";
  const ciudades = fs.readdirSync(`${asobaresFolder}/ciudades`);

  let allBars: BarData[] = [];

  const extractBarsFromHTML = (filename: string, html: string): BarData[] => {
    const $ = cheerio.load(html);
    const bars: BarData[] = [];

    $(".mbr-gallery").each((_, section) => {
      $(section)
        .find(".mbr-gallery-item")
        .each((_, item) => {
          const name = $(item)
            .find(".item-title")
            .text()
            .replace(/\s+/g, " ")
            .trim();

          const fullDescription =
            $(item).find(".card-description").html() || "";
          const description = fullDescription
            .split("<br")[0] // Toma solo hasta el primer <br>
            .replace(/<\/?[^>]+(>|$)/g, "") // Elimina etiquetas HTML
            .replace(/\s+/g, " ") // Reemplaza saltos de línea y espacios extras
            .trim();

          const address = $(item)
            .find("li:contains('Dirección')")
            .text()
            .replace("Dirección:", "")
            .replace(/\s+/g, " ")
            .trim();
          const phone = $(item)
            .find("li:contains('Teléfono')")
            .text()
            .replace("Teléfono:", "")
            .replace(/\s+/g, " ")
            .trim();
          let website: any =
            $(item).find("li:contains('Sitio web') a").attr("href") || "";
          website = website.includes("explore/locations/")
            ? undefined
            : website.replace(/\s+/g, " ");

          const musicGenre = $(item)
            .find("li:contains('Genero Musical')")
            .text()
            .replace("Genero Musical:", "")
            .replace(/\s+/g, " ")
            .trim();
          let image = $(item).find("img").attr("src") || "";
          if (image) {
            image = `https://midestinotunoche.asobares.org/${image}`;
          }
          const ciudad = filename.replace(".html", "");
          bars.push({
            name,
            description,
            address,
            phone,
            website,
            musicGenre,
            image,
            ciudad,
          });
        });
    });

    return bars;
  };

  ciudades.forEach((ciudad) => {
    console.log(ciudad);
    const html = fs.readFileSync(
      `${asobaresFolder}/ciudades/${ciudad}`,
      "utf8"
    );
    const bars = extractBarsFromHTML(ciudad, html);
    allBars = allBars.concat(bars);
  });

  const ig = [...new Set(allBars.map((b) => b.website))];
  console.log(ig.forEach((a) => console.log(a)));
  crearArchivo(`${asobaresFolder}/bares.json`, allBars);
}
