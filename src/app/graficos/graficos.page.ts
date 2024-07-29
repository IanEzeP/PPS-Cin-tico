import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
})
export class GraficosPage implements OnInit, OnDestroy {

  public smt: boolean = true;
  public fotosLindas: Array<any> = [];
  public fotosFeas: Array<any> = [];

  private obsDatabase: Subscription = Subscription.EMPTY;

  private seriesPie : Array<any> = [];
  private seriesCol : Array<any> = [];

  constructor(private data: DatabaseService) { }

  ngOnInit() 
  {
    console.log("Entro en gráficos");
      
    this.obsDatabase = this.data.getCollectionObservable('fotos-edificio').subscribe((next: any) =>
    {
      let result: Array<any> = next;
      this.fotosFeas = [];
      this.fotosLindas = [];
      
      result.forEach((obj: any) => {
        obj.fecha = new Date(obj.fecha.seconds * 1000);

        if(obj.tipo == 'linda')
        {
          this.fotosLindas.push(obj);
        }
        else
        {
          this.fotosFeas.push(obj);
        }
        
        this.crearSeries();
      });
      console.log("finalizo carga");
    });
  }

  ngOnDestroy(): void 
  {
    this.obsDatabase.unsubscribe();
  }

  onChangeChart(selection: any) 
  {
    if(selection.target.value == 'lindo')
    {
      this.smt = true;
    }
    else
    {
      this.smt = false;
    }
  }

  crearSeries()
  {
    this.seriesPie = [];
    this.seriesCol = [];

    for (let i = 0; i < this.fotosLindas.length; i++) 
    {
      const element = this.fotosLindas[i];
      
      this.seriesPie.push({ 
        y: element.votos, 
        name: element.usuario + ' ' + element.fecha.toLocaleDateString() + 
        ' ' + element.fecha.toLocaleTimeString(), 
      });
    }

    for (let i = 0; i < this.fotosFeas.length; i++) 
    {
      const element = this.fotosFeas[i];
      
      if(element.votos > 0)
      {
        this.seriesCol.push({ 
        label: element.usuario + ' ' + element.fecha.toLocaleDateString() + 
        ' ' + element.fecha.toLocaleTimeString(),
        y: element.votos, 
        });
      }

    }
    this.updateChart();
  }

  getChartInstance(chart : Object) 
  {
    this.chart = chart;
    this.updateChart();
  }

  updateChart()
  { 
    if(this.smt)
    {
      this.chart.options.data[0].dataPoints = this.seriesPie;
    }
    else
    {
      this.chart.options.data[0].dataPoints = this.seriesCol;
    }

    this.chart.render();
    const elementoCanva = document.querySelector(".canvasjs-chart-credit");
    elementoCanva?.remove();
  }

  private chart : any;

  public chartOptionsPie = {
    animationEnabled: true,
    theme: "dark2", //Con esto consigo fondo del gráfico negro
	  data: [{
      type: "pie",
      startAngle: 0,
      indexLabelPlacement: "inside",
      indexLabel: "{name} Nº votos: {y}",
      dataPoints: [
		  ]
	  }]
	}

  public chartOptionsCol = {
    animationEnabled: true,
    theme: "dark2",
    axisY: { title: "Votos", interval: 1 },
    axisX: { labelAngle: 0 },
    data: [{        
      type: "column",
      dataPoints: [
      ]
    }]
  }
}
