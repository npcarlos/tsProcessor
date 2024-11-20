import * as fs from "fs";

export function leerArchivo(path: string) {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}
export function crearArchivo(filePath: string, content: any) {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
}
