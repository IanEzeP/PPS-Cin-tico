import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  public seccion: string = 'Cámara';

  constructor(private auth: AuthService, private router: Router, private alert: AlertService) {}

  cerrarSesion()
  {
    Swal.fire(
      {
        heightAuto: false,
        title: "¿Desea cerrar su sesión?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        confirmButtonColor: "#d33",
        confirmButtonText: "Cerrar",
        cancelButtonText: "Cancelar"
      }
    ).then((result) => {
      if (result.isConfirmed) {
        this.auth.logOut().then(() => {
          this.router.navigateByUrl('/login');
        });
      }
    });
  }

  cambioTab(tab: string)
  {
    this.seccion = tab;
  }
}
