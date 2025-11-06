import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Api } from '../api';
import { Chart } from 'chart.js/auto'; // 1. Importar o Chart.js

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  // 2. CORREÇÃO: Adicionámos o '!' para o @ViewChild
  @ViewChild('tempChart') tempChartRef!: ElementRef;
  @ViewChild('umidadeChart') umidadeChartRef!: ElementRef;
  @ViewChild('phChart') phChartRef!: ElementRef;

  // 3. CORREÇÃO: Adicionámos '| undefined' para as instâncias do gráfico
  private tempChart: Chart | undefined;
  private umidadeChart: Chart | undefined;
  private phChart: Chart | undefined;

  constructor(private apiServise: Api) { }

  dados: any[] = [];
  dataSelecionada: string = new Date().toISOString();

  ngOnInit() {
    this.carregarDados(); // Função original
  }

  carregarDados(): any {
    this.apiServise.getSensor().subscribe({ // Função original
      next: (data: any[]) => {
        console.log(data);
        this.dados = data;
        this.criarGraficos();
      },
      error: (err) => {
        console.error('Erro ao carregar dados do sensor:', err);
      }
    })
  }

  getData(dataHistorico: string): void {
    console.log(dataHistorico);
    
    // Formatar a data para 'YYYY-MM-DD' como a API espera
    const dataFormatada = dataHistorico.split('T')[0];
    console.log('Data formatada:', dataFormatada);

    this.apiServise.getHistorico(dataFormatada).subscribe({ // Função original
      next: (data: any[]) => {
        console.log(data);
        this.dados = data;
        this.criarGraficos(); // Chamar a função para recriar os gráficos
      },
      error: (err) => {
        console.error('Erro ao carregar dados do sensor:', err);
      }
    })
  }

  // Nova função para criar/atualizar os gráficos
  criarGraficos() {
    // Se os dados estiverem vazios, não tenta desenhar
    if (!this.dados || this.dados.length === 0) {
      console.log('Sem dados para exibir nos gráficos.');
      // Limpa gráficos antigos se a nova busca não retornar nada
      if (this.tempChart) this.tempChart.destroy();
      if (this.umidadeChart) this.umidadeChart.destroy();
      if (this.phChart) this.phChart.destroy();
      return;
    }

    // Destruir gráficos anteriores se existirem (importante para o 'Buscar')
    if (this.tempChart) {
      this.tempChart.destroy();
    }
    if (this.umidadeChart) {
      this.umidadeChart.destroy();
    }
    if (this.phChart) {
      this.phChart.destroy();
    }

    // --- Processamento dos dados ---
    // (Ajusta 'hora' ou 'timestamp' conforme a tua API)
    const labels = this.dados.map(d => d.hora || new Date(d.timestamp).toLocaleTimeString()); 
    
    const tempData = this.dados.map(d => d.temperatura);
    const umidadeData = this.dados.map(d => d.umidade);
    const phData = this.dados.map(d => d.PH);

    // --- Criar Gráfico de Temperatura ---
    // (Verifica se a referência do canvas existe antes de criar o gráfico)
    if (this.tempChartRef && this.tempChartRef.nativeElement) {
      this.tempChart = new Chart(this.tempChartRef.nativeElement, {
        type: 'line', // Tipo de gráfico
        data: {
          labels: labels,
          datasets: [{
            label: 'Temperatura (°C)',
            data: tempData,
            borderColor: 'rgb(255, 99, 132)', // Cor da linha
            backgroundColor: 'rgba(255, 99, 132, 0.2)', // Cor do preenchimento
            fill: true,
            tension: 0.1 // Linha ligeiramente curva
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'bottom' }
          }
        }
      });
    }

    // --- Criar Gráfico de Umidade ---
    if (this.umidadeChartRef && this.umidadeChartRef.nativeElement) {
      this.umidadeChart = new Chart(this.umidadeChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Umidade (%)',
            data: umidadeData,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'bottom' }
          }
        }
      });
    }

    // --- Criar Gráfico de PH ---
    if (this.phChartRef && this.phChartRef.nativeElement) {
      this.phChart = new Chart(this.phChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nível de PH',
            data: phData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'bottom' }
          },
          scales: {
            y: { // Ajustar a escala Y para o PH
              min: 0,
              max: 14
            }
          }
        }
      });
    }
  }
}