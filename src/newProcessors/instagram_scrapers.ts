import * as fs from "fs";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

const PROFILES_DIR_PATH =
  "C:/Users/fnp/Documents/Artist Hive/Data Octubre 2025/places_3";

export async function main(args?: any) {
  //   joinTimeLineOfUser(
  //     "C:/Users/fnp/Documents/Artist Hive/Data Octubre 2025/places_1/timeline"
  //     // ,"_elestruendobar"
  //   );
  //   generateMetaData(
  //     "C:/Users/fnp/Documents/Artist Hive/Data Octubre 2025/places_1/timeline/joined",
  //     "fabricadeartecubano"
  //   );
  // extract_tags_in_timeline_with_frequency();
  // simplify_tags_per_username();
  // generate_genres_from_tags_in_timeline();
  //   consolidar_menciones_globales();
  //   consolidar_menciones_absolutas();
  //
  // create_artists_related_genres();

  unify_timeline(
    [
      "C:/Users/fnp/Documents/Artist Hive/Data/places_timeline",
      "C:/Users/fnp/Documents/Artist Hive/Data/tm",
      "C:/Users/fnp/Documents/Artist Hive/Data/timeline",
      "C:/Users/fnp/Documents/Artist Hive/Data/timeline_2",
      "C:/Users/fnp/Documents/Artist Hive/Data/timeline_last",
      "C:/Users/fnp/Documents/Artist Hive/Data/timeline_old",
      "C:/Users/fnp/Documents/Artist Hive/Data/timeline_b",
    ],
    "C:/Users/fnp/Documents/Artist Hive/Data/complete"
  );
}

export function unify_timeline(input_dirs: string[], output_dir: string) {
  console.log("🚀 Iniciando unificación de timelines");
  console.log(`📁 Directorios de entrada: ${input_dirs.length}`);
  console.log(`📁 Directorio de salida: ${output_dir}`);

  // Crear directorio de salida si no existe
  if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir, { recursive: true });
  }

  // Mapa para almacenar: filename -> { path: string, mtime: number, dirIndex: number }
  const fileRegistry = new Map<
    string,
    { path: string; mtime: number; dirIndex: number }
  >();

  let totalFilesScanned = 0;

  // Fase 1: Escanear todos los directorios y registrar archivos
  console.log("\n📊 Fase 1: Escaneando directorios...");

  input_dirs.forEach((dir, dirIndex) => {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Directorio no existe: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);
    const totalFiles = files.length;

    console.log(`\n📂 [${dirIndex + 1}/${input_dirs.length}] ${dir}`);
    console.log(`   Total archivos: ${totalFiles.toLocaleString()}`);

    files.forEach((filename, fileIndex) => {
      const filePath = `${dir}/${filename}`;

      // Mostrar progreso cada 5%
      const progress = ((fileIndex + 1) / totalFiles) * 100;
      if (
        fileIndex % Math.ceil(totalFiles / 20) === 0 ||
        fileIndex === totalFiles - 1
      ) {
        process.stdout.write(
          `\r   Progreso: ${progress.toFixed(1)}% (${(
            fileIndex + 1
          ).toLocaleString()}/${totalFiles.toLocaleString()})`
        );
      }

      try {
        const stats = fs.statSync(filePath);

        // Solo procesar archivos JSON
        if (!filename.endsWith(".json") || !stats.isFile()) {
          return;
        }

        totalFilesScanned++;
        const mtime = stats.mtimeMs;

        // Si el archivo no existe en el registro, agregarlo
        if (!fileRegistry.has(filename)) {
          fileRegistry.set(filename, { path: filePath, mtime, dirIndex });
        } else {
          // Si existe, conservar el más reciente
          const existing = fileRegistry.get(filename)!;
          if (mtime > existing.mtime) {
            fileRegistry.set(filename, { path: filePath, mtime, dirIndex });
          }
        }
      } catch (error) {
        console.error(`\n   ❌ Error procesando ${filename}:`, error);
      }
    });

    console.log(""); // Nueva línea después del progreso
  });

  console.log(`\n✅ Fase 1 completada`);
  console.log(
    `   Total archivos escaneados: ${totalFilesScanned.toLocaleString()}`
  );
  console.log(
    `   Total archivos únicos encontrados: ${fileRegistry.size.toLocaleString()}`
  );
  console.log(
    `   Duplicados detectados: ${(
      totalFilesScanned - fileRegistry.size
    ).toLocaleString()}`
  );

  // Fase 2: Mover solo los archivos más recientes al directorio de salida
  console.log(
    `\n📊 Fase 2: Moviendo archivos más recientes a ${output_dir}...`
  );

  const filesToMove = Array.from(fileRegistry.entries());
  const totalToMove = filesToMove.length;
  let movedCount = 0;
  let errorCount = 0;

  filesToMove.forEach(([filename, { path: sourcePath }], index) => {
    const destPath = `${output_dir}/${filename}`;

    // Mostrar progreso cada 5%
    const progress = ((index + 1) / totalToMove) * 100;
    if (
      index % Math.ceil(totalToMove / 20) === 0 ||
      index === totalToMove - 1
    ) {
      process.stdout.write(
        `\r   Progreso: ${progress.toFixed(1)}% (${(
          index + 1
        ).toLocaleString()}/${totalToMove.toLocaleString()}) | Movidos: ${movedCount.toLocaleString()} | Errores: ${errorCount}`
      );
    }

    try {
      fs.renameSync(sourcePath, destPath);
      movedCount++;
    } catch (error) {
      errorCount++;
      console.error(`\n   ❌ Error moviendo ${filename}:`, error);
    }
  });

  console.log(""); // Nueva línea después del progreso
  console.log(`\n✅ Fase 2 completada`);
  console.log(`   Archivos movidos: ${movedCount.toLocaleString()}`);
  console.log(`   Errores: ${errorCount}`);

  console.log(`\n✨ Unificación completada!`);
  console.log(`   📁 Directorio de salida: ${output_dir}`);
  console.log(`   📊 Total archivos únicos: ${movedCount.toLocaleString()}`);
  console.log(
    `   📊 Archivos viejos que permanecieron en origen: ${(
      totalFilesScanned - movedCount
    ).toLocaleString()}`
  );
}

