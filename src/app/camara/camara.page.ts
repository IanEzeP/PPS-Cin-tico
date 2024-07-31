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

  public idImagen: Array<string> = [];
  public arrayPhotos: Array<Photo> = [];
  public fotosGuardadas: number = 0;

  constructor(private auth: AuthService, private alert: AlertService,
    private firestore: AngularFirestore, private firestorage: AngularFireStorage) { }

  ngOnInit() {
    this.reset();
  }

  async tomarFoto(tipo: string) {
    let finish = false;

    do {
      const image = await Camera.getPhoto({
        quality: 100,
        promptLabelHeader: 'Seleccione una opción',
        promptLabelPhoto: 'Elegir desde la galería',
        promptLabelPicture: 'Tomar una foto',
        resultType: CameraResultType.Uri
      });

      this.arrayPhotos.push(image);

      await Swal.fire({
        title: 'Su foto se guardó correctamente, ¿Desea subir otra imágen?',
        heightAuto: false,
        imageUrl: image.webPath,
        imageHeight: "350px",
        imageWidth: "350",
        icon: 'question',
        showDenyButton: true,
        confirmButtonText: 'Si'
      }).then(result => {
        if (result.isDenied) {
          finish = true;
        }
      });
    } while (finish == false);

    if (this.arrayPhotos.length > 1) {
      this.arrayPhotos.forEach(async image => {
        this.alert.waitAlert('Publicando fotos...', `Esto puede demorar unos segundos`);

        await this.subirFotoPerfil(tipo, image);
      });
    } else {
      this.alert.waitAlert('Publicando foto...', 'Esto puede demorar unos segundos');

      this.subirFotoPerfil(tipo, this.arrayPhotos[0]);
    }
  }

  async subirFotoPerfil(tipo : string, file : any) {
    if (file) {
      if (file.format == 'jpg' || file.format == 'jpeg' || file.format == 'png' || file.format == 'jfif') {
        let fecha = new Date();

        const response = await fetch(file.webPath!);
        const blob = await response.blob();

        const path = `Relevamiento/${this.auth.nombre}_${this.auth.id}/${fecha.getTime()}.${file.format}`;
        const uploadTask = await this.firestorage.upload(path, blob); 
        const url = await uploadTask.ref.getDownloadURL();

        let id_imagen = this.firestore.createId();
        this.idImagen.push(id_imagen);

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
        }).then(() => {
          this.fotosGuardadas++;
          
          if (this.fotosGuardadas == this.arrayPhotos.length) {
            this.validarGuardado();
          }
        });
      } else {
        this.alert.failureAlert("ERROR", "Formato de archivo incompatible");
      }
    } else {
      this.alert.failureAlert("ERROR", "Ningún archivo fue seleccionado");
    }
  }

  validarGuardado() {
    console.log("Entro en validar Guardado");

    this.firestore.firestore.collection('fotos-edificio').get().then((next : any) => {
      let result : Array<any> = next.docs;
      let count = 0;
      let exito = false;

      this.idImagen.forEach(id => {
        let res = result.find(doc => id == doc.id);

        if (res != undefined) {
          count++;
        }
      });

      if (count == this.fotosGuardadas) {
        exito = true;
        this.alert.sweetAlert("¡Listo!", "Publicación completada", 'success');
        this.reset();
      }

      if (exito == false) {
        this.alert.failureAlert("ERROR", "Tu foto no pudo publicarse, intente de nuevo más tarde.");
        this.reset();
      }
    })
    .catch(error => { 
      this.alert.failureAlert("ERROR", error);
      this.reset();
    });
  }

  reset () {
    this.fotosGuardadas = 0;
    this.idImagen = [];
    this.arrayPhotos = [];
  }
}
