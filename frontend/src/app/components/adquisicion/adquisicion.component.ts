import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { ClientsService } from 'src/app/services/clients.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable, Subscription, catchError, forkJoin, map, of, startWith, throwError } from 'rxjs';
import { CurrencyService } from 'src/app/services/currency.service';
import { DatePipe } from '@angular/common';
import { ValidatorFn, ValidationErrors } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { ConversionService } from 'src/app/services/conversion.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { environment } from 'src/app/environments/environment';
declare var bootstrap: any;
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FasecoldaService } from 'src/app/services/fasecolda.service';
import { DomSanitizer } from '@angular/platform-browser';

interface carroceria {
  clase: string;
  carroceria: string;
}

@Component({
  selector: 'app-adquisicion',
  templateUrl: './adquisicion.component.html',
  styleUrls: ['./adquisicion.component.css']
})
export class AdquisicionComponent implements OnInit, OnDestroy {
  pdfUrl: any;
  crearCliente: boolean = false;
  crearVehiculo: boolean = false;
  vehiculoForm: FormGroup = new FormGroup({});
  clienteForm: FormGroup = new FormGroup({});
  ocultar2 = false;
  initialValues: { [key: string]: any } = {};
  isCreating = false;
  cambioAutomagno = false;
  isVitrinaSelected: boolean = false;
  fotosCedulaPropietario: string[] = [];
  fotosTarjetaPropietario: string[] = [];
  fotosSoat: string[] = [];
  fotosCertificadoTradicion: string[] = [];
  fotosEstadoCuentaImpuesto: string[] = [];
  fotosSimitPropietario: string[] = [];
  fotosLiquidacionDeudaFinanciera: string[] = [];
  fotosTecnoMecanica: string[] = [];
  fotosManifiestoFactura: string[] = [];
  fotosSoatIniciales: string[] = [];
  fotosImpuestoAno: string[] = [];
  fotosOficioDesembargo: string[] = [];
  fotosCopiaLlave: string[] = [];
  fotosGato: string[] = [];
  fotosLlavePernos: string[] = [];
  fotosCopaSeguridad: string[] = [];
  fotosTiroArrastre: string[] = [];
  fotosHistorialMantenimiento: string[] = [];
  fotosManual: string[] = [];
  fotosPalomera: string[] = [];
  fotosTapetes: string[] = [];
  fotosLlantaRepuesto: string[] = [];
  fotosKitCarretera: string[] = [];
  fotosAntena: string[] = [];

  deleteMessageIndex: number | null = null;
  deleteMessageField: string | null = null;
  selectedPreInventoryId: string = '';


  cargo: string = "";
  datosUser: any;
  loggedIn: boolean = false;
  registroActividad: any;

  ver0: boolean = false;
  ver1: boolean = false;
  ver2: boolean = false;
  ver3: boolean = false;
  ver4: boolean = false;
  ver5: boolean = false;
  ver6: boolean = false;
  ver7: boolean = false;
  ver8: boolean = false;
  ver9: boolean = false;
  ver10: boolean = false;
  ver11: boolean = false;

  showModal: boolean = false;
  imagenesModal: string[] = [];
  imagenSeleccionadaIndex: number = 0;

  lugares!: any[];
  loading = false;
  suppliers!: any[];
  tallerProveedor!: any[];
  users!: any[];
  fechaActual: string = '';
  fechaActual2: string = '';

  fechaActualString = new Date().toISOString().split('T')[0];
  fechaSeleccionada: string | null = null;
  fechaActualDate: any;
  variables!: any[];
  ocultar = false;
  anoActual: string = '';
  private modalInstance: any;
  valorOfertado: any;

  inventarios: any[] = [];
  preInventarios: any[] = [];
  carroceriasFiltradas: string[] = [];
  selectedFile: File | null = null;
  previewImgVeh: any;

  placaValue = '';
  placaBusqueda = '';
  buscarInventarioForm: FormGroup = new FormGroup({});
  tramitesIngresoForm: FormGroup = new FormGroup({});

  fasecoldaForm: FormGroup = new FormGroup({});
  modelos: string[] = [];
  marcas: string[] = [];
  referencias: string[] = [];
  detallesVehiculos: any[] = [];

  tramitesSalidaAutonalForm: FormGroup = new FormGroup({});
  inventoryId: string | null = null;
  noInventario: string = '';
  filtroBDForm: FormGroup = new FormGroup({});
  valorPago1Actual: number = 0;
  valorPago2Actual: number = 0;
  valorPago3Actual: number = 0;
  btnChange = false;

  allClients: any[] = [];
  clienteControl = new FormControl();
  opcionesFiltradas: Observable<any[]> = of([]);

  allVehicles: any[] = [];
  vehiculoControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  vehiculoInvControl = new FormControl();
  allVehiclesInv: any[] = [];
  opcionesFiltradasVehInv: Observable<any[]> = of([]);

