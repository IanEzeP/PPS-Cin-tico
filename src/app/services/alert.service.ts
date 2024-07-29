import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }
  
  /**
   * Alert básica y personalizable
   * @param titulo 
   * @param mensaje 
   * @param icono 
   * @returns 
   */
  public sweetAlert(titulo: string, mensaje: string, icono: any)
  {
    return Swal.fire(
      {
        heightAuto: false,
        title: titulo,
        text: mensaje,
        icon: icono,
      });
  }

  public waitAlert(titulo: string, mensaje: string)
  {
    return Swal.fire(
      {
        heightAuto: false,
        title: titulo,
        text: mensaje,
        showConfirmButton: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  }

  public successAlert(mensaje: string) : void
  {
    Swal.fire(
      {
        heightAuto: false,
        icon: 'success',
        title: mensaje,
      });
  }

  public failureAlert(titulo: string, mensaje: string) : void
  {
    Swal.fire(
      {
        heightAuto: false,
        icon: 'error',
        title: mensaje,
        text: mensaje,
      });
  }
  
  public successToast(mensaje: string) : void
  {
    Swal.fire(
      {
        icon: 'success',
        title: mensaje,
        toast: true,
        position: 'bottom',
        timer: 2400,
        timerProgressBar: false,
        showCloseButton: true,
        showConfirmButton: false
      });
  }

  public infoToast(mensaje: string) : void
  {
    Swal.fire(
      {
        icon: 'info',
        title: mensaje,
        toast: true,
        position: 'bottom-right',
        timer: 3000,
        timerProgressBar: true,
        showCloseButton: true,
        showConfirmButton: false,
      });
  }

}
