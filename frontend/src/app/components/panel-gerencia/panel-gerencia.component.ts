import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { catchError, of, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
// api.service.ts

// Define una interfaz para el tipo de vehículo (puedes ponerla al inicio del archivo o en un archivo separado)
interface Vehiculo {
  id?: number; // ID del vehículo (opcional si no todos tienen ID)
  marca?: string;
  modelo?: string;
  referencia?: string;
  tipo_negocio?: string;
  estado: number; // El estado que viene de la API (1 o 0)
  selected?: boolean; // Propiedad para el estado del checkbox
  // Añade aquí otras propiedades que tengan tus vehículos
}

interface Referencia {
  name: string;
  id: number;
  estado: number;
  disabled: boolean;
  // Campos adicionales que ahora vienen de la tabla carro
  marca?: string;
  modelo?: string;
  referencia?: string;
  linea?: string;
  version?: string;
  ref3?: string;
}
interface Ciudad {
  name: string;
  id: number;
  ubicaciones: number;
  placas: number;
  disabled: boolean;
}

@Component({
  selector: 'app-panel-gerencia',
  templateUrl: './panel-gerencia.component.html',
  styleUrls: ['./panel-gerencia.component.css']
})
export class PanelGerenciaComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private apiUrl = environment.apiUrl;
  modelo: string = '';
  kilometraje: string = '';
  valorMin: string = '';
  valorMax: string = '';
  ciudades: any[] =[];
  UseCity: any[] = [];
  UsePlaca: any[] = [];
  marcasSelecionadas: any[] = [];
  ciudadesSelecionadas: any[] = [];
  placasSelecionadas: any[] = [];

  selectedDepartamentoPlaca: string = ''; // Propiedad para almacenar la placa seleccionada
  selectedMarca: string = ''; // Propiedad para almacenar la marca seleccionada
  selectedDepartamentoUbicacion: string = ''; // Propiedad para almacenar la ciudad seleccionada

  // Variables para paginación
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;
  totalPages = 0;
  displayStart = 0;
  displayEnd = 0;

  math = Math;
  selectedModeloFiltro: string = '';
  selectedMarcaFiltro: string = '';


  onMarcaChange(event: any): void {
    const marcaSeleccionada = this.dataListMarcas.find(
      marca => marca.name === this.selectedMarca
    );

    if (marcaSeleccionada) {
      // Ahora pasamos el nombre de la marca directamente
      this.cargarReferenciasPorMarca(marcaSeleccionada.name);
    } else {
      this.marcasSelecionadas = [];
      console.warn('No se encontró la marca seleccionada');
    }
  }

  onModeloFiltroChange(): void {
    // Limpia la marca seleccionada al cambiar el modelo
    this.selectedMarcas = '';
    this.selectedReferencia = '';
    this.selectedTipo = '';

    // Vuelve a cargar las marcas filtradas por modelo
    this.cargarMarcasFiltradas();
    this.cargarReferenciasFiltradas();
    this.cargarTiposFiltrados();
  }

  onMarcaFiltroChange(): void {
    // Limpia la marca seleccionada al cambiar el modelo
    this.selectedReferencia = '';
    this.selectedTipo = '';

    // Vuelve a cargar las marcas filtradas por modelo
    this.cargarReferenciasFiltradas();
    this.cargarTiposFiltrados();
  }

  onReferenciaFiltroChange(): void {
    // Limpia la marca seleccionada al cambiar el modelo
    this.selectedTipo = '';

    // Vuelve a cargar las marcas filtradas por modelo
    this.cargarTiposFiltrados();
  }

  onDepartamentoHubicacionChange(event: any): void {
    // Encuentra el departamento seleccionado en dataListDepartamento
    const departamentoSeleccionado = this.dataListDepartamentosUbicacion.find(
      departamento => departamento.name === this.selectedDepartamentoUbicacion
    );

    if (departamentoSeleccionado) {
      // Llama a cargarCiudadesPorDepartamento con el id del departamento seleccionado
      this.cargarCiudadesPorDepartamentoUbicacion(departamentoSeleccionado.id);
    } else {
      // Si no se selecciona ningún departamento, limpia ciudadesUbicacionSeleccionada
      this.ciudadesUbicacionesSeleccionadas = [];
      console.warn('No se encontró el departamento seleccionado o no se seleccionó ninguno.');
    }
  }

   // Método para manejar el cambio de selección de placas
  onDepartamentoPlacaChange(event: any): void {
    // Encuentra el departamento seleccionado en dataListDepartamentosPlacas
    const departamentoSeleccionado = this.dataListDepartamentosPlacas.find(
      departamento => departamento.name === this.selectedDepartamentoPlaca
    );

    if (departamentoSeleccionado) {
      // Llama a cargarCiudadesPorDepartamento con el id del departamento seleccionado
      this.cargarCiudadesPorDepartamentoPlacas(departamentoSeleccionado.id);
    } else {
      // Si no se selecciona ningún departamento, limpia dataListCiudadesPlacas
      this.dataListCiudadesPlacas = [];
      console.warn('No se encontró el departamento seleccionado o no se seleccionó ninguno.');
    }
  }

  selectedCars: any[] = [];

  dataListMarcas = [
    { name: 'Toyota', id: 1, disabled: false },
  ];

  dataListReferencias: Referencia[] = [];

  referenciasSeleccionadas: Referencia[] = [];

  dataListDepartamentosUbicacion = [
    { name: 'Bogotá', id: 1, disabled: false },
  ];

  dataListCiudadesUbicacion: Ciudad[] = [];

  ciudadesUbicacionesSeleccionadas: Ciudad[] = [];

  dataListDepartamentosPlacas = [
    { name: 'Bogotá', id: 1, disabled: false },
  ];

  dataListCiudadesPlacas: Ciudad[] = [];

  ciudadesPlacasSeleccionadas: Ciudad[] = [];
  /**
   * Indica si se está cargando información (puede usarse para mostrar spinner).
   */
  isLoading: any;

  /**
   * Lista principal de vehículos obtenidos de la API (se completa en `cargarVehiculos()`).
   */
  vehiculos: any[] = [];

  /**
   * Estado de apertura/cierre del menú lateral o principal.
   */
  menuOpen = false;

  /**
   * Datos del usuario actual.
   */
  userName: string = '';
  userCompany: string = '';
  userRole: string = '';
  userCorreo: string = '';
  userTelefono: any;
  company: any;

  /**
   * Controla la visibilidad de un modal (boolean).
   */
  isModalVisible = false;

  /**
   * Arrays con las marcas, modelos y referencias (extraídas de `vehiculos`).
   */
  marcas = [...new Set(this.vehiculos.map(v => v.marca))];
  modelos = [...new Set(this.vehiculos.map(v => v.modelo))];
  referencias = [...new Set(this.vehiculos.map(v => v.referencia))];
  tipos = [...new Set(this.vehiculos.map(v => v.tipo))];

  /**
   * Para seleccionar o deseleccionar todos los vehículos en la lista filtrada.
   */
  selectAll: boolean = false;

  /**
   * Opción seleccionada para "tipo de negocio".
   */
  selectedTipo = '';

  /**
   * Filtros seleccionados en la interfaz.
   */
  selectedMarcas = '';
  selectedModelo = '';
  selectedReferencia = '';

  /**
   * Lista de vehículos que cumple con los filtros (inicialmente copia de `vehiculos`).
   */
  vehiculosFiltrados = [...this.vehiculos];

  /**
   * Mapeo de valores de tipo_negocio a texto más descriptivo.
   */
  tipoNegocioMap: { [key: number]: string } = {
    1: 'TIPO 1',
    2: 'TIPO 2',
    3: 'TIPO 3',
    4: 'ESPECIALES',
    5: 'SIN CLASIFICAR',
    6: 'FUERA DE ESTANDAR',
    7: 'PEDIDOS'
  };

  /**
   * Nombres de columnas, usados como encabezados en la tabla.
   */
  nombresColumna1 = [
    'TIPO 1',
    'TIPO 2',
    'TIPO 3',
  ];
  /**
   * Array que almacena porcentajes para las columnas2,3,4 en la tabla de tipos (ver `getTablatipos()`).
   */
  porcentajes = [
    { columna2: '', columna3: '', columna4: '' },
    { columna2: '', columna3: '', columna4: '' },
    { columna2: '', columna3: '', columna4: '' },
    { columna2: '', columna3: '', columna4: '' },
    { columna2: '', columna3: '', columna4: '' },
    { columna2: '', columna3: '', columna4: '' },
    { columna2: '', columna3: '', columna4: '' },
  ];

  /**
   * Constructor del componente.
   * @param platformId para saber si es navegador o servidor (SSR).
   * @param renderer para manipular el DOM si fuera necesario.
   * @param http HttpClient para peticiones a la API.
   * @param route ActivatedRoute para obtener parámetros de la ruta (si aplica).
   * @param authService para manejar sesión y datos del usuario.
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer: Renderer2,
    private http: HttpClient,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Verifica si todas las referencias están seleccionadas
  areAllReferencesSelected(): boolean {
    return this.referenciasSeleccionadas?.length === this.dataListReferencias?.length;
  }

  // Alterna la selección de todas las referencias
  toggleSelectAllReferences(event: any): void {
    if (event.target.checked) {
      this.referenciasSeleccionadas = [...this.dataListReferencias];
    } else {
      this.referenciasSeleccionadas = [];
    }
  }

  onSelectionChangeMarcas(selected: any) {
    this.marcasSelecionadas = selected.map((item: any) => item.name);
  }

  onSelectionChangeCity(selected: any) {
    console.log('Ciudades seleccionadas:', selected);
    this.marcasSelecionadas = selected.map((item: any) => item.name);
  }

  onSelectionChangePlacas(selected: any) {
    this.marcasSelecionadas = selected.map((item: any) => item.name);
  }

  /**
   * Hook de inicialización: carga datos del usuario, carga vehículos y tabla de tipos.
   */
  ngOnInit(): void {
    this.cargarTodosVehiculosParaFiltros(); // Primero carga los filtros
    this.getTablatipos();
    this.getTablaFiltrosAcs();
    this.cargarDepartamentos();
    this.cargarMarcas();
    this.getVehiculos();
    this.cargarTiposFiltrados();
  }

  /**
   * Cierra la sesión y recarga la página.
   */
  logout() {
    this.authService.logoutUser();
    location.reload();
  }

  /**
   * Alterna el menú lateral.
   */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Muestra el modal (asignando isModalVisible a true).
   */
  openModal(): void {
    this.isModalVisible = true;
  }

  /**
   * Cierra el modal (asignando isModalVisible a false).
   */
  closeModal(): void {
    this.isModalVisible = false;
  }

  /**
   * Ejemplo de método para actualizar datos luego de editar en un modal.
   * Muestra un alert y cierra el modal.
   */
  actualizar(): void {
    this.closeModal();
    //this.capturarDatos();
    this.actualizarTodosTipos();
    this.actualizarFiltroAcs();
    this.actualizarReferencias();
    this.actualizarCiudadesUbicacion();
    this.actualizarCiudadesPlacas();
    location.reload();
    //alert('Datos actualizados exitosamente.');
  }

  getVehiculos(): void {
    this.isLoading = true;

    const params = new HttpParams()
      .set('marca', this.selectedMarcas || '')
      .set('modelo', this.selectedModelo || '')
      .set('referencia', this.selectedReferencia || '')
      .set('tipo_negocio', this.selectedTipo || '')
      .set('page', this.currentPage.toString())
      .set('limit', this.itemsPerPage.toString());

    this.http.get<any>(`${this.apiUrl}/api/vehiculos/paginados`, { params })
      .subscribe({
        next: (response) => {
          this.vehiculosFiltrados = response.data;
          this.totalItems = response.totalRegistros;
          this.totalPages = response.totalPaginas;

          // Calcula los valores para mostrar
          this.displayStart = (this.currentPage - 1) * this.itemsPerPage + 1;
          this.displayEnd = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

           // Mapea los datos para inicializar 'selected' basado en 'estado'
          this.vehiculosFiltrados = response.data.map((vehiculo: Vehiculo) => ({
            ...vehiculo,
            selected: vehiculo.estado === 1
          }));

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
    }

    // Métodos para cambiar de página
    goToPage(page: number): void {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.getVehiculos();
      }
    }

    previousPage(): void {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.getVehiculos();
      }
    }

    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.getVehiculos();
      }
    }

  filtrarVehiculos(): void {
    this.isLoading = true;
    this.currentPage = 1; // Resetear a la primera página al aplicar nuevos filtros

    const params = new HttpParams()
      .set('marca', this.selectedMarcas || '')
      .set('modelo', this.selectedModelo || '')
      .set('referencia', this.selectedReferencia || '')
      .set('tipo_negocio', this.selectedTipo || '')
      .set('page', this.currentPage.toString())
      .set('limit', this.itemsPerPage.toString());

    this.http.get<any>(`${this.apiUrl}/api/vehiculos/paginados`, { params })
      .subscribe({
        next: (response) => {
          console.log('Respuesta recibida:', response); // Debug

          this.vehiculosFiltrados = response.data;
          this.totalItems = response.totalRegistros;
          this.totalPages = response.totalPaginas;

          // Mapea los datos para inicializar 'selected' basado en 'estado'
          this.vehiculosFiltrados = response.data.map((vehiculo: Vehiculo) => ({
            ...vehiculo,
            selected: vehiculo.estado === 1
          }));

          // Actualizar los rangos de visualización
          this.updateDisplayRange();

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al filtrar:', error);
          this.isLoading = false;
        }
      });
  }

  updateDisplayRange(): void {
    this.displayStart = (this.currentPage - 1) * this.itemsPerPage + 1;
    this.displayEnd = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Método para generar el array de páginas a mostrar
  getPages(): number[] {
    const pagesToShow = 5; // Número máximo de páginas a mostrar en los controles
    const startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);

    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }

  // Método para manejar el cambio en items por página
  onItemsPerPageChange(): void {
    this.currentPage = 1; // Volver a la primera página al cambiar el tamaño
    this.getVehiculos();
  }

  cargarMarcasFiltradas(): void {
    const params = this.selectedModelo
      ? new HttpParams().set('modelo', this.selectedModelo)
      : new HttpParams();

    this.http.get<any[]>(`${this.apiUrl}/api/vehiculos/marcas`, { params })
      .subscribe({
        next: (marcasData) => {
          this.marcas = marcasData.map(item => item.marca || item.nombre)
                                .filter(marca => marca)
                                .sort((a, b) => a.localeCompare(b));
        },
        error: (error) => console.error('Error al cargar marcas:', error)
      });
  }

  cargarReferenciasFiltradas(): void {
    let params = new HttpParams();
    
    // Agregar parámetro de marca si está seleccionado
    if (this.selectedMarcas) {
      params = params.set('marca', this.selectedMarcas);
    }
    
    // Agregar parámetro de modelo si está seleccionado
    if (this.selectedModelo) {
      params = params.set('modelo', this.selectedModelo);
    }
    
    this.http.get<any[]>(`${this.apiUrl}/api/vehiculos/referencias`, { params })
      .subscribe({
        next: (referenciasData) => {
          this.referencias = [...new Set(referenciasData.map(item => item.referencia))]
                            .sort((a, b) => a.localeCompare(b));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar referencias:', error);
          this.isLoading = false;
        }
      });
  }

  cargarTiposFiltrados(): void {
    let params = new HttpParams();
        
    // Agregar parámetro de marca si está seleccionado
    if (this.selectedMarcas) {
      params = params.set('marca', this.selectedMarcas);
    }
        
    // Agregar parámetro de modelo si está seleccionado
    if (this.selectedModelo) {
      params = params.set('modelo', this.selectedModelo);
    }
    
    // Agregar parámetro de referencia si está seleccionado
    if (this.selectedReferencia) {
      params = params.set('referencia', this.selectedReferencia);
    }
        
    this.http.get<any[]>(`${this.apiUrl}/api/vehiculos/tipos`, { params })
      .subscribe({
        next: (tiposData) => {
          // Extraer los valores únicos de tipo_negocio
          this.tipos = [...new Set(tiposData.map(item => item.tipo_negocio))]
                          // Ordenar numéricamente en lugar de alfabéticamente
                          .sort((a, b) => a - b);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar tipos:', error);
          this.isLoading = false;
        }
      });
  }

  cargarTodosVehiculosParaFiltros(): void {
    this.isLoading = true;

    // Cargar modelos desde endpoint específico
    this.http.get<any[]>(`${this.apiUrl}/api/vehiculos/modelos`)
      .subscribe({
        next: (modelosData) => {
          this.modelos = [...new Set(modelosData.map(item => item.modelo.toString()))]
                        .sort((a, b) => a.localeCompare(b));
        },
        error: (error) => console.error('Error al cargar modelos:', error)
      });

    // Parámetros para filtrar marcas por modelo
    let paramsMarcas = new HttpParams();
    if (this.selectedModeloFiltro) {
      paramsMarcas = paramsMarcas.set('modelo', this.selectedModeloFiltro);
    }

    // Cargar marcas con filtro por modelo
    this.http.get<any[]>(`${this.apiUrl}/api/vehiculos/marcas`, { params: paramsMarcas })
      .subscribe({
        next: (marcasData) => {
          this.marcas = marcasData.map(item => item.marca || item.nombre)
                                .filter(marca => marca)
                                .sort((a, b) => a.localeCompare(b));
        },
        error: (error) => console.error('Error al cargar marcas:', error)
      });

    // Parámetros para filtrar referencias por marca
    let paramsReferencias = new HttpParams();
    if (this.selectedMarcaFiltro) {
      paramsReferencias = paramsReferencias.set('marca', this.selectedMarcaFiltro);
    }

    // Cargar referencias filtradas por marca
    this.http.get<any[]>(`${this.apiUrl}/api/vehiculos/referencias`, { params: paramsReferencias })
      .subscribe({
        next: (referenciasData) => {
          this.referencias = [...new Set(referenciasData.map(item => item.referencia))]
                            .sort((a, b) => a.localeCompare(b));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar referencias:', error);
          this.isLoading = false;
        }
      });
  }

  getTablatipos(): void {
    console.log('Iniciando getTablatipos...'); // Debug 1
    this.http.get<any[]>(`${this.apiUrl}/api/carros/tablatipos/todos`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener la tabla de tipos:', error); // Debug 2
          return of([]);
        })
      )
      .subscribe({
        next: (data: any[]) => {
          console.log('Datos recibidos:', data); // Debug 3
          this.porcentajes = data.map((item, index) => ({
            columna2: item.oferta_rapida || 0,
            columna3: item.oferta_estandar || 0,
            columna4: item.oferta_flexible || 0
          }));
          console.log('porcentajes asignado:', this.porcentajes); // Debug 4
        },
        error: (err) => {
          console.error('Error en la suscripción:', err); // Debug 5
        }
      });
  }

  isEditing: { [key: number]: boolean } = {};  // control de edición por fila

  updatePorcentaje(index: number, value: string, columna: number) {
    const cleaned = value.replace('%', '').trim();
    if (columna === 2) {
      this.porcentajes[index].columna2 = cleaned === '' ? '0' : cleaned;
    }
    if (columna === 3) {
      this.porcentajes[index].columna3 = cleaned === '' ? '0' : cleaned;
    }
    if (columna === 4) {
      this.porcentajes[index].columna4 = cleaned === '' ? '0' : cleaned;
    }
  }

  onBlur(index: number) {
    // Cuando se pierde el foco, se desactiva el modo edición
    this.isEditing[index] = false;

    // Si el valor quedó vacío, lo dejamos en 0
    if (!this.porcentajes[index].columna2) {
      this.porcentajes[index].columna2 = '0';
    }
  }

  actualizarTodosTipos(): void {

    this.porcentajes.forEach((item, index) => {
      const payload = {
        tipo_negocio: index + 1,
        oferta_rapida: Number(item.columna2.replace('%', '')),
        oferta_estandar: Number(item.columna3.replace('%', '')),
        oferta_flexible: Number(item.columna4.replace('%', ''))
      };

      this.http.put(`${this.apiUrl}/api/carros/tablatipos/actualizar`, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error(`Error al actualizar el registro ${index}:`, error);
            return of(null);
          })
        )
        .subscribe((response: any) => {
          if(response){
            console.log(`Registro ${index} actualizado.`);
          }
        });
    });
  }

  getTablaFiltrosAcs(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/filtrosacs/todos`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener los registros de filtros_acs:', error);
          return of([]); // Devuelve un array vacío en caso de error
        })
      )
      .subscribe((data: any[]) => {
        if (data.length > 0) {
          // Encuentra el registro con el id de mayor valor
          const registroConMayorId = data.reduce((prev, current) => {
            return (prev.id > current.id) ? prev : current;
          });

          // Inserta los valores del registro en las cajas de texto editables
          this.modelo = registroConMayorId.modelo;
          this.formatearKilometraje(registroConMayorId.kilometraje.toString());
          this.formatearValorMin(registroConMayorId.valorMin.toString());
          this.formatearValorMax(registroConMayorId.valorMax.toString());

        } else {
          console.warn('No se encontraron registros en filtros_acs.');
        }
      });
  }


  formatearKilometraje(valor: string) {
    // Elimina puntos (.) antes de volver a formatear
    const limpio = valor.replace(/\./g, '');

    // Verifica que sea un número
    if (!/^\d*$/.test(limpio)) return;

    // Aplica el formato con punto como separador de miles
    this.kilometraje = this.agregarPuntosMiles(limpio);
  }

  formatearValorMin(valor: string) {
    // Elimina puntos (.) antes de volver a formatear
    const limpio = valor.replace(/\./g, '');

    // Verifica que sea un número
    if (!/^\d*$/.test(limpio)) return;

    // Aplica el formato con punto como separador de miles
    this.valorMin = this.agregarPuntosMiles(limpio);
  }

  formatearValorMax(valor: string) {
    // Elimina puntos (.) antes de volver a formatear
    const limpio = valor.replace(/\./g, '');

    // Verifica que sea un número
    if (!/^\d*$/.test(limpio)) return;

    // Aplica el formato con punto como separador de miles
    this.valorMax = this.agregarPuntosMiles(limpio);
  }

  agregarPuntosMiles(valor: string): string {
    return valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  actualizarFiltroAcs(): void {
    // Prepara el payload con los datos de los campos
    const payload = {
      modelo: this.modelo,
      kilometraje: Number(this.kilometraje.replace(/\./g, '')), // Elimina los puntos antes de enviar
      valorMin: Number(this.valorMin.replace(/\./g, '')), // Elimina los puntos antes de enviar
      valorMax: Number(this.valorMax.replace(/\./g, '')) // Elimina los puntos antes de enviar
    };

    // Realiza la solicitud HTTP PUT para actualizar los datos
    this.http.put(`${this.apiUrl}/api/filtrosacs/actualizar`, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar los datos de filtros_acs:', error);
          return of(null); // Devuelve null en caso de error
        })
      )
      .subscribe((response: any) => {
        if (response) {
          console.log('Datos actualizados exitosamente:', response);
          //alert('Datos actualizados exitosamente.');
        } else {
          alert('Hubo un error al actualizar los datos. Por favor, inténtalo de nuevo.');
        }
      });
  }

  cargarMarcas(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/marcas`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar las marcas:', error);
          return of([]); // Devuelve un array vacío en caso de error
        })
      )
      .subscribe((data: any[]) => {
        // Almacena los datos en dataListMarcas
        const marcas = data.map(marca => ({
          name: marca.nombre, // Nombre del departamento
          id: marca.id,       // ID del departamento
          disabled: false            // Habilitado por defecto
        }));

        this.dataListMarcas = marcas; // Para el desplegable de ubicación

        //console.log('Departamentos cargados:', departamentos); // Verifica los datos cargados
      });
  }

  cargarDepartamentos(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/departamentos/todos`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar los departamentos:', error);
          return of([]); // Devuelve un array vacío en caso de error
        })
      )
      .subscribe((data: any[]) => {
        // Almacena los datos en dataListDepartamento y dataListDepartamentosPlacas
        const departamentos = data.map(departamento => ({
          name: departamento.nombre, // Nombre del departamento
          id: departamento.id,       // ID del departamento
          disabled: false            // Habilitado por defecto
        }));

        this.dataListDepartamentosUbicacion = departamentos; // Para el desplegable de ubicación
        this.dataListDepartamentosPlacas = departamentos; // Para el desplegable de placas

        //console.log('Departamentos cargados:', departamentos); // Verifica los datos cargados
      });
  }

  cargarReferenciasPorMarca(nombreMarca: string): void {
    this.http.get<any[]>(`${this.apiUrl}/api/vehiculos/marca/${nombreMarca}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar los vehículos:', error);
          return of([]);
        })
      )
      .subscribe((data: any[]) => {
        this.dataListReferencias = data.map(vehiculo => {
          // Crear el texto de visualización concatenando los campos
          const displayText = [
            vehiculo.linea || 'Sin línea',
            vehiculo.version || 'Sin versión',
            vehiculo.ref3 || 'Sin ref3',
            vehiculo.modelo || 'Sin modelo'
          ].join(' - ');

          return {
            name: vehiculo.referencia,
            id: vehiculo.id,
            estado: vehiculo.estado,
            disabled: false,
            displayText: displayText, // <-- Esta propiedad se usará para mostrar en el ng-select
            // Mantener los demás campos por si los necesitas
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            referencia: vehiculo.referencia,
            linea: vehiculo.linea,
            version: vehiculo.version,
            ref3: vehiculo.ref3
          };
        });

        this.referenciasSeleccionadas = this.dataListReferencias.filter(ref => ref.estado === 1);
      });
  }

  cargarCiudadesPorDepartamentoUbicacion(id_dep: number): void {
    this.http.get<any[]>(`${this.apiUrl}/api/ciudades/${id_dep}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar las ciudades:', error);
          return of([]); // Devuelve un array vacío en caso de error
        })
      )
      .subscribe((data: any[]) => {
        // Almacena todas las ciudades en dataListCiudadesUbicacion
        this.dataListCiudadesUbicacion = data.map(ciudad => ({
          name: ciudad.nombre,
          id: ciudad.id,
          ubicaciones: ciudad.ubicaciones,
          placas: ciudad.placas,
          disabled: false
        }));
        // Filtra las ciudades con ubicaciones === 1 y las almacena en ciudadesUbicacionSeleccionada
        this.ciudadesUbicacionesSeleccionadas = this.dataListCiudadesUbicacion.filter(ciudad => ciudad.ubicaciones === 1);

        console.log('Ciudades cargadas:', this.dataListCiudadesUbicacion); // Verifica los datos cargados
        console.log('Ciudades seleccionadas (ubicaciones === 1):', this.ciudadesUbicacionesSeleccionadas); // Verifica las ciudades seleccionadas
      });
  }

  cargarCiudadesPorDepartamentoPlacas(id_dep: number): void {
    this.http.get<any[]>(`${this.apiUrl}/api/ciudades/${id_dep}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al cargar las ciudades:', error);
          return of([]); // Devuelve un array vacío en caso de error
        })
      )
      .subscribe((data: any[]) => {
        // Almacena todas las ciudades en dataListCiudadesUbicacion
        this.dataListCiudadesPlacas = data.map(ciudad => ({
          name: ciudad.nombre,
          id: ciudad.id,
          ubicaciones: ciudad.ubicaciones,
          placas: ciudad.placas,
          disabled: false
        }));

        // Filtra las ciudades con ubicaciones === 1 y las almacena en ciudadesUbicacionSeleccionada
        this.ciudadesPlacasSeleccionadas = this.dataListCiudadesPlacas.filter(ciudad => ciudad.placas === 1);

        // Filtra las ciudades cuyo id_dep coincide con el id del departamento seleccionado y las almacena en dataListCiudadesPlacas
        //this.ciudadesPlacasSeleccionadas = this.dataListCiudadesPlacas.filter(ciudad => ciudad.id_dep === id_dep);

        console.log('Ciudades cargadas:', this.dataListCiudadesPlacas); // Verifica los datos cargados
        console.log('Ciudades seleccionadas (ubicaciones === 1):', this.ciudadesPlacasSeleccionadas); // Verifica las ciudades seleccionadas
      });
  }

  actualizarReferencias(): void {
    // Actualizar referencias seleccionadas (estado = 1)
    this.referenciasSeleccionadas.forEach(referencia => {
      const payload = { estado: 1 };
      this.http.put(`${this.apiUrl}/api/vehiculos/${referencia.id}/estado`, payload)
        .subscribe(response => {
          console.log(`Vehículo ID ${referencia.id} actualizado`);
        });
    });

    // Actualizar referencias no seleccionadas (estado = 0)
    const referenciasNoSeleccionadas = this.dataListReferencias.filter(ref =>
      !this.referenciasSeleccionadas.some(sel => sel.id === ref.id)
    );

    referenciasNoSeleccionadas.forEach(referencia => {
      const payload = { estado: 0 };
      this.http.put(`${this.apiUrl}/api/vehiculos/${referencia.id}/estado`, payload)
        .subscribe(response => {
          console.log(`Vehículo ID ${referencia.id} actualizado`);
        });
    });
  }

