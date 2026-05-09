import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductService } from '../../core/product.service';
import { MetricService } from '../../core/metric.service';

interface Kpi {
  label: string;
  value: string;
  trend: string;
  positive: boolean;
  icon: string;
  accent: string;
}

interface Insight {
  category: string;
  title: string;
  description: string;
  impact: 'Alto' | 'Médio' | 'Baixo';
  experiment: string;
  icon: string;
}

interface MetricKpiData {
  experimentos: string; expTrend:  string;
  taxaSucesso:  string; taxaTrend: string;
  hipoteses:    string; hipTrend:  string;
  impacto:      string; impTrend:  string;
}

interface ImpactConfig {
  labels:      string[];
  values:      number[];
  baseline:    number;
  experiments: (string | null)[];
  gains:       (string | null)[];
  totalGain:   string;
  formatY:     (v: number) => string;
}

// [productId][metricId][periodoId]
type DataMap = Record<string, Record<string, Record<string, MetricKpiData>>>;
// [metricId][periodoId]
type ImpactMap = Record<string, Record<string, ImpactConfig>>;

@Component({
  selector: 'app-visao-geral',
  imports: [FormsModule, ChartModule, TagModule, SkeletonModule],
  templateUrl: './visao-geral.component.html',
  styleUrl: './visao-geral.component.scss',
})
export class VisaoGeralComponent {
  private productService = inject(ProductService);
  private metricService  = inject(MetricService);

  productName = computed(() => this.productService.selected().name);
  metricName  = computed(() => this.metricService.selected().name);

  loading = signal(true);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  selectedPeriodo = signal('30d');

  periodos = [
    { label: '30 dias',  value: '30d'  },
    { label: '90 dias',  value: '90d'  },
    { label: '180 dias', value: '180d' },
  ];

  constructor() {
    effect(() => {
      this.productService.selected();
      this.metricService.selected();
      this.selectedPeriodo();
      if (this.loadingTimer) clearTimeout(this.loadingTimer);
      this.loading.set(true);
      this.loadingTimer = setTimeout(() => this.loading.set(false), 650);
    }, { allowSignalWrites: true });
  }

