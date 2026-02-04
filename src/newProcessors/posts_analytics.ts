import * as fs from "fs";
import * as path from "path";
import { crearArchivo, leerArchivo } from "../helpers/files.helpers";

// Paths
const TIMELINE_DIR = "C:/Users/fnp/Documents/Artist Hive/Data/complete";
const OUTPUT_DIR = "C:/Users/fnp/Documents/Artist Hive/Data/places_analytics";

// Types
interface PostNode {
  taken_at: number;
  caption?: { text?: string };
  usertags?: { in?: Array<{ user: { username: string } }> };
  like_count?: number;
  comment_count?: number;
}

interface TaggedAccount {
  username: string;
  count: number;
  first_seen: string;
  last_seen: string;
  avg_tagged_date: string;
  median_tagged_date: string;
}

interface AccountAnalytics {
  account: string;
  processed_at: string;
  downloaded_at: string;
  total_posts: number;
  date_range: {
    first_post: string;
    last_post: string;
  };
  tagged_accounts: {
    global: TaggedAccount[];
    by_month: Record<string, Array<{ username: string; count: number }>>;
    by_year: Record<string, Array<{ username: string; count: number }>>;
    last_24_months: Array<{ username: string; count: number }>;
  };
  hashtags: {
    global: Array<{ tag: string; count: number }>;
    by_month: Record<string, Array<{ tag: string; count: number }>>;
    by_year: Record<string, Array<{ tag: string; count: number }>>;
    last_24_months: Array<{ tag: string; count: number }>;
  };
  activity_metrics: {
    posts_per_month: Record<string, number>;
    posts_per_year: Record<string, number>;
    avg_posts_per_month: number;
    posting_frequency: "high" | "medium" | "low" | "inactive";
    activity_trend: "increasing" | "stable" | "decreasing";
    last_90_days_posts: number;
    avg_days_between_posts: number;
    median_days_between_posts: number;
  };
  temporal_patterns: {
    global: {
      avg_hour: number;
      avg_day: number;
      most_common_day: string;
      most_common_hour: number;
      posts_by_day_of_week: Record<string, number>;
      posts_by_hour: Record<number, number>;
    };
    by_year: Record<
      string,
      {
        avg_hour: number;
        avg_day: number;
        posts_by_day_of_week: Record<string, number>;
        posts_by_hour: Record<number, number>;
      }
    >;
  };
  engagement_metrics: {
    global: {
      avg_likes: number;
      avg_comments: number;
      median_likes: number;
      median_comments: number;
      total_likes: number;
      total_comments: number;
    };
    by_year: Record<
      string,
      {
        avg_likes: number;
        avg_comments: number;
        total_likes: number;
        total_comments: number;
      }
    >;
    by_month: Record<
      string,
      {
        avg_likes: number;
        avg_comments: number;
        total_likes: number;
        total_comments: number;
      }
    >;
  };
}

// Main function
export function main(args?: any) {
  crearAnalytics();
  // complementarGeoReferenciacion();
  // cualesUsuariosFaltan();
}

export function crearAnalytics() {
  console.log("🚀 Iniciando análisis de posts de Instagram");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(TIMELINE_DIR).sort();
  const accountGroups = groupFilesByAccount(files);

  console.log(`📊 Total de cuentas encontradas: ${accountGroups.size}`);

  let processed = 0;
  let skipped = 0;

  for (const [accountName, fileList] of accountGroups) {
    const outputPath = path.join(OUTPUT_DIR, `${accountName}.json`);

    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    try {
      const analytics = processAccount(accountName, fileList);
      crearArchivo(outputPath, analytics);
      processed++;

      if (processed % 100 === 0) {
        console.log(`✅ Procesadas: ${processed} | ⏭️  Omitidas: ${skipped}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando ${accountName}:`, error);
    }
  }

  console.log(`\n✨ Finalizado!`);
  console.log(`   Procesadas: ${processed}`);
  console.log(`   Omitidas: ${skipped}`);
  console.log(`   Total: ${accountGroups.size}`);

  complementarGeoReferenciacion();
}

// Group files by account
function groupFilesByAccount(files: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const file of files) {
    const match = file.match(/^(.+?)_\d+\.json$/);
    if (match) {
      const accountName = match[1];
      if (!groups.has(accountName)) {
        groups.set(accountName, []);
      }
      groups.get(accountName)!.push(file);
    }
  }

  return groups;
}

