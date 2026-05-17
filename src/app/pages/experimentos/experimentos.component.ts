import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProductService } from '../../core/product.service';

interface Experimento {
  id: string;
  produto: string;
  nome: string;
  area: string;
  hipotese: string;
  status: 'Em andamento' | 'Concluído' | 'Pausado';
  resultado?: 'Vencedor' | 'Perdedor' | 'Inconclusivo';
  metrica: string;
  impacto?: string;
  variantes: number;
  inicioLabel: string;
  fimLabel?: string;
  confianca?: number;
  startDate: Date;
}

@Component({
  selector: 'app-experimentos',
  imports: [FormsModule, Tag, ButtonModule, SelectModule, SkeletonModule, InputTextModule, IconField, InputIcon, PaginatorModule],
  templateUrl: './experimentos.component.html',
  styleUrl: './experimentos.component.scss',
})
export class ExperimentosComponent {
  protected productService = inject(ProductService);
  private readonly router  = inject(Router);

  navigateToDetail(id: string): void { this.router.navigate(['/experimentos', id]); }
  navigateToCriar(): void { this.router.navigate(['/criar-experimento']); }

  loading         = signal(true);
  searchQuery     = signal('');
  selectedStatus    = signal('todos');
  selectedResultado = signal('todos');
  currentPage     = signal(0);
  readonly pageSize = 8;

  readonly resultadoOptions = [
    { label: 'Resultados', value: 'todos'        },
    { label: 'Em andamento',        value: 'em_andamento' },
    { label: 'Vencedor',            value: 'vencedor'     },
    { label: 'Inconclusivo',        value: 'inconclusivo' },
    { label: 'Perdedor',            value: 'perdedor'     },
  ];

  readonly statusOptions = [
    { label: 'Status',           value: 'todos'       },
    { label: 'Ativos',          value: 'ativo'       },
    { label: 'Concluídos',      value: 'concluido'   },
    { label: 'Em rascunho',     value: 'rascunho'    },
  ];

  private loadingTimer: ReturnType<typeof setTimeout> | null = null;


  constructor() {
    effect(() => {
      this.productService.selected();
      this.selectedStatus();
      this.selectedResultado();
      this.searchQuery();
      if (this.loadingTimer) clearTimeout(this.loadingTimer);
      this.currentPage.set(0);
      this.loading.set(true);
      this.loadingTimer = setTimeout(() => this.loading.set(false), 650);
    }, { allowSignalWrites: true });
  }

  filteredExperimentos = computed(() => {
    const product = this.productService.selected().id;
    const query = this.searchQuery().toLowerCase().trim();

    const statusMap: Record<string, Experimento['status'][]> = {
      ativo:     ['Em andamento'],
      concluido: ['Concluído'],
      rascunho:  ['Pausado'],
    };
    const allowedStatuses = statusMap[this.selectedStatus()];

    const resultadoMap: Record<string, (e: Experimento) => boolean> = {
      em_andamento: e => e.status === 'Em andamento',
      vencedor:     e => e.resultado === 'Vencedor',
      inconclusivo: e => e.resultado === 'Inconclusivo',
      perdedor:     e => e.resultado === 'Perdedor',
    };
    const resultadoPredicate = resultadoMap[this.selectedResultado()];

    return this.allExperimentos
      .filter(e => e.produto === product)
      .filter(e => !allowedStatuses || allowedStatuses.includes(e.status))
      .filter(e => !resultadoPredicate || resultadoPredicate(e))
      .filter(e => !query ||
        e.nome.toLowerCase().includes(query) ||
        e.area.toLowerCase().includes(query) ||
        e.hipotese.toLowerCase().includes(query)
      );
  });

