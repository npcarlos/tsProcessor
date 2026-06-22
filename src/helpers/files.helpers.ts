import fastJson from "fast-json-stringify";
import * as fs from "fs";

const stringify = fastJson({});

export function leerArchivo(path: string) {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(path)) {
      throw new Error(`El archivo no existe: ${path}`);
    }

    // Obtener el tamaño del archivo
    const stats = fs.statSync(path);
    const fileSizeMB = stats.size / (1024 * 1024);

    // console.log(`Leyendo archivo (${fileSizeMB.toFixed(2)} MB): ${path}`);

    const fileContent = fs.readFileSync(path, "utf-8");

    if (!fileContent.trim()) {
      throw new Error(`El archivo JSON está vacío.  [${path}]`);
    }

    // console.log("Parseando JSON...");
    const parsed = JSON.parse(fileContent);
    // console.log("✓ Archivo leído correctamente");

    return parsed;
  } catch (error: any) {
    console.error("❌ Error al leer el archivo JSON:", error.message);
    console.error("   Ruta:", path);
    throw error; // Re-lanzar el error para que el llamador lo maneje
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
