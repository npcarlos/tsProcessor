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
  aliases: string[];
  level: number;
  levelName: string;
  capital: string | null;
}

interface CityRecord {
  _id: { $oid: string };
  countryId: { $oid: string } | null;
  countryCode: string;
  countryName: string;
  stateId: { $oid: string } | null;
  stateName: string;
  name: string;
  nationalCode: string | null;
  aliases: string[];
  nicknames: string[];
  level: number;
  levelName: string;
  trending: boolean;
  priority: number;
  coordinates: {
    type: string;
    coordinates: [number, number] | null;
  } | null;
  timezone: string | null;
  isCapital: boolean;
  isStateCapital: boolean;
}

/**
 * Genera la colección de cities (nivel 2) para los países prioritarios
 * Solo incluye ciudades relevantes/trending
 */
export async function generateCities() {
  console.log("🏙️  Generando colección CITIES (Nivel 2)...\n");

  // 1. Leer archivos necesarios
  const top54Path = ".claude/geoHierarchy/top54_countries.json";
  const statesPath = ".claude/geoHierarchy/states.json";
  const csvPath = "data/drive/2025/10-31/Geography/Ciudades.csv";
  const hierarchiesPath = "src/data/countryHierarchies.json";
  const countriesMongoPath = "data/geo/mongo/artist_hive.countries.json";
  const countriesFullPath = "data/geo/countries_full.json";

  const top54Countries: CountryData[] = JSON.parse(
    fs.readFileSync(top54Path, "utf-8")
  );
  const statesCollection: StateRecord[] = JSON.parse(
    fs.readFileSync(statesPath, "utf-8")
  );
  const hierarchies = JSON.parse(fs.readFileSync(hierarchiesPath, "utf-8"));
  const countriesMongo = leerArchivo(countriesMongoPath);
  const countriesFull = JSON.parse(fs.readFileSync(countriesFullPath, "utf-8"));

  console.log(`📊 Países prioritarios: ${top54Countries.length}`);
  console.log(`📊 Estados disponibles: ${statesCollection.length}\n`);

  // 2. Crear mapas de búsqueda rápida
  const mongoCountryMap = new Map<string, any>();
  countriesMongo.forEach((c: any) => {
    if (c.alpha2) {
      mongoCountryMap.set(c.alpha2.toLowerCase(), c);
    }
  });

  const statesByCountryAndName = new Map<string, StateRecord>();
  statesCollection.forEach((state) => {
    const key = `${state.countryCode.toLowerCase()}|${state.name.toLowerCase()}`;
    statesByCountryAndName.set(key, state);
  });

  // Mapa de capitales nacionales
  const capitalsByCountry = new Map<string, string>();
  countriesFull.forEach((c: any) => {
    if (c.alpha2 && c.capital) {
      capitalsByCountry.set(c.alpha2.toLowerCase(), c.capital.toLowerCase());
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

  // 4. Extraer ciudades únicas por país/estado
  const citiesByCountryAndState = new Map<
    string,
    Map<string, { cityName: string; stateName: string; countryData: CountryData }>
  >();

  const prioritizedAlpha2 = new Set(
    top54Countries.map((c) => c.alpha2.toLowerCase())
  );

  csvRecords.forEach((record) => {
    const alpha2 = record.country_alpha2.toLowerCase();

    if (!prioritizedAlpha2.has(alpha2)) return;
    if (!record.city) return;

    const countryData = top54Countries.find(
      (c) => c.alpha2.toLowerCase() === alpha2
    );
    if (!countryData) return;

    if (!citiesByCountryAndState.has(alpha2)) {
      citiesByCountryAndState.set(alpha2, new Map());
    }

    const citiesMap = citiesByCountryAndState.get(alpha2)!;
    const cityKey = `${record.state}|${record.city}`.toLowerCase();

    if (!citiesMap.has(cityKey)) {
      citiesMap.set(cityKey, {
        cityName: record.city,
        stateName: record.state,
        countryData,
      });
    }
  });

  console.log("🌍 Generando ciudades por país:\n");

  // 5. Generar documentos de cities
  const citiesCollection: CityRecord[] = [];
  let totalCities = 0;
  let citiesWithoutState = 0;

  citiesByCountryAndState.forEach((citiesMap, alpha2) => {
    const countryData = top54Countries.find(
      (c) => c.alpha2.toLowerCase() === alpha2
    );
    if (!countryData) return;

    const hierarchy = hierarchies[countryData.country];
    const mongoCountry = mongoCountryMap.get(alpha2);
    const nationalCapital = capitalsByCountry.get(alpha2);

    const level2Name = hierarchy?.levels?.[1]?.nameLocal || "City";

    let countryCitiesCount = 0;

    citiesMap.forEach((cityData) => {
      // Buscar el state correspondiente
      const stateKey = `${alpha2}|${cityData.stateName.toLowerCase()}`;
      const stateDoc = statesByCountryAndName.get(stateKey);

      if (!stateDoc) {
        citiesWithoutState++;
        return; // Skip ciudades sin estado
      }

      const cityNameLower = cityData.cityName.toLowerCase();
      const isCapital = nationalCapital === cityNameLower;
      const isStateCapital = stateDoc.capital?.toLowerCase() === cityNameLower;

      // Determinar trending y priority
      // Criterio: Capitales nacionales = alta prioridad, otras ciudades = baja prioridad
      let trending = false;
      let priority = 3;

      if (isCapital) {
        trending = true;
        priority = 1;
      } else if (isStateCapital) {
        trending = true;
        priority = 2;
      } else {
        // Por ahora, todas las ciudades en el CSV se consideran "trending"
        // ya que ya son un set filtrado
        trending = true;
        priority = 3;
      }

      const cityDoc: CityRecord = {
        _id: { $oid: new mongoose.Types.ObjectId().toHexString() },
        countryId: mongoCountry?._id?.$oid
          ? { $oid: mongoCountry._id.$oid }
          : null,
        countryCode: alpha2,
        countryName: countryData.country,
        stateId: { $oid: stateDoc._id.$oid },
        stateName: stateDoc.name,
        name: cityData.cityName,
        nationalCode: null, // Se puede completar manualmente si hay códigos municipales
        aliases: [],
        nicknames: [],
        level: 2,
        levelName: level2Name,
        trending,
        priority,
        coordinates: null, // Se agregará en paso posterior
        timezone: null, // Se agregará en paso posterior
        isCapital,
        isStateCapital,
      };

      citiesCollection.push(cityDoc);
      totalCities++;
      countryCitiesCount++;
    });

    console.log(
      `   ${countryData.country.padEnd(25)} (${alpha2}): ${countryCitiesCount
        .toString()
        .padStart(4)} ciudades - Nivel 2: ${level2Name}`
    );
  });

  console.log(`\n✅ Total de ciudades generadas: ${totalCities}`);
  console.log(
    `⚠️  Ciudades sin estado: ${citiesWithoutState} (no incluidas)`
  );

  // 6. Guardar archivo JSON
  const outputPath = ".claude/geoHierarchy/cities.json";
  fs.writeFileSync(outputPath, JSON.stringify(citiesCollection, null, 2), "utf-8");

  console.log(`\n📁 Archivo generado: ${outputPath}`);

  // 7. Estadísticas adicionales
  const trendingCities = citiesCollection.filter((c) => c.trending).length;
  const priority1 = citiesCollection.filter((c) => c.priority === 1).length;
  const priority2 = citiesCollection.filter((c) => c.priority === 2).length;
  const priority3 = citiesCollection.filter((c) => c.priority === 3).length;

  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   - Total países procesados: ${citiesByCountryAndState.size}`);
  console.log(`   - Total ciudades generadas: ${totalCities}`);
  console.log(
    `   - Promedio ciudades/país: ${(
      totalCities / citiesByCountryAndState.size
    ).toFixed(1)}`
  );
  console.log(`   - Ciudades trending: ${trendingCities}`);
  console.log(`   - Priority 1 (capitales): ${priority1}`);
  console.log(`   - Priority 2 (cap. estatales): ${priority2}`);
  console.log(`   - Priority 3 (otras): ${priority3}`);

  return {
    totalCities,
    totalCountries: citiesByCountryAndState.size,
    citiesWithoutState,
    trendingCities,
  };
}

export function main() {
  generateCities().catch(console.error);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
