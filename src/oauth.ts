import { param, deparam } from './deparam';

const authorizeUri = 'https://github.com/login/oauth/authorize';
const tokenUri = 'https://utterances-oauth.herokuapp.com/access-token';
// tslint:disable-next-line:variable-name
const redirect_uri = 'https://utteranc.es/authorized.html';
// tslint:disable-next-line:variable-name
const client_id = '1a560753410b181458de';
const scopes = 'public_repo';

class Token {
  private readonly storageKey = 'OAUTH_TOKEN';
  get value() {
    return localStorage.getItem(this.storageKey);
  }
  set value(newValue) {
    if (newValue === null) {
      localStorage.removeItem(this.storageKey);
    } else {
      localStorage.setItem(this.storageKey, newValue);
    }
  }
}

export const token = new Token();

interface AuthorizeResponse {
  code: string;
  state: string;
}

function popup(url: string) {
  let resolve: (response: AuthorizeResponse) => void;
  (window as any).resolveOpenWindow = (query: string) => {
    (window as any).resolveOpenWindow = null;
    resolve(deparam(query) as any);
  };
  const promise = new Promise<AuthorizeResponse>(r => resolve = r);
  window.open(url);
  return promise;
}

function requestAuthorizationCode() {
  const args = {
    client_id,
    redirect_uri,
    scope: scopes,
    state: Math.floor(Math.random() * 100000).toString()
  };
  const url = `${authorizeUri}?${param(args)}`;
  return popup(url)
    .then(result => {
      if (!(result.code && result.state)) {
        throw new Error('Redirect did not include code and state parameters.');
      }
      if (result.state !== args.state) {
        throw new Error('State mismatch.');
      }
      return result;
    });
}

function requestAccessToken({ code, state }: AuthorizeResponse) {
  const args = { code, state };
  const url = `${tokenUri}?${param(args)}`;
  return fetch(url)
    .then<{ access_token: string; }>(response => response.json());
}

export function login() {
  return requestAuthorizationCode()
    .then(response => requestAccessToken(response))
    .then(({ access_token }) => token.value = access_token)
    .catch(reason => {
      token.value = null;
      throw reason;
    });
}
