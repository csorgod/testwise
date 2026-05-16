import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { StepperModule } from 'primeng/stepper';
import { ProductService, Product } from '../../core/product.service';
import { MetricService } from '../../core/metric.service';

interface Variante {
  nome: string;
  descricao: string;
  params: { key: string; value: string }[];
  imageFile: File | null;
  imagePreview: string | null;
}

@Component({
  selector: 'app-criar-experimento',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule, InputTextModule, TextareaModule, SelectModule,
    InputNumberModule, SliderModule, DatePickerModule, TooltipModule,
    TagModule, StepperModule, DatePipe, DecimalPipe,
  ],
  templateUrl: './criar-experimento.component.html',
  styleUrl: './criar-experimento.component.scss',
})
export class CriarExperimentoComponent {
  private readonly router = inject(Router);
  readonly productService = inject(ProductService);
  readonly metricService = inject(MetricService);

  // ── Stepper ───────────────────────────────────────────────
  activeStep = 1;

  // ── Step 1: Identificação ─────────────────────────────────
  nome = '';
  hipotese = '';
  sigla = '';
  produto: Product = this.productService.selected();
  subproduto = '';

  // Estrutura organizacional
  readonly comunidade = 'Ferramentas JIP';
  readonly rt = 'Experimentação com testes A/B';
  squad = '';

  // ── Step 1: Item de trabalho ──────────────────────────────
  tipoItemTrabalho: 'feature' | 'historia' | '' = '';
  itemTrabalho = '';

  // ── Step 2: Configuração do Teste ─────────────────────────
  dataInicio: Date | null = null;
  audiencia = 100;
  nVariantes = 2;
  trafficSplit: number[] = [50, 50];

  // ── Step 3: Variantes ─────────────────────────────────────
  variantes: Variante[] = [
    { nome: 'Controle (A)', descricao: '', params: [], imageFile: null, imagePreview: null },
    { nome: 'Variante (B)', descricao: '', params: [], imageFile: null, imagePreview: null },
  ];

  // ── Step 4: Métricas ──────────────────────────────────────
  metricasSucesso: string[] = [];
  metricasGuardrail: string[] = [];
  metricasSecundarias: string[] = [];

  // ── Step 5: Calculadora de amostra ───────────────────────
  baselineRate = 5;      // Taxa de conversão base (%)
  mde = 20;              // Efeito mínimo detectável relativo (%)
  confianca = '95';      // Nível de confiança (%)
  poder = '80';          // Poder estatístico (%)
  usuariosPorDia: number | null = null;

  saving = signal(false);

  // ── Options ───────────────────────────────────────────────
  readonly tipoItemOptions = [
    { label: 'Feature', value: 'feature' },
    { label: 'História', value: 'historia' },
  ];

  private readonly allItensTrabalho = [
    { label: 'FT-1042 – Novo fluxo de onboarding mobile', value: 'FT-1042', tipo: 'feature' },
    { label: 'FT-1078 – Redesign do checkout Pix', value: 'FT-1078', tipo: 'feature' },
    { label: 'FT-1103 – Dashboard de investimentos v2', value: 'FT-1103', tipo: 'feature' },
    { label: 'FT-1115 – Biometria facial no login', value: 'FT-1115', tipo: 'feature' },
    { label: 'FT-1130 – Simulador de crédito imobiliário', value: 'FT-1130', tipo: 'feature' },
    { label: 'FT-1147 – Notificações push personalizadas', value: 'FT-1147', tipo: 'feature' },
    { label: 'HI-2201 – Exibir saldo estimado na home', value: 'HI-2201', tipo: 'historia' },
    { label: 'HI-2215 – Botão de confirmação no Pix', value: 'HI-2215', tipo: 'historia' },
    { label: 'HI-2233 – Ordenação de extrato por categoria', value: 'HI-2233', tipo: 'historia' },
    { label: 'HI-2249 – Tooltip de limite no cartão', value: 'HI-2249', tipo: 'historia' },
    { label: 'HI-2267 – Banner de cashback na fatura', value: 'HI-2267', tipo: 'historia' },
    { label: 'HI-2281 – Agendamento de TED pela home', value: 'HI-2281', tipo: 'historia' },
  ];

  get itensTrabalhoOptions() {
    if (!this.tipoItemTrabalho) return this.allItensTrabalho;
    return this.allItensTrabalho.filter(i => i.tipo === this.tipoItemTrabalho);
  }

  onTipoItemChange(): void {
    this.itemTrabalho = '';
  }

  readonly squadOptions = [
    { label: 'Métricas e monitoramento', value: 'Métricas e monitoramento' },
    { label: 'Plataforma de experimentação', value: 'Plataforma de experimentação' },
  ];

  readonly siglaOptions = [
    { label: 'HP6', value: 'HP6' },
    { label: 'NF2', value: 'NF2' },
    { label: 'OQ6', value: 'OQ6' },
  ];
  readonly variantLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  readonly variantColors = [
    '#fb923c', '#f48937', '#ee8031', '#e7772c', '#e16e26',
    '#da6521', '#d45c1b', '#cd5316', '#c74a10', '#c2410c',
  ];

  readonly subprodutoMap: Record<string, string[]> = {
    mobile: ['Pix & Transferências', 'Cartões', 'Investimentos', 'Empréstimos', 'Seguros', 'Câmbio', 'Consórcio', 'Crédito Imobiliário'],
    ib:     ['Investimentos', 'Folha de Pagamento', 'Câmbio', 'Crédito Empresarial', 'Cobrança', 'Trade Finance', 'Seguros Corporativos', 'Conta Corrente'],
    pj:     ['Gestão de Pagamentos', 'Capital de Giro', 'Conta PJ', 'Folha de Pagamento', 'Cobrança Digital', 'Câmbio', 'Cartões PJ', 'Investimentos PJ'],
    cards:  ['Cartão de Crédito', 'Programa de Pontos', 'Cartão Virtual', 'Crédito Rotativo', 'Seguros de Cartão', 'Antecipação de Parcelas', 'Cartão Pré-pago', 'Cashback'],
  };