export function joinTimeLineOfUser(dirPath: string, username?: string) {
  const filesInDir = fs.readdirSync(dirPath);
  const filesOfUsername = filesInDir.filter(
    (file: string) => !username || file.includes(`${username}_`)
  );

  const outputDir = `${dirPath}/joined`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let allPosts: any[] = [];
  let lastUser: string | null = null;
  filesOfUsername.forEach((filePath: string) => {
    try {
      const currentFileUsername = filePath.substring(
        0,
        filePath.lastIndexOf("_")
      );
      const isSameUser = lastUser === currentFileUsername;
      const posts = leerArchivo(`${dirPath}/${filePath}`);
      if (isSameUser) {
        allPosts = [...allPosts, ...posts];
      } else {
        if (!!lastUser) {
          crearArchivo(`${outputDir}/${lastUser}.json`, allPosts);
        }
        allPosts = [...posts];
        lastUser = currentFileUsername;
        console.log(" >   ", lastUser);
      }
    } catch (error) {
      console.log("ERROR ", filePath);
    }
  });
  crearArchivo(`${outputDir}/${lastUser}.json`, allPosts);

  console.log(filesOfUsername.length);
}

function generate_instagram_stats() {
  //   const timelinesPath =
  //     "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/ProyectoAppMusica/download/places/profiles";
  //   const posts = leerArchivo(`${timelinesPath}/processed/posts.json`);

  //   console.log(posts.length);
  // }

  // function generate_instagram_stats_raw() {
  const timelinesPath = PROFILES_DIR_PATH;

  const files = fs.readdirSync(`${timelinesPath}/timeline`);

  const timelineSummary: Record<string, any> = {};
  let lastUserId: string = "";
  let userIndex = 0;

  console.log("****   ", files.length);
  files.forEach((file: string, index: number) => {
    if (index % 500 === 0) {
      console.log("..... ", index, " - ", file);
    }
    try {
      const content = leerArchivo(`${timelinesPath}/timeline/${file}`);
      const match = file.match(/^(.*)_\d+\.json$/);
      const userId = match ? match[1] : null;

      if (userId) {
        if (!(userId in timelineSummary)) {
          timelineSummary[userId] = {};
        }
        if (lastUserId != userId) {
          lastUserId = userId;
          userIndex++;
          if (userIndex % 200 == 0) {
            console.log(lastUserId, content.length);
          }
        }

        timelineSummary[userId].totalDownloadedPosts =
          (timelineSummary[userId].totalDownloadedPosts || 0) + content.length;

        const posts: Array<{ taken_at: number; code: string }> = [];
        content.forEach((post: any) => {
          const postInfo = post.node || {};

          if (postInfo.taken_at) {
            posts.push({
              taken_at: postInfo.taken_at,
              code: postInfo.code || "",
            });
          }
        });
        timelineSummary[userId].posts = [
          ...(timelineSummary[userId].posts || []),
          ...posts,
        ].sort((a, b) => a.taken_at - b.taken_at);
      }
    } catch (error) {
      console.log(error);
    }
  });

  Object.keys(timelineSummary).forEach((key) => {
    timelineSummary[key].name = key;

    // Extract taken_at values for calculations
    const creationTimes = timelineSummary[key].posts.map(
      (p: any) => p.taken_at
    );

    // Calculate delta times with post codes
    const deltaCreatedTimeWithCodes = timelineSummary[key].posts
      .map((post: any, i: number, arr: any[]) => {
        const diff = post.taken_at - (arr[i - 1]?.taken_at || 0);
        return {
          delta: diff != post.taken_at ? diff : -post.taken_at,
          code: post.code,
          taken_at: post.taken_at,
        };
      })
      .filter((item: any) => item.delta >= -1000000000);

    timelineSummary[key].deltaCreatedTimeWithCodes = deltaCreatedTimeWithCodes;

    // Extract just the delta values for numeric calculations
    const deltaValues = deltaCreatedTimeWithCodes.map(
      (item: any) => item.delta
    );

    timelineSummary[key].minDeltaCreatedTime = Math.min(...deltaValues);
    timelineSummary[key].maxDeltaCreatedTime = Math.max(...deltaValues);
    timelineSummary[key].meanDeltaCreatedTime = mean(deltaValues);
    timelineSummary[key].medianDeltaCreatedTime = median(deltaValues);

    const human: string[] = [
      "minDeltaCreatedTime",
      "maxDeltaCreatedTime",
      "meanDeltaCreatedTime",
      "medianDeltaCreatedTime",
    ];

    human.forEach((attribute: string) => {
      timelineSummary[key][`${attribute}_H`] = forHumans(
        timelineSummary[key][attribute]
      );
    });

    timelineSummary[key].minCreatedTime = Math.min(...creationTimes);
    timelineSummary[key].maxCreatedTime = Math.max(...creationTimes);
    timelineSummary[key].minCreatedTimeDate = new Date(
      (timelineSummary[key].minCreatedTime || 0) * 1000
    );
    timelineSummary[key].maxCreatedTimeDate = new Date(
      (timelineSummary[key].maxCreatedTime || 0) * 1000
    );

    // Find codes for min and max created times
    const minPost = timelineSummary[key].posts.find(
      (p: any) => p.taken_at === timelineSummary[key].minCreatedTime
    );
    const maxPost = timelineSummary[key].posts.find(
      (p: any) => p.taken_at === timelineSummary[key].maxCreatedTime
    );
    timelineSummary[key].minCreatedTimeCode = minPost?.code || "";
    timelineSummary[key].maxCreatedTimeCode = maxPost?.code || "";
  });

  const copy = [
    "name",
    "totalDownloadedPosts",
    "minDeltaCreatedTime",
    "maxDeltaCreatedTime",
    "meanDeltaCreatedTime",
    "medianDeltaCreatedTime",
    "minDeltaCreatedTime_H",
    "maxDeltaCreatedTime_H",
    "meanDeltaCreatedTime_H",
    "medianDeltaCreatedTime_H",
    "minCreatedTime",
    "maxCreatedTime",
    "minCreatedTimeDate",
    "maxCreatedTimeDate",
    "minCreatedTimeCode",
    "maxCreatedTimeCode",
  ];

  const res = Object.values(timelineSummary)
    .map((data: any) =>
      copy.reduce((o: any, k: string) => ((o[k] = data[k]), o), {})
    )
    .sort(
      (a: any, b: any) => a.medianDeltaCreatedTime - b.medianDeltaCreatedTime
    );

  // console.log(res);
  crearArchivo(`${timelinesPath}/processed/stats.json`, res);
}

