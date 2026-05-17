import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

interface Param { key: string; value: string; }

interface InterimLook {
  lookNumber: number;
  targetSamplePct: number;
  scheduledDate: string;
  completedDate?: string;
  zScore?: number;
  upperBound: number;
  lowerBound: number;
  decision: 'pending' | 'continue' | 'stop-success' | 'stop-futility';
}

interface SequentialTestData {
  nLooks: number;
  alpha: number;
  interimLooks: InterimLook[];
  currentDecision: 'continue' | 'stop-success' | 'stop-futility';
}

interface VarianteDetalhe {
  label: string;
  nome: string;
  descricao: string;
  params: Param[];
  trafficPct: number;
  color: string;
}

interface VarianteExposicao {
  label: string;
  count: number;
  color: string;
  trafficPct: number;
}

interface EventoFeed {
  data: string;
  tipo: 'info' | 'success' | 'warning' | 'milestone';
  titulo: string;
  descricao?: string;
}

interface ProjecaoLook {
  lookNumber: number;
  probabilidade: number;
  dataEstimada: string;
}

interface ProjecaoEncerramento {
  usuariosPorDia: number;
  diasRestantesProjetados: number;
  dataProjetada: string;
  diffDiasEstimativa: number; // negativo = adiantado, positivo = atrasado
  looksProjecao: ProjecaoLook[];
}

interface StatResult {
  varianteLabel: string;
  varianteNome: string;
  color: string;
  conversionRate: number;
  liftAbsoluto: number;
  liftRelativo: number;
  ciLower: number;
  ciUpper: number;
  pValor: number;
  status: 'vencedor' | 'perdedor' | 'inconclusivo';
}

interface MetricaStatus {
  nome: string;
  tipo: 'sucesso' | 'guardrail' | 'secundaria';
  status: 'ok' | 'warning' | 'neutral';
  variacao: string;
  descricao: string;
}

interface ResultadoData {
  dataEncerramento: string;
  duracaoReal: number;
  usuariosTotais: number;
  veredito: 'vencedor' | 'inconclusivo' | 'futilidade';
  varianteVencedora?: string;
  liftFinal?: number;
  liftRelativoFinal?: number;
  pValorFinal?: number;
  ciLowerFinal?: number;
  ciUpperFinal?: number;
  confidencia: number;
  resumoExecutivo: string;
  recomendacao: 'rollout' | 'descartar' | 'investigar';
  lookFinalNumber?: number;
}

interface AcompanhamentoData {
  diasDecorridos: number;
  dataEstimadaFim: string;
  usuariosExpostos: number;
  taxaControle: number;
  porVariante: VarianteExposicao[];
  doubleBucketing: number;
  timeLabels: string[];
  conversionRates: { label: string; color: string; data: number[] }[];
  statResults: StatResult[];
  metricasStatus: MetricaStatus[];
  eventos: EventoFeed[];
  projecao: ProjecaoEncerramento;
}

interface ExperimentoDetalhe {
  id: string;
  nome: string;
  hipotese: string;
  status: 'Em andamento' | 'Concluído' | 'Pausado';
  resultado?: 'Vencedor' | 'Perdedor' | 'Inconclusivo';
  comunidade: string;
  rt: string;
  squad: string;
  sigla: string;
  produto: string;
  subproduto: string;
  tipoItem: string;
  itemTrabalho: string;
  dataInicio: string;
  audiencia: number;
  trafficSplit: number[];
  variantes: VarianteDetalhe[];
  metricasSucesso: string[];
  metricasGuardrail: string[];
  metricasSecundarias: string[];
  baselineRate: number;
  mde: number;
  confianca: number;
  poder: number;
  samplePerVariant: number;
  totalUsers: number;
  diasEstimados: number | null;
  acompanhamento?: AcompanhamentoData;
  sequentialTest?: SequentialTestData;
  resultadoData?: ResultadoData;
}

