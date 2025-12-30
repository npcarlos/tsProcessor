import * as fs from "fs/promises";
import * as path from "path";

/**
 * Renombra archivos del formato <timestamp>_<id>.json a <id>_<timestamp>.json
 * Procesa en lotes para evitar sobrecargar el sistema
 */
async function renameTimestampFiles(dirPath: string, batchSize: number = 1000) {
  console.log(`Iniciando renombrado en: ${dirPath}`);

  try {
    // Leer todos los archivos
    console.log("Leyendo directorio...");
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    console.log(
      `Total de archivos JSON encontrados: ${jsonFiles.length.toLocaleString()}`
    );

    // Filtrar solo los que coincidan con el patrón <timestamp>_<id>.json
    const pattern = /^(\d+)_(.+)\.json$/;
    const filesToRename = jsonFiles.filter((file) => pattern.test(file));

    console.log(
      `Archivos que coinciden con el patrón: ${filesToRename.length.toLocaleString()}`
    );

    if (filesToRename.length === 0) {
      console.log("No hay archivos para renombrar");
      return;
    }

    // Confirmar antes de proceder
    console.log(
      "\n¿Deseas continuar? (Este script se ejecutará sin confirmación adicional)"
    );
    console.log(
      `Se renombrarán ${filesToRename.length.toLocaleString()} archivos\n`
    );

    let renamed = 0;
    let errors = 0;
    const errorLog: string[] = [];

    // Procesar en lotes
    for (let i = 0; i < filesToRename.length; i += batchSize) {
      const batch = filesToRename.slice(i, i + batchSize);

      // Renombrar archivos del lote en paralelo
      await Promise.all(
        batch.map(async (file) => {
          try {
            const match = file.match(pattern);
            if (!match) return;

            const [, timestamp, id] = match;
            const newName = `${id}_${timestamp}.json`;

            const oldPath = path.join(dirPath, file);
            const newPath = path.join(dirPath, newName);

            // Verificar que el archivo destino no exista
            try {
              await fs.access(newPath);
              errorLog.push(`Archivo destino ya existe: ${newName}`);
              errors++;
              return;
            } catch {
              // El archivo no existe, podemos continuar
            }

            await fs.rename(oldPath, newPath);
            renamed++;
          } catch (error) {
            errors++;
            errorLog.push(
              `Error renombrando ${file}: ${(error as Error).message}`
            );
          }
        })
      );

      // Mostrar progreso
      const progress = Math.min(i + batchSize, filesToRename.length);
      const percentage = ((progress / filesToRename.length) * 100).toFixed(1);
      console.log(
        `Progreso: ${progress.toLocaleString()}/${filesToRename.length.toLocaleString()} (${percentage}%) - Renombrados: ${renamed.toLocaleString()}, Errores: ${errors}`
      );
    }

    console.log("\n✓ Proceso completado");
    console.log(`Total renombrados: ${renamed.toLocaleString()}`);
    console.log(`Total errores: ${errors}`);

    if (errorLog.length > 0) {
      console.log("\nPrimeros 10 errores:");
      errorLog.slice(0, 10).forEach((err) => console.log(`  - ${err}`));

      if (errorLog.length > 10) {
        console.log(`  ... y ${errorLog.length - 10} errores más`);
      }
    }
  } catch (error) {
    console.error("Error fatal:", (error as Error).message);
    throw error;
  }
}

/**
 * Genera un reporte de los archivos que serían renombrados (sin renombrarlos)
 */
async function previewRename(dirPath: string, sampleSize: number = 20) {
  console.log(`Generando vista previa para: ${dirPath}\n`);

  const files = await fs.readdir(dirPath);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  const pattern = /^(\d+)_(.+)\.json$/;
  const filesToRename = jsonFiles.filter((file) => pattern.test(file));

  console.log(`Total de archivos: ${jsonFiles.length.toLocaleString()}`);
  console.log(
    `Archivos a renombrar: ${filesToRename.length.toLocaleString()}\n`
  );

  if (filesToRename.length > 0) {
    console.log(
      `Muestra de ${Math.min(sampleSize, filesToRename.length)} conversiones:`
    );
    filesToRename.slice(0, sampleSize).forEach((file) => {
      const match = file.match(pattern);
      if (match) {
        const [, timestamp, id] = match;
        const newName = `${id}_${timestamp}.json`;
        console.log(`  ${file} → ${newName}`);
      }
    });
  }
}

// Función principal
export async function main() {
  const dirPath =
    // "C:\\Users\\fnp\\Documents\\Proyectos\\QuarenDevs\\2024\\tsProcessor\\data\\scrapped\\chartmetric\\bands";
    // "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/spotify/bands/artist_bio";
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/spotify/bands/artist_extra";

  // Descomentar para ver vista previa
  // await previewRename(dirPath, 50);

  // Descomentar para ejecutar el renombrado
  await renameTimestampFiles(dirPath, 1000);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}
