import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FotosPageRoutingModule } from './fotos-routing.module';

import { FotosPage } from './fotos.page';

import { DeviceMotion } from '@ionic-native/device-motion/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@NgModule({
  providers: [
    DeviceMotion,
    ScreenOrientation
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FotosPageRoutingModule
  ],
  declarations: [FotosPage]
})
export class FotosPageModule {}