  // ── KPI data (produto × métrica × período) ────────────────
  private dataMap: DataMap = {
    mobile: {
      faturamento: {
        '30d':  { experimentos: '12', expTrend: '+3 este mês',   taxaSucesso: '68%', taxaTrend: '+5 p.p. vs. mês ant.',  hipoteses:  '47', hipTrend: '+8 no período',    impacto: 'R$ 2,3M',    impTrend: '+R$ 400K vs. mês ant.'   },
        '90d':  { experimentos: '12', expTrend: '+8 este trim.', taxaSucesso: '69%', taxaTrend: '+6 p.p. vs. trim. ant.', hipoteses: '118', hipTrend: '+22 no trimestre', impacto: 'R$ 6,4M',    impTrend: '+R$ 1,1M vs. trim. ant.'  },
        '180d': { experimentos: '12', expTrend: '+14 este sem.', taxaSucesso: '68%', taxaTrend: '+7 p.p. vs. sem. ant.',  hipoteses: '225', hipTrend: '+41 no semestre',  impacto: 'R$ 12,9M',   impTrend: '+R$ 2,2M vs. sem. ant.'   },
      },
      conversao: {
        '30d':  { experimentos:  '9', expTrend: '+2 este mês',   taxaSucesso: '61%', taxaTrend: '+3 p.p. vs. mês ant.',  hipoteses:  '38', hipTrend: '+5 no período',    impacto: '+4,2 p.p.',  impTrend: '+0,8 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '9', expTrend: '+6 este trim.', taxaSucesso: '62%', taxaTrend: '+4 p.p. vs. trim. ant.', hipoteses:  '95', hipTrend: '+14 no trimestre', impacto: '+11,8 p.p.', impTrend: '+2,2 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '9', expTrend: '+11 este sem.', taxaSucesso: '61%', taxaTrend: '+5 p.p. vs. sem. ant.',  hipoteses: '183', hipTrend: '+27 no semestre',  impacto: '+21,4 p.p.', impTrend: '+4,1 p.p. vs. sem. ant.'  },
      },
      sessoes: {
        '30d':  { experimentos:  '7', expTrend: '+1 este mês',   taxaSucesso: '74%', taxaTrend: '+7 p.p. vs. mês ant.',  hipoteses:  '29', hipTrend: '+4 no período',    impacto: '+18K sessões',  impTrend: '+3K sessões vs. mês ant.'   },
        '90d':  { experimentos:  '7', expTrend: '+4 este trim.', taxaSucesso: '73%', taxaTrend: '+8 p.p. vs. trim. ant.', hipoteses:  '73', hipTrend: '+10 no trimestre', impacto: '+51K sessões',  impTrend: '+9K sessões vs. trim. ant.'  },
        '180d': { experimentos:  '7', expTrend: '+8 este sem.',  taxaSucesso: '74%', taxaTrend: '+9 p.p. vs. sem. ant.',  hipoteses: '140', hipTrend: '+19 no semestre',  impacto: '+98K sessões',  impTrend: '+18K sessões vs. sem. ant.'  },
      },
      nps: {
        '30d':  { experimentos:  '5', expTrend: 'estável',       taxaSucesso: '55%', taxaTrend: '+2 p.p. vs. mês ant.',  hipoteses:  '21', hipTrend: '+2 no período',    impacto: '+12 pontos', impTrend: '+3 pontos vs. mês ant.'   },
        '90d':  { experimentos:  '5', expTrend: '+2 este trim.', taxaSucesso: '56%', taxaTrend: '+3 p.p. vs. trim. ant.', hipoteses:  '53', hipTrend: '+6 no trimestre',  impacto: '+34 pontos', impTrend: '+8 pontos vs. trim. ant.'  },
        '180d': { experimentos:  '5', expTrend: '+4 este sem.',  taxaSucesso: '55%', taxaTrend: '+4 p.p. vs. sem. ant.',  hipoteses: '101', hipTrend: '+11 no semestre',  impacto: '+65 pontos', impTrend: '+14 pontos vs. sem. ant.'  },
      },
      churn: {
        '30d':  { experimentos:  '4', expTrend: '+1 este mês',   taxaSucesso: '63%', taxaTrend: '+4 p.p. vs. mês ant.',  hipoteses:  '15', hipTrend: '+3 no período',    impacto: '-1,8 p.p.',  impTrend: '-0,3 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '4', expTrend: '+3 este trim.', taxaSucesso: '64%', taxaTrend: '+5 p.p. vs. trim. ant.', hipoteses:  '38', hipTrend: '+8 no trimestre',  impacto: '-5,0 p.p.',  impTrend: '-0,9 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '4', expTrend: '+5 este sem.',  taxaSucesso: '63%', taxaTrend: '+6 p.p. vs. sem. ant.',  hipoteses:  '72', hipTrend: '+14 no semestre',  impacto: '-9,6 p.p.',  impTrend: '-1,7 p.p. vs. sem. ant.'  },
      },
    },
    ib: {
      faturamento: {
        '30d':  { experimentos:  '8', expTrend: '+2 este mês',   taxaSucesso: '71%', taxaTrend: '+4 p.p. vs. mês ant.',  hipoteses:  '34', hipTrend: '+6 no período',    impacto: 'R$ 1,7M',    impTrend: '+R$ 290K vs. mês ant.'   },
        '90d':  { experimentos:  '8', expTrend: '+5 este trim.', taxaSucesso: '72%', taxaTrend: '+5 p.p. vs. trim. ant.', hipoteses:  '85', hipTrend: '+15 no trimestre', impacto: 'R$ 4,7M',    impTrend: '+R$ 820K vs. trim. ant.'  },
        '180d': { experimentos:  '8', expTrend: '+9 este sem.',  taxaSucesso: '71%', taxaTrend: '+6 p.p. vs. sem. ant.',  hipoteses: '163', hipTrend: '+29 no semestre',  impacto: 'R$ 9,1M',    impTrend: '+R$ 1,6M vs. sem. ant.'   },
      },
      conversao: {
        '30d':  { experimentos:  '6', expTrend: '+1 este mês',   taxaSucesso: '58%', taxaTrend: '+2 p.p. vs. mês ant.',  hipoteses:  '26', hipTrend: '+3 no período',    impacto: '+3,1 p.p.',  impTrend: '+0,5 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '6', expTrend: '+4 este trim.', taxaSucesso: '59%', taxaTrend: '+3 p.p. vs. trim. ant.', hipoteses:  '65', hipTrend: '+9 no trimestre',  impacto: '+8,7 p.p.',  impTrend: '+1,6 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '6', expTrend: '+7 este sem.',  taxaSucesso: '58%', taxaTrend: '+4 p.p. vs. sem. ant.',  hipoteses: '125', hipTrend: '+17 no semestre',  impacto: '+15,8 p.p.', impTrend: '+2,9 p.p. vs. sem. ant.'  },
      },
      sessoes: {
        '30d':  { experimentos:  '5', expTrend: 'estável',       taxaSucesso: '66%', taxaTrend: '+5 p.p. vs. mês ant.',  hipoteses:  '18', hipTrend: '+2 no período',    impacto: '+9K sessões',   impTrend: '+1,5K sessões vs. mês ant.'  },
        '90d':  { experimentos:  '5', expTrend: '+2 este trim.', taxaSucesso: '67%', taxaTrend: '+6 p.p. vs. trim. ant.', hipoteses:  '45', hipTrend: '+6 no trimestre',  impacto: '+26K sessões',  impTrend: '+4,5K sessões vs. trim. ant.' },
        '180d': { experimentos:  '5', expTrend: '+4 este sem.',  taxaSucesso: '66%', taxaTrend: '+7 p.p. vs. sem. ant.',  hipoteses:  '87', hipTrend: '+11 no semestre',  impacto: '+50K sessões',  impTrend: '+8K sessões vs. sem. ant.'   },
      },
      nps: {
        '30d':  { experimentos:  '4', expTrend: '+1 este mês',   taxaSucesso: '49%', taxaTrend: '+1 p.p. vs. mês ant.',  hipoteses:  '14', hipTrend: '+1 no período',    impacto: '+8 pontos',  impTrend: '+2 pontos vs. mês ant.'   },
        '90d':  { experimentos:  '4', expTrend: '+2 este trim.', taxaSucesso: '50%', taxaTrend: '+2 p.p. vs. trim. ant.', hipoteses:  '35', hipTrend: '+4 no trimestre',  impacto: '+22 pontos', impTrend: '+5 pontos vs. trim. ant.'  },
        '180d': { experimentos:  '4', expTrend: '+3 este sem.',  taxaSucesso: '49%', taxaTrend: '+3 p.p. vs. sem. ant.',  hipoteses:  '67', hipTrend: '+7 no semestre',   impacto: '+43 pontos', impTrend: '+10 pontos vs. sem. ant.'  },
      },
      churn: {
        '30d':  { experimentos:  '3', expTrend: 'estável',       taxaSucesso: '57%', taxaTrend: '+3 p.p. vs. mês ant.',  hipoteses:  '11', hipTrend: '+2 no período',    impacto: '-1,2 p.p.',  impTrend: '-0,2 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '3', expTrend: '+1 este trim.', taxaSucesso: '58%', taxaTrend: '+4 p.p. vs. trim. ant.', hipoteses:  '28', hipTrend: '+5 no trimestre',  impacto: '-3,3 p.p.',  impTrend: '-0,6 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '3', expTrend: '+2 este sem.',  taxaSucesso: '57%', taxaTrend: '+5 p.p. vs. sem. ant.',  hipoteses:  '53', hipTrend: '+9 no semestre',   impacto: '-6,4 p.p.',  impTrend: '-1,1 p.p. vs. sem. ant.'  },
      },
    },
    pj: {
      faturamento: {
        '30d':  { experimentos:  '5', expTrend: '+1 este mês',   taxaSucesso: '76%', taxaTrend: '+6 p.p. vs. mês ant.',  hipoteses:  '22', hipTrend: '+4 no período',    impacto: 'R$ 4,8M',    impTrend: '+R$ 1,1M vs. mês ant.'   },
        '90d':  { experimentos:  '5', expTrend: '+3 este trim.', taxaSucesso: '77%', taxaTrend: '+7 p.p. vs. trim. ant.', hipoteses:  '55', hipTrend: '+10 no trimestre', impacto: 'R$ 13,5M',   impTrend: '+R$ 3,1M vs. trim. ant.'  },
        '180d': { experimentos:  '5', expTrend: '+5 este sem.',  taxaSucesso: '76%', taxaTrend: '+8 p.p. vs. sem. ant.',  hipoteses: '106', hipTrend: '+19 no semestre',  impacto: 'R$ 26,0M',   impTrend: '+R$ 5,9M vs. sem. ant.'   },
      },
      conversao: {
        '30d':  { experimentos:  '4', expTrend: 'estável',       taxaSucesso: '67%', taxaTrend: '+4 p.p. vs. mês ant.',  hipoteses:  '17', hipTrend: '+2 no período',    impacto: '+2,4 p.p.',  impTrend: '+0,6 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '4', expTrend: '+2 este trim.', taxaSucesso: '68%', taxaTrend: '+5 p.p. vs. trim. ant.', hipoteses:  '43', hipTrend: '+6 no trimestre',  impacto: '+6,7 p.p.',  impTrend: '+1,6 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '4', expTrend: '+3 este sem.',  taxaSucesso: '67%', taxaTrend: '+6 p.p. vs. sem. ant.',  hipoteses:  '82', hipTrend: '+11 no semestre',  impacto: '+12,9 p.p.', impTrend: '+3,1 p.p. vs. sem. ant.'  },
      },
      sessoes: {
        '30d':  { experimentos:  '3', expTrend: '+1 este mês',   taxaSucesso: '61%', taxaTrend: '+3 p.p. vs. mês ant.',  hipoteses:  '10', hipTrend: '+1 no período',    impacto: '+4K sessões',   impTrend: '+800 sessões vs. mês ant.'  },
        '90d':  { experimentos:  '3', expTrend: '+2 este trim.', taxaSucesso: '62%', taxaTrend: '+4 p.p. vs. trim. ant.', hipoteses:  '25', hipTrend: '+3 no trimestre',  impacto: '+11K sessões',  impTrend: '+2,2K sessões vs. trim. ant.' },
        '180d': { experimentos:  '3', expTrend: '+3 este sem.',  taxaSucesso: '61%', taxaTrend: '+5 p.p. vs. sem. ant.',  hipoteses:  '48', hipTrend: '+6 no semestre',   impacto: '+21K sessões',  impTrend: '+4K sessões vs. sem. ant.'   },
      },
      nps: {
        '30d':  { experimentos:  '3', expTrend: 'estável',       taxaSucesso: '52%', taxaTrend: '+2 p.p. vs. mês ant.',  hipoteses:   '8', hipTrend: '+1 no período',    impacto: '+6 pontos',  impTrend: '+2 pontos vs. mês ant.'   },
        '90d':  { experimentos:  '3', expTrend: '+1 este trim.', taxaSucesso: '53%', taxaTrend: '+3 p.p. vs. trim. ant.', hipoteses:  '20', hipTrend: '+2 no trimestre',  impacto: '+17 pontos', impTrend: '+4 pontos vs. trim. ant.'  },
        '180d': { experimentos:  '3', expTrend: '+2 este sem.',  taxaSucesso: '52%', taxaTrend: '+4 p.p. vs. sem. ant.',  hipoteses:  '38', hipTrend: '+4 no semestre',   impacto: '+32 pontos', impTrend: '+8 pontos vs. sem. ant.'   },
      },
      churn: {
        '30d':  { experimentos:  '2', expTrend: 'estável',       taxaSucesso: '70%', taxaTrend: '+5 p.p. vs. mês ant.',  hipoteses:   '6', hipTrend: '+1 no período',    impacto: '-0,9 p.p.',  impTrend: '-0,2 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '2', expTrend: '+1 este trim.', taxaSucesso: '71%', taxaTrend: '+6 p.p. vs. trim. ant.', hipoteses:  '15', hipTrend: '+2 no trimestre',  impacto: '-2,5 p.p.',  impTrend: '-0,5 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '2', expTrend: '+2 este sem.',  taxaSucesso: '70%', taxaTrend: '+7 p.p. vs. sem. ant.',  hipoteses:  '29', hipTrend: '+4 no semestre',   impacto: '-4,8 p.p.',  impTrend: '-0,9 p.p. vs. sem. ant.'  },
      },
    },
    cards: {
      faturamento: {
        '30d':  { experimentos: '10', expTrend: '+2 este mês',   taxaSucesso: '63%', taxaTrend: '+3 p.p. vs. mês ant.',  hipoteses:  '41', hipTrend: '+7 no período',    impacto: 'R$ 3,1M',    impTrend: '+R$ 620K vs. mês ant.'   },
        '90d':  { experimentos: '10', expTrend: '+6 este trim.', taxaSucesso: '64%', taxaTrend: '+4 p.p. vs. trim. ant.', hipoteses: '103', hipTrend: '+18 no trimestre', impacto: 'R$ 8,7M',    impTrend: '+R$ 1,7M vs. trim. ant.'  },
        '180d': { experimentos: '10', expTrend: '+11 este sem.', taxaSucesso: '63%', taxaTrend: '+5 p.p. vs. sem. ant.',  hipoteses: '197', hipTrend: '+35 no semestre',  impacto: 'R$ 16,7M',   impTrend: '+R$ 3,3M vs. sem. ant.'   },
      },
      conversao: {
        '30d':  { experimentos:  '8', expTrend: '+3 este mês',   taxaSucesso: '72%', taxaTrend: '+6 p.p. vs. mês ant.',  hipoteses:  '35', hipTrend: '+6 no período',    impacto: '+5,8 p.p.',  impTrend: '+1,2 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '8', expTrend: '+8 este trim.', taxaSucesso: '73%', taxaTrend: '+7 p.p. vs. trim. ant.', hipoteses:  '88', hipTrend: '+15 no trimestre', impacto: '+16,3 p.p.', impTrend: '+3,4 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '8', expTrend: '+14 este sem.', taxaSucesso: '72%', taxaTrend: '+8 p.p. vs. sem. ant.',  hipoteses: '168', hipTrend: '+29 no semestre',  impacto: '+31,3 p.p.', impTrend: '+6,5 p.p. vs. sem. ant.'  },
      },
      sessoes: {
        '30d':  { experimentos:  '6', expTrend: '+1 este mês',   taxaSucesso: '69%', taxaTrend: '+5 p.p. vs. mês ant.',  hipoteses:  '22', hipTrend: '+3 no período',    impacto: '+12K sessões',  impTrend: '+2K sessões vs. mês ant.'   },
        '90d':  { experimentos:  '6', expTrend: '+4 este trim.', taxaSucesso: '70%', taxaTrend: '+6 p.p. vs. trim. ant.', hipoteses:  '55', hipTrend: '+8 no trimestre',  impacto: '+34K sessões',  impTrend: '+6K sessões vs. trim. ant.'  },
        '180d': { experimentos:  '6', expTrend: '+7 este sem.',  taxaSucesso: '69%', taxaTrend: '+7 p.p. vs. sem. ant.',  hipoteses: '106', hipTrend: '+15 no semestre',  impacto: '+65K sessões',  impTrend: '+11K sessões vs. sem. ant.'  },
      },
      nps: {
        '30d':  { experimentos:  '4', expTrend: '+1 este mês',   taxaSucesso: '58%', taxaTrend: '+3 p.p. vs. mês ant.',  hipoteses:  '16', hipTrend: '+2 no período',    impacto: '+9 pontos',  impTrend: '+2 pontos vs. mês ant.'   },
        '90d':  { experimentos:  '4', expTrend: '+3 este trim.', taxaSucesso: '59%', taxaTrend: '+4 p.p. vs. trim. ant.', hipoteses:  '40', hipTrend: '+6 no trimestre',  impacto: '+25 pontos', impTrend: '+6 pontos vs. trim. ant.'  },
        '180d': { experimentos:  '4', expTrend: '+5 este sem.',  taxaSucesso: '58%', taxaTrend: '+5 p.p. vs. sem. ant.',  hipoteses:  '77', hipTrend: '+11 no semestre',  impacto: '+48 pontos', impTrend: '+12 pontos vs. sem. ant.'  },
      },
      churn: {
        '30d':  { experimentos:  '5', expTrend: '+2 este mês',   taxaSucesso: '65%', taxaTrend: '+4 p.p. vs. mês ant.',  hipoteses:  '19', hipTrend: '+4 no período',    impacto: '-2,1 p.p.',  impTrend: '-0,4 p.p. vs. mês ant.'  },
        '90d':  { experimentos:  '5', expTrend: '+5 este trim.', taxaSucesso: '66%', taxaTrend: '+5 p.p. vs. trim. ant.', hipoteses:  '48', hipTrend: '+10 no trimestre', impacto: '-5,9 p.p.',  impTrend: '-1,1 p.p. vs. trim. ant.' },
        '180d': { experimentos:  '5', expTrend: '+9 este sem.',  taxaSucesso: '65%', taxaTrend: '+6 p.p. vs. sem. ant.',  hipoteses:  '91', hipTrend: '+19 no semestre',  impacto: '-11,3 p.p.', impTrend: '-2,1 p.p. vs. sem. ant.'  },
      },
    },
  };

