import * as fs from "fs";

export function leerArchivo(path: string) {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}
export function crearArchivo(filePath: string, content: any, isJSON = true) {
  let text = content;
  if (isJSON) {
    text = JSON.stringify(content, null, 2);
  }
  fs.writeFileSync(filePath, text, "utf-8");
}
