// import * as fs from "fs";

import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

// import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

export function main(args?: any) {
  //   consolidarGeneros();
}

function consolidarGeneros() {
  const data = leerArchivo("data/parametrics/server-genres.json");

  const result: any[][] = [];
  console.log(
    Object.keys(data).map((genre: any) => {
      const subgenres = Object.keys(data[genre].subgenres).map((sub: any) => {
        // return { value: sub, label: data[genre].subgenres[sub].name };
        return sub;
      });
      result.push(subgenres);
      console.log(genre, subgenres);
      //   return Object.keys(subgenres).map(
      //     (subgenre: any) => {
      //         // console.log(subgenre)
      //         // subgenres[subgenre].name}
      //   );
    })
  );
  console.log(result.flat());
  crearArchivo("data/parametrics/server-genres_search.json", result.flat());
}
