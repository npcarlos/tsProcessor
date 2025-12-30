import * as fs from "fs";
import * as path from "path";

interface GeographyRecord {
  country: string;
  country_alpha2: string;
  state: string;
  city: string;
}

interface CountryStats {
  count: number;
  states: Map<string, number>;
  cities: Map<string, number>;
  citiesByState: Map<string, Map<string, number>>;
}

// Jerarquía administrativa por país (basada en investigación)
interface AdministrativeLevel {
  level: number;
  nameEs: string;
  nameLocal: string;
  quantity: number | string;
  note?: string;
}

interface CountryHierarchy {
  levels: AdministrativeLevel[];
  examples?: string[];
}

// Cargar jerarquías desde archivo JSON
const hierarchiesPath = path.join(__dirname, "../data/countryHierarchies.json");
const COUNTRY_HIERARCHIES: Record<string, CountryHierarchy> = JSON.parse(
  fs.readFileSync(hierarchiesPath, "utf-8")
);

/**
 * Analiza un archivo CSV de geografía y genera estadísticas
 */
async function analyzeGeographyCSV(inputPath: string) {
  console.log(`Analizando archivo: ${inputPath}\n`);

  // Leer el archivo CSV
  const fileContent = fs.readFileSync(inputPath, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim().length > 0);

  // Parsear CSV (punto y coma como separador)
  const records: GeographyRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    // Skip header
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";");
    if (parts.length >= 4) {
      records.push({
        country: parts[0].trim(),
        country_alpha2: parts[1].trim(),
        state: parts[2].trim(),
        city: parts[3].trim(),
      });
    }
  }

  console.log(`📊 RESUMEN GENERAL`);
  console.log(`${"=".repeat(80)}\n`);
  console.log(`Total de registros: ${records.length.toLocaleString()}`);

  // Calcular estadísticas por país
  const countryStats = new Map<string, CountryStats>();

  records.forEach((record) => {
    if (!countryStats.has(record.country)) {
      countryStats.set(record.country, {
        count: 0,
        states: new Map(),
        cities: new Map(),
        citiesByState: new Map(),
      });
    }

    const stats = countryStats.get(record.country)!;
    stats.count++;

    // Contar estados
    stats.states.set(record.state, (stats.states.get(record.state) || 0) + 1);

    // Contar ciudades
    stats.cities.set(record.city, (stats.cities.get(record.city) || 0) + 1);

    // Contar ciudades por estado
    if (!stats.citiesByState.has(record.state)) {
      stats.citiesByState.set(record.state, new Map());
    }
    const stateCities = stats.citiesByState.get(record.state)!;
    stateCities.set(record.city, (stateCities.get(record.city) || 0) + 1);
  });

  // Ordenar países por número de registros
  const sortedCountries = Array.from(countryStats.entries()).sort(
    (a, b) => b[1].count - a[1].count
  );

  // Resumen de países - Top 25
  console.log(`\n📍 TOP 25 PAÍSES (${sortedCountries.length} países únicos)`);
  console.log(`${"=".repeat(80)}\n`);

  sortedCountries.slice(0, 25).forEach(([country, stats], index) => {
    const percentage = ((stats.count / records.length) * 100).toFixed(2);
    const countryName = country || "(sin país)";
    console.log(
      `${String(index + 1).padStart(2)}. ${countryName.padEnd(25)} ${String(stats.count).padStart(5)} registros (${String(percentage).padStart(5)}%)`
    );
  });

  // Top 10 ciudades globales
  const allCities = new Map<string, { count: number; country: string }>();
  records.forEach((record) => {
    const key = `${record.city}, ${record.country}`;
    if (!allCities.has(key)) {
      allCities.set(key, { count: 0, country: record.country });
    }
    allCities.get(key)!.count++;
  });

  const topCities = Array.from(allCities.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  console.log(`\n🏙️  TOP 10 CIUDADES GLOBALES`);
  console.log(`${"=".repeat(80)}\n`);

  topCities.forEach(([cityCountry, data], index) => {
    const percentage = ((data.count / records.length) * 100).toFixed(2);
    console.log(
      `${index + 1}. ${cityCountry}: ${data.count.toLocaleString()} registros (${percentage}%)`
    );
  });

  // Análisis detallado por país (top 5 países)
  console.log(`\n\n📋 ANÁLISIS DETALLADO POR PAÍS`);
  console.log(`${"=".repeat(80)}\n`);

  const topCountries = sortedCountries.slice(0, 5);

  topCountries.forEach(([country, stats], countryIndex) => {
    console.log(`\n${countryIndex + 1}. ${country.toUpperCase()}`);
    console.log(`${"-".repeat(80)}`);
    console.log(
      `   Total de registros: ${stats.count.toLocaleString()} (${((stats.count / records.length) * 100).toFixed(2)}%)`
    );
    console.log(`   Estados únicos: ${stats.states.size}`);
    console.log(`   Ciudades únicas: ${stats.cities.size}`);

    // Top 10 ciudades del país
    const topCountryCities = Array.from(stats.cities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log(`\n   Top 10 ciudades:`);
    topCountryCities.forEach(([city, count], index) => {
      const percentage = ((count / stats.count) * 100).toFixed(2);
      console.log(
        `      ${index + 1}. ${city}: ${count.toLocaleString()} (${percentage}%)`
      );
    });

    // Top 5 estados del país
    const topCountryStates = Array.from(stats.states.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    console.log(`\n   Top 5 estados/departamentos:`);
    topCountryStates.forEach(([state, count], index) => {
      const percentage = ((count / stats.count) * 100).toFixed(2);
      const citiesInState = stats.citiesByState.get(state)?.size || 0;
      console.log(
        `      ${index + 1}. ${state}: ${count.toLocaleString()} registros (${percentage}%) - ${citiesInState} ciudades únicas`
      );

      // Top 5 ciudades del estado
      if (stats.citiesByState.has(state)) {
        const stateCities = Array.from(
          stats.citiesByState.get(state)!.entries()
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        stateCities.forEach(([city, cityCount], cityIndex) => {
          const cityPercentage = ((cityCount / count) * 100).toFixed(2);
          console.log(
            `         ${cityIndex + 1}. ${city}: ${cityCount.toLocaleString()} (${cityPercentage}%)`
          );
        });
      }
    });
  });

  // Jerarquías administrativas por país
  console.log(`\n\n🏛️  JERARQUÍAS ADMINISTRATIVAS POR PAÍS`);
  console.log(`${"=".repeat(80)}\n`);

  console.log("Estructura jerárquica de todos los países en el dataset:\n");

  sortedCountries.forEach(([country, stats], index) => {
    const countryName = country || "(sin país)";
    const hierarchyData = COUNTRY_HIERARCHIES[country];
    const statesInData = stats.states.size;
    const citiesInData = stats.cities.size;

    console.log(`${String(index + 1).padStart(2)}. ${countryName.toUpperCase()}`);

    if (hierarchyData) {
      // Mostrar niveles jerárquicos
      hierarchyData.levels.forEach((level, levelIndex) => {
        const arrow = levelIndex === 0 ? "   " : "   →";
        const noteText = level.note ? ` [${level.note}]` : "";
        console.log(`${arrow} Nivel ${level.level}: ${level.nameEs} (${level.nameLocal}) - ${level.quantity}${noteText}`);
      });

      // Mostrar ejemplos de ciudades
      if (hierarchyData.examples) {
        console.log(`   Ejemplos: ${hierarchyData.examples.join(", ")}`);
      }

      // Mostrar datos del dataset
      console.log(`   📊 En dataset: ${statesInData} divisiones → ${citiesInData} ciudades\n`);
    } else {
      console.log(`   Información no disponible`);
      console.log(`   📊 En dataset: ${statesInData} divisiones → ${citiesInData} ciudades\n`);
    }
  });

  // Datos interesantes
  console.log(`\n\n💡 DATOS INTERESANTES`);
  console.log(`${"=".repeat(80)}\n`);

  // País con más diversidad de ciudades
  const countryWithMostCities = Array.from(countryStats.entries()).sort(
    (a, b) => b[1].cities.size - a[1].cities.size
  )[0];
  console.log(
    `🏆 País con más ciudades únicas: ${countryWithMostCities[0]} (${countryWithMostCities[1].cities.size} ciudades)`
  );

  // País con más diversidad de estados
  const countryWithMostStates = Array.from(countryStats.entries()).sort(
    (a, b) => b[1].states.size - a[1].states.size
  )[0];
  console.log(
    `🏆 País con más estados/departamentos: ${countryWithMostStates[0]} (${countryWithMostStates[1].states.size} estados)`
  );

  // Promedio de registros por país
  const avgPerCountry = records.length / countryStats.size;
  console.log(
    `📊 Promedio de registros por país: ${avgPerCountry.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  );

  // Ciudad más frecuente
  const mostFrequentCity = topCities[0];
  console.log(
    `🌟 Ciudad más frecuente: ${mostFrequentCity[0]} (${mostFrequentCity[1].count.toLocaleString()} registros)`
  );

  // Concentración en top 3 países
  const top3Concentration =
    sortedCountries.slice(0, 3).reduce((sum, [, stats]) => sum + stats.count, 0) /
    records.length;
  console.log(
    `📈 Concentración en top 3 países: ${(top3Concentration * 100).toFixed(2)}%`
  );

  // Concentración en top 10 ciudades
  const top10CitiesConcentration =
    topCities.reduce((sum, [, data]) => sum + data.count, 0) / records.length;
  console.log(
    `📈 Concentración en top 10 ciudades: ${(top10CitiesConcentration * 100).toFixed(2)}%`
  );

  console.log(`\n${"=".repeat(80)}\n`);
}

export async function main() {
  const inputPath =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/10-31/Geography/Ciudades.csv";

  try {
    await analyzeGeographyCSV(inputPath);
  } catch (error) {
    console.error("Error:", (error as Error).message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}
