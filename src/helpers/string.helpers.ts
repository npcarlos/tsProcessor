const he = require("he");

export function cleanHtmlToString(html: string): string {
  // Eliminar todas las etiquetas HTML
  let text = html.replace(/<[^>]*>/g, " ");

  // Reemplazar <br> y <p> con saltos de línea
  text = text.replace(/(\<br\s*\/?\>|\<\/p\>|\<p\>)/g, "\n");

  // Eliminar espacios múltiples y trim
  text = text.replace(/\s+/g, " ").trim();

  text = he.decode(text);

  return text;
}
