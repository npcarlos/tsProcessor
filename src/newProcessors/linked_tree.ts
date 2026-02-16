import { writeFile } from "fs/promises";
import { leerArchivo } from "../helpers/files.helpers";

interface Link {
  type: string;
  title: string;
  url: string;
}

interface UserData {
  username: string;
  scraped_at: number;
  links: Link[];
}

interface DomainLinks {
  [domain: string]: string;
}

export async function main(args?: any) {
  const inputPath = "./data/scrapped/linked_tree/results.json";
  const outputPath = "./data/scrapped/linked_tree/results.csv";

  try {
    console.log(`Reading JSON file: ${inputPath}`);
    const rawData: UserData[] = leerArchivo(inputPath);
    console.log(`✓ Read ${rawData.length} users`);

    // Contar cuántos usuarios tienen cada dominio
    const domainUserCount = new Map<string, number>();

    rawData.forEach((user) => {
      const userDomains = new Set<string>();

      // Primero filtrar solo los URLs de Spotify
      const spotifyUrls = user.links
        .map((l) => l.url)
        .filter((url) => {
          const domain = extractDomain(url);
          return domain === "spotify.com" || domain === "open.spotify.com";
        });

      // Si hay URLs de Spotify, procesarlos
      if (spotifyUrls.length > 0) {
        const spotifyData = extractSpotifyLinks(spotifyUrls);
        if (spotifyData.artist) userDomains.add("spotify artist");
        if (spotifyData.album) userDomains.add("spotify album");
        if (spotifyData.track) userDomains.add("spotify track");
      }

      // Procesar el resto de los links
      user.links.forEach((link) => {
        const domain = extractDomain(link.url);
        if (
          domain &&
          domain !== "spotify.com" &&
          domain !== "open.spotify.com"
        ) {
          userDomains.add(domain);
        }
      });

      // Incrementar el contador para cada dominio único del usuario
      userDomains.forEach((domain) => {
        domainUserCount.set(domain, (domainUserCount.get(domain) || 0) + 1);
      });
    });

    // Ordenar dominios por cantidad de usuarios (de mayor a menor)
    const sortedDomains = Array.from(domainUserCount.entries())
      .map(([domain, count]) => ({ domain, userCount: count }))
      .sort((a, b) => b.userCount - a.userCount)
      .map((item) => item.domain);

    console.log(`✓ Found ${sortedDomains.length} unique domains`);
    console.log(`✓ Top 10 domains by user count:`);
    sortedDomains.slice(0, 10).forEach((domain) => {
      console.log(`  ${domain}: ${domainUserCount.get(domain)} users`);
    });

    // Crear el CSV
    const csvRows: string[] = [];

    // Header
    const header = ["username", "scraped_at", ...sortedDomains].join(";");
    csvRows.push(header);

    // Data rows
    rawData.forEach((user) => {
      const domainLinks: DomainLinks = {};

      // Primero filtrar solo los URLs de Spotify
      const spotifyUrls = user.links
        .map((l) => l.url)
        .filter((url) => {
          const domain = extractDomain(url);
          return domain === "spotify.com" || domain === "open.spotify.com";
        });

      // Si hay URLs de Spotify, procesarlos
      if (spotifyUrls.length > 0) {
        const spotifyData = extractSpotifyLinks(spotifyUrls);

        // Agregar como dominios separados
        if (spotifyData.artist) {
          domainLinks["spotify artist"] = spotifyData.artist;
        }
        if (spotifyData.album) {
          domainLinks["spotify album"] = spotifyData.album;
        }
        if (spotifyData.track) {
          domainLinks["spotify track"] = spotifyData.track;
        }
      }

      // Extraer todos los links del usuario agrupados por dominio (excepto Spotify)
      user.links.forEach((link) => {
        const domain = extractDomain(link.url);
        if (
          domain &&
          domain !== "spotify.com" &&
          domain !== "open.spotify.com"
        ) {
          // Para otros dominios, comportamiento normal
          if (domainLinks[domain]) {
            domainLinks[domain] += ` | ${link.url}`;
          } else {
            domainLinks[domain] = link.url;
          }
        }
      });

      // Crear la fila del CSV
      const row = [
        escapeCsvValue(user.username),
        user.scraped_at.toString(),
        ...sortedDomains.map((domain) =>
          escapeCsvValue(domainLinks[domain] || ""),
        ),
      ].join(";");

      csvRows.push(row);
    });

    const csvContent = csvRows.join("\n");

    // Guardar el archivo CSV
    await writeFile(outputPath, csvContent, "utf-8");
    console.log(`✓ Saved CSV to: ${outputPath}`);
    console.log(`✓ Total rows: ${rawData.length}`);
    console.log(`✓ Total columns: ${sortedDomains.length + 2}`);

    return csvContent;
  } catch (error) {
    console.error("Error converting JSON to CSV:", (error as Error).message);
    throw error;
  }
}

/**
 * Extrae el dominio de una URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch (error) {
    // Si la URL no es válida, retornar null
    return null;
  }
}

/**
 * Extrae links de Spotify por tipo (artist, album, track)
 * Prioridad: artist > album > track
 */
function extractSpotifyLinks(urls: string[]): {
  artist: string | null;
  album: string | null;
  track: string | null;
} {
  const result = {
    artist: null as string | null,
    album: null as string | null,
    track: null as string | null,
  };

  for (const url of urls) {
    // Buscar artist
    if (!result.artist && url.includes("/artist/")) {
      result.artist = url;
    }
    // Buscar album (solo si no hay artist)
    else if (!result.album && url.includes("/album/")) {
      result.album = url;
    }
    // Buscar track (solo si no hay artist ni album)
    else if (!result.track && url.includes("/track/")) {
      result.track = url;
    }
  }

  return result;
}

/**
 * Escapa valores para CSV (maneja comas, comillas y saltos de línea)
 */
function escapeCsvValue(value: string): string {
  if (!value) return "";

  // Si el valor contiene coma, comilla o salto de línea, lo envolvemos en comillas
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    // Duplicar las comillas internas
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return value;
}
