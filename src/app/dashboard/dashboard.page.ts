// 1. IMPORTAR OnDestroy para limpar o timer ao sair da página
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core'; 
import { Api } from '../api';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
// 2. IMPLEMENTAR OnDestroy
export class DashboardPage implements OnInit, OnDestroy {

  @ViewChild('tempChart') tempChartRef!: ElementRef;
  @ViewChild('umidadeChart') umidadeChartRef!: ElementRef;
  @ViewChild('phChart') phChartRef!: ElementRef;

  private tempChart: Chart | undefined;
  private umidadeChart: Chart | undefined;
  private phChart: Chart | undefined;

  // 3. ADICIONAR: Variável para guardar a referência do nosso timer
  private refreshInterval: any; 

  constructor(private apiServise: Api) { }

  dados: any[] = [];
  dataSelecionada: string = new Date().toISOString();

  ngOnInit() {
    // 4. MODIFICAR: Remove carregarDados() (que usa data fixa)
    // Em vez disso, buscamos os dados da data selecionada (hoje)
    // e iniciamos o timer de 10 segundos.
    this.executarBuscaAPI(this.dataSelecionada);
    this.iniciarRefreshAutomatico();
  }

  // 5. ADICIONAR: Implementar ngOnDestroy para limpar o timer
  ngOnDestroy() {
    // Se o timer existir, ele é limpo quando o usuário sai da página
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // 6. REMOVER: A função carregarDados() não é mais necessária,
  // pois usava uma data fixa (2025-10-24) definida na api.ts.
  /*
  carregarDados(): any {
    this.apiServise.getSensor().subscribe({ ... })
  }
  */

  // 7. RENOMEAR: Renomeamos 'getData' para 'buscarDadosManualmente'
  // Esta função é chamada quando o usuário clica no botão "Buscar"
  buscarDadosManualmente(dataHistorico: string): void {
    console.log('Busca manual disparada para:', dataHistorico);
    
    // 1. Busca os dados da data selecionada
    this.executarBuscaAPI(dataHistorico);
    // 2. Reinicia o timer de 10 segundos
    this.iniciarRefreshAutomatico();
  }

  // 8. ADICIONAR: Nova função para controlar o timer
  iniciarRefreshAutomatico(): void {
    // Limpa qualquer timer que já exista (para evitar duplicatas)
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Cria um novo timer que executa a cada 10 segundos (10000 ms)
    this.refreshInterval = setInterval(() => {
      console.log('Atualização automática executando...');
      // Busca os dados usando a data que está ATUALMENTE selecionada no <ion-datetime>
      this.executarBuscaAPI(this.dataSelecionada);
    }, 10000); // 10 segundos
  }

  // 9. ADICIONAR: Nova função que centraliza a chamada da API
  // (Esta é a lógica que estava dentro da antiga função 'getData')
  executarBuscaAPI(dataHistorico: string): void {
    // Formatar a data para 'YYYY-MM-DD' como a API espera
    const dataFormatada = dataHistorico.split('T')[0];
    console.log('Buscando dados da API para:', dataFormatada);

    this.apiServise.getHistorico(dataFormatada).subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.dados = data;
        this.criarGraficos(); // Chamar a função para recriar os gráficos
      },
      error: (err) => {
        console.error('Erro ao carregar dados do sensor:', err);
      }
    });
  }


  // A função criarGraficos() permanece exatamente a mesma
  criarGraficos() {
    if (!this.dados || this.dados.length === 0) {
      console.log('Sem dados para exibir nos gráficos.');
      if (this.tempChart) this.tempChart.destroy();
      if (this.umidadeChart) this.umidadeChart.destroy();
      if (this.phChart) this.phChart.destroy();
      return;
    }

    if (this.tempChart) {
      this.tempChart.destroy();
    }
    if (this.umidadeChart) {
      this.umidadeChart.destroy();
    }
    if (this.phChart) {
      this.phChart.destroy();
    }

    const labels = this.dados.map(d => d.hora || new Date(d.timestamp).toLocaleTimeString()); 
    const tempData = this.dados.map(d => d.temperatura);
    const umidadeData = this.dados.map(d => d.umidade);
    const phData = this.dados.map(d => d.PH);

    if (this.tempChartRef && this.tempChartRef.nativeElement) {
      this.tempChart = new Chart(this.tempChartRef.nativeElement, {
        type: 'line', 
        data: {
          labels: labels,
          datasets: [{
            label: 'Temperatura (°C)',
            data: tempData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
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
            y: { 
              min: 0,
              max: 14
            }
          }
        }
      });
    }
  }
}