// Process single account
function processAccount(
  accountName: string,
  fileList: string[]
): AccountAnalytics {
  const allPosts: Array<{ timestamp: number; node: PostNode }> = [];

  // Get downloaded_at from first file's modification time
  let downloadedAt = new Date().toISOString();
  let lastIndex = fileList.length;
  if (fileList.length > 0) {
    try {
      const firstFilePath = path.join(TIMELINE_DIR, fileList[0]);
      const stats = fs.statSync(firstFilePath);
      downloadedAt = stats.mtime.toISOString();
    } catch (error) {
      // If error reading file stats, use current time
    }
  }

  // Read all files for this account
  for (const file of fileList) {
    const filePath = path.join(TIMELINE_DIR, file);
    const content = leerArchivo(filePath);

    if (Array.isArray(content)) {
      content.forEach((post: any) => {
        const node = post.node || {};
        if (node.taken_at) {
          allPosts.push({
            timestamp: node.taken_at,
            node,
          });
        }
      });
    }
  }

  // Sort by timestamp
  allPosts.sort((a, b) => a.timestamp - b.timestamp);

  // Extract data
  const tags = extractTags(allPosts);
  const hashtags = extractHashtags(allPosts);
  const activity = calculateActivityMetrics(allPosts);
  const temporal = calculateTemporalPatterns(allPosts);
  const engagement = calculateEngagementMetrics(allPosts);

  const firstPost = allPosts[0]?.timestamp || 0;
  const lastPost = allPosts[allPosts.length - 1]?.timestamp || 0;

  // Response
  return {
    account: accountName,
    processed_at: new Date().toISOString(),
    downloaded_at: downloadedAt,
    total_posts: allPosts.length,
    date_range: {
      first_post: timestampToDate(firstPost),
      last_post: timestampToDate(lastPost),
    },
    tagged_accounts: tags,
    hashtags,
    activity_metrics: activity,
    temporal_patterns: temporal,
    engagement_metrics: engagement,
  };
}

// Helper function to extract tags and hashtags from caption text
function extractTagsAndHashtagsFromText(text: string) {
  // Regex para menciones: @ debe estar al inicio, después de espacio o puntuación (no después de caracteres de palabra)
  // Esto evita capturar emails como usuario@email.com
  const userTagRegex = /(?:^|(?<=\s)|(?<=[^\w]))@([\w][\w\d._]*)/g;
  const hashtagRegex = /#([\w\dáéíóúÁÉÍÓÚñÑüÜ]+)/g;

  const tags_in_text: string[] = [];
  const hashtags: string[] = [];

  let match: RegExpExecArray | null;

  // Extraer menciones @usuario (evitando emails)
  while ((match = userTagRegex.exec(text)) !== null) {
    const username = match[1].toLowerCase();
    // Validar que no esté vacío y tenga longitud razonable (Instagram max 30 chars)
    if (username && username.length <= 30) {
      tags_in_text.push(username);
    }
  }

  // Extraer hashtags #hashtag
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }

  return { tags_in_text, hashtags };
}

