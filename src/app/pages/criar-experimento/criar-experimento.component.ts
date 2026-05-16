import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ProductService } from '../../core/product.service';

@Component({
  selector: 'app-criar-experimento',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule, InputTextModule, TextareaModule, SelectModule,
    MultiSelectModule, InputNumberModule, SliderModule,
    DatePickerModule, DividerModule, TooltipModule, TagModule,
  ],
  templateUrl: './criar-experimento.component.html',
  styleUrl: './criar-experimento.component.scss',
})
export class CriarExperimentoComponent {
  private readonly router = inject(Router);
  readonly productService = inject(ProductService);

  // ── Form fields ──────────────────────────────────────────
  nome = '';
  hipotese = '';
  area = '';
  produto = this.productService.selected();

  controleNome = 'Controle (A)';
  controleDescricao = '';
  varianteNome = 'Variante (B)';
  varianteDescricao = '';
  trafficSplit = 50;

  metricaPrincipal = '';
  confianca = '';
  impactoMinimo: number | null = null;

  dataInicio: Date | null = null;
  duracaoDias: number | null = 14;
  audienciaPercent: number | null = 100;

  plataformas: string[] = [];
  responsavel = '';
  observacoes = '';

  saving = signal(false);

  // ── Options ──────────────────────────────────────────────
  readonly areaOptions = [
    { label: 'Checkout',         value: 'Checkout' },
    { label: 'Onboarding',       value: 'Onboarding' },
    { label: 'Engajamento',      value: 'Engajamento' },
    { label: 'Retenção',         value: 'Retenção' },
    { label: 'Monetização',      value: 'Monetização' },
    { label: 'Performance',      value: 'Performance' },
    { label: 'Notificações',     value: 'Notificações' },
    { label: 'Navegação',        value: 'Navegação' },
  ];

  readonly confiancaOptions = [
    { label: '90% — exploratório',  value: '90' },
    { label: '95% — padrão',        value: '95' },
    { label: '99% — alta precisão', value: '99' },
  ];

  readonly plataformaOptions = [
    { label: 'iOS',      value: 'ios' },
    { label: 'Android',  value: 'android' },
    { label: 'Web',      value: 'web' },
    { label: 'Desktop',  value: 'desktop' },
  ];

  readonly metricaOptions = [
    { label: 'Taxa de conversão',      value: 'conversao' },
    { label: 'Faturamento',            value: 'faturamento' },
    { label: 'NPS',                    value: 'nps' },
    { label: 'Sessões ativas',         value: 'sessoes' },
    { label: 'Churn rate',             value: 'churn' },
    { label: 'Tempo na sessão',        value: 'tempo_sessao' },
    { label: 'Taxa de retenção D7',    value: 'retencao_d7' },
    { label: 'Ticket médio',           value: 'ticket_medio' },
  ];

  get trafficA() { return this.trafficSplit; }
  get trafficB() { return 100 - this.trafficSplit; }

  get formValid(): boolean {
    return !!(
      this.nome.trim() &&
      this.hipotese.trim() &&
      this.area &&
      this.metricaPrincipal &&
      this.confianca &&
      this.controleDescricao.trim() &&
      this.varianteDescricao.trim()
    );
  }

  goBack(): void {
    this.router.navigate(['/experimentos']);
  }

  salvar(): void {
    if (!this.formValid) return;
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.router.navigate(['/experimentos']);
    }, 1200);
  }
}