function mean(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}
function median(values: number[]): number {
  if (values.length === 0) {
    // throw new Error("Input array is empty");
    return -1;
  }

  // Sorting values, preventing original array
  // from being mutated.
  values = [...values].sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
}

function forHumans(seconds: number) {
  var levels = [
    [Math.floor(seconds / 31536000), "years"],
    [Math.floor((seconds % 31536000) / 86400), "days"],
    [Math.floor(((seconds % 31536000) % 86400) / 3600), "hours"],
    [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), "minutes"],
    [(((seconds % 31536000) % 86400) % 3600) % 60, "seconds"],
  ];

  var returntext = "";

  for (var i = 0, max = levels.length; i < max; i++) {
    if (levels[i][0] === 0) continue;
    const amount: number = <number>levels[i][0];
    const units: string = <string>levels[i][1];
    returntext +=
      " " +
      Math.ceil(amount) +
      " " +
      (levels[i][0] === 1
        ? units.substring(0, units.length - 1)
        : levels[i][1]);
  }
  return returntext.trim();
}

const extractTagsAndHashtags = (text: string) => {
  const userTagRegex = /@([\w\d._]+)/g;
  const hashtagRegex = /#([\w\dáéíóúÁÉÍÓÚñÑüÜ]+)/g;

  const tags_in_text: string[] = [];
  const hashtags: string[] = [];

  let match: RegExpExecArray | null;

  // Extraer menciones @usuario
  while ((match = userTagRegex.exec(text)) !== null) {
    tags_in_text.push(match[1]);
  }

  // Extraer hashtags #hashtag
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }

  return { tags_in_text, hashtags };
};