// Extract tags from posts
function extractTags(posts: Array<{ timestamp: number; node: PostNode }>) {
  const globalTags: Record<
    string,
    {
      count: number;
      first_seen: number;
      last_seen: number;
      timestamps: number[];
    }
  > = {};
  const byMonth: Record<string, Record<string, number>> = {};
  const byYear: Record<string, Record<string, number>> = {};

  const now = Date.now() / 1000;
  const twentyFourMonthsAgo = now - 24 * 30 * 24 * 60 * 60;
  const last24MonthsTags: Record<string, number> = {};

  for (const post of posts) {
    const monthKey = timestampToMonth(post.timestamp);
    const yearKey = timestampToYear(post.timestamp);

    if (!byMonth[monthKey]) byMonth[monthKey] = {};
    if (!byYear[yearKey]) byYear[yearKey] = {};

    // Recopilar todos los usernames de diferentes fuentes
    const allUsernames = new Set<string>();

    // 1. Tags de usertags.in
    const usertagsIn = post.node.usertags?.in || [];
    usertagsIn.forEach((tag) => {
      allUsernames.add(tag.user.username.toLowerCase());
    });

    // 2. Tags del caption text
    const captionText = post.node.caption?.text || "";
    if (captionText) {
      const { tags_in_text } = extractTagsAndHashtagsFromText(captionText);
      tags_in_text.forEach((tag) => allUsernames.add(tag));
    }

    // Procesar todos los usernames únicos
    for (const username of allUsernames) {
      // Global
      if (!globalTags[username]) {
        globalTags[username] = {
          count: 0,
          first_seen: post.timestamp,
          last_seen: post.timestamp,
          timestamps: [],
        };
      }
      globalTags[username].count++;
      globalTags[username].last_seen = post.timestamp;
      globalTags[username].timestamps.push(post.timestamp);

      // By month
      byMonth[monthKey][username] = (byMonth[monthKey][username] || 0) + 1;

      // By year
      byYear[yearKey][username] = (byYear[yearKey][username] || 0) + 1;

      // Last 24 months
      if (post.timestamp >= twentyFourMonthsAgo) {
        last24MonthsTags[username] = (last24MonthsTags[username] || 0) + 1;
      }
    }
  }

  return {
    global: Object.entries(globalTags)
      .map(([username, data]) => {
        const avgTimestamp = mean(data.timestamps);
        const medianTimestamp = median(data.timestamps);

        return {
          username,
          count: data.count,
          first_seen: timestampToMonth(data.first_seen),
          last_seen: timestampToMonth(data.last_seen),
          avg_tagged_date: timestampToDate(avgTimestamp),
          median_tagged_date: timestampToDate(medianTimestamp),
        };
      })
      .sort((a, b) => b.count - a.count),
    by_month: Object.fromEntries(
      Object.entries(byMonth).map(([month, tags]) => [
        month,
        Object.entries(tags)
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count),
      ])
    ),
    by_year: Object.fromEntries(
      Object.entries(byYear).map(([year, tags]) => [
        year,
        Object.entries(tags)
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count),
      ])
    ),
    last_24_months: Object.entries(last24MonthsTags)
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count),
  };
}

// Extract hashtags from posts
function extractHashtags(posts: Array<{ timestamp: number; node: PostNode }>) {
  const globalHashtags: Record<string, number> = {};
  const byMonth: Record<string, Record<string, number>> = {};
  const byYear: Record<string, Record<string, number>> = {};

  const now = Date.now() / 1000;
  const twentyFourMonthsAgo = now - 24 * 30 * 24 * 60 * 60;
  const last24MonthsHashtags: Record<string, number> = {};

  for (const post of posts) {
    const captionText = post.node.caption?.text || "";
    const monthKey = timestampToMonth(post.timestamp);
    const yearKey = timestampToYear(post.timestamp);

    if (!byMonth[monthKey]) byMonth[monthKey] = {};
    if (!byYear[yearKey]) byYear[yearKey] = {};

    // Usar la función helper para extraer hashtags
    if (captionText) {
      const { hashtags } = extractTagsAndHashtagsFromText(captionText);

      for (const tag of hashtags) {
        // Global
        globalHashtags[tag] = (globalHashtags[tag] || 0) + 1;

        // By month
        byMonth[monthKey][tag] = (byMonth[monthKey][tag] || 0) + 1;

        // By year
        byYear[yearKey][tag] = (byYear[yearKey][tag] || 0) + 1;

        // Last 24 months
        if (post.timestamp >= twentyFourMonthsAgo) {
          last24MonthsHashtags[tag] = (last24MonthsHashtags[tag] || 0) + 1;
        }
      }
    }
  }

  return {
    global: Object.entries(globalHashtags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
    by_month: Object.fromEntries(
      Object.entries(byMonth).map(([month, tags]) => [
        month,
        Object.entries(tags)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count),
      ])
    ),
    by_year: Object.fromEntries(
      Object.entries(byYear).map(([year, tags]) => [
        year,
        Object.entries(tags)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count),
      ])
    ),
    last_24_months: Object.entries(last24MonthsHashtags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
  };
}

