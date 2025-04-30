import * as fs from "fs";

import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

export function main(args?: any) {
  // compilarSearch();
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
