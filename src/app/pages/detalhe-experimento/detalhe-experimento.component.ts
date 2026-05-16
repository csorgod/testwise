import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

interface Param { key: string; value: string; }

interface VarianteDetalhe {
  label: string;
  nome: string;
  descricao: string;
  params: Param[];
  trafficPct: number;
  color: string;
}

interface ExperimentoDetalhe {
  id: string;
  nome: string;
  hipotese: string;
  status: 'Em andamento' | 'Concluído' | 'Pausado';
  resultado?: 'Vencedor' | 'Perdedor' | 'Inconclusivo';
  // Estrutura organizacional
  comunidade: string;
  rt: string;
  squad: string;
  // Produto
  sigla: string;
  produto: string;
  subproduto: string;
  // Item de trabalho
  tipoItem: string;
  itemTrabalho: string;
  // Configuração
  dataInicio: string;
  audiencia: number;
  trafficSplit: number[];
  // Variantes
  variantes: VarianteDetalhe[];
  // Métricas
  metricasSucesso: string[];
  metricasGuardrail: string[];
  metricasSecundarias: string[];
  // Parâmetros
  baselineRate: number;
  mde: number;
  confianca: number;
  poder: number;
  samplePerVariant: number;
  totalUsers: number;
  diasEstimados: number | null;
}

const MOCK_EXPERIMENTOS: ExperimentoDetalhe[] = [
  {
    id: 'm1',
    nome: 'PIX Turbo — confirmação em 1 etapa para contatos frequentes',
    hipotese: 'Eliminar a etapa de revisão para contatos com histórico de transações reduz o abandono sem impactar a percepção de segurança.',
    status: 'Em andamento',
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
      { label: 'B', nome: 'Variante (B)', descricao: 'Fluxo sem etapa de revisão para contatos com mais de 3 transações nos últimos 30 dias.', params: [{ key: 'skip_review', value: 'true' }, { key: 'min_transactions', value: '3' }], trafficPct: 50, color: '#f48937' },
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
      { label: 'B', nome: 'Variante (B)', descricao: 'Home com módulos reordenados por frequência de uso.', params: [{ key: 'layout', value: 'frequency' }], trafficPct: 33, color: '#f48937' },
      { label: 'C', nome: 'Variante (C)', descricao: 'Home com módulos reordenados por valor financeiro das ações.', params: [{ key: 'layout', value: 'value' }], trafficPct: 33, color: '#ee8031' },
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
  },
];

@Component({
  selector: 'app-detalhe-experimento',
  standalone: true,
  imports: [TabsModule, TagModule, ButtonModule, TooltipModule, DecimalPipe],
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
