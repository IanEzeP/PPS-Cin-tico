import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  public loaded: boolean = false;
  public fotos: Array<any> = [];
  public placeholderArray: Array<any> = Array(6);

  private subsDatabase: Subscription = Subscription.EMPTY;
  private subsMovement: Subscription = Subscription.EMPTY;

  public accelerationX: any;
  public accelerationY: any;
  public accelerationZ: any;
  constructor(public auth: AuthService, private data: DatabaseService, private firestore: AngularFirestore,
    public screenOrientation: ScreenOrientation, public deviceMotion: DeviceMotion
  ) { }

  scrollUp() {
    this.content.scrollByPoint(0,-680,500);
  }
  
  scrollDown() {
    this.content.scrollByPoint(0,680,500);
  }

  scrollTop() {
    this.content.scrollToTop(620);
  }

  ngOnInit() {
    console.log("Entro en mis fotos");
    this.subsDatabase = this.data.getCollectionObservable('fotos-edificio').subscribe((next: Array<any>) => {
      let result = next.filter(img => img.id_usuario === this.auth.id);
      this.fotos = [];
      result.sort((a, b) => {
        let result = b.fecha.seconds - a.fecha.seconds;

        if (result == 0) {
          result = b.fecha.nanoseconds - a.fecha.nanoseconds;
        }
        return result;
      });

      result.forEach((obj: any) => {
        let fecha = new Date(obj.fecha.seconds * 1000);
        let linda = false;

        if(obj.tipo == 'linda')
        {
          linda = true;
        }

        let foto = { 
          fecha: fecha,
          tipo_texto: obj.tipo,
          tipo: linda,
          id_foto: obj.id_foto,
          id_usuario: obj.id_usuario,
          imagen: obj.imagen,
          usuario: obj.usuario,
          votantes: obj.votantes,
          votos: obj.votos
        }
        console.log(foto);

        this.fotos.push(foto);
      });
      console.log("finalizo carga");
      this.loaded = true;
    });

    this.detectMovement();
  }

  ngOnDestroy(): void 
  {
    this.subsDatabase.unsubscribe();
    this.subsMovement.unsubscribe();
  }

  ionViewWillLeave () { //Poner equivalente al entrar
    this.subsMovement.unsubscribe();
  }

  detectMovement() {      
    console.log(`Inicio deteccion de movimiento`);

    this.subsMovement = this.deviceMotion.watchAcceleration({ frequency: 300 }).subscribe((acceleration: DeviceMotionAccelerationData) => {

      this.accelerationX = Math.floor(acceleration.x);
      this.accelerationY = Math.floor(acceleration.y);
      this.accelerationZ = Math.floor(acceleration.z);

      console.log(`Acelerómetro: X: ${this.accelerationX} Y: ${this.accelerationY} Z: ${this.accelerationZ}`);

      if (acceleration.x > 5) {
        this.scrollUp();//Poner anti rebote
      }
      else if (acceleration.x < -5) {
        this.scrollDown();
      }
      else if (acceleration.z >= 9 && (acceleration.y >= -1 && acceleration.y <= 1) && (acceleration.x >= -1 && acceleration.x <= 1)) {
        this.scrollTop();
      }
      //console.log('Actual: ' + this.posicionActualCelular + ' Anterior: ' + this.posicionAnteriorCelular);
    });
  }

  onVotar(foto: any): void
  {
    let votado: boolean = false;

    votado = foto.votantes.includes(this.auth.id);

    if(!votado)
    {
      foto.votantes.push(this.auth.id);

      const newFoto = this.firestore.doc('fotos-edificio/' + foto.id_foto);
      newFoto.update({
        votos : foto.votos + 1,
        votantes : foto.votantes
      }).catch(error => { console.log(error); });
    }
    else
    {
      foto.votantes.splice(foto.votantes.indexOf(this.auth.id), 1);

      const newFoto = this.firestore.doc('fotos-edificio/' + foto.id_foto);
      newFoto.update({
        votos : foto.votos - 1,
        votantes : foto.votantes
      }).catch(error => { console.log(error); });
    }
  }
}
