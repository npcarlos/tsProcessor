import * as fs from "fs";

import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

type BinResult = {
  range: string;
  count: number;
  ids?: number[];
  low: number;
  high: number;
  percentage: number;
  excludedCount?: number; // IDs que no están en este bin (comparado con todo el array)
  missingInRange: number; // IDs posibles dentro del bin que NO están presentes
};

export function main(args?: any) {
  // compilarSearch();
  // join_two_config_files();
  // generateMissingBins();
  // generar_ids_config();
  // extract_social_networks_from_chartmetric_id();
  console.log("Chartmetric");
}

function extract_social_networks_from_chartmetric_id() {
  const searchPath =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/chartmetric/bands";
  const cmSearchDir = fs.readdirSync(searchPath);

  console.log("Contando desde nuevos en chartmetric");
  const data: any = {};
  cmSearchDir.forEach((file, index: number) => {
    const searchData = leerArchivo(`${searchPath}/${file}`);
    const [timestamp, chartmetric_id] = file.replace(".json", "").split("_");

    try {
      data[chartmetric_id] = {
        instagram:
          searchData?.sn_urls?.obj?.instagram?.url[0]
            ?.split("?")[0]
            .replace("https://www.instagram.com/", "")
            .replace("https://instagram.com/", "") || null,
        spotify:
          searchData?.sn_urls?.obj?.spotify?.url[0]
            // ?.split("?")[0]
            .replace("https://open.spotify.com/artist/", "") || null,
      };

      if (index % 10000 === 0) {
        console.log(index, ") ", chartmetric_id);
      }
    } catch (error) {
      console.log("ERROR   ", file, "   ", error);
    }
  });

  console.log("hay ", Object.keys(data).length);
  const ig = Object.values(data)
    .filter((a: any) => !!a.instagram)
    .map((a: any) => a.instagram);
  crearArchivo(
    "./data/drive/2025/automatic/octubre/instagram_from_chartmetric_11-04.json",
    ig.join("\n")
  );
  const sp = Object.values(data)
    .filter((a: any) => !!a.spotify)
    .map((a: any) => a.spotify);
  crearArchivo(
    "./data/drive/2025/automatic/octubre/spotify_from_chartmetric_11-04.json",
    sp.join("\n")
  );
  console.log("hay con IG", ig.length);
}

function compilarSearch() {
  const searchPath = "./data/scrapped/chartmetric/search";
  const cmSearchDir = fs.readdirSync(searchPath);

  let lista: any[] = [];
  cmSearchDir.forEach((file) => {
    const searchData = leerArchivo(`${searchPath}/${file}`);
    lista = [...lista, ...searchData];
  });

  lista = lista.map((artist) => {
    return { chartmetric: artist.cm_id, downloaded: 0 };
  });
  console.log(lista.length);
  console.log(lista[50]);
  crearArchivo(
    "./data/drive/2025/automatic/faltantes/chartmetric_bands.json",
    lista
  );
}

function generar_ids_config() {
  const downloadedCMPath =
    "./data/drive/2025/automatic/chartmetric_search/config/chartmetric_bands.json";
  const downloadedData = leerArchivo(`${downloadedCMPath}`);
  console.log(downloadedData.length);
  const downloadedIds = new Set(
    downloadedData.map((item: any) => item.chartmetric)
  );

  /// Rangos

  const rangos = leerArchivo(
    "./data/drive/2025/automatic/chartmetric_search/config/missing_bins.json"
  );

  const allRanges = rangos
    .map((range: any) => {
      const allIds = Array.from(
        { length: range.high - range.low },
        (_, i) => range.low + i
      );
      return allIds
        .filter((id: number) => !downloadedIds.has(id))
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      // console.log(
      //   finalIds[0],
      //   finalIds[finalIds.length - 1],
      //   finalIds.length,
      //   500 - finalIds.length
      // );
    })
    .flat();

  crearArchivo(
    "./data/scrapped/config/new/chartmetric_bands_2.json",
    allRanges.map((id: number) => {
      return {
        chartmetric: id,
        downloaded: 0,
      };
    })
  );
}

function join_two_config_files() {
  const dataPath = "./data/drive/2025/automatic/chartmetric_search/config";
  const config1 = leerArchivo(`${dataPath}/chartmetric_bands_original.json`);
  const config2 = leerArchivo(`${dataPath}/chartmetric_bands_stats_1.json`);

  const combined = [...config1, ...config2];

  const map = new Map<number, any>();

  combined.forEach((item: any) => {
    const existing = map.get(item.chartmetric);

    if (!existing || item.downloaded > existing.downloaded) {
      map.set(item.chartmetric, item);
    }
  });

  crearArchivo(`${dataPath}/chartmetric_bands.json`, Array.from(map.values()));
  console.log(
    config1.length,
    config2.length,
    map.size,
    Array.from(map.values()).filter((v: any) => v.downloaded === 0).length
  );
}

function generateMissingBins() {
  const dataPath = "./data/drive/2025/automatic/chartmetric_search/config";
  const configData = leerArchivo(`${dataPath}/chartmetric_bands.json`);
  const bins = getIdBinsWithMissing(configData.map((v: any) => v.chartmetric));

  const binsAmount = 500;
  crearArchivo(
    `${dataPath}/missing_bins.json`,
    bins
      .filter((range) => range.missingInRange > 0)
      .slice(0, binsAmount)
      .map((range: BinResult) => {
        return {
          low: range.low,
          high: range.high,
        };
      })
  );
}

function getIdBinsWithMissing(
  ids: number[],
  binSize: number = 500
): BinResult[] {
  // console.log("Máximo valor:", Math.max(...ids));
  const total = ids.length;
  const bins = new Map<number, Set<number>>(); // Usamos Set para evitar duplicados

  for (const id of ids) {
    const binStart = Math.floor(id / binSize) * binSize;
    if (!bins.has(binStart)) bins.set(binStart, new Set());
    bins.get(binStart)!.add(id);
  }

  const result: BinResult[] = [];

  for (const [start, idSet] of bins.entries()) {
    const count = idSet.size;
    result.push({
      range: `${start}-${start + binSize - 1}`,
      low: start,
      high: start + binSize - 1,
      count,
      // ids: Array.from(idSet),
      percentage: parseFloat(((count / total) * 100).toFixed(2)),
      // excludedCount: total - count,
      missingInRange: binSize - count,
    });
  }

  // Ordenar por cantidad descendente (más frecuentes primero)
  result.sort((a, b) => b.count - a.count);

  return result;
}
