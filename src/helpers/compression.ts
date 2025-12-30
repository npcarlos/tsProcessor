import * as zlib from "zlib";
import { promisify } from "util";

const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

const compressionOptions: zlib.BrotliOptions = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Máxima compresión
  },
};

export async function compressJSON(obj: any): Promise<string> {
  const jsonString = JSON.stringify(obj);
  const compressed = await brotliCompress(
    Buffer.from(jsonString) as any,
    compressionOptions
  );
  return (compressed as Buffer).toString("base64");
}

export async function decompressJSON(compressed: string): Promise<any> {
  const buffer = Buffer.from(compressed, "base64");
  const decompressed = await brotliDecompress(buffer as any);
  return JSON.parse((decompressed as Buffer).toString());
}