// Calculate activity metrics
function calculateActivityMetrics(
  posts: Array<{ timestamp: number; node: PostNode }>
) {
  const postsPerMonth: Record<string, number> = {};
  const postsPerYear: Record<string, number> = {};

  const now = Date.now() / 1000;
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60;
  let last90DaysPosts = 0;

  const daysBetweenPosts: number[] = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const monthKey = timestampToMonth(post.timestamp);
    const yearKey = timestampToYear(post.timestamp);

    postsPerMonth[monthKey] = (postsPerMonth[monthKey] || 0) + 1;
    postsPerYear[yearKey] = (postsPerYear[yearKey] || 0) + 1;

    if (post.timestamp >= ninetyDaysAgo) {
      last90DaysPosts++;
    }

    if (i > 0) {
      const daysDiff =
        (post.timestamp - posts[i - 1].timestamp) / (24 * 60 * 60);
      daysBetweenPosts.push(daysDiff);
    }
  }

  const avgDaysBetweenPosts =
    daysBetweenPosts.length > 0
      ? daysBetweenPosts.reduce((a, b) => a + b, 0) / daysBetweenPosts.length
      : 0;

  const medianDaysBetweenPosts = median(daysBetweenPosts);

  const totalMonths = Object.keys(postsPerMonth).length;
  const avgPostsPerMonth = posts.length / Math.max(totalMonths, 1);

  // Classify posting frequency based on avg days between posts
  let postingFrequency: "high" | "medium" | "low" | "inactive";
  if (avgDaysBetweenPosts <= 1) {
    postingFrequency = "high";
  } else if (avgDaysBetweenPosts <= 5) {
    postingFrequency = "medium";
  } else if (avgDaysBetweenPosts <= 15) {
    postingFrequency = "low";
  } else {
    postingFrequency = "inactive";
  }

  // Calculate activity trend (compare last 6 months vs previous 6 months)
  const sixMonthsAgo = now - 6 * 30 * 24 * 60 * 60;
  const twelveMonthsAgo = now - 12 * 30 * 24 * 60 * 60;

  const last6MonthsPosts = posts.filter(
    (p) => p.timestamp >= sixMonthsAgo
  ).length;
  const previous6MonthsPosts = posts.filter(
    (p) => p.timestamp >= twelveMonthsAgo && p.timestamp < sixMonthsAgo
  ).length;

  let activityTrend: "increasing" | "stable" | "decreasing";
  if (last6MonthsPosts > previous6MonthsPosts * 1.2) {
    activityTrend = "increasing";
  } else if (last6MonthsPosts < previous6MonthsPosts * 0.8) {
    activityTrend = "decreasing";
  } else {
    activityTrend = "stable";
  }

  return {
    posts_per_month: postsPerMonth,
    posts_per_year: postsPerYear,
    avg_posts_per_month: Math.round(avgPostsPerMonth * 100) / 100,
    posting_frequency: postingFrequency,
    activity_trend: activityTrend,
    last_90_days_posts: last90DaysPosts,
    avg_days_between_posts: Math.round(avgDaysBetweenPosts * 100) / 100,
    median_days_between_posts: Math.round(medianDaysBetweenPosts * 100) / 100,
  };
}

