import * as fs from "fs";
import * as mongoose from "mongoose";
import { leerArchivo } from "../helpers/files.helpers";

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
 * Completa todos los estados faltantes de cada país
 * usando nationalCodes.json como referencia
 */
export async function completeStates() {
  console.log("🔧 Completando estados faltantes...\n");

  const statesPath = ".claude/geoHierarchy/states.json";
  const nationalCodesPath = "src/data/nationalCodes.json";
  const hierarchiesPath = "src/data/countryHierarchies.json";
  const countriesMongoPath = "data/geo/mongo/artist_hive.countries.json";
  const top54Path = ".claude/geoHierarchy/top54_countries.json";

  const existingStates: StateRecord[] = JSON.parse(
    fs.readFileSync(statesPath, "utf-8")
  );
  const nationalCodes = JSON.parse(fs.readFileSync(nationalCodesPath, "utf-8"));
  const hierarchies = JSON.parse(fs.readFileSync(hierarchiesPath, "utf-8"));
  const countriesMongo = leerArchivo(countriesMongoPath);
  const top54 = JSON.parse(fs.readFileSync(top54Path, "utf-8"));

  // Crear mapa de países de MongoDB
  const mongoCountryMap = new Map<string, any>();
  countriesMongo.forEach((c: any) => {
    if (c.alpha2) {
      mongoCountryMap.set(c.alpha2.toLowerCase(), c);
    }
  });

  // Crear mapa de top54 por alpha2
  const top54Map = new Map<string, any>();
  top54.forEach((c: any) => {
    top54Map.set(c.alpha2.toLowerCase(), c);
  });

  // Crear mapa de estados existentes por país y nombre
  const existingStatesByCountry = new Map<string, Set<string>>();
  existingStates.forEach((state) => {
    const alpha2 = state.countryCode.toLowerCase();
    if (!existingStatesByCountry.has(alpha2)) {
      existingStatesByCountry.set(alpha2, new Set());
    }
    existingStatesByCountry.get(alpha2)!.add(state.name);
  });

  console.log("📊 Estados actuales por país:\n");

  const newStates: StateRecord[] = [];
  let totalAdded = 0;

  // Procesar cada país en nationalCodes.json
  Object.entries(nationalCodes).forEach(([alpha2, countryData]: [string, any]) => {
    const countryStates = countryData.states || {};
    const stateNames = Object.keys(countryStates);

    if (stateNames.length === 0) return;

    const existingCount = existingStatesByCountry.get(alpha2)?.size || 0;
    const totalCount = stateNames.length;
    const missingCount = totalCount - existingCount;

    const countryInfo = top54Map.get(alpha2);
    const mongoCountry = mongoCountryMap.get(alpha2);
    const hierarchy = countryInfo ? hierarchies[countryInfo.country] : null;

    console.log(
      `${(countryInfo?.country || alpha2.toUpperCase()).padEnd(25)} (${alpha2}): ${existingCount
        .toString()
        .padStart(2)}/${totalCount.toString().padStart(2)} | Faltantes: ${missingCount}`
    );

    if (missingCount === 0) return;

    const level1Name = hierarchy?.levels?.[0]?.nameLocal || "State";

    // Agregar estados faltantes
    stateNames.forEach((stateName) => {
      const exists = existingStatesByCountry.get(alpha2)?.has(stateName);
      if (exists) return;

      const nationalCode = countryStates[stateName];

      const stateDoc: StateRecord = {
        _id: { $oid: new mongoose.Types.ObjectId().toHexString() },
        countryId: mongoCountry?._id?.$oid
          ? { $oid: mongoCountry._id.$oid }
          : null,
        countryCode: alpha2,
        countryName: countryInfo?.country || alpha2.toUpperCase(),
        name: stateName,
        nationalCode,
        aliases: [`${level1Name} ${stateName}`],
        level: 1,
        levelName: level1Name,
        capital: null,
      };

      newStates.push(stateDoc);
      totalAdded++;
    });
  });

  console.log(`\n✅ Estados a agregar: ${totalAdded}`);

  // Combinar estados existentes con nuevos
  const allStates = [...existingStates, ...newStates];

  // Ordenar por país y nombre
  allStates.sort((a, b) => {
    if (a.countryCode !== b.countryCode) {
      return a.countryCode.localeCompare(b.countryCode);
    }
    return a.name.localeCompare(b.name);
  });

  // Guardar
  const outputPath = ".claude/geoHierarchy/states_complete.json";
  fs.writeFileSync(outputPath, JSON.stringify(allStates, null, 2), "utf-8");

  console.log(`\n📁 Archivo generado: ${outputPath}`);

  // Estadísticas finales
  const finalByCountry = new Map<string, number>();
  allStates.forEach((state) => {
    const alpha2 = state.countryCode;
    finalByCountry.set(alpha2, (finalByCountry.get(alpha2) || 0) + 1);
  });

  console.log("\n📊 RESUMEN FINAL:\n");
  console.log("País                      | Alpha2 | Antes | Después | Agregados");
  console.log("--------------------------|--------|-------|---------|----------");

  Object.entries(nationalCodes).forEach(([alpha2, countryData]: [string, any]) => {
    const stateNames = Object.keys(countryData.states || {});
    if (stateNames.length === 0) return;

    const before = existingStatesByCountry.get(alpha2)?.size || 0;
    const after = finalByCountry.get(alpha2) || 0;
    const added = after - before;

    const countryInfo = top54Map.get(alpha2);
    const countryName = (countryInfo?.country || alpha2.toUpperCase()).padEnd(25);

    console.log(
      `${countryName} | ${alpha2.padEnd(6)} | ${String(before).padStart(5)} | ${String(
        after
      ).padStart(7)} | ${String(added).padStart(9)}`
    );
  });

  console.log(`\n✅ Total estados: ${existingStates.length} → ${allStates.length} (+${totalAdded})`);

  return {
    before: existingStates.length,
    after: allStates.length,
    added: totalAdded,
  };
}

export function main() {
  completeStates().catch(console.error);
}

if (require.main === module) {
  main();
}
