import * as fs from "fs";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

// Interface para el resumen de perfil
interface ProfileSummary {
  username: string;
  full_name: string;
  biography: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  media_count: number;
  external_url: string | null;
  bio_links: Array<{ title: string; url: string }>;
  detected_link_services: {
    biography: string[];
    external_url: string[];
    bio_links: string[];
  };
}

export function main(args?: any) {
  // summarizeArtistProfiles();
  // compileLinksByDomain();
  // extractSocialMediaUsers();
  generateConfigFile("linktr_ee");
}

export function summarizeArtistProfiles(
  inputDir: string = "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/artists_profiles",
  outputDir: string = "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/artist_profiles_summary"
) {
  // Dominios de interés
  const targetDomains = [
    "campsite.bio",
    "lnk.bio",
    "milkshake.app",
    "msha.ke",
    "beacons.ai",
    "linktr.ee",
    "spotify.",
    "youtube.",
    "youtu.be",
    "tidal",
    "applemusic",
  ];

  // Función helper para detectar dominios en un texto/URL
  function detectDomains(text: string | null | undefined): string[] {
    if (!text) return [];

    const detected: string[] = [];
    const lowerText = text.toLowerCase();

    for (const domain of targetDomains) {
      if (lowerText.includes(domain)) {
        detected.push(domain);
      }
    }

    return detected;
  }

  // Crear directorio de salida si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);
  let processedCount = 0;
  let errorCount = 0;

  console.log(`Processing ${files.length} artist profiles...`);

  files.forEach((fileName, index) => {
    if (!fileName.endsWith(".json")) return;

    try {
      const filePath = `${inputDir}/${fileName}`;
      const profile = leerArchivo(filePath);

      // Extraer bio_links simplificados
      const bioLinks = (profile.bio_links || []).map((link: any) => ({
        title: link.title || "",
        url: link.url || "",
      }));

      // Detectar dominios en cada campo
      const detectedInBiography = detectDomains(profile.biography);
      const detectedInExternalUrl = detectDomains(profile.external_url);
      const detectedInBioLinks: string[] = [
        ...new Set<string>(
          bioLinks.flatMap((link: { url: string }) =>
            detectDomains(link.url)
          ) as string[]
        ),
      ];

      // Crear resumen
      const summary: ProfileSummary = {
        username: profile.username || "",
        full_name: profile.full_name || "",
        biography: profile.biography || "",
        is_verified: profile.is_verified || false,
        follower_count: profile.follower_count || 0,
        following_count: profile.following_count || 0,
        media_count: profile.media_count || 0,
        external_url: profile.external_url || null,
        bio_links: bioLinks,
        detected_link_services: {
          biography: detectedInBiography,
          external_url: detectedInExternalUrl,
          bio_links: detectedInBioLinks,
        },
      };

      // Guardar resumen
      const outputPath = `${outputDir}/${fileName}`;
      crearArchivo(outputPath, summary);
      processedCount++;

      // Progress logging
      if ((index + 1) % 100 === 0 || index + 1 === files.length) {
        const percentage = (((index + 1) / files.length) * 100).toFixed(2);
        console.log(`Progress: ${index + 1}/${files.length} (${percentage}%)`);
      }
    } catch (error) {
      errorCount++;
      console.error(`Error processing ${fileName}:`, error);
    }
  });

  console.log("\n=== Summary ===");
  console.log(`Total files processed: ${processedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Output directory: ${outputDir}`);
}