function extract_tags_in_timeline_with_frequency() {
  const timelinesPath = PROFILES_DIR_PATH;

  const files = fs.readdirSync(`${timelinesPath}/timeline`);
  files.sort(); // asegurar orden alfabético

  // ✅ Lista de usuarios a evaluar (vacía = todos)
  const targetUserIds: string[] = [
    // "monsieurperine",
    // "puertocandelaria",
    // "caribefunk",
  ]; // Ejemplo: ['01800.perreo', 'otro.usuario']
  const isFiltering = targetUserIds.length > 0;
  const targetSet = new Set(targetUserIds);
  const targetSorted = [...targetUserIds].sort();
  const foundUserIds = new Set<string>();

  const timelineSummary: Record<
    string,
    {
      hashtags: { hashtag: string; count: number }[];
      tags: { username: string; count: number }[];
    }
  > = {};

  const userTagAccumulator: Record<string, Record<string, number>> = {};
  const userHashtagAccumulator: Record<string, Record<string, number>> = {};

  let lastUserId: string = "";
  let userIndex = 0;

  console.log("📂 Total archivos encontrados:", files.length);

  for (const file of files) {
    const match = file.match(/^(.+?)_\d+\.json$/);
    const userId = match ? match[1] : null;
    if (!userId) continue;

    // ✅ Filtrado por userId (sin romper demasiado pronto)
    if (isFiltering && !targetSet.has(userId)) {
      const lastTarget = targetSorted[targetSorted.length - 1];
      if (userId > lastTarget) break;
      continue;
    }

    const content = leerArchivo(`${timelinesPath}/timeline/${file}`);
    if (!content) continue;

    foundUserIds.add(userId);

    if (!(userId in userTagAccumulator)) {
      userTagAccumulator[userId] = {};
    }
    if (!(userId in userHashtagAccumulator)) {
      userHashtagAccumulator[userId] = {};
    }

    if (lastUserId !== userId) {
      lastUserId = userId;
      userIndex++;
      if (userIndex % 200 === 0) {
        console.log(`🔄 Procesando usuario #${userIndex}: ${userId}`);
      }
    }

    const posts = content.map((post: any) => {
      const info = post.node;
      const { tags_in_text, hashtags } = extractTagsAndHashtags(
        info?.caption?.text || ""
      );

      const tagsInPost = {
        "user.username": info.user?.username,
        "owner.username": info.owner?.username,
        "coauthor_producers.username": (info.coauthor_producers || []).map(
          (user: any) => user.username
        ),
        "invited_coauthor_producers.username": (
          info.invited_coauthor_producers || []
        ).map((user: any) => user.username),
        "usertags.username": (info.usertags?.in || []).map(
          (user: any) => user.user.username
        ),
        tags_in_text,
        hashtags,
        carousel_media_tags: (info.carousel_media || []).map((media: any) =>
          media.usertags?.in?.map((tag: any) => tag.user?.username)
        ),
      };

      return tagsInPost;
    });

    const usernamesInPost = posts.map((post: any) => {
      const usernames: string[] = [];

      Object.entries(post).forEach(([key, value]) => {
        if (key === "hashtags") return;

        if (typeof value === "string") {
          usernames.push(value);
        } else if (Array.isArray(value)) {
          value.forEach((inner) => {
            if (!inner) return;
            if (typeof inner === "string") {
              usernames.push(inner);
            } else if (Array.isArray(inner)) {
              inner.forEach((nested) => {
                if (typeof nested === "string") {
                  usernames.push(nested);
                }
              });
            } else {
              usernames.push(inner?.toString());
            }
          });
        } else if (value) {
          usernames.push(value.toString());
        }
      });

      return usernames
        .filter((u: string) => u !== userId)
        .map((tag: string) => tag.toLowerCase().replace(/\.+$/, ""));
    });

    const hashtagsInPost = posts.flatMap((post: any) => {
      const value = post.hashtags;
      if (!value || !Array.isArray(value)) return [];
      return value.map((tag: string) => tag.toLowerCase());
    });

    const flatUsernames: string[] = usernamesInPost.flat();
    const flatHashtags: string[] = hashtagsInPost;

    // 🔢 Acumular usernames
    const tagCounter = userTagAccumulator[userId];
    for (const username of flatUsernames) {
      if (!username) continue;
      tagCounter[username] = (tagCounter[username] || 0) + 1;
    }

    // 🔢 Acumular hashtags
    const hashtagCounter = userHashtagAccumulator[userId];
    for (const hashtag of flatHashtags) {
      if (!hashtag) continue;
      hashtagCounter[hashtag] = (hashtagCounter[hashtag] || 0) + 1;
    }
  }

  // 🔄 Convertir acumuladores a arrays ordenados
  for (const userId of Object.keys(userTagAccumulator)) {
    const tagsArray = Object.entries(userTagAccumulator[userId])
      .map(([username, count]) => ({ username, count }))
      .sort(
        (a, b) => b.count - a.count || a.username.localeCompare(b.username)
      );

    const hashtagsArray = Object.entries(userHashtagAccumulator[userId])
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count || a.hashtag.localeCompare(b.hashtag));

    timelineSummary[userId] = {
      tags: tagsArray,
      hashtags: hashtagsArray,
    };
  }

  // 💾 Guardar resultado
  if (!fs.existsSync(`${timelinesPath}/processed`)) {
    fs.mkdirSync(`${timelinesPath}/processed`);
  }

  crearArchivo(
    `${timelinesPath}/processed/tags_hashtags.json`,
    timelineSummary
  );

  // 📢 Validar si hubo usuarios no encontrados
  if (isFiltering) {
    const notFound = targetUserIds.filter((id) => !foundUserIds.has(id));
    if (notFound.length > 0) {
      console.warn("⚠️ Algunos usuarios no tienen archivos:", notFound);
    }
  }
}

