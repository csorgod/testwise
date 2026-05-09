import { Component } from '@angular/core';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

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

@Component({
  selector: 'app-memoria-produto',
  imports: [Tabs, TabList, Tab, TabPanels, TabPanel, Tag, ButtonModule],
  templateUrl: './memoria-produto.component.html',
  styleUrl: './memoria-produto.component.scss',
})
export class MemoriaProdutoComponent {
  stats = { total: 47, funcionaram: 23, naoFuncionaram: 14 };

  hipoteses: Hipotese[] = [
    {
      titulo: 'Simplificar etapas de confirmação no fluxo PIX',
      racional:
        '3 experimentos mostram que cada etapa extra de confirmação reduz a conversão em ~8%. O fluxo atual tem 4 etapas; usuários de alta frequência esperam no máximo 2.',
      metricaAlvo: 'Conversão',
      impactoEstimado: '+18% a +24%',
      confianca: 'Alta',
      severity: 'success',
    },
    {
      titulo: 'Personalização contextual da home com base em padrão de uso',
      racional:
        'Usuários com padrão de acesso definido respondem melhor a conteúdo adaptado ao comportamento histórico do que a layouts fixos. Experimentos de widget confirmam receptividade ao opt-in.',
      metricaAlvo: 'Sessões por usuário',
      impactoEstimado: '+10% a +15%',
      confianca: 'Média',
      severity: 'warn',
    },
    {
      titulo: 'Feedback visual imediato e confirmação animada em transferências',
      racional:
        'Experimentos com animação de conclusão aumentaram NPS em cenários de pagamento. Usuários associam resposta visual instantânea a confiança e segurança, reduzindo dúvidas pós-transação.',
      metricaAlvo: 'NPS',
      impactoEstimado: '+5 a +9 pts',
      confianca: 'Alta',
      severity: 'success',
    },
  ];

  funcionaram: Aprendizado[] = [
    {
      experimento: 'Novo fluxo de confirmação PIX — 2 etapas',
      area: 'UX / Fluxos',
      periodo: 'Set–Out 2024',
      metrica: 'Conversão',
      impacto: '+23%',
      insight:
        'Reduzir de 4 para 2 etapas na confirmação eliminou o principal ponto de abandono. Usuários percebem a operação como mais rápida sem redução na percepção de segurança.',
    },
    {
      experimento: 'CTA de investimento com destaque laranja na home',
      area: 'UX / Visual',
      periodo: 'Ago–Set 2024',
      metrica: 'Sessões',
      impacto: '+15%',
      insight:
        'O uso da cor da marca em call-to-actions primários aumentou o clique orgânico em produtos de investimento sem comprometer a percepção geral da interface.',
    },
    {
      experimento: 'Onboarding guiado para novos usuários com PIX',
      area: 'Onboarding',
      periodo: 'Jun–Jul 2024',
      metrica: 'Conversão',
      impacto: '+31%',
      insight:
        'Um tutorial contextual de 3 passos na primeira utilização do PIX reduziu chamadas ao suporte e acelerou a ativação. O maior ganho foi entre usuários de 45+ anos.',
    },
    {
      experimento: 'Widget de saldo mascarado acessível na tela inicial',
      area: 'UX / Privacidade',
      periodo: 'Mai–Jun 2024',
      metrica: 'Sessões',
      impacto: '+18%',
      insight:
        'Exibir saldo mascarado com 1 toque para revelar aumentou a frequência de abertura do app. O opt-in atingiu 67%, indicando alta demanda por acesso rápido sem comprometer privacidade.',
    },
  ];

  naoFuncionaram: Aprendizado[] = [
    {
      experimento: 'Oferta proativa de crédito pessoal na tela inicial',
      area: 'Monetização',
      periodo: 'Out–Nov 2024',
      metrica: 'NPS',
      impacto: '–4 pts',
      insight:
        'Exibir ofertas de crédito não solicitadas na home gerou percepção negativa, independente da relevância do produto para o perfil do usuário.',
      aprendizado:
        'Ofertas de crédito devem ser contextuais — disparadas apenas após comportamentos que sinalizem intenção de compra ou necessidade financeira.',
    },
    {
      experimento: 'Substituição parcial do FAQ por chatbot automatizado',
      area: 'Suporte',
      periodo: 'Set–Out 2024',
      metrica: 'NPS / Churn',
      impacto: '–7 pts NPS, +3% churn',
      insight:
        'O chatbot não resolveu as dúvidas mais complexas, forçando o usuário a percorrer múltiplos canais. A experiência fragmentada foi o principal detrator.',
      aprendizado:
        'Automação de suporte requer escalonamento humano fluido. Um chatbot sem saída para atendimento humano é pior do que a ausência do chatbot.',
    },
    {
      experimento: 'Gamificação de metas de investimento',
      area: 'Engajamento',
      periodo: 'Jul–Ago 2024',
      metrica: 'Sessões',
      impacto: '–5% (investidores avançados)',
      insight:
        'A mecânica de pontos foi bem recebida por usuários iniciantes, mas percebida como infantil e distratora pelos investidores mais experientes.',
      aprendizado:
        'Estratégias de engajamento gamificado devem ser segmentadas por perfil. Um design único não serve aos diferentes níveis de sofisticação financeira.',
    },
  ];

  insightAreas: InsightArea[] = [
    {
      tema: 'UX e Fluxos',
      icon: 'pi-arrows-h',
      resumo:
        'Simplicidade é o maior alavancador de conversão. Cada etapa adicional em fluxos críticos representa perda mensurável e consistente.',
      pontos: [
        'Cada passo extra em fluxos de pagamento reduz a conversão em ~8%',
        'Usuários de alta frequência toleram menos fricção do que novos usuários',
        'Confirmações redundantes geram abandono sem aumentar percepção de segurança',
        'Feedback visual imediato substitui a necessidade de etapas de "processando"',
      ],
    },
    {
      tema: 'Comunicação e Ofertas',
      icon: 'pi-megaphone',
      resumo:
        'Mensagens proativas sem contexto de uso geram rejeição. O momento certo importa mais do que a oferta certa.',
      pontos: [
        'Ofertas não contextuais reduzem NPS independente da relevância do produto',
        'Notificações push em alto volume aumentam desinstalações em até 12%',
        'Usuários aceitam ofertas quando estão no fluxo relacionado ao produto ofertado',
        'Linguagem financeira técnica reduz engajamento em perfis de renda média',
      ],
    },
    {
      tema: 'Personalização',
      icon: 'pi-user',
      resumo:
        'Conteúdo adaptado ao comportamento histórico do usuário gera ganhos consistentes em retenção e engajamento.',
      pontos: [
        'Usuários com padrão de uso definido respondem melhor a layouts personalizados',
        'O opt-in para personalização atingiu 67%, indicando alta receptividade',
        'Segmentação por sofisticação financeira é essencial — estratégias únicas subperformam',
        'Histórico de transações é melhor preditor de intenção do que dados demográficos',
      ],
    },
  ];
}
