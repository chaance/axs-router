import { createContext } from 'react';

function createNamedContext(name, defaultValue) {
  const Ctx = createContext(defaultValue);
  Ctx.Consumer.displayName = `${name}.Consumer`;
  Ctx.Provider.displayName = `${name}.Provider`;
  return Ctx;
}

// Sets baseuri and basepath for nested routers and links
export const BaseContext = createNamedContext('Base', {
  baseuri: '/',
  basepath: '/',
});

export const FocusContext = createNamedContext('Focus');

export const LocationContext = createNamedContext('Location');