function simplify_tags_per_username() {
  const timelinesPath = PROFILES_DIR_PATH;
  const inputPath = `${timelinesPath}/processed/tags_hashtags.json`;
  const outputTagsPath = `${timelinesPath}/processed/simple_tags_per_username.json`;

  const includedUserIds: string[] = []; // ["artista1", "artista2"]

  if (!fs.existsSync(inputPath)) {
    console.error("❌ No se encontró el archivo tags_hashtags.json");
    return;
  }

  const summaryData = leerArchivo(inputPath);
  if (!summaryData || typeof summaryData !== "object") {
    console.error(
      "❌ El archivo tags_hashtags.json no tiene un formato válido"
    );
    return;
  }

  // ✅ Determinar artistas a considerar
  const allUserIds = Object.keys(summaryData);
  const effectiveUserIds =
    includedUserIds.length > 0
      ? includedUserIds.map((u) => u.toLowerCase())
      : allUserIds.map((u) => u.toLowerCase());

  const filterSet = new Set(effectiveUserIds);
  const totalArtists = effectiveUserIds.length;

  // 🔄 Crear resultado en formato: { key: { tags: [], hashtags: [] } }
  const result: Record<string, { tags: string[]; hashtags: string[] }> = {};

  Array.from(filterSet).forEach((userId) => {
    // Encontrar la key original (con mayúsculas/minúsculas correctas)
    const originalKey = Object.keys(summaryData).find(
      (key) => key.toLowerCase() === userId
    );

    if (!originalKey) return;

    const data = summaryData[originalKey] as any;

    // Extraer solo los usernames de los tags
    const tags = (data.tags || []).map(
      (tag: { username: string; count: number }) => tag.username
    );

    // Extraer solo los hashtags
    const hashtags = (data.hashtags || []).map(
      (h: { hashtag: string; count: number }) => h.hashtag
    );

    result[originalKey] = {
      tags,
      hashtags,
    };
  });

  crearArchivo(outputTagsPath, result);

  console.log("✅ Simplificación generada:");
  console.log("  • Resultado:", outputTagsPath);
  console.log(`  • Total usuarios: ${Object.keys(result).length}`);
}

function generate_genres_from_tags_in_timeline() {
  const artistasFull = leerArchivo(
    "./data/drive/2025/chunks/export/artists_genres_related_full_list.json"
  );

  const artistsWithGenres: Record<string, any> = {};
  const placesWithGenres: Record<string, any> = {};

  artistasFull
    .filter(
      (artist: any) =>
        !!artist.genres_combined_list.length && !!artist.instagram
    )
    .forEach((artist: any) => {
      artistsWithGenres[artist.instagram] = artist.genres_combined_list;
    });

  const placesDir =
    "C:/Users/fnp/Documents/Artist Hive/Data Octubre 2025/places_3/processed";
  const placesFull = leerArchivo(`${placesDir}/simple_tags_per_username.json`);

  let totalSitios = 0;

  // const genres_taxonomy = leerArchivo("./data/parametrics/server-genres.json");
  const genres_taxonomy = leerArchivo(
    "./data/parametrics/genres-taxonomy.json"
  );

  Object.keys(placesFull)
    // .slice(0, 100)
    .forEach((place: any, index: number) => {
      if (index % 200 === 0) {
        console.log(place);
      }
      const tagsInPlace = [
        ...placesFull[place].tags,
        ...placesFull[place].hashtags,
      ];
      if (tagsInPlace) {
        const genres = [
          ...new Set(
            tagsInPlace
              .map((tag: string) => artistsWithGenres[tag])
              .flat()
              .filter(Boolean)
          ),
        ];
        totalSitios += !!genres.length ? 1 : 0;
        if (!!genres.length) {
          const simplified = simplify_genres(genres_taxonomy, genres);
          placesWithGenres[place] = {
            // full_genres: genres,
            genres_l1: simplified.genres_l1,
            genres_l2: simplified.genres_l2,
          };
        } else {
          console.log("-----   ", place);
        }
      }
    });

  console.log(placesFull.length, " => ", totalSitios);
  crearArchivo(`${placesDir}/places_full_genres.json`, placesWithGenres);
}

