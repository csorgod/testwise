import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductService } from '../../core/product.service';

interface Hipotese {
  titulo: string;
  racional: string;
  metricaAlvo: string;
  impactoEstimado: string;
  confianca: 'Alta' | 'Média' | 'Baixa';
  severity: 'success' | 'warn' | 'danger';
}

interface Aprendizado {
  experimento: string;
  area: string;
  periodo: string;
  metrica: string;
  impacto: string;
  insight: string;
  aprendizado?: string;
}

interface InsightArea {
  tema: string;
  icon: string;
  resumo: string;
  pontos: string[];
}

interface ProductMemoria {
  stats:          { total: number; funcionaram: number; naoFuncionaram: number };
  hipoteses:      Hipotese[];
  funcionaram:    Aprendizado[];
  naoFuncionaram: Aprendizado[];
  insightAreas:   InsightArea[];
}

@Component({
  selector: 'app-memoria-produto',
  imports: [FormsModule, Tabs, TabList, Tab, TabPanels, TabPanel, Tag, ButtonModule, SelectModule, SkeletonModule],
  templateUrl: './memoria-produto.component.html',
  styleUrl: './memoria-produto.component.scss',
})
export class MemoriaProdutoComponent {
  protected productService = inject(ProductService);

  loading = signal(true);
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.productService.selected();
      if (this.loadingTimer) clearTimeout(this.loadingTimer);
      this.loading.set(true);
      this.loadingTimer = setTimeout(() => this.loading.set(false), 650);
    }, { allowSignalWrites: true });
  }

  private readonly productData: Record<string, ProductMemoria> = {
    mobile: {
      stats: { total: 47, funcionaram: 23, naoFuncionaram: 14 },
      hipoteses: [
        {
          titulo: 'Simplificar etapas de confirmação no fluxo PIX',
          racional: '3 experimentos mostram que cada etapa extra de confirmação reduz a conversão em ~8%. O fluxo atual tem 4 etapas; usuários de alta frequência esperam no máximo 2.',
          metricaAlvo: 'Conversão',
          impactoEstimado: '+18% a +24%',
          confianca: 'Alta',
          severity: 'success',
        },
        {
          titulo: 'Personalização contextual da home com base em padrão de uso',
          racional: 'Usuários com padrão de acesso definido respondem melhor a conteúdo adaptado ao comportamento histórico do que a layouts fixos. Experimentos de widget confirmam receptividade ao opt-in.',
          metricaAlvo: 'Sessões por usuário',
          impactoEstimado: '+10% a +15%',
          confianca: 'Média',
          severity: 'warn',
        },
        {
          titulo: 'Feedback visual imediato e confirmação animada em transferências',
          racional: 'Experimentos com animação de conclusão aumentaram NPS em cenários de pagamento. Usuários associam resposta visual instantânea a confiança e segurança.',
          metricaAlvo: 'NPS',
          impactoEstimado: '+5 a +9 pts',
          confianca: 'Alta',
          severity: 'success',
        },
      ],
      funcionaram: [
        {
          experimento: 'Novo fluxo de confirmação PIX — 2 etapas',
          area: 'UX / Fluxos', periodo: 'Set–Out 2024', metrica: 'Conversão', impacto: '+23%',
          insight: 'Reduzir de 4 para 2 etapas na confirmação eliminou o principal ponto de abandono. Usuários percebem a operação como mais rápida sem redução na percepção de segurança.',
        },
        {
          experimento: 'CTA de investimento com destaque laranja na home',
          area: 'UX / Visual', periodo: 'Ago–Set 2024', metrica: 'Sessões', impacto: '+15%',
          insight: 'O uso da cor da marca em call-to-actions primários aumentou o clique orgânico em produtos de investimento sem comprometer a percepção geral da interface.',
        },
        {
          experimento: 'Onboarding guiado para novos usuários com PIX',
          area: 'Onboarding', periodo: 'Jun–Jul 2024', metrica: 'Conversão', impacto: '+31%',
          insight: 'Um tutorial contextual de 3 passos na primeira utilização do PIX reduziu chamadas ao suporte e acelerou a ativação. O maior ganho foi entre usuários de 45+ anos.',
        },
        {
          experimento: 'Widget de saldo mascarado acessível na tela inicial',
          area: 'UX / Privacidade', periodo: 'Mai–Jun 2024', metrica: 'Sessões', impacto: '+18%',
          insight: 'Exibir saldo mascarado com 1 toque para revelar aumentou a frequência de abertura do app. O opt-in atingiu 67%, indicando alta demanda por acesso rápido sem comprometer privacidade.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Oferta proativa de crédito pessoal na tela inicial',
          area: 'Monetização', periodo: 'Out–Nov 2024', metrica: 'NPS', impacto: '–4 pts',
          insight: 'Exibir ofertas de crédito não solicitadas na home gerou percepção negativa, independente da relevância do produto para o perfil do usuário.',
          aprendizado: 'Ofertas de crédito devem ser contextuais — disparadas apenas após comportamentos que sinalizem intenção de compra ou necessidade financeira.',
        },
        {
          experimento: 'Substituição parcial do FAQ por chatbot automatizado',
          area: 'Suporte', periodo: 'Set–Out 2024', metrica: 'NPS / Churn', impacto: '–7 pts NPS, +3% churn',
          insight: 'O chatbot não resolveu as dúvidas mais complexas, forçando o usuário a percorrer múltiplos canais. A experiência fragmentada foi o principal detrator.',
          aprendizado: 'Automação de suporte requer escalonamento humano fluido. Um chatbot sem saída para atendimento humano é pior do que a ausência do chatbot.',
        },
        {
          experimento: 'Gamificação de metas de investimento',
          area: 'Engajamento', periodo: 'Jul–Ago 2024', metrica: 'Sessões', impacto: '–5% (investidores avançados)',
          insight: 'A mecânica de pontos foi bem recebida por usuários iniciantes, mas percebida como infantil e distratora pelos investidores mais experientes.',
          aprendizado: 'Estratégias de engajamento gamificado devem ser segmentadas por perfil. Um design único não serve aos diferentes níveis de sofisticação financeira.',
        },
      ],
      insightAreas: [
        {
          tema: 'UX e Fluxos', icon: 'pi-arrows-h',
          resumo: 'Simplicidade é o maior alavancador de conversão. Cada etapa adicional em fluxos críticos representa perda mensurável e consistente.',
          pontos: [
            'Cada passo extra em fluxos de pagamento reduz a conversão em ~8%',
            'Usuários de alta frequência toleram menos fricção do que novos usuários',
            'Confirmações redundantes geram abandono sem aumentar percepção de segurança',
            'Feedback visual imediato substitui a necessidade de etapas de "processando"',
          ],
        },
        {
          tema: 'Comunicação e Ofertas', icon: 'pi-megaphone',
          resumo: 'Mensagens proativas sem contexto de uso geram rejeição. O momento certo importa mais do que a oferta certa.',
          pontos: [
            'Ofertas não contextuais reduzem NPS independente da relevância do produto',
            'Notificações push em alto volume aumentam desinstalações em até 12%',
            'Usuários aceitam ofertas quando estão no fluxo relacionado ao produto ofertado',
            'Linguagem financeira técnica reduz engajamento em perfis de renda média',
          ],
        },
        {
          tema: 'Personalização', icon: 'pi-user',
          resumo: 'Conteúdo adaptado ao comportamento histórico do usuário gera ganhos consistentes em retenção e engajamento.',
          pontos: [
            'Usuários com padrão de uso definido respondem melhor a layouts personalizados',
            'O opt-in para personalização atingiu 67%, indicando alta receptividade',
            'Segmentação por sofisticação financeira é essencial — estratégias únicas subperformam',
            'Histórico de transações é melhor preditor de intenção do que dados demográficos',
          ],
        },
      ],
    },

    ib: {
      stats: { total: 38, funcionaram: 18, naoFuncionaram: 11 },
      hipoteses: [
        {
          titulo: 'Reorganização do menu de navegação principal por frequência de uso',
          racional: 'Análise de heatmap mostra que 70% dos acessos se concentram em 4 funcionalidades. Reestruturar o menu para surfaçar essas funcionalidades pode reduzir o tempo médio para a primeira ação em até 40%.',
          metricaAlvo: 'Sessões',
          impactoEstimado: '+20% a +30%',
          confianca: 'Alta',
          severity: 'success',
        },
        {
          titulo: 'Autenticação via QR Code para operações sensíveis no desktop',
          racional: 'Usuários relatam fricção alta na autenticação por token físico. Experimentos iniciais com QR Code no mobile mostraram redução de 55% no tempo de autenticação.',
          metricaAlvo: 'Conversão',
          impactoEstimado: '+12% a +18%',
          confianca: 'Média',
          severity: 'warn',
        },
        {
          titulo: 'Dashboard de investimentos com projeção de rendimento interativa',
          racional: 'Usuários de IB têm perfil de maior sofisticação financeira. Experimentos com visualizações de projeção aumentaram o tempo de sessão na área de investimentos em 35%.',
          metricaAlvo: 'NPS',
          impactoEstimado: '+7 a +12 pts',
          confianca: 'Alta',
          severity: 'success',
        },
      ],
      funcionaram: [
        {
          experimento: 'Busca global integrada a todos os serviços e extratos',
          area: 'UX / Navegação', periodo: 'Jan–Fev 2024', metrica: 'Sessões', impacto: '+27%',
          insight: 'A busca unificada reduziu o número de cliques médio para encontrar um lançamento de 7 para 2. Usuários com histórico longo de transações foram os maiores beneficiários.',
        },
        {
          experimento: 'Redesign do fluxo de agendamento de pagamentos recorrentes',
          area: 'UX / Fluxos', periodo: 'Mar–Abr 2024', metrica: 'Conversão', impacto: '+19%',
          insight: 'Consolidar confirmação e recibo em uma única tela eliminou o ponto de maior abandono. A taxa de conclusão do agendamento subiu de 61% para 80%.',
        },
        {
          experimento: 'Alerta proativo de débito automático com 3 dias de antecedência',
          area: 'Comunicação', periodo: 'Nov–Dez 2023', metrica: 'NPS', impacto: '+11 pts',
          insight: 'Notificações antecipadas de débito foram percebidas como transparência e cuidado pelo usuário. A taxa de acionamento do suporte por surpresa na fatura caiu 34%.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Dashboard personalizado com widgets arrastáveis',
          area: 'UX / Customização', periodo: 'Mai–Jun 2024', metrica: 'Sessões', impacto: '–9%',
          insight: 'A interface configurável gerou confusão na primeira interação. Usuários que personalizaram o dashboard retornaram menos do que o grupo controle.',
          aprendizado: 'Customização excessiva aumenta a carga cognitiva inicial. Usuários preferem padrões bem definidos a interfaces configuráveis do zero.',
        },
        {
          experimento: 'Tutorial em vídeo obrigatório para novos usuários no primeiro acesso',
          area: 'Onboarding', periodo: 'Ago–Set 2023', metrica: 'Conversão', impacto: '–18%',
          insight: 'O tutorial compulsório gerou 18% de abandono imediato na tela de boas-vindas. Usuários que concluíram o tutorial não apresentaram melhor engajamento posterior.',
          aprendizado: 'Conteúdo educacional deve ser opcional e acionado por contexto. Onboardings lineares obrigatórios são especialmente rejeitados por usuários de IB, que valorizam autonomia.',
        },
      ],
      insightAreas: [
        {
          tema: 'Navegação', icon: 'pi-sitemap',
          resumo: 'Estrutura de menu clara e baseada em frequência de uso é crítica. Usuários de IB têm baixíssima tolerância para hierarquias profundas.',
          pontos: [
            'Menus com mais de 3 níveis de profundidade elevam o tempo médio por tarefa em 60%',
            'Busca global é percebida como essencial por usuários com histórico superior a 6 meses',
            'Atalhos configuráveis têm adoção menor que menus fixos bem estruturados',
            '70% dos acessos se concentram em 4 funcionalidades — o menu deve refletir isso',
          ],
        },
        {
          tema: 'Comunicação Proativa', icon: 'pi-bell',
          resumo: 'Alertas com 3 ou mais dias de antecedência têm aceitação 3x maior que notificações no dia do evento.',
          pontos: [
            'Antecipação de eventos financeiros é percebida como cuidado, não intrusão',
            'Alertas de débito automático reduzem acionamento de suporte em até 34%',
            'E-mail tem maior taxa de leitura que push notification para avisos financeiros no IB',
            'Frequência máxima aceitável: 2 notificações por semana para eventos não críticos',
          ],
        },
        {
          tema: 'Customização', icon: 'pi-sliders-h',
          resumo: 'Interfaces altamente configuráveis têm menor adoção que experiências guiadas com boa ergonomia padrão.',
          pontos: [
            'Usuários que personalizam o dashboard retornam menos que o grupo controle',
            'Customização aumenta carga cognitiva no primeiro acesso de forma significativa',
            'Preferências salvas automaticamente pelo sistema superam configurações manuais',
            'Ofereça 2-3 layouts pré-definidos antes de abrir para customização livre',
          ],
        },
      ],
    },

    pj: {
      stats: { total: 29, funcionaram: 14, naoFuncionaram: 9 },
      hipoteses: [
        {
          titulo: 'Fluxo de pagamento em lote com aprovação multinível configurável',
          racional: 'Empresas com mais de 3 operadores relatam gargalo no processo de aprovação de pagamentos. Um fluxo com aprovação hierárquica configurável pode aumentar o volume de transações mensais em até 35%.',
          metricaAlvo: 'Faturamento',
          impactoEstimado: '+25% a +35%',
          confianca: 'Alta',
          severity: 'success',
        },
        {
          titulo: 'Relatório de fluxo de caixa com exportação parametrizável por período e categoria',
          racional: 'O principal motivo de acesso ao IB PJ é consulta de extratos para conciliação. Facilitar a exportação parametrizável pode reduzir o tempo médio dessa tarefa de 12 para 3 minutos.',
          metricaAlvo: 'NPS',
          impactoEstimado: '+10 a +16 pts',
          confianca: 'Média',
          severity: 'warn',
        },
        {
          titulo: 'Visão consolidada para gestão de múltiplos CNPJs em um único acesso',
          racional: 'Clientes PJ com mais de um CNPJ realizam em média 4 logins separados por sessão. Consolidação em uma interface única eliminaria essa fricção e aumentaria tempo de sessão.',
          metricaAlvo: 'Sessões',
          impactoEstimado: '+18% a +25%',
          confianca: 'Alta',
          severity: 'success',
        },
      ],
      funcionaram: [
        {
          experimento: 'Pagamento em lote com agrupamento de boletos por fornecedor',
          area: 'Eficiência / Fluxos', periodo: 'Out–Nov 2023', metrica: 'Faturamento', impacto: '+41%',
          insight: 'Agrupar boletos automaticamente por CNPJ do fornecedor reduziu o tempo de operação de pagamentos recorrentes de 18 para 4 minutos. Adoção foi de 78% entre empresas com mais de 10 pagamentos mensais.',
        },
        {
          experimento: 'Exportação de extrato em CSV e OFX direto da listagem de transações',
          area: 'UX / Dados', periodo: 'Fev–Mar 2024', metrica: 'NPS', impacto: '+14 pts',
          insight: 'A exportação direta com filtro de período eliminou a necessidade de suporte para obtenção de relatórios. O volume de chamados para extrato caiu 61% no mês seguinte ao lançamento.',
        },
        {
          experimento: 'Indicador de limite de crédito PJ disponível em tempo real no dashboard',
          area: 'Transparência', periodo: 'Dez 2023–Jan 2024', metrica: 'Sessões', impacto: '+22%',
          insight: 'Exibir o limite disponível de forma proeminente aumentou o uso de crédito rotativo PJ e reduziu pedidos de informação ao gerente de conta. Usuários relataram maior sensação de controle financeiro.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Categorização automática de despesas por IA',
          area: 'Automação', periodo: 'Abr–Mai 2024', metrica: 'NPS', impacto: '–6 pts',
          insight: 'A categorização automática cometeu erros em 23% das transações. No contexto PJ, onde precisão contábil é crítica, cada erro gerou correção manual e percepção de retrabalho.',
          aprendizado: 'Automação que erra é pior que ausência de automação no PJ. IA em conciliação contábil exige precisão acima de 98% antes de ser viável como padrão, não como sugestão.',
        },
        {
          experimento: 'Onboarding assistido em vídeo para novos operadores do sistema',
          area: 'Onboarding', periodo: 'Jan–Fev 2024', metrica: 'Conversão', impacto: '–12%',
          insight: 'Operadores PJ ignoraram o fluxo de vídeo e buscaram diretamente a funcionalidade desejada. O tutorial linear não se adequa ao padrão de uso não-sequencial do ambiente corporativo.',
          aprendizado: 'Operadores PJ preferem documentação textual consultável e search a fluxos guiados lineares. Ofereça tooltips contextuais e uma base de conhecimento pesquisável ao invés de tutoriais obrigatórios.',
        },
      ],
      insightAreas: [
        {
          tema: 'Eficiência Operacional', icon: 'pi-bolt',
          resumo: 'Fluxos de pagamento em lote são o maior driver de adoção PJ. Reduzir cliques em operações recorrentes tem o mais alto ROI entre todos os experimentos.',
          pontos: [
            'Pagamentos recorrentes para os mesmos fornecedores representam 65% do volume de operações',
            'Cada minuto salvo em fluxos de pagamento se traduz em percepção de valor mensurável',
            'Aprovação multinível é requisito não-negociável para empresas acima de 5 funcionários',
            'Agendamento recorrente é subutilizado (8% de adoção) — ponto de oportunidade alto',
          ],
        },
        {
          tema: 'Transparência de Dados', icon: 'pi-database',
          resumo: 'O usuário PJ consome dados brutos. Exportação fácil e confiável tem maior valor percebido do que visualizações elaboradas.',
          pontos: [
            'Exportação de extrato é o segundo motivo mais frequente de acesso ao sistema',
            'Formato OFX tem adoção 3x maior que PDF para conciliação contábil',
            'Dashboards visuais têm menor engajamento que tabelas de dados entre usuários PJ',
            'Confiabilidade dos dados importa mais que velocidade de carregamento para este perfil',
          ],
        },
        {
          tema: 'Automação e IA', icon: 'pi-microchip-ai',
          resumo: 'No contexto PJ, IA que erra é pior que ausência de automação. Precisão acima de 98% é requisito antes de qualquer lançamento em produção.',
          pontos: [
            'Erros de categorização geram retrabalho manual percebido como custo maior que o benefício',
            'Sugestões de IA (não automáticas) têm melhor aceitação que automações silenciosas',
            'Usuários PJ exigem rastreabilidade — toda ação automatizada precisa de log auditável',
            'Automação deve começar em tarefas de baixo risco: formatação, agrupamento, notificações',
          ],
        },
      ],
    },

    cards: {
      stats: { total: 43, funcionaram: 21, naoFuncionaram: 13 },
      hipoteses: [
        {
          titulo: 'Visualização de gastos por categoria com alertas personalizados de orçamento',
          racional: '2 experimentos com categorização visual mostraram aumento de 29% nas sessões. Adicionar alertas de orçamento configuráveis deve aumentar ainda mais o engajamento e a percepção de controle financeiro.',
          metricaAlvo: 'Sessões',
          impactoEstimado: '+15% a +22%',
          confianca: 'Alta',
          severity: 'success',
        },
        {
          titulo: 'Fluxo simplificado de solicitação de aumento de limite em 2 etapas',
          racional: 'O fluxo atual tem 6 etapas com 3 confirmações redundantes. Dados de funil mostram 58% de abandono na etapa 3. Simplificação pode dobrar a taxa de conclusão.',
          metricaAlvo: 'Conversão',
          impactoEstimado: '+28% a +40%',
          confianca: 'Alta',
          severity: 'success',
        },
        {
          titulo: 'Notificação contextual de opção de parcelamento no momento da compra',
          racional: 'Usuários que parcelam voluntariamente têm LTV 40% maior. Oferecer o parcelamento como sugestão contextual (não proativa) no histórico de compras acima de R$ 200 pode aumentar a adesão.',
          metricaAlvo: 'Faturamento',
          impactoEstimado: '+8% a +14%',
          confianca: 'Média',
          severity: 'warn',
        },
      ],
      funcionaram: [
        {
          experimento: 'Categorização visual de gastos no extrato com ícones por categoria',
          area: 'UX / Dados', periodo: 'Mar–Abr 2024', metrica: 'Sessões', impacto: '+29%',
          insight: 'A categorização visual transformou o extrato de uma lista de débitos em um painel de gestão financeira. Usuários passaram a acessar o app ativamente para acompanhar gastos, não só reativamente.',
        },
        {
          experimento: 'Redesign do fluxo de contestação de lançamento na fatura',
          area: 'UX / Fluxos', periodo: 'Jan–Fev 2024', metrica: 'NPS', impacto: '+18 pts',
          insight: 'Reduzir de 8 para 3 etapas e adicionar status em tempo real da contestação eliminou o principal driver de insatisfação. O volume de ligações ao SAC sobre contestações caiu 44%.',
        },
        {
          experimento: 'Alerta de fatura próxima ao vencimento com resumo de gastos do mês',
          area: 'Comunicação', periodo: 'Nov–Dez 2023', metrica: 'Faturamento', impacto: '+12%',
          insight: 'O alerta com resumo reduziu a taxa de pagamento mínimo da fatura e aumentou o pagamento integral. Usuários relataram que o resumo os ajudou a priorizar o pagamento do cartão.',
        },
        {
          experimento: 'Atalho rápido para bloqueio e desbloqueio do cartão na home',
          area: 'UX / Segurança', periodo: 'Set–Out 2023', metrica: 'NPS', impacto: '+9 pts',
          insight: 'O atalho reduziu de 6 para 1 toque o acesso ao bloqueio. Usuários que bloquearam o cartão por precaução relataram alta percepção de controle e segurança, sem aumento de cancelamentos.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Programa de pontos gamificado com ranking público entre usuários',
          area: 'Engajamento', periodo: 'Mai–Jun 2024', metrica: 'NPS', impacto: '–5 pts',
          insight: 'O ranking público gerou desconforto em usuários que se sentiram expostos financeiramente. A comparação social em contexto de finanças pessoais foi percebida como invasiva.',
          aprendizado: 'Gamificação financeira funciona quando é estritamente privada e baseada nas metas do próprio usuário. Comparação social é contraproducente neste contexto.',
        },
        {
          experimento: 'Extrato detalhado com subcategorias de 3 níveis de granularidade',
          area: 'UX / Dados', periodo: 'Jul–Ago 2023', metrica: 'Sessões', impacto: '–8%',
          insight: 'A hierarquia de 3 níveis sobrecarregou visualmente o extrato. Usuários reduziram a frequência de acesso à seção, preferindo a visão resumida anterior.',
          aprendizado: 'Excesso de granularidade em dados financeiros pessoais aumenta a ansiedade do usuário. A categoria de primeiro nível resolve 80% dos casos de uso — nível 2 deve ser opcional.',
        },
        {
          experimento: 'Oferta de seguro de viagem no momento do bloqueio internacional do cartão',
          area: 'Monetização', periodo: 'Fev–Mar 2024', metrica: 'NPS', impacto: '–3 pts',
          insight: 'O momento do bloqueio é de alta concentração do usuário em uma tarefa específica. Inserir uma oferta nesse fluxo foi percebido como oportunista e inadequado.',
          aprendizado: 'Momentos de operação crítica (bloqueio, contestação, emergência) são inadequados para ofertas comerciais. O usuário está sob estresse cognitivo e rejeita desvios do objetivo imediato.',
        },
      ],
      insightAreas: [
        {
          tema: 'Gestão de Gastos', icon: 'pi-chart-pie',
          resumo: 'Visualizações simples de categorias de gasto aumentam engajamento de forma consistente. O usuário quer entender para onde vai o dinheiro, não administrar planilhas.',
          pontos: [
            'Categorização visual aumenta frequência de acesso ao app em até 29%',
            'Usuários que acompanham categorias têm LTV 31% maior em média',
            'Alertas de orçamento devem ser configuráveis — limites impostos geram rejeição',
            'Nível máximo útil de granularidade é 2 níveis de categoria para o perfil médio',
          ],
        },
        {
          tema: 'Comunicação de Fatura', icon: 'pi-receipt',
          resumo: 'Notificações de fatura com antecedência e contexto reduzem inadimplência e aumentam NPS simultaneamente. O timing importa mais que o conteúdo.',
          pontos: [
            'Alertas com 5+ dias antes do vencimento têm taxa de pagamento integral 22% maior',
            'Resumo de gastos junto ao alerta de fatura aumenta pagamento total em 12%',
            'Notificação no dia do vencimento é percebida como cobrança, não como lembrete',
            'Push notification supera e-mail para alertas de fatura em taxa de abertura (68% vs 31%)',
          ],
        },
        {
          tema: 'Engajamento e Retenção', icon: 'pi-star',
          resumo: 'Contextos financeiros pessoais rejeitam comparação social. Gamificação deve ser individual, privada e baseada em progresso do próprio usuário.',
          pontos: [
            'Rankings públicos financeiros geram rejeição e redução de NPS consistentemente',
            'Metas de cashback personalizadas têm 3x mais adoção que programas de pontos genéricos',
            'Atalhos de segurança (bloqueio rápido) aumentam NPS sem custo operacional',
            'Usuários com atalhos customizados na home têm churn 18% menor',
          ],
        },
      ],
    },
  };

  stats          = computed(() => this.productData[this.productService.selected().id].stats);
  hipoteses      = computed(() => this.productData[this.productService.selected().id].hipoteses);
  funcionaram    = computed(() => this.productData[this.productService.selected().id].funcionaram);
  naoFuncionaram = computed(() => this.productData[this.productService.selected().id].naoFuncionaram);
  insightAreas   = computed(() => this.productData[this.productService.selected().id].insightAreas);
}
