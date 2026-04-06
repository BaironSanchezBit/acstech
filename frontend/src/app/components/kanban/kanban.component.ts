import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, OnDestroy, ElementRef, QueryList, ViewChildren, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, forkJoin, of, throwError } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

type EstadoInventario = 'DISPONIBLE A LA VENTA' | 'ASIGNADO EN INICIALES' | 'VENDIDO';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css'],
})
export class KanbanComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  mostrarModal: boolean = false;
  mostrarModalPre: boolean = false;
  loading: boolean = true;

  fotosCedulaPropietario: string[] = [];
  fotosTarjetaPropietario: string[] = [];
  fotosSoat: string[] = [];
  fotosCertificadoTradicion: string[] = [];
  fotosEstadoCuentaImpuesto: string[] = [];
  fotosSimitPropietario: string[] = [];
  fotosLiquidacionDeudaFinanciera: string[] = [];
  fotosOficioDesembargo: string[] = [];
  fotosTecnoMecanica: string[] = [];
  fotosManifiestoFactura: string[] = [];
  fotosSoatIniciales: string[] = [];
  fotosImpuestoAno: string[] = [];
  adjuntos: string[] = [];

  datosUser: any;

  showModal: boolean = false;
  imagenSeleccionadaIndex: number = 0;
  imagenesModal: string[] = [];
  adjuntosToShow: string[] = [];
  mostrarTodosAdjuntos: boolean = false;

  inventarioSeleccionado: any = {};
  inventarios: any[] = [];

  preInventarios: any[] = [];
  preInventariosFiltrados: any[] = [];

  busquedaActual: string = '';
  inventariosFiltrados: any[] = [];

  pageSize: number = 23;
  currentPage: number = 0;
  totalItems: number = 0;
  inventariosPaginados: any[] = [];

  filtrosActivos: { [key: string]: string[] } = {};
  clientes: { [key: string]: any } = {};
  compradores: { [key: string]: any } = {};
  vehiculos: { [key: string]: any } = {};
  todosLosFiltros = {
    proveedor: ['AUTONAL', 'PERSONA NATURAL', 'PERSONA JURIDICA'],
    estadoInventario: ['VENDIDO', 'DISPONIBLE A LA VENTA', 'ASIGNADO EN INICIALES', 'EN DEVOLUCIÓN', 'EN GARANTÍA', 'REGISTRO COMPRA AUTOMAGNO', 'DECLINADO', 'TERMINADO'],
    tipoNegocio: ['COMPRA', 'CONSIGNACION', 'RETOMA']
  };
  estadoPrioridad: { [key in EstadoInventario]: number } = {
    'ASIGNADO EN INICIALES': 1,
    'DISPONIBLE A LA VENTA': 2,
    'VENDIDO': 3
  };
  private apiUrl = environment.apiUrl;

  @ViewChildren('extraDescription') extraDescriptions!: QueryList<ElementRef<HTMLTextAreaElement>>;
  @ViewChildren('extraField') extraFields!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(private http: HttpClient, private sharedData: SharedDataService, private authService: AuthService, private router: Router) {
  }

  onDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.inventarios, event.previousIndex, event.currentIndex);
  }

  ngOnInit(): void {
    // Cargar el DOM y luego los datos
    this.authService.getUserDetails().subscribe(
      user => {
        this.datosUser = user;
      },
      error => {
        console.error('Error fetching user details', error);
      }
    );

    this.loadInventoriesAndAssociatedData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadInventoriesAndAssociatedData(): void {
    this.loading = true;

    const vehiculoCache: { [id: string]: any } = {};
    const clienteCache: { [id: string]: any } = {};
    const compradorCache: { [id: string]: any } = {};

    forkJoin({
      inventarios: this.http.get<any[]>(`${this.apiUrl}/api/getInventoriesAll`),
      preInventarios: this.http.get<any[]>(`${this.apiUrl}/api/getpreinventoriesAll`)
    }).pipe(
      switchMap(({ inventarios, preInventarios }) => {
        // Asignación de datos a las variables correspondientes
        this.inventarios = inventarios.map(inventario => {
          inventario.infoExtra = inventario.infoExtra || [];
          return inventario;
        }).sort((a, b) => this.sortByPriority(a, b));

        this.preInventarios = preInventarios.map(preInventario => {
          preInventario.infoExtra = preInventario.infoExtra || [];
          return preInventario;
        });

        // Filtrados iniciales
        this.inventariosFiltrados = [...this.inventarios];
        this.preInventariosFiltrados = [...this.preInventarios];
        this.totalItems = this.inventariosFiltrados.length;

        this.actualizarInventariosPaginados(); // Lógica de paginación

        const preInventarioDetails$ = this.preInventarios.map(preInventario =>
          forkJoin({
            cliente: this.buscarClienteCache(preInventario.cliente, clienteCache),
            comprador: this.buscarCompradorCache(preInventario.comprador, compradorCache),
            vehiculo: this.buscarVehiculoCache(preInventario.vehiculo, vehiculoCache)
          })
        );

        
        // Carga de clientes, compradores y vehículos tanto de inventarios como de pre-inventarios
        const inventarioDetails$ = this.inventarios.map(inventario =>
          forkJoin({
            cliente: this.buscarClienteCache(inventario.cliente, clienteCache),
            comprador: this.buscarCompradorCache(inventario.comprador, compradorCache),
            vehiculo: this.buscarVehiculoCache(inventario.vehiculo, vehiculoCache)
          })
        );

        return forkJoin([...inventarioDetails$, ...preInventarioDetails$]);
      })
    ).subscribe(
      () => {
        this.loading = false;
        this.cargarFiltros();
        this.aplicarFiltrosYBusqueda();
      },
      error => {
        console.error('Error fetching inventories and associated data', error);
        this.loading = false;
      }
    );
  }

  private buscarVehiculoCache(id: string, cache: { [id: string]: any }): Observable<any> {
    if (cache[id]) {
      return of(cache[id]);
    }
    return this.buscarVehiculoPorId(id).pipe(
      tap(vehiculo => cache[id] = vehiculo)
    );
  }

  private buscarClienteCache(id: string, cache: { [id: string]: any }): Observable<any> {
    if (cache[id]) {
      return of(cache[id]);
    }
    return this.buscarClientePorId(id).pipe(
      tap(cliente => cache[id] = cliente)
    );
  }

  private buscarCompradorCache(id: string, cache: { [id: string]: any }): Observable<any> {
    if (cache[id]) {
      return of(cache[id]);
    }
    return this.buscarCompradorPorId(id).pipe(
      tap(comprador => cache[id] = comprador)
    );
  }

  private actualizarInventariosPaginados() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.inventariosPaginados = this.inventariosFiltrados.slice(startIndex, endIndex);
    // preInventariosFiltrados ya fue filtrado por aplicarFiltros/aplicarFiltrosYBusqueda
    // No se debe sobrescribir aqui con datos sin filtrar
  }

  anteriorPagina() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.actualizarInventariosPaginados();
    }
  }

  siguientePagina() {
    if ((this.currentPage + 1) * this.pageSize < this.totalItems) {
      this.currentPage++;
      this.actualizarInventariosPaginados();
    }
  }


  private sortByPriority(a: any, b: any): number {
    return b.inventoryId - a.inventoryId;
  }

  openModal(imagenes: string[], index: number) {
    this.imagenesModal = imagenes;
    this.imagenSeleccionadaIndex = index;
    this.showModal = true;
  }

  get formattedPrecioPublicacion(): string {
    return this.formatSalary(this.inventarioSeleccionado.precioPublicacion);
  }

  set formattedPrecioPublicacion(value: string) {
    this.inventarioSeleccionado.precioPublicacion = this.desformatearMoneda(value);
  }


  onCurrencyInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/[^\d-]/g, '');
    const numericValue = parseInt(inputValue, 10);

    if (!isNaN(numericValue)) {
      const formattedValue = this.formatCurrencyWithCommas(numericValue);
      inputElement.value = formattedValue;
    }
  }

  formatCurrencyWithCommas(value: number): string {
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value));

    return (value < 0 ? '-' : '') + formatted;
  }

  accesorio(accesorio: any) {
    let esTrue = false;

    if (accesorio === 'OK EN VEHICULO' || accesorio === 'OK EN CARPETA') {
      esTrue = true;
    } else if (accesorio === 'N/A') {
      esTrue = false;
    } else {
      esTrue = false;
    }

    return esTrue;
  }

  private cargarInventariosYDatosAsociados() {
    this.subscriptions.add(this.http.get<any[]>(`${this.apiUrl}/api/getInventoriesAll`).pipe(
      switchMap(data => {
        this.inventarios = data.map(inventario => {
          if (!inventario.infoExtra) {
            inventario.infoExtra = [];
          }
          return inventario;
        }).sort((a, b) => b.inventoryId - a.inventoryId);

        this.inventarios = this.eliminarInventariosDuplicados(this.inventarios);
        this.inventariosFiltrados = [...this.inventarios];

        return forkJoin(this.inventarios.map(inventario =>
          forkJoin({
            cliente: this.buscarClientePorId(inventario.cliente),
            comprador: this.buscarCompradorPorId(inventario.comprador),
            vehiculo: this.buscarVehiculoPorId(inventario.vehiculo)
          })
        ));
      })
    ).subscribe(
      () => this.aplicarFiltros(),
      error => console.error('Error fetching inventories and associated data', error)
    ));

    this.subscriptions.add(this.http.get<any[]>(`${this.apiUrl}/api/getpreinventoriesAll`).pipe(
      switchMap(data => {
        this.preInventarios = data.map(preInventario => {
          if (!preInventario.infoExtra) {
            preInventario.infoExtra = [];
          }
          return preInventario;
        });
        this.preInventariosFiltrados = [...this.preInventarios];

        return forkJoin(this.preInventarios.map(preInventario =>
          forkJoin({
            vehiculo: this.buscarVehiculoPorId(preInventario.vehiculo)
          })
        ));
      })
    ).subscribe(
      () => this.aplicarFiltros(),
      error => console.error('Error fetching pre-inventories and associated data', error)
    ));
  }

  manejarErrorImagen(event: any) {
    event.target.src = '../assets/img/noFoto.png';
  }

  private buscarVehiculoPorId(vehiculoId: string): Observable<any> {
    if (!this.vehiculos[vehiculoId]) {
      return this.http.get<any>(`${this.apiUrl}/api/getVehicles/${vehiculoId}`).pipe(
        tap(vehiculoData => {
          if (vehiculoData && vehiculoData.imagenVehiculo) {
            this.vehiculos[vehiculoId] = vehiculoData;
          } else {
            this.vehiculos[vehiculoId] = { imagenVehiculo: '../assets/img/noFoto.png' };
          }
        }),
        catchError(error => {
          console.error(`Error fetching vehicle data for ID ${vehiculoId}`, error);
          this.vehiculos[vehiculoId] = { imagenVehiculo: '../assets/img/noFoto.png' };
          return of(this.vehiculos[vehiculoId]);
        })
      );
    }
    return of(this.vehiculos[vehiculoId]);
  }

  buscarClientePorId(cliente: string): Observable<any> {
    if (!cliente) {
      return of({ primerNombre: 'N/A', segundoNombre: '', primerApellido: '', segundoApellido: '', celularOne: '' });
    }
    if (!this.clientes[cliente]) {
      return this.http.get<any>(`${this.apiUrl}/api/getClients/${cliente}`).pipe(
        tap(clienteData => {
          this.clientes[cliente] = clienteData;
        }),
        catchError(error => {
          console.error(`Error fetching client data for ID ${cliente}`, error);
          this.clientes[cliente] = { primerNombre: 'N/A', segundoNombre: '', primerApellido: '', segundoApellido: '', celularOne: '' };
          return of(this.clientes[cliente]);
        })
      );
    }
    return of(this.clientes[cliente]);
  }

  buscarCompradorPorId(comprador: string): Observable<any> {
    if (!comprador) {
      return of(null);
    }

    if (this.compradores[comprador]) {
      return of(this.compradores[comprador]);
    } else {
      return this.http.get<any>(`${this.apiUrl}/api/getClients/${comprador}`).pipe(
        tap(compradorData => {
          this.compradores[comprador] = compradorData;
        }),
        catchError(error => {
          console.error(`Error fetching buyer data for ID ${comprador}`, error);
          this.compradores[comprador] = null;
          return of(null);
        })
      );
    }
  }

  filtrarInventarios(terminoDeBusqueda: string) {
    this.busquedaActual = terminoDeBusqueda.toLowerCase();
    this.aplicarFiltrosYBusqueda();
  }

  aplicarFiltrosYBusqueda() {
    let resultados = [...this.inventarios, ...this.preInventarios];

    if (Object.keys(this.filtrosActivos).length > 0) {
      resultados = resultados.filter(inventario =>
        Object.keys(this.filtrosActivos).every(key =>
          this.filtrosActivos[key].includes(inventario.filtroBaseDatos?.[key])
        )
      );
    }

    if (this.busquedaActual) {
      resultados = resultados.filter(inventario =>
        this.esTerminoEnInventario(inventario, this.busquedaActual)
      );
    }

    this.inventariosFiltrados = resultados.filter(item => this.inventarios.includes(item));
    this.preInventariosFiltrados = resultados.filter(item => this.preInventarios.includes(item));

    this.currentPage = 0;
    this.totalItems = this.inventariosFiltrados.length;
    this.actualizarInventariosPaginados();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  esTerminoEnInventario(inventario: any, terminoDeBusqueda: string): boolean {
    const propiedadesInventario = ['filtroBaseDatos.tipoNegocio',
      'filtroBaseDatos.proveedor',
      'filtroBaseDatos.estadoInventario',
      'peritajeProveedor.lugar',
      'peritajeProveedor.estado',
      'link',
      'inventoryId',
      'generadorContratosVentas.asesorComercial',
      'generadorContratosVentas.gestorDocumental',
      'deudaFinanciera.entidadDeudaFinan'];
    for (let propiedad of propiedadesInventario) {
      let valor = propiedad.split('.').reduce((acc, parte) => acc && acc[parte], inventario);
      if (valor && valor.toString().toLowerCase().includes(terminoDeBusqueda)) {
        return true;
      }
    }

    const cliente = this.clientes[inventario.cliente];
    const vehiculo = this.vehiculos[inventario.vehiculo];

    const propiedadesCliente = ['primerNombre',
      'segundoNombre',
      'primerApellido',
      'SegundoApellido'];
    const propiedadesVehiculo = ['marca',
      'modelo',
      'placa',
      'version',
      'linea',
      'combustible',
      'servicio',
      'clase',
      'carroceria',
      'ciudadPlaca',
      'clase'];

    for (let propiedad of propiedadesCliente) {
      if (cliente && cliente[propiedad] && cliente[propiedad].toLowerCase().includes(terminoDeBusqueda)) {
        return true;
      }
    }

    for (let propiedad of propiedadesVehiculo) {
      if (vehiculo && vehiculo[propiedad] && vehiculo[propiedad].toLowerCase().includes(terminoDeBusqueda)) {
        return true;
      }
    }

    return false;
  }


  aplicarFiltros() {
    if (Object.keys(this.filtrosActivos).every(key => this.filtrosActivos[key].length === 0)) {
      this.inventariosFiltrados = [...this.inventarios];
      this.preInventariosFiltrados = [...this.preInventarios];
    } else {
      let resultados = [...this.inventarios];
      let preResultados = [...this.preInventarios];

      Object.keys(this.filtrosActivos).forEach(key => {
        if (this.filtrosActivos[key].length > 0) {
          resultados = resultados.filter(inventario =>
            this.filtrosActivos[key].includes(inventario.filtroBaseDatos?.[key])
          );
          preResultados = preResultados.filter(preInventario =>
            this.filtrosActivos[key].includes(preInventario.filtroBaseDatos?.[key])
          );
        }
      });

      this.inventariosFiltrados = resultados;
      this.preInventariosFiltrados = preResultados;
    }
    this.currentPage = 0;
    this.totalItems = this.inventariosFiltrados.length;
    this.actualizarInventariosPaginados();
  }

  formatearFechaALetras(fecha: string): string {
    const fechaObj = new Date(fecha);

    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    const fechaFormateada = new Intl.DateTimeFormat('es-ES', opciones).format(fechaObj);

    return fechaFormateada;
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

  desformatearMoneda(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();
    const valorNumerico = valorComoCadena.replace(/[^\d]/g, '');
    const resultado = parseFloat(valorNumerico);
    return !isNaN(resultado) ? resultado : 0;
  }

  sumaTotalCompra(valorCompraNumero: string, totalDocumentacion: string): string {
    let valorCompra;
    let valorDocumentacion;

    if (valorCompraNumero !== undefined && valorCompraNumero !== null) {
      valorCompra = Number(valorCompraNumero);
    } else {
      valorCompra = 0;
    }

    if (totalDocumentacion !== undefined && totalDocumentacion !== null) {
      valorDocumentacion = this.desformatearMoneda(totalDocumentacion);
    } else {
      valorDocumentacion = 0;
    }
    const total = valorCompra - valorDocumentacion;

    return this.formatSalary(total);
  }

  sendInventoryId(inventoryId: string) {
    this.sharedData.changeInventoryId(inventoryId);
    this.router.navigate(['/adquisicion']);
  }

  sendInventoryIdVenta(inventoryId: string) {
    this.sharedData.changeInventoryId(inventoryId);
    this.router.navigate(['/venta']);
  }

  sendInventoryIdCotiza(inventoryId: string) {
    this.sharedData.changeInventoryId(inventoryId);
    this.router.navigate(['/cotizaciones']);
  }

  sendInventoryIdAlist(inventoryId: string) {
    this.sharedData.changeInventoryId(inventoryId);
    this.router.navigate(['/alistamiento']);
  }

  sumaTotalVenta(valorVentaNumero: string, totalDocumentacion: string): string {
    let valorVenta;
    let valorDocumentacion;

    if (valorVentaNumero !== undefined && valorVentaNumero !== null) {
      valorVenta = Number(valorVentaNumero);
    } else {
      valorVenta = 0;
    }

    if (totalDocumentacion !== undefined && totalDocumentacion !== null) {
      valorDocumentacion = this.desformatearMoneda(totalDocumentacion);
    } else {
      valorDocumentacion = 0;
    }


    const total = valorVenta + valorDocumentacion;

    return this.formatSalary(total);
  }

  formatearNumeroAMiles(numero: any) {
    return new Intl.NumberFormat('es-ES').format(numero);
  }

  agregarFiltroUnificado(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const valorCompleto = selectElement.value;
    if (valorCompleto === '') return;

    const [categoria, valor] = valorCompleto.split(':');
    if (!this.filtrosActivos[categoria]) {
      this.filtrosActivos[categoria] = [];
    }
    if (!this.filtrosActivos[categoria].includes(valor)) {
      this.filtrosActivos[categoria].push(valor);
    }
    this.aplicarFiltrosYBusqueda();
    this.guardarFiltros();

    selectElement.value = '';
  }

  eliminarFiltro(categoria: string, valor: string) {
    const index = this.filtrosActivos[categoria].indexOf(valor);
    if (index > -1) {
      this.filtrosActivos[categoria].splice(index, 1);
      if (this.filtrosActivos[categoria].length === 0) {
        delete this.filtrosActivos[categoria];
      }
      this.aplicarFiltrosYBusqueda();
      this.guardarFiltros();
    }
  }

  getFiltrosActivosKeys() {
    return Object.keys(this.filtrosActivos);
  }

  estadosInventario: string[] = [
    'VENDIDO',
    'DISPONIBLE A LA VENTA',
    'ASIGNADO EN INICIALES',
    'EN DEVOLUCIÓN',
    'EN GARANTÍA',
    'REGISTRO COMPRA AUTOMAGNO',
    'DECLINADO',
    'TERMINADO'
  ];

  mostrarMenuEstado: string | null = null;

  toggleMenuEstado(event: Event, inventarioId: string) {
    event.stopPropagation();
    this.mostrarMenuEstado = this.mostrarMenuEstado === inventarioId ? null : inventarioId;
  }

  cambiarEstadoInventario(event: Event, inventario: any, nuevoEstado: string) {
    event.stopPropagation();
    this.mostrarMenuEstado = null;
    const estadoAnterior = inventario.filtroBaseDatos.estadoInventario;
    inventario.filtroBaseDatos.estadoInventario = nuevoEstado;

    this.http.put(`${this.apiUrl}/api/updateInventories/${inventario._id}`, {
      filtroBaseDatos: { ...inventario.filtroBaseDatos, estadoInventario: nuevoEstado }
    }).subscribe({
      next: () => {
        console.log('Estado actualizado:', nuevoEstado);
      },
      error: (err: any) => {
        console.error('Error actualizando estado:', err);
        inventario.filtroBaseDatos.estadoInventario = estadoAnterior;
      }
    });
  }

  guardarFiltros() {
    localStorage.setItem('filtrosActivos', JSON.stringify(this.filtrosActivos));
  }

  cargarFiltros() {
    const filtrosGuardados = localStorage.getItem('filtrosActivos');
    if (filtrosGuardados) {
      this.filtrosActivos = JSON.parse(filtrosGuardados);
      this.aplicarFiltrosYBusqueda();
    }
  }

  eliminarInventariosDuplicados(inventarios: any[]): any[] {
    const inventariosUnicos: any[] = [];
    const vehiculosVistos = new Set();

    inventarios.forEach(inventario => {
      const vehiculoId = inventario.vehiculo;
      if (!vehiculosVistos.has(vehiculoId)) {
        vehiculosVistos.add(vehiculoId);
        inventariosUnicos.push(inventario);
      }
    });

    return inventariosUnicos;
  }

  ordenarInventarios(event: Event) {
    const criterio = (event.target as HTMLSelectElement).value;

    if (criterio === '') {
      // Re-aplicar filtros activos en lugar de resetear
      this.aplicarFiltrosYBusqueda();
    } else {
      this.inventariosFiltrados.sort((a, b) => {
        switch (criterio) {
          case 'compraMenorMayor':
            return this.obtenerValorCompra(a) - this.obtenerValorCompra(b);
          case 'compraMayorMenor':
            return this.obtenerValorCompra(b) - this.obtenerValorCompra(a);
          case 'ventaMenorMayor':
            return this.obtenerValorVenta(a) - this.obtenerValorVenta(b);
          case 'ventaMayorMenor':
            return this.obtenerValorVenta(b) - this.obtenerValorVenta(a);
          case 'kilometrajeMenorMayor':
            return a.generadorContratos.kilometraje - b.generadorContratos.kilometraje;
          case 'kilometrajeMayorMenor':
            return b.generadorContratos.kilometraje - a.generadorContratos.kilometraje;
          default:
            return 0;
        }
      });
      this.actualizarInventariosPaginados();
    }
  }

  updateInfoExtra() {
    this.http.put<any>(`${this.apiUrl}/api/updateInfoExtra/${this.inventarioSeleccionado.inventoryId}`, {
      infoExtra: this.inventarioSeleccionado.infoExtra
    }).subscribe(
      data => {
      },
      error => {
      }
    );
  }

  addInfoExtra() {
    if (!this.inventarioSeleccionado.infoExtra) {
      this.inventarioSeleccionado.infoExtra = [];
    }
    this.inventarioSeleccionado.infoExtra.push({ descripcion: '', campo: '' });
    setTimeout(() => this.ajustarAlturaTextareas(), 0);
  }

  removeInfoExtra(index: number) {
    this.inventarioSeleccionado.infoExtra.splice(index, 1);
    this.updateInfoExtra();
  }

  adjustHeight(event: Event, index: number) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    const descriptionTextarea = this.extraDescriptions.toArray()[index].nativeElement;
    const fieldTextarea = this.extraFields.toArray()[index].nativeElement;

    this.syncHeights(descriptionTextarea, fieldTextarea);
  }

  private syncHeights(textarea1: HTMLTextAreaElement, textarea2: HTMLTextAreaElement) {
    const height = Math.max(textarea1.scrollHeight, textarea2.scrollHeight);
    textarea1.style.height = height + 'px';
    textarea2.style.height = height + 'px';
  }

  private ajustarAlturaTextareas() {
    this.extraDescriptions.forEach((description, index) => {
      const field = this.extraFields.toArray()[index].nativeElement;
      this.syncHeights(description.nativeElement, field);
    });
  }

  obtenerValorCompra(inventario: any): number {
    let valorCompra = 0;
    if (inventario.filtroBaseDatos?.proveedor === 'AUTONAL') {
      valorCompra = this.desformatearMoneda(inventario.tramitesSalidaAutonal.valorNetoVehiculo);
    } else {
      valorCompra = this.desformatearMoneda(this.sumaTotalCompra(inventario.formaPagoCompra?.valorCompraNumero, inventario.liquidaciones?.totalDocumentacion));
    }
    return valorCompra;
  }

  obtenerValorVenta(inventario: any): number {
    let valorCompra = this.desformatearMoneda(this.sumaTotalVenta(inventario.formaPagoVenta?.valorVentaNumero, inventario.liquidacionesVenta?.totalDocumentacion));
    return valorCompra;
  }

  abrirModal(inventario: any): void {
    if (!inventario.infoExtra) {
      inventario.infoExtra = [];
    }
    this.inventarioSeleccionado = inventario;
    this.fotosCedulaPropietario = inventario.documentosTraspasos.fotosCedulaPropietario || [];
    this.fotosTarjetaPropietario = inventario.documentosTraspasos.fotosTarjetaPropietario || [];
    this.fotosSoat = inventario.documentosTraspasos.fotosSoat || [];
    this.fotosCertificadoTradicion = inventario.documentosValoresIniciales.fotosCertificadoTradicion || [];
    this.fotosEstadoCuentaImpuesto = inventario.documentosValoresIniciales.fotosEstadoCuentaImpuesto || [];
    this.fotosSimitPropietario = inventario.documentosValoresIniciales.fotosSimitPropietario || [];
    this.fotosLiquidacionDeudaFinanciera = inventario.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera || [];
    this.fotosOficioDesembargo = inventario.documentosValoresIniciales.fotosOficioDesembargo || [];
    this.fotosTecnoMecanica = inventario.documentosValoresIniciales.fotosTecnoMecanica || [];
    this.fotosManifiestoFactura = inventario.documentosValoresIniciales.fotosManifiestoFactura || [];
    this.fotosSoatIniciales = inventario.documentosValoresIniciales.fotosSoatIniciales || [];
    this.fotosImpuestoAno = inventario.documentosValoresIniciales.fotosImpuestoAno || [];

    this.adjuntos = [
      ...this.fotosCedulaPropietario,
      ...this.fotosTarjetaPropietario,
      ...this.fotosSoat,
      ...this.fotosCertificadoTradicion,
      ...this.fotosEstadoCuentaImpuesto,
      ...this.fotosSimitPropietario,
      ...this.fotosLiquidacionDeudaFinanciera,
      ...this.fotosOficioDesembargo,
      ...this.fotosTecnoMecanica,
      ...this.fotosManifiestoFactura,
      ...this.fotosSoatIniciales,
      ...this.fotosImpuestoAno
    ];

    this.mostrarTodosAdjuntos = false;
    this.actualizarAdjuntosToShow();

    this.mostrarModal = true;
    setTimeout(() => this.ajustarAlturaTextareas(), 0);
  }

  abrirModal2(inventario: any): void {
    if (!inventario.infoExtra) {
      inventario.infoExtra = [];
    }
    this.inventarioSeleccionado = inventario;
    this.fotosCedulaPropietario = inventario.documentosTraspasos.fotosCedulaPropietario || [];
    this.fotosTarjetaPropietario = inventario.documentosTraspasos.fotosTarjetaPropietario || [];
    this.fotosSoat = inventario.documentosTraspasos.fotosSoat || [];
    this.fotosCertificadoTradicion = inventario.documentosValoresIniciales.fotosCertificadoTradicion || [];
    this.fotosEstadoCuentaImpuesto = inventario.documentosValoresIniciales.fotosEstadoCuentaImpuesto || [];
    this.fotosSimitPropietario = inventario.documentosValoresIniciales.fotosSimitPropietario || [];
    this.fotosLiquidacionDeudaFinanciera = inventario.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera || [];
    this.fotosOficioDesembargo = inventario.documentosValoresIniciales.fotosOficioDesembargo || [];
    this.fotosTecnoMecanica = inventario.documentosValoresIniciales.fotosTecnoMecanica || [];
    this.fotosManifiestoFactura = inventario.documentosValoresIniciales.fotosManifiestoFactura || [];
    this.fotosSoatIniciales = inventario.documentosValoresIniciales.fotosSoatIniciales || [];
    this.fotosImpuestoAno = inventario.documentosValoresIniciales.fotosImpuestoAno || [];

    this.adjuntos = [
      ...this.fotosCedulaPropietario,
      ...this.fotosTarjetaPropietario,
      ...this.fotosSoat,
      ...this.fotosCertificadoTradicion,
      ...this.fotosEstadoCuentaImpuesto,
      ...this.fotosSimitPropietario,
      ...this.fotosLiquidacionDeudaFinanciera,
      ...this.fotosOficioDesembargo,
      ...this.fotosTecnoMecanica,
      ...this.fotosManifiestoFactura,
      ...this.fotosSoatIniciales,
      ...this.fotosImpuestoAno
    ];

    this.mostrarTodosAdjuntos = false;
    this.actualizarAdjuntosToShow();

    this.mostrarModalPre = true;
    setTimeout(() => this.ajustarAlturaTextareas(), 0);
  }

  tieneCargo(cargoNecesario: string): boolean {
    return this.datosUser?.cargo === cargoNecesario;
  }

  splif(url: any) {
    return url.split('/').pop();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mostrarModalPre = false;
  }

  closeModal() {
    this.showModal = false;
  }

  isImage(file: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const extension = file.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  private actualizarAdjuntosToShow() {
    if (this.mostrarTodosAdjuntos) {
      this.adjuntosToShow = this.adjuntos;
    } else {
      this.adjuntosToShow = this.adjuntos.slice(0, 5);
    }
  }

  toggleAdjuntos() {
    this.mostrarTodosAdjuntos = !this.mostrarTodosAdjuntos;
    this.actualizarAdjuntosToShow();
  }


  getDefaultIcon(file: string): string {
    const extension = file.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '../assets/img/pdf.png';
      case 'doc':
      case 'docx':
        return '../assets/img/docx.png';
      case 'xls':
      case 'xlsx':
        return '../assets/img/xlsx.png';
      case 'ppt':
      case 'pptx':
        return '../assets/img/pptx.png';
      default:
        return '../assets/img/arhivo.jpg';
    }
  }

  onInputChange(field: string, event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    const updateData = { [field]: value };
    this.updateInventoryFields(this.inventarioSeleccionado._id, updateData);
  }

  onInputChangePrecioPublicado(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const updateData = { precioPublicacion: this.desformatearMoneda(value) };
    this.updateInventoryFields(this.inventarioSeleccionado._id, updateData);
  }

  updateInventoryFields(inventoryId: string, updateData: any) {
    this.http.put(`${this.apiUrl}/api/updateSpecificFields/${inventoryId}`, updateData)
      .subscribe(
        updatedInventory => {
        },
        error => {
        }
      );
  }
}
