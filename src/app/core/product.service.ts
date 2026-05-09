import { Injectable, signal } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly products: Product[] = [
    { id: 'mobile', name: 'App Mobile PF Itaú', description: 'Aplicativo mobile para clientes PF' },
    { id: 'ib', name: 'Internet Banking PF', description: 'Portal web de internet banking PF' },
    { id: 'pj', name: 'Empresas', description: 'Produtos e serviços para clientes PJ' },
    { id: 'cards', name: 'Cartões', description: 'Jornada de cartões de crédito e débito' },
  ];

  readonly selected = signal<Product>(this.products[0]);

  select(product: Product): void {
    this.selected.set(product);
  }
}
