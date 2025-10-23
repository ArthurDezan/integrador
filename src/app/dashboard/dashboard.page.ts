// Em: src/app/dashboard/dashboard.page.ts

import { Component, OnInit } from '@angular/core';
import { Api } from '../api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  // MUDANÇA: Voltamos a usar 'dados' como um array
  dados: any[] = [];
  isLoading: boolean = true; 
  error: string | null = null; 

  constructor(private apiServise: Api) { }

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados(): void {
    this.isLoading = true;
    this.error = null;
    this.dados = []; // Limpa os dados antigos

    this.apiServise.getSensor().subscribe({
      next: (data: any[]) => {
        
        // MUDANÇA: Guardamos o array completo
        if (data && data.length > 0) {
          this.dados = data; 
        } else {
          // Se a API retornar um array vazio, não é um erro,
          // apenas não há dados para mostrar.
          // O HTML vai tratar de mostrar a mensagem "Nenhuma leitura"
        }
        
        this.isLoading = false;
        console.log('Dados carregados:', this.dados);
      },
      error: (err) => {
        console.error('Erro ao carregar dados do sensor:', err);
        this.error = "Falha ao carregar dados. Tente novamente.";
        this.isLoading = false;
      }
    });
  }

  // Função para dar 'refresh' nos dados
  handleRefresh(event: any) {
    this.carregarDados();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}