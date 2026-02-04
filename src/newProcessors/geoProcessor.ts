// import * as fs from "fs";
// import { writeFile } from "fs/promises";
// import { tsvToJson } from "../helpers/csvJson.helpers";
// import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

export async function main(args?: any) {
  generate_structure();
}

interface VenueGeoData {
  "#": string;
  Nombre: string;
  Lat: string;
  Lng: string;
  Pais: string;
  administrative_area_level_1: string;
  administrative_area_level_2: string;
  administrative_area_level_3: string;
  administrative_area_level_4: string;
  administrative_area_level_5: string;
  ciudad_administrativa: string;
  ciudad_principal: string;
  locality: string;
  sublocality_level_1: string;
  sublocality_level_2: string;
  neighborhood: string;
  postal_code: string;
  formatted_address: string;
  elevation: string;
  [key: string]: any;
}

interface Country {
  name: string;
  normalized_name: string;
  venues_count: number;
}

interface AdminLevel1 {
  name: string;
  normalized_name: string;
  country: string;
  venues_count: number;
}

interface Locality {
  name: string;
  normalized_name: string;
  aliases: string[];
  country: string;
  admin_level_1: string;
  venues_count: number;
}

interface Sublocality {
  name: string;
  normalized_name: string;
  locality: string;
  venues_count: number;
}

interface Neighborhood {
  name: string;
  normalized_name: string;
  sublocality: string;
  venues_count: number;
}

interface ProcessedVenue {
  id: string;
  nombre: string;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  geo_hierarchy: {
    country: string | null;
    admin_level_1: string | null;
    locality: string | null;
    sublocality_1: string | null;
    neighborhood: string | null;
  };
  postal_code: string;
  formatted_address: string;
  elevation: number | null;
}

function normalize(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .trim();
}