const MOCK_EXPERIMENTOS: ExperimentoDetalhe[] = [
  {
    id: 'm1',
    nome: 'PIX Turbo — confirmação em 1 etapa para contatos frequentes',
    hipotese: 'Eliminar a etapa de revisão para contatos com histórico de transações reduz o abandono sem impactar a percepção de segurança.',
    status: 'Concluído',
    resultado: 'Vencedor',
    comunidade: 'Ferramentas JIP',
    rt: 'Experimentação com testes A/B',
    squad: 'Plataforma de experimentação',
    sigla: 'HP6',
    produto: 'Mobile',
    subproduto: 'Pix & Transferências',
    tipoItem: 'Feature',
    itemTrabalho: 'FT-1078 – Redesign do checkout Pix',
    dataInicio: '01/05/2026',
    audiencia: 80,
    trafficSplit: [50, 50],
    variantes: [
      { label: 'A', nome: 'Controle (A)', descricao: 'Fluxo padrão de confirmação com etapa de revisão antes do envio.', params: [{ key: 'skip_review', value: 'false' }], trafficPct: 50, color: '#fb923c' },
      { label: 'B', nome: 'Variante (B)', descricao: 'Fluxo sem etapa de revisão para contatos com mais de 3 transações nos últimos 30 dias.', params: [{ key: 'skip_review', value: 'true' }, { key: 'min_transactions', value: '3' }], trafficPct: 50, color: '#3b82f6' },
    ],
    metricasSucesso: ['conversion_rate'],
    metricasGuardrail: ['nps_score'],
    metricasSecundarias: ['session_duration', 'error_rate'],
    baselineRate: 5,
    mde: 20,
    confianca: 95,
    poder: 80,
    samplePerVariant: 3842,
    totalUsers: 7684,
    diasEstimados: 14,
    acompanhamento: {
      diasDecorridos: 8,
      dataEstimadaFim: '15/05/2026',
      usuariosExpostos: 4812,
      porVariante: [
        { label: 'A', count: 2394, color: '#fb923c', trafficPct: 50 },
        { label: 'B', count: 2418, color: '#3b82f6', trafficPct: 50 },
      ],
      taxaControle: 5.1,
      doubleBucketing: 0,
      timeLabels: ['01/05', '02/05', '03/05', '04/05', '05/05', '06/05', '07/05', '08/05'],
      conversionRates: [
        { label: 'Controle (A)', color: '#fb923c', data: [4.2, 4.8, 4.9, 5.1, 5.0, 5.2, 5.1, 5.1] },
        { label: 'Variante (B)', color: '#3b82f6', data: [5.1, 5.6, 5.9, 6.1, 6.0, 6.2, 6.3, 6.2] },
      ],
      statResults: [
        { varianteLabel: 'B', varianteNome: 'Variante (B)', color: '#3b82f6', conversionRate: 6.3, liftAbsoluto: 1.2, liftRelativo: 23.5, ciLower: 0.2, ciUpper: 2.2, pValor: 0.031, status: 'vencedor' },
      ],
      metricasStatus: [
        { nome: 'conversion_rate', tipo: 'sucesso',    status: 'ok',      variacao: '+21.6%', descricao: 'Melhoria observada na variante B' },
        { nome: 'nps_score',       tipo: 'guardrail',  status: 'ok',      variacao: '-0.2%',  descricao: 'Dentro do intervalo esperado' },
        { nome: 'session_duration',tipo: 'secundaria', status: 'neutral', variacao: '+2.1%',  descricao: 'Leve melhoria, sem significância' },
        { nome: 'error_rate',      tipo: 'secundaria', status: 'ok',      variacao: '+0.1%',  descricao: 'Sem degradação detectada' },
      ],
      eventos: [
        { data: '12/05/2026', tipo: 'success',   titulo: 'Experimento encerrado — Variante B vencedora', descricao: 'Look 3 completado com Z-score 2,51 — acima da fronteira de sucesso (2,34). Experimento encerrado antecipadamente com 75% da amostra coletada.' },
        { data: '08/05/2026', tipo: 'milestone', titulo: 'Look 2 concluído',              descricao: 'Z-score: 1.87 — abaixo da fronteira (2.86). Decisão: continuar.' },
        { data: '07/05/2026', tipo: 'info',      titulo: '60% da amostra coletada',       descricao: '4.610 de 7.684 usuários necessários já foram expostos.' },
        { data: '05/05/2026', tipo: 'info',      titulo: 'Efeito novidade dissipado',     descricao: 'Experimento com mais de 3 dias de dados — resultados mais confiáveis.' },
        { data: '04/05/2026', tipo: 'milestone', titulo: 'Look 1 concluído',              descricao: 'Z-score: 1.52 — abaixo da fronteira (4.05). Decisão: continuar.' },
        { data: '02/05/2026', tipo: 'success',   titulo: 'Primeiros usuários expostos',  descricao: 'Experimento ativo e distribuindo tráfego normalmente.' },
        { data: '01/05/2026', tipo: 'milestone', titulo: 'Experimento iniciado',          descricao: 'PIX Turbo — confirmação em 1 etapa para contatos frequentes.' },
      ],
      projecao: {
        usuariosPorDia: 602,
        diasRestantesProjetados: 5,
        dataProjetada: '13/05/2026',
        diffDiasEstimativa: -2,
        looksProjecao: [
          { lookNumber: 3, probabilidade: 38, dataEstimada: '12/05/2026' },
          { lookNumber: 4, probabilidade: 61, dataEstimada: '13/05/2026' },
        ],
      },
    },
    sequentialTest: {
      nLooks: 4,
      alpha: 0.05,
      interimLooks: [
        { lookNumber: 1, targetSamplePct: 25, scheduledDate: '04/05/2026', completedDate: '04/05/2026', zScore: 1.52, upperBound: 4.05, lowerBound: -0.48, decision: 'continue' },
        { lookNumber: 2, targetSamplePct: 50, scheduledDate: '08/05/2026', completedDate: '08/05/2026', zScore: 1.87, upperBound: 2.86, lowerBound: -0.48, decision: 'continue' },
        { lookNumber: 3, targetSamplePct: 75, scheduledDate: '12/05/2026', completedDate: '12/05/2026', zScore: 2.51, upperBound: 2.34, lowerBound: -0.77, decision: 'stop-success' },
        { lookNumber: 4, targetSamplePct: 100, scheduledDate: '15/05/2026', upperBound: 2.03, lowerBound: -1.02, decision: 'pending' },
      ],
      currentDecision: 'stop-success',
    },
    resultadoData: {
      dataEncerramento: '12/05/2026',
      duracaoReal: 11,
      usuariosTotais: 5763,
      veredito: 'vencedor',
      varianteVencedora: 'B',
      liftFinal: 1.2,
      liftRelativoFinal: 23.5,
      pValorFinal: 0.031,
      ciLowerFinal: 0.2,
      ciUpperFinal: 2.2,
      confidencia: 95,
      resumoExecutivo: 'Remover a etapa de confirmação no envio de PIX para contatos frequentes aumentou em 23,5% a taxa de transações concluídas com sucesso. O resultado foi consistente ao longo de todo o experimento e atingido antes do prazo previsto, indicando que o efeito é real e sustentável. A satisfação dos clientes não foi impactada negativamente. Recomendamos expandir essa experiência para 100% da base de usuários.',
      recomendacao: 'rollout',
      lookFinalNumber: 3,
    },
  },
  {
    id: 'm2',
    nome: 'Home personalizada por padrão de uso — v2',
    hipotese: 'Adaptar o layout da home ao comportamento histórico do usuário aumenta a taxa de sessões com ação relevante.',
    status: 'Em andamento',
    comunidade: 'Ferramentas JIP',
    rt: 'Experimentação com testes A/B',
    squad: 'Métricas e monitoramento',
    sigla: 'NF2',
    produto: 'Mobile',
    subproduto: 'Investimentos',
    tipoItem: 'História',
    itemTrabalho: 'HI-2201 – Exibir saldo estimado na home',
    dataInicio: '15/04/2026',
    audiencia: 100,
    trafficSplit: [34, 33, 33],
    variantes: [
      { label: 'A', nome: 'Controle (A)', descricao: 'Home padrão sem personalização.', params: [], trafficPct: 34, color: '#fb923c' },
      { label: 'B', nome: 'Variante (B)', descricao: 'Home com módulos reordenados por frequência de uso.', params: [{ key: 'layout', value: 'frequency' }], trafficPct: 33, color: '#3b82f6' },
      { label: 'C', nome: 'Variante (C)', descricao: 'Home com módulos reordenados por valor financeiro das ações.', params: [{ key: 'layout', value: 'value' }], trafficPct: 33, color: '#8b5cf6' },
    ],
    metricasSucesso: ['session_duration'],
    metricasGuardrail: ['error_rate'],
    metricasSecundarias: ['conversion_rate'],
    baselineRate: 8,
    mde: 15,
    confianca: 95,
    poder: 80,
    samplePerVariant: 5210,
    totalUsers: 15630,
    diasEstimados: 21,
    acompanhamento: {
      diasDecorridos: 12,
      dataEstimadaFim: '06/05/2026',
      usuariosExpostos: 9126,
      porVariante: [
        { label: 'A', count: 3108, color: '#fb923c', trafficPct: 34 },
        { label: 'B', count: 3012, color: '#3b82f6', trafficPct: 33 },
        { label: 'C', count: 3006, color: '#8b5cf6', trafficPct: 33 },
      ],
      taxaControle: 8.1,
      doubleBucketing: 28,
      timeLabels: ['15/04', '16/04', '17/04', '18/04', '19/04', '20/04', '21/04', '22/04', '23/04', '24/04', '25/04', '26/04'],
      conversionRates: [
        { label: 'Controle (A)', color: '#fb923c', data: [7.2, 7.8, 8.1, 8.0, 8.2, 8.1, 8.3, 8.1, 8.0, 8.2, 8.1, 8.1] },
        { label: 'Variante (B)', color: '#3b82f6', data: [8.3, 8.7, 9.0, 8.9, 9.1, 9.0, 9.2, 9.1, 9.0, 9.1, 9.0, 9.0] },
        { label: 'Variante (C)', color: '#8b5cf6', data: [7.8, 8.2, 8.4, 8.5, 8.4, 8.6, 8.5, 8.4, 8.5, 8.4, 8.5, 8.5] },
      ],
      statResults: [
        { varianteLabel: 'B', varianteNome: 'Variante (B)', color: '#3b82f6', conversionRate: 9.0, liftAbsoluto: 0.9, liftRelativo: 11.1, ciLower: -0.1, ciUpper: 1.9, pValor: 0.084, status: 'inconclusivo' },
        { varianteLabel: 'C', varianteNome: 'Variante (C)', color: '#8b5cf6', conversionRate: 8.5, liftAbsoluto: 0.4, liftRelativo:  4.9, ciLower: -0.5, ciUpper: 1.3, pValor: 0.379, status: 'inconclusivo' },
      ],
      metricasStatus: [
        { nome: 'session_duration', tipo: 'sucesso',    status: 'ok',      variacao: '+11.1%', descricao: 'Melhoria observada na variante B' },
        { nome: 'error_rate',       tipo: 'guardrail',  status: 'warning', variacao: '+8.2%',  descricao: 'Aumento acima do esperado — monitorar' },
        { nome: 'conversion_rate',  tipo: 'secundaria', status: 'neutral', variacao: '+5.3%',  descricao: 'Tendência positiva, sem significância' },
      ],
      eventos: [
        { data: '03/05/2026', tipo: 'warning',   titulo: 'error_rate acima do esperado',    descricao: 'Variante B registrou +8.2% na taxa de erro. Guardrail em monitoramento.' },
        { data: '29/04/2026', tipo: 'milestone', titulo: 'Look 2 concluído',                descricao: 'Z-score: 1.72 — abaixo da fronteira (2.86). Decisão: continuar.' },
        { data: '26/04/2026', tipo: 'warning',   titulo: 'Double-bucketing detectado',      descricao: '28 usuários atribuídos a mais de uma variante. Taxa: 0.31% — monitorar.' },
        { data: '22/04/2026', tipo: 'milestone', titulo: 'Look 1 concluído',                descricao: 'Z-score: 1.44 — abaixo da fronteira (4.05). Decisão: continuar.' },
        { data: '18/04/2026', tipo: 'info',      titulo: 'Efeito novidade dissipado',       descricao: 'Experimento com mais de 3 dias de dados — resultados mais confiáveis.' },
        { data: '16/04/2026', tipo: 'success',   titulo: 'Primeiros usuários expostos',     descricao: 'Experimento ativo e distribuindo tráfego normalmente.' },
        { data: '15/04/2026', tipo: 'milestone', titulo: 'Experimento iniciado',            descricao: 'Home personalizada por padrão de uso — v2.' },
      ],
      projecao: {
        usuariosPorDia: 761,
        diasRestantesProjetados: 9,
        dataProjetada: '06/05/2026',
        diffDiasEstimativa: 0,
        looksProjecao: [
          { lookNumber: 3, probabilidade: 24, dataEstimada: '30/04/2026' },
          { lookNumber: 4, probabilidade: 45, dataEstimada: '06/05/2026' },
        ],
      },
    },
    sequentialTest: {
      nLooks: 4,
      alpha: 0.05,
      interimLooks: [
        { lookNumber: 1, targetSamplePct: 25, scheduledDate: '22/04/2026', completedDate: '22/04/2026', zScore: 1.44, upperBound: 4.05, lowerBound: -0.48, decision: 'continue' },
        { lookNumber: 2, targetSamplePct: 50, scheduledDate: '29/04/2026', completedDate: '29/04/2026', zScore: 1.72, upperBound: 2.86, lowerBound: -0.48, decision: 'continue' },
        { lookNumber: 3, targetSamplePct: 75, scheduledDate: '06/05/2026', upperBound: 2.34, lowerBound: -0.77, decision: 'pending' },
        { lookNumber: 4, targetSamplePct: 100, scheduledDate: '06/05/2026', upperBound: 2.03, lowerBound: -1.02, decision: 'pending' },
      ],
      currentDecision: 'continue',
    },
  },
];

