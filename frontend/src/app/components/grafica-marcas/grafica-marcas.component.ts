import { Component, OnInit, NgZone, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5index from "@amcharts/amcharts5/index";
import * as am5xy from "@amcharts/amcharts5/xy";
import { ColorSet } from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import es_ES from "@amcharts/amcharts5/locales/es_ES";
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/app/environments/environment';

interface DataItem {
  country: string;
  visits: number;
  icon: string;
  color: any;
}

interface DataItemVeh {
  marca: string;
  createdAt: string;
}


type Marca = 'AUDI' | 'BMW' | 'BYD' | 'CHEVROLET' | 'CITROEN' | 'DODGE' | 'DS' | 'FIAT' | 'FORD' | 'HONDA' | 'HYUNDAI' | 'JEEP' |
  'KIA' | 'KTM' | 'MAZDA' | 'MERCEDEZBENZ' | 'MINI' | 'MITSUBISHI' | 'NISSAN' | 'PEOGEOT' | 'RENAULT' | 'SEAT' | 'SKODA' |
  'SSANGYONG' | 'SUBARU' | 'SUZUKI' | 'TOYOTA' | 'VOLKSWAGEN' | 'VOLVO' | 'default';

@Component({
  selector: 'app-grafica-marcas',
  templateUrl: './grafica-marcas.component.html',
  styleUrl: './grafica-marcas.component.css'
})
export class GraficaMarcasComponent implements OnInit, OnDestroy {
  dataMarcas: any = [];
  private root!: am5.Root;
  private apiUrl = environment.apiUrl;
  countMarcas: { [key: string]: number } = {};
  totalMarcasFiltradas: number = 0;
  private colors: { [key in Marca]: string } = {
    AUDI: '#000000',
    BMW: '#000000',
    BYD: '#2F3336',
    CHEVROLET: '#D8AD4F',
    CITROEN: '#a59e9a',
    DODGE: '#D61314',
    DS: '#B3B3B3',
    FIAT: '#268F52',
    FORD: '#00095B',
    HONDA: '#CC2027',
    HYUNDAI: '#1C4681',
    JEEP: '#000000',
    KIA: '#687784',
    KTM: '#FF6600',
    MAZDA: '#aaaaaa',
    MERCEDEZBENZ: '#000000',
    MINI: '#F1F1F1',
    MITSUBISHI: '#7f0a00',
    NISSAN: '#C3102F',
    PEOGEOT: '#0074e7',
    RENAULT: '#FDB514',
    SEAT: '#d3d3d3',
    SKODA: '#0E3A2F',
    SSANGYONG: '#433551',
    SUBARU: '#185394',
    SUZUKI: '#9e0f29',
    TOYOTA: '#E11512',
    VOLKSWAGEN: '#001e50',
    VOLVO: '#606A7B',
    default: '#000000'
  };
  startDate: string = '';
  endDate: string = '';

  constructor(private zone: NgZone, private http: HttpClient, private cdRef: ChangeDetectorRef) { }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  ngOnInit(): void {
    this.fetchData();
  }

  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';

    Swal.fire({
      title: 'Cargando...',
      text: 'Por favor, espera mientras se restablecen los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.fetchData();
  }

  fetchData(): void {
    this.http.get<DataItemVeh[]>(`${this.apiUrl}/api/getAllMarca`).subscribe(data => {
      this.countMarcas = data.reduce((acc: any, item: DataItemVeh) => {
        const key = item.marca;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      let tempDataMarcas = Object.keys(this.countMarcas).map(key => {
        let displayName = key;
        if (key === "MERCEDES BENZ") {
          displayName = "MERCEDES";
        }

        return {
          name: displayName,
          counts: this.countMarcas[key],
          icon: `../assets/img/marcas/${key.toLowerCase()}.png`,
          color: this.getColorForMarcaSafe(key)
        };
      });

      this.dataMarcas = tempDataMarcas.sort((a, b) => b.counts - a.counts);

      this.algunaOperacionAsincrona().then(() => {
        this.zone.runOutsideAngular(() => {
          this.initDistribucionMarcas();
        });
      });

      this.updateTotalMarcas();

      setTimeout(() => {
        this.cdRef.detectChanges();
        Swal.close();
      }, 2000);
    });
  }


  getColorForMarca(marca: Marca): string {
    return this.colors[marca] || this.colors.default;
  }

  updateTotalMarcas(): void {
    this.totalMarcasFiltradas = Object.values(this.countMarcas).reduce((sum: number, current: any) => {
      const valueToAdd = typeof current === 'number' ? current : 0;
      return sum + valueToAdd;
    }, 0);
  }

  filterData(): void {
    if (!this.startDate || !this.endDate) {
      alert('Por favor, seleccione ambas fechas.');
      return;
    }

    this.http.get<DataItemVeh[]>(`${this.apiUrl}/api/getAllMarca`).subscribe(data => {
      const filteredData = data.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= new Date(this.startDate) && itemDate <= new Date(this.endDate);
      });
      this.processData(filteredData);
    });
  }

  processData(data: DataItemVeh[]): void {
    this.countMarcas = data.reduce((acc: any, item: DataItemVeh) => {
      const key = item.marca;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    this.updateChartData();
    this.updateTotalMarcas();
  }

  updateChartData(): void {
    let tempDataMarcas = Object.keys(this.countMarcas).map(key => {
      let displayName = key;
      if (key === "MERCEDES BENZ") {
        displayName = "MERCEDES";
      }

      return {
        name: displayName,
        counts: this.countMarcas[key],
        icon: `../assets/img/marcas/${key.toLowerCase()}.png`,
        color: this.getColorForMarcaSafe(key)
      };
    });

    this.dataMarcas = tempDataMarcas.sort((a, b) => b.counts - a.counts);
    this.initDistribucionMarcas();
  }

  getColorForMarcaSafe(marca: string): string {
    const validMarcas: Marca[] = [
      'AUDI', 'BMW', 'BYD', 'CHEVROLET', 'CITROEN', 'DODGE', 'DS', 'FIAT', 'FORD', 'HONDA', 'HYUNDAI', 'JEEP',
      'KIA', 'KTM', 'MAZDA', 'MERCEDEZBENZ', 'MINI', 'MITSUBISHI', 'NISSAN', 'PEOGEOT', 'RENAULT', 'SEAT', 'SKODA',
      'SSANGYONG', 'SUBARU', 'SUZUKI', 'TOYOTA', 'VOLKSWAGEN', 'VOLVO'
    ];
    if (validMarcas.includes(marca as Marca)) {
      return this.getColorForMarca(marca as Marca);
    }
    return this.colors.default;
  }

  ngAfterViewInit(): void {
    this.fetchData();
  }

  initDistribucionMarcas(): void {
    if (this.root) {
      this.root.dispose();
    }

    this.root = am5.Root.new("initDistribucionMarcas");

    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    let chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      paddingLeft: 0,
      layout: this.root.verticalLayout
    }));

    let xRenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 30,
      minorGridEnabled: true
    })

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(this.root, {
      categoryField: "name",
      renderer: xRenderer,
      bullet: (root, axis, dataItem) => {
        return am5xy.AxisBullet.new(this.root, {
          location: 0.5,
          sprite: am5.Picture.new(root, {
            width: 24,
            height: 24,
            centerY: am5.p50,
            centerX: am5.p50,
            src: (dataItem.dataContext as DataItem).icon
          })
        });
      }
    }));

    xRenderer.labels.template.setAll({
      paddingTop: 20,
      fontSize: 9,
      fontWeight: "bold"
    });

    xRenderer.grid.template.setAll({
      location: 1
    })

    xRenderer.labels.template.setAll({
      paddingTop: 20
    });

    xAxis.data.setAll(this.dataMarcas);

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      renderer: am5xy.AxisRendererY.new(this.root, {
        strokeOpacity: 0.1
      })
    }));

    let series = chart.series.push(am5xy.ColumnSeries.new(this.root, {
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "counts",
      categoryXField: "name"
    }));

    series.columns.template.setAll({
      tooltipText: "{categoryX}: {valueY}",
      tooltipY: 0,
      strokeOpacity: 0,
      templateField: "columnSettings"
    });

    series.columns.template.adapters.add("fill", (fill, target) => {
      if (target.dataItem && 'dataContext' in target.dataItem) {
        const dataContext = target.dataItem.dataContext as DataItem;
        return am5.color(dataContext.color);
      }
      return fill;
    });

    series.data.setAll(this.dataMarcas);

    series.appear();
    chart.appear(1000, 100);
  }


  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

}
