import { Injectable, signal } from '@angular/core';

export interface Metric {
  id: string;
  name: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class MetricService {
  readonly metrics: Metric[] = [
    { id: 'faturamento', name: 'Faturamento',       category: 'Financeira'  },
    { id: 'conversao',   name: 'Taxa de Conversão', category: 'Conversão'   },
    { id: 'sessoes',     name: 'Sessões Ativas',    category: 'Engajamento' },
    { id: 'nps',         name: 'NPS',               category: 'Satisfação'  },
    { id: 'churn',       name: 'Churn Rate',        category: 'Retenção'    },
  ];

  readonly selected = signal<Metric>(this.metrics[0]);

  select(metric: Metric): void {
    this.selected.set(metric);
  }
}