export function extractSocialMediaUsers(
  inputDir: string = "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/artist_profiles_summary",
  outputDir: string = "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/social_media_users"
) {
  // Instagram profile info that will be associated with each social media account
  interface InstagramInfo {
    username: string;
    full_name: string;
    is_verified: boolean;
    follower_count: number;
  }

  // Social media account with Instagram info
  interface SocialMediaAccount extends InstagramInfo {
    social_username: string;
    url: string;
    url_type: "biography" | "external_url" | "bio_link";
  }

  // Consolidated profile with all social networks
  interface ConsolidatedProfile extends InstagramInfo {
    social_accounts: {
      [network: string]: string[]; // network -> array of usernames
    };
  }

  // Network configurations with regex patterns
  const networkConfigs = {
    "linktr.ee": {
      patterns: [
        /linktr\.ee\/([a-zA-Z0-9_.-]+)/i,
        /linktree\.com\/([a-zA-Z0-9_.-]+)/i,
      ],
      name: "linktr.ee",
    },
    "youtube.com": {
      patterns: [
        /(?:youtube\.com|youtu\.be|m\.youtube\.com)\/(?:@|c\/|channel\/|user\/)?([a-zA-Z0-9_-]+)/i,
      ],
      name: "youtube.com",
    },
    "spotify.com": {
      patterns: [
        /(?:open\.spotify\.com|spoti\.fi|spotify\.link)\/artist\/([a-zA-Z0-9]+)/i,
      ],
      name: "spotify.com",
    },
    "tiktok.com": {
      patterns: [/tiktok\.com\/@?([a-zA-Z0-9_.-]+)/i],
      name: "tiktok.com",
    },
    "beacons.ai": {
      patterns: [/beacons\.ai\/([a-zA-Z0-9_.-]+)/i],
      name: "beacons.ai",
    },
    "apple.com": {
      patterns: [/music\.apple\.com\/[a-z]{2}\/artist\/[^\/]+\/([0-9]+)/i],
      name: "apple.com",
    },
    "ditto.fm": {
      patterns: [/ditto\.fm\/([a-zA-Z0-9_.-]+)/i],
      name: "ditto.fm",
    },
    "bandsintown.com": {
      patterns: [/bandsintown\.com\/[a-z]\/([a-zA-Z0-9_.-]+)/i],
      name: "bandsintown.com",
    },
    "patreon.com": {
      patterns: [/patreon\.com\/([a-zA-Z0-9_.-]+)/i],
      name: "patreon.com",
    },
    "soundcloud.com": {
      patterns: [/(?:on\.)?sound(?:cloud)?\.com\/([a-zA-Z0-9_-]+)/i],
      name: "soundcloud.com",
    },
    whatsapp: {
      patterns: [/wa\.me\/([0-9]+)/i],
      name: "whatsapp",
    },
  };

  // Helper function to extract username from URL for a given network
  function extractUsername(
    url: string,
    network: keyof typeof networkConfigs
  ): string | null {
    const config = networkConfigs[network];
    for (const pattern of config.patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // Helper function to detect which network a URL belongs to
  function detectNetwork(url: string): keyof typeof networkConfigs | null {
    const lowerUrl = url.toLowerCase();
    for (const network of Object.keys(
      networkConfigs
    ) as (keyof typeof networkConfigs)[]) {
      for (const pattern of networkConfigs[network].patterns) {
        if (pattern.test(lowerUrl)) {
          return network;
        }
      }
    }
    return null;
  }

  // Data structures
  const usersByNetwork: Record<string, SocialMediaAccount[]> = {};
  const consolidatedProfiles: Record<string, ConsolidatedProfile> = {};

  // Initialize network arrays
  for (const network of Object.keys(networkConfigs)) {
    usersByNetwork[network] = [];
  }

  // Create output directories
  const byNetworkDir = `${outputDir}/by_network`;
  const consolidatedDir = `${outputDir}/consolidated`;

  if (!fs.existsSync(byNetworkDir)) {
    fs.mkdirSync(byNetworkDir, { recursive: true });
  }
  if (!fs.existsSync(consolidatedDir)) {
    fs.mkdirSync(consolidatedDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);
  let processedCount = 0;
  let totalUsersFound = 0;

  console.log(`Processing ${files.length} profile summaries...`);

  files.forEach((fileName, index) => {
    if (!fileName.endsWith(".json")) return;

    try {
      const filePath = `${inputDir}/${fileName}`;
      const profile: ProfileSummary = leerArchivo(filePath);

      const instagramInfo: InstagramInfo = {
        username: profile.username,
        full_name: profile.full_name,
        is_verified: profile.is_verified,
        follower_count: profile.follower_count,
      };

      // Initialize consolidated profile
      if (!consolidatedProfiles[profile.username]) {
        consolidatedProfiles[profile.username] = {
          ...instagramInfo,
          social_accounts: {},
        };
      }

      // Helper to process a URL
      const processUrl = (
        url: string,
        urlType: "biography" | "external_url" | "bio_link"
      ) => {
        const network = detectNetwork(url);
        if (network) {
          const username = extractUsername(url, network);
          if (username) {
            // Add to by_network structure
            usersByNetwork[network].push({
              ...instagramInfo,
              social_username: username,
              url: url,
              url_type: urlType,
            });

            // Add to consolidated structure
            if (
              !consolidatedProfiles[profile.username].social_accounts[network]
            ) {
              consolidatedProfiles[profile.username].social_accounts[network] =
                [];
            }
            if (
              !consolidatedProfiles[profile.username].social_accounts[
                network
              ].includes(username)
            ) {
              consolidatedProfiles[profile.username].social_accounts[
                network
              ].push(username);
            }

            totalUsersFound++;
          }
        }
      };

      // Process biography URLs
      if (profile.biography) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = profile.biography.match(urlRegex) || [];
        urls.forEach((url) => processUrl(url, "biography"));
      }

      // Process external_url
      if (profile.external_url) {
        processUrl(profile.external_url, "external_url");
      }

      // Process bio_links
      profile.bio_links.forEach((link) => {
        if (link.url) {
          processUrl(link.url, "bio_link");
        }
      });

      processedCount++;

      // Progress logging
      if ((index + 1) % 100 === 0 || index + 1 === files.length) {
        const percentage = (((index + 1) / files.length) * 100).toFixed(2);
        console.log(`Progress: ${index + 1}/${files.length} (${percentage}%)`);
      }
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  });

  console.log("\nGenerating output files...");

  // Generate by_network files
  for (const [network, accounts] of Object.entries(usersByNetwork)) {
    if (accounts.length === 0) continue;

    // Sort by follower_count descending
    const sortedAccounts = accounts.sort(
      (a, b) => b.follower_count - a.follower_count
    );

    const networkData = {
      network: network,
      generated_at: new Date().toISOString(),
      total_accounts: sortedAccounts.length,
      total_verified: sortedAccounts.filter((a) => a.is_verified).length,
      accounts: sortedAccounts,
    };

    const sanitizedNetwork = network.replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputPath = `${byNetworkDir}/${sanitizedNetwork}.json`;
    crearArchivo(outputPath, networkData);
  }

  // Generate consolidated files (one per Instagram artist)
  const sortedProfiles = Object.values(consolidatedProfiles)
    .filter((p) => Object.keys(p.social_accounts).length > 0)
    .sort((a, b) => b.follower_count - a.follower_count);

  sortedProfiles.forEach((profile) => {
    const sanitizedUsername = profile.username.replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputPath = `${consolidatedDir}/${sanitizedUsername}.json`;
    crearArchivo(outputPath, profile);
  });

  // Generate summary
  const summary = {
    generated_at: new Date().toISOString(),
    total_profiles_processed: processedCount,
    total_social_accounts_found: totalUsersFound,
    networks: Object.entries(usersByNetwork).map(([network, accounts]) => ({
      network: network,
      total_accounts: accounts.length,
      verified_accounts: accounts.filter((a) => a.is_verified).length,
    })),
    artists_with_social_accounts: sortedProfiles.length,
  };

  const summaryPath = `${outputDir}/_summary.json`;
  crearArchivo(summaryPath, summary);

  console.log("\n=== Social Media Extraction Summary ===");
  console.log(`Total profiles processed: ${processedCount}`);
  console.log(`Total social accounts found: ${totalUsersFound}`);
  console.log(`Artists with social accounts: ${sortedProfiles.length}`);
  console.log(`Output directory: ${outputDir}`);
  console.log("\nAccounts by network:");
  Object.entries(usersByNetwork)
    .filter(([_, accounts]) => accounts.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([network, accounts]) => {
      console.log(`  ${network}: ${accounts.length} accounts`);
    });
}

export function compileLinksByDomain(
  inputDir: string = "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/artist_profiles_summary",
  outputDir: string = "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/links_by_domain"
) {
  // Crear directorio de salida si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Estructura para almacenar links por dominio
  interface ArtistLink {
    username: string;
    full_name: string;
    is_verified: boolean;
    follower_count: number;
    url: string;
    url_type: "biography" | "external_url" | "bio_link";
    bio_link_title?: string;
  }

  const linksByDomain: Record<string, ArtistLink[]> = {};

  const files = fs.readdirSync(inputDir);
  let processedCount = 0;
  let totalLinksFound = 0;

  console.log(`Processing ${files.length} profile summaries...`);

  files.forEach((fileName, index) => {
    if (!fileName.endsWith(".json")) return;

    try {
      const filePath = `${inputDir}/${fileName}`;
      const profile: ProfileSummary = leerArchivo(filePath);

      // Función helper para extraer dominio de una URL
      function extractDomain(url: string): string | null {
        try {
          const urlObj = new URL(url);
          return urlObj.hostname.replace(/^www\./, "");
        } catch {
          // Si no es una URL válida, intentar extraer dominio manualmente
          const match = url.match(
            /(?:https?:\/\/)?(?:www\.)?([^\/\s]+\.[a-z]{2,})/i
          );
          return match ? match[1] : null;
        }
      }

      // Procesar biography
      if (
        profile.biography &&
        profile.detected_link_services.biography.length > 0
      ) {
        // Extraer URLs de la biografía
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = profile.biography.match(urlRegex) || [];

        urls.forEach((url) => {
          const domain = extractDomain(url);
          if (domain) {
            if (!linksByDomain[domain]) {
              linksByDomain[domain] = [];
            }
            linksByDomain[domain].push({
              username: profile.username,
              full_name: profile.full_name,
              is_verified: profile.is_verified,
              follower_count: profile.follower_count,
              url: url,
              url_type: "biography",
            });
            totalLinksFound++;
          }
        });
      }

      // Procesar external_url
      if (profile.external_url) {
        const domain = extractDomain(profile.external_url);
        if (domain) {
          if (!linksByDomain[domain]) {
            linksByDomain[domain] = [];
          }
          linksByDomain[domain].push({
            username: profile.username,
            full_name: profile.full_name,
            is_verified: profile.is_verified,
            follower_count: profile.follower_count,
            url: profile.external_url,
            url_type: "external_url",
          });
          totalLinksFound++;
        }
      }

      // Procesar bio_links
      profile.bio_links.forEach((link) => {
        if (link.url) {
          const domain = extractDomain(link.url);
          if (domain) {
            if (!linksByDomain[domain]) {
              linksByDomain[domain] = [];
            }
            linksByDomain[domain].push({
              username: profile.username,
              full_name: profile.full_name,
              is_verified: profile.is_verified,
              follower_count: profile.follower_count,
              url: link.url,
              url_type: "bio_link",
              bio_link_title: link.title,
            });
            totalLinksFound++;
          }
        }
      });

      processedCount++;

      // Progress logging
      if ((index + 1) % 100 === 0 || index + 1 === files.length) {
        const percentage = (((index + 1) / files.length) * 100).toFixed(2);
        console.log(`Progress: ${index + 1}/${files.length} (${percentage}%)`);
      }
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  });

  console.log("\nGenerating domain files...");

  // Ordenar dominios por cantidad de artistas
  const sortedDomains = Object.entries(linksByDomain).sort(
    (a, b) => b[1].length - a[1].length
  );

  // Generar un archivo por cada dominio
  sortedDomains.forEach(([domain, artists]) => {
    // Ordenar artistas por follower_count descendente
    const sortedArtists = artists.sort(
      (a, b) => b.follower_count - a.follower_count
    );

    const domainData = {
      domain: domain,
      generated_at: new Date().toISOString(),
      total_artists: sortedArtists.length,
      total_verified: sortedArtists.filter((a) => a.is_verified).length,
      artists: sortedArtists,
    };

    const sanitizedDomain = domain.replace(/[^a-zA-Z0-9_-]/g, "_");
    const outputPath = `${outputDir}/${sanitizedDomain}.json`;
    crearArchivo(outputPath, domainData);
  });

  // Generar archivo de resumen
  const summary = {
    generated_at: new Date().toISOString(),
    total_profiles_processed: processedCount,
    total_links_found: totalLinksFound,
    total_domains: sortedDomains.length,
    domains_by_popularity: sortedDomains.map(([domain, artists]) => ({
      domain: domain,
      total_artists: artists.length,
      verified_artists: artists.filter((a) => a.is_verified).length,
    })),
  };

  const summaryPath = `${outputDir}/_summary.json`;
  crearArchivo(summaryPath, summary);

  console.log("\n=== Compilation Summary ===");
  console.log(`Total profiles processed: ${processedCount}`);
  console.log(`Total links found: ${totalLinksFound}`);
  console.log(`Total unique domains: ${sortedDomains.length}`);
  console.log(`Output directory: ${outputDir}`);
  console.log("\nTop 10 domains by artist count:");
  sortedDomains.slice(0, 50).forEach(([domain, artists], idx) => {
    console.log(`  ${idx + 1}. ${domain}: ${artists.length} artists`);
  });
}

export function generateConfigFile(socialNetwork: string) {
  const dirPath =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/scrapped/instagram/social_media_users/by_network";

  const datos = leerArchivo(`${dirPath}/${socialNetwork}.json`);

  // Eliminar duplicados manteniendo el orden original
  const seen = new Map<string, boolean>();
  const uniqueAccounts = (datos?.accounts || []).filter((account: any) => {
    if (seen.has(account.username)) {
      return false;
    }
    seen.set(account.username, true);
    return true;
  });

  crearArchivo(
    `${dirPath}/config_${socialNetwork}.json`,
    uniqueAccounts.map((account: any) => {
      return { username: account.username, downloaded: 0 };
    })
  );
}
