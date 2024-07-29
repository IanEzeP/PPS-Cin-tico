import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GraficosPageRoutingModule } from './graficos-routing.module';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

import { GraficosPage } from './graficos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GraficosPageRoutingModule,
    CanvasJSAngularChartsModule
  ],
  declarations: [GraficosPage]
})
export class GraficosPageModule {}