  kpis = computed<Kpi[]>(() => {
    const d = this.dataMap[this.productService.selected().id]
                          [this.metricService.selected().id]
                          [this.selectedPeriodo()];
    return [
      { label: 'Experimentos Ativos', value: d.experimentos, trend: d.expTrend,  positive: !d.expTrend.startsWith('estável'), icon: 'pi-flask',        accent: 'orange' },
      { label: 'Taxa de Sucesso',     value: d.taxaSucesso,  trend: d.taxaTrend, positive: true,                              icon: 'pi-chart-bar',    accent: 'blue'   },
      { label: 'Hipóteses Testadas',  value: d.hipoteses,    trend: d.hipTrend,  positive: true,                              icon: 'pi-check-circle', accent: 'green'  },
      { label: 'Impacto Estimado',    value: d.impacto,      trend: d.impTrend,  positive: true,                              icon: 'pi-wallet',       accent: 'yellow' },
    ];
  });

  // ── Escada de Impacto Acumulado (métrica × período) ────────
  private impactMap: ImpactMap = {
    faturamento: {
      '30d': {
        labels:      ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        values:      [20.4,    20.4,    20.8,    21.2],
        baseline:    20.4,
        experiments: [null,    null,    'CTA Color Test',    'Copy Personalizado'],
        gains:       [null,    null,    '+R$ 0,4M',          '+R$ 0,4M'],
        totalGain:   '+R$ 0,8M acumulados',
        formatY:     v => `R$ ${Number(v).toFixed(1).replace('.', ',')}M`,
      },
      '90d': {
        labels:      ['Mar',  'Abr',   'Mai'],
        values:      [19.8,   20.4,    21.2],
        baseline:    19.8,
        experiments: [null,   'Checkout Flow', 'Copy Personalizado'],
        gains:       [null,   '+R$ 0,6M',      '+R$ 0,8M'],
        totalGain:   '+R$ 1,4M acumulados',
        formatY:     v => `R$ ${Number(v).toFixed(1).replace('.', ',')}M`,
      },
      '180d': {
        labels:      ['Dez',  'Jan',  'Fev',               'Mar',                 'Abr',            'Mai'],
        values:      [18.5,   18.5,   19.1,                19.8,                  20.4,             21.2],
        baseline:    18.5,
        experiments: [null,   null,   'Hero Image A/B',    'Form Simplification', 'Checkout Flow',  'Copy Personalizado'],
        gains:       [null,   null,   '+R$ 0,6M',          '+R$ 0,7M',            '+R$ 0,6M',       '+R$ 0,8M'],
        totalGain:   '+R$ 2,7M acumulados',
        formatY:     v => `R$ ${Number(v).toFixed(1).replace('.', ',')}M`,
      },
    },
    conversao: {
      '30d': {
        labels:      ['Sem 1', 'Sem 2', 'Sem 3',           'Sem 4'],
        values:      [3.1,     3.1,     3.5,               3.9],
        baseline:    3.1,
        experiments: [null,    null,    'CTA Color Test v2', 'Button Shape A/B'],
        gains:       [null,    null,    '+0,4 p.p.',         '+0,4 p.p.'],
        totalGain:   '+0,8 p.p. acumulados',
        formatY:     v => `${Number(v).toFixed(1).replace('.', ',')}%`,
      },
      '90d': {
        labels:      ['Mar', 'Abr',          'Mai'],
        values:      [2.9,   3.1,            3.9],
        baseline:    2.9,
        experiments: [null,  'Copy Tone A/B', 'CTA Color Test'],
        gains:       [null,  '+0,2 p.p.',     '+0,8 p.p.'],
        totalGain:   '+1,0 p.p. acumulados',
        formatY:     v => `${Number(v).toFixed(1).replace('.', ',')}%`,
      },
      '180d': {
        labels:      ['Dez', 'Jan', 'Fev',            'Mar',                 'Abr',           'Mai'],
        values:      [2.1,   2.1,   2.4,              2.9,                   3.1,             3.9],
        baseline:    2.1,
        experiments: [null,  null,  'Hero Image A/B', 'Form Simplification', 'Copy Tone A/B', 'CTA Color Test'],
        gains:       [null,  null,  '+0,3 p.p.',      '+0,5 p.p.',           '+0,2 p.p.',     '+0,8 p.p.'],
        totalGain:   '+1,8 p.p. acumulados',
        formatY:     v => `${Number(v).toFixed(1).replace('.', ',')}%`,
      },
    },
    sessoes: {
      '30d': {
        labels:      ['Sem 1', 'Sem 2', 'Sem 3',             'Sem 4'],
        values:      [140,     140,     145,                  149],
        baseline:    140,
        experiments: [null,    null,    'Push Campaign A/B',  'Hero Image A/B'],
        gains:       [null,    null,    '+5K sessões',        '+4K sessões'],
        totalGain:   '+9K sessões acumuladas',
        formatY:     v => `${Number(v)}K`,
      },
      '90d': {
        labels:      ['Mar', 'Abr',             'Mai'],
        values:      [134,   140,               149],
        baseline:    134,
        experiments: [null,  'Onboarding Flow', 'Hero Image A/B'],
        gains:       [null,  '+6K sessões',     '+9K sessões'],
        totalGain:   '+15K sessões acumuladas',
        formatY:     v => `${Number(v)}K`,
      },
      '180d': {
        labels:      ['Dez', 'Jan', 'Fev',           'Mar',               'Abr',             'Mai'],
        values:      [120,   120,   128,              134,                 140,               149],
        baseline:    120,
        experiments: [null,  null,  'Copy Tone A/B', 'Push Notification', 'Onboarding Flow', 'Hero Image A/B'],
        gains:       [null,  null,  '+8K sessões',   '+6K sessões',       '+6K sessões',     '+9K sessões'],
        totalGain:   '+29K sessões acumuladas',
        formatY:     v => `${Number(v)}K`,
      },
    },
    nps: {
      '30d': {
        labels:      ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        values:      [41,      41,      41,       44],
        baseline:    41,
        experiments: [null,    null,    null,     'Feedback Tone'],
        gains:       [null,    null,    null,     '+3 pontos'],
        totalGain:   '+3 pontos acumulados',
        formatY:     v => `${Number(v)} pts`,
      },
      '90d': {
        labels:      ['Mar', 'Abr',               'Mai'],
        values:      [38,    41,                  44],
        baseline:    38,
        experiments: [null,  'Rating Screen A/B', 'Feedback Tone'],
        gains:       [null,  '+3 pontos',         '+3 pontos'],
        totalGain:   '+6 pontos acumulados',
        formatY:     v => `${Number(v)} pts`,
      },
      '180d': {
        labels:      ['Dez', 'Jan', 'Fev',               'Mar',              'Abr',               'Mai'],
        values:      [32,    32,    35,                   38,                 41,                  44],
        baseline:    32,
        experiments: [null,  null,  'Suporte Chat A/B',  'NPS Follow-up',    'Rating Screen A/B', 'Feedback Tone'],
        gains:       [null,  null,  '+3 pontos',         '+3 pontos',        '+3 pontos',         '+3 pontos'],
        totalGain:   '+12 pontos acumulados',
        formatY:     v => `${Number(v)} pts`,
      },
    },
    churn: {
      '30d': {
        labels:      ['Sem 1', 'Sem 2', 'Sem 3',              'Sem 4'],
        values:      [4.2,     4.2,     4.0,                  3.9],
        baseline:    4.2,
        experiments: [null,    null,    'Pricing Display A/B', 'Win-back SMS'],
        gains:       [null,    null,    '-0,2 p.p.',           '-0,1 p.p.'],
        totalGain:   '-0,3 p.p. acumulados',
        formatY:     v => `${Number(v).toFixed(1).replace('.', ',')}%`,
      },
      '90d': {
        labels:      ['Mar', 'Abr',               'Mai'],
        values:      [4.5,   4.2,                 3.9],
        baseline:    4.5,
        experiments: [null,  'Win-back Campaign', 'Pricing Display'],
        gains:       [null,  '-0,3 p.p.',         '-0,3 p.p.'],
        totalGain:   '-0,6 p.p. acumulados',
        formatY:     v => `${Number(v).toFixed(1).replace('.', ',')}%`,
      },
      '180d': {
        labels:      ['Dez', 'Jan', 'Fev',               'Mar',                  'Abr',               'Mai'],
        values:      [5.2,   5.2,   4.9,                 4.5,                    4.2,                 3.9],
        baseline:    5.2,
        experiments: [null,  null,  'Retention Flow A/B', 'Cancellation Survey', 'Win-back Campaign', 'Pricing Display'],
        gains:       [null,  null,  '-0,3 p.p.',          '-0,4 p.p.',           '-0,3 p.p.',         '-0,3 p.p.'],
        totalGain:   '-1,3 p.p. acumulados',
        formatY:     v => `${Number(v).toFixed(1).replace('.', ',')}%`,
      },
    },
  };

