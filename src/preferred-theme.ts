export const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'github-dark'
  : 'github-light';

export const preferredThemeId = 'preferred-color-scheme';