// En el componente TypeScript
  actualizarEstadoVehiculo(id: number, checkbox: Event): void {
    // Obtenemos el estado actual del checkbox después del clic
    const isChecked = (checkbox.target as HTMLInputElement).checked;

    // Si está marcado, payload.estado = 1, sino payload.estado = 0
    const payload = { estado: isChecked ? 1 : 0 };

    this.http.put(`${this.apiUrl}/api/vehiculos/${id}/estado`, payload)
      .subscribe(response => {
        console.log(`Vehículo ID ${id} actualizado`);
      });
  }

  actualizarTipoNegocio(vehiculo: Vehiculo): void {
    // Guarda el valor original por si falla
    const originalValue = vehiculo.tipo_negocio;

    // Asegúrate que el valor es numérico
    const tipoNegocioNum = Number(vehiculo.tipo_negocio);

    // Verifica que sea un número válido entre 1-7
    if (isNaN(tipoNegocioNum) || tipoNegocioNum < 1 || tipoNegocioNum > 7) {
      console.error('Valor inválido para tipo_negocio:', vehiculo.tipo_negocio);
      vehiculo.tipo_negocio = originalValue;
      return;
    }

    const payload = { tipo_negocio: tipoNegocioNum };

    this.http.put(`${this.apiUrl}/api/vehiculos/${vehiculo.id}/tipo-negocio`, payload, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }).subscribe({
      next: (response) => {
        console.log('Actualización exitosa:', response);
      },
      error: (error) => {
        console.error('Error en la solicitud:', {
          url: `${this.apiUrl}/api/vehiculos/${vehiculo.id}/tipo-negocio`,
          payload,
          error: error.error,
          status: error.status
        });
        vehiculo.tipo_negocio = originalValue; // Revertir en UI
      }
    });
  }

  actualizarCiudadesUbicacion(): void {
    // Actualiza los objetos en ciudadesUbicacionesSeleccionadas (ubicaciones = 1)
    this.ciudadesUbicacionesSeleccionadas.forEach(ciudad => {
      console.log('Actualizando ciudad:', ciudad); // Debug
      const payload = {
        ubicaciones: 1
      };

      this.http.put(`${this.apiUrl}/api/ciudades/${ciudad.id}/ubicaciones`, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error(`Error al actualizar el campo ubicaciones de la ciudad con ID ${ciudad.id}:`, error);
            return of(null); // Devuelve null en caso de error
          })
        )
        .subscribe((response: any) => {
          if (response) {
            console.log(`Campo 'ubicaciones' de la ciudad con ID ${ciudad.id} actualizado exitosamente.`);
          }
        });
    });

    // Actualiza los objetos que no están en ciudadesUbicacionesSeleccionadas (ubicaciones = 0)
    const ciudadesNoSeleccionadas = this.dataListCiudadesUbicacion.filter(ciudad =>
      !this.ciudadesUbicacionesSeleccionadas.some(seleccionada => seleccionada.id === ciudad.id)
    );

    ciudadesNoSeleccionadas.forEach(ciudad => {
      const payload = {
        ubicaciones: 0
      };

      this.http.put(`${this.apiUrl}/api/ciudades/${ciudad.id}/ubicaciones`, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error(`Error al actualizar el campo ubicaciones de la ciudad con ID ${ciudad.id}:`, error);
            return of(null); // Devuelve null en caso de error
          })
        )
        .subscribe((response: any) => {
          if (response) {
            console.log(`Campo 'ubicaciones' de la ciudad con ID ${ciudad.id} actualizado exitosamente.`);
          }
        });
    });

    // Opcional: Muestra un mensaje de éxito al finalizar
    console.log('Actualización de ciudades carros completada.');
  }

  actualizarCiudadesPlacas(): void {
    // Actualiza los objetos en ciudadesUbicacionesSeleccionadas (ubicaciones = 1)
    this.ciudadesPlacasSeleccionadas.forEach(ciudad => {
      const payload = {
        placas: 1
      };

      this.http.put(`${this.apiUrl}/api/ciudades/${ciudad.id}/placas`, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error(`Error al actualizar el campo placas de la ciudad con ID ${ciudad.id}:`, error);
            return of(null); // Devuelve null en caso de error
          })
        )
        .subscribe((response: any) => {
          if (response) {
            console.log(`Campo 'placas' de la ciudad con ID ${ciudad.id} actualizado exitosamente.`);
          }
        });
    });

    // Actualiza los objetos que no están en ciudadesUbicacionesSeleccionadas (ubicaciones = 0)
    const ciudadesNoSeleccionadas = this.dataListCiudadesPlacas.filter(ciudad =>
      !this.ciudadesPlacasSeleccionadas.some(seleccionada => seleccionada.id === ciudad.id)
    );

    ciudadesNoSeleccionadas.forEach(ciudad => {
      const payload = {
        placas: 0
      };

      this.http.put(`${this.apiUrl}/api/ciudades/${ciudad.id}/placas`, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error(`Error al actualizar el campo placas de la ciudad con ID ${ciudad.id}:`, error);
            return of(null); // Devuelve null en caso de error
          })
        )
        .subscribe((response: any) => {
          if (response) {
            console.log(`Campo 'placas' de la ciudad con ID ${ciudad.id} actualizado exitosamente.`);
          }
        });
    });

    // Opcional: Muestra un mensaje de éxito al finalizar
    console.log('Actualización de ciudades placas completada.');
  }
  /**
   * Marca o desmarca todos los vehículos en vehiculosFiltrados según el valor de selectAll.
   */
  toggleSelectAll() {
    this.vehiculosFiltrados.forEach(vehiculo => {
      vehiculo.selected = this.selectAll;
    });
  }

  /// Método para permitir solo números y el punto decimal en un campo de entrada
  numberOnly(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    // Permite: backspace (8), tab (9), delete (46), flechas (37-40)
    if ([8, 9, 46, 37, 38, 39, 40].indexOf(charCode) !== -1) {
      return true;
    }

    // Permite dígitos (48-57) y el punto (46)
    // Nota: Si ya permites el 46 como delete, asegúrate de controlar que solo se inserte un punto
    if ((charCode >= 48 && charCode <= 57) || charCode === 46) {
      return true;
    }

    event.preventDefault();
    return false;
  }
}
