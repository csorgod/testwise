import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ProductService } from './core/product.service';
import { MetricService } from './core/metric.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    FormsModule, ButtonModule, SelectModule, TooltipModule, AvatarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected productService = inject(ProductService);
  protected metricService  = inject(MetricService);

  sidebarCollapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Visão Geral',       icon: 'pi-home',       route: '/',              exact: true },
    { label: 'Experimentos',      icon: 'pi-flask',       route: '/experimentos' },
    { label: 'Tendências',        icon: 'pi-chart-line',  route: '/tendencias' },
    { label: 'Lições Aprendidas', icon: 'pi-book',        route: '/licoes' },
  ];

  bottomNavItems: NavItem[] = [
    { label: 'Configurações', icon: 'pi-cog', route: '/configuracoes' },
  ];

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
