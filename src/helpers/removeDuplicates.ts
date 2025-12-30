import * as fs from "fs";

/**
 * Remueve duplicados de un archivo de IDs y guarda los duplicados encontrados
 */
async function removeDuplicates(inputPath: string) {
  console.log(`Procesando archivo: ${inputPath}`);

  // Leer el archivo de texto (uno por línea)
  const fileContent = fs.readFileSync(inputPath, "utf-8");
  const data = fileContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log(`Total de IDs en el archivo: ${data.length.toLocaleString()}`);

  // Encontrar duplicados
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  const unique: string[] = [];

  for (const id of data) {
    const idStr = String(id);

    if (seen.has(idStr)) {
      // Es un duplicado
      duplicates.add(idStr);
    } else {
      // Es único (hasta ahora)
      seen.add(idStr);
      unique.push(idStr);
    }
  }

  console.log(`\nResultados:`);
  console.log(`- IDs únicos: ${unique.length.toLocaleString()}`);
  console.log(`- IDs duplicados (únicos): ${duplicates.size.toLocaleString()}`);
  console.log(`- Total de duplicaciones removidas: ${(data.length - unique.length).toLocaleString()}`);

  // Calcular cuántas veces aparece cada duplicado
  if (duplicates.size > 0) {
    const duplicateCounts = new Map<string, number>();
    for (const id of data) {
      const idStr = String(id);
      if (duplicates.has(idStr)) {
        duplicateCounts.set(idStr, (duplicateCounts.get(idStr) || 0) + 1);
      }
    }

    // Mostrar los 10 IDs más duplicados
    const sortedDuplicates = Array.from(duplicateCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log(`\nTop 10 IDs más duplicados:`);
    sortedDuplicates.forEach(([id, count], index) => {
      console.log(`  ${index + 1}. "${id}" - ${count} veces`);
    });
  }

  // Generar rutas de salida
  const lastDotIndex = inputPath.lastIndexOf(".");
  const basePath = lastDotIndex > -1
    ? inputPath.substring(0, lastDotIndex)
    : inputPath;
  const extension = lastDotIndex > -1
    ? inputPath.substring(lastDotIndex)
    : ".txt";

  const uniquePath = `${basePath}_unique${extension}`;
  const duplicatesPath = `${basePath}_duplicates${extension}`;

  // Guardar archivos
  console.log(`\nGuardando resultados...`);

  fs.writeFileSync(uniquePath, unique.join("\n"), "utf-8");
  console.log(`✓ IDs únicos guardados en: ${uniquePath}`);

  if (duplicates.size > 0) {
    fs.writeFileSync(duplicatesPath, Array.from(duplicates).join("\n"), "utf-8");
    console.log(`✓ IDs duplicados guardados en: ${duplicatesPath}`);
  } else {
    console.log(`✓ No se encontraron duplicados`);
  }

  return {
    original: data.length,
    unique: unique.length,
    duplicates: duplicates.size,
    removed: data.length - unique.length
  };
}

export async function main() {
  const inputPath = "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/10-31/spotify_ids.json";

  try {
    await removeDuplicates(inputPath);
  } catch (error) {
    console.error("Error:", (error as Error).message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}
