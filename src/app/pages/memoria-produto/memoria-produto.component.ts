import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { Dialog } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { Popover } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ProductService } from '../../core/product.service';
import { MetricService, Metric } from '../../core/metric.service';

interface Hipotese {
  titulo: string;
  racional: string;
  metricaAlvo: string;
  impactoEstimado: string;
  confianca: 'Alta' | 'Média' | 'Baixa';
  severity: 'success' | 'warn' | 'danger';
}

interface ExperimentoRef {
  titulo: string;
  periodo: string;
  metrica: string;
  resultado: string;
  variante: string;
}

interface Aprendizado {
  experimento: string;
  area: string;
  periodo: string;
  metrica: string;
  impacto: string;
  insight: string;
  aprendizado?: string;
  experimentos: ExperimentoRef[];
  resumoIA?: string;
  alternativas: { texto: string; potencial: 'Alto' | 'Médio' }[];
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
  imports: [FormsModule, Tabs, TabList, Tab, TabPanels, TabPanel, Tag, ButtonModule, SelectModule, SkeletonModule, Dialog, CarouselModule, Popover, TooltipModule],
  templateUrl: './memoria-produto.component.html',
  styleUrl: './memoria-produto.component.scss',
})
export class MemoriaProdutoComponent {
  protected productService = inject(ProductService);
  protected metricService  = inject(MetricService);

