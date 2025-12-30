import * as fs from "fs";

/**
 * Verifica que todos los estados del CSV estén en states.json
 */
export async function verifyStates() {
  console.log("🔍 Verificando completitud de estados...\n");

  const csvPath = "data/drive/2025/10-31/Geography/Ciudades.csv";
  const statesPath = ".claude/geoHierarchy/states.json";
  const top54Path = ".claude/geoHierarchy/top54_countries.json";

  // Leer CSV
  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim().length > 0);

  // Extraer todos los estados únicos por país del CSV
  const statesByCountryCSV = new Map<string, Set<string>>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";");
    if (parts.length >= 4) {
      const alpha2 = parts[1]?.trim().toLowerCase();
      const state = parts[2]?.trim();

      if (!alpha2 || !state) continue;

      if (!statesByCountryCSV.has(alpha2)) {
        statesByCountryCSV.set(alpha2, new Set());
      }

      statesByCountryCSV.get(alpha2)!.add(state);
    }
  }

  // Leer states.json
  const statesGenerated = JSON.parse(fs.readFileSync(statesPath, "utf-8"));
  const statesByCountryGenerated = new Map<string, Set<string>>();

  statesGenerated.forEach((state: any) => {
    const alpha2 = state.countryCode.toLowerCase();
    if (!statesByCountryGenerated.has(alpha2)) {
      statesByCountryGenerated.set(alpha2, new Set());
    }
    statesByCountryGenerated.get(alpha2)!.add(state.name);
  });

  // Leer top 54
  const top54 = JSON.parse(fs.readFileSync(top54Path, "utf-8"));

  console.log("📊 COMPARACIÓN CSV vs GENERADOS\n");
  console.log(
    "País                      | Alpha2 | CSV | Generados | Faltantes | Status"
  );
  console.log(
    "--------------------------|--------|-----|-----------|-----------|--------"
  );

  let totalCountries = 0;
  let countriesComplete = 0;
  let countriesMissing = 0;
  let totalMissingStates = 0;

  const missingByCountry: any[] = [];

  top54.slice(0, 30).forEach((country: any) => {
    const alpha2 = country.alpha2.toLowerCase();
    const csvStates = statesByCountryCSV.get(alpha2);
    const generatedStates = statesByCountryGenerated.get(alpha2);

    if (!csvStates || csvStates.size === 0) return;

    totalCountries++;

    const csvCount = csvStates.size;
    const generatedCount = generatedStates?.size || 0;

    // Encontrar estados faltantes
    const missing: string[] = [];
    if (generatedStates) {
      csvStates.forEach((stateName) => {
        if (!generatedStates.has(stateName)) {
          missing.push(stateName);
        }
      });
    } else {
      missing.push(...Array.from(csvStates));
    }

    const status = missing.length === 0 ? "✅ OK" : "❌ INCOMPLETO";

    if (missing.length > 0) {
      countriesMissing++;
      totalMissingStates += missing.length;
      missingByCountry.push({
        country: country.country,
        alpha2: country.alpha2,
        missing,
      });
    } else {
      countriesComplete++;
    }

    console.log(
      `${country.country.padEnd(25)} | ${country.alpha2.padEnd(6)} | ${String(
        csvCount
      ).padStart(3)} | ${String(generatedCount).padStart(9)} | ${String(
        missing.length
      ).padStart(9)} | ${status}`
    );
  });

  console.log("\n\n📋 ESTADOS FALTANTES POR PAÍS\n");

  missingByCountry.forEach((item) => {
    console.log(`\n${item.country} (${item.alpha2}):`);
    item.missing.forEach((state: string) => {
      console.log(`   - ${state}`);
    });
  });

  console.log("\n\n📊 RESUMEN:");
  console.log(`   - Total países con estados: ${totalCountries}`);
  console.log(`   - Países completos: ${countriesComplete}`);
  console.log(`   - Países incompletos: ${countriesMissing}`);
  console.log(`   - Total estados faltantes: ${totalMissingStates}`);

  return {
    totalCountries,
    countriesComplete,
    countriesMissing,
    totalMissingStates,
    missingByCountry,
  };
}

export function main() {
  verifyStates().catch(console.error);
}

if (require.main === module) {
  main();
}
