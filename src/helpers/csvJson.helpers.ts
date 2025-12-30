import { createReadStream } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import csv from 'csv-parser';
import { parse } from 'json2csv';

export interface CsvParseOptions {
  separator?: string;
  quote?: string;
  escape?: string;
}

/**
 * Converts a delimited file (CSV/TSV) to JSON format
 * @param filePath - Path to the input delimited file
 * @param jsonFilePath - Optional path to save the JSON output. If not provided, returns the JSON data
 * @param options - Parser options (separator, quote, escape)
 * @returns Promise with the parsed JSON data
 */
export async function csvToJson<T = any>(
  filePath: string,
  jsonFilePath?: string,
  options?: CsvParseOptions
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];

    const parserOptions: any = {
      separator: options?.separator || ',',
    };

    if (options?.quote) parserOptions.quote = options.quote;
    if (options?.escape) parserOptions.escape = options.escape;

    createReadStream(filePath)
      .pipe(csv(parserOptions))
      .on('data', (data: T) => results.push(data))
      .on('end', async () => {
        try {
          if (jsonFilePath) {
            await writeFile(jsonFilePath, JSON.stringify(results, null, 2), 'utf-8');
          }
          resolve(results);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => reject(error));
  });
}

/**
 * Converts JSON data to CSV format
 * @param jsonData - JSON array to convert or path to JSON file
 * @param csvFilePath - Path to save the CSV output
 * @param options - Optional configuration for CSV generation
 * @returns Promise with the CSV string
 */
export async function jsonToCsv<T extends Record<string, any>>(
  jsonData: T[] | string,
  csvFilePath?: string,
  options?: {
    fields?: string[];
    delimiter?: string;
    quote?: string;
    header?: boolean;
  }
): Promise<string> {
  try {
    // If jsonData is a string, treat it as a file path
    let data: T[];
    if (typeof jsonData === 'string') {
      const fileContent = await readFile(jsonData, 'utf-8');
      data = JSON.parse(fileContent);
    } else {
      data = jsonData;
    }

    // Validate data is an array
    if (!Array.isArray(data)) {
      throw new Error('JSON data must be an array of objects');
    }

    if (data.length === 0) {
      throw new Error('JSON data array is empty');
    }

    // Generate CSV
    const csvString = parse(data, {
      fields: options?.fields,
      delimiter: options?.delimiter || ',',
      quote: options?.quote || '"',
      header: options?.header !== false, // Default to true
    });

    // Save to file if path is provided
    if (csvFilePath) {
      await writeFile(csvFilePath, csvString, 'utf-8');
    }

    return csvString;
  } catch (error) {
    throw new Error(`Error converting JSON to CSV: ${(error as Error).message}`);
  }
}

/**
 * Converts a delimited string (CSV/TSV) directly to JSON objects
 * @param csvString - Delimited content as string
 * @param options - Parser options (separator, quote, escape)
 * @returns Promise with the parsed JSON data
 */
export async function csvStringToJson<T = any>(
  csvString: string,
  options?: CsvParseOptions
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    const { Readable } = require('stream');

    const parserOptions: any = {
      separator: options?.separator || ',',
    };

    if (options?.quote) parserOptions.quote = options.quote;
    if (options?.escape) parserOptions.escape = options.escape;

    const stream = Readable.from([csvString]);

    stream
      .pipe(csv(parserOptions))
      .on('data', (data: T) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: Error) => reject(error));
  });
}

/**
 * Converts JSON objects directly to CSV string without file I/O
 * @param jsonData - Array of JSON objects
 * @param options - Optional configuration for CSV generation
 * @returns CSV string
 */
export function jsonArrayToCsvString<T extends Record<string, any>>(
  jsonData: T[],
  options?: {
    fields?: string[];
    delimiter?: string;
    quote?: string;
    header?: boolean;
  }
): string {
  if (!Array.isArray(jsonData)) {
    throw new Error('Input must be an array of objects');
  }

  if (jsonData.length === 0) {
    return '';
  }

  return parse(jsonData, {
    fields: options?.fields,
    delimiter: options?.delimiter || ',',
    quote: options?.quote || '"',
    header: options?.header !== false,
  });
}

// ============================================
// TSV-specific functions (Tab-Separated Values)
// ============================================

/**
 * Converts a TSV file to JSON format
 * @param tsvFilePath - Path to the input TSV file
 * @param jsonFilePath - Optional path to save the JSON output
 * @returns Promise with the parsed JSON data
 */
export async function tsvToJson<T = any>(
  tsvFilePath: string,
  jsonFilePath?: string
): Promise<T[]> {
  return csvToJson<T>(tsvFilePath, jsonFilePath, { separator: '\t' });
}

/**
 * Converts JSON data to TSV format
 * @param jsonData - JSON array to convert or path to JSON file
 * @param tsvFilePath - Optional path to save the TSV output
 * @param options - Optional configuration (fields, quote, header)
 * @returns Promise with the TSV string
 */
export async function jsonToTsv<T extends Record<string, any>>(
  jsonData: T[] | string,
  tsvFilePath?: string,
  options?: {
    fields?: string[];
    quote?: string;
    header?: boolean;
  }
): Promise<string> {
  return jsonToCsv(jsonData, tsvFilePath, {
    ...options,
    delimiter: '\t',
  });
}

/**
 * Converts a TSV string directly to JSON objects
 * @param tsvString - TSV content as string
 * @returns Promise with the parsed JSON data
 */
export async function tsvStringToJson<T = any>(tsvString: string): Promise<T[]> {
  return csvStringToJson<T>(tsvString, { separator: '\t' });
}

/**
 * Converts JSON objects directly to TSV string without file I/O
 * @param jsonData - Array of JSON objects
 * @param options - Optional configuration (fields, quote, header)
 * @returns TSV string
 */
export function jsonArrayToTsvString<T extends Record<string, any>>(
  jsonData: T[],
  options?: {
    fields?: string[];
    quote?: string;
    header?: boolean;
  }
): string {
  return jsonArrayToCsvString(jsonData, {
    ...options,
    delimiter: '\t',
  });
}
