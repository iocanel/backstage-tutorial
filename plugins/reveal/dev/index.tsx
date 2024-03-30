import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { revealPlugin, RevealPage } from '../src/plugin';

createDevApp()
  .registerPlugin(revealPlugin)
  .addPage({
    element: <RevealPage />,
    title: 'Root Page',
    path: '/reveal',
  })
  .render();
