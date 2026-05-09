import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

const ItauPreset = definePreset(Aura, {
  primitive: {
    fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif",
  },
  semantic: {
    primary: {
      50:  '{orange.50}',
      100: '{orange.100}',
      200: '{orange.200}',
      300: '{orange.300}',
      400: '{orange.400}',
      500: '#FF6200',
      600: '#e55700',
      700: '#cc4e00',
      800: '#a33e00',
      900: '#7a2f00',
      950: '#521f00',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#FF6200',
          inverseColor: '#ffffff',
          hoverColor: '#e55700',
          activeColor: '#cc4e00',
        },
        highlight: {
          background: '#FF6200',
          focusBackground: '#e55700',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
      dark: {
        primary: {
          color: '#FF6200',
          inverseColor: '#ffffff',
          hoverColor: '#ff7a26',
          activeColor: '#ff8c3d',
        },
        highlight: {
          background: '#FF6200',
          focusBackground: '#ff7a26',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: ItauPreset,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    }),
  ],
};