  get subprodutoOptions() {
    return (this.subprodutoMap[this.produto?.id] ?? []).map(s => ({ label: s, value: s }));
  }

  get trafficSum() {
    return this.trafficSplit.reduce((a, b) => a + b, 0);
  }

  get step1Valid() { return !!(this.nome.trim() && this.hipotese.trim()); }
  get step2Valid()  { return this.trafficSum === 100; }
  get step3Valid()  { return this.variantes.every(v => v.nome.trim() && v.descricao.trim()); }
  get step4Valid()  { return this.metricasSucesso.length > 0; }
  get step5Valid()  { return !!(this.poder && this.confianca && this.baselineRate > 0 && this.mde > 0); }

  readonly confiancaOptions = [
    { label: '90%', desc: 'exploratório', value: '90' },
    { label: '95%', desc: 'padrão',       value: '95' },
    { label: '99%', desc: 'rigoroso',     value: '99' },
  ];

  readonly poderOptions = [
    { label: '70%', desc: 'mínimo',    value: '70' },
    { label: '80%', desc: 'padrão',    value: '80' },
    { label: '90%', desc: 'alto',      value: '90' },
    { label: '95%', desc: 'muito alto',value: '95' },
  ];

  // ── Tabelas de z-scores ───────────────────────────────────
  private readonly zAlphaMap: Record<string, number> = {
    '90': 1.645, '95': 1.960, '99': 2.576,
  };
  private readonly zBetaMap: Record<string, number> = {
    '70': 0.524, '80': 0.842, '90': 1.282, '95': 1.645,
  };

  // ── Calculadora de amostra ────────────────────────────────
  get targetRate(): number {
    return this.baselineRate * (1 + this.mde / 100);
  }

  get calculatedSamplePerVariant(): number | null {
    const p1 = this.baselineRate / 100;
    const p2 = this.targetRate / 100;
    if (p2 <= 0 || p2 >= 1 || p1 <= 0 || this.mde <= 0) return null;
    const za = this.zAlphaMap[this.confianca];
    const zb = this.zBetaMap[this.poder];
    if (!za || !zb) return null;
    const delta = p2 - p1;
    const variance = p1 * (1 - p1) + p2 * (1 - p2);
    return Math.ceil(Math.pow(za + zb, 2) * variance / Math.pow(delta, 2));
  }

  get calculatedTotalUsers(): number | null {
    const n = this.calculatedSamplePerVariant;
    return n ? n * this.nVariantes : null;
  }

  get calculatedDays(): number | null {
    if (!this.usuariosPorDia || !this.calculatedTotalUsers) return null;
    const effectivePerDay = this.usuariosPorDia * (this.audiencia / 100);
    return Math.ceil(this.calculatedTotalUsers / effectivePerDay);
  }

  // ── Step 2 helpers ────────────────────────────────────────
  onNVariantesChange(n: number): void {
    this.nVariantes = n;
    const even = Math.floor(100 / n);
    const rem = 100 - even * n;
    this.trafficSplit = Array.from({ length: n }, (_, i) => even + (i === 0 ? rem : 0));
    while (this.variantes.length < n) {
      const lbl = this.variantLabels[this.variantes.length];
      this.variantes.push({ nome: `Variante (${lbl})`, descricao: '', params: [], imageFile: null, imagePreview: null });
    }
    this.variantes = this.variantes.slice(0, n);
  }

  distribuirIgualmente(): void {
    const n = this.nVariantes;
    const even = Math.floor(100 / n);
    const rem = 100 - even * n;
    this.trafficSplit = Array.from({ length: n }, (_, i) => even + (i === 0 ? rem : 0));
  }

  onTrafficChange(index: number, value: number): void {
    this.trafficSplit[index] = Math.max(1, Math.min(98, value ?? 1));
  }

  // ── Step 3 helpers ────────────────────────────────────────
  addParam(v: Variante): void { v.params.push({ key: '', value: '' }); }
  removeParam(v: Variante, i: number): void { v.params.splice(i, 1); }

  onImageSelect(event: Event, v: Variante): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    v.imageFile = file;
    const reader = new FileReader();
    reader.onload = e => v.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeImage(v: Variante): void { v.imageFile = null; v.imagePreview = null; }

  // ── Step 4 helpers ────────────────────────────────────────
  isMetricaSucesso(id: string)    { return this.metricasSucesso.includes(id); }
  isMetricaGuardrail(id: string)  { return this.metricasGuardrail.includes(id); }
  isMetricaSecundaria(id: string) { return this.metricasSecundarias.includes(id); }

  toggleMetrica(list: string[], id: string): string[] {
    const idx = list.indexOf(id);
    return idx >= 0 ? list.filter(x => x !== id) : [...list, id];
  }

  getMetricName(id: string) {
    return this.metricService.metrics.find(m => m.id === id)?.name ?? id;
  }

  getMetricCategory(id: string) {
    return this.metricService.metrics.find(m => m.id === id)?.category ?? '';
  }

  // ── Navigation ────────────────────────────────────────────
  goBack(): void { this.router.navigate(['/experimentos']); }

  salvar(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.router.navigate(['/experimentos']);
    }, 1200);
  }
}