function consolidar_menciones_globales() {
  const timelinesPath = PROFILES_DIR_PATH;
  const inputPath = `${timelinesPath}/processed/tags_hashtags.json`;
  const outputTagsPath = `${timelinesPath}/processed/consolidated_tags_tfidf.json`;
  const outputHashtagsPath = `${timelinesPath}/processed/consolidated_hashtags_tfidf.json`;

  // ✅ Lista de artistas a evaluar (vacía = todos)
  const includedUserIds: string[] = []; // ["artista1", "artista2"]

  if (!fs.existsSync(inputPath)) {
    console.error("❌ No se encontró el archivo tags_hashtags.json");
    return;
  }

  const summaryData = leerArchivo(inputPath);
  if (!summaryData || typeof summaryData !== "object") {
    console.error(
      "❌ El archivo tags_hashtags.json no tiene un formato válido"
    );
    return;
  }

  // ✅ Determinar artistas a considerar
  const allUserIds = Object.keys(summaryData);
  const effectiveUserIds =
    includedUserIds.length > 0
      ? includedUserIds.map((u) => u.toLowerCase())
      : allUserIds.map((u) => u.toLowerCase());

  const filterSet = new Set(effectiveUserIds);
  const totalArtists = effectiveUserIds.length;

  // 🔢 Estructuras para conteo
  const tagCounts: Record<string, number> = {};
  const tagUserMap: Map<string, Set<string>> = new Map();

  const hashtagCounts: Record<string, number> = {};
  const hashtagUserMap: Map<string, Set<string>> = new Map();

  // 🔄 Recorrer todos los perfiles
  for (const [userIdRaw, data] of Object.entries(summaryData)) {
    const userId = userIdRaw.toLowerCase();
    if (!filterSet.has(userId)) continue;

    const tags = (data as any).tags || [];
    for (const tag of tags) {
      const username = tag.username?.toLowerCase().replace(/\.$/, "");
      const count = tag.count || 0;
      if (!username) continue;

      tagCounts[username] = (tagCounts[username] || 0) + count;

      if (!tagUserMap.has(username)) tagUserMap.set(username, new Set());
      tagUserMap.get(username)!.add(userId);
    }

    const hashtags = (data as any).hashtags || [];
    for (const h of hashtags) {
      const hashtag = h.hashtag?.toLowerCase().replace(/\.$/, "");
      const count = h.count || 0;
      if (!hashtag) continue;

      hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + count;

      if (!hashtagUserMap.has(hashtag)) hashtagUserMap.set(hashtag, new Set());
      hashtagUserMap.get(hashtag)!.add(userId);
    }
  }

  // 📊 Consolidar TAGS
  const consolidatedTags = Object.entries(tagCounts)
    .map(([username, count]) => {
      const weighted = tagUserMap.get(username)?.size || 0;
      const adjustedCount =
        totalArtists && weighted > 0
          ? count * Math.pow(weighted / totalArtists, 1.5)
          : 0;

      return { username, count, weighted, adjustedCount };
    })
    .filter((tag) => tag.adjustedCount > 0)
    .sort(
      (a, b) =>
        b.adjustedCount - a.adjustedCount ||
        b.count - a.count ||
        a.username.localeCompare(b.username)
    );

  // 📊 Consolidar HASHTAGS
  const consolidatedHashtags = Object.entries(hashtagCounts)
    .map(([hashtag, count]) => {
      const weighted = hashtagUserMap.get(hashtag)?.size || 0;
      const adjustedCount =
        totalArtists && weighted > 0
          ? count * Math.pow(weighted / totalArtists, 1.5)
          : 0;

      return { hashtag, count, weighted, adjustedCount };
    })
    .filter((tag) => tag.adjustedCount > 0)
    .sort(
      (a, b) =>
        b.adjustedCount - a.adjustedCount ||
        b.count - a.count ||
        a.hashtag.localeCompare(b.hashtag)
    );

  // 💾 Guardar resultados
  crearArchivo(
    outputTagsPath,
    consolidatedTags.map(
      (tag) => `${tag.username} - ${Math.round(tag.adjustedCount)}`
    )
  );
  crearArchivo(
    outputHashtagsPath,
    consolidatedHashtags.map(
      (tag) => `${tag.hashtag} - ${Math.round(tag.adjustedCount)}`
    )
  );

  console.log("✅ Consolidado generado con análisis ponderado:");
  console.log("  • Tags:", outputTagsPath);
  console.log("  • Hashtags:", outputHashtagsPath);
}

function consolidar_menciones_absolutas() {
  const timelinesPath = PROFILES_DIR_PATH;
  const inputPath = `${timelinesPath}/processed/tags_hashtags.json`;
  const outputTagsPath = `${timelinesPath}/processed/consolidated_tags_totals.json`;
  const outputHashtagsPath = `${timelinesPath}/processed/consolidated_hashtags_totals.json`;

  if (!fs.existsSync(inputPath)) {
    console.error("❌ No se encontró el archivo tags_hashtags.json");
    return;
  }

  const summaryData = leerArchivo(inputPath);
  if (!summaryData || typeof summaryData !== "object") {
    console.error(
      "❌ El archivo tags_hashtags.json no tiene un formato válido"
    );
    return;
  }

  const tagCounts: Record<string, number> = {};
  const hashtagCounts: Record<string, number> = {};

  for (const [userId, data] of Object.entries(summaryData)) {
    const tags = (data as any).tags || [];
    for (const tag of tags) {
      const username = tag.username?.toLowerCase().replace(/\.$/, "");
      const count = tag.count || 0;
      if (!username) continue;

      tagCounts[username] = (tagCounts[username] || 0) + count;
    }

    const hashtags = (data as any).hashtags || [];
    for (const h of hashtags) {
      const hashtag = h.hashtag?.toLowerCase().replace(/\.$/, "");
      const count = h.count || 0;
      if (!hashtag) continue;

      hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + count;
    }
  }

  const consolidatedTags = Object.entries(tagCounts)
    .map(([username, count]) => ({ username, count }))
    .sort((a, b) => b.count - a.count || a.username.localeCompare(b.username));

  const consolidatedHashtags = Object.entries(hashtagCounts)
    .map(([hashtag, count]) => ({ hashtag, count }))
    .sort((a, b) => b.count - a.count || a.hashtag.localeCompare(b.hashtag));

  crearArchivo(outputTagsPath, consolidatedTags);
  crearArchivo(outputHashtagsPath, consolidatedHashtags);

  console.log("✅ Consolidado total generado:");
  console.log("  • Tags:", outputTagsPath);
  console.log("  • Hashtags:", outputHashtagsPath);
}