  pagedExperimentos = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filteredExperimentos().slice(start, start + this.pageSize);
  });

  kpis = computed(() => {
    const list = this.filteredExperimentos();
    const emAndamento = list.filter(e => e.status === 'Em andamento').length;
    const concluidos  = list.filter(e => e.status === 'Concluído').length;
    const vencedores  = list.filter(e => e.resultado === 'Vencedor').length;
    const taxa = concluidos > 0 ? Math.round((vencedores / concluidos) * 100) : 0;
    return [
      { label: 'Experimentos Totais',    value: String(list.length), icon: 'pi-chart-scatter', accent: 'blue',   trend: '+5 vs. mês anterior',   positive: true  },
      { label: 'Experimentos Ativos',    value: String(emAndamento), icon: 'pi-play-circle',   accent: 'orange', trend: '+2 vs. mês anterior',  positive: true  },
      { label: 'Experimentos Concluídos',value: String(concluidos),  icon: 'pi-check-circle',  accent: 'green',  trend: '+3 este mês',            positive: true  },
      { label: 'Taxa de sucesso',        value: `${taxa}%`,          icon: 'pi-trophy',        accent: 'yellow', trend: taxa >= 50 ? `+${Math.max(1, taxa - 50)} pts vs. mês ant.` : `-${50 - taxa} pts vs. mês ant.`, positive: taxa >= 50 },
    ];
  });

  onPageChange(event: PaginatorState): void {
    this.currentPage.set(event.page ?? 0);
  }

  statusSeverity(s: string): 'info' | 'secondary' | 'warn' {
    return s === 'Em andamento' ? 'info' : s === 'Pausado' ? 'warn' : 'secondary';
  }

  resultadoSeverity(r?: string): 'success' | 'danger' | 'warn' | 'secondary' {
    return r === 'Vencedor' ? 'success' : r === 'Perdedor' ? 'danger' : r === 'Inconclusivo' ? 'warn' : 'secondary';
  }

  accentClass(e: Experimento): string {
    if (e.status === 'Em andamento') return 'running';
    if (e.resultado === 'Vencedor')  return 'winner';
    if (e.resultado === 'Perdedor')  return 'loser';
    if (e.status === 'Pausado')      return 'paused';
    return 'neutral';
  }

  private d(daysAgo: number): Date {
    const d = new Date('2026-05-10');
    d.setDate(d.getDate() - daysAgo);
    return d;
  }

  private readonly allExperimentos: Experimento[] = [

    // ── Mobile ──────────────────────────────────────────────
    { id: 'm1',  produto: 'mobile', startDate: this.d(8),   nome: 'PIX Turbo — confirmação em 1 etapa para contatos frequentes', area: 'UX / Fluxos',      hipotese: 'Eliminar a etapa de revisão para contatos com histórico de transações reduz o abandono sem impactar a percepção de segurança.', status: 'Em andamento', metrica: 'Conversão',            variantes: 2, inicioLabel: 'Mai 2026' },
    { id: 'm2',  produto: 'mobile', startDate: this.d(18),  nome: 'Home personalizada por padrão de uso — v2',                  area: 'Personalização',   hipotese: 'Adaptar o layout da home ao comportamento histórico do usuário aumenta a taxa de sessões com ação relevante.',             status: 'Em andamento', metrica: 'Sessões',               variantes: 3, inicioLabel: 'Abr 2026' },
    { id: 'm3',  produto: 'mobile', startDate: this.d(25),  nome: 'Animação de conclusão em transferências',                     area: 'UX / Visual',      hipotese: 'Feedback visual animado após transferência bem-sucedida aumenta o NPS percebido no fluxo de pagamento.',                 status: 'Em andamento', metrica: 'NPS',                   variantes: 2, inicioLabel: 'Abr 2026' },
    { id: 'm4',  produto: 'mobile', startDate: this.d(22),  nome: 'Widget de saldo mascarado — opt-in ativo vs. passivo',        area: 'UX / Privacidade', hipotese: 'Opt-in ativo para o widget de privacidade gera maior engajamento de longo prazo do que opt-in passivo.',                status: 'Concluído', resultado: 'Vencedor',     metrica: 'Frequência de abertura', impacto: '+11%',    variantes: 2, inicioLabel: 'Mar 2026', fimLabel: 'Abr 2026', confianca: 97 },
    { id: 'm5',  produto: 'mobile', startDate: this.d(28),  nome: 'CTA de investimentos — microcopy de urgência',                area: 'UX / Visual',      hipotese: 'Adicionar copy de urgência contextual ao CTA de investimentos aumenta CTR sem impactar o NPS geral.',                  status: 'Concluído', resultado: 'Inconclusivo', metrica: 'CTR',                    variantes: 2, inicioLabel: 'Abr 2026', fimLabel: 'Mai 2026', confianca: 71 },
    { id: 'm6',  produto: 'mobile', startDate: this.d(55),  nome: 'Onboarding segmentado por faixa etária',                     area: 'Onboarding',       hipotese: 'Usuários acima de 45 anos concluem o onboarding com mais frequência quando o tutorial tem steps adicionais de confirmação.', status: 'Concluído', resultado: 'Vencedor',     metrica: 'Ativação no PIX',        impacto: '+19%',    variantes: 3, inicioLabel: 'Mar 2026', fimLabel: 'Abr 2026', confianca: 95 },
    { id: 'm7',  produto: 'mobile', startDate: this.d(65),  nome: 'Notificação push de saldo baixo — threshold configurável',    area: 'Comunicação',      hipotese: 'Alertas de saldo baixo com threshold configurável pelo usuário reduzem o uso emergencial do crédito rotativo.',         status: 'Concluído', resultado: 'Vencedor',     metrica: 'Faturamento',            impacto: '+8%',     variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 92 },
    { id: 'm8',  produto: 'mobile', startDate: this.d(72),  nome: 'Dark mode — preferência de tema',                             area: 'UX / Visual',      hipotese: 'Oferecer dark mode aumenta sessões em horários noturnos e reduz churn entre usuários de alto uso noturno.',             status: 'Concluído', resultado: 'Inconclusivo', metrica: 'Sessões',               variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 68 },
    { id: 'm9',  produto: 'mobile', startDate: this.d(100), nome: 'Ranking de investimentos — versão privada',                   area: 'Engajamento',      hipotese: 'Ranking de investimentos privado e baseado em metas pessoais aumenta engajamento sem os efeitos negativos do público.',  status: 'Concluído', resultado: 'Vencedor',     metrica: 'Sessões',                impacto: '+13%',    variantes: 2, inicioLabel: 'Jan 2026', fimLabel: 'Mar 2026', confianca: 93 },
    { id: 'm10', produto: 'mobile', startDate: this.d(115), nome: 'Oferta de crédito no fluxo pós-pagamento aprovado',          area: 'Monetização',      hipotese: 'Exibir oferta de crédito imediatamente após pagamento aprovado reduz a rejeição observada em ofertas proativas na home.', status: 'Concluído', resultado: 'Vencedor',     metrica: 'Conversão',              impacto: '+22%',    variantes: 2, inicioLabel: 'Jan 2026', fimLabel: 'Mar 2026', confianca: 96 },
    { id: 'm11', produto: 'mobile', startDate: this.d(140), nome: 'PIN curto em transferências de baixo valor',                  area: 'UX / Fluxos',      hipotese: 'PIN de 4 dígitos como alternativa à biometria para transferências abaixo de R$50 reduz abandono sem comprometer segurança.', status: 'Concluído', resultado: 'Perdedor',     metrica: 'Abandono',               variantes: 2, inicioLabel: 'Dez 2025', fimLabel: 'Fev 2026', confianca: 88 },
    { id: 'm12', produto: 'mobile', startDate: this.d(160), nome: 'Cashback visual integrado ao histórico de transações',        area: 'Monetização',      hipotese: 'Exibir o cashback acumulado dentro do histórico aumenta a percepção de valor e o uso do cartão vinculado.',             status: 'Pausado',   metrica: 'Faturamento',            variantes: 2, inicioLabel: 'Nov 2025' },

    // ── Internet Banking ─────────────────────────────────────
    { id: 'ib1',  produto: 'ib', startDate: this.d(5),   nome: 'Reorganização do menu por frequência de uso',              area: 'UX / Navegação',     hipotese: 'Menu reestruturado com base em heatmap de acesso reduz o tempo médio para a primeira ação em sessão.',                  status: 'Em andamento', metrica: 'Sessões',   variantes: 2, inicioLabel: 'Mai 2026' },
    { id: 'ib2',  produto: 'ib', startDate: this.d(20),  nome: 'Autenticação por QR Code no desktop',                      area: 'Segurança / UX',     hipotese: 'QR Code como mecanismo de autenticação reduz o tempo de login em operações sensíveis e aumenta a conversão no fluxo.', status: 'Em andamento', metrica: 'Conversão', variantes: 2, inicioLabel: 'Abr 2026' },
    { id: 'ib3',  produto: 'ib', startDate: this.d(27),  nome: 'Dashboard de investimentos com projeção interativa',       area: 'UX / Dados',         hipotese: 'Visualização interativa de projeção de rendimento aumenta o tempo de sessão na área de investimentos e NPS.',           status: 'Em andamento', metrica: 'NPS',       variantes: 3, inicioLabel: 'Abr 2026' },
    { id: 'ib4',  produto: 'ib', startDate: this.d(48),  nome: 'Busca com sugestões por histórico do usuário',             area: 'UX / Navegação',     hipotese: 'Sugestões de busca baseadas no histórico individual reduzem o número de cliques para encontrar lançamentos.',           status: 'Concluído', resultado: 'Vencedor',     metrica: 'Sessões',   impacto: '+31%',    variantes: 2, inicioLabel: 'Mar 2026', fimLabel: 'Abr 2026', confianca: 98 },
    { id: 'ib5',  produto: 'ib', startDate: this.d(60),  nome: 'Agendamento inteligente com sugestão de datas',            area: 'UX / Fluxos',        hipotese: 'Sugerir datas com base no histórico de pagamentos reduz erros de seleção e abandono no fluxo de agendamento.',         status: 'Concluído', resultado: 'Vencedor',     metrica: 'Conversão', impacto: '+17%',    variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 94 },
    { id: 'ib6',  produto: 'ib', startDate: this.d(70),  nome: 'Alerta de débito com projeção de saldo disponível',        area: 'Comunicação',        hipotese: 'Alertas que projetam o saldo após o débito aumentam o NPS pós-cobrança ao reduzir surpresas financeiras.',             status: 'Concluído', resultado: 'Vencedor',     metrica: 'NPS',       impacto: '+9 pts',  variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 91 },
    { id: 'ib7',  produto: 'ib', startDate: this.d(88),  nome: 'Layouts pré-definidos de dashboard (2–3 opções)',          area: 'UX / Customização',  hipotese: 'Oferecer layouts pré-definidos de alta qualidade tem maior adoção do que dashboard completamente configurável.',          status: 'Concluído', resultado: 'Vencedor',     metrica: 'Sessões',   impacto: '+18%',    variantes: 3, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 96 },
    { id: 'ib8',  produto: 'ib', startDate: this.d(110), nome: 'Tour guiado opcional acionado pelo usuário',               area: 'Onboarding',         hipotese: 'Onboarding opcional com badge de conclusão tem maior taxa de adesão do que tutorial linear bloqueante.',                 status: 'Concluído', resultado: 'Vencedor',     metrica: 'Conversão', impacto: '+24%',    variantes: 2, inicioLabel: 'Jan 2026', fimLabel: 'Mar 2026', confianca: 97 },
    { id: 'ib9',  produto: 'ib', startDate: this.d(135), nome: 'Opção de postergar débito pelo alerta push',               area: 'Comunicação',        hipotese: 'Permitir postergar um débito agendado direto pela notificação reduz cancelamentos e aumenta NPS.',                      status: 'Concluído', resultado: 'Inconclusivo', metrica: 'NPS',       variantes: 2, inicioLabel: 'Dez 2025', fimLabel: 'Fev 2026', confianca: 74 },
    { id: 'ib10', produto: 'ib', startDate: this.d(155), nome: 'Busca por reconhecimento de voz no IB mobile',             area: 'UX / Navegação',     hipotese: 'Busca por voz na versão mobile do IB reduz o tempo de navegação para usuários que acessam em movimento.',             status: 'Pausado',   metrica: 'Sessões',   variantes: 2, inicioLabel: 'Nov 2025' },

    // ── PJ ──────────────────────────────────────────────────
    { id: 'pj1',  produto: 'pj', startDate: this.d(10),  nome: 'Aprovação em lote com visão de impacto no caixa',          area: 'Eficiência / Fluxos', hipotese: 'Exibir o impacto no fluxo de caixa antes de confirmar um lote de pagamentos reduz cancelamentos pós-aprovação.',        status: 'Em andamento', metrica: 'Faturamento', variantes: 2, inicioLabel: 'Mai 2026' },
    { id: 'pj2',  produto: 'pj', startDate: this.d(21),  nome: 'Extrato com exportação parametrizável por CNAE',           area: 'UX / Dados',          hipotese: 'Exportação com filtros avançados por CNAE e fornecedor reduz chamados ao suporte e aumenta NPS do produto.',            status: 'Em andamento', metrica: 'NPS',         variantes: 2, inicioLabel: 'Abr 2026' },
    { id: 'pj3',  produto: 'pj', startDate: this.d(30),  nome: 'Visão consolidada de múltiplos CNPJs',                     area: 'UX / Navegação',      hipotese: 'Interface unificada para empresas com mais de um CNPJ elimina logins repetidos e aumenta sessões.',                   status: 'Em andamento', metrica: 'Sessões',     variantes: 2, inicioLabel: 'Abr 2026' },
    { id: 'pj4',  produto: 'pj', startDate: this.d(52),  nome: 'Exportação agendada automática de extratos por e-mail',    area: 'Automação',           hipotese: 'Extratos enviados automaticamente por e-mail reduzem acessos manuais recorrentes e aumentam NPS.',                    status: 'Concluído', resultado: 'Vencedor',     metrica: 'NPS',         impacto: '+12 pts', variantes: 2, inicioLabel: 'Mar 2026', fimLabel: 'Abr 2026', confianca: 93 },
    { id: 'pj5',  produto: 'pj', startDate: this.d(65),  nome: 'Categorização por sugestão — IA propõe, usuário confirma', area: 'Automação',           hipotese: 'Categorização que exige confirmação tem maior aceitação e menor impacto negativo no NPS do que automação silenciosa.',  status: 'Concluído', resultado: 'Vencedor',     metrica: 'NPS',         impacto: '+8 pts',  variantes: 3, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 90 },
    { id: 'pj6',  produto: 'pj', startDate: this.d(80),  nome: 'Alerta proativo de limite abaixo de threshold configurável',area: 'Transparência',       hipotese: 'Alertas de limite de crédito configuráveis reduzem pedidos ao gerente e aumentam o uso do crédito rotativo.',          status: 'Concluído', resultado: 'Vencedor',     metrica: 'Sessões',     impacto: '+19%',    variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 95 },
    { id: 'pj7',  produto: 'pj', startDate: this.d(95),  nome: 'Sandbox de treino separado do ambiente real',              area: 'Onboarding',          hipotese: 'Sandbox de treinamento para novos operadores reduz erros nas primeiras semanas e aumenta a taxa de conversão.',        status: 'Concluído', resultado: 'Vencedor',     metrica: 'Conversão',   impacto: '+28%',    variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Mar 2026', confianca: 97 },
    { id: 'pj8',  produto: 'pj', startDate: this.d(120), nome: 'Aprovação multinível configurável por alçada',             area: 'Eficiência / Fluxos', hipotese: 'Fluxo de aprovação hierárquico configurável pela empresa reduz gargalos em times com mais de 3 operadores.',            status: 'Concluído', resultado: 'Vencedor',     metrica: 'Faturamento', impacto: '+35%',    variantes: 2, inicioLabel: 'Jan 2026', fimLabel: 'Mar 2026', confianca: 98 },
    { id: 'pj9',  produto: 'pj', startDate: this.d(145), nome: 'Base de conhecimento com casos de uso por CNAE',           area: 'Onboarding',          hipotese: 'Documentação segmentada por CNAE tem maior adoção e reduz o tempo de onboarding de novos operadores.',                status: 'Concluído', resultado: 'Inconclusivo', metrica: 'Conversão',   variantes: 2, inicioLabel: 'Dez 2025', fimLabel: 'Fev 2026', confianca: 72 },
    { id: 'pj10', produto: 'pj', startDate: this.d(170), nome: 'Agrupamento de boletos por data de vencimento',            area: 'Eficiência / Fluxos', hipotese: 'Agrupamento por data de vencimento como critério secundário ao CNPJ reduz o tempo de operação em lotes complexos.',   status: 'Pausado',   metrica: 'Faturamento', variantes: 2, inicioLabel: 'Nov 2025' },

    // ── Cartões ──────────────────────────────────────────────
    { id: 'c1',  produto: 'cards', startDate: this.d(7),   nome: 'Alertas de orçamento configuráveis por categoria',          area: 'Gestão de Gastos', hipotese: 'Alertas de limite de gasto configuráveis por categoria aumentam sessões e percepção de controle financeiro.',           status: 'Em andamento', metrica: 'Sessões',     variantes: 2, inicioLabel: 'Mai 2026' },
    { id: 'c2',  produto: 'cards', startDate: this.d(22),  nome: 'Solicitação de aumento de limite — fluxo em 2 etapas',      area: 'UX / Fluxos',      hipotese: 'Simplificar o pedido de aumento de limite de 6 para 2 etapas dobra a taxa de conclusão do fluxo.',                   status: 'Em andamento', metrica: 'Conversão',   variantes: 2, inicioLabel: 'Abr 2026' },
    { id: 'c3',  produto: 'cards', startDate: this.d(29),  nome: 'Sugestão de parcelamento no momento da compra',             area: 'Monetização',      hipotese: 'Sugerir parcelamento contextualmente após compras acima de R$200 aumenta a adesão ao crédito parcelado.',             status: 'Em andamento', metrica: 'Faturamento', variantes: 3, inicioLabel: 'Abr 2026' },
    { id: 'c4',  produto: 'cards', startDate: this.d(45),  nome: 'Contestação de lançamento via foto integrada ao extrato',   area: 'UX / Fluxos',      hipotese: 'Permitir contestação por foto diretamente do extrato reduz o tempo de conclusão do fluxo e aumenta NPS.',             status: 'Concluído', resultado: 'Vencedor',     metrica: 'NPS',         impacto: '+14 pts', variantes: 2, inicioLabel: 'Mar 2026', fimLabel: 'Abr 2026', confianca: 96 },
    { id: 'c5',  produto: 'cards', startDate: this.d(58),  nome: 'Comparativo de gastos vs. mesmo período anterior no alerta',area: 'Comunicação',      hipotese: 'Incluir comparativo com o mês anterior no alerta de fatura aumenta pagamentos integrais.',                            status: 'Concluído', resultado: 'Vencedor',     metrica: 'Faturamento', impacto: '+9%',     variantes: 2, inicioLabel: 'Mar 2026', fimLabel: 'Abr 2026', confianca: 91 },
    { id: 'c6',  produto: 'cards', startDate: this.d(68),  nome: 'Subcategoria de nível 2 como expansão opcional',            area: 'UX / Dados',       hipotese: 'Subcategorias exibidas sob demanda (não por padrão) evitam a sobrecarga cognitiva observada com 3 níveis expandidos.', status: 'Concluído', resultado: 'Vencedor',     metrica: 'Sessões',     impacto: '+16%',    variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 94 },
    { id: 'c7',  produto: 'cards', startDate: this.d(82),  nome: 'Widget de controles do cartão na tela inicial',             area: 'UX / Segurança',   hipotese: 'Módulo dedicado de controles do cartão na home aumenta o uso do bloqueio preventivo e NPS da funcionalidade.',        status: 'Concluído', resultado: 'Vencedor',     metrica: 'NPS',         impacto: '+11 pts', variantes: 2, inicioLabel: 'Fev 2026', fimLabel: 'Abr 2026', confianca: 93 },
    { id: 'c8',  produto: 'cards', startDate: this.d(100), nome: 'Programa de pontos privado com metas pessoais',             area: 'Engajamento',      hipotese: 'Gamificação baseada em metas privadas tem aceitação positiva sem os efeitos negativos do ranking público.',            status: 'Concluído', resultado: 'Vencedor',     metrica: 'Sessões',     impacto: '+21%',    variantes: 2, inicioLabel: 'Jan 2026', fimLabel: 'Mar 2026', confianca: 95 },
    { id: 'c9',  produto: 'cards', startDate: this.d(118), nome: 'Oferta de seguro viagem no fluxo de compra de passagem',    area: 'Monetização',      hipotese: 'Oferta contextualizada durante compra de passagem tem maior conversão do que oferta no fluxo de bloqueio internacional.', status: 'Concluído', resultado: 'Inconclusivo', metrica: 'Conversão',   variantes: 2, inicioLabel: 'Jan 2026', fimLabel: 'Mar 2026', confianca: 76 },
    { id: 'c10', produto: 'cards', startDate: this.d(150), nome: 'Agendamento de pagamento direto pelo alerta de fatura',     area: 'Comunicação',      hipotese: 'Botão de agendamento no push de fatura reduz inadimplência sem exigir abertura do app.',                              status: 'Concluído', resultado: 'Vencedor',     metrica: 'Faturamento', impacto: '+14%',    variantes: 2, inicioLabel: 'Dez 2025', fimLabel: 'Fev 2026', confianca: 97 },
    { id: 'c11', produto: 'cards', startDate: this.d(165), nome: 'Gráfico de gastos semanal por categoria na home',           area: 'Gestão de Gastos', hipotese: 'Visualização semanal de gastos por categoria na home aumenta a frequência de acesso ao app.',                         status: 'Pausado',   metrica: 'Sessões',     variantes: 2, inicioLabel: 'Nov 2025' },
  ];
}