// Calculate temporal patterns
function calculateTemporalPatterns(
  posts: Array<{ timestamp: number; node: PostNode }>
) {
  const globalHours: number[] = [];
  const globalDays: number[] = [];
  const dayOfWeekCounts: Record<string, number> = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };
  const hourCounts: Record<number, number> = {};

  const byYear: Record<
    string,
    {
      hours: number[];
      days: number[];
      dayOfWeekCounts: Record<string, number>;
      hourCounts: Record<number, number>;
    }
  > = {};

  for (const post of posts) {
    const date = new Date(post.timestamp * 1000);
    const hour = date.getUTCHours();
    const dayOfWeek = date.getUTCDay(); // 0 = Sunday
    const yearKey = timestampToYear(post.timestamp);

    globalHours.push(hour);
    globalDays.push(dayOfWeek);

    const dayName = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][dayOfWeek];
    dayOfWeekCounts[dayName]++;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    if (!byYear[yearKey]) {
      byYear[yearKey] = {
        hours: [],
        days: [],
        dayOfWeekCounts: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
        },
        hourCounts: {},
      };
    }

    byYear[yearKey].hours.push(hour);
    byYear[yearKey].days.push(dayOfWeek);
    byYear[yearKey].dayOfWeekCounts[dayName]++;
    byYear[yearKey].hourCounts[hour] =
      (byYear[yearKey].hourCounts[hour] || 0) + 1;
  }

  const avgHour = mean(globalHours);
  const avgDay = mean(globalDays);
  const mostCommonDay = Object.entries(dayOfWeekCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  const mostCommonHour =
    Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

  return {
    global: {
      avg_hour: Math.round(avgHour * 100) / 100,
      avg_day: Math.round(avgDay * 100) / 100,
      most_common_day: mostCommonDay,
      most_common_hour: Number(mostCommonHour),
      posts_by_day_of_week: dayOfWeekCounts,
      posts_by_hour: hourCounts,
    },
    by_year: Object.fromEntries(
      Object.entries(byYear).map(([year, data]) => [
        year,
        {
          avg_hour: Math.round(mean(data.hours) * 100) / 100,
          avg_day: Math.round(mean(data.days) * 100) / 100,
          posts_by_day_of_week: data.dayOfWeekCounts,
          posts_by_hour: data.hourCounts,
        },
      ])
    ),
  };
}

// Calculate engagement metrics
function calculateEngagementMetrics(
  posts: Array<{ timestamp: number; node: PostNode }>
) {
  const allLikes: number[] = [];
  const allComments: number[] = [];
  let totalLikes = 0;
  let totalComments = 0;

  const byYear: Record<
    string,
    {
      likes: number[];
      comments: number[];
      totalLikes: number;
      totalComments: number;
    }
  > = {};
  const byMonth: Record<
    string,
    {
      likes: number[];
      comments: number[];
      totalLikes: number;
      totalComments: number;
    }
  > = {};

  for (const post of posts) {
    const likes = post.node.like_count || 0;
    const comments = post.node.comment_count || 0;
    const yearKey = timestampToYear(post.timestamp);
    const monthKey = timestampToMonth(post.timestamp);

    allLikes.push(likes);
    allComments.push(comments);
    totalLikes += likes;
    totalComments += comments;

    if (!byYear[yearKey]) {
      byYear[yearKey] = {
        likes: [],
        comments: [],
        totalLikes: 0,
        totalComments: 0,
      };
    }
    byYear[yearKey].likes.push(likes);
    byYear[yearKey].comments.push(comments);
    byYear[yearKey].totalLikes += likes;
    byYear[yearKey].totalComments += comments;

    if (!byMonth[monthKey]) {
      byMonth[monthKey] = {
        likes: [],
        comments: [],
        totalLikes: 0,
        totalComments: 0,
      };
    }
    byMonth[monthKey].likes.push(likes);
    byMonth[monthKey].comments.push(comments);
    byMonth[monthKey].totalLikes += likes;
    byMonth[monthKey].totalComments += comments;
  }

  return {
    global: {
      avg_likes: Math.round(mean(allLikes) * 100) / 100,
      avg_comments: Math.round(mean(allComments) * 100) / 100,
      median_likes: median(allLikes),
      median_comments: median(allComments),
      total_likes: totalLikes,
      total_comments: totalComments,
    },
    by_year: Object.fromEntries(
      Object.entries(byYear).map(([year, data]) => [
        year,
        {
          avg_likes: Math.round(mean(data.likes) * 100) / 100,
          avg_comments: Math.round(mean(data.comments) * 100) / 100,
          total_likes: data.totalLikes,
          total_comments: data.totalComments,
        },
      ])
    ),
    by_month: Object.fromEntries(
      Object.entries(byMonth).map(([month, data]) => [
        month,
        {
          avg_likes: Math.round(mean(data.likes) * 100) / 100,
          avg_comments: Math.round(mean(data.comments) * 100) / 100,
          total_likes: data.totalLikes,
          total_comments: data.totalComments,
        },
      ])
    ),
  };
}

