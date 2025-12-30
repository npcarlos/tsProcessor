import fastJson from "fast-json-stringify";
import * as fs from "fs";

const stringify = fastJson({});

export function leerArchivo(path: string) {
  try {
    const fileContent = fs.readFileSync(path, "utf-8");

    if (!fileContent.trim()) {
      throw new Error(`El archivo JSON está vacío.  [${path}]`);
    }

    return JSON.parse(fileContent);
  } catch (error: any) {
    console.error("Error al leer el archivo JSON:", error.message);
  }
}
export function crearArchivo(filePath: string, content: any, isJSON = true) {
  let text = content;
  if (isJSON) {
    text = stringify(content);
    const result = JSON.parse(text); // convierte a objeto JS nuevamente
    text = JSON.stringify(result, null, 2);
  }
  fs.writeFileSync(filePath, text, "utf-8");
}
