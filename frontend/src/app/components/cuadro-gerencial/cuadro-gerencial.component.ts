import { Component, OnInit, NgZone, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5index from "@amcharts/amcharts5/index";
import * as am5xy from "@amcharts/amcharts5/xy";
import { ColorSet } from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import es_ES from "@amcharts/amcharts5/locales/es_ES";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

interface ChartData {
  date: number;
  value: number;
  isToday: boolean;
}

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
  selector: 'app-cuadro-gerencial',
  templateUrl: './cuadro-gerencial.component.html',
  styleUrls: ['./cuadro-gerencial.component.css']
})
export class CuadroGerencialComponent implements OnInit, OnDestroy {
  loading = false;
  daviDisponible: any;
  bancolDisponible: any;
  countMarcas: any;
  marcas: any;
  cuentasPagar: any;
  efectivoDisponible: any;
  sumaNoPagadasVeh: any;
  sumaPagadasVeh: any;
  sumaNoPagadasProv: any;
  cuentasPagarFija: any;
  sumaPagadasProv: any;
  sumaDisponibles: any;
  sumaPagadasAdmon: any;
  sumaNoPagadasAdmon: any;
  cantidadDisponibles: number = 0;
  cantidadVendidos: number = 0;
  cantidadAsignados: number = 0;
  sumaDisponible: any;
  currentMonth: string = '';
  private apiUrl = environment.apiUrl;
  data = [{
    "year": '',
    "Veh": '',
    "Veh2": '',
    "Prov": '',
    "Prov2": '',
    "Admon": 0,
    "Admon2": 0
  }];

  dataMarcas: any = [];
  private root!: am5.Root;

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

  constructor(private zone: NgZone, private http: HttpClient, private cdRef: ChangeDetectorRef) {
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.getCurrentMonth();

    this.algunaOperacionAsincrona().then(() => {
      this.zone.runOutsideAngular(() => {
        this.loading = false;
      });
    });


    this.algunaOperacionAsincrona().then(() => {
      this.zone.runOutsideAngular(() => {
        this.initChatEquilibrio();
      });
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getDisponible`).subscribe(data => {
      this.bancolDisponible = data[0].disponible;
      this.daviDisponible = data[1].disponible;
      this.efectivoDisponible = data[2].disponible;

      this.calcularDisponible();

      this.algunaOperacionAsincrona().then(() => {
        this.zone.runOutsideAngular(() => {
          this.initPieChart();
        });
      });
    })

    this.http.get<DataItemVeh[]>(`${this.apiUrl}/api/getAllMarca`).subscribe(data => {
      this.marcas = data.length;
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

      this.dataMarcas = tempDataMarcas.sort((a, b) => b.counts - a.counts).slice(0, 5);

      this.algunaOperacionAsincrona().then(() => {
        this.zone.runOutsideAngular(() => {
          this.initDistribucionMarcas();
        });
      });
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getInventoriesAll`).subscribe(data => {
      this.cantidadDisponibles = data.filter(item => item.filtroBaseDatos.estadoInventario === 'DISPONIBLE A LA VENTA').length;
      this.cantidadVendidos = data.filter(item => item.filtroBaseDatos.estadoInventario === 'VENDIDO').length;
      this.cantidadAsignados = data.filter(item => item.filtroBaseDatos.estadoInventario === 'ASIGNADO EN INICIALES').length;
      this.sumaDisponibles = this.cantidadDisponibles + this.cantidadAsignados;

      this.algunaOperacionAsincrona().then(() => {
        this.zone.runOutsideAngular(() => {
          this.initPieTwoChart();
        });
      });
    })

    this.http.get<any[]>(`${this.apiUrl}/api/getCuentasPagar`).subscribe(data => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const filtrarCuentas = (clasificacion: any, pagado: any) => data.filter(item => {
        const fechaVencimiento = new Date(item.fechaVencimiento);
        return item.clasificacion === clasificacion &&
          (!pagado || (item.pagado && fechaVencimiento.getMonth() === currentMonth && fechaVencimiento.getFullYear() === currentYear));
      });

      const cuentasNoPagadasVeh = filtrarCuentas('Veh', false);
      const cuentasPagadasVeh = filtrarCuentas('Veh', true);

      const cuentasNoPagadasProv = filtrarCuentas('Prov', false);
      const cuentasPagadasProv = filtrarCuentas('Prov', true);

      this.sumaNoPagadasVeh = cuentasNoPagadasVeh.reduce((acc, curr) => acc + (curr.saldo || 0), 0);
      this.sumaPagadasVeh = cuentasPagadasVeh.reduce((acc, curr) => acc + (curr.valor || 0), 0);
      this.sumaNoPagadasProv = cuentasNoPagadasProv.reduce((acc, curr) => acc + (curr.saldo || 0), 0);
      this.sumaPagadasProv = cuentasPagadasProv.reduce((acc, curr) => acc + (curr.valor || 0), 0);

      this.data = [{
        "year": this.currentMonth,
        "Veh": this.sumaPagadasVeh,
        "Veh2": this.sumaNoPagadasVeh,
        "Prov": this.sumaPagadasProv,
        "Prov2": this.sumaNoPagadasProv,
        "Admon": 0,
        "Admon2": 0
      }];

      this.loadCuentasPagarFija();

      this.algunaOperacionAsincrona().then(() => {
        this.zone.runOutsideAngular(() => {
          this.initChart();
        });
      });
    });


    setInterval(() =>
      this.loadCuentasPagarFija(), 4500);

    setInterval(() =>
      this.http.get<any[]>(`${this.apiUrl}/api/getDisponible`).subscribe(data => {
        this.bancolDisponible = data[0].disponible;
        this.daviDisponible = data[1].disponible;
        this.efectivoDisponible = data[2].disponible;
        this.calcularDisponible();
      })
      , 5000);
  }

