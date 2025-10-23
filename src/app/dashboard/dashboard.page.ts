import { Component, OnInit } from '@angular/core';
import { Api } from '../api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  constructor(private apiServise: Api) { }

  dados: any[] = [];

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados(): any {
    this.apiServise.getSensor().subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.dados = data
      },
      error: (err) => {
        console.error('Erro ao carregar dados do sensor:', err);
      }
    })
  }

}
