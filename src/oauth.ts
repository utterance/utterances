import { UTTERANCES_API } from './utterances-api';
import { param, deparam } from './deparam';

class Token {
  private readonly storageKey = 'OAUTH_TOKEN2';
  private token: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem(this.storageKey);
      // tslint:disable-next-line:no-empty
    } catch (e) { }
  }

  get value() {
    return this.token;
  }
  set value(newValue) {
    this.token = newValue;
    try {
      if (newValue === null) {
        localStorage.removeItem(this.storageKey);
      } else {
        localStorage.setItem(this.storageKey, newValue);
      }
      // tslint:disable-next-line:no-empty
    } catch (e) { }
  }
}

export const token = new Token();

// tslint:disable-next-line:variable-name
export function login(redirect_uri: string) {
  redirect_uri = `${location.origin}/authorized.html?${param({ redirect_uri })}`;
  window.open(`${UTTERANCES_API}/authorize?${param({ redirect_uri })}`, '_top');
}

export async function completeLogin() {
  const { state, redirect_uri } = deparam(location.search.substr(1));
  const tokenUrl = `${UTTERANCES_API}/token?${param({ state })}`;
  const response = await fetch(tokenUrl, { mode: 'cors' });
  if (!response.ok) {
    token.value = null;
    const error = await response.text();
    document.body.textContent = error;
    throw new Error(error);
  }
  const data = await response.json();
  token.value = data;
  location.href = redirect_uri;
}