  getColorForMarca(marca: Marca): string {
    return this.colors[marca] || this.colors.default;
  }

  private formatValue(value: number): any {
    return value === 0 ? "" : value;
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

  getCurrentMonth() {
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    this.currentMonth = monthNames[currentMonthIndex];
  }

  calcularDisponible() {
    this.sumaDisponible = this.daviDisponible + this.bancolDisponible + this.efectivoDisponible
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  initChatEquilibrio(): void {
    this.root = am5.Root.new("equilibriumChartDiv");

    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    // Create chart
    let chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0
    }));

    // Add cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(this.root, {}));
    cursor.lineY.set("visible", false);

    // Create axes
    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(this.root, {
      maxDeviation: 0.3,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(this.root, {
        minorGridEnabled: true,
        minGridDistance: 70
      }),
      tooltip: am5.Tooltip.new(this.root, {})
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      maxDeviation: 0.3,
      renderer: am5xy.AxisRendererY.new(this.root, {})
    }));

    // Create series
    let series = chart.series.push(am5xy.LineSeries.new(this.root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(this.root, {
        labelText: "{valueY}"
      })
    }));


    // Add series axis range for a different stroke/fill
    let rangeDataItem = yAxis.makeDataItem({
      value: 0,
      endValue: 50
    });

    let range = series.createAxisRange(rangeDataItem);

    range.strokes!.template.setAll({
      stroke: am5.color(0xff0000)
    });

    range.fills!.template.setAll({
      fill: am5.color(0xff0000),
      fillOpacity: 0.2,
      visible: true
    });

    let rangeDataItem2 = yAxis.makeDataItem({
      value: 50,
      endValue: 100
    });

    let range2 = series.createAxisRange(rangeDataItem2);

    range2.strokes!.template.setAll({
      stroke: am5.color(0x16af01)
    });

    range2.fills!.template.setAll({
      fill: am5.color(0x16af01),
      fillOpacity: 0.2,
      visible: true
    });

    series.bullets.push((root, series, dataItem) => {
      let item = dataItem.dataContext as ChartData; // Asegúrate de que la afirmación de tipo sea correcta.
      let container = am5.Container.new(root, {});

      // Círculo estático para todos los puntos
      let fillColor = item.value < 50 ? am5.color(0xaf0101) : am5.color(0x16af01); // Rojo para < 50, Verde para >= 50

      // Círculo estático para todos los puntos
      let staticCircle = container.children.push(am5.Circle.new(root, {
        radius: 5,
        fill: fillColor, // Color basado en el valor
        strokeWidth: 1 // Grosor del borde
      }));

      // Círculo animado solo para el día actual
      if (item.isToday) {
        let animatedCircle = container.children.push(am5.Circle.new(root, {
          radius: 5,
          fill: am5.color(0xaf0101) // Color rojo para el día actual
        }));

        animatedCircle.animate({
          key: "radius",
          to: 20,
          duration: 1000,
          easing: am5.ease.out(am5.ease.cubic),
          loops: Infinity
        });
        animatedCircle.animate({
          key: "opacity",
          to: 0,
          from: 1,
          duration: 1000,
          easing: am5.ease.out(am5.ease.cubic),
          loops: Infinity
        });
      }

      return am5.Bullet.new(root, { sprite: container });
    });


    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let data = [];
    for (let d = new Date(startOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
      data.push({
        date: new Date(d).getTime(),
        value: Math.floor(Math.random() * 100) + 1,
        isToday: +d.setHours(0, 0, 0, 0) === +today.setHours(0, 0, 0, 0) // Asegura comparar solo las fechas, sin las horas.
      });
    }

    chart.set("scrollbarX", am5.Scrollbar.new(this.root, {
      orientation: "horizontal"
    }));

    let thresholdSeries = chart.series.push(am5xy.LineSeries.new(this.root, {
      name: "Equilibrium",
      xAxis: xAxis,
      yAxis: yAxis,
      stroke: am5.color(0xff0000),
      fill: am5.color(0xff0000),
      valueYField: "equilibrium",
      valueXField: "date",
      tooltip: am5.Tooltip.new(this.root, {
        labelText: "Punto de Equilibrio: {valueY}"
      })
    }));

    thresholdSeries.strokes.template.setAll({
      strokeWidth: 2,
      strokeDasharray: [6, 2]
    });

    let thresholdValue = 50;
    let thresholdData = data.map(item => ({
      date: item.date,
      equilibrium: thresholdValue,
    }));

    thresholdSeries.data.setAll(thresholdData);

    series.data.setAll(data);
  }

  initPieChart(): void {
    let root = am5.Root.new("pieChartdiv");

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        startAngle: 160, endAngle: 380
      })
    );

    let series1 = chart.series.push(
      am5percent.PieSeries.new(root, {
        startAngle: 160,
        endAngle: 380,
        valueField: "amount",
        innerRadius: am5.percent(80),
        categoryField: "source"
      })
    );

    let colorSet = am5.ColorSet.new(root, {});
    colorSet.set("colors", [
      am5.color(0x52935C),
      am5.color(0xF3A858),
      am5.color(0xE65B66),
    ]);

    series1.set("colors", colorSet);

    series1.ticks.template.set("forceHidden", true);
    series1.labels.template.set("forceHidden", true);

    series1.slices.template.set("tooltipText", "{category}: $ {value}");

    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 10,
      marginBottom: 15
    }));

    legend.data.setAll(series1.dataItems);

    let label = chart.seriesContainer.children.push(
      am5.Label.new(root, {
        textAlign: "center",
        centerY: am5.p50,
        centerX: am5.p50,
        marginBottom: 0,
        paddingBottom: 0,
        marginTop: 0,
        paddingTop: 0,
        text: "[bold fontSize:40px]Total:\n[/][bold fontSize:25px]{total}[/]"
      })
    );

    label.set("text", `[bold fontSize:40px]Total:\n[/][bold fontSize:25px]${this.formatSalary(this.sumaDisponible)}[/]`);

    let data = [
      {
        source: "Efectivo",
        amount: this.efectivoDisponible
      },
      {
        source: "Bancolombia",
        amount: this.bancolDisponible
      },
      {
        source: "Davivienda",
        amount: this.daviDisponible
      },
    ];

    series1.data.setAll(data);
  }

  initPieTwoChart(): void {
    this.root = am5.Root.new("pieTwoChartdiv");

    this.root.setThemes([
      am5themes_Animated.new(this.root)
    ]);

    let chart = this.root.container.children.push(am5percent.PieChart.new(this.root, {
      layout: this.root.verticalLayout
    }));

    let series = chart.series.push(am5percent.PieSeries.new(this.root, {
      valueField: "value",
      categoryField: "category"
    }));

    series.ticks.template.set("forceHidden", true);
    series.labels.template.set("forceHidden", true);

    series.data.setAll([
      { value: this.cantidadDisponibles, category: "Disponible" },
      { value: this.cantidadVendidos, category: "Vendidos" },
      { value: this.cantidadAsignados, category: "Asignados Ini." }
    ]);

    series.bullets.push(() => {
      return am5.Bullet.new(this.root, {
        locationX: 0.5,
        locationY: 0.5,
        sprite: am5.Label.new(this.root, {
          text: "{value}",
          fill: am5.color("#fff"),
          centerY: am5.percent(50),
          centerX: am5.percent(50),
          populateText: true
        })
      });
    });

    let legend = chart.children.push(am5.Legend.new(this.root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 5,
      marginBottom: 15
    }));

    legend.data.setAll(series.dataItems);

    series.appear(1000, 100);
  }

  loadCuentasPagarFija(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/getCuentasPagarFija`).subscribe(data => {
      this.cuentasPagarFija = this.transformarCuentas(data);

      this.sumaPagadasAdmon = this.cuentasPagarFija.reduce((acc: any, cuenta: any) => {
        return cuenta.pagado2 ? acc + (cuenta.sumaTotalPagos || 0) : acc;
      }, 0);

      this.sumaNoPagadasAdmon = this.cuentasPagarFija.reduce((acc: any, cuenta: any) => {
        return !cuenta.pagado2 ? acc + (cuenta.saldo2 || 0) : acc;
      }, 0);

      this.updateChartData();
    });
  }

  updateChartData(): void {
    this.data = [{
      "year": this.currentMonth,
      "Veh": this.sumaPagadasVeh,
      "Veh2": this.sumaNoPagadasVeh,
      "Prov": this.sumaPagadasProv,
      "Prov2": this.sumaNoPagadasProv,
      "Admon": this.sumaPagadasAdmon,
      "Admon2": this.sumaNoPagadasAdmon
    }];
    this.cdRef.detectChanges();
  }

  transformarCuentas(data: any[]): any[] {
    let cuentasTransformadas: any[] = [];
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    data.forEach(cuenta => {
      const sumaTotalPagos = cuenta.pagos.reduce((acc: any, pago: any) =>
        acc + pago.pagosArray.reduce((acc: any, subpago: any) => acc + subpago.valor, 0), 0);

      cuenta.pagos.forEach((pago: any) => {
        const sumaPagosPeriodo = pago.pagosArray.reduce((acc: any, subpago: any) => acc + subpago.valor, 0);
        let fechaFormateada = '';
        let fechaPagoFormateada = "";

        if (pago.fechaPago) {
          const fechaPagoDate = new Date(pago.fechaPago);
          fechaPagoFormateada = `${fechaPagoDate.getDate()} de ${monthNames[fechaPagoDate.getMonth()]} del ${fechaPagoDate.getFullYear()}`;
        }

        if (pago.pagosArray.length > 0) {
          const fechaUltimoSubPago = new Date(pago.pagosArray.sort((a: any, b: any) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha);
          fechaFormateada = `${fechaUltimoSubPago.getDate()} de ${monthNames[fechaUltimoSubPago.getMonth()]} del ${fechaUltimoSubPago.getFullYear()}`;
        } else {
          fechaFormateada = "Sin pagos";
        }

        let cuentaDuplicada = {
          ...cuenta,
          fechaPago: fechaPagoFormateada,
          fechaPago2: pago.fechaPago,
          fecha: fechaFormateada,
          valor2: pago.valor,
          saldo2: pago.saldo,
          pagado2: pago.pagado,
          aprueba2: pago.aprueba,
          diasVencidos2: pago.diasVencidos,
          sumaPagos: sumaPagosPeriodo,
          sumaTotalPagos: sumaTotalPagos
        };
        cuentasTransformadas.push(cuentaDuplicada);
      });
    });

    return cuentasTransformadas;
  }

  initChart(): void {
    this.root = am5.Root.new("chartdiv");

    this.root.setThemes([
      am5themes_Animated.new(this.root!)
    ]);

    let chart = this.root.container.children.push(am5xy.XYChart.new(this.root!, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      paddingLeft: 0,
      layout: this.root.verticalLayout
    }));

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(this.root, {
      categoryField: "year",
      renderer: am5xy.AxisRendererX.new(this.root, { minGridDistance: 30 })
    }));
    xAxis.data.setAll(this.data);

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      renderer: am5xy.AxisRendererY.new(this.root, {})
    }));

    yAxis.data.setAll(this.data);


    this.createSeries(chart, "Veh Pagado", "Veh", "#3D5179", false);
    this.createSeries(chart, "Veh Saldo", "Veh2", "#EC442B", true);
    this.createSeries(chart, "Prov Pagado", "Prov", "#3D5179", false);
    this.createSeries(chart, "Prov Saldo", "Prov2", "#EC442B", true);
    this.createSeries(chart, "Admon Pagado", "Admon", "#3D5179", false);
    this.createSeries(chart, "Admon Saldo", "Admon2", "#EC442B", true);

    let legend = chart.children.push(am5.Legend.new(this.root, {
      centerX: am5.p50,
      x: am5.p50,
    }));

    legend.labels.template.setAll({
      fontSize: 12.69
    });

    legend.data.setAll(chart.series.values);

    chart.children.push(am5.Legend.new(this.root, {
      centerX: am5.p50,
      x: am5.p50
    }));

    chart.appear(1000, 100);
  }

  initDistribucionMarcas(): void {
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
      fontSize: 12,
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

  createSeries(chart: am5xy.XYChart, name: string, field: string, color: string, stacked: boolean): void {
    let series = chart.series.push(am5xy.ColumnSeries.new(this.root, {
      name: name,
      xAxis: chart.xAxes.getIndex(0)!,
      yAxis: chart.yAxes.getIndex(0)!,
      valueYField: field,
      categoryXField: "year",
      sequencedInterpolation: true,
      stacked: stacked
    }));

    series.columns.template.setAll({
      fill: am5.color(color),
      stroke: am5.color(color),
      tooltipText: "{name}: {valueY}",
      width: am5.percent(90),
      tooltipY: am5.percent(10)
    });

    series.data.setAll(this.data);

    series.bullets.push(() => {
      let label = am5.Label.new(this.root, {
        centerY: am5.percent(50),
        centerX: am5.percent(50),
        text: "$ {valueY}",
        fill: am5.color("#ffffff"),
        populateText: true
      });
      let bullet = am5.Bullet.new(this.root, {
        locationY: 0.5,
        sprite: label
      });
      return bullet;
    });
  }


  formatSalary(salary: any): string {
    if (typeof salary === 'string' && salary.includes('$')) {
      return salary;
    }

    let numberSalary = typeof salary === 'string' ? parseFloat(salary) : salary;

    if (isNaN(numberSalary) || numberSalary === null) {
      return '-';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numberSalary);
  }

}
