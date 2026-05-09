import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/visao-geral/visao-geral.component').then(m => m.VisaoGeralComponent),
  },
  {
    path: 'memoria-produto',
    loadComponent: () =>
      import('./pages/memoria-produto/memoria-produto.component').then(m => m.MemoriaProdutoComponent),
  },
];
