import * as fs from "fs";
import * as mongoose from "mongoose";
import { leerArchivo } from "../helpers/files.helpers";

interface CountryData {
  rank: number;
  country: string;
  alpha2: string;
  records: number;
  percentage: string;
  states: number;
  cities: number;
}

interface StateRecord {
  _id: { $oid: string };
  countryId: { $oid: string } | null;
  countryCode: string;
  countryName: string;
  name: string;
  nationalCode: string | null;
  aliases: string[];
  level: number;
  levelName: string;
  capital: string | null;
}

/**
 * Genera la colección de states (nivel 1) para los países prioritarios
 */
export async function generateStates() {
  console.log("🏗️  Generando colección STATES (Nivel 1)...\n");

  // 1. Leer archivos necesarios
  const top54Path = ".claude/geoHierarchy/top54_countries.json";
  const csvPath = "data/drive/2025/10-31/Geography/Ciudades.csv";
  const hierarchiesPath = "src/data/countryHierarchies.json";
  const countriesMongoPath = "data/geo/mongo/artist_hive.countries.json";
  const nationalCodesPath = "src/data/nationalCodes.json";

  const top54Countries: CountryData[] = JSON.parse(
    fs.readFileSync(top54Path, "utf-8")
  );
  const hierarchies = JSON.parse(fs.readFileSync(hierarchiesPath, "utf-8"));
  const countriesMongo = leerArchivo(countriesMongoPath);
  const nationalCodes = JSON.parse(fs.readFileSync(nationalCodesPath, "utf-8"));

  console.log(`📊 Países prioritarios: ${top54Countries.length}`);

  // 2. Crear mapa de países de MongoDB por alpha2
  const mongoCountryMap = new Map<string, any>();
  countriesMongo.forEach((c: any) => {
    if (c.alpha2) {
      mongoCountryMap.set(c.alpha2.toLowerCase(), c);
    }
  });

  // 3. Leer Ciudades.csv
  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim().length > 0);

  const csvRecords: Array<{
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

      if (!country || !alpha2) continue;

      csvRecords.push({
        country,
        country_alpha2: alpha2,
        state: parts[2].trim(),
        city: parts[3].trim(),
      });
    }
  }

  console.log(`📊 Total registros CSV: ${csvRecords.length}\n`);

  // 4. Extraer states únicos por país prioritario
  const statesByCountry = new Map<
    string,
    Map<string, { stateName: string; cities: Set<string> }>
  >();

  const prioritizedAlpha2 = new Set(
    top54Countries.map((c) => c.alpha2.toLowerCase())
  );

  csvRecords.forEach((record) => {
    const alpha2 = record.country_alpha2.toLowerCase();

    if (!prioritizedAlpha2.has(alpha2)) return;
    if (!record.state) return;

    if (!statesByCountry.has(alpha2)) {
      statesByCountry.set(alpha2, new Map());
    }

    const statesMap = statesByCountry.get(alpha2)!;
    const stateKey = record.state.toLowerCase();

    if (!statesMap.has(stateKey)) {
      statesMap.set(stateKey, {
        stateName: record.state,
        cities: new Set(),
      });
    }

    statesMap.get(stateKey)!.cities.add(record.city);
  });

  console.log("🌍 Estados extraídos por país:\n");

  // 5. Generar documentos de states
  const statesCollection: StateRecord[] = [];
  let totalStates = 0;
  let countriesWithoutHierarchy = 0;
  let countriesWithoutMongo = 0;

  statesByCountry.forEach((statesMap, alpha2) => {
    const countryData = top54Countries.find(
      (c) => c.alpha2.toLowerCase() === alpha2
    );
    if (!countryData) return;

    const hierarchy = hierarchies[countryData.country];
    const mongoCountry = mongoCountryMap.get(alpha2);

    // Validaciones
    if (!hierarchy) {
      console.log(
        `⚠️  ${countryData.country} (${alpha2}): SIN jerarquía definida - Se usará nombre genérico`
      );
      countriesWithoutHierarchy++;
    }

    if (!mongoCountry) {
      console.log(
        `⚠️  ${countryData.country} (${alpha2}): NO encontrado en MongoDB - countryId será null`
      );
      countriesWithoutMongo++;
    }

    const level1Name = hierarchy?.levels?.[0]?.nameLocal || "State";
    const countryNationalCodes = nationalCodes[alpha2]?.states || {};

    statesMap.forEach((stateData) => {
      // Buscar código nacional para este estado
      const nationalCode = countryNationalCodes[stateData.stateName] || null;

      const stateDoc: StateRecord = {
        _id: { $oid: new mongoose.Types.ObjectId().toHexString() },
        countryId: mongoCountry?._id?.$oid
          ? { $oid: mongoCountry._id.$oid }
          : null,
        countryCode: alpha2,
        countryName: countryData.country,
        name: stateData.stateName,
        nationalCode,
        aliases: [`${level1Name} ${stateData.stateName}`],
        level: 1,
        levelName: level1Name,
        capital: null, // Se puede completar manualmente después
      };

      statesCollection.push(stateDoc);
      totalStates++;
    });

    console.log(
      `   ${countryData.country.padEnd(25)} (${alpha2}): ${statesMap.size
        .toString()
        .padStart(3)} estados - Nivel 1: ${level1Name}`
    );
  });

  console.log(`\n✅ Total de estados generados: ${totalStates}`);
  console.log(
    `⚠️  Países sin jerarquía: ${countriesWithoutHierarchy} (se usó nombre genérico)`
  );
  console.log(
    `⚠️  Países sin MongoDB: ${countriesWithoutMongo} (countryId = null)`
  );

  // 6. Guardar archivo JSON
  const outputPath = ".claude/geoHierarchy/states.json";
  fs.writeFileSync(outputPath, JSON.stringify(statesCollection, null, 2), "utf-8");

  console.log(`\n📁 Archivo generado: ${outputPath}`);

  // 7. Estadísticas adicionales
  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   - Total países procesados: ${statesByCountry.size}`);
  console.log(`   - Total estados generados: ${totalStates}`);
  console.log(
    `   - Promedio estados/país: ${(totalStates / statesByCountry.size).toFixed(1)}`
  );

  return {
    totalStates,
    totalCountries: statesByCountry.size,
    countriesWithoutHierarchy,
    countriesWithoutMongo,
  };
}

export function main() {
  generateStates().catch(console.error);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
