import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { AlertService } from '../services/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})
export class CamaraPage implements OnInit {

  //public rutasImagen: Array<string> = [];
  public arrayPhotos: Array<Photo> = [];
  public fotosGuardadas: number = 0;

  constructor(private auth: AuthService, private alert: AlertService,
    private firestore: AngularFirestore, private firestorage: AngularFireStorage) { }

  ngOnInit() {
    this.fotosGuardadas = 0;
    //this.rutasImagen = [];
    this.arrayPhotos = [];
  }

  async tomarFoto(tipo: string) {
    let finish = false;

    do {
      const image = await Camera.getPhoto({ //Camera.pickImages() elegir varias desde la galería
        quality: 100,
        promptLabelHeader: 'Seleccione una opción',
        promptLabelPhoto: 'Elegir desde la galería',
        promptLabelPicture: 'Tomar una foto',
        resultType: CameraResultType.Uri
      });

      this.arrayPhotos.push(image);

      Swal.fire('Su foto se guardó correctamente, ¿Desea subir otra imágen?', image.webPath, 'question').then(result => {
        if (result.isDenied) {
          finish = true;
        }
      });
    } while (finish == false);

    if (this.arrayPhotos.length > 1) {
      this.arrayPhotos.forEach(image => {
        this.alert.waitAlert('Publicando fotos...', `Progreso: ${this.fotosGuardadas + 1}/${this.arrayPhotos.length}`);

        this.subirFotoPerfil(tipo, image);
      });
    } else {
      this.alert.waitAlert('Publicando foto...', 'Esto puede demorar unos segundos');

      this.subirFotoPerfil(tipo, this.arrayPhotos[0]);
    }
  }

  async subirFotoPerfil(tipo : string, file : any) {
    if (file) {
      if (file.format == 'jpg' || file.format == 'jpeg' || file.format == 'png' || file.format == 'jfif') {

        let id_imagen = this.firestore.createId();
        let fecha = new Date();

        const response = await fetch(file.webPath!);
        const blob = await response.blob();

        const path = `Relevamiento/${this.auth.nombre}_${this.auth.id}/${fecha.getTime()}.${file.format}`;
        const uploadTask = await this.firestorage.upload(path, blob); 
        const url = await uploadTask.ref.getDownloadURL();

        //this.rutasImagen.push(url);
        this.fotosGuardadas++;
        
        const documento = this.firestore.doc("fotos-edificio/" + id_imagen);
        documento.set({
          imagen : url,
          tipo: tipo,
          usuario: this.auth.nombre,
          id_usuario: this.auth.id,
          id_foto: id_imagen,
          votantes: new Array(0),
          fecha: fecha,
          votos: 0
        });

        this.validarGuardado(documento.ref.id);
      } else {
        this.alert.failureAlert("ERROR", "Formato de archivo incompatible");
      }
    } else {
      this.alert.failureAlert("ERROR", "Ningún archivo fue seleccionado");
    }
  }

  validarGuardado(id : string) {
    this.firestore.firestore.collection('fotos-edificio').get().then((next : any) => {
      let result : Array<any> = next;
      let exito = false;

      result.forEach(obj => {
        if (id == obj.id) {
          exito = true;
          this.alert.sweetAlert("¡Listo!", "Tu foto ya fue publicada", 'success');
          return;
        }
      });

      if (exito == false) {
        this.alert.failureAlert("ERROR", "Tu foto no pudo publicarse, intente de nuevo más tarde.");
      }
    }).catch(error => { this.alert.failureAlert("ERROR", error);});
  }
}
