/** Central route table — always link via these constants, never string literals. */
export const ROUTES = {
  home: '/',
  pair: '/pair',
  history: '/history',
  settings: '/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
