import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-fotos',
  templateUrl: './fotos.page.html',
  styleUrls: ['./fotos.page.scss'],
})
export class FotosPage implements OnInit, OnDestroy {

  public loaded: boolean = false;
  public fotos: Array<any> = [];
  public placeholderArray: Array<any> = Array(6);

  private obsDatabase: Subscription = Subscription.EMPTY;

  constructor(public auth: AuthService, private data: DatabaseService, private firestore: AngularFirestore) { }

  ngOnInit() 
  {
    console.log("Entro en fotos")
    this.obsDatabase = this.data.getCollectionObservable('fotos-edificio').subscribe((next: any) =>
    {
      let result: Array<any> = next;
      this.fotos = [];
      result.sort((a, b) => b.fecha.seconds - a.fecha.seconds);
      result.forEach((obj: any) => {
        let fecha = new Date(obj.fecha.seconds * 1000).toLocaleDateString();
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
  }

  ngOnDestroy(): void 
  {
    this.obsDatabase.unsubscribe();
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
