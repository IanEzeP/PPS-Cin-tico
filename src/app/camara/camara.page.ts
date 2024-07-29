import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})
export class CamaraPage implements OnInit {

  constructor(private auth: AuthService, private alert: AlertService,
    private firestore: AngularFirestore, private firestorage: AngularFireStorage) { }

  ngOnInit() { }

  async tomarFoto(tipo: string)
  {
    const image = await Camera.getPhoto({
      quality: 100,
      promptLabelHeader: 'Seleccione una opción',
      promptLabelPhoto: 'Elegir desde la galería',
      promptLabelPicture: 'Tomar una foto',
      resultType: CameraResultType.Uri
    });

    this.subirFotoPerfil(tipo, image);
  }

  async subirFotoPerfil(tipo : string, file : any)
  {
    if(file)
    {
      if(file.format == 'jpg' || file.format == 'jpeg' || file.format == 'png' || file.format == 'jfif')
      {
        this.alert.waitAlert('Publicando...', 'Esto puede demorar unos segundos');

        let id_imagen = this.firestore.createId();
        let fecha = new Date();

        const response = await fetch(file.webPath!);
        const blob = await response.blob();

        const path = 'Relevamiento/' + this.auth.nombre + '_' + this.auth.id + '/' + fecha.getTime() + '.' + file.format; //Si tuviera que subir varias fotos debería agregar un elemento aleatorio además de la fecha.
        const uploadTask = await this.firestorage.upload(path, blob); 
        const url = await uploadTask.ref.getDownloadURL(); 
        
        const documento = this.firestore.doc("fotos-edificio/" + id_imagen);
        documento.set(
        {
          imagen : url,
          tipo: tipo,
          usuario: this.auth.nombre,
          id_usuario: this.auth.id,
          id_foto: id_imagen,
          votantes: new Array(0),
          fecha: new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), fecha.getHours(), fecha.getMinutes()),
          votos: 0
        });

        this.validarGuardado(documento.ref.id);
      }
      else
      {
        this.alert.failureAlert("ERROR", "Formato de archivo incompatible");
      }
    }
    else
    {
      this.alert.failureAlert("ERROR", "Ningún archivo fue seleccionado");
    }
  }

  validarGuardado(id : string)
  {
    this.firestore.firestore.collection('fotos-edificio').get().then((next : any) =>
    {
      let result : Array<any> = next;
      let exito = false;

      result.forEach(obj =>
      {
        if(id == obj.id)
        {
          exito = true;
          this.alert.sweetAlert("¡Listo!", "Tu foto ya fue publicada", 'success');
        }
      });

      if(exito == false)
      {
        this.alert.failureAlert("ERROR", "Tu foto no pudo publicarse, intente de nuevo más tarde.");
      }
    }).catch(error => { this.alert.failureAlert("ERROR", error);});
  }
}
