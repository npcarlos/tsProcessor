import * as fs from "fs";

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

interface AliasData {
  aliases: string[];
  nicknames: string[];
  trending: boolean;
  priority: number;
}

/**
 * Aplica aliases y nicknames a las ciudades desde city_aliases.json
 */
export async function applyAliases() {
  console.log("🏷️  Aplicando aliases a ciudades...\n");

  const citiesPath = ".claude/geoHierarchy/cities.json";
  const aliasesPath = ".claude/geoHierarchy/city_aliases.json";

  const citiesCollection: CityRecord[] = JSON.parse(
    fs.readFileSync(citiesPath, "utf-8")
  );
  const cityAliases: Record<string, AliasData> = JSON.parse(
    fs.readFileSync(aliasesPath, "utf-8")
  );

  console.log(`📊 Total ciudades: ${citiesCollection.length}`);
  console.log(`📊 Ciudades con aliases definidos: ${Object.keys(cityAliases).length}\n`);

  let citiesUpdated = 0;
  let aliasesApplied = 0;
  let nicknamesApplied = 0;

  // Crear un mapa normalizado de nombres para búsqueda flexible
  const normalizedAliasMap = new Map<string, { originalKey: string; data: AliasData }>();

  Object.entries(cityAliases).forEach(([cityName, aliasData]) => {
    const normalized = cityName.toLowerCase().trim();
    normalizedAliasMap.set(normalized, {
      originalKey: cityName,
      data: aliasData,
    });
  });

  // Aplicar aliases a cada ciudad
  citiesCollection.forEach((city) => {
    const cityNameNormalized = city.name.toLowerCase().trim();

    const aliasEntry = normalizedAliasMap.get(cityNameNormalized);

    if (aliasEntry) {
      const aliasData = aliasEntry.data;

      city.aliases = aliasData.aliases || [];
      city.nicknames = aliasData.nicknames || [];

      // Actualizar trending y priority si están definidos
      if (aliasData.trending !== undefined) {
        city.trending = aliasData.trending;
      }
      if (aliasData.priority !== undefined) {
        city.priority = aliasData.priority;
      }

      citiesUpdated++;
      aliasesApplied += city.aliases.length;
      nicknamesApplied += city.nicknames.length;

      console.log(
        `   ✅ ${city.name.padEnd(25)} | ${city.aliases.length} aliases, ${city.nicknames.length} nicknames | Priority: ${city.priority}`
      );
    }
  });

  console.log(`\n✅ Ciudades actualizadas: ${citiesUpdated}`);
  console.log(`📝 Total aliases aplicados: ${aliasesApplied}`);
  console.log(`🏷️  Total nicknames aplicados: ${nicknamesApplied}`);

  // Guardar archivo actualizado
  const outputPath = ".claude/geoHierarchy/cities_with_aliases.json";
  fs.writeFileSync(outputPath, JSON.stringify(citiesCollection, null, 2), "utf-8");

  console.log(`\n📁 Archivo generado: ${outputPath}`);

  // Estadísticas
  const withAliases = citiesCollection.filter((c) => c.aliases.length > 0).length;
  const withNicknames = citiesCollection.filter((c) => c.nicknames.length > 0).length;

  console.log("\n📊 ESTADÍSTICAS:");
  console.log(`   - Ciudades con aliases: ${withAliases}`);
  console.log(`   - Ciudades con nicknames: ${withNicknames}`);
  console.log(
    `   - Ciudades sin aliases: ${citiesCollection.length - withAliases}`
  );

  return {
    citiesUpdated,
    aliasesApplied,
    nicknamesApplied,
  };
}

export function main() {
  applyAliases().catch(console.error);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