  impactChartData = computed(() => {
    const cfg = this.impactMap[this.metricService.selected().id][this.selectedPeriodo()];
    return {
      labels: cfg.labels,
      datasets: [
        {
          label: 'Baseline inicial',
          data: cfg.labels.map(() => cfg.baseline),
          borderColor: '#d1d5db',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0,
          stepped: false,
          order: 2,
        },
        {
          label: this.metricName(),
          data: cfg.values,
          stepped: 'before',
          fill: true,
          backgroundColor: 'rgba(255, 98, 0, 0.1)',
          borderColor: '#FF6200',
          borderWidth: 2.5,
          pointRadius: cfg.experiments.map((exp, i) => i === 0 ? 5 : exp !== null ? 7 : 0),
          pointBackgroundColor: '#FF6200',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 9,
          tension: 0,
          order: 1,
        },
      ],
    };
  });

  impactChartOptions = computed(() => {
    const cfg = this.impactMap[this.metricService.selected().id][this.selectedPeriodo()];
    const allVals = [cfg.baseline, ...cfg.values];
    const span = Math.max(...allVals) - Math.min(...allVals);
    const pad  = span > 0 ? span * 0.3 : Math.abs(cfg.baseline) * 0.05;
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, font: { family: "'Open Sans', sans-serif", size: 12 } },
        },
        tooltip: {
          callbacks: {
            afterBody: (items: any[]) => {
              const i = items[0]?.dataIndex;
              if (i == null || !cfg.experiments[i]) return [];
              return [`Experimento: ${cfg.experiments[i]}`, `Ganho: ${cfg.gains[i]}`];
            },
          },
          padding: 12,
          bodySpacing: 4,
        },
      },
      scales: {
        y: {
          min: Math.min(...allVals) - pad,
          max: Math.max(...allVals) + pad,
          grid: { color: '#f3f4f6' },
          ticks: {
            font: { family: "'Open Sans', sans-serif", size: 11 },
            callback: (v: number) => cfg.formatY(v),
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Open Sans', sans-serif", size: 12 } },
        },
      },
    };
  });

  impactTotalGain = computed(() =>
    this.impactMap[this.metricService.selected().id][this.selectedPeriodo()].totalGain
  );

  // ── Insights ──────────────────────────────────────────────
  insights: Insight[] = [
    {
      category: 'UX',
      title: 'Imagem humana aumenta CTR em 34%',
      description: 'Variações com fotos de pessoas reais no hero geraram significativamente mais cliques no CTA principal do que ilustrações.',
      impact: 'Alto',
      experiment: 'Hero Image A/B Test',
      icon: 'pi-users',
    },
    {
      category: 'Formulários',
      title: 'Menos campos, mais conversão',
      description: 'Reduzir de 6 para 3 campos no formulário de abertura de conta aumentou a taxa de conclusão em 22%.',
      impact: 'Alto',
      experiment: 'Form Simplification v2',
      icon: 'pi-file-edit',
    },
    {
      category: 'Copywriting',
      title: 'Voz ativa melhora engajamento',
      description: 'Textos em primeira pessoa do plural aumentaram o tempo de sessão em 18% nas telas de produto.',
      impact: 'Médio',
      experiment: 'Copy Tone A/B',
      icon: 'pi-pen-to-square',
    },
  ];

  impactSeverity(impact: Insight['impact']): 'danger' | 'warn' | 'info' {
    return ({ Alto: 'danger', Médio: 'warn', Baixo: 'info' } as const)[impact];
  }
}
