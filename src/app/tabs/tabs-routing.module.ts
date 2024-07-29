import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'camara',
        loadChildren: () => import('../camara/camara.module').then(m => m.CamaraPageModule)
      },
      {
        path: 'fotos',
        loadChildren: () => import('../fotos/fotos.module').then(m => m.FotosPageModule)
      },
      {
        path: 'graficos',
        loadChildren: () => import('../graficos/graficos.module').then(m => m.GraficosPageModule)
      },
      {
        path: '',
        redirectTo: '/menu/camara',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/menu/camara',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