@Component({
  selector: 'app-detalhe-experimento',
  standalone: true,
  imports: [TabsModule, TagModule, ButtonModule, TooltipModule, DecimalPipe, ChartModule, Menu],
  templateUrl: './detalhe-experimento.component.html',
  styleUrl: './detalhe-experimento.component.scss',
})
export class DetalheExperimentoComponent {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);

  activeTab = 'detalhes';

  readonly experimento = computed<ExperimentoDetalhe | null>(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return MOCK_EXPERIMENTOS.find(e => e.id === id) ?? null;
  });

  readonly acompanhamento = computed(() => this.experimento()?.acompanhamento ?? null);

  readonly progressPct = computed(() => {
    const exp = this.experimento();
    const ac  = this.acompanhamento();
    if (!exp || !ac || !exp.diasEstimados) return 0;
    return Math.min(Math.round(ac.diasDecorridos / exp.diasEstimados * 100), 100);
  });

  readonly samplePct = computed(() => {
    const exp = this.experimento();
    const ac  = this.acompanhamento();
    if (!exp || !ac) return 0;
    return Math.min(Math.round(ac.usuariosExpostos / exp.totalUsers * 100), 100);
  });

  readonly sampleReached = computed(() => this.samplePct() >= 100);

  readonly noveltyWarning = computed(() => {
    const ac = this.acompanhamento();
    return ac ? ac.diasDecorridos < 3 : false;
  });

  readonly isReceivingUsers = computed(() => this.experimento()?.status === 'Em andamento');

  readonly doubleBucketingStatus = computed<'ok' | 'warning'>(() => {
    const ac = this.acompanhamento();
    if (!ac || ac.usuariosExpostos === 0) return 'ok';
    const rate = ac.doubleBucketing / ac.usuariosExpostos;
    return rate > 0.001 ? 'warning' : 'ok';
  });

  readonly doubleBucketingRate = computed(() => {
    const ac = this.acompanhamento();
    if (!ac || ac.usuariosExpostos === 0) return '0';
    return ((ac.doubleBucketing / ac.usuariosExpostos) * 100).toFixed(2);
  });

  readonly projecao       = computed(() => this.acompanhamento()?.projecao       ?? null);
  readonly statResults    = computed(() => this.acompanhamento()?.statResults    ?? []);
  readonly metricasStatus = computed(() => this.acompanhamento()?.metricasStatus ?? []);
  readonly eventos        = computed(() => this.acompanhamento()?.eventos        ?? []);

  feedExpanded = false;

  readonly seqTest = computed(() => this.experimento()?.sequentialTest ?? null);
  readonly seqDecision = computed(() => this.seqTest()?.currentDecision ?? 'continue');

  readonly decisaoMenuItems: MenuItem[] = [
    { label: 'Expandir',        icon: 'pi pi-arrow-up-right', styleClass: 'decisao-item--green' },
    { label: 'Manter atual',    icon: 'pi pi-minus-circle',   styleClass: 'decisao-item--amber' },
    { label: 'Explorar opções', icon: 'pi pi-sparkles',       styleClass: 'decisao-item--blue'  },
  ];

  readonly resultadoData = computed(() => this.experimento()?.resultadoData ?? null);
  readonly vencedoraVariante = computed(() => {
    const rd = this.resultadoData();
    if (!rd?.varianteVencedora) return null;
    return this.experimento()?.variantes.find(v => v.label === rd.varianteVencedora) ?? null;
  });

  readonly seqChartData = computed(() => {
    const seq = this.seqTest();
    if (!seq) return null;
    return {
      labels: seq.interimLooks.map(l => `Look ${l.lookNumber} (${l.targetSamplePct}%)`),
      datasets: [
        {
          label: 'Z-score observado',
          data: seq.interimLooks.map(l => l.zScore ?? null),
          borderColor: '#fb923c',
          backgroundColor: '#fb923c33',
          fill: false,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2,
          spanGaps: false,
        },
        {
          label: 'Fronteira superior (sucesso)',
          data: seq.interimLooks.map(l => l.upperBound),
          borderColor: '#16a34a',
          borderDash: [6, 4],
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          pointRadius: 0,
          borderWidth: 1.5,
          fill: 'end',
          tension: 0,
        },
        {
          label: 'Fronteira inferior (futilidade)',
          data: seq.interimLooks.map(l => l.lowerBound),
          borderColor: '#d97706',
          borderDash: [6, 4],
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
          pointRadius: 0,
          borderWidth: 1.5,
          fill: 'start',
          tension: 0,
        },
      ],
    };
  });

  readonly seqChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.parsed.y;
            return v !== null && v !== undefined ? ` ${ctx.dataset.label}: ${(v as number).toFixed(2)}` : '';
          },
        },
      },
    },
    scales: {
      x: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } } },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 11 } },
        title: { display: true, text: 'Z-score', font: { size: 11 }, color: '#6b7280' },
      },
    },
  };

  readonly srmStatus = computed<'ok' | 'warning'>(() => {
    const ac = this.acompanhamento();
    if (!ac) return 'ok';
    const hasSRM = ac.porVariante.some(v => {
      const expected = (v.trafficPct / 100) * ac.usuariosExpostos;
      return Math.abs(v.count - expected) / expected > 0.05;
    });
    return hasSRM ? 'warning' : 'ok';
  });

  readonly chartData = computed(() => {
    const ac = this.acompanhamento();
    if (!ac) return null;
    return {
      labels: ac.timeLabels,
      datasets: ac.conversionRates.map(v => ({
        label: v.label,
        data: v.data,
        borderColor: v.color,
        backgroundColor: v.color + '22',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      })),
    };
  });

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, padding: 20, font: { size: 12 } },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { size: 11 },
          callback: (value: any) => value + '%',
        },
        beginAtZero: false,
      },
    },
  };

  statusSeverity(s: string): 'info' | 'secondary' | 'warn' {
    if (s === 'Em andamento') return 'info';
    if (s === 'Concluído')    return 'secondary';
    return 'warn';
  }

  resultadoSeverity(r?: string): 'success' | 'danger' | 'warn' {
    if (r === 'Vencedor')     return 'success';
    if (r === 'Perdedor')     return 'danger';
    return 'warn';
  }

  goBack(): void { this.router.navigate(['/experimentos']); }
}
