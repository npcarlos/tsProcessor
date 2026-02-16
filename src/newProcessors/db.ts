import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

export async function main(args?: any) {
  // completar_generos_en_places();
  // unir_todos_los_artistas();
  unir_todos_los_artistas_nuevo();
}

function completar_generos_en_places() {
  const placesDir =
    "C:/Users/fnp/Documents/Artist Hive/Data Octubre 2025/places_3/processed";
  const placesGenresRaw = leerArchivo(`${placesDir}/places_full_genres.json`);

  // Transform to Record<string, string[]> with genres_l1.keys
  const placesGenres: Record<string, any> = Object.entries(
    placesGenresRaw,
  ).reduce(
    (acc, [key, value]: [string, any]) => {
      acc[key] = {
        l1: [...(value.genres_l1?.keys || [])],
        l2: [...(value.genres_l2?.keys || [])],
      };
      return acc;
    },
    {} as Record<string, any>,
  );

  const placesStatsFile = leerArchivo(`${placesDir}/stats.json`);

  // Transform stats array to Record<string, number> with year from maxCreatedTimeDate
  const placesStats: Record<string, number> = placesStatsFile.reduce(
    (acc: Record<string, number>, item: any) => {
      const username = item.name;
      if (item.maxCreatedTimeDate) {
        const year = new Date(item.maxCreatedTimeDate).getFullYear();
        acc[username] = year;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const entity_directory = leerArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.entitydirectories.json`,
  );

  const places = entity_directory.filter(
    (entity: any) => entity.entityType === "Place",
  );

  places.forEach((place: any) => {
    const username = place.username;
    place.genres = {
      music: placesGenres[username] || { l1: [], l2: [] },
    };

    const ultimoAno = placesStats[username] || 1900;
    if (ultimoAno === 2025) {
      place.activity = "active";
    } else if (ultimoAno === 2024) {
      place.activity = "probably_active";
    } else {
      place.activity = "non_active";
    }
  });

  crearArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.entitydirectories_nuevo.json`,
    entity_directory,
  );

  const placesDB = leerArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.places.json`,
  );

  placesDB.forEach((place: any) => {
    const username = place.username;
    place.genres = {
      music: placesGenres[username] || { l1: [], l2: [] },
    };

    const ultimoAno = placesStats[username] || 1900;
    if (ultimoAno === 2025) {
      place.activity = "active";
    } else if (ultimoAno === 2024) {
      place.activity = "probably_active";
    } else {
      place.activity = "non_active";
    }
  });

  crearArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.places_nuevo.json`,
    placesDB,
  );
}

// Tipo simplificado de artista con solo identificadores
interface ArtistIdentifiers {
  num?: number;
  name?: string;
  spotify?: string;
  chartmetric?: number | string;
  tiktok?: string;
  discogs?: string;
  tunefind?: string;
  tidal?: string;
  musicbrainz?: string;
  anghami?: string;
  amazon?: string;
  deezer?: string;
  website?: string;
  jambase?: string;
  bandsintown?: string;
  youtubeforartist?: string;
  twitter?: string;
  youtube?: string;
  wikipedia?: string;
  songkick?: string;
  audiomack?: string;
  genius?: string;
  lastfm?: string;
  pandora?: string;
  facebook?: string;
  shazam?: string;
  itunes?: string;
  instagram?: string;
  boomplay?: string;
  soundcloud?: string;
  melon?: string;
  tvmaze?: string;
  snap?: string;
  line?: string;
  twitch?: string;
  gtrends?: string;
  weibo?: string;
  profile_pic?: string; // Imagen de perfil del artista
  source?: string; // Para saber de dónde viene el registro
  conflicts?: number; // Número de conflictos detectados
  conflictDetails?: string[]; // Detalles de los conflictos
}

// Sistema de múltiples índices
class MultiIndexArtistRegistry {
  private records: Map<string, ArtistIdentifiers> = new Map(); // Clave única generada
  private indexByNum: Map<number, string> = new Map();
  private indexBySpotify: Map<string, string> = new Map();
  private indexByChartmetric: Map<string, string> = new Map();
  private indexByName: Map<string, string> = new Map();
  private indexByInstagram: Map<string, string> = new Map();
  private indexByYoutube: Map<string, string> = new Map();
  private indexByFacebook: Map<string, string> = new Map();
  private indexBySoundcloud: Map<string, string> = new Map();
  private indexByProfilePic: Map<string, string> = new Map(); // Índice por imagen de perfil
  private nextNum: number = 325025; // Empezar desde el siguiente número después del máximo de BD

  private generateKey(): string {
    return `artist_${this.records.size + 1}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  }

  private normalizeString(str: string | undefined | null): string {
    if (!str) return "";
    return str.toLowerCase().trim();
  }

  private cleanSpotifyId(id: string | undefined | null): string | undefined {
    if (!id) return undefined;
    // Si es una URL, extraer el ID
    if (id.includes("spotify.com")) {
      const match = id.match(/artist\/([a-zA-Z0-9]+)/);
      return match ? match[1] : id;
    }
    return id.trim();
  }

  private cleanChartmetricId(
    id: number | string | undefined | null,
  ): string | undefined {
    if (!id) return undefined;
    if (typeof id === "number") return id.toString();
    if (typeof id === "string") {
      // Si es una URL, extraer el ID
      if (id.includes("chartmetric.com")) {
        const match = id.match(/artist\/(\d+)/);
        return match ? match[1] : id;
      }
      return id.trim();
    }
    return undefined;
  }

  private cleanSocialHandle(
    handle: string | undefined | null,
    _platform: string,
  ): string | undefined {
    if (!handle) return undefined;
    let cleaned = handle.trim();

    // Limpiar URLs de redes sociales
    if (cleaned.includes("instagram.com")) {
      const match = cleaned.match(/instagram\.com\/([^/?]+)/);
      cleaned = match ? match[1] : cleaned;
    } else if (cleaned.includes("facebook.com")) {
      const match = cleaned.match(/facebook\.com\/([^/?]+)/);
      cleaned = match ? match[1] : cleaned;
    } else if (cleaned.includes("youtube.com")) {
      const match = cleaned.match(/youtube\.com\/@?([^/?]+)/);
      cleaned = match ? match[1] : cleaned;
    } else if (cleaned.includes("soundcloud.com")) {
      const match = cleaned.match(/soundcloud\.com\/([^/?]+)/);
      cleaned = match ? match[1] : cleaned;
    }

    return cleaned;
  }

  // Buscar un artista por cualquier identificador
  findByIdentifier(field: keyof ArtistIdentifiers, value: any): string | null {
    if (!value) return null;

    switch (field) {
      case "num":
        return this.indexByNum.get(value) || null;
      case "spotify":
        const spotifyId = this.cleanSpotifyId(value);
        return spotifyId ? this.indexBySpotify.get(spotifyId) || null : null;
      case "chartmetric":
        const chartmetricId = this.cleanChartmetricId(value);
        return chartmetricId
          ? this.indexByChartmetric.get(chartmetricId) || null
          : null;
      case "name":
        return this.indexByName.get(this.normalizeString(value)) || null;
      case "instagram":
        const instagram = this.cleanSocialHandle(value, "instagram");
        return instagram
          ? this.indexByInstagram.get(this.normalizeString(instagram)) || null
          : null;
      case "youtube":
        const youtube = this.cleanSocialHandle(value, "youtube");
        return youtube
          ? this.indexByYoutube.get(this.normalizeString(youtube)) || null
          : null;
      case "facebook":
        const facebook = this.cleanSocialHandle(value, "facebook");
        return facebook
          ? this.indexByFacebook.get(this.normalizeString(facebook)) || null
          : null;
      case "soundcloud":
        const soundcloud = this.cleanSocialHandle(value, "soundcloud");
        return soundcloud
          ? this.indexBySoundcloud.get(this.normalizeString(soundcloud)) || null
          : null;
      case "profile_pic":
        // Buscar por URL de imagen
        return this.indexByProfilePic.get(value) || null;
      default:
        return null;
    }
  }

  // Buscar usando múltiples identificadores (prioridad: chartmetric > spotify > num > name > redes > profile_pic)
  findByMultipleIdentifiers(artist: any): string | null {
    const searchOrder: Array<keyof ArtistIdentifiers> = [
      "chartmetric",
      "spotify",
      "num",
      "name",
      "instagram",
      "youtube",
      "facebook",
      "soundcloud",
      "profile_pic", // Agregar búsqueda por imagen como último recurso
    ];

    for (const field of searchOrder) {
      const key = this.findByIdentifier(field, artist[field]);
      if (key) return key;
    }

    return null;
  }

  private updateIndex(
    index: Map<string, string>,
    value: string | undefined,
    key: string,
  ) {
    if (value && value.trim()) {
      index.set(value, key);
    }
  }

  private updateIndexNormalized(
    index: Map<string, string>,
    value: string | undefined,
    key: string,
  ) {
    if (value && value.trim()) {
      index.set(this.normalizeString(value), key);
    }
  }

  // Agregar o actualizar un artista
  addOrUpdate(artist: ArtistIdentifiers, priority: number = 0): string {
    // Buscar si ya existe
    const existingKey = this.findByMultipleIdentifiers(artist);

    if (existingKey) {
      // Ya existe, fusionar datos
      const existing = this.records.get(existingKey)!;
      const merged = this.mergeArtists(existing, artist, priority);
      this.records.set(existingKey, merged);
      this.rebuildIndexesForRecord(existingKey, merged);
      return existingKey;
    } else {
      // No existe, crear nuevo
      const key = this.generateKey();
      // Si no tiene num, asignar uno nuevo
      if (!artist.num) {
        artist.num = this.nextNum++;
      }
      this.records.set(key, artist);
      this.rebuildIndexesForRecord(key, artist);
      return key;
    }
  }

  private normalizeValue(value: any): string {
    if (!value) return "";
    return String(value).toLowerCase().trim();
  }

  private mergeArtists(
    existing: ArtistIdentifiers,
    incoming: ArtistIdentifiers,
    priority: number,
  ): ArtistIdentifiers {
    // Si priority es alto, los datos entrantes tienen prioridad
    // Priority: 4 = Drive, 3 = Chartmetric, 2 = Spotify, 1 = BD
    const merged = { ...existing };

    const fields: Array<keyof ArtistIdentifiers> = [
      "num",
      "name",
      "spotify",
      "chartmetric",
      "tiktok",
      "discogs",
      "tunefind",
      "tidal",
      "musicbrainz",
      "anghami",
      "amazon",
      "deezer",
      "website",
      "jambase",
      "bandsintown",
      "youtubeforartist",
      "twitter",
      "youtube",
      "wikipedia",
      "songkick",
      "audiomack",
      "genius",
      "lastfm",
      "pandora",
      "facebook",
      "shazam",
      "itunes",
      "instagram",
      "boomplay",
      "soundcloud",
      "melon",
      "tvmaze",
      "snap",
      "line",
      "twitch",
      "gtrends",
      "weibo",
      "profile_pic",
    ];

    // Inicializar arrays de conflictos si no existen
    if (!merged.conflicts) merged.conflicts = 0;
    if (!merged.conflictDetails) merged.conflictDetails = [];

    // Campos críticos que generan conflictos (excluir metadata como source, conflicts, etc.)
    const criticalFields: Array<keyof ArtistIdentifiers> = [
      "num",
      "name",
      "spotify",
      "chartmetric",
      "instagram",
      "youtube",
      "facebook",
      "twitter",
      "tiktok",
      "soundcloud",
    ];

    fields.forEach((field) => {
      const incomingValue = incoming[field];
      const existingValue = existing[field];

      // profile_pic es especial: siempre tomar de Spotify (prioridad 2) sin generar conflictos
      if (field === "profile_pic") {
        if (incomingValue && priority === 2) {
          // Si viene de Spotify, siempre usar su imagen
          (merged as any)[field] = incomingValue;
        } else if (incomingValue && !existingValue) {
          // Si no hay imagen previa, usar la que venga
          (merged as any)[field] = incomingValue;
        }
        // En cualquier otro caso, mantener la existente (de Spotify)
        return;
      }

      // Si el valor entrante está vacío, no hacer nada (no borrar datos existentes)
      if (!incomingValue) {
        return;
      }

      // Si no existe valor previo, agregarlo
      if (!existingValue) {
        (merged as any)[field] = incomingValue;
        return;
      }

      // Ambos valores existen, comparar
      const normalizedExisting = this.normalizeValue(existingValue);
      const normalizedIncoming = this.normalizeValue(incomingValue);

      if (normalizedExisting === normalizedIncoming) {
        // Son iguales, no hacer nada
        return;
      }

      // Son diferentes - solo reportar conflicto si es un campo crítico
      const isConflict = criticalFields.includes(field);

      if (isConflict) {
        // Solo incrementar si aún no se reportó este conflicto
        const conflictKey = `${field}: "${existingValue}" vs "${incomingValue}"`;
        if (!merged.conflictDetails!.includes(conflictKey)) {
          merged.conflicts!++;
          merged.conflictDetails!.push(conflictKey);
        }
      }

      // Si la prioridad es alta (Drive/Chartmetric), reemplazar
      if (priority >= 3) {
        (merged as any)[field] = incomingValue;
      } else if (!isConflict) {
        // Si no es campo crítico y la prioridad no es alta, agregar el dato si no está vacío
        (merged as any)[field] = incomingValue;
      }
      // Si no, mantener el valor existente
    });

    // Actualizar source con el más prioritario
    if (priority >= 3 || !existing.source) {
      merged.source = incoming.source;
    }

    return merged;
  }

  private rebuildIndexesForRecord(key: string, artist: ArtistIdentifiers) {
    // Actualizar todos los índices
    if (artist.num) {
      this.indexByNum.set(artist.num, key);
    }
    if (artist.spotify) {
      const spotifyId = this.cleanSpotifyId(artist.spotify);
      this.updateIndex(this.indexBySpotify, spotifyId, key);
    }
    if (artist.chartmetric) {
      const chartmetricId = this.cleanChartmetricId(artist.chartmetric);
      this.updateIndex(this.indexByChartmetric, chartmetricId, key);
    }
    if (artist.name) {
      this.updateIndexNormalized(this.indexByName, artist.name, key);
    }
    if (artist.instagram) {
      const instagram = this.cleanSocialHandle(artist.instagram, "instagram");
      this.updateIndexNormalized(this.indexByInstagram, instagram, key);
    }
    if (artist.youtube) {
      const youtube = this.cleanSocialHandle(artist.youtube, "youtube");
      this.updateIndexNormalized(this.indexByYoutube, youtube, key);
    }
    if (artist.facebook) {
      const facebook = this.cleanSocialHandle(artist.facebook, "facebook");
      this.updateIndexNormalized(this.indexByFacebook, facebook, key);
    }
    if (artist.soundcloud) {
      const soundcloud = this.cleanSocialHandle(
        artist.soundcloud,
        "soundcloud",
      );
      this.updateIndexNormalized(this.indexBySoundcloud, soundcloud, key);
    }
    if (artist.profile_pic) {
      // Indexar por URL de imagen de perfil
      this.indexByProfilePic.set(artist.profile_pic, key);
    }
  }

  getAllRecords(): ArtistIdentifiers[] {
    return Array.from(this.records.values());
  }

  getStats() {
    return {
      totalRecords: this.records.size,
      indexedByNum: this.indexByNum.size,
      indexedBySpotify: this.indexBySpotify.size,
      indexedByChartmetric: this.indexByChartmetric.size,
      indexedByName: this.indexByName.size,
      indexedByInstagram: this.indexByInstagram.size,
      indexedByYoutube: this.indexByYoutube.size,
      indexedByFacebook: this.indexByFacebook.size,
      indexedBySoundcloud: this.indexBySoundcloud.size,
      indexedByProfilePic: this.indexByProfilePic.size,
      nextNumToAssign: this.nextNum,
    };
  }
}

function unir_todos_los_artistas() {
  console.log("Unificando ids de artistas....");
  const artists_drive_json = leerArchivo(
    `./data/drive/2025/10-31/Nuevos Artistas - Bandas.json`,
  );

  const artists_old_db = leerArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.artists.json`,
  );

  const chartmetric_artists = Object.values(
    leerArchivo(`./data/scrapped/chartmetric/bands_sn.json`),
  );

  const spotify_artists = Object.values(
    leerArchivo(`./data/scrapped/spotify/bands/artist_bio.extract.json`),
  );

  console.log("Total Artists Old BD: ", artists_old_db.length);
  console.log("Total Artists Drive JSON: ", artists_drive_json.length);
  console.log("Total Chartmetric Artists: ", chartmetric_artists.length);
  console.log("Total Spotify Artists: ", spotify_artists.length);

  const registry = new MultiIndexArtistRegistry();

  // 1. Filtrar BD: solo conservar registros con num entre 1-1939 o 100001-113032
  console.log("\n[1/4] Procesando BD (filtrado por num)...");
  const filteredBD = artists_old_db.filter((artist: any) => {
    const num = artist.num;
    return (num >= 1 && num <= 1939) || (num >= 100001 && num <= 113032);
  });
  console.log(
    `  - Registros filtrados de BD: ${filteredBD.length} de ${artists_old_db.length}`,
  );

  filteredBD.forEach((artist: any, index: number) => {
    registry.addOrUpdate(
      {
        num: artist.num,
        name: artist.name,
        spotify: artist.spotify,
        chartmetric: artist.chartmetric,
        tiktok: artist.tiktok,
        discogs: artist.discogs,
        tunefind: artist.tunefind,
        tidal: artist.tidal,
        musicbrainz: artist.musicbrainz,
        anghami: artist.anghami,
        amazon: artist.amazon,
        deezer: artist.deezer,
        website: artist.website,
        jambase: artist.jambase,
        bandsintown: artist.bandsintown,
        youtubeforartist: artist.youtubeforartist,
        twitter: artist.twitter,
        youtube: artist.youtube,
        wikipedia: artist.wikipedia,
        songkick: artist.songkick,
        audiomack: artist.audiomack,
        genius: artist.genius,
        lastfm: artist.lastfm,
        pandora: artist.pandora,
        facebook: artist.facebook,
        shazam: artist.shazam,
        itunes: artist.itunes,
        instagram: artist.instagram,
        boomplay: artist.boomplay,
        soundcloud: artist.soundcloud,
        melon: artist.melon,
        tvmaze: artist.tvmaze,
        snap: artist.snap,
        line: artist.line,
        twitch: artist.twitch,
        gtrends: artist.gtrends,
        weibo: artist.weibo,
        source: "BD",
      },
      1, // Prioridad baja
    );
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados ${index + 1} / ${filteredBD.length} registros de BD`,
      );
    }
  });
  console.log(
    `  - Completado: ${filteredBD.length} registros de BD procesados`,
  );

  // 2. Procesar Spotify
  console.log("\n[2/4] Procesando Spotify...");
  spotify_artists.forEach((artist: any, index: number) => {
    registry.addOrUpdate(
      {
        name: artist.name,
        spotify: artist.id,
        profile_pic: artist.img, // Imagen principal de Spotify
        source: "Spotify",
      },
      2, // Prioridad media
    );
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados ${index + 1} / ${
          spotify_artists.length
        } registros de Spotify`,
      );
    }
  });
  console.log(
    `  - Completado: ${spotify_artists.length} registros de Spotify procesados`,
  );

  // 3. Procesar Chartmetric
  console.log("\n[3/4] Procesando Chartmetric...");
  chartmetric_artists.forEach((artist: any, index: number) => {
    registry.addOrUpdate(
      {
        name: artist.name,
        chartmetric: artist.id,
        profile_pic: artist.image_url, // Imagen de Chartmetric
        source: "Chartmetric",
      },
      3, // Prioridad alta
    );
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados ${index + 1} / ${
          chartmetric_artists.length
        } registros de Chartmetric`,
      );
    }
  });
  console.log(
    `  - Completado: ${chartmetric_artists.length} registros de Chartmetric procesados`,
  );

  // 4. Procesar Drive (máxima prioridad)
  console.log("\n[4/4] Procesando Drive (máxima prioridad)...");
  artists_drive_json.forEach((artist: any, index: number) => {
    registry.addOrUpdate(
      {
        num: artist.num,
        name: artist.name,
        spotify:
          artist.spotify_user || artist.spotify_url_link || artist.spotify,
        chartmetric:
          artist.chartmetric_user ||
          artist.chartmetric_url ||
          artist.chartmetric,
        instagram:
          artist.instagram_user || artist.instagram_url || artist.instagram,
        youtube: artist.youtube,
        facebook: artist.facebook,
        twitter: artist.twitter,
        soundcloud: artist.soundcloud,
        tiktok: artist.tiktok,
        discogs: artist.discogs,
        tunefind: artist.tunefind,
        tidal: artist.tidal,
        musicbrainz: artist.musicbrainz,
        anghami: artist.anghami,
        amazon: artist.amazon,
        deezer: artist.deezer,
        website: artist.website,
        jambase: artist.jambase,
        bandsintown: artist.bandsintown,
        youtubeforartist: artist.youtubeforartist,
        wikipedia: artist.wikipedia,
        songkick: artist.songkick,
        audiomack: artist.audiomack,
        genius: artist.genius,
        lastfm: artist.lastfm,
        pandora: artist.pandora,
        shazam: artist.shazam,
        itunes: artist.itunes,
        boomplay: artist.boomplay,
        melon: artist.melon,
        tvmaze: artist.tvmaze,
        snap: artist.snap,
        line: artist.line,
        twitch: artist.twitch,
        gtrends: artist.gtrends,
        weibo: artist.weibo,
        source: "Drive",
      },
      4, // Prioridad máxima
    );
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados ${index + 1} / ${
          artists_drive_json.length
        } registros de Drive`,
      );
    }
  });
  console.log(
    `  - Completado: ${artists_drive_json.length} registros de Drive procesados`,
  );

  // Obtener estadísticas
  console.log("\n=== ESTADÍSTICAS FINALES ===");
  const stats = registry.getStats();
  console.log(`Total de artistas unificados: ${stats.totalRecords}`);
  console.log(`Próximo num a asignar: ${stats.nextNumToAssign}`);
  console.log(`Nuevos nums asignados: ${stats.nextNumToAssign - 325025}`);
  console.log(`\nÍndices creados:`);
  console.log(`  - Por num: ${stats.indexedByNum}`);
  console.log(`  - Por Spotify: ${stats.indexedBySpotify}`);
  console.log(`  - Por Chartmetric: ${stats.indexedByChartmetric}`);
  console.log(`  - Por nombre: ${stats.indexedByName}`);
  console.log(`  - Por Instagram: ${stats.indexedByInstagram}`);
  console.log(`  - Por YouTube: ${stats.indexedByYoutube}`);
  console.log(`  - Por Facebook: ${stats.indexedByFacebook}`);
  console.log(`  - Por SoundCloud: ${stats.indexedBySoundcloud}`);
  console.log(`  - Por Profile Pic: ${stats.indexedByProfilePic}`);

  // Guardar resultado
  const unifiedArtists = registry.getAllRecords();
  crearArchivo(
    `./data/drive/2025/10-31/artists_unified_identifiers.json`,
    unifiedArtists,
  );
  console.log(
    "\nArchivo guardado: ./data/drive/2025/10-31/artists_unified_identifiers.json",
  );

  // Crear análisis de fuentes
  const sourceAnalysis = unifiedArtists.reduce(
    (acc, artist) => {
      const source = artist.source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("\n=== ANÁLISIS POR FUENTE ===");
  Object.entries(sourceAnalysis).forEach(([source, count]) => {
    console.log(`  - ${source}: ${count}`);
  });

  // Generar archivo de conflictos
  const artistsWithConflicts = unifiedArtists
    .filter((artist) => artist.conflicts && artist.conflicts > 0)
    .sort((a, b) => (b.conflicts || 0) - (a.conflicts || 0)); // Ordenar de mayor a menor

  console.log(`\n=== CONFLICTOS DETECTADOS ===`);
  console.log(`Artistas con conflictos: ${artistsWithConflicts.length}`);

  if (artistsWithConflicts.length > 0) {
    crearArchivo(
      `./data/drive/2025/10-31/artists_conflicts.json`,
      artistsWithConflicts,
    );
    console.log(
      "\nArchivo de conflictos guardado: ./data/drive/2025/10-31/artists_conflicts.json",
    );

    // Mostrar top 10 con más conflictos
    console.log(`\nTop 10 artistas con más conflictos:`);
    artistsWithConflicts.slice(0, 10).forEach((artist, index) => {
      console.log(
        `  ${index + 1}. ${artist.name} (num: ${artist.num}) - ${
          artist.conflicts
        } conflictos`,
      );
    });
  }
}

/**
 * Extrae el usuario o identificador de una URL de red social
 * @param network - Nombre de la red social
 * @param url - URL completa de la red social
 * @returns Usuario/identificador extraído o null si no se puede extraer
 */
export function extractSocialUser(
  network: string,
  url: string | null,
): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const hostname = urlObj.hostname;

    switch (network.toLowerCase()) {
      // Amazon Music: https://music.amazon.com/artists/B000QKKNSI
      case "amazon":
        return (
          pathname.split("/artists/")[1]?.split("?")[0].split("/")[0] || null
        );

      // Anghami: https://anghami.com/artist/61781
      case "anghami":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // Audiomack: https://audiomack.com/plastilina-mosh
      case "audiomack":
        return pathname.replace(/^\//, "").split("/")[0] || null;

      // Bandsintown: https://bandsintown.com/a/14250
      case "bandsintown":
        return pathname.split("/a/")[1]?.split("?")[0] || null;

      // Boomplay: https://boomplay.com/artists/317689
      case "boomplay":
        return pathname.split("/artists/")[1]?.split("?")[0] || null;

      // Deezer: https://deezer.com/artist/10912
      case "deezer":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // Discogs: https://discogs.com/artist/12647-Plastilina-Mosh
      case "discogs":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // Facebook: https://facebook.com/plastilinamosh
      case "facebook":
        return pathname.replace(/^\//, "").split("/")[0] || null;

      // Genius: https://genius.com/artists/Plastilina-mosh
      case "genius":
        return pathname.split("/artists/")[1]?.split("?")[0] || null;

      // Google Trends: https://google.com/trends/explore#q=/m/0840vq
      case "gtrends":
        const hash = urlObj.hash.replace("#q=", "");
        return hash || null;

      // Instagram: https://instagram.com/plastilinamoshoficial?hl=en
      case "instagram":
        return pathname.replace(/^\//, "").split("/")[0].split("?")[0] || null;

      // iTunes/Apple Music: https://music.apple.com/artist/1791157950
      case "itunes":
      case "applemusic":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // Jambase: https://jambase.com/band/plastilina-mosh
      case "jambase":
        return pathname.split("/band/")[1]?.split("?")[0] || null;

      // Last.fm: https://last.fm/music/Plastilina+Mosh
      case "lastfm":
        return pathname.split("/music/")[1]?.split("?")[0] || null;

      // Line Music: https://music.line.me/webapp/artist/mi000000000014baeb
      case "line":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // Melon: https://www.melon.com/artist/timeline.htm?artistId=27305
      case "melon":
        const artistId = urlObj.searchParams.get("artistId");
        return artistId || null;

      // MusicBrainz: https://musicbrainz.org/artist/9ff60a50-6288-4b46-8b69-75877450d282
      case "musicbrainz":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // Pandora: https://pandora.com/artist/AR4pjnpxwdlrJ64
      case "pandora":
        return (
          pathname.split("/artist/")[1]?.split("?")[0].split("/")[0] || null
        );

      // Shazam: https://shazam.com/artist/x/14069499
      case "shazam":
        const parts = pathname.split("/");
        return parts[parts.length - 1] || null;

      // Snapchat: https://snapchat.com/add/itsayokay
      case "snap":
      case "snapchat":
        return pathname.split("/add/")[1]?.split("?")[0] || null;

      // Songkick: https://songkick.com/artists/465183
      case "songkick":
        return (
          pathname.split("/artists/")[1]?.split("?")[0].split("-")[0] || null
        );

      // SoundCloud: https://soundcloud.com/softgirlsandboysclub
      case "soundcloud":
        return pathname.replace(/^\//, "").split("/")[0] || null;

      // Spotify: https://open.spotify.com/artist/4PtVXWSOmF4Tox1jj6ctSq
      case "spotify":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // Tidal: https://tidal.com/browse/artist/56849
      case "tidal":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // TikTok: https://tiktok.com/@plastilinamoshoficial
      case "tiktok":
        return pathname.replace(/^\/@/, "").split("/")[0] || null;

      // Tunefind: https://tunefind.com/artist/plastilina-mosh
      case "tunefind":
        return pathname.split("/artist/")[1]?.split("?")[0] || null;

      // TVMaze: https://tvmaze.com/people/109377/alexander-oneal
      case "tvmaze":
        return pathname.split("/people/")[1]?.split("/")[0] || null;

      // Twitch: https://twitch.tv/24kgoldn
      case "twitch":
        return pathname.replace(/^\//, "").split("/")[0] || null;

      // Twitter: https://twitter.com/plastilinamosh
      case "twitter":
        return pathname.replace(/^\//, "").split("/")[0] || null;

      // Weibo: https://weibo.com/6375176220
      case "weibo":
        return pathname.replace(/^\//, "").split("/")[0].split("?")[0] || null;

      // Website genérico
      case "website":
        return hostname;

      // Wikipedia: https://en.wikipedia.org/wiki/Plastilina_Mosh
      case "wikipedia":
        return pathname.split("/wiki/")[1]?.split("?")[0] || null;

      // YouTube: https://youtube.com/channel/UC1u6siEwfbBsM0HUkyqwecg or https://youtube.com/@artist or https://youtube.com/user/herenciadetimbiqui
      case "youtube":
        if (pathname.includes("/channel/")) {
          return pathname.split("/channel/")[1]?.split("?")[0] || null;
        }
        if (pathname.includes("/user/")) {
          return pathname.split("/user/")[1]?.split("?")[0] || null;
        }
        if (pathname.includes("/@")) {
          return pathname.split("/@")[1]?.split("?")[0] || null;
        }
        return pathname.replace(/^\//, "").split("/")[0] || null;

      // YouTube for Artists: https://charts.youtube.com/artist/%2Fm%2F08tx43
      case "youtubeforartist":
        return (
          decodeURIComponent(
            pathname.split("/artist/")[1]?.split("?")[0] || "",
          ) || null
        );

      // Chartmetric u otros
      default:
        // Intento genérico: tomar la última parte del path sin query params
        const defaultPath = pathname
          .replace(/^\//, "")
          .replace(/\/$/, "")
          .split("?")[0];
        const segments = defaultPath.split("/");
        return segments[segments.length - 1] || null;
    }
  } catch (error) {
    console.log(`Error extracting user from ${network}: ${url}`, error);
    return null;
  }
}

function isEmpty(value: any) {
  return value === null || value === undefined || value === "";
}

/**
 * Configuración de una fuente de datos para unificar artistas
 */
interface DataSourceConfig {
  data: any[]; // Array de registros de la fuente
  nombre: "BD" | "Drive" | "Chartmetric" | "Spotify" | "LinkedTree";
  fieldMapping: Record<string, string>; // Mapeo de campos (campo_db -> campo_fuente)
  customFieldsAssignment?: (dbRow: any, sourceRow: any) => void; // Función para asignar campos personalizados
}

/**
 * Procesa y agrega registros de una fuente de datos a la base de datos unificada
 */
function procesarFuenteDatos(
  config: DataSourceConfig,
  newDB: Record<string, any>,
  indexes: Record<string, Map<string, any>>,
  indexesFields: string[],
  fields: Record<string, string[]>,
  maxIndex: { value: number },
): { nuevos: number; total: number; repetidos: number } {
  console.log(`\n\nSe agregan los registros de ${config.nombre}:`);

  let nuevos = 0;
  let total = 0;
  let repetidos = 0;

  config.data.forEach((row: any, index: number) => {
    // Log de progreso
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados (${Math.round(
          100 * ((index + 1) / config.data.length),
        )}%) ${index + 1} / ${config.data.length} registros de ${config.nombre}`,
      );
    }

    total++;

    // Función helper para obtener el valor mapeado
    const getMappedValue = (fieldName: string, extractUrl: boolean = false) => {
      const mapped = config.fieldMapping[fieldName] ?? fieldName;
      const rawValue = row[mapped] ?? row[fieldName] ?? null;

      if (!extractUrl) return rawValue;

      const value =
        !!rawValue &&
        typeof rawValue === "string" &&
        rawValue?.startsWith("https://")
          ? extractSocialUser(fieldName, rawValue)
          : rawValue;
      return value;
    };

    // Se busca si el elemento está indexado (existe previamente)
    const snInRow = indexesFields.filter((sn) => {
      const value = getMappedValue(sn, true);
      return !!value && indexes[sn].get(value);
    });

    // Si encuentra uno, existía previamente
    if (snInRow.length > 0) {
      // Obtener el índice en la BD
      const dbIndex = snInRow.map((sn: any) => {
        const value = getMappedValue(sn, true);
        return indexes[sn].get(value);
      })[0];

      if (!dbIndex || !newDB[dbIndex]) {
        console.log(
          "ERROR al encontrar registro:",
          row.name,
          "dbIndex:",
          dbIndex,
          "snInRow:",
          snInRow,
        );
      } else {
        // Actualización de los campos estándar
        Object.keys(fields)
          .filter((field) => !["num", "name"].includes(field))
          .forEach((sn) => {
            const value = getMappedValue(sn, true);
            newDB[dbIndex][sn] = isEmpty(newDB[dbIndex][sn])
              ? value
              : newDB[dbIndex][sn];
          });

        // Actualización de campos personalizados
        if (config.customFieldsAssignment) {
          config.customFieldsAssignment(newDB[dbIndex], row);
        }
      }
      repetidos++;
    } else {
      // Es un registro nuevo
      nuevos++;

      // Crear nuevo registro con los campos estándar
      const newRecord: any = {};
      Object.keys(fields).forEach((sn) => {
        const value = getMappedValue(sn, true);
        if (value !== null && value !== undefined) {
          newRecord[sn] = value;
        }
      });

      // Asignar num si no existe
      if (!newRecord.num) {
        newRecord.num = maxIndex.value;
        maxIndex.value++;
      } else {
        maxIndex.value = Math.max(maxIndex.value, newRecord.num + 1);
      }

      // Aplicar campos personalizados
      if (config.customFieldsAssignment) {
        config.customFieldsAssignment(newRecord, row);
      }

      // Agregar a la BD
      newDB[newRecord.num] = newRecord;

      // Actualizar índices
      indexesFields.forEach((field) => {
        const value = newRecord[field];
        if (!!value && value != null && value !== undefined) {
          indexes[field].set(value, newRecord.num);
        }
      });
    }
  });

  console.log("[After] Total Artists: ", Object.keys(newDB).length);
  console.log("Nuevos...", nuevos, "- Total", total, "| Repetidos", repetidos);

  // Se muestran los índices después de cada paso del proceso
  console.log("\nÍndices actualizados:");
  Object.entries(indexes).forEach(([field, map]) => {
    console.log(field, map.size);
  });

  return { nuevos, total, repetidos };
}

function unir_todos_los_artistas_nuevo() {
  const fields = {
    num: ["drive"],
    name: [],
    spotify: ["drive", "cm"],
    chartmetric: ["drive", "cm"],
    tiktok: ["drive", "cm"],
    discogs: ["cm"],
    tunefind: ["cm"],
    tidal: ["cm"],
    musicbrainz: ["cm"],
    anghami: ["cm"],
    amazon: ["cm"],
    deezer: ["cm"],
    website: ["cm"],
    jambase: ["cm"],
    bandsintown: ["cm"],
    youtubeforartist: ["cm"],
    twitter: ["drive", "cm"],
    youtube: ["cm"],
    wikipedia: ["cm"],
    songkick: ["cm"],
    audiomack: ["cm"],
    genius: ["cm"],
    lastfm: ["cm"],
    pandora: ["cm"],
    facebook: ["drive", "cm"],
    shazam: ["cm"],
    itunes: ["cm"],
    instagram: ["drive", "cm"],
    boomplay: ["cm"],
    soundcloud: ["cm"],
    melon: ["cm"],
    tvmaze: ["cm"],
    snap: ["cm"],
    line: ["cm"],
    twitch: ["cm"],
    gtrends: ["cm"],
    weibo: ["cm"],
    profile_pic: ["spotify", "cm", "db"],
  };

  // ========================================================================
  // Lectura de archivos
  console.log("Unificando ids de artistas....");
  console.log("\nLeyendo archivos...");

  let artists_drive_json = leerArchivo(
    `./data/drive/2025/10-31/Nuevos Artistas - Bandas.json`,
  );

  let artists_old_db = leerArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.artists.json`,
  );

  let chartmetric_artists = Object.values(
    leerArchivo(`./data/scrapped/chartmetric/bands_sn.json`),
  );

  let spotify_artists = Object.values(
    leerArchivo(`./data/scrapped/spotify/bands/artist_bio.extract.json`),
  );

  let linkedtree_artists = Object.values(
    leerArchivo(`./data/drive/2025/10-31/linkedTree2.json`),
  );

  console.log("Total Artists Old BD: ", artists_old_db.length);
  console.log("Total Artists Drive JSON: ", artists_drive_json.length);
  console.log("Total Chartmetric Artists: ", chartmetric_artists.length);
  console.log("Total Spotify Artists: ", spotify_artists.length);
  console.log("Total LinkedTree Artists: ", linkedtree_artists.length);

  // ========================================================================
  // Paso 0. Se eliminan de la base de datos los que ya no existen

  const existingNums = artists_drive_json
    .map((row: any) => row.num)
    .filter((n: number) => !!n);

  artists_old_db = artists_old_db.filter((row: any) =>
    row.num < 2000 || (row.num > 10000 && row.num <= 113032)
      ? existingNums.includes(row.num)
      : true,
  );
  console.log("\n[Filtrado] Existing nums: ", existingNums.length);
  console.log("[Filtrado] Total Artists Old BD: ", artists_old_db.length);

  // ========================================================================
  // Paso 1. Inicializar la base de datos unificada

  const newDB: Record<string, any> = {};

  // Índices que permiten consolidar todas las bases de datos
  const indexesFields = [
    "num",
    "name",
    "bandsintown",
    "spotify",
    "chartmetric",
    "instagram",
    "youtube",
    "facebook",
    "twitter",
    "tiktok",
    "soundcloud",
    "profile_pic",
  ];

  const indexes: Record<string, Map<string, any>> = Object.fromEntries(
    indexesFields.map((field) => [field, new Map<string, any>()]),
  );

  // Cargar registros previos de la BD
  let maxIndex = { value: 0 };
  artists_old_db.forEach((row: any) => {
    newDB[row.num] = row;
    maxIndex.value = Math.max(maxIndex.value, row.num);
    indexesFields.forEach((field) => {
      const value = row[field];
      if (!!value && value != null && value !== undefined) {
        indexes[field].set(value, row.num);
      }
    });
  });
  maxIndex.value++;
  console.log('\nNext "num": ', maxIndex.value);

  console.log("\nÍndices iniciales:");
  Object.entries(indexes).forEach(([field, map]) => {
    console.log(field, map.size);
  });

  // ========================================================================
  // Paso 2. Configurar las fuentes de datos

  const dataSources: DataSourceConfig[] = [
    // Drive
    {
      data: artists_drive_json,
      nombre: "Drive",
      fieldMapping: {
        spotify: "spotify_user",
        chartmetric: "chartmetric_user",
        instagram: "instagram_user",
      },
      customFieldsAssignment: (dbRow, sourceRow) => {
        dbRow.username = dbRow.instagram;
        dbRow.MCC = isEmpty(dbRow.MCC) ? sourceRow.MCC : dbRow.MCC;
      },
    },
    // Chartmetric
    {
      data: chartmetric_artists,
      nombre: "Chartmetric",
      fieldMapping: {
        chartmetric: "id",
        profile_pic: "image_url",
      },
    },
    // Spotify
    {
      data: spotify_artists,
      nombre: "Spotify",
      fieldMapping: {
        spotify: "id",
        // profile_pic: "img",
      },
    },
    // LinkedTree
    {
      data: linkedtree_artists,
      nombre: "LinkedTree",
      fieldMapping: {
        instagram: "username",
        spotify: "spotify",
        name: "name",
      },
    },
  ];

  // ========================================================================
  // Paso 3. Procesar cada fuente de datos

  dataSources.forEach((source) => {
    procesarFuenteDatos(
      source,
      newDB,
      indexes,
      indexesFields,
      fields,
      maxIndex,
    );
  });

  // ========================================================================
  // Resultados finales

  console.log("\n========================================");
  console.log("RESUMEN FINAL");
  console.log("========================================");
  console.log("Total de artistas unificados:", Object.keys(newDB).length);
  console.log("Próximo num disponible:", maxIndex.value);
  console.log(
    "MAX num anterior:",
    Math.max(
      ...artists_old_db.map((a: any) => a.num).filter((a: any) => a < 100001),
    ),
  );
  console.log("creando archivo");
  crearArchivo(
    "./data/drive/2025/10-31/bd/db.txt",
    Object.values(newDB).map(
      (row: any) =>
        `${row.num}	${row.spotify || ""}	${row.chartmetric || ""}	${row.name || ""}	`,
    ),
  );
}

function unir_todos_los_artistas_nuevo_dos() {
  const fields = {
    num: ["drive"],
    name: [],
    spotify: ["drive", "cm"],
    chartmetric: ["drive", "cm"],
    tiktok: ["drive", "cm"],
    discogs: ["cm"],
    tunefind: ["cm"],
    tidal: ["cm"],
    musicbrainz: ["cm"],
    anghami: ["cm"],
    amazon: ["cm"],
    deezer: ["cm"],
    website: ["cm"],
    jambase: ["cm"],
    bandsintown: ["cm"],
    youtubeforartist: ["cm"],
    twitter: ["drive", "cm"],
    youtube: ["cm"],
    wikipedia: ["cm"],
    songkick: ["cm"],
    audiomack: ["cm"],
    genius: ["cm"],
    lastfm: ["cm"],
    pandora: ["cm"],
    facebook: ["drive", "cm"],
    shazam: ["cm"],
    itunes: ["cm"],
    instagram: ["drive", "cm"],
    boomplay: ["cm"],
    soundcloud: ["cm"],
    melon: ["cm"],
    tvmaze: ["cm"],
    snap: ["cm"],
    line: ["cm"],
    twitch: ["cm"],
    gtrends: ["cm"],
    weibo: ["cm"],
    profile_pic: ["spotify", "cm", "db"],
  };

  // Lectura de archivos ==================================================

  console.log("Unificando ids de artistas....");
  console.log("Leyendo archivos");
  let artists_drive_json = leerArchivo(
    `./data/drive/2025/10-31/Nuevos Artistas - Bandas.json`,
  );

  let artists_old_db = leerArchivo(
    `./data/drive/2025/10-31/bd/artist_hive.artists.json`,
  );

  let chartmetric_artists = Object.values(
    leerArchivo(`./data/scrapped/chartmetric/bands_sn.json`),
  );

  let spotify_artists = Object.values(
    leerArchivo(`./data/scrapped/spotify/bands/artist_bio.extract.json`),
  );

  console.log("Total Artists Old BD: ", artists_old_db.length);
  console.log("Total Artists Drive JSON: ", artists_drive_json.length);
  console.log("Total Chartmetric Artists: ", chartmetric_artists.length);
  console.log("Total Spotify Artists: ", spotify_artists.length);

  // ========================================================================
  // Paso 0. Se eliminan de la base de datos los que ya no existen

  const existingNums = artists_drive_json
    .map((row: any) => row.num)
    .filter((n: number) => !!n);

  artists_old_db = artists_old_db.filter((row: any) =>
    row.num < 2000 || (row.num > 10000 && row.num <= 113032)
      ? existingNums.includes(row.num)
      : true,
  );
  console.log("[NEW] Existing: ", existingNums.length);
  console.log("[NEW] Total Artists Old BD: ", artists_old_db.length);

  // ========================================================
  // Paso 1 Inicia la unificación en una nueva base de datos

  const newDB: Record<string, any> = {};

  // Índices que permiten consolidar todas las bases de datos
  const indexesFields = [
    "num",
    "name",
    "bandsintown",
    "spotify",
    "chartmetric",
    "instagram",
    "youtube",
    "facebook",
    "twitter",
    "tiktok",
    "soundcloud",
    "profile_pic",
  ];

  const indexes: Record<string, Map<string, any>> = Object.fromEntries(
    indexesFields.map((field) => [field, new Map<string, any>()]),
  );

  // ========================================================
  // Paso 2.A - Se agregan los registros previos en la base de datos
  // Paso 2.B - Se calcula el atributo "num" para nuevos registros
  let maxIndex = 0;
  artists_old_db.forEach((row: any) => {
    newDB[row.num] = row;
    maxIndex = Math.max(maxIndex, row.num);
    indexesFields.forEach((field) => {
      const value = row[field];
      if (!!value && value != null && value !== undefined) {
        indexes[field].set(value, row.num);
      }
    });
  });
  maxIndex++;
  console.log('\n\nNext "num": ', maxIndex);

  // Se muestran los índices después de cada paso del proceso
  console.log("\n\nÍndices iniciales:");
  Object.entries(indexes).forEach(([field, map]) => {
    console.log(field, map.size);
  });

  // ===============================================================
  // Paso 2. Se agregan y actualizan los registros del Drive
  console.log("\n\nSe agregan los nuevos en el drive:");

  // Se define el mapping de atributos del drive a la Base de datos
  const driveFieldMapping: Record<string, string> = {
    spotify: "spotify_user",
    chartmetric: "chartmetric_user",
    instagram: "instagram_user",
  };

  let nuevos = 0;
  let total = 0;
  let repetidos = 0;

  artists_drive_json.forEach((row: any, index: number) => {
    // Log de progreso
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados (${Math.round(
          100 * ((index + 1) / artists_drive_json.length),
        )}%) ${index + 1} / ${artists_drive_json.length} registros de Drive`,
      );
    }

    total++;

    // Se busca si el elemento está indexado (existe previamente)
    const snInRow = indexesFields.filter((sn) => {
      const mapped = driveFieldMapping[sn] ?? sn;
      const value = row[mapped] ?? row[sn] ?? null;
      return !!value && indexes[sn].get(value);
    });

    // Si encuentra uno, existía previamente
    if (snInRow.length > 0) {
      const dbIndex = [
        ...snInRow.map((sn: any) => {
          const mapped = driveFieldMapping[sn] ?? sn;
          const value = row[mapped] ?? row[sn] ?? null;
          return indexes[sn].get(value);
        }),
      ][0];

      // Actualización de los campos
      Object.keys(fields).forEach((sn) => {
        const mapped = driveFieldMapping[sn] ?? sn;
        const rawValue = row[mapped] ?? row[sn] ?? null;
        const value =
          !!rawValue &&
          typeof rawValue === "string" &&
          rawValue?.startsWith("https://")
            ? extractSocialUser(sn, rawValue)
            : rawValue;

        newDB[dbIndex][sn] = isEmpty(newDB[dbIndex][sn])
          ? value
          : newDB[dbIndex][sn];
      });

      // Se agregan otros parámetros que no son estándan o 1 a 1
      newDB[dbIndex].username = newDB[dbIndex].instagram;

      newDB[dbIndex].MCC = isEmpty(newDB[dbIndex].MCC)
        ? row.MCC
        : newDB[dbIndex].MCC;
    } else {
      // Es un registro nuevo
      nuevos++;
      newDB[row.num] = row;
      maxIndex = Math.max(maxIndex, row.num);
      indexesFields.forEach((field) => {
        const value = row[field];
        if (!!value && value != null && value !== undefined) {
          indexes[field].set(value, row.num);
        }
      });
    }
  });

  console.log("[After] Total Artists Old BD: ", Object.keys(newDB).length);
  console.log("Nuevos... ", nuevos, " - ", total, " | ", repetidos);

  // Se muestran los índices después de cada paso del proceso
  console.log("\n\nÍndices iniciales:");
  Object.entries(indexes).forEach(([field, map]) => {
    console.log(field, map.size);
  });

  // ===============================================================
  // Paso 3. Se agregan y actualizan los registros de Chartmetric
  console.log("\n\nSe agregan los nuevos de Chartmetric:");

  // Se define el mapping de atributos de Chartmetric a la Base de datos
  const chartmetricFieldMapping: Record<string, string> = {
    chartmetric: "id",
    profile_pic: "image_url",
  };

  nuevos = 0;
  total = 0;
  repetidos = 0;

  chartmetric_artists.forEach((row: any, index: number) => {
    // Log de progreso
    if ((index + 1) % 5000 === 0) {
      console.log(
        `  - Procesados (${Math.round(
          100 * ((index + 1) / chartmetric_artists.length),
        )}%) ${index + 1} / ${
          chartmetric_artists.length
        } registros de Chartmetric`,
      );
    }
    total++;

    // Se busca si el elemento está indexado (existe previamente)
    const snInRow = indexesFields.filter((sn) => {
      const mapped = chartmetricFieldMapping[sn] ?? sn;
      const rawValue = row[mapped] ?? row[sn] ?? null;
      const value =
        !!rawValue &&
        typeof rawValue === "string" &&
        rawValue?.startsWith("https://")
          ? extractSocialUser(sn, rawValue)
          : rawValue;
      return !!value && indexes[sn].get(value);
    });

    // Si encuentra uno, existía previamente
    if (snInRow.length > 0) {
      // Actualización de los campos
      const dbIndex_sub = [
        ...snInRow.map((sn: any) => {
          const mapped = chartmetricFieldMapping[sn] ?? sn;
          const rawValue = row[mapped] ?? row[sn] ?? null;
          const value =
            !!rawValue &&
            typeof rawValue === "string" &&
            rawValue?.startsWith("https://")
              ? extractSocialUser(sn, rawValue)
              : rawValue;
          return indexes[sn].get(value);
        }),
      ];

      const dbIndex = Array.isArray(dbIndex_sub) ? dbIndex_sub[0] : dbIndex_sub;

      if (!dbIndex || !newDB[dbIndex]) {
        console.log(
          "ERRROR    ",
          row.name,
          dbIndex,
          newDB[dbIndex],
          snInRow,
          dbIndex_sub,
        );
      } else {
        // Actualización de los campos
        Object.keys(fields)
          .filter((field) => !["num", "name"].includes(field))
          .forEach((sn) => {
            const mapped = chartmetricFieldMapping[sn] ?? sn;
            const rawValue = row[mapped] ?? row[sn] ?? null;
            const value =
              !!rawValue &&
              typeof rawValue === "string" &&
              rawValue?.startsWith("https://")
                ? extractSocialUser(sn, rawValue)
                : rawValue;

            newDB[dbIndex][sn] = isEmpty(newDB[dbIndex][sn])
              ? value
              : newDB[dbIndex][sn];
          });
        // Se agregan otros parámetros que no son estándan o 1 a 1
      }
      repetidos++;
    } else {
      // Es un registro nuevo
      nuevos++;
      row.num = maxIndex;
      newDB[maxIndex] = row;
      maxIndex++;
      indexesFields.forEach((field) => {
        const value = row[field];
        if (!!value && value != null && value !== undefined) {
          indexes[field].set(value, row.num);
        }
      });
    }
  });

  console.log("[After] Total Artists Old BD: ", Object.keys(newDB).length);
  console.log(
    "Nuevos... ",
    nuevos,
    " - Total",
    total,
    " | Repetidos",
    repetidos,
  );

  // Se muestran los índices después de cada paso del proceso
  console.log("\n\nÍndices iniciales:");
  Object.entries(indexes).forEach(([field, map]) => {
    console.log(field, map.size);
  });

  // crearArchivo(
  //   `./data/drive/2025/10-31/artists_no_names.json`,
  //   Object.values(newDB)
  //     .filter((v) => !!v.instagram && !v.name && !v.spotify && !v.chartmetric)
  //     .map((v) => v.instagram)
  // );

  console.log(
    "MAX ",
    Math.max(
      ...artists_old_db.map((a: any) => a.num).filter((a: any) => a < 100001),
    ),
    // Math.max(...artists_old_db.map((a: any) => a.num))
    // newDB[10]
  );

  // console.log(maxIndex);
}