function generate_structure() {
  const geoData: VenueGeoData[] = leerArchivo(
    `data/drive/2025/10-31/GeoData - DATOS.json`
  );

  console.log(`Processing ${geoData.length} venues...`);

  // Estructuras para acumular entidades geográficas únicas
  const countries = new Map<string, Country>();
  const adminLevel1s = new Map<string, AdminLevel1>();
  const localities = new Map<string, Locality>();
  const sublocalities = new Map<string, Sublocality>();
  const neighborhoods = new Map<string, Neighborhood>();
  const processedVenues: ProcessedVenue[] = [];

  let processedCount = 0;

  geoData.forEach((venue, index) => {
    // Extraer y normalizar datos geográficos
    const country = venue.Pais || "";
    const adminL1 = venue.administrative_area_level_1 || venue.ciudad_administrativa || "";
    const locality =
      venue.locality || venue.ciudad_principal || venue.administrative_area_level_1 || "";
    const sublocality1 = venue.sublocality_level_1 || "";
    const neighborhood = venue.neighborhood || "";

    const lat = parseFloat(venue.Lat);
    const lng = parseFloat(venue.Lng);

    // Validar coordenadas
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`Venue ${venue.Nombre} has invalid coordinates, skipping...`);
      return;
    }

    // Procesar Country
    if (country) {
      const normalizedCountry = normalize(country);
      if (!countries.has(normalizedCountry)) {
        countries.set(normalizedCountry, {
          name: country,
          normalized_name: normalizedCountry,
          venues_count: 0,
        });
      }
      countries.get(normalizedCountry)!.venues_count++;
    }

    // Procesar AdminLevel1
    if (adminL1 && country) {
      const key = `${normalize(country)}_${normalize(adminL1)}`;
      if (!adminLevel1s.has(key)) {
        adminLevel1s.set(key, {
          name: adminL1,
          normalized_name: normalize(adminL1),
          country: normalize(country),
          venues_count: 0,
        });
      }
      adminLevel1s.get(key)!.venues_count++;
    }

    // Procesar Locality
    if (locality && country) {
      const key = `${normalize(country)}_${normalize(locality)}`;
      if (!localities.has(key)) {
        // Generar aliases (variaciones del nombre)
        const aliases = new Set<string>();
        aliases.add(normalize(locality));
        // Si tiene "D.C.", agregar sin él
        if (locality.includes("D.C.")) {
          aliases.add(normalize(locality.replace(/,?\s*D\.C\./gi, "")));
        }
        // Si tiene comas, agregar sin ellas
        if (locality.includes(",")) {
          aliases.add(normalize(locality.split(",")[0]));
        }

        localities.set(key, {
          name: locality,
          normalized_name: normalize(locality),
          aliases: Array.from(aliases),
          country: normalize(country),
          admin_level_1: normalize(adminL1),
          venues_count: 0,
        });
      }
      localities.get(key)!.venues_count++;
    }

    // Procesar Sublocality
    if (sublocality1 && locality) {
      const key = `${normalize(locality)}_${normalize(sublocality1)}`;
      if (!sublocalities.has(key)) {
        sublocalities.set(key, {
          name: sublocality1,
          normalized_name: normalize(sublocality1),
          locality: normalize(locality),
          venues_count: 0,
        });
      }
      sublocalities.get(key)!.venues_count++;
    }

    // Procesar Neighborhood
    if (neighborhood && sublocality1) {
      const key = `${normalize(sublocality1)}_${normalize(neighborhood)}`;
      if (!neighborhoods.has(key)) {
        neighborhoods.set(key, {
          name: neighborhood,
          normalized_name: normalize(neighborhood),
          sublocality: normalize(sublocality1),
          venues_count: 0,
        });
      }
      neighborhoods.get(key)!.venues_count++;
    }

    // Crear venue procesado
    processedVenues.push({
      id: venue["#"],
      nombre: venue.Nombre,
      location: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON usa [lng, lat]
      },
      geo_hierarchy: {
        country: normalize(country) || null,
        admin_level_1: normalize(adminL1) || null,
        locality: normalize(locality) || null,
        sublocality_1: normalize(sublocality1) || null,
        neighborhood: normalize(neighborhood) || null,
      },
      postal_code: venue.postal_code || "",
      formatted_address: venue.formatted_address || "",
      elevation: venue.elevation ? parseFloat(venue.elevation) : null,
    });

    processedCount++;

    // Progress logging
    if ((index + 1) % 100 === 0 || index + 1 === geoData.length) {
      const percentage = (((index + 1) / geoData.length) * 100).toFixed(2);
      console.log(`Progress: ${index + 1}/${geoData.length} (${percentage}%)`);
    }
  });

  // Generar archivos de salida
  const outputDir = "data/processed/geo_structure";

  console.log("\nGenerating output files...");

  // Ordenar todos los archivos por venues_count descendente
  crearArchivo(
    `${outputDir}/countries.json`,
    Array.from(countries.values()).sort((a, b) => b.venues_count - a.venues_count)
  );
  crearArchivo(
    `${outputDir}/admin_level_1.json`,
    Array.from(adminLevel1s.values()).sort((a, b) => b.venues_count - a.venues_count)
  );
  crearArchivo(
    `${outputDir}/localities.json`,
    Array.from(localities.values()).sort((a, b) => b.venues_count - a.venues_count)
  );
  crearArchivo(
    `${outputDir}/sublocalities.json`,
    Array.from(sublocalities.values()).sort((a, b) => b.venues_count - a.venues_count)
  );
  crearArchivo(
    `${outputDir}/neighborhoods.json`,
    Array.from(neighborhoods.values()).sort((a, b) => b.venues_count - a.venues_count)
  );
  crearArchivo(`${outputDir}/venues.json`, processedVenues);

  // Generar resumen
  const summary = {
    generated_at: new Date().toISOString(),
    total_venues: processedCount,
    total_countries: countries.size,
    total_admin_level_1: adminLevel1s.size,
    total_localities: localities.size,
    total_sublocalities: sublocalities.size,
    total_neighborhoods: neighborhoods.size,
    countries_list: Array.from(countries.values())
      .sort((a, b) => b.venues_count - a.venues_count)
      .slice(0, 10),
  };

  crearArchivo(`${outputDir}/_summary.json`, summary);

  console.log("\n=== Geographic Structure Summary ===");
  console.log(`Total venues processed: ${processedCount}`);
  console.log(`Countries: ${countries.size}`);
  console.log(`Admin Level 1 (States/Departments): ${adminLevel1s.size}`);
  console.log(`Localities (Cities): ${localities.size}`);
  console.log(`Sublocalities (Zones): ${sublocalities.size}`);
  console.log(`Neighborhoods: ${neighborhoods.size}`);
  console.log(`\nOutput directory: ${outputDir}`);
}