// Utility functions
function timestampToDate(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().split("T")[0];
}

function timestampToMonth(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function timestampToYear(timestamp: number): string {
  return new Date(timestamp * 1000).getUTCFullYear().toString();
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function cualesUsuariosFaltan() {
  const driveDatabasePath =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/10-31/Sitios - Sitios.json";

  const driveVenues = leerArchivo(driveDatabasePath);
  driveVenues.shift();
  console.log(driveVenues[0]);

  const scrappedVenuesDirPath =
    "C:/Users/fnp/Documents/Artist Hive/Data/places_analytics";

  const driveVenuesUsers = driveVenues.map((venue: any) => venue.instagram);

  const scrappedVenues = fs.readdirSync(scrappedVenuesDirPath);

  crearArchivo(
    "C:/Users/fnp/Documents/Artist Hive/Data/missing.json",
    driveVenuesUsers.filter(
      (venue: any) =>
        !!venue.trim() &&
        !scrappedVenues.find(
          (scrappedVenue: any) => scrappedVenue.replace(".json", "") === venue
        )
    )
  );
}

export function complementarGeoReferenciacion() {
  const driveDatabasePath =
    "C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/2025/10-31/Sitios - Sitios.json";

  const driveVenues = leerArchivo(driveDatabasePath);
  driveVenues.shift(); // Remove header row

  const scrappedVenuesDirPath =
    "C:/Users/fnp/Documents/Artist Hive/Data/places_analytics";

  const scrappedVenues = fs.readdirSync(scrappedVenuesDirPath);

  let processedCount = 0;
  let notFoundCount = 0;
  let updatedCount = 0;

  console.log(`Processing ${scrappedVenues.length} analytics files...`);

  scrappedVenues.forEach((fileName, index) => {
    if (!fileName.endsWith(".json")) return;

    const filePath = `${scrappedVenuesDirPath}/${fileName}`;
    const analytics = leerArchivo(filePath);
    const username = fileName.replace(".json", "");

    // Find matching venue in driveVenues by instagram username
    const venue = driveVenues.find(
      (v: any) =>
        v.instagram && v.instagram.toLowerCase() === username.toLowerCase()
    );

    if (!venue) {
      notFoundCount++;
      analytics.activo = "NO";
      analytics.location = null;
    } else {
      // Calculate activo status based on last post vs downloaded date
      const downloadedDate = new Date(analytics.downloaded_at);
      const lastPostDate = new Date(analytics.date_range.last_post);
      const yearsDiff =
        (downloadedDate.getTime() - lastPostDate.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000);

      let activo = "YES";
      if (yearsDiff >= 2) {
        activo = "NO";
      } else if (yearsDiff >= 1) {
        activo = "POSSIBLE";
      }

      analytics.activo = activo;

      // Add location fields
      analytics.location = {
        country: venue.country || null,
        country_alpha2: venue.country_alpha2 || null,
        state: venue.state || null,
        city: venue.city || null,
        district: venue.district || null,
        neighbour: venue.neighbour || null,
        lat: venue.lat || null,
        lng: venue.lng || null,
        zipcode: venue.zipcode || null,
      };

      updatedCount++;
    }

    // Save updated analytics
    crearArchivo(filePath, analytics);
    processedCount++;

    // Progress logging every 100 files
    if ((index + 1) % 100 === 0 || index + 1 === scrappedVenues.length) {
      const percentage = (((index + 1) / scrappedVenues.length) * 100).toFixed(
        2
      );
      console.log(
        `Progress: ${index + 1}/${scrappedVenues.length} (${percentage}%)`
      );
    }
  });

  console.log("\n=== Summary ===");
  console.log(`Total files processed: ${processedCount}`);
  console.log(`Files updated with location data: ${updatedCount}`);
  console.log(`Files not found in drive database: ${notFoundCount}`);

  // generateGeographicAnalytics(scrappedVenuesDirPath);
}

export function generateGeographicAnalytics(scrappedVenuesDirPath: string) {
  const outputDirPath =
    "C:/Users/fnp/Documents/Artist Hive/Data/places_geo_analytics";

  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath, { recursive: true });
  }

  const scrappedVenues = fs.readdirSync(scrappedVenuesDirPath);

  // Estructura para almacenar agregados por nivel geográfico
  const geoAggregates: Record<
    string,
    Record<
      string,
      {
        venues: string[];
        total_posts: number;
        total_likes: number;
        total_comments: number;
        date_range: { first_post: string; last_post: string };
        all_tagged_accounts: Record<string, number>;
        all_hashtags: Record<string, number>;
        activity_distribution: {
          high: number;
          medium: number;
          low: number;
          inactive: number;
        };
        activo_distribution: {
          YES: number;
          POSSIBLE: number;
          NO: number;
        };
      }
    >
  > = {
    country_alpha2: {},
    state: {},
    city: {},
    district: {},
    neighbour: {},
  };

  console.log(
    `\nProcessing ${scrappedVenues.length} files for geographic analytics...`
  );

  scrappedVenues.forEach((fileName, index) => {
    if (!fileName.endsWith(".json")) return;

    const filePath = `${scrappedVenuesDirPath}/${fileName}`;
    const analytics = leerArchivo(filePath);

    // Skip if no location data
    if (!analytics.location) return;

    const location = analytics.location;
    const username = fileName.replace(".json", "");

    // Process each geographic level
    const levels = [
      { key: "country_alpha2", value: location.country_alpha2 },
      { key: "state", value: location.state },
      { key: "city", value: location.city },
      { key: "district", value: location.district },
      { key: "neighbour", value: location.neighbour },
    ];

    levels.forEach(({ key, value }) => {
      if (!value || value.trim() === "") return;

      if (!geoAggregates[key][value]) {
        geoAggregates[key][value] = {
          venues: [],
          total_posts: 0,
          total_likes: 0,
          total_comments: 0,
          date_range: { first_post: "", last_post: "" },
          all_tagged_accounts: {},
          all_hashtags: {},
          activity_distribution: {
            high: 0,
            medium: 0,
            low: 0,
            inactive: 0,
          },
          activo_distribution: {
            YES: 0,
            POSSIBLE: 0,
            NO: 0,
          },
        };
      }

      const aggregate = geoAggregates[key][value];

      // Add venue to list
      aggregate.venues.push(username);

      // Accumulate totals
      aggregate.total_posts += analytics.total_posts || 0;
      aggregate.total_likes +=
        analytics.engagement_metrics?.global?.total_likes || 0;
      aggregate.total_comments +=
        analytics.engagement_metrics?.global?.total_comments || 0;

      // Update date range
      if (
        !aggregate.date_range.first_post ||
        analytics.date_range.first_post < aggregate.date_range.first_post
      ) {
        aggregate.date_range.first_post = analytics.date_range.first_post;
      }
      if (
        !aggregate.date_range.last_post ||
        analytics.date_range.last_post > aggregate.date_range.last_post
      ) {
        aggregate.date_range.last_post = analytics.date_range.last_post;
      }

      // Aggregate tagged accounts
      if (analytics.tagged_accounts?.global) {
        analytics.tagged_accounts.global.forEach((tag: TaggedAccount) => {
          aggregate.all_tagged_accounts[tag.username] =
            (aggregate.all_tagged_accounts[tag.username] || 0) + tag.count;
        });
      }

      // Aggregate hashtags
      if (analytics.hashtags?.global) {
        analytics.hashtags.global.forEach(
          (hashtag: { tag: string; count: number }) => {
            aggregate.all_hashtags[hashtag.tag] =
              (aggregate.all_hashtags[hashtag.tag] || 0) + hashtag.count;
          }
        );
      }

      // Activity distribution
      const frequency =
        analytics.activity_metrics?.posting_frequency || "inactive";
      if (frequency in aggregate.activity_distribution) {
        aggregate.activity_distribution[
          frequency as keyof typeof aggregate.activity_distribution
        ]++;
      }

      // Activo distribution
      const activo = analytics.activo || "NO";
      if (activo in aggregate.activo_distribution) {
        aggregate.activo_distribution[
          activo as keyof typeof aggregate.activo_distribution
        ]++;
      }
    });

    // Progress logging
    if ((index + 1) % 100 === 0 || index + 1 === scrappedVenues.length) {
      const percentage = (((index + 1) / scrappedVenues.length) * 100).toFixed(
        2
      );
      console.log(
        `Progress: ${index + 1}/${scrappedVenues.length} (${percentage}%)`
      );
    }
  });

  console.log("\nGenerating geographic analytics files...");

  // Generate output files for each geographic level
  let totalFilesGenerated = 0;

  Object.entries(geoAggregates).forEach(([levelKey, levelData]) => {
    Object.entries(levelData).forEach(([locationName, aggregate]) => {
      const outputData = {
        geographic_level: levelKey,
        location_name: locationName,
        generated_at: new Date().toISOString(),
        total_venues: aggregate.venues.length,
        venues: aggregate.venues.sort(),
        total_posts: aggregate.total_posts,
        total_likes: aggregate.total_likes,
        total_comments: aggregate.total_comments,
        avg_posts_per_venue:
          Math.round((aggregate.total_posts / aggregate.venues.length) * 100) /
          100,
        avg_likes_per_venue:
          Math.round((aggregate.total_likes / aggregate.venues.length) * 100) /
          100,
        avg_comments_per_venue:
          Math.round(
            (aggregate.total_comments / aggregate.venues.length) * 100
          ) / 100,
        date_range: aggregate.date_range,
        activity_distribution: aggregate.activity_distribution,
        activo_distribution: aggregate.activo_distribution,
        top_tagged_accounts: Object.entries(aggregate.all_tagged_accounts)
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 100), // Top 100
        top_hashtags: Object.entries(aggregate.all_hashtags)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 100), // Top 100
        all_tagged_accounts: Object.entries(aggregate.all_tagged_accounts)
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count),
        all_hashtags: Object.entries(aggregate.all_hashtags)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count),
      };

      const sanitizedName = locationName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const outputFileName = `${levelKey}_${sanitizedName}.json`;
      const outputPath = `${outputDirPath}/${outputFileName}`;

      crearArchivo(outputPath, outputData);
      totalFilesGenerated++;
    });
  });

  console.log("\n=== Geographic Analytics Summary ===");
  console.log(`Total files generated: ${totalFilesGenerated}`);
  Object.entries(geoAggregates).forEach(([levelKey, levelData]) => {
    console.log(`  ${levelKey}: ${Object.keys(levelData).length} locations`);
  });
  console.log(`Output directory: ${outputDirPath}`);
}