function create_artists_related_genres() {
  const artistasFull = leerArchivo(
    "./data/drive/2025/chunks/export/artist_hive.artists_related.json"
  );

  console.log(`Total artistas en archivo: ${artistasFull.length}`);

  // Crear un mapa de spotify_id -> géneros para búsqueda rápida
  const spotifyToGenresMap: Record<string, string[]> = {};
  artistasFull.forEach((artist: any) => {
    if (artist.spotify && artist.genres?.music?.length) {
      spotifyToGenresMap[artist.spotify] = artist.genres.music;
    }
  });

  // Contadores para estadísticas
  let artistsWithInferredGenres = 0;
  let artistsWithOwnGenres = 0;
  let artistsWithBothGenres = 0;
  let artistsWithNoGenres = 0;
  let totalInferredGenresCount = 0;
  let artistsWithNoRelatedArtists = 0;
  let artistsWithRelatedButNoGenres = 0;

  const artistsGenresRelated = artistasFull
    .map((artist: any) => {
      // Extraer datos básicos
      const spotify = artist.spotify || null;
      const instagram = artist.instagram || null;
      const chartmetric = artist.chartmetric || null;
      const genres = artist.genres?.music || [];

      // Extraer artistas relacionados de Spotify
      const related_artists_spotify =
        artist.arts?.music?.related_artist_spotify || [];

      // Extraer artistas relacionados de Chartmetric (si existen)
      const related_artists_chartmetric =
        artist.chartmetric_data?.related_artists || [];

      // Crear lista completa de géneros de artistas relacionados con frecuencia
      const genreCountMap: Record<string, number> = {};

      // Procesar géneros de artistas relacionados en Spotify
      related_artists_spotify.forEach((relatedSpotifyId: string) => {
        const relatedGenres = spotifyToGenresMap[relatedSpotifyId] || [];
        relatedGenres.forEach((genre: string) => {
          genreCountMap[genre] = (genreCountMap[genre] || 0) + 1;
        });
      });

      // Convertir el mapa a array y ordenar por frecuencia
      const related_artists_genres_full_list = Object.entries(genreCountMap)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));

      // Parámetros configurables para inferencia de géneros
      const THRESHOLD_PERCENTAGE = 0.3; // 30% de los artistas relacionados (reducido de 40%)
      const MIN_ABSOLUTE_COUNT = 2; // Al menos 2 artistas relacionados (reducido de 3)

      // Parámetros para fallback (más permisivo)
      const FALLBACK_THRESHOLD_PERCENTAGE = 0.15; // 15% para artistas sin géneros
      const FALLBACK_MIN_ABSOLUTE_COUNT = 1; // Al menos 1 artista

      const totalRelatedArtists = related_artists_spotify.length;
      const hasOwnGenres = genres.length > 0;

      // Calcular géneros inferidos basados en umbrales
      let inferred_genres: string[] = [];

      if (hasOwnGenres) {
        // Si tiene géneros propios, usar umbrales estrictos
        inferred_genres = related_artists_genres_full_list
          .filter(
            ({ count }) =>
              count >= MIN_ABSOLUTE_COUNT &&
              (totalRelatedArtists === 0 ||
                count / totalRelatedArtists >= THRESHOLD_PERCENTAGE)
          )
          .map(({ genre }) => genre);
      } else {
        // Si NO tiene géneros propios, usar umbrales más permisivos (fallback)
        inferred_genres = related_artists_genres_full_list
          .filter(
            ({ count }) =>
              count >= FALLBACK_MIN_ABSOLUTE_COUNT &&
              (totalRelatedArtists === 0 ||
                count / totalRelatedArtists >= FALLBACK_THRESHOLD_PERCENTAGE)
          )
          .map(({ genre }) => genre)
          .slice(0, 5); // Limitar a top 5 géneros para evitar ruido
      }

      // Combinar géneros propios con inferidos, clasificándolos
      const genresSet = new Set(genres);
      const inferredSet = new Set(inferred_genres);

      const genres_combined = Array.from(
        new Set([...genres, ...inferred_genres])
      ).map((genre) => ({
        genre,
        source: genresSet.has(genre)
          ? inferredSet.has(genre)
            ? "both"
            : "own"
          : "inferred",
      }));

      // Lista simple de géneros combinados (sin clasificación)
      const genres_combined_list = Array.from(
        new Set([...genres, ...inferred_genres])
      );

      // Actualizar contadores
      const hasInferredGenres = inferred_genres.length > 0;

      // Tracking adicional para diagnóstico
      if (totalRelatedArtists === 0) {
        artistsWithNoRelatedArtists++;
      } else if (!hasOwnGenres && !hasInferredGenres) {
        artistsWithRelatedButNoGenres++;
      }

      if (hasOwnGenres && hasInferredGenres) {
        artistsWithBothGenres++;
      } else if (hasOwnGenres) {
        artistsWithOwnGenres++;
      } else if (hasInferredGenres) {
        artistsWithInferredGenres++;
      } else {
        artistsWithNoGenres++;
      }

      totalInferredGenresCount += inferred_genres.length;

      return {
        spotify,
        instagram,
        chartmetric,
        genres,
        related_artists_spotify,
        related_artists_chartmetric,
        related_artists_genres_full_list,
        inferred_genres,
        genres_combined,
        genres_combined_list,
      };
    })
    .filter(
      (artist: any) => artist.spotify || artist.instagram || artist.chartmetric
    );

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Artistas procesados: ${artistsGenresRelated.length}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`\nEstadísticas de géneros:`);
  console.log(
    `  • Artistas con géneros propios únicamente: ${artistsWithOwnGenres}`
  );
  console.log(
    `  • Artistas con géneros inferidos únicamente: ${artistsWithInferredGenres}`
  );
  console.log(
    `  • Artistas con ambos (propios + inferidos): ${artistsWithBothGenres}`
  );
  console.log(`  • Artistas sin géneros: ${artistsWithNoGenres}`);
  console.log(`\nDiagnóstico de artistas sin géneros:`);
  console.log(
    `  • Sin artistas relacionados en Spotify: ${artistsWithNoRelatedArtists}`
  );
  console.log(
    `  • Con artistas relacionados pero sin géneros: ${artistsWithRelatedButNoGenres}`
  );
  console.log(
    `\n  • Total de géneros inferidos (suma): ${totalInferredGenresCount}`
  );
  console.log(
    `  • Promedio de géneros inferidos por artista: ${(
      totalInferredGenresCount / artistsGenresRelated.length
    ).toFixed(2)}`
  );

  const percentageWithoutGenres = (
    (artistsWithNoGenres / artistsGenresRelated.length) *
    100
  ).toFixed(2);
  const percentageNoRelated = (
    (artistsWithNoRelatedArtists / artistsGenresRelated.length) *
    100
  ).toFixed(2);
  console.log(`\nPorcentajes:`);
  console.log(`  • Artistas sin géneros: ${percentageWithoutGenres}%`);
  console.log(`  • Artistas sin relacionados: ${percentageNoRelated}%`);
  console.log(`${"=".repeat(60)}\n`);

  const outputPath =
    "./data/drive/2025/chunks/export/artists_genres_related_full_list.json";
  crearArchivo(outputPath, artistsGenresRelated);

  console.log(`✅ Archivo generado: ${outputPath}`);
}