  loading = signal(true);
  selectedLearning = signal<Aprendizado | null>(null);
  modalVisible = signal(false);
  addedMetrics = signal<Metric[]>([]);

  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.productService.selected();
      if (this.loadingTimer) clearTimeout(this.loadingTimer);
      this.loading.set(true);
      this.loadingTimer = setTimeout(() => this.loading.set(false), 650);
    }, { allowSignalWrites: true });
  }

  openModal(item: Aprendizado): void {
    this.selectedLearning.set(item);
    this.addedMetrics.set([]);
    this.modalVisible.set(true);
  }

  simularAlternativa(texto: string): void {
    const params = new URLSearchParams({ hipotese: texto });
    window.open(`https://personas-sinteticas.internal/simular?${params}`, '_blank');
  }

  isMetricAdded(metric: Metric): boolean {
    return this.addedMetrics().some(m => m.id === metric.id);
  }

  toggleMetric(metric: Metric): void {
    this.addedMetrics.update(current =>
      this.isMetricAdded(metric)
        ? current.filter(m => m.id !== metric.id)
        : [...current, metric]
    );
  }

  isPositiveResult(resultado: string): boolean {
    return resultado.trimStart().startsWith('+');
  }

  private readonly productData: Record<string, ProductMemoria> = {
    mobile: {
      stats: { total: 47, funcionaram: 23, naoFuncionaram: 14 },
      hipoteses: [
        { titulo: 'Simplificar etapas de confirmação no fluxo PIX', racional: '3 experimentos mostram que cada etapa extra de confirmação reduz a conversão em ~8%. O fluxo atual tem 4 etapas; usuários de alta frequência esperam no máximo 2.', metricaAlvo: 'Conversão', impactoEstimado: '+18% a +24%', confianca: 'Alta', severity: 'success' },
        { titulo: 'Personalização contextual da home com base em padrão de uso', racional: 'Usuários com padrão de acesso definido respondem melhor a conteúdo adaptado ao comportamento histórico do que a layouts fixos.', metricaAlvo: 'Sessões por usuário', impactoEstimado: '+10% a +15%', confianca: 'Média', severity: 'warn' },
        { titulo: 'Feedback visual imediato e confirmação animada em transferências', racional: 'Experimentos com animação de conclusão aumentaram NPS em cenários de pagamento. Usuários associam resposta visual instantânea a confiança e segurança.', metricaAlvo: 'NPS', impactoEstimado: '+5 a +9 pts', confianca: 'Alta', severity: 'success' },
      ],
      funcionaram: [
        {
          experimento: 'Novo fluxo de confirmação PIX — 2 etapas',
          area: 'UX / Fluxos', periodo: 'Set–Out 2024', metrica: 'Conversão', impacto: '+23%',
          insight: 'Reduzir de 4 para 2 etapas na confirmação eliminou o principal ponto de abandono. Usuários percebem a operação como mais rápida sem redução na percepção de segurança.',
          experimentos: [
            { titulo: 'Remoção da etapa de revisão pré-envio', periodo: 'Mai 2024', metrica: 'Taxa de conclusão', resultado: '+8%', variante: 'Fluxo sem tela de revisão vs. fluxo com revisão obrigatória' },
            { titulo: 'Fusão das telas de valor e destinatário', periodo: 'Jun 2024', metrica: 'Conversão', resultado: '+12%', variante: 'Etapa única combinada vs. duas telas separadas' },
            { titulo: 'Biometria simplificada para valores abaixo de R$50', periodo: 'Ago 2024', metrica: 'Abandono', resultado: '-18%', variante: 'Confirmação rápida vs. biometria completa' },
            { titulo: 'Confirmação via push para contatos recorrentes', periodo: 'Set 2024', metrica: 'Taxa de conclusão', resultado: '+27%', variante: 'Aprovação por push notification vs. confirmação in-app obrigatória' },
          ],
          alternativas: [
            { texto: 'Testar fluxo de 1 etapa para contatos frequentes (sem etapa de revisão)', potencial: 'Alto' },
            { texto: 'Avaliar confirmação por PIN curto (4 dígitos) como substituto à biometria', potencial: 'Médio' },
            { texto: 'Medir impacto de limiar de simplificação por perfil de risco do usuário', potencial: 'Médio' },
          ],
          resumoIA: 'Os três experimentos conduzidos entre maio e setembro de 2024 testaram, de forma incremental, o impacto de remover fricção em pontos específicos do fluxo de confirmação PIX. O que ficou evidente é que o usuário não percebe simplificação como perda de segurança — pelo contrário, a velocidade passou a ser o principal indicador de confiança no processo. A conclusão mais relevante é que o fluxo ideal para transações de baixo risco é fundamentalmente diferente do que a equipe assumia: menos etapas, confirmação mais rápida e ausência de revisões redundantes não apenas melhoraram a conversão, mas aumentaram a percepção positiva da experiência.',
        },
        {
          experimento: 'CTA de investimento com destaque laranja na home',
          area: 'UX / Visual', periodo: 'Ago–Set 2024', metrica: 'Sessões', impacto: '+15%',
          insight: 'O uso da cor da marca em call-to-actions primários aumentou o clique orgânico em produtos de investimento sem comprometer a percepção geral da interface.',
          experimentos: [
            { titulo: 'Botão laranja vs. cinza no banner de investimentos', periodo: 'Ago 2024', metrica: 'CTR', resultado: '+11%', variante: 'CTA na cor da marca vs. CTA neutro padrão' },
            { titulo: 'Posição do CTA: topo vs. meio da home', periodo: 'Set 2024', metrica: 'Sessões em investimentos', resultado: '+15%', variante: 'Banner fixo no topo vs. bloco central' },
          ],
          alternativas: [
            { texto: 'Testar microcopy de urgência no CTA ("Taxa especial hoje")', potencial: 'Médio' },
            { texto: 'Avaliar personalização do CTA por perfil de investidor', potencial: 'Alto' },
            { texto: 'Medir impacto de animação sutil em dias de alta rentabilidade', potencial: 'Médio' },
          ],
          resumoIA: 'Os experimentos de agosto e setembro de 2024 confirmaram que a cor da marca, quando aplicada estrategicamente em calls-to-action de produtos prioritários, gera ganho de clique sem comprometer a harmonia visual da interface. O maior aprendizado não está no resultado em si, mas na combinação de dois fatores: o destaque da cor e o posicionamento no topo da home amplificam-se mutuamente. Separar esses efeitos nos experimentos foi o que permitiu entender o que de fato influencia o comportamento do usuário, e não apenas o que o impacta de forma superficial.',
        },
        {
          experimento: 'Onboarding guiado para novos usuários com PIX',
          area: 'Onboarding', periodo: 'Jun–Jul 2024', metrica: 'Conversão', impacto: '+31%',
          insight: 'Um tutorial contextual de 3 passos na primeira utilização do PIX reduziu chamadas ao suporte e acelerou a ativação. O maior ganho foi entre usuários de 45+ anos.',
          experimentos: [
            { titulo: 'Tutorial contextual de 3 passos vs. tela estática de boas-vindas', periodo: 'Jun 2024', metrica: 'Ativação no PIX', resultado: '+31%', variante: 'Guia interativo step-by-step vs. tela estática de apresentação' },
            { titulo: 'Passos interativos vs. vídeo explicativo', periodo: 'Jul 2024', metrica: 'Conclusão do onboarding', resultado: '+22%', variante: 'Tutorial clicável vs. vídeo de 2 min' },
          ],
          alternativas: [
            { texto: 'Segmentar onboarding por faixa etária do usuário', potencial: 'Alto' },
            { texto: 'Testar onboarding progressivo — revelado conforme o uso avança', potencial: 'Alto' },
            { texto: 'Avaliar impacto de onboarding em outros fluxos críticos (TED, investimentos)', potencial: 'Médio' },
          ],
          resumoIA: 'O tutorial interativo de três passos surgiu como resposta a uma taxa de ativação historicamente abaixo do esperado para novos usuários do PIX. Os resultados confirmaram que o formato step-by-step contextual, muito mais do que um vídeo explicativo, reduz a ansiedade do primeiro uso ao manter o usuário no controle do ritmo de aprendizado. O dado mais relevante veio da segmentação etária: o ganho de 31% na ativação foi desproporcionalmente concentrado em usuários acima de 45 anos, o que abre uma linha de investigação importante sobre como onboardings diferentes podem precisar atender perfis distintos de forma mais explícita.',
        },
        {
          experimento: 'Widget de saldo mascarado acessível na tela inicial',
          area: 'UX / Privacidade', periodo: 'Mai–Jun 2024', metrica: 'Sessões', impacto: '+18%',
          insight: 'Exibir saldo mascarado com 1 toque para revelar aumentou a frequência de abertura do app. O opt-in atingiu 67%, indicando alta demanda por acesso rápido sem comprometer privacidade.',
          experimentos: [
            { titulo: 'Saldo mascarado por padrão vs. saldo sempre visível', periodo: 'Mai 2024', metrica: 'Frequência de abertura do app', resultado: '+14%', variante: 'Mascarado com toque para revelar vs. saldo sempre visível' },
            { titulo: 'Toque único vs. duplo toque para revelar saldo', periodo: 'Jun 2024', metrica: 'Opt-in no widget', resultado: '+18%', variante: 'Um toque para revelar vs. dois toques para privacidade extra' },
          ],
          alternativas: [
            { texto: 'Testar opt-in ativo vs. passivo para o widget de privacidade', potencial: 'Alto' },
            { texto: 'Avaliar widget de saldo por conta específica na home', potencial: 'Médio' },
            { texto: 'Medir impacto do saldo mascarado em usuários com perfil de segurança elevado', potencial: 'Médio' },
          ],
          resumoIA: 'A hipótese por trás dos dois experimentos era simples: usuários querem acesso rápido ao saldo, mas sem expô-lo em contextos públicos. O que os dados mostraram vai além disso — privacidade como escolha do usuário, e não como restrição do sistema, é percebida positivamente e aumenta a frequência de abertura do app. O opt-in de 67% é o indicador mais eloquente: quando o usuário escolhe o comportamento, ele se engaja mais do que quando o sistema decide por ele.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Oferta proativa de crédito pessoal na tela inicial',
          area: 'Monetização', periodo: 'Out–Nov 2024', metrica: 'NPS', impacto: '–4 pts',
          insight: 'Exibir ofertas de crédito não solicitadas na home gerou percepção negativa, independente da relevância do produto para o perfil do usuário.',
          aprendizado: 'Ofertas de crédito devem ser contextuais — disparadas apenas após comportamentos que sinalizem intenção de compra ou necessidade financeira.',
          experimentos: [
            { titulo: 'Banner de crédito: topo vs. meio da tela', periodo: 'Out 2024', metrica: 'NPS', resultado: '-4 pts', variante: 'Banner de crédito pessoal no topo vs. no meio da home' },
            { titulo: 'Oferta de crédito segmentada por score', periodo: 'Nov 2024', metrica: 'NPS', resultado: '-3 pts', variante: 'Oferta para scores acima de 700 vs. grupo de controle sem oferta' },
          ],
          alternativas: [
            { texto: 'Testar oferta de crédito contextual no fluxo pós-pagamento aprovado', potencial: 'Alto' },
            { texto: 'Avaliar trigger baseado em comportamento de busca por crédito', potencial: 'Alto' },
            { texto: 'Exibir simulação de crédito como feature educacional, não como oferta direta', potencial: 'Médio' },
          ],
          resumoIA: 'Os dois experimentos com oferta proativa de crédito na home testaram variações de posicionamento e segmentação, mas chegaram ao mesmo resultado: a queda de NPS foi consistente independentemente de onde o banner aparecia ou para qual perfil era exibido. O contexto importou mais do que a relevância do produto. Usuários em navegação passiva na home não estão em estado mental de decisão financeira, e qualquer oferta de crédito nesse momento é interpretada como oportunismo — não como serviço.',
        },
        {
          experimento: 'Substituição parcial do FAQ por chatbot automatizado',
          area: 'Suporte', periodo: 'Set–Out 2024', metrica: 'NPS / Churn', impacto: '–7 pts NPS, +3% churn',
          insight: 'O chatbot não resolveu as dúvidas mais complexas, forçando o usuário a percorrer múltiplos canais. A experiência fragmentada foi o principal detrator.',
          aprendizado: 'Automação de suporte requer escalonamento humano fluido. Um chatbot sem saída para atendimento humano é pior do que a ausência do chatbot.',
          experimentos: [
            { titulo: 'Chatbot vs. FAQ para dúvidas sobre TED', periodo: 'Set 2024', metrica: 'CSAT do suporte', resultado: '-12%', variante: 'Chatbot automatizado vs. FAQ com links diretos' },
            { titulo: 'Chatbot com escalonamento vs. chatbot autônomo', periodo: 'Out 2024', metrica: 'NPS / Churn', resultado: '-7 pts NPS, +3% churn', variante: 'Chatbot com botão "falar com humano" vs. chatbot sem saída' },
          ],
          alternativas: [
            { texto: 'Implementar chatbot com escalonamento humano acessível em no máximo 2 cliques', potencial: 'Alto' },
            { texto: 'Testar busca inteligente no FAQ antes de introduzir chatbot conversacional', potencial: 'Médio' },
            { texto: 'Avaliar base de conhecimento com vídeos curtos como alternativa ao FAQ textual', potencial: 'Médio' },
          ],
          resumoIA: 'Os experimentos de setembro e outubro de 2024 revelaram um padrão que vai além da tecnologia do chatbot em si: o problema não foi a automação, mas a ausência de saída. Quando o usuário percebe que está preso em um loop sem acesso a um humano, a frustração ultrapassa a do problema original. O segundo experimento foi especialmente revelador — a versão com escalonamento humano acessível em dois cliques mostrou que a automação pode funcionar bem se o design contemplar, desde o início, os casos que ela inevitavelmente não vai resolver.',
        },
        {
          experimento: 'Gamificação de metas de investimento',
          area: 'Engajamento', periodo: 'Jul–Ago 2024', metrica: 'Sessões', impacto: '–5% (investidores avançados)',
          insight: 'A mecânica de pontos foi bem recebida por usuários iniciantes, mas percebida como infantil e distratora pelos investidores mais experientes.',
          aprendizado: 'Estratégias de engajamento gamificado devem ser segmentadas por perfil. Um design único não serve aos diferentes níveis de sofisticação financeira.',
          experimentos: [
            { titulo: 'Pontuação por meta de investimento atingida', periodo: 'Jul 2024', metrica: 'Engajamento na área de investimentos', resultado: '-5%', variante: 'Sistema de pontos por meta vs. sem pontuação' },
            { titulo: 'Ranking de investidores: público vs. privado', periodo: 'Ago 2024', metrica: 'NPS', resultado: '-6 pts', variante: 'Ranking público entre usuários vs. ranking anônimo' },
          ],
          alternativas: [
            { texto: 'Testar gamificação privada com metas pessoais para investidores iniciantes', potencial: 'Alto' },
            { texto: 'Avaliar mecânica de progresso visual aplicada apenas a usuários com menos de 6 meses', potencial: 'Médio' },
            { texto: 'Testar notificações de conquistas financeiras pessoais (milestones privados)', potencial: 'Médio' },
          ],
          resumoIA: 'A mecânica de pontos por metas de investimento funcionou bem para um segmento, mas prejudicou outro — e o saldo líquido foi negativo. O que os dados revelaram é que a gamificação não é neutra: usuários mais experientes interpretaram a mecânica como infantilização do produto, e o ranking público entre pares exacerbou esse efeito. A lição central é que estratégias de engajamento precisam ser invisíveis para quem não quer ser engajado — ou seja, precisam ser opt-in, e não impostas como padrão da experiência.',
        },
      ],
      insightAreas: [
        { tema: 'UX e Fluxos', icon: 'pi-arrows-h', resumo: 'Simplicidade é o maior alavancador de conversão. Cada etapa adicional em fluxos críticos representa perda mensurável e consistente.', pontos: ['Cada passo extra em fluxos de pagamento reduz a conversão em ~8%', 'Usuários de alta frequência toleram menos fricção do que novos usuários', 'Confirmações redundantes geram abandono sem aumentar percepção de segurança', 'Feedback visual imediato substitui a necessidade de etapas de "processando"'] },
        { tema: 'Comunicação e Ofertas', icon: 'pi-megaphone', resumo: 'Mensagens proativas sem contexto de uso geram rejeição. O momento certo importa mais do que a oferta certa.', pontos: ['Ofertas não contextuais reduzem NPS independente da relevância do produto', 'Notificações push em alto volume aumentam desinstalações em até 12%', 'Usuários aceitam ofertas quando estão no fluxo relacionado ao produto ofertado', 'Linguagem financeira técnica reduz engajamento em perfis de renda média'] },
        { tema: 'Personalização', icon: 'pi-user', resumo: 'Conteúdo adaptado ao comportamento histórico do usuário gera ganhos consistentes em retenção e engajamento.', pontos: ['Usuários com padrão de uso definido respondem melhor a layouts personalizados', 'O opt-in para personalização atingiu 67%, indicando alta receptividade', 'Segmentação por sofisticação financeira é essencial — estratégias únicas subperformam', 'Histórico de transações é melhor preditor de intenção do que dados demográficos'] },
      ],
    },

    ib: {
      stats: { total: 38, funcionaram: 18, naoFuncionaram: 11 },
      hipoteses: [
        { titulo: 'Reorganização do menu de navegação principal por frequência de uso', racional: 'Análise de heatmap mostra que 70% dos acessos se concentram em 4 funcionalidades. Reestruturar o menu pode reduzir o tempo médio para a primeira ação em até 40%.', metricaAlvo: 'Sessões', impactoEstimado: '+20% a +30%', confianca: 'Alta', severity: 'success' },
        { titulo: 'Autenticação via QR Code para operações sensíveis no desktop', racional: 'Usuários relatam fricção alta na autenticação por token físico. Experimentos com QR Code no mobile mostraram redução de 55% no tempo de autenticação.', metricaAlvo: 'Conversão', impactoEstimado: '+12% a +18%', confianca: 'Média', severity: 'warn' },
        { titulo: 'Dashboard de investimentos com projeção de rendimento interativa', racional: 'Usuários de IB têm perfil de maior sofisticação financeira. Visualizações de projeção aumentaram o tempo de sessão na área de investimentos em 35%.', metricaAlvo: 'NPS', impactoEstimado: '+7 a +12 pts', confianca: 'Alta', severity: 'success' },
      ],
      funcionaram: [
        {
          experimento: 'Busca global integrada a todos os serviços e extratos',
          area: 'UX / Navegação', periodo: 'Jan–Fev 2024', metrica: 'Sessões', impacto: '+27%',
          insight: 'A busca unificada reduziu o número de cliques médio para encontrar um lançamento de 7 para 2. Usuários com histórico longo de transações foram os maiores beneficiários.',
          experimentos: [
            { titulo: 'Campo de busca expandido vs. ícone de lupa colapsado', periodo: 'Jan 2024', metrica: 'Uso da busca', resultado: '+47%', variante: 'Barra de busca sempre visível no header vs. ícone flutuante' },
            { titulo: 'Resultados em tempo real vs. busca com botão confirmar', periodo: 'Fev 2024', metrica: 'Sessões', resultado: '+27%', variante: 'Resultados ao digitar vs. busca manual com Enter/botão' },
          ],
          alternativas: [
            { texto: 'Adicionar filtros contextuais por tipo de documento na busca (extrato, DDA, boleto)', potencial: 'Alto' },
            { texto: 'Testar busca por reconhecimento de voz para usuários mobile do IB', potencial: 'Médio' },
            { texto: 'Avaliar sugestões inteligentes baseadas no histórico de buscas do usuário', potencial: 'Alto' },
          ],
          resumoIA: 'Os dois experimentos do primeiro trimestre de 2024 testaram, de formas complementares, como tornar a busca mais acessível e responsiva afetaria o comportamento de uso. O resultado mais significativo não foi o ganho absoluto de sessões, mas a mudança no padrão: com a barra sempre visível e resultados em tempo real, usuários com longos históricos de transações deixaram de navegar por menus e passaram a usar a busca como porta de entrada principal. Isso sugere que, para este perfil, uma arquitetura flat com busca central pode ser mais eficaz do que qualquer hierarquia de menu bem desenhada.',
        },
        {
          experimento: 'Redesign do fluxo de agendamento de pagamentos recorrentes',
          area: 'UX / Fluxos', periodo: 'Mar–Abr 2024', metrica: 'Conversão', impacto: '+19%',
          insight: 'Consolidar confirmação e recibo em uma única tela eliminou o ponto de maior abandono. A taxa de conclusão do agendamento subiu de 61% para 80%.',
          experimentos: [
            { titulo: 'Confirmação + recibo em tela única vs. duas telas', periodo: 'Mar 2024', metrica: 'Taxa de conclusão', resultado: '+31%', variante: 'Tela unificada com resumo e comprovante vs. fluxo de 2 etapas' },
            { titulo: 'Calendário visual vs. lista de datas no agendamento', periodo: 'Abr 2024', metrica: 'Conversão', resultado: '+19%', variante: 'Calendário com pré-visualização vs. lista de datas disponíveis' },
          ],
          alternativas: [
            { texto: 'Testar agendamento inteligente com sugestão de datas baseada no histórico', potencial: 'Alto' },
            { texto: 'Avaliar template de pagamentos recorrentes por favorecido', potencial: 'Alto' },
            { texto: 'Medir impacto de resumo mensal de agendamentos na retenção dos usuários', potencial: 'Médio' },
          ],
          resumoIA: 'A análise de funil que antecedeu os experimentos identificou o ponto exato de maior abandono: a transição entre confirmação e recibo. Consolidar essas duas telas foi a intervenção de maior impacto isolado, elevando a taxa de conclusão em 31 pontos percentuais. O segundo experimento, com o calendário visual, confirmou que representações visuais de datas reduzem erros de seleção e aumentam a confiança do usuário na escolha — um efeito mais relevante do que a equipe esperava para um público corporativo que, em tese, tinha alta familiaridade com o sistema.',
        },
        {
          experimento: 'Alerta proativo de débito automático com 3 dias de antecedência',
          area: 'Comunicação', periodo: 'Nov–Dez 2023', metrica: 'NPS', impacto: '+11 pts',
          insight: 'Notificações antecipadas de débito foram percebidas como transparência e cuidado. A taxa de acionamento do suporte por surpresa na fatura caiu 34%.',
          experimentos: [
            { titulo: 'Alertas 3 dias antes vs. 1 dia antes do débito', periodo: 'Nov 2023', metrica: 'NPS pós-débito', resultado: '+11 pts', variante: 'Notificação 72h antes vs. notificação no dia anterior' },
            { titulo: 'Push notification vs. e-mail para alertas de débito', periodo: 'Dez 2023', metrica: 'Taxa de abertura', resultado: '+34%', variante: 'Push notification vs. e-mail transacional' },
          ],
          alternativas: [
            { texto: 'Testar alertas com simulação do impacto no saldo disponível após o débito', potencial: 'Alto' },
            { texto: 'Avaliar opção de postergar o débito direto pelo alerta (sem acessar o app)', potencial: 'Alto' },
            { texto: 'Medir impacto de alertas via SMS para usuários que desativaram notificações push', potencial: 'Médio' },
          ],
          resumoIA: 'O resultado dos dois experimentos deixou claro que o timing de uma comunicação proativa importa tanto quanto o conteúdo. Alertas enviados com 72 horas de antecedência foram percebidos como um serviço de transparência — enquanto alertas no dia anterior foram interpretados como lembretes de cobrança. O dado mais relevante para o roadmap é a queda de 34% nos acionamentos de suporte por surpresa na fatura: isso representa não apenas melhora de NPS, mas redução real de custo operacional, o que eleva a prioridade estratégica dessa direção.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Dashboard personalizado com widgets arrastáveis',
          area: 'UX / Customização', periodo: 'Mai–Jun 2024', metrica: 'Sessões', impacto: '–9%',
          insight: 'A interface configurável gerou confusão na primeira interação. Usuários que personalizaram o dashboard retornaram menos do que o grupo controle.',
          aprendizado: 'Customização excessiva aumenta a carga cognitiva inicial. Usuários preferem padrões bem definidos a interfaces configuráveis do zero.',
          experimentos: [
            { titulo: 'Dashboard drag-and-drop vs. layout fixo otimizado', periodo: 'Mai 2024', metrica: 'Sessões semana 2+', resultado: '-9%', variante: 'Interface completamente configurável vs. layout fixo baseado em heatmap' },
            { titulo: 'Widgets com posição livre vs. conteúdo editável', periodo: 'Jun 2024', metrica: 'Retenção 30 dias', resultado: '-7%', variante: 'Posição completamente livre vs. seções fixas com conteúdo editável' },
          ],
          alternativas: [
            { texto: 'Testar 2-3 layouts pré-definidos com alternância simples entre eles', potencial: 'Alto' },
            { texto: 'Avaliar personalização automática baseada em frequência de uso por seção', potencial: 'Alto' },
            { texto: 'Implementar "modo compacto" vs. "modo completo" como única escolha binária', potencial: 'Médio' },
          ],
          resumoIA: 'A proposta de personalização total do dashboard partia de uma premissa razoável — usuários querem controle. O que os dados revelaram é que controle e configuração são coisas distintas. Usuários que configuraram o dashboard retornaram menos, não mais, porque o esforço inicial de setup criou uma expectativa que o resultado não correspondeu. O padrão otimizado baseado em heatmap, que a equipe considerava menos sofisticado, performou melhor justamente por eliminar a decisão inicial do usuário e entregar valor imediato sem fricção de configuração.',
        },
        {
          experimento: 'Tutorial em vídeo obrigatório para novos usuários no primeiro acesso',
          area: 'Onboarding', periodo: 'Ago–Set 2023', metrica: 'Conversão', impacto: '–18%',
          insight: 'O tutorial compulsório gerou 18% de abandono imediato. Usuários que concluíram o tutorial não apresentaram melhor engajamento posterior.',
          aprendizado: 'Conteúdo educacional deve ser opcional e acionado por contexto. Onboardings lineares obrigatórios são especialmente rejeitados por usuários de IB, que valorizam autonomia.',
          experimentos: [
            { titulo: 'Vídeo tutorial obrigatório vs. tooltip contextual', periodo: 'Ago 2023', metrica: 'Conclusão do onboarding', resultado: '-18%', variante: 'Vídeo de 3 min obrigatório vs. tooltips ao interagir com cada seção' },
            { titulo: 'Onboarding linear vs. exploração com guia opcional', periodo: 'Set 2023', metrica: 'Engajamento na semana 1', resultado: '-14%', variante: 'Tutorial sequencial bloqueante vs. exploração livre com sidebar de ajuda' },
          ],
          alternativas: [
            { texto: 'Testar tooltips contextuais disparados no primeiro uso de cada funcionalidade', potencial: 'Alto' },
            { texto: 'Avaliar base de conhecimento pesquisável acessível a qualquer momento', potencial: 'Alto' },
            { texto: 'Implementar tour guiado opcional com acionamento pelo próprio usuário', potencial: 'Médio' },
          ],
          resumoIA: 'O experimento partiu de um modelo de onboarding bem estabelecido em produtos de consumo — e falhou por não considerar o contexto específico do usuário de IB. A taxa de abandono imediato de 18% é expressiva, mas o dado mais revelador é que os usuários que completaram o tutorial não tiveram melhor engajamento posterior. Isso indica que o problema não era falta de conhecimento, mas a percepção de que o tutorial bloqueava o acesso ao que o usuário realmente queria fazer. Para perfis que valorizam autonomia e eficiência, onboarding forçado é uma barreira, não um benefício.',
        },
      ],
      insightAreas: [
        { tema: 'Navegação', icon: 'pi-sitemap', resumo: 'Estrutura de menu clara e baseada em frequência de uso é crítica. Usuários de IB têm baixíssima tolerância para hierarquias profundas.', pontos: ['Menus com mais de 3 níveis de profundidade elevam o tempo médio por tarefa em 60%', 'Busca global é percebida como essencial por usuários com histórico superior a 6 meses', 'Atalhos configuráveis têm adoção menor que menus fixos bem estruturados', '70% dos acessos se concentram em 4 funcionalidades — o menu deve refletir isso'] },
        { tema: 'Comunicação Proativa', icon: 'pi-bell', resumo: 'Alertas com 3 ou mais dias de antecedência têm aceitação 3x maior que notificações no dia do evento.', pontos: ['Antecipação de eventos financeiros é percebida como cuidado, não intrusão', 'Alertas de débito automático reduzem acionamento de suporte em até 34%', 'E-mail tem maior taxa de leitura que push notification para avisos financeiros no IB', 'Frequência máxima aceitável: 2 notificações por semana para eventos não críticos'] },
        { tema: 'Customização', icon: 'pi-sliders-h', resumo: 'Interfaces altamente configuráveis têm menor adoção que experiências guiadas com boa ergonomia padrão.', pontos: ['Usuários que personalizam o dashboard retornam menos que o grupo controle', 'Customização aumenta carga cognitiva no primeiro acesso de forma significativa', 'Preferências salvas automaticamente pelo sistema superam configurações manuais', 'Ofereça 2-3 layouts pré-definidos antes de abrir para customização livre'] },
      ],
    },

    pj: {
      stats: { total: 29, funcionaram: 14, naoFuncionaram: 9 },
      hipoteses: [
        { titulo: 'Fluxo de pagamento em lote com aprovação multinível configurável', racional: 'Empresas com mais de 3 operadores relatam gargalo no processo de aprovação. Um fluxo com aprovação hierárquica configurável pode aumentar o volume de transações mensais em até 35%.', metricaAlvo: 'Faturamento', impactoEstimado: '+25% a +35%', confianca: 'Alta', severity: 'success' },
        { titulo: 'Relatório de fluxo de caixa com exportação parametrizável', racional: 'O principal motivo de acesso ao IB PJ é consulta de extratos para conciliação. Facilitar a exportação pode reduzir o tempo médio dessa tarefa de 12 para 3 minutos.', metricaAlvo: 'NPS', impactoEstimado: '+10 a +16 pts', confianca: 'Média', severity: 'warn' },
        { titulo: 'Visão consolidada de múltiplos CNPJs em um único acesso', racional: 'Clientes PJ com mais de um CNPJ realizam em média 4 logins separados por sessão. Consolidação em uma interface única eliminaria essa fricção.', metricaAlvo: 'Sessões', impactoEstimado: '+18% a +25%', confianca: 'Alta', severity: 'success' },
      ],
      funcionaram: [
        {
          experimento: 'Pagamento em lote com agrupamento de boletos por fornecedor',
          area: 'Eficiência / Fluxos', periodo: 'Out–Nov 2023', metrica: 'Faturamento', impacto: '+41%',
          insight: 'Agrupar boletos automaticamente por CNPJ do fornecedor reduziu o tempo de operação de 18 para 4 minutos. Adoção foi de 78% entre empresas com mais de 10 pagamentos mensais.',
          experimentos: [
            { titulo: 'Agrupamento automático por CNPJ vs. seleção manual', periodo: 'Out 2023', metrica: 'Tempo de operação', resultado: '-78%', variante: 'Agrupamento por CNPJ sugerido automaticamente vs. seleção item a item' },
            { titulo: 'Interface visual de lote vs. upload de arquivo de remessa', periodo: 'Nov 2023', metrica: 'Faturamento operacional', resultado: '+41%', variante: 'Interface visual interativa vs. upload de arquivo .rem' },
          ],
          alternativas: [
            { texto: 'Testar aprovação em lote com visualização de impacto no fluxo de caixa antes de confirmar', potencial: 'Alto' },
            { texto: 'Avaliar agrupamento por data de vencimento como critério adicional ao CNPJ', potencial: 'Médio' },
            { texto: 'Medir impacto de limite configurável de aprovação por alçada hierárquica', potencial: 'Alto' },
          ],
          resumoIA: 'Os dois experimentos de outubro e novembro de 2023 abordaram o problema do pagamento em lote por ângulos complementares: o primeiro testou como organizar os dados (agrupamento automático vs. manual), e o segundo testou como apresentar a interface (visual vs. upload de arquivo). Ambos tiveram resultados expressivos, mas o mais transformador foi o agrupamento por CNPJ — não apenas pelo ganho de tempo, mas porque mudou a percepção do produto. Empresas com alto volume de pagamentos passaram a ver o sistema como um aliado operacional, não apenas como um canal de transação.',
        },
        {
          experimento: 'Exportação de extrato em CSV e OFX direto da listagem',
          area: 'UX / Dados', periodo: 'Fev–Mar 2024', metrica: 'NPS', impacto: '+14 pts',
          insight: 'A exportação direta com filtro de período eliminou a necessidade de suporte para obtenção de relatórios. O volume de chamados para extrato caiu 61% no mês seguinte ao lançamento.',
          experimentos: [
            { titulo: 'Exportação inline na listagem vs. acesso pelo menu de relatórios', periodo: 'Fev 2024', metrica: 'Chamados ao suporte p/ extrato', resultado: '-61%', variante: 'Botão de exportação direto na tabela vs. menu separado de relatórios' },
            { titulo: 'Filtros de período: presets rápidos vs. calendário customizado', periodo: 'Mar 2024', metrica: 'NPS', resultado: '+14 pts', variante: 'Botões de atalho (7d, 30d, 90d) vs. calendário de seleção livre' },
          ],
          alternativas: [
            { texto: 'Testar exportação agendada automática para e-mail ou SFTP', potencial: 'Alto' },
            { texto: 'Avaliar integração direta com ERPs via API para conciliação automática', potencial: 'Alto' },
            { texto: 'Medir adoção de formato OFX parametrizável por categoria de despesa', potencial: 'Médio' },
          ],
          resumoIA: 'Os dois experimentos mostraram que a exportação de dados é, para o usuário PJ, um caso de uso prioritário — não uma funcionalidade secundária. Colocar o botão de exportação diretamente na listagem, sem desviar para um menu de relatórios, reduziu em 61% os chamados ao suporte para obtenção de extratos. O segundo experimento com presets de período confirmou que usuários PJ têm padrões de consulta previsíveis e que qualquer esforço extra além dos atalhos comuns (7, 30 ou 90 dias) é percebido como obstáculo desnecessário.',
        },
        {
          experimento: 'Indicador de limite de crédito PJ em tempo real no dashboard',
          area: 'Transparência', periodo: 'Dez 2023–Jan 2024', metrica: 'Sessões', impacto: '+22%',
          insight: 'Exibir o limite disponível de forma proeminente aumentou o uso de crédito rotativo PJ e reduziu pedidos de informação ao gerente de conta.',
          experimentos: [
            { titulo: 'Card de limite no dashboard vs. acesso pelo menu financeiro', periodo: 'Dez 2023', metrica: 'Cliques em crédito rotativo', resultado: '+33%', variante: 'Destaque proeminente no dashboard vs. acesso pelo menu lateral financeiro' },
            { titulo: 'Limite em tempo real vs. atualização D+1', periodo: 'Jan 2024', metrica: 'Sessões', resultado: '+22%', variante: 'Saldo atualizado em tempo real vs. atualização diária' },
          ],
          alternativas: [
            { texto: 'Testar projeção de limite necessário baseada no histórico de uso mensal', potencial: 'Alto' },
            { texto: 'Avaliar alerta proativo quando limite cai abaixo de threshold configurável pela empresa', potencial: 'Alto' },
            { texto: 'Implementar comparativo de limite utilizado vs. mesmo período anterior', potencial: 'Médio' },
          ],
          resumoIA: 'A hipótese era que visibilidade proativa do limite de crédito disponível aumentaria a utilização do produto — e os dados confirmaram isso de forma direta. Mas o resultado mais interessante veio do segundo experimento: a diferença entre dados em tempo real e atualização D+1 gerou aumento de 22% em sessões, sugerindo que a confiança do usuário PJ no dado está diretamente ligada à percepção de que ele é atual. Em contextos onde decisões financeiras são tomadas com frequência ao longo do dia, a defasagem de 24 horas é suficiente para tornar o indicador irrelevante.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Categorização automática de despesas por IA',
          area: 'Automação', periodo: 'Abr–Mai 2024', metrica: 'NPS', impacto: '–6 pts',
          insight: 'A categorização automática cometeu erros em 23% das transações. No contexto PJ, onde precisão contábil é crítica, cada erro gerou correção manual e percepção de retrabalho.',
          aprendizado: 'Automação que erra é pior que ausência de automação no PJ. IA em conciliação contábil exige precisão acima de 98% antes de ser viável como padrão.',
          experimentos: [
            { titulo: 'Categorização silenciosa vs. com confirmação do usuário', periodo: 'Abr 2024', metrica: 'NPS', resultado: '-6 pts', variante: 'Automação sem aviso vs. proposta de categoria aguardando confirmação' },
            { titulo: 'Modelo de IA por CNAE vs. modelo genérico', periodo: 'Mai 2024', metrica: 'Precisão das categorizações', resultado: '-23% acurácia', variante: 'IA treinada por segmento CNAE vs. modelo genérico' },
          ],
          alternativas: [
            { texto: 'Testar categorização por sugestão (IA propõe, usuário confirma) antes de automatizar', potencial: 'Alto' },
            { texto: 'Avaliar precisão de modelo por CNAE em sandbox antes do lançamento', potencial: 'Médio' },
            { texto: 'Aplicar categorização automática somente a fornecedores com histórico superior a 3 meses', potencial: 'Alto' },
          ],
          resumoIA: 'Os experimentos de abril e maio de 2024 testaram modelos diferentes de categorização automática, mas ambos esbarraram no mesmo problema fundamental: no contexto PJ, onde precisão contábil é um requisito, uma taxa de erro de 23% é percebida como retrabalho — não como assistência. O resultado mais revelador foi a comparação entre categorização silenciosa e com confirmação: mesmo a versão com confirmação teve NPS negativo, porque o usuário já havia perdido a confiança no modelo antes de validar qualquer sugestão. Isso redefine o threshold mínimo de precisão para qualquer automação neste segmento.',
        },
        {
          experimento: 'Onboarding assistido em vídeo para novos operadores do sistema',
          area: 'Onboarding', periodo: 'Jan–Fev 2024', metrica: 'Conversão', impacto: '–12%',
          insight: 'Operadores PJ ignoraram o fluxo de vídeo e buscaram diretamente a funcionalidade desejada. O tutorial linear não se adequa ao padrão de uso não-sequencial do ambiente corporativo.',
          aprendizado: 'Operadores PJ preferem documentação textual consultável e search a fluxos guiados lineares.',
          experimentos: [
            { titulo: 'Vídeo tutorial vs. guia textual passo a passo', periodo: 'Jan 2024', metrica: 'Conclusão do onboarding', resultado: '-12%', variante: 'Vídeo tutorial vs. guia interativo com screenshots e texto' },
            { titulo: 'Onboarding obrigatório vs. opcional com badge de conclusão', periodo: 'Fev 2024', metrica: 'Abandono na boas-vindas', resultado: '+18%', variante: 'Fluxo bloqueante vs. skip com incentivo visual de conclusão' },
          ],
          alternativas: [
            { texto: 'Testar tooltips contextuais disparados na primeira ação em cada seção crítica', potencial: 'Alto' },
            { texto: 'Avaliar base de conhecimento com casos de uso práticos segmentados por CNAE', potencial: 'Médio' },
            { texto: 'Implementar modo de treino em sandbox separado do ambiente de produção real', potencial: 'Médio' },
          ],
          resumoIA: 'Os experimentos confirmaram algo que a equipe suspeitava, mas não havia testado formalmente: operadores PJ não consomem conteúdo educacional de forma linear. Eles chegam ao sistema com um objetivo específico e buscam diretamente a funcionalidade — qualquer obstáculo antes disso é interpretado como perda de tempo. O dado mais revelador foi que o tutorial obrigatório gerou abandono, mas os usuários retornaram e completaram a tarefa por conta própria. O produto era utilizável; o onboarding é que estava no caminho.',
        },
      ],
      insightAreas: [
        { tema: 'Eficiência Operacional', icon: 'pi-bolt', resumo: 'Fluxos de pagamento em lote são o maior driver de adoção PJ. Reduzir cliques em operações recorrentes tem o mais alto ROI entre todos os experimentos.', pontos: ['Pagamentos recorrentes para os mesmos fornecedores representam 65% do volume de operações', 'Cada minuto salvo em fluxos de pagamento se traduz em percepção de valor mensurável', 'Aprovação multinível é requisito não-negociável para empresas acima de 5 funcionários', 'Agendamento recorrente é subutilizado (8% de adoção) — ponto de oportunidade alto'] },
        { tema: 'Transparência de Dados', icon: 'pi-database', resumo: 'O usuário PJ consome dados brutos. Exportação fácil e confiável tem maior valor percebido do que visualizações elaboradas.', pontos: ['Exportação de extrato é o segundo motivo mais frequente de acesso ao sistema', 'Formato OFX tem adoção 3x maior que PDF para conciliação contábil', 'Dashboards visuais têm menor engajamento que tabelas de dados entre usuários PJ', 'Confiabilidade dos dados importa mais que velocidade de carregamento para este perfil'] },
        { tema: 'Automação e IA', icon: 'pi-microchip-ai', resumo: 'No contexto PJ, IA que erra é pior que ausência de automação. Precisão acima de 98% é requisito antes de qualquer lançamento em produção.', pontos: ['Erros de categorização geram retrabalho manual percebido como custo maior que o benefício', 'Sugestões de IA (não automáticas) têm melhor aceitação que automações silenciosas', 'Usuários PJ exigem rastreabilidade — toda ação automatizada precisa de log auditável', 'Automação deve começar em tarefas de baixo risco: formatação, agrupamento, notificações'] },
      ],
    },

    cards: {
      stats: { total: 43, funcionaram: 21, naoFuncionaram: 13 },
      hipoteses: [
        { titulo: 'Visualização de gastos por categoria com alertas de orçamento', racional: '2 experimentos com categorização visual mostraram aumento de 29% nas sessões. Adicionar alertas de orçamento configuráveis deve ampliar o engajamento e a percepção de controle financeiro.', metricaAlvo: 'Sessões', impactoEstimado: '+15% a +22%', confianca: 'Alta', severity: 'success' },
        { titulo: 'Fluxo simplificado de solicitação de aumento de limite em 2 etapas', racional: 'O fluxo atual tem 6 etapas com 3 confirmações redundantes. Dados de funil mostram 58% de abandono na etapa 3. Simplificação pode dobrar a taxa de conclusão.', metricaAlvo: 'Conversão', impactoEstimado: '+28% a +40%', confianca: 'Alta', severity: 'success' },
        { titulo: 'Notificação contextual de parcelamento no momento da compra', racional: 'Usuários que parcelam voluntariamente têm LTV 40% maior. Oferecer parcelamento como sugestão contextual no histórico de compras acima de R$200 pode aumentar a adesão.', metricaAlvo: 'Faturamento', impactoEstimado: '+8% a +14%', confianca: 'Média', severity: 'warn' },
      ],
      funcionaram: [
        {
          experimento: 'Categorização visual de gastos no extrato com ícones por categoria',
          area: 'UX / Dados', periodo: 'Mar–Abr 2024', metrica: 'Sessões', impacto: '+29%',
          insight: 'A categorização visual transformou o extrato de uma lista de débitos em um painel de gestão financeira. Usuários passaram a acessar o app ativamente para acompanhar gastos.',
          experimentos: [
            { titulo: 'Ícones visuais por categoria vs. rótulo textual no extrato', periodo: 'Mar 2024', metrica: 'Sessões na área de extrato', resultado: '+29%', variante: 'Ícones coloridos por categoria vs. texto descritivo' },
            { titulo: 'Categorias automáticas vs. configuradas manualmente', periodo: 'Abr 2024', metrica: 'Adoção da feature', resultado: '+61%', variante: 'Categorização automática ativa vs. categorização manual' },
          ],
          alternativas: [
            { texto: 'Adicionar subcategoria de nível 2 como expansão opcional (não exibida por padrão)', potencial: 'Médio' },
            { texto: 'Testar gráfico de pizza semanal de gastos por categoria na home', potencial: 'Alto' },
            { texto: 'Avaliar alertas de orçamento configuráveis por categoria', potencial: 'Alto' },
          ],
          resumoIA: 'Os dois experimentos de março e abril de 2024 transformaram o extrato de cartão de um registro passivo de débitos em um painel ativo de gestão financeira. O ganho de 29% em sessões na área de extrato é significativo, mas o indicador mais relevante é que a mudança de comportamento foi espontânea — usuários passaram a acessar o app proativamente para acompanhar gastos, sem qualquer incentivo adicional. A adoção de 61% da categorização automática, muito acima do esperado, confirmou que usuários preferem categorias propostas pelo sistema quando são precisas, em vez de configurações manuais.',
        },
        {
          experimento: 'Redesign do fluxo de contestação de lançamento na fatura',
          area: 'UX / Fluxos', periodo: 'Jan–Fev 2024', metrica: 'NPS', impacto: '+18 pts',
          insight: 'Reduzir de 8 para 3 etapas e adicionar status em tempo real eliminou o principal driver de insatisfação. O volume de ligações ao SAC sobre contestações caiu 44%.',
          experimentos: [
            { titulo: 'Fluxo de contestação: 3 etapas vs. 8 etapas', periodo: 'Jan 2024', metrica: 'Taxa de conclusão da contestação', resultado: '+52%', variante: 'Fluxo enxuto 3 etapas vs. fluxo atual de 8 etapas' },
            { titulo: 'Status em tempo real vs. atualização por e-mail', periodo: 'Fev 2024', metrica: 'NPS', resultado: '+18 pts', variante: 'Tracking do status no app vs. notificação apenas por e-mail' },
          ],
          alternativas: [
            { texto: 'Testar contestação por foto diretamente do extrato (câmera integrada ao fluxo)', potencial: 'Alto' },
            { texto: 'Avaliar histórico de contestações anteriores como referência no fluxo atual', potencial: 'Médio' },
            { texto: 'Medir impacto de previsão de prazo de resolução no NPS durante a contestação', potencial: 'Alto' },
          ],
          resumoIA: 'O redesign do fluxo de contestação foi guiado por uma análise de funil que revelava 8 etapas onde a maioria dos usuários desistia antes de concluir. Ao consolidar em 3 etapas e adicionar rastreamento em tempo real, o experimento eliminou simultaneamente dois problemas distintos: a barreira de conclusão, resolvida pela simplificação, e a ansiedade pós-envio, resolvida pelo status ao vivo. A queda de 44% nos chamados ao SAC sobre contestações é o dado mais concreto do impacto — e indica que parte significativa do volume de suporte era gerada pela interface, não pelo processo em si.',
        },
        {
          experimento: 'Alerta de fatura próxima ao vencimento com resumo de gastos',
          area: 'Comunicação', periodo: 'Nov–Dez 2023', metrica: 'Faturamento', impacto: '+12%',
          insight: 'O alerta com resumo reduziu a taxa de pagamento mínimo e aumentou o pagamento integral. Usuários relataram que o resumo os ajudou a priorizar o pagamento do cartão.',
          experimentos: [
            { titulo: 'Alerta com valor total vs. alerta com resumo de categorias', periodo: 'Nov 2023', metrica: 'Taxa de pagamento integral', resultado: '+12%', variante: 'Alerta com valor + top 3 categorias de gasto vs. alerta só com valor' },
            { titulo: 'Envio 5 dias vs. 3 dias antes do vencimento', periodo: 'Dez 2023', metrica: 'Taxa de abertura do alerta', resultado: '+22%', variante: 'Push 5 dias antes vs. push 3 dias antes do vencimento' },
          ],
          alternativas: [
            { texto: 'Testar sugestão de parcelamento quando valor da fatura ultrapassa threshold', potencial: 'Alto' },
            { texto: 'Avaliar comparativo de gastos do mês vs. mesmo mês anterior no alerta', potencial: 'Alto' },
            { texto: 'Medir impacto de opção de agendar o pagamento direto pelo alerta', potencial: 'Médio' },
          ],
          resumoIA: 'Os experimentos de novembro e dezembro de 2023 testaram duas dimensões do mesmo alerta de fatura: o conteúdo e o timing. O resultado mais inesperado foi o impacto do resumo de categorias no comportamento de pagamento — usuários que viram um sumário dos gastos antes do vencimento pagaram mais a fatura integral, sugerindo que transparência sobre o que foi gasto reduz a resistência ao pagamento total. O timing de 5 dias foi superior ao de 3 dias, indicando que o usuário precisa de tempo suficiente para reorganizar o orçamento, não apenas de um lembrete de última hora.',
        },
        {
          experimento: 'Atalho rápido para bloqueio e desbloqueio do cartão na home',
          area: 'UX / Segurança', periodo: 'Set–Out 2023', metrica: 'NPS', impacto: '+9 pts',
          insight: 'O atalho reduziu de 6 para 1 toque o acesso ao bloqueio. Usuários que bloquearam o cartão por precaução relataram alta percepção de controle e segurança.',
          experimentos: [
            { titulo: 'Atalho de bloqueio na home vs. acesso pelo menu de conta', periodo: 'Set 2023', metrica: 'Uso do bloqueio preventivo', resultado: '+140%', variante: 'Toggle na tela principal vs. Menu > Conta > Segurança' },
            { titulo: 'Toggle visual vs. modal de confirmação antes de bloquear', periodo: 'Out 2023', metrica: 'NPS', resultado: '+9 pts', variante: 'Switch on/off imediato vs. diálogo de confirmação com dois passos' },
          ],
          alternativas: [
            { texto: 'Expandir atalhos rápidos para outras funções de segurança (limite online, viagem)', potencial: 'Alto' },
            { texto: 'Testar bloqueio temporário automático baseado em uso suspeito detectado', potencial: 'Médio' },
            { texto: 'Avaliar widget de controles do cartão como módulo dedicado na tela inicial', potencial: 'Alto' },
          ],
          resumoIA: 'Os dois experimentos testaram tanto a visibilidade quanto o mecanismo do atalho de bloqueio, e os resultados foram complementares. O aumento de 140% no uso do bloqueio preventivo não significa que houve mais incidentes — significa que usuários que antes ignoravam a funcionalidade passaram a usá-la como medida de precaução habitual. Isso alterou a percepção do produto: o cartão deixou de ser algo que o usuário administra apenas quando há um problema, e passou a ser algo que ele controla proativamente. O ganho de NPS reflete essa mudança de posição, não apenas a praticidade do atalho.',
        },
      ],
      naoFuncionaram: [
        {
          experimento: 'Programa de pontos gamificado com ranking público entre usuários',
          area: 'Engajamento', periodo: 'Mai–Jun 2024', metrica: 'NPS', impacto: '–5 pts',
          insight: 'O ranking público gerou desconforto em usuários que se sentiram expostos financeiramente. A comparação social em contexto de finanças pessoais foi percebida como invasiva.',
          aprendizado: 'Gamificação financeira funciona quando é estritamente privada e baseada nas metas do próprio usuário. Comparação social é contraproducente neste contexto.',
          experimentos: [
            { titulo: 'Ranking público entre usuários vs. sem ranking', periodo: 'Mai 2024', metrica: 'NPS', resultado: '-5 pts', variante: 'Ranking visível para todos vs. sem funcionalidade de ranking' },
            { titulo: 'Pontos por volume de gasto vs. por comportamento saudável', periodo: 'Jun 2024', metrica: 'Engajamento com o programa', resultado: '-8%', variante: 'Pontos por R$ gasto vs. pontos por pagamento integral da fatura' },
          ],
          alternativas: [
            { texto: 'Testar programa de pontos privado com metas pessoais (sem comparação social)', potencial: 'Alto' },
            { texto: 'Avaliar cashback direto vs. pontos acumuláveis como benefício de engajamento', potencial: 'Alto' },
            { texto: 'Medir impacto de metas de hábitos financeiros (pagar fatura integral por 3 meses)', potencial: 'Médio' },
          ],
          resumoIA: 'Os dois experimentos sobre gamificação chegaram à mesma conclusão por caminhos diferentes: comparação social em contexto financeiro gera desconforto, não engajamento. O ranking público foi o fator de maior rejeição — usuários relataram sentir sua situação financeira exposta de forma involuntária. O segundo experimento, que testou critérios diferentes de pontuação, confirmou que o problema não estava na mecânica de pontos em si, mas no componente social. Em finanças pessoais, qualquer comparação entre usuários é percebida como invasão de privacidade, independentemente de quão anônima seja a apresentação.',
        },
        {
          experimento: 'Extrato detalhado com subcategorias de 3 níveis de granularidade',
          area: 'UX / Dados', periodo: 'Jul–Ago 2023', metrica: 'Sessões', impacto: '–8%',
          insight: 'A hierarquia de 3 níveis sobrecarregou visualmente o extrato. Usuários reduziram a frequência de acesso, preferindo a visão resumida anterior.',
          aprendizado: 'Excesso de granularidade em dados financeiros pessoais aumenta a ansiedade do usuário. A categoria de primeiro nível resolve 80% dos casos de uso.',
          experimentos: [
            { titulo: 'Subcategorias de 3 níveis vs. 2 níveis no extrato', periodo: 'Jul 2023', metrica: 'Sessões na área de extrato', resultado: '-8%', variante: '3 níveis de hierarquia vs. 2 níveis com subcategoria colapsada' },
            { titulo: 'Subcategorias expandidas por padrão vs. expansão sob demanda', periodo: 'Ago 2023', metrica: 'Taxa de acesso ao extrato', resultado: '-11%', variante: 'Todos os níveis expandidos ao abrir vs. nível 1 com expansão manual' },
          ],
          alternativas: [
            { texto: 'Testar nível 2 de categoria como expansão opcional com 1 toque por linha', potencial: 'Alto' },
            { texto: 'Avaliar subcategorias apenas para as 3 maiores categorias de gasto do usuário', potencial: 'Médio' },
            { texto: 'Implementar tendência mensal por categoria de nível 1 como visualização padrão', potencial: 'Alto' },
          ],
          resumoIA: 'A hipótese de que mais granularidade nos dados financeiros levaria a maior engajamento mostrou-se incorreta para o perfil médio de usuário de cartão. Os dois experimentos evidenciaram que a hierarquia de três níveis não apenas não foi usada — ela afastou usuários que antes acessavam o extrato regularmente. O fenômeno é contraintuitivo: oferecer mais informação sem que o usuário a tenha pedido cria um senso de complexidade que se associa negativamente ao produto. O nível de categoria principal resolve a grande maioria dos casos de uso sem gerar essa sobrecarga.',
        },
        {
          experimento: 'Oferta de seguro de viagem no momento do bloqueio internacional',
          area: 'Monetização', periodo: 'Fev–Mar 2024', metrica: 'NPS', impacto: '–3 pts',
          insight: 'O momento do bloqueio é de alta concentração do usuário em uma tarefa específica. Inserir uma oferta nesse fluxo foi percebido como oportunista e inadequado.',
          aprendizado: 'Momentos de operação crítica são inadequados para ofertas comerciais. O usuário está sob estresse cognitivo e rejeita desvios do objetivo imediato.',
          experimentos: [
            { titulo: 'Oferta de seguro durante o bloqueio vs. push 1 dia antes', periodo: 'Fev 2024', metrica: 'NPS do fluxo de bloqueio', resultado: '-3 pts', variante: 'Banner no step 2 do bloqueio vs. push notification contextual' },
            { titulo: 'Oferta em tela própria vs. banner inline no fluxo', periodo: 'Mar 2024', metrica: 'Conversão do seguro', resultado: '-21%', variante: 'Tela dedicada ao seguro vs. banner dentro do fluxo de bloqueio' },
          ],
          alternativas: [
            { texto: 'Testar oferta de seguro no fluxo de compra de passagem (contextual)', potencial: 'Alto' },
            { texto: 'Avaliar sugestão baseada em histórico de viagens internacionais recorrentes', potencial: 'Alto' },
            { texto: 'Medir receptividade via push 7 dias antes de viagens recorrentes identificadas', potencial: 'Médio' },
          ],
          resumoIA: 'Os dois experimentos confirmaram que o momento da oferta importa mais do que a relevância do produto ou o perfil do usuário. O fluxo de bloqueio internacional é um contexto de alta concentração — o usuário está resolvendo um problema pontual e qualquer desvio é percebido como obstáculo. O resultado negativo foi consistente tanto quando a oferta aparecia como banner inline quanto quando ocupava uma tela dedicada, sugerindo que o problema não era de formato, mas de contexto. Ofertas de seguro têm maior receptividade quando surgem no momento em que o usuário demonstra intenção de viajar, não quando está gerenciando o cartão.',
        },
      ],
      insightAreas: [
        { tema: 'Gestão de Gastos', icon: 'pi-chart-pie', resumo: 'Visualizações simples de categorias de gasto aumentam engajamento de forma consistente. O usuário quer entender para onde vai o dinheiro, não administrar planilhas.', pontos: ['Categorização visual aumenta frequência de acesso ao app em até 29%', 'Usuários que acompanham categorias têm LTV 31% maior em média', 'Alertas de orçamento devem ser configuráveis — limites impostos geram rejeição', 'Nível máximo útil de granularidade é 2 níveis de categoria para o perfil médio'] },
        { tema: 'Comunicação de Fatura', icon: 'pi-receipt', resumo: 'Notificações de fatura com antecedência e contexto reduzem inadimplência e aumentam NPS simultaneamente. O timing importa mais que o conteúdo.', pontos: ['Alertas com 5+ dias antes do vencimento têm taxa de pagamento integral 22% maior', 'Resumo de gastos junto ao alerta de fatura aumenta pagamento total em 12%', 'Notificação no dia do vencimento é percebida como cobrança, não como lembrete', 'Push notification supera e-mail para alertas de fatura em taxa de abertura (68% vs 31%)'] },
        { tema: 'Engajamento e Retenção', icon: 'pi-star', resumo: 'Contextos financeiros pessoais rejeitam comparação social. Gamificação deve ser individual, privada e baseada em progresso do próprio usuário.', pontos: ['Rankings públicos financeiros geram rejeição e redução de NPS consistentemente', 'Metas de cashback personalizadas têm 3x mais adoção que programas de pontos genéricos', 'Atalhos de segurança (bloqueio rápido) aumentam NPS sem custo operacional', 'Usuários com atalhos customizados na home têm churn 18% menor'] },
      ],
    },
  };

  stats          = computed(() => this.productData[this.productService.selected().id].stats);
  hipoteses      = computed(() => this.productData[this.productService.selected().id].hipoteses);
  funcionaram    = computed(() => this.productData[this.productService.selected().id].funcionaram);
  naoFuncionaram = computed(() => this.productData[this.productService.selected().id].naoFuncionaram);
  insightAreas   = computed(() => this.productData[this.productService.selected().id].insightAreas);
}
