export function deparam(query: string): Record<string, string> {
  let match: RegExpExecArray | null;
  const plus = /\+/g;
  const search = /([^&=]+)=?([^&]*)/g;
  const decode = (s: string) => decodeURIComponent(s.replace(plus, ' '));
  const params: Record<string, string> = {};
  // tslint:disable-next-line:no-conditional-assignment
  while (match = search.exec(query)) {
    params[decode(match[1])] = decode(match[2]);
  }
  return params;
}

export function param(obj: Record<string, string>) {
  const parts = [];
  for (const name in obj) {
    if (obj.hasOwnProperty(name) && obj[name]) {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(obj[name])}`);
    }
  }
  return parts.join('&');
}
