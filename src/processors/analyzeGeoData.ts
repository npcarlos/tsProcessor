import * as fs from "fs";
import * as path from "path";
import { leerArchivo } from "../helpers/files.helpers";

/**
 * Analiza Ciudades.csv para obtener estadísticas y países prioritarios
 */
export async function analyzeGeoData() {
  const csvPath = "data/drive/2025/10-31/Geography/Ciudades.csv";
  const hierarchiesPath = "src/data/countryHierarchies.json";
  const countriesMongoPath = "data/geo/mongo/artist_hive.countries.json";

  console.log("🔍 Analizando datos geográficos...\n");

  // 1. Leer Ciudades.csv
  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim().length > 0);

  const records: Array<{
    country: string;
    country_alpha2: string;
    state: string;
    city: string;
  }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";");
    if (parts.length >= 4) {
      const country = parts[0].trim();
      const alpha2 = parts[1].trim();

      // Ignorar registros sin país o sin código alpha2
      if (!country || !alpha2) continue;

      records.push({
        country,
        country_alpha2: alpha2,
        state: parts[2].trim(),
        city: parts[3].trim(),
      });
    }
  }

  console.log(`📊 Total registros en Ciudades.csv: ${records.length.toLocaleString()}\n`);

  // 2. Estadísticas por país
  const countryStats = new Map<
    string,
    {
      count: number;
      alpha2: string;
      states: Set<string>;
      cities: Set<string>;
    }
  >();

  records.forEach((record) => {
    if (!countryStats.has(record.country)) {
      countryStats.set(record.country, {
        count: 0,
        alpha2: record.country_alpha2,
        states: new Set(),
        cities: new Set(),
      });
    }

    const stats = countryStats.get(record.country)!;
    stats.count++;
    stats.states.add(record.state);
    stats.cities.add(record.city);
  });

  // 3. Ordenar países por participación
  const sortedCountries = Array.from(countryStats.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([country, stats], index) => ({
      rank: index + 1,
      country,
      alpha2: stats.alpha2,
      records: stats.count,
      percentage: ((stats.count / records.length) * 100).toFixed(2),
      states: stats.states.size,
      cities: stats.cities.size,
    }));

  // 4. Top 54 países
  const top54 = sortedCountries.slice(0, 54);

  console.log("🌍 TOP 54 PAÍSES POR PARTICIPACIÓN\n");
  console.log("Rank | País                  | Alpha2 | Registros | % Total | Estados | Ciudades");
  console.log("-----|------------------------|--------|-----------|---------|---------|----------");

  top54.forEach((c) => {
    console.log(
      `${String(c.rank).padStart(4)} | ${c.country.padEnd(22)} | ${c.alpha2.padEnd(6)} | ${String(c.records).padStart(9)} | ${String(c.percentage).padStart(7)} | ${String(c.states).padStart(7)} | ${String(c.cities).padStart(8)}`
    );
  });

  // 5. Leer jerarquías
  const hierarchies = JSON.parse(fs.readFileSync(hierarchiesPath, "utf-8"));

  console.log("\n\n🔍 VALIDACIÓN DE JERARQUÍAS\n");
  console.log("Verificando que jerarquías coincidan con datos CSV...\n");

  let hierarchiesFound = 0;
  let hierarchiesMissing: string[] = [];

  top54.forEach((c) => {
    if (hierarchies[c.country]) {
      hierarchiesFound++;
    } else {
      hierarchiesMissing.push(c.country);
    }
  });

  console.log(`✅ Países con jerarquía definida: ${hierarchiesFound}/54`);
  if (hierarchiesMissing.length > 0) {
    console.log(`❌ Países SIN jerarquía definida (${hierarchiesMissing.length}):`);
    hierarchiesMissing.forEach((c) => console.log(`   - ${c}`));
  }

  // 6. Leer countries de MongoDB
  const countriesMongo = leerArchivo(countriesMongoPath);

  console.log("\n\n🔍 VALIDACIÓN DE COUNTRIES MONGO\n");

  const mongoMap = new Map<string, any>();
  countriesMongo.forEach((c: any) => {
    if (c.alpha2) {
      mongoMap.set(c.alpha2.toLowerCase(), c);
    }
  });

  let foundInMongo = 0;
  let missingInMongo: string[] = [];

  top54.forEach((c) => {
    if (mongoMap.has(c.alpha2.toLowerCase())) {
      foundInMongo++;
    } else {
      missingInMongo.push(`${c.country} (${c.alpha2})`);
    }
  });

  console.log(`✅ Países encontrados en MongoDB: ${foundInMongo}/54`);
  if (missingInMongo.length > 0) {
    console.log(`❌ Países NO encontrados en MongoDB (${missingInMongo.length}):`);
    missingInMongo.forEach((c) => console.log(`   - ${c}`));
  }

  // 7. Guardar resultados
  const outputPath = ".claude/geoHierarchy/";
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputPath, "top54_countries.json"),
    JSON.stringify(top54, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(outputPath, "countries_missing_hierarchy.json"),
    JSON.stringify(hierarchiesMissing, null, 2),
    "utf-8"
  );

  console.log(`\n\n📁 Archivos generados en ${outputPath}:`);
  console.log("   - top54_countries.json");
  console.log("   - countries_missing_hierarchy.json");

  // 8. Resumen final
  console.log("\n\n📊 RESUMEN FINAL\n");
  console.log(`Total de registros: ${records.length.toLocaleString()}`);
  console.log(`Total de países: ${sortedCountries.length}`);
  console.log(`Top 54 países representan: ${top54.reduce((sum, c) => sum + parseFloat(c.percentage), 0).toFixed(2)}%`);
  console.log(`Países con jerarquía: ${hierarchiesFound}/54`);
  console.log(`Países en MongoDB: ${foundInMongo}/54`);

  return {
    totalRecords: records.length,
    totalCountries: sortedCountries.length,
    top54,
    hierarchiesFound,
    hierarchiesMissing,
    foundInMongo,
    missingInMongo,
  };
}

export function main() {
  analyzeGeoData().catch(console.error);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
