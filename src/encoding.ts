declare function escape(str: string): string;

export function decodeBase64UTF8(encoded: string) {
  encoded = encoded.replace(/\s/g, '');
  return decodeURIComponent(escape(atob(encoded)));
}