function simplify_genres(genres_taxonomy: any, genres: string[]) {
  // Crear mapa inverso: género detallado -> {level1, level2, subgenre}
  const genreMap: Record<
    string,
    { level1: string; level1_name: string; level2: string; level2_name: string }
  > = {};

  // Recorrer la taxonomía para crear el mapa
  Object.entries(genres_taxonomy).forEach(([level1Key, level1Data]: any) => {
    const level1Name = level1Data.name;
    const subgenres = level1Data.subgenres || {};

    Object.entries(subgenres).forEach(([level2Key, level2Data]: any) => {
      const level2Name = level2Data.name;
      const genresList = level2Data.genres || [];

      genresList.forEach((genre: any) => {
        // Type guard to handle non-string values
        if (typeof genre === "string" && genre) {
          genreMap[genre.toLowerCase()] = {
            level1: level1Key,
            level1_name: level1Name,
            level2: level2Key,
            level2_name: level2Name,
          };
        } else {
          console.warn(
            `Invalid genre type in ${level1Key}.${level2Key}:`,
            genre
          );
        }
      });
    });
  });

  // Mapear los géneros recibidos
  const mappedGenres = genres
    .map((genre: any) => {
      // Type guard to handle non-string values
      if (typeof genre !== "string" || !genre) {
        return null;
      }
      const mapping = genreMap[genre.toLowerCase()];
      if (mapping) {
        return {
          original: genre,
          level1: mapping.level1,
          level1_name: mapping.level1_name,
          level2: mapping.level2,
          level2_name: mapping.level2_name,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Extraer categorías únicas
  const genres_l1 = Array.from(new Set(mappedGenres.map((g: any) => g.level1)));
  const genres_l1_names = Array.from(
    new Set(mappedGenres.map((g: any) => g.level1_name))
  );
  const genres_l2 = Array.from(new Set(mappedGenres.map((g: any) => g.level2)));
  const genres_l2_names = Array.from(
    new Set(mappedGenres.map((g: any) => g.level2_name))
  );

  return {
    genres_l1: {
      keys: genres_l1,
      names: genres_l1_names,
    },
    genres_l2: {
      keys: genres_l2,
      names: genres_l2_names,
    },
    mapped_genres: mappedGenres,
  };
}
