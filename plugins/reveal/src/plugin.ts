import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const revealPlugin = createPlugin({
  id: 'reveal',
  routes: {
    root: rootRouteRef,
  },
});

export const RevealPage = revealPlugin.provide(
  createRoutableExtension({
    name: 'RevealPage',
    component: () =>
      import('./components/RevealPage').then(m => m.default),
    mountPoint: rootRouteRef,
  }),
);
