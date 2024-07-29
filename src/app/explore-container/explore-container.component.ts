import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit{

  @Input() name?: string;
  public usrName: string = '';

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.usrName = this.auth.perfil;
  }
}