  vehiculo: any = {};
  clients: any = {};
  button1: boolean = false;
  isAutonal: boolean = false;
  showColumn: boolean = false;
  button2: boolean = false;
  button3: boolean = false;
  button4: boolean = false;
  button5: boolean = false;
  button6: boolean = false;
  button7: boolean = false;
  button8: boolean = false;
  button9: boolean = false;
  button10: boolean = false;
  button11: boolean = false;
  button12: boolean = false;
  taller: boolean = false;
  selectedUserPhone: string = '';
  honorariosAutomagno: any;
  selectedUserEmail: string = '';
  usuariosGestores: any[] = [];
  selectedUserPhone2: string = '';
  selectedUserEmail2: string = '';
  usuariosAsesor: any[] = [];
  mostrarSiguienteModal: boolean = false;
  mostrarSiguienteModal2: boolean = false;
  formaPagoCompraForm: FormGroup = new FormGroup({});
  peritajeImprontasForm: FormGroup = new FormGroup({});
  documentosTraspasoForm: FormGroup = new FormGroup({});
  archivoDigitalForm: FormGroup = new FormGroup({});
  documentosValoresInicialesForm: FormGroup = new FormGroup({});
  deudaFinancieraForm: FormGroup = new FormGroup({});
  obsFase3Form: FormGroup = new FormGroup({});
  controlAccesoriosForm: FormGroup = new FormGroup({});
  formasPagoForm: FormGroup = new FormGroup({});
  liquidacionesForm: FormGroup = new FormGroup({});
  generadorContratosForm: FormGroup = new FormGroup({});
  fichaNegocioForm: FormGroup = new FormGroup({});
  tramitesForm: FormGroup = new FormGroup({});
  contadorDias: any;
  provicionTramitesForm: FormGroup = new FormGroup({});
  variablesLiquidacionForm: FormGroup = new FormGroup({});
  formattedValue: string = '';
  formattedValueClausula: string = '';
  clausulaPenal: any;
  letrasValueClausula: any;
  costosTramites!: any[];
  tramitadores!: any[];
  traspaso50: any;
  honorariosTramitador: any;
  diasDevolucionImpuesto: any;
  traspasoNeto: any;
  valorTotalCliente: any;
  valorTotalClienteTwo: any;
  subscription: Subscription = new Subscription();
  private subscriptions: Subscription[] = [];
  btnEsconder: Boolean = false;
  esActualizar: Boolean = false;
  monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];
  totalNegocio: any;
  private routerSubscription: Subscription = new Subscription();
  observacionGlobal: string = '';
  tipo: carroceria[] = [
    { clase: 'AUTOMOVIL', carroceria: 'SEDAN' },
    { clase: 'AUTOMOVIL', carroceria: 'ESTACAS' },
    { clase: 'AUTOMOVIL', carroceria: 'COUPE' },
    { clase: 'AUTOMOVIL', carroceria: 'CONVERTIBLE' },
    { clase: 'AUTOMOVIL', carroceria: 'CARPADO' },
    { clase: 'AUTOMOVIL', carroceria: 'STATION WAGON' },
    { clase: 'AUTOMOVIL', carroceria: 'DOBLE CABINA' },
    { clase: 'AUTOMOVIL', carroceria: 'HATCH BACK' },
    { clase: 'AUTOMOVIL', carroceria: 'VAN' },
    { clase: 'AUTOMOVIL', carroceria: 'BUGGY' },
    { clase: 'AUTOMOVIL', carroceria: 'LIMOSINA' },
    { clase: 'AUTOMOVIL', carroceria: 'DOBLE CABINA CERRADA' },
    { clase: 'CAMION', carroceria: 'ESTACAS' },
    { clase: 'CAMION', carroceria: 'FURGON' },
    { clase: 'CAMION', carroceria: 'CISTERNA' },
    { clase: 'CAMION', carroceria: 'VOLCO' },
    { clase: 'CAMION', carroceria: 'TOLVA' },
    { clase: 'CAMION', carroceria: 'ESTIBAS' },
    { clase: 'CAMION', carroceria: 'HORMIGONERO' },
    { clase: 'CAMION', carroceria: 'GRUA' },
    { clase: 'CAMION', carroceria: 'NIÑERA' },
    { clase: 'CAMION', carroceria: 'CABINADO' },
    { clase: 'CAMION', carroceria: 'DOBLE CABINA' },
    { clase: 'CAMION', carroceria: 'BOMBERO' },
    { clase: 'CAMION', carroceria: 'BOMBA' },
    { clase: 'CAMION', carroceria: 'BARREDORA' },
    { clase: 'CAMION', carroceria: 'LIMPIA ALCANTARILLAS' },
    { clase: 'CAMION', carroceria: 'PANEL' },
    { clase: 'CAMION', carroceria: 'PLATAFORMA' },
    { clase: 'CAMION', carroceria: 'RECOLECTOR' },
    { clase: 'CAMION', carroceria: 'ABIERTO (ESCALERA)' },
    { clase: 'CAMION', carroceria: 'AMBULANCIA' },
    { clase: 'CAMION', carroceria: 'CASA RODANTE' },
    { clase: 'CAMION', carroceria: 'EQUIPO DE CEMENTACIÓN' },
    { clase: 'CAMION', carroceria: 'EQUIPO PETROLERO' },
    { clase: 'CAMION', carroceria: 'MEZCLADOR' },
    { clase: 'CAMION', carroceria: 'AUTOBOMBA' },
    { clase: 'CAMION', carroceria: 'PLANCHON' },
    { clase: 'CAMION', carroceria: 'REPARTO ó PALET' },
    { clase: 'CAMION', carroceria: 'GRUA PLANCHON' },
    { clase: 'CAMION', carroceria: 'GRUA HIDRAULICA' },
    { clase: 'CAMION', carroceria: 'MAQ. BOMBEROS' },
    { clase: 'CAMION', carroceria: 'DOBLE CABINA VOLCO' },
    { clase: 'CAMION', carroceria: 'UNIDAD MOVIL' },
    { clase: 'CAMION', carroceria: 'DOBLE CABINA ESTACAS' },
    { clase: 'CAMION', carroceria: 'DOBLE CABINA FURGON' },
    { clase: 'CAMION', carroceria: 'GRANELERAS' },
    { clase: 'CAMION', carroceria: 'COMPACTADOR' },
    { clase: 'CAMION', carroceria: 'PERFORADOR' },
    { clase: 'CAMION', carroceria: 'EQUIPO DE RESCATE' },
    { clase: 'CAMION', carroceria: 'CAÑERO' },
    { clase: 'CAMION', carroceria: 'GRUA ELEVADORA' },
    { clase: 'CAMION', carroceria: 'FURGON FRIGORIFICO' },
    { clase: 'CAMION', carroceria: 'FURGON CORTINERO' },
    { clase: 'CAMION', carroceria: 'CISTERNA PARA COMBUSTIBLE' },
    { clase: 'CAMION', carroceria: 'CISTERNA PARA QUIMICOS' },
    { clase: 'CAMION', carroceria: 'PLATAFORMA CON EQUIPO ESPECIAL' },
    { clase: 'CAMION', carroceria: 'PLANCHON - PLATAFORMA' },
    { clase: 'CAMIONETA', carroceria: 'ESTACAS' },
    { clase: 'CAMIONETA', carroceria: 'FURGON' },
    { clase: 'CAMIONETA', carroceria: 'CERRADA' },
    { clase: 'CAMIONETA', carroceria: 'ESTIBAS' },
    { clase: 'CAMIONETA', carroceria: 'PICK UP' },
    { clase: 'CAMIONETA', carroceria: 'PLATON' },
    { clase: 'CAMIONETA', carroceria: 'GRUA' },
    { clase: 'CAMIONETA', carroceria: 'CABINADO' },
    { clase: 'CAMIONETA', carroceria: 'CARPADO' },
    { clase: 'CAMIONETA', carroceria: 'STATION WAGON' },
    { clase: 'CAMIONETA', carroceria: 'DOBLE CABINA' },
    { clase: 'CAMIONETA', carroceria: 'BARREDORA' },
    { clase: 'CAMIONETA', carroceria: 'PANEL' },
    { clase: 'CAMIONETA', carroceria: 'PLATAFORMA' },
    { clase: 'CAMIONETA', carroceria: 'ABIERTO (ESCALERA)' },
    { clase: 'CAMIONETA', carroceria: 'VAN' },
    { clase: 'CAMIONETA', carroceria: 'AMBULANCIA' },
    { clase: 'CAMIONETA', carroceria: 'LIMOSINA' },
    { clase: 'CAMIONETA', carroceria: 'REPARTO ó PALET' },
    { clase: 'CAMIONETA', carroceria: 'UNIDAD MOVIL' },
    { clase: 'CAMIONETA', carroceria: 'DOBLE CABINA ESTACAS' },
    { clase: 'CAMIONETA', carroceria: 'DOBLE CABINA FURGON' },
    { clase: 'CAMIONETA', carroceria: 'WAGON' },
    { clase: 'CAMIONETA', carroceria: 'FURGON FRIGORIFICO' },
    { clase: 'CAMIONETA', carroceria: 'DOBLE CABINA CERRADA' },
    { clase: 'CAMIONETA', carroceria: 'PLATAFORMA CON EQUIPO ESPECIAL' },
    { clase: 'CAMIONETA', carroceria: 'PLANCHON - PLATAFORMA' },
    { clase: 'CAMIONETA', carroceria: 'DOBLE CABINA PICO' },
    { clase: 'CAMPERO', carroceria: 'ESTACAS' },
    { clase: 'CAMPERO', carroceria: 'PICK UP' },
    { clase: 'CAMPERO', carroceria: 'CABINADO' },
    { clase: 'CAMPERO', carroceria: 'CARPADO' },
    { clase: 'CAMPERO', carroceria: 'STATION WAGON' },
    { clase: 'CAMPERO', carroceria: 'ABIERTO (ESCALERA)' },
    { clase: 'CAMPERO', carroceria: 'HATCH BACK' },
    { clase: 'CAMPERO', carroceria: 'AMBULANCIA' },
    { clase: 'CAMPERO', carroceria: 'WAGON' },
    { clase: 'CAMPERO', carroceria: 'CAPOTA DUAL' },
    { clase: 'CAMPERO', carroceria: 'PICK UP CABINADA' },
    { clase: 'MOTOCICLETA', carroceria: 'SIN CARROCERIA' },
    { clase: 'MOTOCICLETA', carroceria: 'TURISMO' },
    { clase: 'MOTOCICLETA', carroceria: 'CROSS' },
    { clase: 'MOTOCICLETA', carroceria: 'SCOOPER' },
    { clase: 'MOTOCICLETA', carroceria: 'SPORT' },
    { clase: 'MOTOCICLETA', carroceria: 'CUSTOM' },
    { clase: 'MOTOCARRO', carroceria: 'SIN CARROCERIA' },
    { clase: 'MOTOCARRO', carroceria: 'ESTACAS' },
    { clase: 'MOTOCARRO', carroceria: 'FURGON' },
    { clase: 'MOTOCARRO', carroceria: 'PICK UP' },
    { clase: 'MOTOCARRO', carroceria: 'PLATON' },
    { clase: 'MOTOCARRO', carroceria: 'CABINADO' },
    { clase: 'MOTOCARRO', carroceria: 'CARPADO' },
    { clase: 'MOTOCARRO', carroceria: 'PANEL' },
    { clase: 'MOTOCARRO', carroceria: 'REPARTO' },
  ];
  private apiUrl = environment.apiUrl;

  constructor(private modalService: NgbModal,
    private fasecoldaService: FasecoldaService,
    private conversionService: ConversionService,
    private sharedData: SharedDataService,
    private router: Router,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private currencyService: CurrencyService,
    private http: HttpClient,
    private vehiclesService: VehiclesService,
    private clientsService: ClientsService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
    // Inicializar fechas
    this.fechaActual = new Date().toISOString().substring(0, 10);
    this.fechaSeleccionada = this.fechaActual;
    this.initFechas();
    this.loadInitialData();

    this.initForms();
    this.subscribeToRouterEvents();
    this.subscription = this.sharedData.currentInventoryId.subscribe(id => {
      if (id) {
        this.irAlInventario(id);
        this.calcularTotal();
      }
    });

    // Comenzar llamadas asíncronas
    this.initData();

    // Suscripciones a cambios en formularios
    this.subscribeToFormChanges();

    this.getModelos();

  }

  getModelos() {
    this.fasecoldaService.getModelos().subscribe(
      (data: string[]) => {
        this.modelos = data.sort((a, b) => b.localeCompare(a));
      },
      (error) => {
        console.error('Error al obtener modelos:', error);
      }
    );
  }

  onModeloChange() {
    const modeloSeleccionado = this.fasecoldaForm.get('modelo')?.value;
    if (modeloSeleccionado) {
      this.fasecoldaService.getMarcasByModelo(modeloSeleccionado).subscribe(
        (data: string[]) => {
          this.marcas = data;
          this.fasecoldaForm.get('marca')?.enable();
          this.fasecoldaForm.get('marca')?.setValue('');
          this.referencias = [];
          this.fasecoldaForm.get('referencia')?.disable();
          this.fasecoldaForm.get('referencia')?.setValue('');
        },
        (error) => {
          console.error('Error al obtener marcas:', error);
        }
      );
    } else {
      this.fasecoldaForm.get('marca')?.disable();
      this.fasecoldaForm.get('referencia')?.disable();
    }
  }

  onMarcaChange() {
    const modeloSeleccionado = this.fasecoldaForm.get('modelo')?.value;
    const marcaSeleccionada = this.fasecoldaForm.get('marca')?.value;
    if (modeloSeleccionado && marcaSeleccionada) {
      this.fasecoldaService.getReferenciasByModeloAndMarca(modeloSeleccionado, marcaSeleccionada).subscribe(
        (data: string[]) => {
          this.referencias = data;
          this.fasecoldaForm.get('referencia')?.enable();
          this.fasecoldaForm.get('referencia')?.setValue('');
        },
        (error) => {
          console.error('Error al obtener referencias:', error);
        }
      );
    } else {
      this.fasecoldaForm.get('referencia')?.disable();
    }
  }


  openDetallesModal() {
    const modelo = this.fasecoldaForm.get('modelo')?.value;
    const marca = this.fasecoldaForm.get('marca')?.value;
    const referencia = this.fasecoldaForm.get('referencia')?.value;

    if (modelo && marca && referencia) {
      this.fasecoldaService.getDetallesByModeloMarcaReferencia(modelo, marca, referencia).subscribe(
        (data: any[]) => {
          this.detallesVehiculos = data;

          this.modalService.open(this.detallesModal, { ariaLabelledBy: 'detallesModalLabel', size: 'xl' });
        },
        (error) => {
          console.error('Error al obtener detalles:', error);
        }
      );
    }
  }

  @ViewChild('detallesModal') detallesModal!: TemplateRef<any>;

  seleccionarVehiculo(vehiculo: any) {
    this.vehiculoForm.patchValue({
      marca: vehiculo.marca.toUpperCase(),
      linea: vehiculo.linea.toUpperCase(),
      version: vehiculo.version.toUpperCase(),
      modelo: vehiculo.modelo,
      cilindraje: vehiculo.cilindraje,
      combustible: vehiculo.combustible.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase(),
      pasajeros: vehiculo.pasajeros,
    });
  }

  private markInvalidControlsAsTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        if (control.invalid) {
          control.markAsTouched({ onlySelf: true });
        }
      } else if (control instanceof FormGroup) {
        this.markInvalidControlsAsTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markInvalidControlsAsTouched(ctrl);
          } else if (ctrl.invalid) {
            ctrl.markAsTouched({ onlySelf: true });
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.routerSubscription) this.routerSubscription.unsubscribe();
    if (this.subscription) this.subscription.unsubscribe();
    this.sharedData.clearCurrentInventoryId();
  }

  private initForms(): void {
    this.buscarInventarioForm = this.formBuilder.group({
      buscarInventario: ['', Validators.required]
    });

    this.fasecoldaForm = this.formBuilder.group({
      modelo: ['', Validators.required],
      marca: [{ value: '', disabled: true }, Validators.required],
      referencia: [{ value: '', disabled: true }, Validators.required],
    });

    this.clienteForm = new FormGroup({
      primerNombre: new FormControl('', [Validators.required]),
      segundoNombre: new FormControl(''),
      primerApellido: new FormControl(''),
      segundoApellido: new FormControl(''),
      tipoIdentificacion: new FormControl('', [Validators.required]),
      numeroIdentificacion: new FormControl('', [Validators.required]),
      digitoVerificacion: new FormControl(''),
      ciudadIdentificacion: new FormControl('', [Validators.required]),
      direccionResidencia: new FormControl(''),
      ciudadResidencia: new FormControl('', [Validators.required]),
      celularOne: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]),
      celularTwo: new FormControl(''),
      correoElectronico: new FormControl('', [Validators.required, Validators.email]),
      fechaIngreso: new FormControl(this.fechaActual, [Validators.required])
    });

    this.vehiculoForm = new FormGroup({
      placa: new FormControl('', [Validators.required]),
      marca: new FormControl('', [Validators.required]),
      linea: new FormControl('', [Validators.required]),
      version: new FormControl('', [Validators.required]),
      modelo: new FormControl('', [Validators.required]),
      cilindraje: new FormControl('', [Validators.required]),
      color: new FormControl('', [Validators.required]),
      servicio: new FormControl('', [Validators.required]),
      clase: new FormControl('', [Validators.required]),
      noDocumentoImportacion: new FormControl('', [Validators.required]),
      fechaImportacion: new FormControl('', [Validators.required]),
      carroceria: new FormControl('', [Validators.required]),
      combustible: new FormControl('', [Validators.required]),
      pasajeros: new FormControl('', [Validators.required]),
      numeroMotor: new FormControl('', [Validators.required]),
      ciudadPlaca: new FormControl('', [Validators.required]),
      vin: new FormControl('', [Validators.required]),
      serie: new FormControl('', [Validators.required]),
      chasis: new FormControl('', [Validators.required]),
      imagenVehiculo: new FormControl(''),
      observaciones: new FormControl(''),
      fechaMatricula: new FormControl('', [Validators.required])
    });

    this.filtroBDForm = this.formBuilder.group({
      organizacion: ['', Validators.required],
      tipoNegocio: ['', Validators.required],
      proveedor: ['', Validators.required],
      estadoInventario: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      ubicacion: ['', Validators.required],
      tallerProveedor: [''],
      fechaExpedicion: ['', Validators.required],
    });

    this.obsFase3Form = this.formBuilder.group({
      obsFase3: ['', Validators.required]
    });

    this.formaPagoCompraForm = this.formBuilder.group({
      valorCompraLetras: [''],
      valorCompraNumero: ['$ 0'],
      fechaAsignacion: ['', Validators.required],
      fechaEntrega: [this.fechaActual]
    });

    this.tramitesIngresoForm = this.formBuilder.group({
      valorAutomagno: ['$ 0'],
      valorContrato: ['$ 0'],
      pagoFinanciera: ['$ 0'],
      retefuenteT: ['$ 0'],
      garantiaMobiliaria: ['$ 0'],
      impuestos: ['$ 0'],
      soat: ['$ 0'],
      revTecnoMeca: ['$ 0'],
      comparendos: ['$ 0'],
      documentacion: ['$ 0'],
      manifiestoFactura: ['$ 0'],
      semaforizacion: ['$ 0'],
      camposExtra: this.formBuilder.array([]),
      total: [{ value: '$ 0', disabled: true }],
      valorGirarCliente: [{ value: '$ 0', disabled: true }]
    });

    this.tramitesSalidaAutonalForm = this.formBuilder.group({
      traspaso: ['$ 0'],
      checkTraspaso: [false],
      provTraspaso: [false],
      servicioFueraBogota: ['$ 0'],
      checkServicioFueraBogota: [false],
      provServicioFueraBogota: [false],
      retefuenteS: ['$ 0'],
      checkRetefuenteS: [false],
      provRetefuenteS: [false],
      levantaPrenda: ['$ 0'],
      checkLevantaPrenda: [false],
      provLevantaPrenda: [false],
      garantiaMobiliaria: ['$ 0'],
      checkGarantiaMobiliaria: [false],
      provGarantiaMobiliaria: [false],
      impuestos: ['$ 0'],
      checkImpuestos: [false],
      provImpuestos: [false],
      liquidacionImpuesto: ['$ 0'],
      checkLiquidacionImpuesto: [false],
      provLiquidacionImpuesto: [false],
      derechosMunicipales: ['$ 0'],
      checkDerechosMunicipales: [false],
      provDerechosMunicipales: [false],
      soat: ['$ 0'],
      checkSoat: [false],
      provSoat: [false],
      revTecnoMeca: ['$ 0'],
      checkRevTecnoMeca: [false],
      provRevTecnoMeca: [false],
      comparendos: ['$ 0'],
      checkComparendos: [false],
      provComparendos: [false],
      documentosIniciales: ['$ 0'],
      checkDocumentosIniciales: [false],
      provDocumentosIniciales: [false],
      documentacion: ['$ 0'],
      checkDocumentacion: [false],
      provDocumentacion: [false],
      manifiestoFactura: ['$ 0'],
      checkManifiestoFactura: [false],
      provManifiestoFactura: [false],
      ctci: ['$ 0'],
      checkCtci: [false],
      provCtci: [false],
      semaforizacion: ['$ 0'],
      checkSemaforizacion: [false],
      provSemaforizacion: [false],
      impuestoAnoActual: ['$ 0'],
      checkImpuestoAnoActual: [false],
      provImpuestoAnoActual: [false],
      camposExtrasSalida: this.formBuilder.array([]),
      total: [{ value: '$ 0', disabled: true }],
      comisionBruta: [{ value: '$ 0', disabled: true }],
      comisionNeta: [{ value: '$ 0', disabled: true }],
      valorNetoVehiculo: [{ value: '$ 0', disabled: true }]
    });

    this.peritajeImprontasForm = this.formBuilder.group({
      lugar: [''],
      estado: [''],
      numeroInspeccion: [''],
      linkInspeccion: [''],
      impronta: ['']
    });

    this.documentosTraspasoForm = this.formBuilder.group({
      contratoVenta: ['', Validators.required],
      funt: ['', Validators.required],
      mandato: ['', Validators.required],
      copiaCedulaPropietario: [],
      copiaTarjetaPropietario: [],
      copiaSoat: [],
      copiaTecnicoMecanica: [''],
      copiaGeneralAutenticado: [''],
    });

    this.archivoDigitalForm = this.formBuilder.group({
      link: ['', Validators.required]
    });

    this.documentosValoresInicialesForm = this.formBuilder.group({
      ciudadPlaca: [''],
      certificadoTradicion: [''],
      oficioDesembargo: [''],
      estadoCuentaImpuesto: [''],
      estadoCuentaImpuestoValor: ['$ 0'],
      simitPropietario: [''],
      simitPropietarioValor: ['$ 0'],
      liquidacionDeudaFin: [''],
      liquidacionDeudaFinValor: ['$ 0'],
      estadoTecnicoMecanica: [''],
      dateTecnicoMecanica: [''],
      manifiestoFactura: [''],
      estadoValorTotalSoat: [''],
      totalSoatValor: ['$ 0'],
      fechaFinSoat: [''],
      estadoImpAnoEnCurso: [''],
      impAnoEnCursoValor: ['$ 0'],
      estadoValorRetencion: [''],
      valorRetencionValor: ['$ 0'],
    });

    this.deudaFinancieraForm = this.formBuilder.group({
      entidadDeudaFinan: [''],
      numeroObligacionFinan: [''],
      fechaLimitePagoDeudaFinan: ['']
    });

    this.controlAccesoriosForm = this.formBuilder.group({
      copiaLlave: [{ value: '', disabled: false }],
      copiaLlaveObs: [{ value: '', disabled: false }],
      gato: [{ value: '', disabled: false }],
      gatoObs: [{ value: '', disabled: false }],
      llavePernos: [{ value: '', disabled: false }],
      llavePernosObs: [{ value: '', disabled: false }],
      copaSeguridad: [{ value: '', disabled: false }],
      copaSeguridadObs: [{ value: '', disabled: false }],
      tiroArrastre: [{ value: '', disabled: false }],
      tiroArrastreObs: [{ value: '', disabled: false }],
      historialMantenimiento: [{ value: '', disabled: false }],
      historialMantenimientoObs: [{ value: '', disabled: false }],
      manual: [{ value: '', disabled: false }],
      manualObs: [{ value: '', disabled: false }],
      palomera: [{ value: '', disabled: false }],
      palomeraObs: [{ value: '', disabled: false }],
      tapetes: [{ value: '', disabled: false }],
      tapetesObs: [{ value: '', disabled: false }],
      ultimoKilometraje: [{ value: '', disabled: false }],
      lugarUltimoMantenimiento: [{ value: '', disabled: false }],
      fechaUltimoMantenimiento: [{ value: '', required: false }],
      llantaRepuesto: [{ value: '', disabled: false }],
      llantaRepuestoObs: [{ value: '', disabled: false }],
      kitCarretera: [{ value: '', disabled: false }],
      kitCarreteraObs: [{ value: '', disabled: false }],
      antena: [{ value: '', disabled: false }],
      antenaObs: [{ value: '', disabled: false }]
    });

    this.formasPagoForm = this.formBuilder.group({
      descripcionPago1: [''],
      formaPagoPago1: [''],
      entidadDepositarPago1: [''],
      numeroCuentaObligaPago1: [''],
      tipoCuentaPago1: [''],
      beneficiarioPago1: [''],
      idBeneficiarioPago1: [''],
      fechaPago1: [''],
      valorPago1: [''],
      descripcionPago2: [''],
      formaPagoPago2: [''],
      entidadDepositarPago2: [''],
      numeroCuentaObligaPago2: [''],
      tipoCuentaPago2: [''],
      beneficiarioPago2: [''],
      idBeneficiarioPago2: [''],
      fechaPago2: [''],
      valorPago2: [''],
      descripcionPago3: [''],
      formaPagoPago3: [''],
      entidadDepositarPago3: [''],
      numeroCuentaObligaPago3: [''],
      tipoCuentaPago3: [''],
      beneficiarioPago3: [''],
      idBeneficiarioPago3: [''],
      fechaPago3: [''],
      valorPago3: [''],
      descripcionPago4: [''],
      formaPagoPago4: [''],
      entidadDepositarPago4: [''],
      numeroCuentaObligaPago4: [''],
      tipoCuentaPago4: [''],
      beneficiarioPago4: [''],
      idBeneficiarioPago4: [''],
      fechaPago4: [''],
      valorPago4: [{ value: '', disabled: true }],
    });

    this.liquidacionesForm = this.formBuilder.group({
      traspaso: [{ value: '$ 0', disabled: true }],
      retencion: [{ value: '$ 0', disabled: true }],
      otrosImpuestos: [{ value: '$ 0', disabled: true }],
      levantamientoPrenda: [{ value: '$ 0', disabled: true }],
      comparendos: [{ value: '$ 0', disabled: true }],
      proporcionalImpAnoCurso: [{ value: '$ 0', disabled: true }],
      devolucionSoat: [{ value: '$ 0', disabled: true }],
      honorariosAutomagno: [{ value: '$ 0', disabled: true }],
      retencionFuente: [{ value: '$ 0', disabled: true }],
      traspasoNeto: [{ value: '$ 0', disabled: true }],
      soat: [{ value: '', disabled: true }],
      impuestoAnoCurso: [{ value: '$ 0', disabled: true }],
      otrosImpuestosProv: [{ value: '$ 0', disabled: true }],
      levantamientoPrenda2: [{ value: '$ 0', disabled: true }],
      comparendos2: [{ value: '$ 0', disabled: true }],
      deudaFinanciera: [{ value: '$ 0', disabled: true }],
      honorariosTramitador: [{ value: '$ 0', disabled: true }],
      totalDocumentacion: [{ value: '$ 0', disabled: true }],
      totalProvision: [{ value: '$ 0', disabled: true }],
    });

    this.generadorContratosForm = this.formBuilder.group({
      asesorComercial: ['', Validators.required],
      telefonoAsesor: [{ value: '', disabled: true }],
      correoAsesor: [{ value: '', disabled: true }],
      gestorDocumental: ['', Validators.required],
      telefonoGestor: [{ value: '', disabled: true }],
      correoGestor: [{ value: '', disabled: true }],
      kilometraje: ['', Validators.required],
      horaRecepciom: [''],
      fechaTecnicoMecanica: ['', Validators.required],
      observacionesContrato: ['']
    });

    this.fichaNegocioForm = this.formBuilder.group({
      tipoNegocioFicha: [''],
      valorOfertaFinal: [''],
      valorCreditoPrenda: [''],
      entidadCreditoPrenda: [''],
      valorAnticipoNegocio: [''],
      valorSugeridoVenta: [''],
      porcentajeComision: [''],
      vehiculoRetomaPlaca: [''],
      vehiculoRetomaMarca: [''],
      vehiculoRetomaInventario: [''],
      vehiculoRetomaModelo: [''],
      vehiculoRetomaLinea: [''],
      vehiculoRetomaValor: [''],
      observacionesFicha: ['']
    });

    this.tramitesForm = this.formBuilder.group({
      tramites: this.formBuilder.array([], this.maxTramitesValidator(5))
    });

    this.provicionTramitesForm = this.formBuilder.group({
      provicionTramites: this.formBuilder.array([], this.maxTramitesValidator(5))
    });

    this.variablesLiquidacionForm = this.formBuilder.group({
      cobraHonorarios: [true],
      promedioImpuesto: [true],
      promediaSoat: [true]
    });

    this.variablesLiquidacionForm.get('cobraHonorarios')?.disable();
    this.variablesLiquidacionForm.get('cobraHonorarios')?.setValue(true);
    this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.disable();
    this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.disable();
    this.documentosValoresInicialesForm.get('simitPropietarioValor')?.disable();
    this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.disable();
  }

  // Inicialización de datos asíncronos
  private initData(): void {
    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      const userDetails$ = this.authService.getUserDetails();
      const numerosIdent$ = this.clientsService.getAllNumerosIdent();
      const placas$ = this.vehiclesService.getAllPlaca();

      forkJoin([userDetails$, numerosIdent$, placas$]).subscribe(
        ([user, clients, vehicles]) => {
          this.datosUser = user;
          this.cargo = user.cargo;
          this.allClients = clients;
          this.allVehicles = vehicles;
          this.allVehiclesInv = vehicles;
          this.configureFiltering();
          this.configureFilteringVeh();
          this.configureFilteringVehInv();
          this.loading = false;
        },
        error => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
    }
  }

  // Suscripciones a cambios en los formularios
  private subscribeToFormChanges(): void {
    const tramitesSub = this.tramitesForm.get('tramites')?.valueChanges.subscribe(() => {
      this.calcularTotal();
    });
    if (tramitesSub) this.subscriptions.push(tramitesSub);

    const provicionTramitesSub = this.provicionTramitesForm.get('provicionTramites')?.valueChanges.subscribe(() => {
      this.calcularTotal();
    });
    if (provicionTramitesSub) this.subscriptions.push(provicionTramitesSub);

    const valorCompraSub = this.formaPagoCompraForm.get('valorCompraNumero')?.valueChanges.subscribe(() => {
      this.calcularTotalCliente();
    });
    if (valorCompraSub) this.subscriptions.push(valorCompraSub);
  }

  private initFechas(): void {

    this.fechaActual2 = new Date().toISOString().substring(0, 4);
    this.anoActual = this.fechaActual2 + '-12-31';

    this.fechaActualDate = new Date(this.fechaSeleccionada || '');
    const anoActualDate = new Date(this.anoActual);

    let resta = anoActualDate.getTime() - this.fechaActualDate.getTime();
    this.diasDevolucionImpuesto = resta / (1000 * 3600 * 24);
  }

  private loadInitialData(): void {
    forkJoin({
      clientes: this.clientsService.getAllNumerosIdent(),
      vehiculos: this.vehiclesService.getAllPlaca(),
      variables: this.http.get<any[]>(`${this.apiUrl}/api/getVariable`),
      ciudades: this.http.get<any[]>(`${this.apiUrl}/api/ciudades`),
      proveedores: this.http.get<any[]>(`${this.apiUrl}/api/getSuppliers`),
      costosTramites: this.http.get<any[]>(`${this.apiUrl}/api/getCostosTramites`),
      tramitadores: this.http.get<any[]>(`${this.apiUrl}/api/getTramitadores`),
      usuarios: this.http.get<any[]>(`${this.apiUrl}/api/users`)
    }).subscribe(
      ({ clientes, vehiculos, variables, ciudades, proveedores, costosTramites, tramitadores, usuarios }) => {
        // Asignar datos a las propiedades correspondientes
        this.allClients = clientes;
        this.allVehicles = vehiculos;
        this.allVehiclesInv = vehiculos;

        this.variables = variables;
        const honorarios = this.variables.find(v => v.nombre === 'honorariosAutomagno');
        this.honorariosAutomagno = honorarios ? honorarios.valor : undefined;

        this.lugares = ciudades;
        this.lugares.push({ name: 'Pendiente' });
        this.organizarAlfabeticamente();

        this.suppliers = proveedores.filter(supplier => supplier.tipoProveedor === 'ABASTECIMIENTO');
        this.organizarAlfabeticamenteCliente();
        this.tallerProveedor = proveedores;

        this.costosTramites = costosTramites;
        this.tramitadores = tramitadores;

        this.users = usuarios;
        this.usuariosGestores = this.users.filter(user => user.role && user.role.includes('Gestor documental'));
        this.usuariosAsesor = this.users.filter(user => user.role && user.role.includes('Asesor Comercial'));

        this.configureFiltering();
        this.configureFilteringVeh();
        this.configureFilteringVehInv();

        this.loading = false;
      },
      error => {
        console.error('Error loading initial data:', error);
        this.loading = false;
      }
    );
  }

  // Suscripciones a eventos del router
  private subscribeToRouterEvents(): void {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.closeAllModals();
      }
    });
  }

  // Suscripción a cambios en el inventario
  private subscribeToInventoryChanges(): void {
    this.subscription = this.sharedData.currentInventoryId.subscribe(id => {
      if (id) this.irAlInventario(id);
    });
  }

  removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  limpiarFormArrays() {
    this.limpiarFormArray(this.tramites);
    this.limpiarFormArray(this.provicionTramites);
  }

  limpiarFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  siNitActivar() {
    const tipoIdentificacion = this.clients.tipoIdentificacion;

    if (tipoIdentificacion === 'NIT.') {
      this.ocultar = true;
    } else {
      this.ocultar = false;
    }
  }

  limpiarFormularios() {
    this.btnEsconder = false;
    this.esActualizar = false;
    this.mostrarSiguienteModal = false;
    this.mostrarSiguienteModal2 = false;
    this.clients = {
      fechaIngreso: this.fechaActual
    };
    this.vehiculo = {};
    this.filtroBDForm.reset(
      { fechaIngreso: this.fechaActual }
    );
    this.obsFase3Form.reset();
    this.formaPagoCompraForm.reset();
    this.fichaNegocioForm.reset();
    this.formasPagoForm.reset();
    this.peritajeImprontasForm.reset();
    this.documentosTraspasoForm.reset();
    this.archivoDigitalForm.reset();
    this.documentosValoresInicialesForm.reset();
    this.deudaFinancieraForm.reset();
    this.tramitesIngresoForm.reset();
    this.tramitesSalidaAutonalForm.reset();
    this.controlAccesoriosForm.reset();
    this.limpiarFormArray(this.tramites);
    this.limpiarFormArray(this.provicionTramites);
    this.limpiarFormArray(this.camposExtra);
    this.limpiarFormArray(this.camposExtrasSalida);
    this.isAutonal = false;

    // Para los campos deshabilitados, puedes restablecerlos de forma individual si es necesario
    this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.setValue('$ 0');
    this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.setValue('$ 0');
    this.documentosValoresInicialesForm.get('simitPropietarioValor')?.setValue('$ 0');
    this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.setValue('$ 0');
    this.documentosValoresInicialesForm.get('totalSoatValor')?.setValue('$ 0');

    this.formaPagoCompraForm.get('valorCompraNumero')?.setValue('$ 0');

    this.fotosCedulaPropietario = [];
    this.fotosTarjetaPropietario = [];
    this.fotosSoat = [];
    this.fotosCertificadoTradicion = [];
    this.fotosEstadoCuentaImpuesto = [];
    this.fotosSimitPropietario = [];
    this.fotosLiquidacionDeudaFinanciera = [];
    this.fotosTecnoMecanica = [];
    this.fotosManifiestoFactura = [];
    this.fotosSoatIniciales = [];
    this.fotosImpuestoAno = [];
    this.fotosOficioDesembargo = [];
    this.fotosCopiaLlave = [];
    this.fotosGato = [];
    this.fotosLlavePernos = [];
    this.fotosCopaSeguridad = [];
    this.fotosTiroArrastre = [];
    this.fotosHistorialMantenimiento = [];
    this.fotosManual = [];
    this.fotosPalomera = [];
    this.fotosTapetes = [];
    this.fotosLlantaRepuesto = [];
    this.fotosKitCarretera = [];
    this.fotosAntena = [];

    this.formasPagoForm.get('valorPago1')?.setValue('$ 0');
    this.formasPagoForm.get('valorPago2')?.setValue('$ 0');
    this.formasPagoForm.get('valorPago3')?.setValue('$ 0');
    this.formasPagoForm.get('valorPago4')?.setValue('$ 0');
    this.valorTotalCliente = '$ 0'
    this.liquidacionesForm.reset();
    this.limpiarFormArrays();

    this.generadorContratosForm.reset();

    this.valorTotalCliente = '$ 0'
  }

  calcularTotalTramitesIngreso() {
    let totalDocumentacion = 0;

    // Lista inicial de campos documentación
    const camposDocumentacion = [
      'retefuenteT',
      'garantiaMobiliaria',
      'impuestos',
      'soat',
      'revTecnoMeca',
      'comparendos',
      'documentacion',
      'manifiestoFactura',
      'semaforizacion'
    ];

    camposDocumentacion.forEach(campo => {
      const control = this.tramitesIngresoForm.get(campo);
      const valor = control?.value;

      if (control && valor !== null && valor !== undefined) {
        totalDocumentacion += this.desformatearMonedaAutonal(valor);
      }
    });

    this.camposExtra.controls.forEach(grupo => {
      const valor = grupo.get('campoExtra')?.value;
      if (valor !== null && valor !== undefined) {
        totalDocumentacion += this.desformatearMonedaAutonal(valor);
      }
    });



    const formattedTotalDocumentacion = this.formatSalary(totalDocumentacion);
    this.tramitesIngresoForm.get('total')?.setValue(formattedTotalDocumentacion);

    let valorContrato = this.desformatearMonedaAutonal(this.tramitesIngresoForm.get('valorContrato')?.value);
    let total = this.desformatearMonedaAutonal(this.tramitesIngresoForm.get('total')?.value);
    let pagoFinanciera = this.desformatearMonedaAutonal(this.tramitesIngresoForm.get('pagoFinanciera')?.value);

    let valorGirarCliente = (valorContrato - total) - pagoFinanciera;
    const formattedValorGirarCliente = this.formatSalary(valorGirarCliente);

    this.tramitesIngresoForm.get('valorGirarCliente')?.setValue(formattedValorGirarCliente);

    let valorAutomagno = this.desformatearMonedaAutonal(this.tramitesIngresoForm.get('valorAutomagno')?.value);
    this.valorOfertado = valorAutomagno;
    let comisionBruta = valorAutomagno - valorContrato - pagoFinanciera;
    const formattedComisionBruta = this.formatSalary(Math.abs(comisionBruta));

    this.tramitesSalidaAutonalForm.get('comisionBruta')?.setValue(formattedComisionBruta);

    this.calcularTotalTramitesSalida();
  }


  get camposExtra(): FormArray {
    return this.tramitesIngresoForm.get('camposExtra') as FormArray;
  }

  agregarCampoExtra() {
    this.camposExtra.push(this.formBuilder.group({
      descripcionExtra: [''],
      campoExtra: ['$ 0']
    }));

    if (this.camposExtra.length > 0) {
      this.showColumn = true;
    } else {
      this.showColumn = false;
    }
  }

  eliminarCampoExtra(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrá revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.camposExtra.removeAt(index);

        this.showColumn = this.camposExtra.length > 0;

        Swal.fire(
          'Eliminado!',
          'El campo ha sido eliminado.',
          'success'
        );
      }
    });
  }


  get camposExtrasSalida(): FormArray {
    return this.tramitesSalidaAutonalForm.get('camposExtrasSalida') as FormArray;
  }

  agregarCampoExtraSalida() {
    this.camposExtrasSalida.push(this.formBuilder.group({
      descripcionExtra: [''],
      campoExtra: ['$ 0'],
      asumeExtra: [false],
      provExtra: [false]
    }));
  }

  eliminarCampoExtraSalida(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrá revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.camposExtrasSalida.removeAt(index);

        Swal.fire(
          'Eliminado!',
          'El campo ha sido eliminado.',
          'success'
        );
      }
    });
  }

  calcularTotalTramitesSalida() {
    let totalDocumentacion = 0;
    let totalAsumidoProveedor = 0;

    const camposDocumentacion = [
      'traspaso',
      'servicioFueraBogota',
      'retefuenteS',
      'levantaPrenda',
      'garantiaMobiliaria',
      'impuestos',
      'liquidacionImpuesto',
      'derechosMunicipales',
      'soat',
      'revTecnoMeca',
      'comparendos',
      'documentosIniciales',
      'documentacion',
      'manifiestoFactura',
      'ctci',
      'semaforizacion',
      'impuestoAnoActual']

    camposDocumentacion.forEach(campo => {
      const control = this.tramitesSalidaAutonalForm.get(campo);
      const valor = control?.value;
      const asume = this.tramitesSalidaAutonalForm.get(`check${campo.charAt(0).toUpperCase() + campo.slice(1)}`)?.value;

      if (control && valor !== null && valor !== undefined) {
        const valorNumerico = this.desformatearMonedaAutonal(valor);
        totalDocumentacion += valorNumerico;
        if (asume) {
          totalAsumidoProveedor += valorNumerico;
        }
      }
    });

    this.camposExtrasSalida.controls.forEach(grupo => {
      const valor = grupo.get('campoExtra')?.value;
      const asumeExtra = grupo.get('asumeExtra')?.value;

      if (valor !== null && valor !== undefined) {
        const valorNumerico = this.desformatearMonedaAutonal(valor);
        totalDocumentacion += valorNumerico;
        if (asumeExtra) {
          totalAsumidoProveedor += valorNumerico;
        }
      }
    });

    const formattedTotalDocumentacion = this.formatSalary(totalDocumentacion);
    this.tramitesSalidaAutonalForm.get('total')?.setValue(formattedTotalDocumentacion);

    this.ajustarComisionBruta(totalAsumidoProveedor);

    this.calcularTotalCliente();
  }

  ajustarComisionBruta(totalAsumidoProveedor: number) {
    const comisionBrutaValor = this.desformatearMonedaAutonal(this.tramitesSalidaAutonalForm.get('comisionBruta')?.value);
    const comisionNeta = comisionBrutaValor - totalAsumidoProveedor;

    this.tramitesSalidaAutonalForm.get('comisionNeta')?.setValue(this.formatSalary(comisionNeta));

    const valorGirarCliente = this.desformatearMonedaAutonal(this.tramitesIngresoForm.get('valorGirarCliente')?.value);
    const totalTramiteSalida = this.desformatearMonedaAutonal(this.tramitesSalidaAutonalForm.get('total')?.value);

    const valorNetoVehiculo = valorGirarCliente + totalTramiteSalida + comisionNeta;

    this.tramitesSalidaAutonalForm.get('valorNetoVehiculo')?.setValue(this.formatSalary(valorNetoVehiculo));
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaSeleccionada = input.value;
    //this.fechaActual = new Date().toISOString().substring(0, 10);

    console.log('Fecha seleccionada:', this.fechaSeleccionada);
    console.log('Fecha actual:', this.fechaActual || 'Campo vacío');
    this.initFechas();
    this.calcularTodo();
  }

  calcularTodo() {
    this.aplicarFunciones();
    this.obtenerValorSoatTotal();
    this.activarImpAnoEnCurso();
    this.obtenerCostoTraspaso50()
    this.calcularTotal();
    this.calcularTotalCliente();
  }

  calcularTotal() {
    let totalDocumentacion = 0;
    let totalProvision = 0;

    const camposDocumentacion = ['traspaso', 'retencion', 'otrosImpuestos', 'levantamientoPrenda', 'comparendos', 'proporcionalImpAnoCurso', 'devolucionSoat', 'honorariosAutomagno'];

    camposDocumentacion.forEach(campo => {
      const control = this.liquidacionesForm.get(campo);
      const valor = control?.value;

      if (control && valor !== null && valor !== undefined) {
        totalDocumentacion += this.desformatearMoneda(valor);
      }
    });

    const camposProvision = ['retencionFuente', 'traspasoNeto', 'impuestoAnoCurso', 'otrosImpuestosProv', 'levantamientoPrenda2', 'comparendos2', 'deudaFinanciera', 'honorariosTramitador'];
    camposProvision.forEach(campo => {
      const control = this.liquidacionesForm.get(campo);
      const valor = control?.value;

      if (control && valor !== null && valor !== undefined) {
        totalProvision += this.desformatearMoneda(valor);
      }
    });

    if (this.tramitesForm.get('tramites')) {
      this.tramitesForm.get('tramites')?.value.forEach((tramite: any) => {
        const valor = this.desformatearMoneda(tramite.valor);
        if (!isNaN(valor)) {
          totalDocumentacion += valor;
        }
      });
    }

    if (this.provicionTramitesForm.get('provicionTramites')) {
      this.provicionTramitesForm.get('provicionTramites')?.value.forEach((provicionTramite: any) => {
        const valor = this.desformatearMoneda(provicionTramite.valor2);
        if (!isNaN(valor)) {
          totalProvision += valor;
        }
      });
    }

    const formattedTotalDocumentacion = this.formatSalary(totalDocumentacion);
    const formattedTotalProvision = this.formatSalary(totalProvision);

    this.liquidacionesForm.get('totalDocumentacion')?.setValue(formattedTotalDocumentacion);
    this.liquidacionesForm.get('totalProvision')?.setValue(formattedTotalProvision);

    this.calcularTotalCliente();
  }



  unformatCurrency(value: string): number {
    const numericValue = value.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.');
    return numericValue ? parseFloat(numericValue) : 0;
  }

  onCurrencyInput2(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = this.unformatCurrency(inputElement.value);
    if (!isNaN(inputValue)) {
      const formattedValue = this.currencyService.formatCurrency(inputValue);
      inputElement.value = formattedValue;
    } else {
      inputElement.value = '';
    }
  }


  calcularTotalCliente() {
    const esAutonal = this.filtroBDForm.get('proveedor')?.value;
    const deudaFinanciera = this.desformatearMoneda(this.liquidacionesForm.get('deudaFinanciera')?.value || '$0');

    if (esAutonal !== 'AUTONAL') {
      const valorVehiculoNumerico = this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value);
      const valorDocumentacion = this.desformatearMoneda(this.liquidacionesForm.get('totalDocumentacion')?.value);
      const valorPago1 = this.desformatearMoneda(this.formasPagoForm.get('valorPago1')?.value || '$0');
      const valorPago2 = this.desformatearMoneda(this.formasPagoForm.get('valorPago2')?.value || '$0');
      const valorPago3 = this.desformatearMoneda(this.formasPagoForm.get('valorPago3')?.value || '$0');

      let totalNegocio = valorVehiculoNumerico + valorDocumentacion;
      let totalFormaPago = totalNegocio;

      // Resta deudaFinanciera si es mayor que 0
      if (deudaFinanciera > 0) {
        totalNegocio -= deudaFinanciera;
      }

      const valorRestante = totalFormaPago - valorPago1 - valorPago2 - valorPago3;

      this.valorTotalCliente = this.formatSalary(totalNegocio);
      this.valorTotalClienteTwo = this.formatSalary(totalFormaPago);

      const valorPago4Actual = this.desformatearMoneda(this.formasPagoForm.get('valorPago4')?.value || '$0');
      if (valorPago4Actual !== valorRestante) {
        this.formasPagoForm.get('valorPago4')?.setValue(this.formatSalary(valorRestante));
      }
    } else {
      const valorNetoVehiculo = this.desformatearMonedaAutonal(this.tramitesSalidaAutonalForm.get('valorNetoVehiculo')?.value);

      const valorPago1 = this.desformatearMonedaAutonal(this.formasPagoForm.get('valorPago1')?.value || '$0');
      const valorPago2 = this.desformatearMonedaAutonal(this.formasPagoForm.get('valorPago2')?.value || '$0');
      const valorPago3 = this.desformatearMonedaAutonal(this.formasPagoForm.get('valorPago3')?.value || '$0');

      let totalNegocio = valorNetoVehiculo;
      let totalFormaPago = totalNegocio;

      // Resta deudaFinanciera si es mayor que 0
      if (deudaFinanciera > 0) {
        totalNegocio -= deudaFinanciera;
      }

      const valorRestante = totalFormaPago - valorPago1 - valorPago2 - valorPago3;

      this.valorTotalCliente = this.formatSalary(totalNegocio);
      this.valorTotalClienteTwo = this.formatSalary(totalFormaPago);

      const valorPago4Actual = this.desformatearMonedaAutonal(this.formasPagoForm.get('valorPago4')?.value || '$0');
      if (valorPago4Actual !== valorRestante) {
        this.formasPagoForm.get('valorPago4')?.setValue(this.formatSalary(valorRestante));
      }
    }
  }

  convertirAValorNumerico(valor: string): number {
    if (!valor) {
      return 0;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d-]/g, ''));
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  /*  private suscribirACambios(campo: string) {
      const control = this.liquidacionesForm.get(campo);
  
      if (control) {
        const sub = control.valueChanges.subscribe(() => {
          this.calcularTotal();
        });
  
        if (sub) {
          this.subscriptions.push(sub);
        }
      }
    }*/

  private suscribirACambiosAutonal(campo: string) {
    const control = this.tramitesIngresoForm.get(campo);

    if (control) {
      const sub = control.valueChanges.subscribe(() => {
        this.calcularTotalTramitesIngreso();
      });

      if (sub) {
        this.subscriptions.push(sub);
      }
    }
  }

  private suscribirACambiosAutonalSalida(campo: string) {
    const control = this.tramitesSalidaAutonalForm.get(campo);

    if (control) {
      const sub = control.valueChanges.subscribe(() => {
        this.calcularTotalTramitesSalida();
      });

      if (sub) {
        this.subscriptions.push(sub);
      }
    }
  }

  closeAllModals(): void {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      const instance = bootstrap.Modal.getInstance(modal);
      if (instance) {
        instance.hide();
      }
    });
    this.removeModalBackdrop();
  }

  buscarInventarioPlaca() {
    const placa = this.vehiculoInvControl.value;
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/inventarios/${placa}`).subscribe(
      data => {
        this.inventarios = data.map(inventario => {
          const fechaCreacion = new Date(inventario.createdAt);
          const day = fechaCreacion.getDate();
          const monthIndex = fechaCreacion.getMonth();
          const year = fechaCreacion.getFullYear();
          const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

          return {
            inventoryId: inventario.inventoryId,
            createdAt: formattedDate,
            primerNombreCliente: inventario.primerNombreCliente,
            primerApellidoCliente: inventario.primerApellidoCliente,
            numeroIdentificacionCliente: inventario.numeroIdentificacionCliente
          };
        }).sort((a: any, b: any) => b.inventoryId - a.inventoryId);
      },
      error => {
        Swal.fire({
          icon: "error",
          title: "No encontrado",
          text: "El vehículo no existe",
        });
        this.inventarios = [];
      }
    );
  }

  async createInventory() {
    if (this.isCreating) {
      return;
    }

    this.isCreating = true;

    // Obtención de valores y desformateo de moneda
    const otrosTramitesAccesorios = this.convertirArrayAObjeto(this.tramitesForm.get('tramites') as FormArray);
    const otrosTramitesVendedor = this.convertirArrayAObjeto2(this.provicionTramitesForm.get('provicionTramites') as FormArray);
    const valorCompraNumerico = this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value);
    const estadoCuentaImpuestoValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.value);
    const simitPropietarioValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('simitPropietarioValor')?.value);
    const liquidacionDeudaFinValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.value);
    const totalSoatValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('totalSoatValor')?.value);
    const impAnoEnCursoValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value);
    const valorRetencionValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('valorRetencionValor')?.value);
    const valorPago1 = this.desformatearMoneda(this.formasPagoForm.get('valorPago1')?.value);
    const valorPago2 = this.desformatearMoneda(this.formasPagoForm.get('valorPago2')?.value);
    const valorPago3 = this.desformatearMoneda(this.formasPagoForm.get('valorPago3')?.value);
    const valorPago4 = this.desformatearMoneda(this.formasPagoForm.get('valorPago4')?.value);

    const clausulaPenalNumeros = this.clausulaPenal;

    const valorAutomagno = this.desformatearMoneda(this.tramitesIngresoForm.get('valorAutomagno')?.value);
    const valorContrato = this.desformatearMoneda(this.tramitesIngresoForm.get('valorContrato')?.value);
    const pagoFinanciera = this.desformatearMoneda(this.tramitesIngresoForm.get('pagoFinanciera')?.value);
    const retefuenteT = this.desformatearMoneda(this.tramitesIngresoForm.get('retefuenteT')?.value);
    const garantiaMobiliaria = this.desformatearMoneda(this.tramitesIngresoForm.get('garantiaMobiliaria')?.value);
    const impuestos = this.desformatearMoneda(this.tramitesIngresoForm.get('impuestos')?.value);
    const soat = this.desformatearMoneda(this.tramitesIngresoForm.get('soat')?.value);
    const revTecnoMeca = this.desformatearMoneda(this.tramitesIngresoForm.get('revTecnoMeca')?.value);
    const comparendos = this.desformatearMoneda(this.tramitesIngresoForm.get('comparendos')?.value);
    const documentacion = this.desformatearMoneda(this.tramitesIngresoForm.get('documentacion')?.value);
    const manifiestoFactura = this.desformatearMoneda(this.tramitesIngresoForm.get('manifiestoFactura')?.value);
    const semaforizacion = this.desformatearMoneda(this.tramitesIngresoForm.get('semaforizacion')?.value);
    const total = this.desformatearMoneda(this.tramitesIngresoForm.get('total')?.getRawValue());
    const valorGirarCliente = this.desformatearMoneda(this.tramitesIngresoForm.get('valorGirarCliente')?.getRawValue());

    const traspaso2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('traspaso')?.value);
    const servicioFueraBogota2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('servicioFueraBogota')?.value);
    const retefuenteS2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('retefuenteS')?.value);
    const levantaPrenda2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('levantaPrenda')?.value);
    const garantiaMobiliaria2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('garantiaMobiliaria')?.value);
    const impuestos2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('impuestos')?.value);
    const liquidacionImpuesto2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('liquidacionImpuesto')?.value);
    const derechosMunicipales2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('derechosMunicipales')?.value);
    const soat2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('soat')?.value);
    const revTecnoMeca2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('revTecnoMeca')?.value);
    const comparendos2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('comparendos')?.value);
    const documentosIniciales2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('documentosIniciales')?.value);
    const documentacion2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('documentacion')?.value);
    const manifiestoFactura2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('manifiestoFactura')?.value);
    const ctci2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('ctci')?.value);
    const semaforizacion2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('semaforizacion')?.value);
    const impuestoAnoActual2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('impuestoAnoActual')?.value);
    const total2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('total')?.getRawValue());
    const comisionBruta2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('comisionBruta')?.getRawValue());
    const comisionNeta2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('comisionNeta')?.getRawValue());
    const valorNetoVehiculo2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('valorNetoVehiculo')?.getRawValue());

    const camposExtra = this.convertirArrayAObjetoEntrada(this.tramitesIngresoForm.get('camposExtra') as FormArray);
    const camposExtrasSalida = this.convertirArrayAObjetoSalida(this.tramitesSalidaAutonalForm.get('camposExtrasSalida') as FormArray);

    const inventoryData = {
      cliente: this.clients._id,
      vehiculo: this.vehiculo._id,
      filtroBaseDatos: this.filtroBDForm.value,
      peritajeProveedor: this.peritajeImprontasForm.value,
      documentosTraspasos: this.documentosTraspasoForm.value,
      link: this.archivoDigitalForm.value.link,
      observacionGlobal: this.observacionGlobal,
      documentosValoresIniciales: {
        ...this.documentosValoresInicialesForm.getRawValue(),
        estadoCuentaImpuestoValor: estadoCuentaImpuestoValor,
        simitPropietarioValor: simitPropietarioValor,
        liquidacionDeudaFinValor: liquidacionDeudaFinValor,
        totalSoatValor: totalSoatValor,
        impAnoEnCursoValor: impAnoEnCursoValor,
        valorRetencionValor: valorRetencionValor
      },
      obsFase3: this.obsFase3Form.value.obsFase3,
      controlAccesorios: this.controlAccesoriosForm.getRawValue(),
      fichaNegocio: this.fichaNegocioForm.getRawValue(),
      deudaFinanciera: this.deudaFinancieraForm.value,
      liquidaciones: this.liquidacionesForm.getRawValue(),
      otrosTramitesAccesorios,
      otrosTramitesVendedor,
      variablesLiquidacion: this.variablesLiquidacionForm.value,
      tramitesIngreso: {
        valorAutomagno: valorAutomagno,
        valorContrato: valorContrato,
        pagoFinanciera: pagoFinanciera,
        retefuenteT: retefuenteT,
        garantiaMobiliaria: garantiaMobiliaria,
        impuestos: impuestos,
        soat: soat,
        revTecnoMeca: revTecnoMeca,
        comparendos: comparendos,
        documentacion: documentacion,
        manifiestoFactura: manifiestoFactura,
        semaforizacion: semaforizacion,
        total: total,
        valorGirarCliente: valorGirarCliente,
        camposExtra
      },
      tramitesSalidaAutonal: {
        ...this.tramitesSalidaAutonalForm.getRawValue(),
        traspaso: traspaso2,
        servicioFueraBogota: servicioFueraBogota2,
        retefuenteS: retefuenteS2,
        levantaPrenda: levantaPrenda2,
        garantiaMobiliaria: garantiaMobiliaria2,
        impuestos: impuestos2,
        liquidacionImpuesto: liquidacionImpuesto2,
        derechosMunicipales: derechosMunicipales2,
        soat: soat2,
        revTecnoMeca: revTecnoMeca2,
        comparendos: comparendos2,
        documentosIniciales: documentosIniciales2,
        documentacion: documentacion2,
        manifiestoFactura: manifiestoFactura2,
        ctci: ctci2,
        semaforizacion: semaforizacion2,
        impuestoAnoActual: impuestoAnoActual2,
        total: total2,
        comisionBruta: comisionBruta2,
        comisionNeta: comisionNeta2,
        valorNetoVehiculo: valorNetoVehiculo2,
        camposExtrasSalida
      },
      formaPagoCompra: {
        ...this.formaPagoCompraForm.getRawValue(),
        clausulaPenalNumeros: clausulaPenalNumeros,
        clausulaPenalLetras: this.letrasValueClausula,
        valorCompraNumero: valorCompraNumerico,
      },
      formadePago: {
        ...this.formasPagoForm.getRawValue(),
        valorPago1: valorPago1,
        valorPago2: valorPago2,
        valorPago3: valorPago3,
        valorPago4: valorPago4
      },
      generadorContratos: this.generadorContratosForm.getRawValue()
    };

    // Validar formularios antes de enviar
    const formsToValidate = [
      { form: this.filtroBDForm, modal: '#staticBackdrop3', label: 'Filtro Base de Datos' },
      { form: this.formaPagoCompraForm, modal: '#staticBackdrop5', label: 'Forma de pago compra Fase 1' },
      { form: this.controlAccesoriosForm, modal: '#staticBackdrop12', label: 'Control de Accesorios' },
      { form: this.documentosTraspasoForm, modal: '#staticBackdrop7', label: 'Documentos Traspaso' },
      { form: this.archivoDigitalForm, modal: '#staticBackdrop8', label: 'Link Archivo Digital' },
      { form: this.generadorContratosForm, modal: '#staticBackdrop16', label: 'Información para generador de contrato' },
      { form: this.obsFase3Form, modal: '#staticBackdrop18', label: 'Observaciones Fase 3' }
    ];

    let allFormsValid = true;
    let messageHtml = `<p>Algunos campos requeridos no se han completado. Revisa las siguientes secciones:</p><ul class="text-start">`;

    formsToValidate.forEach(({ form, modal, label }) => {
      if (form.invalid) {
        form.markAllAsTouched();
        allFormsValid = false;
        messageHtml += `<li class="text-danger" style="cursor: pointer;" data-bs-target="${modal}" data-bs-toggle="modal">${label}</li>`;
        this.isCreating = false;
      }
    });

    messageHtml += `</ul>`;

    if (!allFormsValid) {
      Swal.fire({
        title: "<strong>Campos Requeridos Faltantes</strong>",
        icon: "error",
        html: messageHtml
      });
      this.isCreating = false;

      return;
    }

    try {
      const response: any = await this.http.post(`${this.apiUrl}/api/postInventories`, inventoryData).toPromise();

      // Guardar datos del inventario creado
      this.inventoryId = response._id;
      this.noInventario = response.inventoryId;
      this.esActualizar = true;
      this.btnEsconder = true;

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Inventario creado correctamente",
        showConfirmButton: false,
        timer: 1500
      });

      // Cerrar modales y abrir Fase 4 (Generador de documentos)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const openModals = document.querySelectorAll('.modal.show');
      openModals.forEach((m: any) => {
        const instance = (window as any).bootstrap?.Modal?.getInstance(m);
        if (instance) instance.hide();
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      const fase4El = document.getElementById('staticBackdrop19');
      if (fase4El) {
        const fase4Modal = new (window as any).bootstrap.Modal(fase4El);
        fase4Modal.show();
      }
    } catch (error) {
      console.error("Error creating inventory:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un error al crear el inventario. Por favor, intenta nuevamente.",
        icon: "error",
        confirmButtonText: "Ok"
      });
    } finally {
      this.isCreating = false;
    }
  }

  updateInventory(inventoryId: string) {
    const vehiculoId = this.vehiculo._id;
    const body = { inventoryId };

    this.http.put(`${this.apiUrl}/api/agregarInventario/${vehiculoId}`, body)
      .subscribe(
        response => {
        },
        error => {
        }
      );
  }

  obtenerFechaTecnoMecanicaVehiculo() {
    let fechaMatricula = this.vehiculo.fechaMatricula;

    if (fechaMatricula) {
      let fechaMatriculaDate = new Date(fechaMatricula);
      let currentDate = new Date();
      let currentYear = currentDate.getFullYear();
      let fiveYearsAgo = currentYear - 5;

      let matriculaPlusFiveYears = fechaMatriculaDate.getFullYear() + 5;

      if (matriculaPlusFiveYears >= fiveYearsAgo && matriculaPlusFiveYears <= currentYear) {
        fechaMatriculaDate.setFullYear(fechaMatriculaDate.getFullYear() + 5);
      } else if (matriculaPlusFiveYears > currentYear) {
        fechaMatriculaDate.setFullYear(fechaMatriculaDate.getFullYear() + 5);
      } else {
        fechaMatriculaDate.setFullYear(currentYear);

        if (currentDate > new Date(currentYear, fechaMatriculaDate.getMonth(), fechaMatriculaDate.getDate())) {
          fechaMatriculaDate.setFullYear(currentYear + 1);
        }
      }

      let fechaTecnoMecanica = fechaMatriculaDate.toISOString().substring(0, 10);

      this.generadorContratosForm.get('fechaTecnicoMecanica')?.setValue(fechaTecnoMecanica);
    }
  }

  convertirArrayAObjeto(formArray: FormArray): any {
    return formArray.controls.map(control => {
      const formGroup = control as FormGroup;
      const valor = this.desformatearMoneda(formGroup.get('valor')?.value);
      return {
        descripcion: formGroup.get('descripcion')?.value,
        valor: valor
      };
    });
  }

  convertirArrayAObjetoEntrada(formArray: FormArray): any {
    return formArray.controls.map(control => {
      const formGroup = control as FormGroup;
      const campoExtra = this.desformatearMoneda(formGroup.get('campoExtra')?.value);
      return {
        descripcionExtra: formGroup.get('descripcionExtra')?.value,
        campoExtra: campoExtra
      };
    });
  }

  convertirArrayAObjetoSalida(formArray: FormArray): any {
    return formArray.controls.map(control => {
      const formGroup = control as FormGroup;
      const campoExtra = this.desformatearMoneda(formGroup.get('campoExtra')?.value);
      return {
        descripcionExtra: formGroup.get('descripcionExtra')?.value,
        campoExtra: campoExtra,
        asumeExtra: formGroup.get('asumeExtra')?.value,
        provExtra: formGroup.get('provExtra')?.value,
      };
    });
  }

  convertirArrayAObjeto2(formArray: FormArray): any {
    return formArray.controls.map(control => {
      const formGroup = control as FormGroup;
      const valor = this.desformatearMoneda(formGroup.get('valor2')?.value);
      return {
        descripcion2: formGroup.get('descripcion2')?.value,
        valor2: valor
      };
    });
  }

  obtenerCostoTraspaso50() {
    const ciudadPlaca = this.vehiculo.ciudadPlaca;
    let costoTraspaso100;
    const costoProvisional = this.costosTramites.find((costo: any) => costo.ciudad === 'Provisional').traspaso100;

    const costoEncontrado = this.costosTramites.find((costo: any) => costo.ciudad === ciudadPlaca);
    if (costoEncontrado) {
      costoTraspaso100 = costoEncontrado.traspaso100;
    } else {
      costoTraspaso100 = costoProvisional;
    }

    this.traspaso50 = 0 - (costoTraspaso100 / 2);
    this.traspasoNeto = (costoTraspaso100 / 2);
    const valorFormateadoTraspaso = this.formatSalary(this.traspaso50);
    const valorFormateadoTraspasoNeto = this.formatSalary(this.traspasoNeto);
    this.liquidacionesForm.controls['traspaso'].setValue(valorFormateadoTraspaso);
    this.liquidacionesForm.controls['traspasoNeto'].setValue(valorFormateadoTraspasoNeto);

    this.calcularTotal();
  }

  obtenerHonorariosTramitador() {
    const ciudadPlaca = this.vehiculo.ciudadPlaca;
    let honorariosTramitado;
    const honorariosTramitadorProvisional = this.costosTramites.find((costo: any) => costo.ciudad === 'Provisional').honorariosTramitado;

    const honorariosTramitadorEncontrado = this.costosTramites.find((costo: any) => costo.ciudad === ciudadPlaca);
    if (honorariosTramitadorEncontrado) {
      honorariosTramitado = honorariosTramitadorEncontrado.honorariosTramitado;
    } else {
      honorariosTramitado = honorariosTramitadorProvisional;
    }

    this.liquidacionesForm.get('honorariosTramitador')?.setValue(this.formatSalary(honorariosTramitado));
  }

  obtenerLevantamientoPrenda() {
    const liquidacionDeudaFin = this.documentosValoresInicialesForm.get('liquidacionDeudaFin')?.value;
    let levantamientoPrenda = 0;

    if (liquidacionDeudaFin === 'CON PRENDA') {
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.enable();
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.setValue(this.formatSalary(0));
      const ciudadPlaca = this.documentosValoresInicialesForm.get('ciudadPlaca')?.value;
      const costoProvisional = this.costosTramites.find((costo: any) => costo.ciudad === 'Provisional')?.levantamientoPrenda || 0;

      const costoEncontrado = this.costosTramites.find((costo: any) => costo.ciudad === ciudadPlaca)?.levantamientoPrenda;
      if (costoEncontrado !== undefined) {
        levantamientoPrenda = 0 - costoEncontrado;
      } else {
        levantamientoPrenda = 0 - costoProvisional;
      }
    } else if (liquidacionDeudaFin === 'SIN PRENDA') {
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.disable();
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.setValue(this.formatSalary(0));
      this.liquidacionesForm.get('deudaFinanciera')?.setValue('$ 0');
    }

    const valorFormateado = this.formatSalary(levantamientoPrenda);
    const valorFormateado2 = this.formatSalary(Math.abs(this.desformatearMoneda(valorFormateado)));
    this.liquidacionesForm.controls['levantamientoPrenda'].setValue(valorFormateado);
    this.liquidacionesForm.controls['levantamientoPrenda2'].setValue(valorFormateado2);
  }

  obtenerLevantamientoPrenda2() {
    const esDeuda = this.documentosValoresInicialesForm.get('liquidacionDeudaFin')?.value;
    if (esDeuda !== 'SIN PRENDA') {
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.enable();
      const liquidacionDeudaFinValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.value);
      this.liquidacionesForm.controls['deudaFinanciera'].setValue(this.formatSalary(liquidacionDeudaFinValor));
    } else {
      this.liquidacionesForm.get('deudaFinanciera')?.setValue('$ 0');
    }
  }

  obtenerEstadoCuentaImpuestos() {
    const cuentaImpuestos = this.documentosValoresInicialesForm.get('estadoCuentaImpuesto')?.value;

    if (cuentaImpuestos === 'REVISADO CON DEUDA') {
      this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.enable();
    } else if (cuentaImpuestos === 'REVISADO SIN DEUDA') {
      this.liquidacionesForm.controls['otrosImpuestos'].setValue(this.formatSalary(0));
      this.liquidacionesForm.controls['otrosImpuestosProv'].setValue(this.formatSalary(0));
      this.documentosValoresInicialesForm.controls['estadoCuentaImpuestoValor'].setValue(this.formatSalary(0));
      this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.disable();
      this.calcularTotal();
      this.calcularTotalCliente();
    } else {
      this.liquidacionesForm.controls['otrosImpuestos'].setValue(this.formatSalary(0));
      this.liquidacionesForm.controls['otrosImpuestosProv'].setValue(this.formatSalary(0));
      this.documentosValoresInicialesForm.controls['estadoCuentaImpuestoValor'].setValue(this.formatSalary(0));
      this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.disable();
      this.calcularTotal();
      this.calcularTotalCliente();
    }
  }

  obtenerValorEstadoCuentaImpuestos() {
    const cuentaImpuestos = this.documentosValoresInicialesForm.get('estadoCuentaImpuesto')?.value;

    if (cuentaImpuestos === 'REVISADO CON DEUDA') {
      const tieneImpuestos = this.desformatearMoneda(this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.value);
      let resta = 0 - tieneImpuestos;
      const valorFormateado = this.formatSalary(resta);

      const valorFormateadoProv = this.formatSalary(tieneImpuestos);
      this.liquidacionesForm.controls['otrosImpuestos'].setValue(valorFormateado);
      this.liquidacionesForm.controls['otrosImpuestosProv'].setValue(valorFormateadoProv);
      this.calcularTotal();
      this.calcularTotalCliente();
    }
  }


  obtenerValorImpAnoEnCurso() {
    const valorImpAnoEnCurso = this.documentosValoresInicialesForm.get('estadoImpAnoEnCurso')?.value;
    if (valorImpAnoEnCurso === 'PARA PAGO') {
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.enable();
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.setValue(this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value);
      this.liquidacionesForm.get('proporcionalImpAnoCurso')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.enable();
    } else if (valorImpAnoEnCurso === 'CON PAGO') {
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.enable();
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.setValue(this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value);
      this.liquidacionesForm.controls['impuestoAnoCurso'].setValue('$ 0');
      this.liquidacionesForm.get('proporcionalImpAnoCurso')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.enable();
      this.calcularTotal();
      this.calcularTotalCliente();
    } else if (valorImpAnoEnCurso === 'PROVISIONAL') {
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.enable();
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.setValue('$ 0');
      this.liquidacionesForm.controls['impuestoAnoCurso'].setValue('$ 0');
      this.liquidacionesForm.get('proporcionalImpAnoCurso')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.enable();
      this.calcularTotal();
      this.calcularTotalCliente();
    } else {
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.disable();
      this.liquidacionesForm.controls['impuestoAnoCurso'].setValue('$ 0');
      this.liquidacionesForm.get('proporcionalImpAnoCurso')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.disable();
      this.calcularTotal();
      this.calcularTotalCliente();
    }
  }

  obtenerEstadoValorRetencion() {
    const estadoValorRetencion = this.documentosValoresInicialesForm.get('estadoValorRetencion')?.value;

    if (estadoValorRetencion === 'POR LIQUIDAR') {
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.disable();
    } else {
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.setValue('$ 0');
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.enable();
    }
  }

  esAutonal() {
    const esAutonal = this.filtroBDForm.get('proveedor')?.value;

    if (esAutonal === 'AUTONAL') {
      this.isAutonal = true;
    } else {
      this.isAutonal = false;
    }

    this.obtenerHonorariosIvaIncluido();
  }

  activarImpAnoEnCurso() {
    const isActived = this.variablesLiquidacionForm.get('promedioImpuesto')?.value;
    const esAutonal = this.filtroBDForm.get('proveedor')?.value === "AUTONAL";
    const cliente = this.clients.primerNombre === "AUTOMAGNO";
    this.obtenerHonorariosIvaIncluido();

    if ((esAutonal && cliente) || (!esAutonal)) {
      if (isActived) {
        const valorImpAnoEnCurso = this.documentosValoresInicialesForm.get('estadoImpAnoEnCurso')?.value;
        const mes = new Date().toISOString().substring(5, 7);
        if (mes === "12" || mes === "01") {
          const valorImp = this.desformatearMoneda(this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value);
          const valorFormateado = this.formatSalary(valorImp);
          this.liquidacionesForm.controls['proporcionalImpAnoCurso'].setValue(valorFormateado);
          this.liquidacionesForm.controls['impuestoAnoCurso'].setValue(valorFormateado);
        } else {
          if (valorImpAnoEnCurso === 'CON PAGO') {
            const valorImp = this.desformatearMoneda(this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value);
            let formula = ((valorImp / 365) * (this.diasDevolucionImpuesto));
            const valorFormateado = this.formatSalary(formula);
            this.liquidacionesForm.controls['proporcionalImpAnoCurso'].setValue(valorFormateado);
            this.liquidacionesForm.controls['impuestoAnoCurso'].setValue(this.formatSalary(0));
          } else if (valorImpAnoEnCurso === 'PARA PAGO') {
            const valorImp = this.desformatearMoneda(this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value);
            let formula = 0 - (valorImp / 365) * (365 - this.diasDevolucionImpuesto);
            const valorFormateado = this.formatSalary(formula);
            this.liquidacionesForm.controls['proporcionalImpAnoCurso'].setValue(valorFormateado);
            this.liquidacionesForm.controls['impuestoAnoCurso'].setValue(this.formatSalary(valorImp));
          } else {
            this.liquidacionesForm.controls['proporcionalImpAnoCurso'].setValue(this.formatSalary(0));
            this.liquidacionesForm.controls['impuestoAnoCurso'].setValue(this.formatSalary(0));
          }
        }
      } else {
        this.liquidacionesForm.controls['proporcionalImpAnoCurso'].setValue(this.formatSalary(0));
        this.liquidacionesForm.controls['impuestoAnoCurso'].setValue(this.formatSalary(0));
      }
    } else {
      this.liquidacionesForm.get('proporcionalImpAnoCurso')?.setValue('$ 0');
      this.liquidacionesForm.get('impuestoAnoCurso')?.setValue('$ 0');
    }
    this.calcularTotal();
  }

  obtenerSimitPropietario() {
    const simitPropietario = this.documentosValoresInicialesForm.get('simitPropietario')?.value;

    if (simitPropietario === 'PAGAR MULTAS' || simitPropietario === 'EN TRAMITE') {
      this.documentosValoresInicialesForm.get('simitPropietarioValor')?.enable();
      const comparendos = this.desformatearMoneda(this.documentosValoresInicialesForm.get('simitPropietarioValor')?.value);
      let resta = 0 - comparendos;
      const valorFormateado = this.formatSalary(resta);
      const valorFormateadoProv = this.formatSalary(comparendos);
      this.liquidacionesForm.controls['comparendos'].setValue(valorFormateado);
      this.liquidacionesForm.controls['comparendos2'].setValue(valorFormateadoProv);
    } else {
      this.liquidacionesForm.controls['comparendos'].setValue(this.formatSalary(0));
      this.liquidacionesForm.controls['comparendos2'].setValue(this.formatSalary(0));
      this.documentosValoresInicialesForm.controls['simitPropietarioValor'].setValue(this.formatSalary(0));
      this.documentosValoresInicialesForm.get('simitPropietarioValor')?.disable();
    }
  }

  obtenerHonorariosIvaIncluido() {
    const isActived = this.variablesLiquidacionForm.get('cobraHonorarios')?.value;
    const esAutonal = this.filtroBDForm.get('proveedor')?.value === "AUTONAL";
    const cliente = this.clients.primerNombre === "AUTOMAGNO";
    if ((esAutonal && cliente) || (!esAutonal)) {
      if (isActived) {
        let valorNumerico = Number(this.honorariosAutomagno);
        let valorConIva = -valorNumerico - (valorNumerico * 0.19);
        const valorFormateado = this.formatSalary(valorConIva);
        this.liquidacionesForm.controls['honorariosAutomagno'].setValue(valorFormateado);
      } else {
        this.liquidacionesForm.controls['honorariosAutomagno'].setValue(this.formatSalary(0));
      }
    } else {
      this.liquidacionesForm.get('honorariosAutomagno')?.setValue('$ 0');
    }
  }

  obtenerValorSoatTotal() {
    const isActived = this.variablesLiquidacionForm.get('promediaSoat')?.value;
    const esAutonal = this.filtroBDForm.get('proveedor')?.value === "AUTONAL";
    const cliente = this.clients.primerNombre === "AUTOMAGNO";

    if ((esAutonal && cliente) || (!esAutonal)) {
      if (isActived) {
        const vencimientoSoatDate = new Date(this.documentosValoresInicialesForm.get('fechaFinSoat')?.value);
        const valorSoatTotal = this.desformatearMoneda(this.documentosValoresInicialesForm.get('totalSoatValor')?.value);
        let resta = vencimientoSoatDate.getTime() - this.fechaActualDate.getTime();
        let diferenciaDias = resta / (1000 * 3600 * 24);

        let nuevoValor = ((valorSoatTotal / 365) * (diferenciaDias + 1));
        let valorRedondeado = Math.round(nuevoValor);

        const valorFormateado = this.formatSalary(valorRedondeado);
        this.liquidacionesForm.controls['devolucionSoat'].setValue(valorFormateado);

        const estado = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;
        if (estado === 'VENCIDO COMPRAR') {
          Swal.fire({
            icon: "warning",
            title: "RECORDATORIO",
            text: "Estado del SOAT Vencido, recuerda que es prioridad que esté vigente.",
          });
          this.liquidacionesForm.controls['soat'].setValue(valorFormateado);
        } else if (estado === 'VIGENTE') {
          this.liquidacionesForm.controls['soat'].setValue(this.formatSalary(0));
        }

      } else {
        this.liquidacionesForm.controls['devolucionSoat'].setValue(this.formatSalary(0));
        this.liquidacionesForm.controls['soat'].setValue(this.formatSalary(0));
      }
    } else {
      this.liquidacionesForm.get('devolucionSoat')?.setValue('$ 0');
    }
  }

  obtenerEstadoSoat() {
    const estado = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;
    this.documentosValoresInicialesForm.get('totalSoatValor')?.setValue('$ 0');
    if (estado === 'VENCIDO COMPRAR') {
      Swal.fire({
        icon: "warning",
        title: "RECORDATORIO",
        text: "Estado del SOAT Vencido, recuerda que es prioridad que esté vigente.",
      });
      this.liquidacionesForm.controls['soat'].setValue('VENCIDO');
    } else if (estado === 'VIGENTE') {
      this.liquidacionesForm.controls['soat'].setValue('SOAT VIGENTE');
    }
  }

  aplicarRetencionSiNoEsNIT() {
    const tipoIdentificacion = this.clients?.tipoIdentificacion;
    let valorRetencion;
    let valorRetencionFuente;

    const esAutonal = this.filtroBDForm.get('proveedor')?.value === "AUTONAL";
    const cliente = this.clients.primerNombre === "AUTOMAGNO";

    if (!esAutonal) {
      if (tipoIdentificacion === 'NIT.') {
        valorRetencion = "$ 0";
        valorRetencionFuente = "$ 0";
        this.liquidacionesForm.controls['retencion'].setValue(valorRetencion);
        this.liquidacionesForm.controls['retencionFuente'].setValue(valorRetencionFuente);
      } else {
        valorRetencion = 0 - this.desformatearMoneda(this.documentosValoresInicialesForm.get('valorRetencionValor')?.value);
        valorRetencionFuente = this.desformatearMoneda(this.documentosValoresInicialesForm.get('valorRetencionValor')?.value);
        const valorFormateado = this.formatSalary(valorRetencion);
        const valorFormateadoFuente = this.formatSalary(valorRetencionFuente);
        this.liquidacionesForm.controls['retencion'].setValue(valorFormateado);
        this.liquidacionesForm.controls['retencionFuente'].setValue(valorFormateadoFuente);
      }
    } else {
      this.liquidacionesForm.controls['retencion'].setValue('$ 0');
      this.liquidacionesForm.controls['retencionFuente'].setValue('$ 0');
    }
  }

  changeRetencion() {
    this.documentosValoresInicialesForm.get('valorRetencionValor')?.setValue('$ 0');
  }

  isNegative(value: string | null): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return numericValue < 0;
  }

  get tramites(): FormArray {
    return this.tramitesForm.get('tramites') as FormArray;
  }

  agregarTramite() {
    const tramiteFormGroup = this.formBuilder.group({
      descripcion: [''],
      valor: ['']
    });

    tramiteFormGroup.get('valor')?.valueChanges.subscribe(valorFormateado => {
      if (valorFormateado !== null) {
        const valorNumerico = this.desformatearMoneda(valorFormateado);
        tramiteFormGroup.get('valor')?.setValue(valorNumerico.toString(), { emitEvent: false });
      }
    });

    this.tramites.push(tramiteFormGroup);
  }

  eliminarTramite(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrá revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tramites.removeAt(index);

        Swal.fire(
          'Eliminado!',
          'El campo ha sido eliminado.',
          'success'
        );
      }
    });
  }

  get provicionTramites(): FormArray {
    return this.provicionTramitesForm.get('provicionTramites') as FormArray;
  }

  agregarProvicionTramites() {
    const provicionTramitesFormGroup = this.formBuilder.group({
      descripcion2: [''],
      valor2: ['']
    });

    provicionTramitesFormGroup.get('valor2')?.valueChanges.subscribe(valorFormateado => {
      if (valorFormateado !== null) {
        const valorNumerico = this.desformatearMoneda(valorFormateado);
        provicionTramitesFormGroup.get('valor2')?.setValue(valorNumerico.toString(), { emitEvent: false });
      }
    });

    this.provicionTramites.push(provicionTramitesFormGroup);
  }

  eliminarProvicionTramites(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: '¡No podrá revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.provicionTramites.removeAt(index);

        Swal.fire(
          'Eliminado!',
          'El campo ha sido eliminado.',
          'success'
        );
      }
    });
  }

  onSelectAsesor(event: any) {
    const selectedAsesor = event.target.value;
    const asesor = this.usuariosAsesor.find(user => user.nombre === selectedAsesor);

    if (asesor) {
      this.generadorContratosForm.patchValue({
        telefonoAsesor: asesor.telefono || '',
        correoAsesor: asesor.email || ''
      });

      this.generadorContratosForm.get('telefonoAsesor')?.disable();
      this.generadorContratosForm.get('correoAsesor')?.disable();
    }
  }

  convertirANumeros(num: number): string {
    return this.conversionService.numerosALetras(num);
  }

  onValorCompraNumeroLetrasChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorNumerico = this.desformatearMoneda(input.value);

    if (!isNaN(valorNumerico)) {
      let valorEnLetras = this.conversionService.numerosALetras(valorNumerico);

      valorEnLetras = valorEnLetras.replace(/\s+/g, " ");

      const control = this.formaPagoCompraForm.get('valorCompraLetras');
      if (control) {
        const valorFinal = (valorEnLetras).toUpperCase();
        control.setValue(valorFinal);
      }
    }

    this.valorOfertado = valorNumerico;
  }

  actualizarValor() {
    let valor = this.formaPagoCompraForm.get('valorCompraNumero')?.value;
    this.formaPagoCompraForm.patchValue({
      valorCompraNumero: valor
    });
  }

  desformatearMoneda(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();

    const valorNumerico = valorComoCadena.replace(/[^\d-]/g, '');
    return parseFloat(valorNumerico);
  }

  desformatearMonedaAutonal(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();
    const valorNumerico = valorComoCadena.replace(/[^\d-]/g, '');
    const resultado = parseFloat(valorNumerico);
    return !isNaN(resultado) ? resultado : 0;
  }

  desformatearMoneda2(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();

    const valorNumerico = valorComoCadena.replace(/[^\d.-]/g, '');
    return parseFloat(valorNumerico);
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

  calcularClausulaPenal(valor: string) {
    const valorNumerico = this.desformatearMoneda(valor);
    this.clausulaPenal = valorNumerico * 0.1;
    const clausulaPenalFormateada = this.formatSalary(this.clausulaPenal);
    this.formattedValueClausula = clausulaPenalFormateada;
    const clausulaPenalLetras = this.conversionService.numerosALetras(this.clausulaPenal);
    const valorEnLetrasA = clausulaPenalLetras.replace(/\s+/g, " ");

    this.letrasValueClausula = valorEnLetrasA.toUpperCase();
  }

  onSelectGestor(event: any) {
    const selectedGestor = event.target.value;
    const gestor = this.usuariosGestores.find(user => user.nombre === selectedGestor);

    if (gestor) {
      this.generadorContratosForm.patchValue({
        telefonoGestor: gestor.telefono || '',
        correoGestor: gestor.email || ''
      });

      this.generadorContratosForm.get('telefonoGestor')?.disable();
      this.generadorContratosForm.get('correoGestor')?.disable();
    }
  }

  funcionButton1() {
    if (this.button1) {
      this.button1 = false;
    } else {
      this.button1 = true;
    }
  }

  funcionButton2() {
    if (this.button2) {
      this.button2 = false;
    } else {
      this.button2 = true;
    }
  }

  funcionButton3() {
    if (this.button3) {
      this.button3 = false;
    } else {
      this.button3 = true;
    }
  }

  funcionButton4() {
    if (this.button4) {
      this.button4 = false;
    } else {
      this.button4 = true;
    }
  }

  funcionButton5() {
    if (this.button5) {
      this.button5 = false;
    } else {
      this.button5 = true;
    }
  }

  funcionButton6() {
    if (this.button6) {
      this.button6 = false;
    } else {
      this.button6 = true;
    }
  }

  funcionButton7() {
    if (this.button7) {
      this.button7 = false;
    } else {
      this.button7 = true;
    }
  }

  funcionButton8() {
    if (this.button8) {
      this.button8 = false;
    } else {
      this.button8 = true;
    }
  }

  funcionButton9() {
    if (this.button9) {
      this.button9 = false;
    } else {
      this.button9 = true;
    }
  }

  funcionButton10() {
    if (this.button10) {
      this.button10 = false;
    } else {
      this.button10 = true;
    }
  }

  funcionButton11() {
    if (this.button11) {
      this.button11 = false;
    } else {
      this.button11 = true;
    }
  }

  funcionButton12() {
    if (this.button12) {
      this.button12 = false;
    } else {
      this.button12 = true;
    }
  }

  funcionVer0() {
    if (this.ver0) {
      this.ver0 = false;
    } else {
      this.ver0 = true;
    }
  }

  funcionVer1() {
    if (this.ver1) {
      this.ver1 = false;
    } else {
      this.ver1 = true;
    }
  }

  funcionVer2() {
    if (this.ver2) {
      this.ver2 = false;
    } else {
      this.ver2 = true;
    }
  }

  funcionVer3() {
    if (this.ver3) {
      this.ver3 = false;
    } else {
      this.ver3 = true;
    }
  }

  funcionVer4() {
    if (this.ver4) {
      this.ver4 = false;
    } else {
      this.ver4 = true;
    }
  }

  funcionVer5() {
    if (this.ver5) {
      this.ver5 = false;
    } else {
      this.ver5 = true;
    }
  }

  funcionVer6() {
    if (this.ver6) {
      this.ver6 = false;
    } else {
      this.ver6 = true;
    }
  }

  funcionVer7() {
    if (this.ver7) {
      this.ver7 = false;
    } else {
      this.ver7 = true;
    }
  }

  funcionVer8() {
    if (this.ver8) {
      this.ver8 = false;
    } else {
      this.ver8 = true;
    }
  }

  funcionVer9() {
    if (this.ver9) {
      this.ver9 = false;
    } else {
      this.ver9 = true;
    }
  }

  funcionVer10() {
    if (this.ver10) {
      this.ver10 = false;
    } else {
      this.ver10 = true;
    }
  }

  funcionVer11() {
    if (this.ver11) {
      this.ver11 = false;
    } else {
      this.ver11 = true;
    }
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

  formatNumber(value: number): string {
    if (isNaN(value) || value === null) {
      return '-';
    }
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0
    }).format(value);
  }

  onKilometrajeInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    if (value) {
      const formattedValue = this.formatThousands(value);
      this.generadorContratosForm.get('kilometraje')?.setValue(formattedValue, { emitEvent: false });
    }
  }

  formatThousands(value: string | number): string {
    let numberValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) : value;

    if (isNaN(numberValue) || numberValue === null) {
      return '-';
    }

    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(numberValue);
  }

  actualizarValorPago1(event: Event) {
    const nuevoValor = this.convertirAValorNumerico((event.target as HTMLInputElement).value);
    this.valorPago1Actual = nuevoValor;
    this.actualizarValorPago4();
  }

  actualizarValorPago2(event: Event) {
    const nuevoValor = this.convertirAValorNumerico((event.target as HTMLInputElement).value);
    this.valorPago2Actual = nuevoValor;
    this.actualizarValorPago4();
  }

  actualizarValorPago3(event: Event) {
    const nuevoValor = this.convertirAValorNumerico((event.target as HTMLInputElement).value);
    this.valorPago3Actual = nuevoValor;
    this.actualizarValorPago4();
  }

  actualizarValoresActualesDePago() {
    this.valorPago1Actual = this.convertirAValorNumerico(this.formasPagoForm.get('valorPago1')?.value);
    this.valorPago2Actual = this.convertirAValorNumerico(this.formasPagoForm.get('valorPago2')?.value);
    this.valorPago3Actual = this.convertirAValorNumerico(this.formasPagoForm.get('valorPago3')?.value);
  }

  actualizarValorPago4() {
    const esAutonal = this.filtroBDForm.get('proveedor')?.value;

    if (esAutonal !== 'AUTONAL') {
      const valorVehiculoNumerico = this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value);
      const valorDocumentacion = this.desformatearMoneda(this.liquidacionesForm.get('totalDocumentacion')?.value);
      const totalNegocio = valorVehiculoNumerico + valorDocumentacion;

      const valorPago1 = this.convertirAValorNumerico(this.formasPagoForm.get('valorPago1')?.value);
      const valorPago2 = this.convertirAValorNumerico(this.formasPagoForm.get('valorPago2')?.value);
      const valorPago3 = this.convertirAValorNumerico(this.formasPagoForm.get('valorPago3')?.value);

      const sumaPagos = valorPago1 + valorPago2 + valorPago3;
      const nuevoValorPago4 = totalNegocio - sumaPagos;

      this.formasPagoForm.get('valorPago4')?.setValue(this.currencyService.formatCurrency(nuevoValorPago4), { emitEvent: false });
    } else {
      const valorNetoVehiculo = this.desformatearMonedaAutonal(this.tramitesSalidaAutonalForm.get('valorNetoVehiculo')?.value);

      const valorPago1 = this.desformatearMonedaAutonal(this.formasPagoForm.get('valorPago1')?.value);
      const valorPago2 = this.desformatearMonedaAutonal(this.formasPagoForm.get('valorPago2')?.value);
      const valorPago3 = this.desformatearMonedaAutonal(this.formasPagoForm.get('valorPago3')?.value);

      const sumaPagos = valorPago1 + valorPago2 + valorPago3;
      const nuevoValorPago4 = valorNetoVehiculo - sumaPagos;

      this.formasPagoForm.get('valorPago4')?.setValue(this.currencyService.formatCurrency(nuevoValorPago4), { emitEvent: false });
    }

  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  contratoMandatoRepre() {
    if (this.filtroBDForm.get('proveedor')?.value !== 'AUTONAL' && this.clients.primerNombre !== 'AUTOMAGNO') {
      const numeroInventario = this.buscarInventarioForm.get('buscarInventario')?.value;
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60000;
      const localTime = new Date(now.getTime() - localOffset);

      // Formateando la fecha de hoy
      const day = localTime.getDate();
      const monthIndex = localTime.getMonth();
      const year = localTime.getFullYear();
      const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

      // Formateando la fecha de entrega
      const fechaEntrega = this.formaPagoCompraForm.get('fechaEntrega')?.value;
      const dateObj2 = new Date(fechaEntrega);
      const day2 = dateObj2.getDate();
      const monthIndex2 = dateObj2.getMonth();
      const year2 = dateObj2.getFullYear();
      const formattedDate2 = `${day2} de ${this.monthNames[monthIndex2]} del ${year2}`;

      const valorCompraNumero = this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value);
      const formatoValorCompraNumero = this.formatSalary(valorCompraNumero);

      const clausulaPenalNumeros = this.clausulaPenal;
      const formattedClausulaPenalNumeros = this.formatSalary(clausulaPenalNumeros);

      const valorCompraLetras = this.formaPagoCompraForm.get('valorCompraLetras')?.value;

      const kilometraje = this.generadorContratosForm.get('kilometraje')?.value;
      const idFormated = this.formatNumber(this.clients.numeroIdentificacion);

      const estadoTecnicoMecanica = this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.value;
      const estadoValorTotalSoat = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;

      const dataParaDocumento = {
        organizacion: this.filtroBDForm.get('organizacion')?.value,
        numeroInventario,
        fecha: formattedDate,
        fechaEntrega: formattedDate2,
        cliente: this.clients,
        idFormated: idFormated,
        vehiculo: this.vehiculo,
        valorCompraLetras: valorCompraLetras,
        clausulaPenalLetras: this.letrasValueClausula,
        generadorContratos: this.generadorContratosForm.getRawValue(),
        valorCompraNumero: formatoValorCompraNumero,
        clausulaPenalNumeros: formattedClausulaPenalNumeros,
        kilometraje: kilometraje,


        estadoValorTotalSoat: estadoValorTotalSoat,
        estadoTecnicoMecanica: estadoTecnicoMecanica,
        copiaLlave: this.controlAccesoriosForm.get('copiaLlave')?.value,
        manual: this.controlAccesoriosForm.get('manual')?.value,
        copaSeguridad: this.controlAccesoriosForm.get('copaSeguridad')?.value,
        gato: this.controlAccesoriosForm.get('gato')?.value,
        palomera: this.controlAccesoriosForm.get('palomera')?.value,
        tapetes: this.controlAccesoriosForm.get('tapetes')?.value,
        tiroArrastre: this.controlAccesoriosForm.get('tiroArrastre')?.value,
        llantaRepuesto: this.controlAccesoriosForm.get('llantaRepuesto')?.value,
        llavePernos: this.controlAccesoriosForm.get('llavePernos')?.value,
        kitCarretera: this.controlAccesoriosForm.get('kitCarretera')?.value,
        antena: this.controlAccesoriosForm.get('antena')?.value,
        observacionesContrato: this.generadorContratosForm.get('observacionesContrato')?.value || '',
        fichaNegocio: this.fichaNegocioForm.getRawValue(),
      };

      Swal.fire({
        title: 'Generando documento',
        html: 'Espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      /*
      this.http
      .post(`${this.apiUrl}/api/contrato-compra2`, dataParaDocumento, {
        responseType: 'blob', // Indicar que la respuesta es un Blob
      })
      .subscribe((response: Blob) => {
        // Convertir el Blob a una URL
        const pdfUrl = URL.createObjectURL(response);
        const pdfUrl2 = "https://drive.google.com/file/d/1lJ7IFEQv_Ib7SxqjHbtO8qIMFUKBtV5l/view?usp=sharing";
        // Abrir el PDF en una nueva pestaña
        window.open(pdfUrl2, '_blank');
      });
      Swal.close();
      */

      this.http.post(`${this.apiUrl}/api/contrato-mandato-repre`, dataParaDocumento, { responseType: 'blob' })
        .subscribe(blob => {
          Swal.close();
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `CONTRATO DE MANDATO CON REPRESENTACIÓN ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa} [${numeroInventario}].docx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        }, error => {
          Swal.close();
        });
    } else {
      if (this.clients.primerNombre === 'AUTOMAGNO') {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "AUTOMAGNO S.A.S, ya es el propietario!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El vehículo ingresa de AUTONAL",
        });
      }
    }
  }

  procesoIniciales() {
    if (this.filtroBDForm.get('proveedor')?.value !== 'AUTONAL' && this.clients.primerNombre !== 'AUTOMAGNO') {
      const numeroInventario = this.buscarInventarioForm.get('buscarInventario')?.value;
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60000;
      const localTime = new Date(now.getTime() - localOffset);

      // Formateando la fecha de hoy
      const day = localTime.getDate();
      const monthIndex = localTime.getMonth();
      const year = localTime.getFullYear();
      const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

      // Formateando la fecha de entrega
      const fechaEntrega = this.formaPagoCompraForm.get('fechaEntrega')?.value;
      const dateObj2 = new Date(fechaEntrega);
      const day2 = dateObj2.getDate();
      const monthIndex2 = dateObj2.getMonth();
      const year2 = dateObj2.getFullYear();
      const formattedDate2 = `${day2} de ${this.monthNames[monthIndex2]} del ${year2}`;

      const valorCompraNumero = this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value);
      const formatoValorCompraNumero = this.formatSalary(valorCompraNumero);

      const clausulaPenalNumeros = this.clausulaPenal;
      const formattedClausulaPenalNumeros = this.formatSalary(clausulaPenalNumeros);

      const valorCompraLetras = this.formaPagoCompraForm.get('valorCompraLetras')?.value;

      const kilometraje = this.generadorContratosForm.get('kilometraje')?.value;
      const idFormated = this.formatNumber(this.clients.numeroIdentificacion);

      const estadoTecnicoMecanica = this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.value;
      const estadoValorTotalSoat = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;

      const dataParaDocumento = {
        organizacion: this.filtroBDForm.get('organizacion')?.value,
        numeroInventario,
        fecha: formattedDate,
        fechaEntrega: formattedDate2,
        cliente: this.clients,
        idFormated: idFormated,
        vehiculo: this.vehiculo,
        valorCompraLetras: valorCompraLetras,
        clausulaPenalLetras: this.letrasValueClausula,
        generadorContratos: this.generadorContratosForm.getRawValue(),
        valorCompraNumero: formatoValorCompraNumero,
        clausulaPenalNumeros: formattedClausulaPenalNumeros,
        kilometraje: kilometraje,


        estadoValorTotalSoat: estadoValorTotalSoat,
        estadoTecnicoMecanica: estadoTecnicoMecanica,
        copiaLlave: this.controlAccesoriosForm.get('copiaLlave')?.value,
        manual: this.controlAccesoriosForm.get('manual')?.value,
        copaSeguridad: this.controlAccesoriosForm.get('copaSeguridad')?.value,
        gato: this.controlAccesoriosForm.get('gato')?.value,
        palomera: this.controlAccesoriosForm.get('palomera')?.value,
        tapetes: this.controlAccesoriosForm.get('tapetes')?.value,
        tiroArrastre: this.controlAccesoriosForm.get('tiroArrastre')?.value,
        llantaRepuesto: this.controlAccesoriosForm.get('llantaRepuesto')?.value,
        llavePernos: this.controlAccesoriosForm.get('llavePernos')?.value,
        kitCarretera: this.controlAccesoriosForm.get('kitCarretera')?.value,
        antena: this.controlAccesoriosForm.get('antena')?.value,
      };

      Swal.fire({
        title: 'Generando documento',
        html: 'Espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      /*
      this.http
      .post(`${this.apiUrl}/api/contrato-compra2`, dataParaDocumento, {
        responseType: 'blob', // Indicar que la respuesta es un Blob
      })
      .subscribe((response: Blob) => {
        // Convertir el Blob a una URL
        const pdfUrl = URL.createObjectURL(response);
        const pdfUrl2 = "https://drive.google.com/file/d/1lJ7IFEQv_Ib7SxqjHbtO8qIMFUKBtV5l/view?usp=sharing";
        // Abrir el PDF en una nueva pestaña
        window.open(pdfUrl2, '_blank');
      });
      Swal.close();
      */

      this.http.post(`${this.apiUrl}/api/proceso-iniciales`, dataParaDocumento, { responseType: 'blob' })
        .subscribe(blob => {
          Swal.close();
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `PROCESO INICIALES - ORDEN DE ADQUISICIÓN VEHICULAR ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa} [${numeroInventario}].docx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        }, error => {
          Swal.close();
        });
    } else {
      if (this.clients.primerNombre === 'AUTOMAGNO') {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "AUTOMAGNO S.A.S, ya es el propietario!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El vehículo ingresa de AUTONAL",
        });
      }
    }
  }

  sanitizeBlob(blob: Blob) {
    // Crear una URL segura para el Blob
    return URL.createObjectURL(blob);
  }

  imprimir() {
    // Imprimir el contenido del iframe
    window.print();
  }

  esAutomagnos(beneficiario: string, idBeneficiario: string, numeroCuentaObligaPago: string, tipoCuentaPago: string, entidadDepositarPago: string) {
    const is = this.formasPagoForm.get(beneficiario)?.value;

    if (is && is.toLowerCase() === "automagno sas bcol") {
      this.formasPagoForm.get(entidadDepositarPago)?.setValue('BANCOLOMBIA');
      this.formasPagoForm.get(tipoCuentaPago)?.setValue('CORRIENTE');
      this.formasPagoForm.get(idBeneficiario)?.setValue('900187453-0');
      this.formasPagoForm.get(numeroCuentaObligaPago)?.setValue('18042423520');
    } else if (is && is.toLowerCase() === "automagno sas davi") {
      this.formasPagoForm.get(entidadDepositarPago)?.setValue('BANCO DAVIVIENDA');
      this.formasPagoForm.get(tipoCuentaPago)?.setValue('AHORROS');
      this.formasPagoForm.get(idBeneficiario)?.setValue('900187453-0');
      this.formasPagoForm.get(numeroCuentaObligaPago)?.setValue('006301228950');
    } else {
      return
    }
  }

  contratoCompraVenta() {
    const concatena = this.clients.primerNombre + ' ' + this.clients.segundoNombre + ' ' + this.clients.primerApellido + ' ' + this.clients.segundoApellido

    const dataParaDocumento = {
      nombreCompleto: concatena,
      ciudadIdentificacion: this.clients.ciudadIdentificacion,
      vehiculo: this.vehiculo,
    };

    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post(`${this.apiUrl}/api/contrato-compraventa`, dataParaDocumento, { responseType: 'blob' })
      .subscribe(blob => {
        Swal.close();
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `CONTRATO DE COMPRAVENTA TRANSITO ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.docx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        Swal.close();
      });
  }

  mandatoNatural() {
    if (this.clients.tipoIdentificacion != 'NIT.') {
      const concatena = this.clients.primerNombre + ' ' + this.clients.segundoNombre + ' ' + this.clients.primerApellido + ' ' + this.clients.segundoApellido
      const dataParaDocumento = {
        nombreCompleto: concatena,
        ciudadIdentificacion: this.clients.ciudadIdentificacion,
        numeroIdentificacion: this.formatNumber(this.clients.numeroIdentificacion),
        placa: this.vehiculo.placa,
        ciudadPlaca: this.vehiculo.ciudadPlaca
      };

      Swal.fire({
        title: 'Generando documento',
        html: 'Espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.http.post(`${this.apiUrl}/api/mandato-natural`, dataParaDocumento, { responseType: 'blob' })
        .subscribe(blob => {
          Swal.close();
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `CONTRATO DE MANDATO PERSONA NATURAL ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.docx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        }, error => {
          Swal.close();
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El propietario es NIT!",
      });
    }
  }

  mandatoJuridico() {
    if (this.clients.tipoIdentificacion === 'NIT.') {
      const concatena = this.clients.primerNombre + ' ' + this.clients.segundoNombre + ' ' + this.clients.primerApellido + ' ' + this.clients.segundoApellido
      const numeroIdentificacion = this.formatNumber(this.clients.numeroIdentificacion) + '-' + this.clients.digitoVerificacion;

      const dataParaDocumento = {
        nombreCompleto: concatena,
        numeroIdentificacion: numeroIdentificacion,
        placa: this.vehiculo.placa,
      };

      this.http.post(`${this.apiUrl}/api/mandato-juridica`, dataParaDocumento, { responseType: 'blob' })
        .subscribe(blob => {
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `CONTRATO DE MANDATO PERSONA JURIDICA ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.docx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "El propietario no es NIT!",
      });
    }

  }

  actaRecepcion() {
    if (this.filtroBDForm.get('proveedor')?.value !== 'AUTONAL' && this.clients.primerNombre !== 'AUTOMAGNO') {
      const numeroInventario = this.buscarInventarioForm.get('buscarInventario')?.value;
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60000;
      const localTime = new Date(now.getTime() - localOffset);
      const linkInventario = this.archivoDigitalForm.get('link')?.value;
      const linkInventarioS = linkInventario.split('/');
      let linkInventarioSave = '';
      if (!linkInventarioS) {
        linkInventarioSave = linkInventarioS[5];
      } else {
        linkInventarioSave = linkInventario;
      }

      // Formateando la fecha de hoy
      const day = localTime.getDate();
      const monthIndex = localTime.getMonth();
      const year = localTime.getFullYear();
      const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

      const fechaFinSoat = this.documentosValoresInicialesForm.get('fechaFinSoat')?.value;
      const dateTecnicoMecanica = this.generadorContratosForm.get('fechaTecnicoMecanica')?.value;

      const dateObj2 = new Date(fechaFinSoat);
      const dateObj3 = new Date(dateTecnicoMecanica);

      const day2 = dateObj2.getDate();
      const monthIndex2 = dateObj2.getMonth();
      const year2 = dateObj2.getFullYear();

      const formattedDate2 = `${day2} de ${this.monthNames[monthIndex2]} del ${year2}`;

      const day3 = dateObj3.getDate();
      const monthIndex3 = dateObj3.getMonth();
      const year3 = dateObj3.getFullYear();

      const formattedDate3 = `${day3} de ${this.monthNames[monthIndex3]} del ${year3}`;

      const kilometraje = this.generadorContratosForm.get('kilometraje')?.value;
      const formattedKilometraje = this.formatNumber(kilometraje);
      const horaActual = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

      const estadoTecnicoMecanica = this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.value;
      const estadoValorTotalSoat = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;
      const idFormated = this.formatNumber(this.clients.numeroIdentificacion);

      const dataParaDocumento = {
        organizacion: this.filtroBDForm.get('organizacion')?.value,
        linkInventario: linkInventarioSave,
        numeroInventario,
        user: this.datosUser.nombre,
        fecha: formattedDate,
        cliente: this.clients,
        vehiculo: this.vehiculo,
        idFormated: idFormated,
        kilometraje: formattedKilometraje,
        estadoValorTotalSoat: estadoValorTotalSoat,
        estadoTecnicoMecanica: estadoTecnicoMecanica,
        copiaLlave: this.controlAccesoriosForm.get('copiaLlave')?.value,
        manual: this.controlAccesoriosForm.get('manual')?.value,
        copaSeguridad: this.controlAccesoriosForm.get('copaSeguridad')?.value,
        gato: this.controlAccesoriosForm.get('gato')?.value,
        palomera: this.controlAccesoriosForm.get('palomera')?.value,
        tapetes: this.controlAccesoriosForm.get('tapetes')?.value,
        tiroArrastre: this.controlAccesoriosForm.get('tiroArrastre')?.value,
        llantaRepuesto: this.controlAccesoriosForm.get('llantaRepuesto')?.value,
        llavePernos: this.controlAccesoriosForm.get('llavePernos')?.value,
        kitCarretera: this.controlAccesoriosForm.get('kitCarretera')?.value,
        antena: this.controlAccesoriosForm.get('antena')?.value,
        fechaFinSoat: formattedDate2,
        dateTecnicoMecanica: formattedDate3,
        horaRecepciom: horaActual
      };

      Swal.fire({
        title: 'Imprimiendo documento',
        html: 'Espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.http.post(`${this.apiUrl}/api/acta-recepcion`, dataParaDocumento, { responseType: 'blob' })
        .subscribe(
          (blob: Blob) => {

            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `Acta De Recepcion ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.docx`;
            anchor.click();
            window.URL.revokeObjectURL(url);
            Swal.close();

            // Verificar si el Blob es válido
            if (blob.size === 0) {
              Swal.fire('Error', 'El documento generado está vacío.', 'error');
              return;
            }

          },
          (error) => {
            Swal.close();
            console.error('Error al generar el documento:', error);
            Swal.fire('Error', 'No se pudo generar el documento. Por favor, inténtelo de nuevo.', 'error');
          }
        );
    } else {
      if (this.clients.primerNombre === 'AUTOMAGNO') {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "AUTOMAGNO S.A.S, ya es el propietario!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El vehículo ingresa de AUTONAL",
        });
      }
    }
  }

  maxTramitesValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      return formArray.length <= max ? null : { tooManyTramites: { value: formArray.length } };
    };
  }

  liquidacion() {
    const numeroInventario = this.buscarInventarioForm.get('buscarInventario')?.value;
    const now = new Date();
    const formattedDate = this.datePipe.transform(now, 'EEEE, d \'de\' MMMM \'del\' y', 'es-CO');
    const nombreCompleto = this.clients.primerNombre + ' ' + this.clients.segundoNombre + ' ' + this.clients.primerApellido + ' ' + this.clients.segundoApellido;
    const formattedNumeroIdentificacion = this.formatNumber(this.clients.numeroIdentificacion);
    let numeroIdentificacion = '';

    if (this.clients.tipoIdentificacion === 'NIT.') {
      numeroIdentificacion = formattedNumeroIdentificacion + '-' + this.clients.digitoVerificacion + ' de ' + this.clients.ciudadIdentificacion;
    } else {
      numeroIdentificacion = formattedNumeroIdentificacion + ' de ' + this.clients.ciudadIdentificacion;
    }

    const marcaLinea = this.vehiculo.marca + ' ' + this.vehiculo.linea;
    const tramites = this.tramitesForm.get('tramites') as FormArray;

    const tramitesData = tramites.controls.map((control: AbstractControl) => {
      const group = control as FormGroup;
      return group.getRawValue();
    });

    let provisional = '';
    const estadoValorTotalSoat = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;
    const estadoImpAnoEnCurso = this.documentosValoresInicialesForm.get('estadoImpAnoEnCurso')?.value;

    if (estadoValorTotalSoat === 'PROVISIONAL' || estadoImpAnoEnCurso === 'PROVISIONAL') {
      provisional = 'Estimado cliente los valores reflejados en la liquidación se encuentran en estado "PROVISIONAL” por tal motivo esta liquidación está sujeta a cambios de acuerdo con los valores entregados por las entidades públicas correspondientes.'
    } else {
      provisional = '';
    }

    let obsFase3 = '';
    const obsFase3Compra = this.obsFase3Form.get('obsFase3')?.value;

    if (obsFase3Compra === 'N/A' || obsFase3Compra === undefined) {
      obsFase3 = ''
    }

    const dataParaDocumento = {
      numeroInventario: numeroInventario,
      fecha: formattedDate,
      nombreCompleto: nombreCompleto,
      numeroIdentificacion: numeroIdentificacion,
      direccionResidencia: this.clients.direccionResidencia,
      celularOne: this.clients.celularOne,
      correoElectronico: this.clients.correoElectronico,
      placa: this.vehiculo.placa,
      modelo: this.vehiculo.modelo,
      ciudadPlaca: this.vehiculo.ciudadPlaca,
      marcaLinea: marcaLinea,
      valorPactado: this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value),
      valorDeudaFinanciera: this.desformatearMoneda(this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.value),
      entidadDeudaFinan: this.deudaFinancieraForm.get('entidadDeudaFinan')?.value,
      numeroObligacionFinan: this.deudaFinancieraForm.get('numeroObligacionFinan')?.value,
      fechaPagoDeudaFinan: this.deudaFinancieraForm.get('fechaLimitePagoDeudaFinan')?.value,
      traspaso: this.desformatearMoneda(this.liquidacionesForm.get('traspaso')?.value),
      retencion: this.desformatearMoneda(this.liquidacionesForm.get('retencion')?.value),
      otrosImpuestos: this.desformatearMoneda(this.liquidacionesForm.get('otrosImpuestos')?.value),
      levantamientoPrenda: this.desformatearMoneda(this.liquidacionesForm.get('levantamientoPrenda')?.value),
      comparendos: this.desformatearMoneda(this.liquidacionesForm.get('comparendos')?.value),
      proporcionalImpAnoCurso: this.desformatearMoneda(this.liquidacionesForm.get('proporcionalImpAnoCurso')?.value),
      devolucionSoat: this.desformatearMoneda(this.liquidacionesForm.get('devolucionSoat')?.value),
      honorariosAutomagno: this.desformatearMoneda(this.liquidacionesForm.get('honorariosAutomagno')?.value),
      totalDocumentacion: this.desformatearMoneda(this.liquidacionesForm.get('totalDocumentacion')?.value),
      totalCliente: this.desformatearMoneda(this.valorTotalCliente),
      observacionesLiquidacionCompra: obsFase3Compra,
      provisional: provisional,
      asesorComercial: this.generadorContratosForm.get('asesorComercial')?.value,
      telefonoAsesor: this.generadorContratosForm.get('telefonoAsesor')?.value,
      correoAsesor: this.generadorContratosForm.get('correoAsesor')?.value,
      gestorDocumental: this.generadorContratosForm.get('gestorDocumental')?.value,
      telefonoGestor: this.generadorContratosForm.get('telefonoGestor')?.value,
      correoGestor: this.generadorContratosForm.get('correoGestor')?.value,
      formaDePago: {
        ...this.formasPagoForm.getRawValue(),
        valorPago1: this.desformatearMoneda(this.formasPagoForm.get('valorPago1')?.value),
        valorPago2: this.desformatearMoneda(this.formasPagoForm.get('valorPago2')?.value),
        valorPago3: this.desformatearMoneda(this.formasPagoForm.get('valorPago3')?.value),
        valorPago4: this.desformatearMoneda(this.formasPagoForm.get('valorPago4')?.value),
      },
      tramites: tramitesData,
    };

    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post(`${this.apiUrl}/api/liquidacion-compra`, dataParaDocumento, { responseType: 'blob' })
      .subscribe(blob => {
        Swal.close();

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `LIQUIDACION ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        Swal.close();
      });
  }

  initForm() {
    this.buscarInventarioForm = new FormGroup({
      buscarInventario: new FormControl('')
    });
  }

  async transitoAdquisicion() {
    const numeroInventario = this.buscarInventarioForm.get('buscarInventario')?.value;
    const now = new Date();
    const formattedDate = this.datePipe.transform(now, 'EEEE, d \'de\' MMMM \'del\' y', 'es-CO');
    const nombreCompleto = this.clients.primerApellido + ' ' + this.clients.segundoApellido + ' ' + this.clients.primerNombre + ' ' + this.clients.segundoNombre;
    const formattedNumeroIdentificacion = this.formatNumber(this.clients.numeroIdentificacion);
    let numeroIdentificacion = '';

    if (this.clients.tipoIdentificacion === 'NIT.') {
      numeroIdentificacion = formattedNumeroIdentificacion + '-' + this.clients.digitoVerificacion + ' de ' + this.clients.numeroIdentificacion;
    } else {
      numeroIdentificacion = formattedNumeroIdentificacion + ' de ' + this.clients.numeroIdentificacion;
    }

    const marcaLinea = this.vehiculo.marca + ' ' + this.vehiculo.linea;
    const provicionTramites = this.provicionTramitesForm.get('provicionTramites') as FormArray;

    const provicionTramitesData = provicionTramites.controls.map((control: AbstractControl) => {
      const group = control as FormGroup;
      const rawValue = group.getRawValue();

      if (rawValue.valor2) {
        rawValue.valor2 = this.desformatearMoneda(rawValue.valor2);
      }

      return rawValue;
    });

    const ciudadPlaca = this.vehiculo.ciudadPlaca;
    const tramitadoresEncontrados = this.tramitadores.filter((t) => t.ciudad === ciudadPlaca);
    let tramitador = {};

    if (tramitadoresEncontrados.length > 1) {
      const opcionesTramitadores = tramitadoresEncontrados.reduce((acc, t) => {
        acc[t._id] = t.responsable;
        return acc;
      }, {});

      const resultado = await Swal.fire({
        title: 'Hay más de un tramitador para esta ciudad',
        input: 'select',
        inputOptions: opcionesTramitadores,
        inputPlaceholder: 'Selecciona un tramitador',
        showCancelButton: true
      });

      if (resultado.value) {
        tramitador = tramitadoresEncontrados.find(t => t._id === resultado.value);
      } else {
        return;
      }
    } else if (tramitadoresEncontrados.length === 1) {
      tramitador = tramitadoresEncontrados[0];
    }

    const dataParaDocumento = {
      numeroInventario: numeroInventario,
      fecha: formattedDate,
      nombreCompleto: nombreCompleto,
      numeroIdentificacion: numeroIdentificacion,
      direccionResidencia: this.clients.direccionResidencia,
      celularOne: this.clients.celularOne,
      correoElectronico: this.clients.correoElectronico,

      placa: this.vehiculo.placa,
      modelo: this.vehiculo.modelo,
      ciudadPlaca: this.vehiculo.ciudadPlaca,
      marcaLinea: marcaLinea,
      valorPactado: this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value),

      entidadDeudaFinan: this.deudaFinancieraForm.get('entidadDeudaFinan')?.value,
      numeroObligacionFinan: this.deudaFinancieraForm.get('numeroObligacionFinan')?.value,
      fechaPagoDeudaFinan: this.deudaFinancieraForm.get('fechaLimitePagoDeudaFinan')?.value,
      valorDeudaFinanciera: this.desformatearMoneda(this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.value),

      retencionFuente: this.desformatearMoneda(this.liquidacionesForm.get('retencionFuente')?.value),
      traspasoNeto: this.desformatearMoneda(this.liquidacionesForm.get('traspasoNeto')?.value),
      soat: this.liquidacionesForm.get('soat')?.value,
      impuestoAnoCurso: this.desformatearMoneda(this.liquidacionesForm.get('impuestoAnoCurso')?.value),
      otrosImpuestosProv: this.desformatearMoneda(this.liquidacionesForm.get('otrosImpuestosProv')?.value),
      levantamientoPrenda2: this.desformatearMoneda(this.liquidacionesForm.get('levantamientoPrenda2')?.value),
      comparendos2: this.desformatearMoneda(this.liquidacionesForm.get('comparendos2')?.value),
      deudaFinanciera: this.desformatearMoneda(this.liquidacionesForm.get('deudaFinanciera')?.value),
      honorariosTramitador: this.desformatearMoneda(this.liquidacionesForm.get('honorariosTramitador')?.value),
      totalProvision: this.desformatearMoneda(this.liquidacionesForm.get('totalProvision')?.value),

      asesorComercial: this.generadorContratosForm.get('asesorComercial')?.value,
      telefonoAsesor: this.generadorContratosForm.get('telefonoAsesor')?.value,
      correoAsesor: this.generadorContratosForm.get('correoAsesor')?.value,
      gestorDocumental: this.generadorContratosForm.get('gestorDocumental')?.value,
      telefonoGestor: this.generadorContratosForm.get('telefonoGestor')?.value,
      correoGestor: this.generadorContratosForm.get('correoGestor')?.value,
      provicionTramites: provicionTramitesData,
      tramitador: tramitador
    };

    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post(`${this.apiUrl}/api/transito-adquisicion`, dataParaDocumento, { responseType: 'blob' })
      .subscribe(blob => {
        Swal.close();

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `PROV TRÁNSITO ADQUISICIÓN ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        Swal.close();
      });
  }

  funt() {
    const now = new Date();
    const localOffset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - localOffset);

    // Formateando la fecha de hoy
    const day = localTime.getDate();
    const monthIndex = localTime.getMonth();
    const year = localTime.getFullYear();
    const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

    const numeroIdentificacion = this.clients.numeroIdentificacion;
    const formattedNumeroIdentificacion = this.formatNumber(numeroIdentificacion);

    const fechaImportacion = new Date(this.vehiculo.fechaImportacion);
    const diaImportacion = String(fechaImportacion.getUTCDate()).padStart(2, '0');
    const mesImportacion = String(fechaImportacion.getUTCMonth() + 1).padStart(2, '0');
    const anoImportacion = fechaImportacion.getFullYear();
    const placaLetras = this.vehiculo.placa.substring(0, 3);
    const placaNumeros = this.vehiculo.placa.substring(3, 6);

    const dataParaDocumento = {
      fecha: formattedDate,
      primerApellido: this.clients.primerApellido,
      segundoApellido: this.clients.segundoApellido,
      primerNombre: this.clients.primerNombre,
      segundoNombre: this.clients.segundoNombre,
      tipoIdentificacion: this.clients.tipoIdentificacion,
      digitoVerificacion: this.clients.digitoVerificacion,
      numeroIdentificacion: formattedNumeroIdentificacion,
      direccionResidencia: this.clients.direccionResidencia,
      ciudadResidencia: this.clients.ciudadResidencia,
      celularOne: this.clients.celularOne,
      marca: this.vehiculo.marca,
      linea: this.vehiculo.linea,
      servicio: this.vehiculo.servicio,
      color: this.vehiculo.color,
      modelo: this.vehiculo.modelo,
      cilindraje: this.vehiculo.cilindraje,
      motor: this.vehiculo.numeroMotor,
      chasis: this.vehiculo.chasis,
      serie: this.vehiculo.serie,
      vin: this.vehiculo.vin,
      clase: this.vehiculo.clase,
      carroceria: this.vehiculo.carroceria,
      capacidad: this.vehiculo.pasajeros,
      noDocumentoImportacion: this.vehiculo.noDocumentoImportacion,
      diaImportacion: diaImportacion,
      mesImportacion: mesImportacion,
      anoImportacion: anoImportacion,
      placaLetras: placaLetras,
      placaNumeros: placaNumeros
    };

    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post(`${this.apiUrl}/api/funt-natural`, dataParaDocumento, { responseType: 'blob' })
      .subscribe(blob => {
        Swal.close();

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `FUNT ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        Swal.close();
      });
  }

  buscarVehiculo() {
    if (this.vehiculoControl.valid) {
      const placa = this.vehiculoControl.value;

      this.vehiclesService.getVehicleByPlaca(placa).subscribe(
        (data) => {
          this.vehiculo = data;
          this.btnChange = true;
          this.vehiculo.fechaMatricula = new Date(data.fechaMatricula).toISOString().substring(0, 10);
          this.vehiculo.fechaImportacion = new Date(data.fechaImportacion).toISOString().substring(0, 10);
          this.documentosValoresInicialesForm.get('ciudadPlaca')?.setValue(data.ciudadPlaca);
          this.mostrarSiguienteModal2 = true;
          this.obtenerFechaTecnoMecanicaVehiculo();
          this.calcularTotalCliente();
          this.actualizarInventario();
        },
        (error) => {
          this.mostrarSiguienteModal2 = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Placa no encontrada!',
          })
        }
      );
    }
  }

  buscarCliente() {
    if (this.clienteControl.valid) {
      const identificacion = this.clienteControl.value;

      this.clientsService.getClientById(identificacion).subscribe(
        (data) => {
          this.clients = data;
          this.changeRetencion();
          this.btnChange = true;
          this.clients.fechaIngreso = new Date(data.fechaIngreso).toISOString().substring(0, 10);
          this.mostrarSiguienteModal = true;

          if (data.primerNombre === 'AUTOMAGNO') {
            this.cambioAutomagno = true;
          } else {
            this.cambioAutomagno = false;
          }

          this.calcularTotalCliente();
          this.siNitActivar();
          this.actualizarInventario();
        },
        (error) => {
          this.mostrarSiguienteModal = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Cliente no encontrado!',
          })
        }
      );
    }
  }

  tieneRol(rolesNecesarios: string[]): boolean {
    const rolesUsuario = this.datosUser?.role || [];
    return rolesNecesarios.some(rolNecesario => rolesUsuario.includes(rolNecesario));
  }

  validarCertificadoTradicion() {
    const is = this.documentosValoresInicialesForm.get("certificadoTradicion")?.value;

    if (is === "REVISADO RECHAZADO") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Vehiculo Rechazado',
      });

      this.documentosValoresInicialesForm.get('ciudadPlaca')?.disable();
      this.documentosValoresInicialesForm.get('estadoCuentaImpuesto')?.disable();
      this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.disable();
      this.documentosValoresInicialesForm.get('simitPropietario')?.disable();
      this.documentosValoresInicialesForm.get('simitPropietarioValor')?.disable();
      this.documentosValoresInicialesForm.get('liquidacionDeudaFin')?.disable();
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.disable();
      this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.disable();
      this.documentosValoresInicialesForm.get('dateTecnicoMecanica')?.disable();
      this.documentosValoresInicialesForm.get('manifiestoFactura')?.disable();
      this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.disable();
      this.documentosValoresInicialesForm.get('totalSoatValor')?.disable();
      this.documentosValoresInicialesForm.get('fechaFinSoat')?.disable();
      this.documentosValoresInicialesForm.get('estadoImpAnoEnCurso')?.disable();
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.disable();
      this.documentosValoresInicialesForm.get('estadoValorRetencion')?.disable();
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.disable();
    } else {
      this.obtenerEstadoCuentaImpuestos();
      this.obtenerSimitPropietario();
      this.obtenerLevantamientoPrenda();
      this.obtenerEstadoSoat;
      this.obtenerValorImpAnoEnCurso;
      this.obtenerEstadoValorRetencion();
      this.documentosValoresInicialesForm.get('ciudadPlaca')?.enable();
      this.documentosValoresInicialesForm.get('estadoCuentaImpuesto')?.enable();
      this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.enable();
      this.documentosValoresInicialesForm.get('simitPropietario')?.enable();
      this.documentosValoresInicialesForm.get('simitPropietarioValor')?.enable();
      this.documentosValoresInicialesForm.get('liquidacionDeudaFin')?.enable();
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.enable();
      this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.enable();
      this.documentosValoresInicialesForm.get('dateTecnicoMecanica')?.enable();
      this.documentosValoresInicialesForm.get('manifiestoFactura')?.enable();
      this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.enable();
      this.documentosValoresInicialesForm.get('totalSoatValor')?.enable();
      this.documentosValoresInicialesForm.get('fechaFinSoat')?.enable();
      this.documentosValoresInicialesForm.get('estadoImpAnoEnCurso')?.enable();
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.enable();
      this.documentosValoresInicialesForm.get('estadoValorRetencion')?.enable();
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.enable();
    }
  }

  public irAlInventario(inventoryId: string): void {
    this.buscarInventarioForm.get('buscarInventario')?.setValue(inventoryId);
    this.buscarInventario();
    this.openModal();
  }

  private openModal(): void {
    const modalElement = document.getElementById('staticBackdrop17');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
      this.addModalEventListeners(modalElement);
    }
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  navigateToModal(targetId: string): void {
    // Close all open modals first
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach((m: any) => {
      const instance = (window as any).bootstrap?.Modal?.getInstance(m);
      if (instance) instance.hide();
    });
    // Wait for close animation, then clean up and open target
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
      const target = document.getElementById(targetId);
      if (target) {
        const modal = new (window as any).bootstrap.Modal(target);
        modal.show();
      }
    }, 300);
  }

  private addModalEventListeners(modalElement: HTMLElement): void {
    modalElement.addEventListener('hidden.bs.modal', () => {
    });
  }

  contadorDiasFechas() {
    let fechaEntrega: any = this.formaPagoCompraForm.get('fechaEntrega')?.value;
    let fechaAsignacion: any = this.formaPagoCompraForm.get('fechaAsignacion')?.value;

    if (fechaEntrega && fechaAsignacion) {
      const fechaEntregaDate = new Date(fechaEntrega);
      const fechaAsignacionDate = new Date(fechaAsignacion);

      const timeDiff = fechaEntregaDate.getTime() - fechaAsignacionDate.getTime();

      this.contadorDias = Math.floor(timeDiff / (1000 * 3600 * 24));
    } else {
      this.contadorDias = 0;
    }
  }

  buscarInventario() {

    this.btnEsconder = false;

    if (this.buscarInventarioForm.valid) {
      setTimeout(() => {

        const inventarioId = this.buscarInventarioForm.get('buscarInventario')?.value;

        this.http.get<any>(`${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`).subscribe(
          data => {
            this.inventoryId = data._id;
            this.noInventario = data.inventoryId;
            this.btnEsconder = true;
            this.btnChange = true;
            this.esActualizar = true;
            this.buscarClientePorId(data.cliente);
            this.mostrarSiguienteModal = true;
            this.buscarVehiculoPorId(data.vehiculo);
            this.mostrarSiguienteModal2 = true;

            let fechaIngreso: any = new Date(data.filtroBaseDatos.fechaIngreso).toISOString().substring(0, 10);

            if (fechaIngreso === '1970-01-01') {
              fechaIngreso = null;
            }

            let fechaExpedicion: any = new Date(data.filtroBaseDatos.fechaExpedicion).toISOString().substring(0, 10);

            if (fechaExpedicion === '1970-01-01') {
              fechaExpedicion = null;
            }

            this.filtroBDForm.patchValue({
              organizacion: data.filtroBaseDatos.organizacion,
              tipoNegocio: data.filtroBaseDatos.tipoNegocio,
              proveedor: data.filtroBaseDatos.proveedor,
              estadoInventario: data.filtroBaseDatos.estadoInventario,
              fechaIngreso: fechaIngreso,
              ubicacion: data.filtroBaseDatos.ubicacion,
              tallerProveedor: data.filtroBaseDatos.tallerProveedor,
              fechaExpedicion: fechaExpedicion
            });

            this.estaEnTaller();
            const esAutonal = data.filtroBaseDatos.proveedor;

            if (esAutonal === 'AUTONAL') {
              this.isAutonal = true;
            } else {
              this.isAutonal = false;
            }

            if (this.filtroBDForm.invalid) {
              this.filtroBDForm.markAllAsTouched();
            }

            this.peritajeImprontasForm.patchValue({
              lugar: data.peritajeProveedor.lugar,
              estado: data.peritajeProveedor.estado,
              numeroInspeccion: data.peritajeProveedor.numeroInspeccion,
              linkInspeccion: data.peritajeProveedor.linkInspeccion,
              impronta: data.peritajeProveedor.impronta
            });

            if (this.peritajeImprontasForm.invalid) {
              this.peritajeImprontasForm.markAllAsTouched();
            }

            let fechaEntrega: any = new Date(data.formaPagoCompra.fechaEntrega).toISOString().substring(0, 10);

            if (fechaEntrega === '1970-01-01') {
              fechaEntrega = null;
            }

            let fechaAsignacion: any = data.formaPagoCompra.fechaAsignacion;

            if (fechaAsignacion && !isNaN(new Date(fechaAsignacion).getTime())) {
              fechaAsignacion = new Date(fechaAsignacion).toISOString().substring(0, 10);
            } else {
              fechaAsignacion = null;
            }

            this.contadorDiasFechas();

            const formatearValorNumero = this.formatSalary(data.formaPagoCompra.valorCompraNumero);

            this.formaPagoCompraForm.patchValue({
              valorCompraLetras: data.formaPagoCompra.valorCompraLetras,
              valorCompraNumero: formatearValorNumero,
              fechaAsignacion: fechaAsignacion,
              fechaEntrega: fechaEntrega
            });

            this.letrasValueClausula = data.formaPagoCompra.clausulaPenalLetras;

            this.clausulaPenal = this.formatSalary(data.formaPagoCompra.clausulaPenalNumeros);

            if (data.filtroBaseDatos.proveedor !== 'AUTONAL') {
              this.valorOfertado = data.formaPagoCompra.valorCompraNumero;
            } else {
              this.valorOfertado = data.formaPagoCompra.valorAutomagno;
            }
            this.cdr.detectChanges();


            if (this.formaPagoCompraForm.invalid) {
              this.formaPagoCompraForm.markAllAsTouched();
            }

            this.cdr.detectChanges();

            this.documentosTraspasoForm.patchValue({
              contratoVenta: data.documentosTraspasos.contratoVenta,
              funt: data.documentosTraspasos.funt,
              mandato: data.documentosTraspasos.mandato,
              copiaTecnicoMecanica: data.documentosTraspasos.copiaTecnicoMecanica,
              copiaGeneralAutenticado: data.documentosTraspasos.copiaGeneralAutenticado
            });

            this.documentosTraspasoForm.get('copiaCedulaPropietario')?.setValue(data.documentosTraspasos.copiaCedulaPropietario);
            this.documentosTraspasoForm.get('copiaTarjetaPropietario')?.setValue(data.documentosTraspasos.copiaTarjetaPropietario);
            this.documentosTraspasoForm.get('copiaSoat')?.setValue(data.documentosTraspasos.copiaSoat);

            if (this.documentosTraspasoForm.invalid) {
              this.documentosTraspasoForm.markAllAsTouched();
            }

            this.fotosCedulaPropietario = data.documentosTraspasos.fotosCedulaPropietario || [];
            this.fotosTarjetaPropietario = data.documentosTraspasos.fotosTarjetaPropietario || [];
            this.fotosSoat = data.documentosTraspasos.fotosSoat || [];
            this.fotosCertificadoTradicion = data.documentosValoresIniciales.fotosCertificadoTradicion || [];
            this.fotosEstadoCuentaImpuesto = data.documentosValoresIniciales.fotosEstadoCuentaImpuesto || [];
            this.fotosSimitPropietario = data.documentosValoresIniciales.fotosSimitPropietario || [];
            this.fotosLiquidacionDeudaFinanciera = data.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera || [];
            this.fotosTecnoMecanica = data.documentosValoresIniciales.fotosTecnoMecanica || [];
            this.fotosManifiestoFactura = data.documentosValoresIniciales.fotosManifiestoFactura || [];
            this.fotosSoatIniciales = data.documentosValoresIniciales.fotosSoatIniciales || [];
            this.fotosImpuestoAno = data.documentosValoresIniciales.fotosImpuestoAno || [];
            this.fotosOficioDesembargo = data.documentosValoresIniciales.fotosOficioDesembargo || [];
            this.fotosCopiaLlave = data.controlAccesorios.fotosCopiaLlave || [];
            this.fotosGato = data.controlAccesorios.fotosGato || [];
            this.fotosLlavePernos = data.controlAccesorios.fotosLlavePernos || [];
            this.fotosCopaSeguridad = data.controlAccesorios.fotosCopaSeguridad || [];
            this.fotosTiroArrastre = data.controlAccesorios.fotosTiroArrastre || [];
            this.fotosHistorialMantenimiento = data.controlAccesorios.fotosHistorialMantenimiento || [];
            this.fotosManual = data.controlAccesorios.fotosManual || [];
            this.fotosPalomera = data.controlAccesorios.fotosPalomera || [];
            this.fotosTapetes = data.controlAccesorios.fotosTapetes || [];
            this.fotosLlantaRepuesto = data.controlAccesorios.fotosLlantaRepuesto || [];
            this.fotosKitCarretera = data.controlAccesorios.fotosKitCarretera || [];
            this.fotosAntena = data.controlAccesorios.fotosAntena || [];

            this.archivoDigitalForm.patchValue({
              link: data.link
            });

            if (this.archivoDigitalForm.invalid) {
              this.archivoDigitalForm.markAllAsTouched();
            }

            this.observacionGlobal = data.observacionGlobal;

            const estadoCuentaImpuestoValor = this.formatSalary(data.documentosValoresIniciales.estadoCuentaImpuestoValor);
            const simitPropietarioValor = this.formatSalary(data.documentosValoresIniciales.simitPropietarioValor);
            const liquidacionDeudaFinValor = this.formatSalary(data.documentosValoresIniciales.liquidacionDeudaFinValor);
            const totalSoatValor = this.formatSalary(data.documentosValoresIniciales.totalSoatValor);
            const impAnoEnCursoValor = this.formatSalary(data.documentosValoresIniciales.impAnoEnCursoValor);
            const valorRetencionValor = this.formatSalary(data.documentosValoresIniciales.valorRetencionValor);
            let dateFinSoat: any = new Date(data.documentosValoresIniciales.fechaFinSoat).toISOString().substring(0, 10);
            let dateTecnicoMecanica: any = new Date(data.documentosValoresIniciales.dateTecnicoMecanica).toISOString().substring(0, 10);

            if (dateTecnicoMecanica === '1970-01-01') {
              dateTecnicoMecanica = null;
            }
            if (dateFinSoat === '1970-01-01') {
              dateFinSoat = null;
            }

            this.documentosValoresInicialesForm.patchValue({
              ciudadPlaca: data.documentosValoresIniciales.ciudadPlaca,
              certificadoTradicion: data.documentosValoresIniciales.certificadoTradicion,
              oficioDesembargo: data.documentosValoresIniciales.oficioDesembargo,
              estadoCuentaImpuesto: data.documentosValoresIniciales.estadoCuentaImpuesto,
              estadoCuentaImpuestoValor: estadoCuentaImpuestoValor,
              simitPropietario: data.documentosValoresIniciales.simitPropietario,
              simitPropietarioValor: simitPropietarioValor,
              liquidacionDeudaFin: data.documentosValoresIniciales.liquidacionDeudaFin,
              liquidacionDeudaFinValor: liquidacionDeudaFinValor,
              estadoTecnicoMecanica: data.documentosValoresIniciales.estadoTecnicoMecanica,
              dateTecnicoMecanica: dateTecnicoMecanica,
              manifiestoFactura: data.documentosValoresIniciales.manifiestoFactura,
              estadoValorTotalSoat: data.documentosValoresIniciales.estadoValorTotalSoat,
              totalSoatValor: totalSoatValor,
              fechaFinSoat: dateFinSoat,
              estadoImpAnoEnCurso: data.documentosValoresIniciales.estadoImpAnoEnCurso,
              impAnoEnCursoValor: impAnoEnCursoValor,
              estadoValorRetencion: data.documentosValoresIniciales.estadoValorRetencion,
              valorRetencionValor: valorRetencionValor,
            });

            const valorImpAnoEnCurso = data.documentosValoresIniciales.estadoImpAnoEnCurso;

            if (valorImpAnoEnCurso != 'LIQUIDAR') {
              this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.enable();
            } else {
              this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.disable();
            }

            if (this.documentosValoresInicialesForm.invalid) {
              this.documentosValoresInicialesForm.markAllAsTouched();
            }

            let fechaUltimoMantenimiento: any = new Date(data.controlAccesorios.fechaUltimoMantenimiento).toISOString().substring(0, 10);

            if (fechaUltimoMantenimiento === '1970-01-01') {
              fechaUltimoMantenimiento = null;
            }

            this.tramitesIngresoForm.patchValue({
              valorAutomagno: this.formatSalaryOrZero(data.tramitesIngreso.valorAutomagno),
              valorContrato: this.formatSalaryOrZero(data.tramitesIngreso.valorContrato),
              pagoFinanciera: this.formatSalaryOrZero(data.tramitesIngreso.pagoFinanciera),
              retefuenteT: this.formatSalaryOrZero(data.tramitesIngreso.retefuenteT),
              garantiaMobiliaria: this.formatSalaryOrZero(data.tramitesIngreso.garantiaMobiliaria),
              impuestos: this.formatSalaryOrZero(data.tramitesIngreso.impuestos),
              soat: this.formatSalaryOrZero(data.tramitesIngreso.soat),
              revTecnoMeca: this.formatSalaryOrZero(data.tramitesIngreso.revTecnoMeca),
              comparendos: this.formatSalaryOrZero(data.tramitesIngreso.comparendos),
              documentacion: this.formatSalaryOrZero(data.tramitesIngreso.documentacion),
              manifiestoFactura: this.formatSalaryOrZero(data.tramitesIngreso.manifiestoFactura),
              semaforizacion: this.formatSalaryOrZero(data.tramitesIngreso.semaforizacion),
              total: this.formatSalaryOrZero(data.tramitesIngreso.total),
              valorGirarCliente: this.formatSalaryOrZero(data.tramitesIngreso.valorGirarCliente),
            });

            if (this.tramitesIngresoForm.invalid) {
              this.tramitesIngresoForm.markAllAsTouched();
            }

            data.tramitesIngreso.camposExtra.forEach((campo: any) => {
              this.camposExtra.push(this.formBuilder.group({
                descripcionExtra: [campo.descripcionExtra],
                campoExtra: [this.formatSalaryOrZero(campo.campoExtra)]
              }));
            });

            if (this.camposExtra.length > 0) {
              this.showColumn = true;
            } else {
              this.showColumn = false;
            }

            this.tramitesSalidaAutonalForm.patchValue({
              traspaso: this.formatSalaryOrZero(data.tramitesSalidaAutonal.traspaso),
              checkTraspaso: data.tramitesSalidaAutonal.checkTraspaso,
              provTraspaso: data.tramitesSalidaAutonal.provTraspaso,
              servicioFueraBogota: this.formatSalaryOrZero(data.tramitesSalidaAutonal.servicioFueraBogota),
              checkServicioFueraBogota: data.tramitesSalidaAutonal.checkServicioFueraBogota,
              provServicioFueraBogota: data.tramitesSalidaAutonal.provServicioFueraBogota,
              retefuenteS: this.formatSalaryOrZero(data.tramitesSalidaAutonal.retefuenteS),
              checkRetefuenteS: data.tramitesSalidaAutonal.checkRetefuenteS,
              provRetefuenteS: data.tramitesSalidaAutonal.provRetefuenteS,
              levantaPrenda: this.formatSalaryOrZero(data.tramitesSalidaAutonal.levantaPrenda),
              checkLevantaPrenda: data.tramitesSalidaAutonal.checkLevantaPrenda,
              provLevantaPrenda: data.tramitesSalidaAutonal.provLevantaPrenda,
              garantiaMobiliaria: this.formatSalaryOrZero(data.tramitesSalidaAutonal.garantiaMobiliaria),
              checkGarantiaMobiliaria: data.tramitesSalidaAutonal.checkGarantiaMobiliaria,
              provGarantiaMobiliaria: data.tramitesSalidaAutonal.provGarantiaMobiliaria,
              impuestos: this.formatSalaryOrZero(data.tramitesSalidaAutonal.impuestos),
              checkImpuestos: data.tramitesSalidaAutonal.checkImpuestos,
              provImpuestos: data.tramitesSalidaAutonal.provImpuestos,
              liquidacionImpuesto: this.formatSalaryOrZero(data.tramitesSalidaAutonal.liquidacionImpuesto),
              checkLiquidacionImpuesto: data.tramitesSalidaAutonal.checkLiquidacionImpuesto,
              provLiquidacionImpuesto: data.tramitesSalidaAutonal.provLiquidacionImpuesto,
              derechosMunicipales: this.formatSalaryOrZero(data.tramitesSalidaAutonal.derechosMunicipales),
              checkDerechosMunicipales: data.tramitesSalidaAutonal.checkDerechosMunicipales,
              provDerechosMunicipales: data.tramitesSalidaAutonal.provDerechosMunicipales,
              soat: this.formatSalaryOrZero(data.tramitesSalidaAutonal.soat),
              checkSoat: data.tramitesSalidaAutonal.checkSoat,
              provSoat: data.tramitesSalidaAutonal.provSoat,
              revTecnoMeca: this.formatSalaryOrZero(data.tramitesSalidaAutonal.revTecnoMeca),
              checkRevTecnoMeca: data.tramitesSalidaAutonal.checkRevTecnoMeca,
              provRevTecnoMeca: data.tramitesSalidaAutonal.provRevTecnoMeca,
              comparendos: this.formatSalaryOrZero(data.tramitesSalidaAutonal.comparendos),
              checkComparendos: data.tramitesSalidaAutonal.checkComparendos,
              provComparendos: data.tramitesSalidaAutonal.provComparendos,
              documentosIniciales: this.formatSalaryOrZero(data.tramitesSalidaAutonal.documentosIniciales),
              checkDocumentosIniciales: data.tramitesSalidaAutonal.checkDocumentosIniciales,
              provDocumentosIniciales: data.tramitesSalidaAutonal.provDocumentosIniciales,
              documentacion: this.formatSalaryOrZero(data.tramitesSalidaAutonal.documentacion),
              checkDocumentacion: data.tramitesSalidaAutonal.checkDocumentacion,
              provDocumentacion: data.tramitesSalidaAutonal.provDocumentacion,
              manifiestoFactura: this.formatSalaryOrZero(data.tramitesSalidaAutonal.manifiestoFactura),
              checkManifiestoFactura: data.tramitesSalidaAutonal.checkManifiestoFactura,
              provManifiestoFactura: data.tramitesSalidaAutonal.provManifiestoFactura,
              ctci: this.formatSalaryOrZero(data.tramitesSalidaAutonal.ctci),
              checkCtci: data.tramitesSalidaAutonal.checkCtci,
              provCtci: data.tramitesSalidaAutonal.provCtci,
              semaforizacion: this.formatSalaryOrZero(data.tramitesSalidaAutonal.semaforizacion),
              checkSemaforizacion: data.tramitesSalidaAutonal.checkSemaforizacion,
              provSemaforizacion: data.tramitesSalidaAutonal.provSemaforizacion,
              impuestoAnoActual: this.formatSalaryOrZero(data.tramitesSalidaAutonal.impuestoAnoActual),
              checkImpuestoAnoActual: data.tramitesSalidaAutonal.checkImpuestoAnoActual,
              provImpuestoAnoActual: data.tramitesSalidaAutonal.provImpuestoAnoActual,
              total: this.formatSalaryOrZero(data.tramitesSalidaAutonal.total),
              comisionBruta: this.formatSalaryOrZero(data.tramitesSalidaAutonal.comisionBruta),
              comisionNeta: this.formatSalaryOrZero(data.tramitesSalidaAutonal.comisionNeta),
              pagoFinanciera: this.formatSalaryOrZero(data.tramitesSalidaAutonal.pagoFinanciera),
              valorNetoVehiculo: this.formatSalaryOrZero(data.tramitesSalidaAutonal.valorNetoVehiculo),
            });

            if (this.tramitesSalidaAutonalForm.invalid) {
              this.tramitesSalidaAutonalForm.markAllAsTouched();
            }

            data.tramitesSalidaAutonal.camposExtrasSalida.forEach((campo: any) => {
              this.camposExtrasSalida.push(this.formBuilder.group({
                descripcionExtra: [campo.descripcionExtra],
                campoExtra: [this.formatSalaryOrZero(campo.campoExtra)],
                asumeExtra: [campo.asumeExtra],
                provExtra: [campo.provExtra],
              }));
            });

            if (this.camposExtra.length > 0) {
              this.showColumn = true;
            } else {
              this.showColumn = false;
            }

            this.controlAccesoriosForm.patchValue({
              copiaLlave: data.controlAccesorios.copiaLlave,
              copiaLlaveObs: data.controlAccesorios.copiaLlaveObs,
              gato: data.controlAccesorios.gato,
              gatoObs: data.controlAccesorios.gatoObs,
              llavePernos: data.controlAccesorios.llavePernos,
              llavePernosObs: data.controlAccesorios.llavePernosObs,
              copaSeguridad: data.controlAccesorios.copaSeguridad,
              copaSeguridadObs: data.controlAccesorios.copaSeguridadObs,
              tiroArrastre: data.controlAccesorios.tiroArrastre,
              tiroArrastreObs: data.controlAccesorios.tiroArrastreObs,
              historialMantenimiento: data.controlAccesorios.historialMantenimiento,
              historialMantenimientoObs: data.controlAccesorios.historialMantenimientoObs,
              manual: data.controlAccesorios.manual,
              manualObs: data.controlAccesorios.manualObs,
              palomera: data.controlAccesorios.palomera,
              palomeraObs: data.controlAccesorios.palomeraObs,
              tapetes: data.controlAccesorios.tapetes,
              tapetesObs: data.controlAccesorios.tapetesObs,
              ultimoKilometraje: data.controlAccesorios.ultimoKilometraje,
              lugarUltimoMantenimiento: data.controlAccesorios.lugarUltimoMantenimiento,
              fechaUltimoMantenimiento: fechaUltimoMantenimiento,
              llantaRepuesto: data.controlAccesorios.llantaRepuesto,
              llantaRepuestoObs: data.controlAccesorios.llantaRepuestoObs,
              kitCarretera: data.controlAccesorios.kitCarretera,
              kitCarreteraObs: data.controlAccesorios.kitCarreteraObs,
              antena: data.controlAccesorios.antena,
              antenaObs: data.controlAccesorios.antenaObs
            });

            if (this.controlAccesoriosForm.invalid) {
              this.controlAccesoriosForm.markAllAsTouched();
            }

            this.registroActividad = (data.controlAccesorios.registroActividad || []).reverse();

            const datosTramites = data.otrosTramitesAccesorios;
            const controlTramites = <FormArray>this.tramitesForm.controls['tramites'];

            datosTramites.forEach((t: any) => {
              controlTramites.push(this.formBuilder.group({
                descripcion: [t.descripcion],
                valor: [this.formatSalary(t.valor)]
              }));
            });

            const datosProvicionTramites = data.otrosTramitesVendedor;
            const controlProvicionTramites = <FormArray>this.provicionTramitesForm.controls['provicionTramites'];

            datosProvicionTramites.forEach((pt: any) => {
              controlProvicionTramites.push(this.formBuilder.group({
                descripcion2: [pt.descripcion2],
                valor2: [this.formatSalary(pt.valor2)]
              }));
            });

            this.variablesLiquidacionForm.patchValue({
              cobraHonorarios: data.variablesLiquidacion.cobraHonorarios,
              promedioImpuesto: data.variablesLiquidacion.promedioImpuesto,
              promediaSoat: data.variablesLiquidacion.promediaSoat
            });

            if (this.variablesLiquidacionForm.invalid) {
              this.variablesLiquidacionForm.markAllAsTouched();
            }

            let fechaPago1: any = new Date(data.formadePago.fechaPago1).toISOString().substring(0, 10);

            if (fechaPago1 === '1970-01-01') {
              fechaPago1 = null;
            }

            let fechaPago2: any = new Date(data.formadePago.fechaPago2).toISOString().substring(0, 10);

            if (fechaPago2 === '1970-01-01') {
              fechaPago2 = null;
            }

            let fechaPago3: any = new Date(data.formadePago.fechaPago3).toISOString().substring(0, 10);

            if (fechaPago3 === '1970-01-01') {
              fechaPago3 = null;
            }

            let fechaPago4: any = new Date(data.formadePago.fechaPago4).toISOString().substring(0, 10);

            if (fechaPago4 === '1970-01-01') {
              fechaPago4 = null;
            }

            let valorPago1 = data.formadePago.valorPago1;

            if (valorPago1 === null || valorPago1 === undefined || valorPago1 === "") {
              valorPago1 = '$ 0';
            } else {
              valorPago1 = this.formatSalary(valorPago1);
            }

            this.formasPagoForm.get('valorPago1')?.setValue(valorPago1);

            let valorPago2 = data.formadePago.valorPago2;

            if (valorPago2 === null || valorPago2 === undefined || valorPago1 === "") {
              valorPago2 = '$ 0';
            } else {
              valorPago2 = this.formatSalary(valorPago2);
            }

            this.formasPagoForm.get('valorPago2')?.setValue(valorPago2);

            let valorPago3 = data.formadePago.valorPago3;

            if (valorPago3 === null || valorPago3 === undefined || valorPago1 === "") {
              valorPago3 = '$ 0';
            } else {
              valorPago3 = this.formatSalary(valorPago3);
            }

            this.formasPagoForm.get('valorPago3')?.setValue(valorPago3);

            this.formasPagoForm.patchValue({
              descripcionPago1: data.formadePago.descripcionPago1,
              formaPagoPago1: data.formadePago.formaPagoPago1,
              entidadDepositarPago1: data.formadePago.entidadDepositarPago1,
              numeroCuentaObligaPago1: data.formadePago.numeroCuentaObligaPago1,
              tipoCuentaPago1: data.formadePago.tipoCuentaPago1,
              beneficiarioPago1: data.formadePago.beneficiarioPago1,
              idBeneficiarioPago1: data.formadePago.idBeneficiarioPago1,
              fechaPago1: fechaPago1,
              descripcionPago2: data.formadePago.descripcionPago2,
              formaPagoPago2: data.formadePago.formaPagoPago2,
              entidadDepositarPago2: data.formadePago.entidadDepositarPago2,
              numeroCuentaObligaPago2: data.formadePago.numeroCuentaObligaPago2,
              tipoCuentaPago2: data.formadePago.tipoCuentaPago2,
              beneficiarioPago2: data.formadePago.beneficiarioPago2,
              idBeneficiarioPago2: data.formadePago.idBeneficiarioPago2,
              fechaPago2: fechaPago2,
              descripcionPago3: data.formadePago.descripcionPago3,
              formaPagoPago3: data.formadePago.formaPagoPago3,
              entidadDepositarPago3: data.formadePago.entidadDepositarPago3,
              numeroCuentaObligaPago3: data.formadePago.numeroCuentaObligaPago3,
              tipoCuentaPago3: data.formadePago.tipoCuentaPago3,
              beneficiarioPago3: data.formadePago.beneficiarioPago3,
              idBeneficiarioPago3: data.formadePago.idBeneficiarioPago3,
              fechaPago3: fechaPago3,
              descripcionPago4: data.formadePago.descripcionPago4,
              formaPagoPago4: data.formadePago.formaPagoPago4,
              entidadDepositarPago4: data.formadePago.entidadDepositarPago4,
              numeroCuentaObligaPago4: data.formadePago.numeroCuentaObligaPago4,
              tipoCuentaPago4: data.formadePago.tipoCuentaPago4,
              beneficiarioPago4: data.formadePago.beneficiarioPago4,
              idBeneficiarioPago4: data.formadePago.idBeneficiarioPago4,
              fechaPago4: fechaPago4,
            });

            if (this.formasPagoForm.invalid) {
              this.formasPagoForm.markAllAsTouched();
            }

            let fechaLimitePagoDeudaFinan: any = new Date(data.deudaFinanciera.fechaLimitePagoDeudaFinan).toISOString().substring(0, 10);

            if (fechaLimitePagoDeudaFinan === '1970-01-01') {
              fechaLimitePagoDeudaFinan = null;
            }

            this.deudaFinancieraForm.patchValue({
              entidadDeudaFinan: data.deudaFinanciera.entidadDeudaFinan,
              numeroObligacionFinan: data.deudaFinanciera.numeroObligacionFinan,
              fechaLimitePagoDeudaFinan: fechaLimitePagoDeudaFinan
            });

            if (data.fichaNegocio) {
              this.fichaNegocioForm.patchValue(data.fichaNegocio);
            }

            if (this.deudaFinancieraForm.invalid) {
              this.deudaFinancieraForm.markAllAsTouched();
            }

            this.liquidacionesForm.patchValue({
              traspaso: data.liquidaciones.traspaso,
              retencion: data.liquidaciones.retencion,
              otrosImpuestos: data.liquidaciones.otrosImpuestos,
              levantamientoPrenda: data.liquidaciones.levantamientoPrenda,
              comparendos: data.liquidaciones.comparendos,
              proporcionalImpAnoCurso: data.liquidaciones.proporcionalImpAnoCurso,
              devolucionSoat: data.liquidaciones.devolucionSoat,
              honorariosAutomagno: data.liquidaciones.honorariosAutomagno,
              retencionFuente: data.liquidaciones.retencionFuente,
              traspasoNeto: data.liquidaciones.traspasoNeto,
              soat: data.liquidaciones.soat,
              impuestoAnoCurso: data.liquidaciones.impuestoAnoCurso,
              otrosImpuestosProv: data.liquidaciones.otrosImpuestosProv,
              levantamientoPrenda2: data.liquidaciones.levantamientoPrenda2,
              comparendos2: data.liquidaciones.comparendos2,
              deudaFinanciera: data.liquidaciones.deudaFinanciera,
              honorariosTramitador: data.liquidaciones.honorariosTramitador,
              totalDocumentacion: data.liquidaciones.totalDocumentacion,
              totalProvision: data.liquidaciones.totalProvision
            });

            if (this.liquidacionesForm.invalid) {
              this.liquidacionesForm.markAllAsTouched();
            }
            this.obsFase3Form.patchValue({
              obsFase3: data.obsFase3
            });

            if (this.obsFase3Form.invalid) {
              this.obsFase3Form.markAllAsTouched();
            }

            let fechaTecnicoMecanica: any = new Date(data.generadorContratos.fechaTecnicoMecanica).toISOString().substring(0, 10);

            if (fechaTecnicoMecanica === '1970-01-01') {
              fechaTecnicoMecanica = null;
            }

            this.generadorContratosForm.patchValue({
              asesorComercial: data.generadorContratos.asesorComercial,
              telefonoAsesor: data.generadorContratos.telefonoAsesor,
              correoAsesor: data.generadorContratos.correoAsesor,
              gestorDocumental: data.generadorContratos.gestorDocumental,
              telefonoGestor: data.generadorContratos.telefonoGestor,
              correoGestor: data.generadorContratos.correoGestor,
              kilometraje: this.formatThousands(data.generadorContratos.kilometraje),
              horaRecepciom: data.generadorContratos.horaRecepciom,
              fechaTecnicoMecanica: fechaTecnicoMecanica
            });

            if (this.generadorContratosForm.invalid) {
              this.generadorContratosForm.markAllAsTouched();
            }
            this.calcularTotal();
            this.calcularTotalTramitesIngreso();
            this.calcularTotalTramitesSalida();
            this.actualizarValoresActualesDePago();
            this.actualizarValorPago4();
            this.cdr.detectChanges();
            this.initialValues = this.getCurrentFormValues();

            this.markInvalidControlsAsTouched(this.filtroBDForm);
            this.markInvalidControlsAsTouched(this.peritajeImprontasForm);
            this.markInvalidControlsAsTouched(this.formaPagoCompraForm);
            this.markInvalidControlsAsTouched(this.documentosTraspasoForm);
            this.markInvalidControlsAsTouched(this.archivoDigitalForm);
            this.markInvalidControlsAsTouched(this.documentosValoresInicialesForm);
            this.markInvalidControlsAsTouched(this.tramitesIngresoForm);
            this.markInvalidControlsAsTouched(this.tramitesSalidaAutonalForm);
            this.markInvalidControlsAsTouched(this.controlAccesoriosForm);
            this.markInvalidControlsAsTouched(this.variablesLiquidacionForm);
            this.markInvalidControlsAsTouched(this.formasPagoForm);
            this.markInvalidControlsAsTouched(this.deudaFinancieraForm);
            this.markInvalidControlsAsTouched(this.liquidacionesForm);
            this.markInvalidControlsAsTouched(this.obsFase3Form);
            this.markInvalidControlsAsTouched(this.generadorContratosForm);
            this.cdr.detectChanges();


          },
          error => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Inventario no encontrado!',
            });
          }
        );
      }, 1500);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingresa el numero del inventario!',
      })
    }
  }

  getCurrentFormValues() {
    return {
      filtroBDForm: this.filtroBDForm.getRawValue(),
      peritajeImprontasForm: this.peritajeImprontasForm.getRawValue(),
      formaPagoCompraForm: this.formaPagoCompraForm.getRawValue(),
      documentosTraspasoForm: this.documentosTraspasoForm.getRawValue(),
      documentosValoresInicialesForm: this.documentosValoresInicialesForm.getRawValue(),
      tramitesIngresoForm: this.tramitesIngresoForm.getRawValue(),
      tramitesSalidaAutonalForm: this.tramitesSalidaAutonalForm.getRawValue(),
      controlAccesoriosForm: this.controlAccesoriosForm.getRawValue(),
      fichaNegocio: this.fichaNegocioForm.getRawValue(),
      formasPagoForm: this.formasPagoForm.getRawValue(),
      deudaFinancieraForm: this.deudaFinancieraForm.getRawValue(),
      liquidacionesForm: this.liquidacionesForm.getRawValue(),
      obsFase3Form: this.obsFase3Form.getRawValue(),
      generadorContratosForm: this.generadorContratosForm.getRawValue(),
      archivoDigitalForm: this.archivoDigitalForm.getRawValue(),
      tramitesForm: this.tramitesForm.getRawValue(),
      provicionTramitesForm: this.provicionTramitesForm.getRawValue(),
      observacionGlobal: this.observacionGlobal
    };
  }

  estaEnTaller() {
    let ubicacion = this.filtroBDForm.get('ubicacion')?.value;

    if (ubicacion === 'TALLER') {
      this.taller = true;
    } else {
      this.taller = false;
    }
  }

  formatSalaryOrZero(value: any): string {
    if (value === null || value === undefined) {
      return '$ 0';
    }
    return this.formatSalary(value);
  }

  async actualizarInventario() {
    const otrosTramitesAccesorios = this.convertirArrayAObjeto(this.tramitesForm.get('tramites') as FormArray);
    const otrosTramitesVendedor = this.convertirArrayAObjeto2(this.provicionTramitesForm.get('provicionTramites') as FormArray);
    const valorCompraNumerico = this.desformatearMoneda(this.formaPagoCompraForm.get('valorCompraNumero')?.value);
    const estadoCuentaImpuestoValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')?.value);
    const simitPropietarioValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('simitPropietarioValor')?.value);
    const liquidacionDeudaFinValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.value);
    const totalSoatValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('totalSoatValor')?.value);
    const impAnoEnCursoValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value);
    const valorRetencionValor = this.desformatearMoneda(this.documentosValoresInicialesForm.get('valorRetencionValor')?.value);
    const valorPago1 = this.desformatearMoneda(this.formasPagoForm.get('valorPago1')?.value);
    const valorPago2 = this.desformatearMoneda(this.formasPagoForm.get('valorPago2')?.value);
    const valorPago3 = this.desformatearMoneda(this.formasPagoForm.get('valorPago3')?.value);
    const valorPago4 = this.desformatearMoneda(this.formasPagoForm.get('valorPago4')?.value);

    const clausulaPenalNumeros = this.clausulaPenal;

    const valorAutomagno = this.desformatearMoneda(this.tramitesIngresoForm.get('valorAutomagno')?.value);
    const valorContrato = this.desformatearMoneda(this.tramitesIngresoForm.get('valorContrato')?.value);
    const pagoFinanciera = this.desformatearMoneda(this.tramitesIngresoForm.get('pagoFinanciera')?.value);
    const retefuenteT = this.desformatearMoneda(this.tramitesIngresoForm.get('retefuenteT')?.value);
    const garantiaMobiliaria = this.desformatearMoneda(this.tramitesIngresoForm.get('garantiaMobiliaria')?.value);
    const impuestos = this.desformatearMoneda(this.tramitesIngresoForm.get('impuestos')?.value);
    const soat = this.desformatearMoneda(this.tramitesIngresoForm.get('soat')?.value);
    const revTecnoMeca = this.desformatearMoneda(this.tramitesIngresoForm.get('revTecnoMeca')?.value);
    const comparendos = this.desformatearMoneda(this.tramitesIngresoForm.get('comparendos')?.value);
    const documentacion = this.desformatearMoneda(this.tramitesIngresoForm.get('documentacion')?.value);
    const manifiestoFactura = this.desformatearMoneda(this.tramitesIngresoForm.get('manifiestoFactura')?.value);
    const semaforizacion = this.desformatearMoneda(this.tramitesIngresoForm.get('semaforizacion')?.value);
    const total = this.desformatearMoneda(this.tramitesIngresoForm.get('total')?.getRawValue());
    const valorGirarCliente = this.desformatearMoneda(this.tramitesIngresoForm.get('valorGirarCliente')?.getRawValue());


    const traspaso2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('traspaso')?.value);
    const servicioFueraBogota2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('servicioFueraBogota')?.value);
    const retefuenteS2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('retefuenteS')?.value);
    const levantaPrenda2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('levantaPrenda')?.value);
    const garantiaMobiliaria2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('garantiaMobiliaria')?.value);
    const impuestos2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('impuestos')?.value);
    const liquidacionImpuesto2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('liquidacionImpuesto')?.value);
    const derechosMunicipales2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('derechosMunicipales')?.value);
    const soat2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('soat')?.value);
    const revTecnoMeca2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('revTecnoMeca')?.value);
    const comparendos2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('comparendos')?.value);
    const documentosIniciales2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('documentosIniciales')?.value);
    const documentacion2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('documentacion')?.value);
    const manifiestoFactura2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('manifiestoFactura')?.value);
    const ctci2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('ctci')?.value);
    const semaforizacion2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('semaforizacion')?.value);
    const impuestoAnoActual2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('impuestoAnoActual')?.value);
    const total2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('total')?.getRawValue());
    const comisionBruta2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('comisionBruta')?.getRawValue());
    const comisionNeta2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('comisionNeta')?.getRawValue());
    const valorNetoVehiculo2 = this.desformatearMoneda(this.tramitesSalidaAutonalForm.get('valorNetoVehiculo')?.getRawValue());

    const camposExtra = this.convertirArrayAObjetoEntrada(this.tramitesIngresoForm.get('camposExtra') as FormArray);
    const camposExtrasSalida = this.convertirArrayAObjetoSalida(this.tramitesSalidaAutonalForm.get('camposExtrasSalida') as FormArray);

    const updatedInventoryData = {
      cliente: this.clients._id,
      vehiculo: this.vehiculo._id,
      placa: this.vehiculo.placa,
      filtroBaseDatos: this.filtroBDForm.value,
      peritajeProveedor: this.peritajeImprontasForm.value,
      documentosTraspasos: {
        contratoVenta: this.documentosTraspasoForm.get('contratoVenta')?.getRawValue(),
        funt: this.documentosTraspasoForm.get('funt')?.getRawValue(),
        mandato: this.documentosTraspasoForm.get('mandato')?.getRawValue(),
        copiaCedulaPropietario: this.documentosTraspasoForm.get('copiaCedulaPropietario')?.getRawValue(),
        copiaTarjetaPropietario: this.documentosTraspasoForm.get('copiaTarjetaPropietario')?.getRawValue(),
        copiaSoat: this.documentosTraspasoForm.get('copiaSoat')?.getRawValue(),
        copiaTecnicoMecanica: this.documentosTraspasoForm.get('copiaTecnicoMecanica')?.getRawValue(),
        copiaGeneralAutenticado: this.documentosTraspasoForm.get('copiaGeneralAutenticado')?.getRawValue(),
      },
      link: this.archivoDigitalForm.value.link,
      documentosValoresIniciales: {
        ciudadPlaca: this.documentosValoresInicialesForm.get('ciudadPlaca')?.getRawValue(),
        certificadoTradicion: this.documentosValoresInicialesForm.get('certificadoTradicion')?.getRawValue(),
        oficioDesembargo: this.documentosValoresInicialesForm.get('oficioDesembargo')?.getRawValue(),
        estadoCuentaImpuesto: this.documentosValoresInicialesForm.get('estadoCuentaImpuesto')?.getRawValue(),
        simitPropietario: this.documentosValoresInicialesForm.get('simitPropietario')?.getRawValue(),
        liquidacionDeudaFin: this.documentosValoresInicialesForm.get('liquidacionDeudaFin')?.getRawValue(),
        estadoTecnicoMecanica: this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.getRawValue(),
        dateTecnicoMecanica: this.documentosValoresInicialesForm.get('dateTecnicoMecanica')?.getRawValue(),
        manifiestoFactura: this.documentosValoresInicialesForm.get('manifiestoFactura')?.getRawValue(),
        estadoValorTotalSoat: this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.getRawValue(),
        fechaFinSoat: this.documentosValoresInicialesForm.get('fechaFinSoat')?.getRawValue(),
        estadoImpAnoEnCurso: this.documentosValoresInicialesForm.get('estadoImpAnoEnCurso')?.getRawValue(),
        estadoValorRetencion: this.documentosValoresInicialesForm.get('estadoValorRetencion')?.getRawValue(),
        estadoCuentaImpuestoValor: estadoCuentaImpuestoValor,
        simitPropietarioValor: simitPropietarioValor,
        liquidacionDeudaFinValor: liquidacionDeudaFinValor,
        totalSoatValor: totalSoatValor,
        impAnoEnCursoValor: impAnoEnCursoValor,
        valorRetencionValor: valorRetencionValor
      },
      obsFase3: this.obsFase3Form.value.obsFase3,
      controlAccesorios: {
        copiaLlave: this.controlAccesoriosForm.get('copiaLlave')?.getRawValue(),
        copiaLlaveObs: this.controlAccesoriosForm.get('copiaLlaveObs')?.getRawValue(),
        gato: this.controlAccesoriosForm.get('gato')?.getRawValue(),
        gatoObs: this.controlAccesoriosForm.get('gatoObs')?.getRawValue(),
        llavePernos: this.controlAccesoriosForm.get('llavePernos')?.getRawValue(),
        llavePernosObs: this.controlAccesoriosForm.get('llavePernosObs')?.getRawValue(),
        copaSeguridad: this.controlAccesoriosForm.get('copaSeguridad')?.getRawValue(),
        copaSeguridadObs: this.controlAccesoriosForm.get('copaSeguridadObs')?.getRawValue(),
        tiroArrastre: this.controlAccesoriosForm.get('tiroArrastre')?.getRawValue(),
        tiroArrastreObs: this.controlAccesoriosForm.get('tiroArrastreObs')?.getRawValue(),
        historialMantenimiento: this.controlAccesoriosForm.get('historialMantenimiento')?.getRawValue(),
        historialMantenimientoObs: this.controlAccesoriosForm.get('historialMantenimientoObs')?.getRawValue(),
        manual: this.controlAccesoriosForm.get('manual')?.getRawValue(),
        manualObs: this.controlAccesoriosForm.get('manualObs')?.getRawValue(),
        palomera: this.controlAccesoriosForm.get('palomera')?.getRawValue(),
        palomeraObs: this.controlAccesoriosForm.get('palomeraObs')?.getRawValue(),
        tapetes: this.controlAccesoriosForm.get('tapetes')?.getRawValue(),
        tapetesObs: this.controlAccesoriosForm.get('tapetesObs')?.getRawValue(),
        ultimoKilometraje: this.controlAccesoriosForm.get('ultimoKilometraje')?.getRawValue(),
        lugarUltimoMantenimiento: this.controlAccesoriosForm.get('lugarUltimoMantenimiento')?.getRawValue(),
        fechaUltimoMantenimiento: this.controlAccesoriosForm.get('fechaUltimoMantenimiento')?.getRawValue(),
        llantaRepuesto: this.controlAccesoriosForm.get('llantaRepuesto')?.getRawValue(),
        llantaRepuestoObs: this.controlAccesoriosForm.get('llantaRepuestoObs')?.getRawValue(),
        kitCarretera: this.controlAccesoriosForm.get('kitCarretera')?.getRawValue(),
        kitCarreteraObs: this.controlAccesoriosForm.get('kitCarreteraObs')?.getRawValue(),
        antena: this.controlAccesoriosForm.get('antena')?.getRawValue(),
        antenaObs: this.controlAccesoriosForm.get('antenaObs')?.getRawValue()
      },
      deudaFinanciera: this.deudaFinancieraForm.value,
      liquidaciones: this.liquidacionesForm.getRawValue(),
      otrosTramitesAccesorios,
      otrosTramitesVendedor,
      observacionGlobal: this.observacionGlobal,
      variablesLiquidacion: this.variablesLiquidacionForm.value,
      tramitesIngreso: {
        valorAutomagno: valorAutomagno,
        valorContrato: valorContrato,
        pagoFinanciera: pagoFinanciera,
        retefuenteT: retefuenteT,
        garantiaMobiliaria: garantiaMobiliaria,
        impuestos: impuestos,
        soat: soat,
        revTecnoMeca: revTecnoMeca,
        comparendos: comparendos,
        documentacion: documentacion,
        manifiestoFactura: manifiestoFactura,
        semaforizacion: semaforizacion,
        total: total,
        valorGirarCliente: valorGirarCliente,
        camposExtra
      },
      tramitesSalidaAutonal: {
        ...this.tramitesSalidaAutonalForm.getRawValue(),
        traspaso: traspaso2,
        servicioFueraBogota: servicioFueraBogota2,
        retefuenteS: retefuenteS2,
        levantaPrenda: levantaPrenda2,
        garantiaMobiliaria: garantiaMobiliaria2,
        impuestos: impuestos2,
        liquidacionImpuesto: liquidacionImpuesto2,
        derechosMunicipales: derechosMunicipales2,
        soat: soat2,
        revTecnoMeca: revTecnoMeca2,
        comparendos: comparendos2,
        documentosIniciales: documentosIniciales2,
        documentacion: documentacion2,
        manifiestoFactura: manifiestoFactura2,
        ctci: ctci2,
        semaforizacion: semaforizacion2,
        impuestoAnoActual: impuestoAnoActual2,
        total: total2,
        comisionBruta: comisionBruta2,
        comisionNeta: comisionNeta2,
        valorNetoVehiculo: valorNetoVehiculo2,
        camposExtrasSalida
      },
      formaPagoCompra: {
        ...this.formaPagoCompraForm.value,
        clausulaPenalNumeros: clausulaPenalNumeros,
        clausulaPenalLetras: this.letrasValueClausula,
        valorCompraNumero: valorCompraNumerico,
      },
      formadePago: {
        ...this.formasPagoForm.getRawValue(),
        valorPago1: valorPago1,
        valorPago2: valorPago2,
        valorPago3: valorPago3,
        valorPago4: valorPago4
      },
      generadorContratos: this.generadorContratosForm.getRawValue()
    };

    try {
      let response: any = await this.http.put(`${this.apiUrl}/api/updateInventories/${this.inventoryId}`, updatedInventoryData).toPromise();
      this.registroActividad = (response.controlAccesorios.registroActividad || []).reverse();
      this.updateInventory(this.noInventario);
      this.initialValues = this.getCurrentFormValues();

      const toastEl = document.getElementById('actualizado');
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
    } catch (error: any) {
    }
  }

  deepCompare(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  buscarClientePorId(clienteId: string) {
    this.http.get<any>(`${this.apiUrl}/api/getClients/${clienteId}`).subscribe(
      clienteData => {
        this.clients = clienteData;
        this.clients.fechaIngreso = new Date(clienteData.fechaIngreso).toISOString().substring(0, 10);
        this.siNitActivar();
      },
      error => {
      }
    );
  }

  aplicarFunciones() {
    const esAutonal = this.filtroBDForm.get('proveedor')?.value === "AUTONAL";
    const cliente = this.clients.primerNombre === "AUTOMAGNO";

    if ((esAutonal && cliente) || (!esAutonal)) {
      this.obtenerCostoTraspaso50();
      this.obtenerHonorariosTramitador();
    } else {
      this.liquidacionesForm.controls['traspaso'].setValue('$ 0');
      this.liquidacionesForm.controls['traspasoNeto'].setValue('$ 0');
      this.liquidacionesForm.get('honorariosTramitador')?.setValue(this.formatSalary('$ 0'));
    }
  }

  GeneralCarpeta() {
    const data = this.vehiculoForm.get('placa')?.value;
  }

  buscarVehiculoPorId(vehiculoId: string) {
    this.http.get<any>(`${this.apiUrl}/api/getVehicles/${vehiculoId}`).subscribe(
      vehiculoData => {
        this.vehiculo = vehiculoData;
        this.vehiculo.fechaMatricula = new Date(vehiculoData.fechaMatricula).toISOString().substring(0, 10);
        this.vehiculo.fechaImportacion = new Date(vehiculoData.fechaImportacion).toISOString().substring(0, 10);
      },
      error => {
      }
    );
  }

  organizarAlfabeticamente() {
    this.lugares.sort((a, b) => {
      const departamentoA = a.name.toLowerCase();
      const departamentoB = b.name.toLowerCase();

      if (departamentoA < departamentoB) {
        return -1;
      }
      if (departamentoA > departamentoB) {
        return 1;
      }
      return 0;
    });
  }

  organizarAlfabeticamenteCliente() {
    this.suppliers.sort((a, b) => {
      const departamentoA = a.name.toLowerCase();
      const departamentoB = b.name.toLowerCase();

      if (departamentoA < departamentoB) {
        return -1;
      }
      if (departamentoA > departamentoB) {
        return 1;
      }
      return 0;
    });
  }

  onMayuscula(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  onPlacaInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();

    if (value === '') {
      this.placaValue = value;
    } else if (value.match(/^[A-Z]{1,3}$/)) {
      this.placaValue = value;
    } else if (value.match(/^[A-Z]{3}[0-9]{0,3}$/)) {
      this.placaValue = value;
    }

    if (value !== this.placaValue) {
      input.value = this.placaValue;
    }
  }

  configureFiltering() {
    this.opcionesFiltradas = this.clienteControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allClients.filter(option => option.toLowerCase().includes(filterValue));
  }

  openModal2(imagenes: string[], index: number) {
    this.imagenesModal = imagenes;
    this.imagenSeleccionadaIndex = index;
    this.showModal = true;
  }

  closeModal2() {
    this.showModal = false;
  }

  configureFilteringVeh() {
    this.opcionesFiltradasVeh = this.vehiculoControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVeh(value))
    );
  }

  private _filterVeh(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter(option => option.toLowerCase().includes(filterValue));
  }

  configureFilteringVehInv() {
    this.opcionesFiltradasVehInv = this.vehiculoInvControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVehInv(value))
    );
  }

  private _filterVehInv(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehiclesInv.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFn(cliente: string): string {
    return cliente || '';
  }

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  displayFnVehInv(vehiculo: string): string {
    return vehiculo || '';
  }

  onCedulaPropietarioSelected(event: any) {
    this.onFileChange('fotosCedulaPropietario', event);
    const fotosCedulaPropietario = Array.from(event.target.files) as File[];
    this.uploadPhotos(fotosCedulaPropietario, 'fotosCedulaPropietario');
  }

  onTarjetaPropietarioSelected(event: any) {
    this.onFileChange('fotosTarjetaPropietario', event);
    const fotosTarjetaPropietario = Array.from(event.target.files) as File[];
    this.uploadPhotos(fotosTarjetaPropietario, 'fotosTarjetaPropietario');
  }

  onSoatSelected(event: any) {
    this.onFileChange('fotosSoat', event);
    const fotosSoat = Array.from(event.target.files) as File[];
    this.uploadPhotos(fotosSoat, 'fotosSoat');
  }

  // Nuevas funciones de selección de archivos
  onCertificadoTradicionSelected(event: any) {
    this.onFileChange('fotosCertificadoTradicion', event);
    const fotosCertificadoTradicion = Array.from(event.target.files) as File[];
    this.uploadCertificadoTradicionPhotos(fotosCertificadoTradicion);
  }

  onEstadoCuentaImpuestoSelected(event: any) {
    this.onFileChange('fotosEstadoCuentaImpuesto', event);
    const fotosEstadoCuentaImpuesto = Array.from(event.target.files) as File[];
    this.uploadEstadoCuentaImpuestoPhotos(fotosEstadoCuentaImpuesto);
  }

  onSimitPropietarioSelected(event: any) {
    this.onFileChange('fotosSimitPropietario', event);
    const fotosSimitPropietario = Array.from(event.target.files) as File[];
    this.uploadSimitPropietarioPhotos(fotosSimitPropietario);
  }

  //aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

  onLiquidacionDeudaFinancieraSelected(event: any) {
    this.onFileChange('fotosLiquidacionDeudaFinanciera', event);
    const fotosLiquidacionDeudaFinanciera = Array.from(event.target.files) as File[];
    this.uploadLiquidacionDeudaFinancieraPhotos(fotosLiquidacionDeudaFinanciera);
  }

  onOficioDesembargoSelected(event: any) {
    this.onFileChange('fotosOficioDesembargo', event);
    const fotosOficioDesembargo = Array.from(event.target.files) as File[];
    this.uploadPhotos(fotosOficioDesembargo, 'fotosOficioDesembargo');
  }

  onTecnoMecanicaSelected(event: any) {
    this.onFileChange('fotosTecnoMecanica', event);
    const fotosTecnoMecanica = Array.from(event.target.files) as File[];
    this.uploadTecnoMecanicaPhotos(fotosTecnoMecanica);
  }

  onManifiestoFacturaSelected(event: any) {
    this.onFileChange('fotosManifiestoFactura', event);
    const fotosManifiestoFactura = Array.from(event.target.files) as File[];
    this.uploadManifiestoFacturaPhotos(fotosManifiestoFactura);
  }

  onSoatInicialesSelected(event: any) {
    this.onFileChange('fotosSoatIniciales', event);
    const fotosSoatIniciales = Array.from(event.target.files) as File[];
    this.uploadSoatInicialesPhotos(fotosSoatIniciales);
  }

  onImpuestoAnoSelected(event: any) {
    this.onFileChange('fotosImpuestoAno', event);
    const fotosImpuestoAno = Array.from(event.target.files) as File[];
    this.uploadImpuestoAnoPhotos(fotosImpuestoAno);
  }

  onCopiaLlaveSelected(event: any) {
    this.onFileChange('fotosCopiaLlave', event);
    const fotosCopiaLlave = Array.from(event.target.files) as File[];
    this.uploadCopiaLlavePhotos(fotosCopiaLlave);
  }

  onGatoSelected(event: any) {
    this.onFileChange('fotosGato', event);
    const fotosGato = Array.from(event.target.files) as File[];
    this.uploadGatoPhotos(fotosGato);
  }

  onLlavePernosSelected(event: any) {
    this.onFileChange('fotosLlavePernos', event);
    const fotosLlavePernos = Array.from(event.target.files) as File[];
    this.uploadLlavePernosPhotos(fotosLlavePernos);
  }

  onCopaSeguridadSelected(event: any) {
    this.onFileChange('fotosCopaSeguridad', event);
    const fotosCopaSeguridad = Array.from(event.target.files) as File[];
    this.uploadCopaSeguridadPhotos(fotosCopaSeguridad);
  }

  onTiroArrastreSelected(event: any) {
    this.onFileChange('fotosTiroArrastre', event);
    const fotosTiroArrastre = Array.from(event.target.files) as File[];
    this.uploadTiroArrastrePhotos(fotosTiroArrastre);
  }

  onHistorialMantenimientoSelected(event: any) {
    this.onFileChange('fotosHistorialMantenimiento', event);
    const fotosHistorialMantenimiento = Array.from(event.target.files) as File[];
    this.uploadHistorialMantenimientoPhotos(fotosHistorialMantenimiento);
  }

  onManualSelected(event: any) {
    this.onFileChange('fotosManual', event);
    const fotosManual = Array.from(event.target.files) as File[];
    this.uploadManualPhotos(fotosManual);
  }

  onPalomeraSelected(event: any) {
    this.onFileChange('fotosPalomera', event);
    const fotosPalomera = Array.from(event.target.files) as File[];
    this.uploadPalomeraPhotos(fotosPalomera);
  }

  onTapetesSelected(event: any) {
    this.onFileChange('fotosTapetes', event);
    const fotosTapetes = Array.from(event.target.files) as File[];
    this.uploadTapetesPhotos(fotosTapetes);
  }

  onLlantaRepuestoSelected(event: any) {
    this.onFileChange('fotosLlantaRepuesto', event);
    const fotosLlantaRepuesto = Array.from(event.target.files) as File[];
    this.uploadLlantaRepuestoPhotos(fotosLlantaRepuesto);
  }

  onKitCarreteraSelected(event: any) {
    this.onFileChange('fotosKitCarretera', event);
    const fotosKitCarretera = Array.from(event.target.files) as File[];
    this.uploadKitCarreteraPhotos(fotosKitCarretera);
  }

  onAntenaSelected(event: any) {
    this.onFileChange('fotosAntena', event);
    const fotosAntena = Array.from(event.target.files) as File[];
    this.uploadAntenaPhotos(fotosAntena);
  }


  // Funciones de subida de archivos específicas

  async uploadCertificadoTradicionPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosCertificadoTradicion');
  }

  async uploadEstadoCuentaImpuestoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosEstadoCuentaImpuesto');
  }

  async uploadSimitPropietarioPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosSimitPropietario');
  }

  async uploadCedulaPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosCedulaPropietario');
  }

  async uploadOficioDesembargoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosOficioDesembargo');
  }

  async uploadTarjetaPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTarjetaPropietario');
  }

  async uploadSoatPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosSoat');
  }

  async uploadLiquidacionDeudaFinancieraPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosLiquidacionDeudaFinanciera');
  }

  async uploadTecnoMecanicaPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTecnoMecanica');
  }

  async uploadManifiestoFacturaPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosManifiestoFactura');
  }

  async uploadSoatInicialesPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosSoatIniciales');
  }

  async uploadImpuestoAnoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosImpuestoAno');
  }

  async uploadCopiaLlavePhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosCopiaLlave');
  }

  async uploadGatoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosGato');
  }

  async uploadLlavePernosPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosLlavePernos');
  }

  async uploadCopaSeguridadPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosCopaSeguridad');
  }

  async uploadTiroArrastrePhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTiroArrastre');
  }

  async uploadHistorialMantenimientoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosHistorialMantenimiento');
  }

  async uploadManualPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosManual');
  }

  async uploadPalomeraPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosPalomera');
  }

  async uploadTapetesPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTapetes');
  }

  async uploadLlantaRepuestoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosLlantaRepuesto');
  }

  async uploadKitCarreteraPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosKitCarretera');
  }

  async uploadAntenaPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosAntena');
  }


  async uploadPhotos(files: File[], fieldName: string) {
    const formData = new FormData();
    files.forEach((file: File) => {
      formData.append(fieldName, file, file.name);
    });

    // Mostrar mensaje de espera
    Swal.fire({
      title: 'Espere, por favor',
      text: 'Se está subiendo la imagen...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response: any = await this.http.put(`${this.apiUrl}/api/updateInventoryPhotos/${this.inventoryId}`, formData).toPromise();
      Swal.close(); // Cerrar el mensaje de espera
      Swal.fire("Fotos actualizadas!", "", "success");

      this.updatePhotoArrays(fieldName, response);
      this.cdr.detectChanges();
    } catch (error: any) {
      Swal.close(); // Cerrar el mensaje de espera en caso de error
      if (error.name === 'VersionError') {
        console.error('Version conflict, retrying operation');
      } else {
        Swal.fire("Error al actualizar las fotos!", "", "error");
      }
    }
  }

  funcionPruebas() {
    const devolucionSoatValue = this.liquidacionesForm.get('devolucionSoat')?.value;
  }

  updatePhotoArrays(fieldName: string, response: any) {
    if (fieldName === 'fotosCedulaPropietario') {
      this.fotosCedulaPropietario = response.documentosTraspasos.fotosCedulaPropietario;
    } else if (fieldName === 'fotosTarjetaPropietario') {
      this.fotosTarjetaPropietario = response.documentosTraspasos.fotosTarjetaPropietario;
    } else if (fieldName === 'fotosSoat') {
      this.fotosSoat = response.documentosTraspasos.fotosSoat;
    } else if (fieldName === 'fotosCertificadoTradicion') {
      this.fotosCertificadoTradicion = response.documentosValoresIniciales.fotosCertificadoTradicion;
    } else if (fieldName === 'fotosEstadoCuentaImpuesto') {
      this.fotosEstadoCuentaImpuesto = response.documentosValoresIniciales.fotosEstadoCuentaImpuesto;
    } else if (fieldName === 'fotosSimitPropietario') {
      this.fotosSimitPropietario = response.documentosValoresIniciales.fotosSimitPropietario;
    } else if (fieldName === 'fotosLiquidacionDeudaFinanciera') {
      this.fotosLiquidacionDeudaFinanciera = response.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera;
    } else if (fieldName === 'fotosTecnoMecanica') {
      this.fotosTecnoMecanica = response.documentosValoresIniciales.fotosTecnoMecanica;
    } else if (fieldName === 'fotosManifiestoFactura') {
      this.fotosManifiestoFactura = response.documentosValoresIniciales.fotosManifiestoFactura;
    } else if (fieldName === 'fotosSoatIniciales') {
      this.fotosSoatIniciales = response.documentosValoresIniciales.fotosSoatIniciales;
    } else if (fieldName === 'fotosOficioDesembargo') {
      this.fotosOficioDesembargo = response.documentosValoresIniciales.fotosOficioDesembargo;
    } else if (fieldName === 'fotosImpuestoAno') {
      this.fotosImpuestoAno = response.documentosValoresIniciales.fotosImpuestoAno;
    } else if (fieldName === 'fotosCopiaLlave') {
      this.fotosCopiaLlave = response.controlAccesorios.fotosCopiaLlave;
    } else if (fieldName === 'fotosGato') {
      this.fotosGato = response.controlAccesorios.fotosGato;
    } else if (fieldName === 'fotosLlavePernos') {
      this.fotosLlavePernos = response.controlAccesorios.fotosLlavePernos;
    } else if (fieldName === 'fotosCopaSeguridad') {
      this.fotosCopaSeguridad = response.controlAccesorios.fotosCopaSeguridad;
    } else if (fieldName === 'fotosTiroArrastre') {
      this.fotosTiroArrastre = response.controlAccesorios.fotosTiroArrastre;
    } else if (fieldName === 'fotosHistorialMantenimiento') {
      this.fotosHistorialMantenimiento = response.controlAccesorios.fotosHistorialMantenimiento;
    } else if (fieldName === 'fotosManual') {
      this.fotosManual = response.controlAccesorios.fotosManual;
    } else if (fieldName === 'fotosPalomera') {
      this.fotosPalomera = response.controlAccesorios.fotosPalomera;
    } else if (fieldName === 'fotosTapetes') {
      this.fotosTapetes = response.controlAccesorios.fotosTapetes;
    } else if (fieldName === 'fotosLlantaRepuesto') {
      this.fotosLlantaRepuesto = response.controlAccesorios.fotosLlantaRepuesto;
    } else if (fieldName === 'fotosKitCarretera') {
      this.fotosKitCarretera = response.controlAccesorios.fotosKitCarretera;
    } else if (fieldName === 'fotosAntena') {
      this.fotosAntena = response.controlAccesorios.fotosAntena;
    }

    this.cdr.detectChanges();
  }

  async eliminarFoto(fieldName: string, index: number) {
    let fotoUrl: any;
    if (fieldName === 'fotosCedulaPropietario') {
      fotoUrl = this.fotosCedulaPropietario[index];
    } else if (fieldName === 'fotosTarjetaPropietario') {
      fotoUrl = this.fotosTarjetaPropietario[index];
    } else if (fieldName === 'fotosSoat') {
      fotoUrl = this.fotosSoat[index];
    } else if (fieldName === 'fotosCertificadoTradicion') {
      fotoUrl = this.fotosCertificadoTradicion[index];
    } else if (fieldName === 'fotosEstadoCuentaImpuesto') {
      fotoUrl = this.fotosEstadoCuentaImpuesto[index];
    } else if (fieldName === 'fotosSimitPropietario') {
      fotoUrl = this.fotosSimitPropietario[index];
    } else if (fieldName === 'fotosLiquidacionDeudaFinanciera') {
      fotoUrl = this.fotosLiquidacionDeudaFinanciera[index];
    } else if (fieldName === 'fotosTecnoMecanica') {
      fotoUrl = this.fotosTecnoMecanica[index];
    } else if (fieldName === 'fotosManifiestoFactura') {
      fotoUrl = this.fotosManifiestoFactura[index];
    } else if (fieldName === 'fotosSoatIniciales') {
      fotoUrl = this.fotosSoatIniciales[index];
    } else if (fieldName === 'fotosImpuestoAno') {
      fotoUrl = this.fotosImpuestoAno[index];
    } else if (fieldName === 'fotosOficioDesembargo') {
      fotoUrl = this.fotosOficioDesembargo[index];
    } else if (fieldName === 'fotosCopiaLlave') {
      fotoUrl = this.fotosCopiaLlave[index];
    } else if (fieldName === 'fotosGato') {
      fotoUrl = this.fotosGato[index];
    } else if (fieldName === 'fotosLlavePernos') {
      fotoUrl = this.fotosLlavePernos[index];
    } else if (fieldName === 'fotosCopaSeguridad') {
      fotoUrl = this.fotosCopaSeguridad[index];
    } else if (fieldName === 'fotosTiroArrastre') {
      fotoUrl = this.fotosTiroArrastre[index];
    } else if (fieldName === 'fotosHistorialMantenimiento') {
      fotoUrl = this.fotosHistorialMantenimiento[index];
    } else if (fieldName === 'fotosManual') {
      fotoUrl = this.fotosManual[index];
    } else if (fieldName === 'fotosPalomera') {
      fotoUrl = this.fotosPalomera[index];
    } else if (fieldName === 'fotosTapetes') {
      fotoUrl = this.fotosTapetes[index];
    } else if (fieldName === 'fotosLlantaRepuesto') {
      fotoUrl = this.fotosLlantaRepuesto[index];
    } else if (fieldName === 'fotosKitCarretera') {
      fotoUrl = this.fotosKitCarretera[index];
    } else if (fieldName === 'fotosAntena') {
      fotoUrl = this.fotosAntena[index];
    }

    // Mostrar mensaje de espera
    Swal.fire({
      title: 'Espere, por favor',
      text: 'Se está eliminando la imagen...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await this.http.delete(`${this.apiUrl}/api/deleteInventoryPhoto`, {
        body: { inventoryId: this.inventoryId, field: fieldName, photoUrl: fotoUrl }
      }).toPromise();

      if (fieldName === 'fotosCedulaPropietario') {
        this.fotosCedulaPropietario.splice(index, 1);
      } else if (fieldName === 'fotosTarjetaPropietario') {
        this.fotosTarjetaPropietario.splice(index, 1);
      } else if (fieldName === 'fotosSoat') {
        this.fotosSoat.splice(index, 1);
      } else if (fieldName === 'fotosCertificadoTradicion') {
        this.fotosCertificadoTradicion.splice(index, 1);
      } else if (fieldName === 'fotosEstadoCuentaImpuesto') {
        this.fotosEstadoCuentaImpuesto.splice(index, 1);
      } else if (fieldName === 'fotosSimitPropietario') {
        this.fotosSimitPropietario.splice(index, 1);
      } else if (fieldName === 'fotosLiquidacionDeudaFinanciera') {
        this.fotosLiquidacionDeudaFinanciera.splice(index, 1);
      } else if (fieldName === 'fotosTecnoMecanica') {
        this.fotosTecnoMecanica.splice(index, 1);
      } else if (fieldName === 'fotosManifiestoFactura') {
        this.fotosManifiestoFactura.splice(index, 1);
      } else if (fieldName === 'fotosSoatIniciales') {
        this.fotosSoatIniciales.splice(index, 1);
      } else if (fieldName === 'fotosImpuestoAno') {
        this.fotosImpuestoAno.splice(index, 1);
      } else if (fieldName === 'fotosOficioDesembargo') {
        this.fotosOficioDesembargo.splice(index, 1);
      } else if (fieldName === 'fotosCopiaLlave') {
        this.fotosCopiaLlave.splice(index, 1);
      } else if (fieldName === 'fotosGato') {
        this.fotosGato.splice(index, 1);
      } else if (fieldName === 'fotosLlavePernos') {
        this.fotosLlavePernos.splice(index, 1);
      } else if (fieldName === 'fotosCopaSeguridad') {
        this.fotosCopaSeguridad.splice(index, 1);
      } else if (fieldName === 'fotosTiroArrastre') {
        this.fotosTiroArrastre.splice(index, 1);
      } else if (fieldName === 'fotosHistorialMantenimiento') {
        this.fotosHistorialMantenimiento.splice(index, 1);
      } else if (fieldName === 'fotosManual') {
        this.fotosManual.splice(index, 1);
      } else if (fieldName === 'fotosPalomera') {
        this.fotosPalomera.splice(index, 1);
      } else if (fieldName === 'fotosTapetes') {
        this.fotosTapetes.splice(index, 1);
      } else if (fieldName === 'fotosLlantaRepuesto') {
        this.fotosLlantaRepuesto.splice(index, 1);
      } else if (fieldName === 'fotosKitCarretera') {
        this.fotosKitCarretera.splice(index, 1);
      } else if (fieldName === 'fotosAntena') {
        this.fotosAntena.splice(index, 1);
      }

      // Muestra el mensaje de eliminación
      this.deleteMessageIndex = index;
      this.deleteMessageField = fieldName;

      // Oculta el mensaje después de un tiempo
      setTimeout(() => {
        this.deleteMessageIndex = null;
        this.deleteMessageField = null;
        this.cdr.detectChanges();
      }, 2000); // Duración del mensaje en milisegundos

      // Cerrar el mensaje de espera
      Swal.close();

      // Registrar la actividad
      this.sendActivityLog({
        type: 'fileDelete',
        fieldName: fieldName,
        value: fotoUrl
      });

      this.cdr.detectChanges();
    } catch (error: any) {
      // Manejo del error
      Swal.close();
      console.error("Error al eliminar la foto!", error);
    }
  }

  triggerFileInput(fieldName: string) {
    const fileInput = document.getElementById(fieldName) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  splif(url: any) {
    return url.split('/').pop();
  }

  actualizarCarrocerias(claseSeleccionada: string): void {
    this.carroceriasFiltradas = this.tipo
      .filter(t => t.clase === claseSeleccionada)
      .map(t => t.carroceria)
      .sort((a, b) => a.localeCompare(b));

    //this.vehiculoForm.get('carroceria')?.setValue('');
  }

  onPreviewImgVehicle(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImgVeh = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
      this.selectedFile = input.files[0];
    }
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

  isImage(file: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const extension = file.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  funcionCliente() {
    if (this.crearCliente) {
      this.crearCliente = false;
    } else {
      this.crearCliente = true;
    }
  }

  funcionVehiculo() {
    if (this.crearVehiculo) {
      this.crearVehiculo = false;
    } else {
      this.crearVehiculo = true;
    }
  }

  siNitActivar2() {
    const tipoIdentificacion = this.clienteForm.get('tipoIdentificacion')?.value;

    if (tipoIdentificacion === 'NIT.') {
      this.ocultar2 = true;
    } else {
      this.ocultar2 = false;
    }
  }

  calcularCodigoVerificacion(): any {
    let nit = this.clienteForm.get('numeroIdentificacion')?.value;
    let vpri = new Array(16);
    let x = 0;
    let y = 0;
    let z = nit.length;

    nit = nit.replace(/\s/g, "");
    nit = nit.replace(/,/g, "");
    nit = nit.replace(/\./g, "");
    nit = nit.replace(/-/g, "");

    if (isNaN(Number(nit))) {
      return null;
    }

    vpri = [0, 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

    for (let i = 0; i < z; i++) {
      y = Number(nit.substr(i, 1));
      x += (y * vpri[z - i]);
    }

    y = x % 11;

    let resultado = y > 1 ? 11 - y : y;

    this.clienteForm.get('digitoVerificacion')?.setValue(resultado);
  }

  async guardarCliente() {
    if (this.clienteForm.valid) {
      this.convertirAMayusculasExceptoEmail(this.clienteForm);
      try {
        const response = await this.clientsService.createClients(this.clienteForm.getRawValue()).toPromise();
        this.clients = response;
        this.mostrarSiguienteModal = true;

        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Cliente creado con éxito',
          showConfirmButton: false,
          timer: 1500
        });

      } catch (error: any) {
        if (error.status === 409 && error.error && error.error.message === 'El número de identificación ya existe en la base de datos.') {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'El número de identificación ya existe. Verifique la información!',
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error al crear el cliente, verifique la información!',
          });
        }
      }
    } else {
      Object.values(this.clienteForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  async guardarVehiculo() {
    if (this.vehiculoForm.valid) {
      this.convertirAMayusculasExceptoLink(this.vehiculoForm);

      const formData = new FormData();
      for (const key in this.vehiculoForm.value) {
        if (key !== 'imagenVehiculo') {
          formData.append(key, this.vehiculoForm.value[key]);
        }
      }
      const fileInput = document.getElementById('imagenVehiculo') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append('imagenVehiculo', fileInput.files[0]);
      }

      try {
        const response = await this.vehiclesService.createVehicles(formData).toPromise();
        this.vehiculo = response;
        this.mostrarSiguienteModal2 = true;

        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Vehículo creado con éxito',
          showConfirmButton: false,
          timer: 1500
        });

      } catch (error: any) {
        if (error.status === 409 && error.error && error.error.message === 'La placa ya existe en la base de datos.') {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'La placa ya existe. Verifique la información!',
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error al crear el vehículo, verifique la información!',
          });
        }
      }
    } else {
      Object.values(this.vehiculoForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  convertirAMayusculasExceptoLink(formulario: FormGroup) {
    Object.keys(formulario.controls).forEach(key => {
      if (key !== 'imagenVehiculo' && key !== 'ciudadPlaca' && key !== 'observaciones') {
        let valor = formulario.get(key)?.value;
        if (typeof valor === 'string') {
          formulario.get(key)?.setValue(valor.toUpperCase());
        }
      }
    });
  }

  convertirAMayusculasExceptoEmail(formulario: FormGroup) {
    Object.keys(formulario.controls).forEach(key => {
      if (key !== 'correoElectronico' && key !== 'ciudadIdentificacion' && key !== 'ciudadResidencia') {
        let valor = formulario.get(key)?.value;
        if (typeof valor === 'string') {
          formulario.get(key)?.setValue(valor.toUpperCase());
        }
      }
    });
  }

  limpiarVehiculo() {
    this.vehiculoForm.reset();

    this.previewImgVeh = '';
    this.placaBusqueda = '';
  }

  limpiarCliente() {
    this.clienteForm.reset({
      tipoIdentificacion: 'C.C.',
      fechaIngreso: this.fechaActual
    });
    this.btnChange = false;
  }

  buscarPreInventarioPlaca() {
    const placa = this.vehiculoInvControl.value;
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/preinventarios/${placa}`).subscribe(
      data => {
        this.preInventarios = data.map(inventario => {
          const fechaCreacion = new Date(inventario.createdAt);
          const day = fechaCreacion.getDate();
          const monthIndex = fechaCreacion.getMonth();
          const year = fechaCreacion.getFullYear();
          const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

          return {
            _id: inventario._id,
            inventoryId: inventario.inventoryId,
            createdAt: formattedDate,
            primerNombreCliente: inventario.primerNombreCliente,
            primerApellidoCliente: inventario.primerApellidoCliente,
            numeroIdentificacionCliente: inventario.numeroIdentificacionCliente
          };
        }).sort((a: any, b: any) => b.inventoryId - a.inventoryId);

        if (this.preInventarios.length === 0) {
          Swal.fire({
            icon: "error",
            title: "No encontrado",
            text: "No se encontraron pre-inventarios para esta placa",
          });
        }
      },
      error => {
        Swal.fire({
          icon: "error",
          title: "No encontrado",
          text: "El vehículo no existe",
        });
        this.preInventarios = [];
      }
    );
  }

  migrarPreInventario(selectedPreInventoryId: string) {
    this.http.post(`${this.apiUrl}/api/inventories/migrate/${selectedPreInventoryId}`, {}).subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: 'Migración exitosa',
          text: 'El pre-inventario ha sido migrado al inventario real',
        });
        this.preInventarios = [];
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Error en la migración',
          text: 'Hubo un problema al migrar el pre-inventario',
        });
      }
    );
  }

  openConfirmMigrationModal(preInventoryId: string) {
    Swal.fire({
      title: 'Confirmar Migración',
      text: 'Existen pre-inventarios para esta placa. ¿Desea migrar el pre-inventario al inventario real? Al migrar el pre-inventario, este será eliminado de la base de datos de pre-inventarios.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Migrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.migrarPreInventario(preInventoryId);
      }
    });
  }

  onFileChange(fieldName: string, event: any) {
    if (this.esActualizar) {
      const files = Array.from(event.target.files).map((file: any) => file.name);
      this.sendActivityLog({
        type: 'file',
        fieldName: fieldName,
        value: files
      });
    }
  }

  formatFecha(fecha: string): string {
    const date = parseISO(fecha);
    const now = new Date();
    const distancia = formatDistanceToNow(date, { locale: es });

    if (date.getFullYear() !== now.getFullYear()) {
      return format(date, 'dd, MMMM - yyyy', { locale: es });
    }

    return distancia;
  }

  sendActivityLog(activity: { type: string, fieldName: string, value: any }) {
    const logValue = typeof activity.value === 'object' ? JSON.stringify(activity.value) : activity.value;

    const newActivity = this.createActivityLogEntry(activity.type, activity.fieldName, logValue);

    const inventoryId = this.inventoryId;
    this.http.post(`${this.apiUrl}/api/inventories/addActivityLog/${inventoryId}`, newActivity)
      .subscribe({
        next: (response: any) => {
          this.registroActividad = response.registroActividad.reverse();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al registrar la actividad:', error);
        }
      });
  }


  createActivityLogEntry(type: string, fieldName: string, value: any): any {
    const user = this.datosUser.nombre;
    const image = this.datosUser.image;
    let descripcion = '';

    if (fieldName === 'obsFase3') {
      descripcion = `${user} modificó la observación de la Fase 3 a "${value}"`;
    } else if (fieldName === 'observacionGlobal') {
      descripcion = `${user} modificó la observación global a "${this.observacionGlobal}"`;
    } else if (fieldName.endsWith('Obs')) {
      const fieldNameWithoutObs = fieldName.slice(0, -3);
      descripcion = `${user} modificó la observación del ${this.getFieldDisplayName(fieldNameWithoutObs)} a "${value}"`;
    } else if (fieldName.startsWith('check')) {
      const fieldNameWithoutCheck = fieldName.slice(5);
      const estado = value ? 'activó' : 'desactivó';
      descripcion = `${user} ${estado} el ${this.getFieldDisplayName(fieldNameWithoutCheck)}`;
    } else if (type === 'select') {
      descripcion = `${user} modificó ${this.getFieldDisplayName(fieldName)} a "${value}"`;
    } else if (type === 'file') {
      descripcion = `${user} agregó un archivo en ${this.getFieldDisplayName(fieldName)}`;
    } else if (type === 'fileDelete') {
      descripcion = `${user} eliminó un archivo de ${this.getFieldDisplayName(fieldName)}`;
    } else {
      descripcion = `${user} modificó ${this.getFieldDisplayName(fieldName)} a "${value}"`;
    }

    return { type, fieldName, value, image, descripcion, fecha: new Date() };
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldDisplayNames: Record<string, string> = {
      organizacion: 'Organización',
      tipoNegocio: 'Tipo Negocio',
      proveedor: 'Proveedor',
      estadoInventario: 'Estado Inventario',
      fechaIngreso: 'Fecha Ingreso',
      ubicacion: 'Ubicación',
      tallerProveedor: 'Taller Proveedor',
      fechaExpedicion: 'Fecha Expedición',
      obsFase3: 'Observación Fase 3',
      copiaLlave: 'Copia Llave',
      valorCompraLetras: 'Valor Compra Letras',
      valorCompraNumero: 'Valor Compra Número',
      fechaEntrega: 'Fecha Entrega',
      fechaAsignacion: 'Fecha Asignación',
      valorAutomagno: 'Valor Automagno',
      valorContrato: 'Valor Contrato',
      pagoFinanciera: 'Pago Financiera',
      retefuenteT: 'Retefuente T',
      garantiaMobiliaria: 'Garantía Mobiliaria',
      impuestos: 'Impuestos',
      soat: 'SOAT',
      revTecnoMeca: 'Revisión Técnico Mecánica',
      comparendos: 'Comparendos',
      documentacion: 'Documentación',
      manifiestoFactura: 'Manifiesto Factura',
      semaforizacion: 'Semaforización',
      traspaso: 'Traspaso',
      checkTraspaso: 'Check Traspaso',
      provTraspaso: 'Proveedor Traspaso',
      servicioFueraBogota: 'Servicio Fuera de Bogotá',
      checkServicioFueraBogota: 'Check Servicio Fuera de Bogotá',
      provServicioFueraBogota: 'Proveedor Servicio Fuera de Bogotá',
      retefuenteS: 'Retefuente S',
      checkRetefuenteS: 'Check Retefuente S',
      provRetefuenteS: 'Proveedor Retefuente S',
      levantaPrenda: 'Levantamiento de Prenda',
      checkLevantaPrenda: 'Check Levantamiento de Prenda',
      provLevantaPrenda: 'Proveedor Levantamiento de Prenda',
      checkGarantiaMobiliaria: 'Check Garantía Mobiliaria',
      provGarantiaMobiliaria: 'Proveedor Garantía Mobiliaria',
      checkImpuestos: 'Check Impuestos',
      provImpuestos: 'Proveedor Impuestos',
      liquidacionImpuesto: 'Liquidación Impuesto',
      checkLiquidacionImpuesto: 'Check Liquidación Impuesto',
      provLiquidacionImpuesto: 'Proveedor Liquidación Impuesto',
      derechosMunicipales: 'Derechos Municipales',
      checkDerechosMunicipales: 'Check Derechos Municipales',
      provDerechosMunicipales: 'Proveedor Derechos Municipales',
      checkSoat: 'Check SOAT',
      provSoat: 'Proveedor SOAT',
      checkRevTecnoMeca: 'Check Revisión Técnico Mecánica',
      provRevTecnoMeca: 'Proveedor Revisión Técnico Mecánica',
      checkComparendos: 'Check Comparendos',
      provComparendos: 'Proveedor Comparendos',
      documentosIniciales: 'Documentos Iniciales',
      checkDocumentosIniciales: 'Check Documentos Iniciales',
      provDocumentosIniciales: 'Proveedor Documentos Iniciales',
      checkDocumentacion: 'Check Documentación',
      provDocumentacion: 'Proveedor Documentación',
      checkManifiestoFactura: 'Check Manifiesto Factura',
      provManifiestoFactura: 'Proveedor Manifiesto Factura',
      ctci: 'CTCI',
      checkCtci: 'Check CTCI',
      provCtci: 'Proveedor CTCI',
      checkSemaforizacion: 'Check Semaforización',
      provSemaforizacion: 'Proveedor Semaforización',
      impuestoAnoActual: 'Impuesto Año Actual',
      checkImpuestoAnoActual: 'Check Impuesto Año Actual',
      provImpuestoAnoActual: 'Proveedor Impuesto Año Actual',
      camposExtrasSalida: 'Campos Extras Salida',
      total: 'Total',
      comisionBruta: 'Comisión Bruta',
      comisionNeta: 'Comisión Neta',
      valorNetoVehiculo: 'Valor Neto Vehículo',
      lugar: 'Lugar',
      estado: 'Estado',
      numeroInspeccion: 'Número de Inspección',
      linkInspeccion: 'Link de Inspección',
      impronta: 'Impronta',
      contratoVenta: 'Contrato de Venta',
      funt: 'FUNT',
      mandato: 'Mandato',
      copiaCedulaPropietario: 'Copia Cédula Propietario',
      copiaTarjetaPropietario: 'Copia Tarjeta Propietario',
      copiaSoat: 'Copia SOAT',
      copiaTecnicoMecanica: 'Copia Técnico Mecánica',
      copiaGeneralAutenticado: 'Copia General Autenticado',
      link: 'Link',
      ciudadPlaca: 'Ciudad Placa',
      certificadoTradicion: 'Certificado de Tradición',
      estadoCuentaImpuesto: 'Estado de Cuenta Impuesto',
      estadoCuentaImpuestoValor: 'Valor Estado de Cuenta Impuesto',
      simitPropietario: 'SIMIT Propietario',
      simitPropietarioValor: 'Valor SIMIT Propietario',
      liquidacionDeudaFin: 'Liquidación Deuda Financiación',
      liquidacionDeudaFinValor: 'Valor Liquidación Deuda Financiación',
      estadoTecnicoMecanica: 'Estado Técnico Mecánica',
      dateTecnicoMecanica: 'Fecha Técnico Mecánica',
      estadoValorTotalSoat: 'Valor Total SOAT',
      totalSoatValor: 'Total Valor SOAT',
      fechaFinSoat: 'Fecha Fin SOAT',
      estadoImpAnoEnCurso: 'Estado Impuesto Año en Curso',
      impAnoEnCursoValor: 'Valor Impuesto Año en Curso',
      estadoValorRetencion: 'Valor Retención',
      valorRetencionValor: 'Valor Retención',
      entidadDeudaFinan: 'Entidad Deuda Financiera',
      numeroObligacionFinan: 'Número Obligación Financiera',
      fechaLimitePagoDeudaFinan: 'Fecha Límite Pago Deuda Financiera',
      descripcionPago1: 'Descripción Pago 1',
      formaPagoPago1: 'Forma de Pago 1',
      entidadDepositarPago1: 'Entidad a Depositar Pago 1',
      numeroCuentaObligaPago1: 'Número Cuenta Obligación Pago 1',
      tipoCuentaPago1: 'Tipo Cuenta Pago 1',
      beneficiarioPago1: 'Beneficiario Pago 1',
      idBeneficiarioPago1: 'ID Beneficiario Pago 1',
      fechaPago1: 'Fecha Pago 1',
      valorPago1: 'Valor Pago 1',
      descripcionPago2: 'Descripción Pago 2',
      formaPagoPago2: 'Forma de Pago 2',
      entidadDepositarPago2: 'Entidad a Depositar Pago 2',
      numeroCuentaObligaPago2: 'Número Cuenta Obligación Pago 2',
      tipoCuentaPago2: 'Tipo Cuenta Pago 2',
      beneficiarioPago2: 'Beneficiario Pago 2',
      idBeneficiarioPago2: 'ID Beneficiario Pago 2',
      fechaPago2: 'Fecha Pago 2',
      valorPago2: 'Valor Pago 2',
      descripcionPago3: 'Descripción Pago 3',
      formaPagoPago3: 'Forma de Pago 3',
      entidadDepositarPago3: 'Entidad a Depositar Pago 3',
      numeroCuentaObligaPago3: 'Número Cuenta Obligación Pago 3',
      tipoCuentaPago3: 'Tipo Cuenta Pago 3',
      beneficiarioPago3: 'Beneficiario Pago 3',
      idBeneficiarioPago3: 'ID Beneficiario Pago 3',
      fechaPago3: 'Fecha Pago 3',
      valorPago3: 'Valor Pago 3',
      descripcionPago4: 'Descripción Pago 4',
      formaPagoPago4: 'Forma de Pago 4',
      entidadDepositarPago4: 'Entidad a Depositar Pago 4',
      numeroCuentaObligaPago4: 'Número Cuenta Obligación Pago 4',
      tipoCuentaPago4: 'Tipo Cuenta Pago 4',
      beneficiarioPago4: 'Beneficiario Pago 4',
      idBeneficiarioPago4: 'ID Beneficiario Pago 4',
      fechaPago4: 'Fecha Pago 4',
      asesorComercial: 'Asesor Comercial',
      telefonoAsesor: 'Teléfono Asesor',
      correoAsesor: 'Correo Asesor',
      gestorDocumental: 'Gestor Documental',
      telefonoGestor: 'Teléfono Gestor',
      correoGestor: 'Correo Gestor',
      kilometraje: 'Kilometraje',
      horaRecepcion: 'Hora Recepción',
      fechaTecnicoMecanica: 'Fecha Técnico Mecánica',
      cobraHonorarios: 'Cobra Honorarios',
      promedioImpuesto: 'Promedio Impuesto',
      promediaSoat: 'Promedia SOAT',
      ultimoKilometraje: 'Último Kilometraje',
      lugarUltimoMantenimiento: 'Lugar del Último Mantenimiento',
      fechaUltimoMantenimiento: 'Fecha del Último Mantenimiento',
      fotosCedulaPropietario: 'Cédula Propietario',
      fotosOficioDesembargo: 'Oficio de Desembargo',
      fotosTarjetaPropietario: 'Tarjeta Propietario',
      fotosSoat: 'SOAT',
      fotosCertificadoTradicion: 'Certificado Tradición',
      fotosEstadoCuentaImpuesto: 'Estado Cuenta Impuesto',
      fotosSimitPropietario: 'Simit Propietario',
      fotosLiquidacionDeudaFinanciera: 'Liquidación Deuda Financiera',
      fotosTecnoMecanica: 'Tecno-Mecánica',
      fotosManifiestoFactura: 'Manifiesto y Factura',
      fotosSoatIniciales: 'SOAT',
      fotosImpuestoAno: 'Impuesto Año',
      fotosCopiaLlave: 'Copia Llave',
      fotosGato: 'Gato',
      fotosLlavePernos: 'Llave Pernos',
      fotosCopaSeguridad: 'Copa Seguridad',
      fotosTiroArrastre: 'Tiro de Arrastre',
      fotosHistorialMantenimiento: 'Historial de Mantenimiento',
      fotosManual: 'Manual',
      fotosPalomera: 'Palomera',
      fotosTapetes: 'Tapetes',
      fotosLlantaRepuesto: 'Llanta de Repuesto',
      fotosKitCarretera: 'Kit de Carretera',
      fotosAntena: 'Antena'
    };

    return fieldDisplayNames[fieldName] || fieldName;
  }
  onUbicacionChange(ubicacion: any) {
    this.isVitrinaSelected = (ubicacion === 'AUTOMAGNO VITRINA');
  }
  sendEmail() {
    const emailData = {
      subject: 'El vehiculo ' + this.vehiculo.marca + ' ' + this.vehiculo.linea + ' ' + this.vehiculo.version + ' Modelo: ' + this.vehiculo.modelo + ' esta en vitrina',
      body: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notificación de Vehículo en Vitrina</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #DE1425;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                    line-height: 1.6;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    background-color: #f1f1f1;
                }
                .footer p {
                    margin: 0;
                }
                .highlight {
                    font-weight: bold;
                    color: #121820;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Notificación de Vehículo en Vitrina</h1>
                </div>
                <div class="content">
                    <p>El vehículo <span class="highlight">${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version}</span> 
                    <br>Modelo: ${this.vehiculo.modelo} 
                    <br>Con placa:<span class="highlight"> ${this.vehiculo.placa}</span> está en vitrina.</p>
                    <p>Está listo para realizar el control de accesorios.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Automagno. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    this.http.post(`${this.apiUrl}/api/send-email`, emailData).subscribe(
      response => {
        alert('Mensaje Enviado')
      },
      error => {
        console.error('Error al enviar el correo:', error);
      }
    );
  }
}