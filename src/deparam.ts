export function deparam(query: string): { [name: string]: string; } {
  let match: RegExpExecArray | null;
  const plus = /\+/g;
  const search = /([^&=]+)=?([^&]*)/g;
  const decode = (s: string) => decodeURIComponent(s.replace(plus, ' '));
  const params: { [name: string]: string; } = {};
  // tslint:disable-next-line:no-conditional-assignment
  while (match = search.exec(query)) {
    params[decode(match[1])] = decode(match[2]);
  }
  return params;
}

export function param(obj: any) {
  const parts = [];
  for (const name in obj) {
    if (obj.hasOwnProperty(name)) {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(obj[name])}`);
    }
  }
  return parts.join('&');
}
