import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ClientsService } from 'src/app/services/clients.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, Subscription, map, of, startWith } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CurrencyService } from 'src/app/services/currency.service';
import { NavigationStart, Router } from '@angular/router';
import { ConversionService } from 'src/app/services/conversion.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { environment } from 'src/app/environments/environment';
declare var bootstrap: any;
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css',
})
export class VentasComponent implements OnInit, OnDestroy {
  lugares!: any[];
  loading = false;
  suppliers!: any[];
  users!: any[];
  fechaActual: string;
  fechaActual2: string;
  anoActual: string;
  placaValue = '';
  archivoDigital = '';
  esCruce: boolean = false;
  separacion: boolean = false;
  initialValues: { [key: string]: any } = {};

  placaBusqueda = '';
  tramitadores!: any[];
  inventarios: any[] = [];
  private modalInstance: any;
  buscarInventarioForm: FormGroup;
  honorariosAutomagno: any;
  variables!: any[];
  inventoryId: string = '';
  filtroBDForm: FormGroup;
  cruceDocumentalForm: FormGroup;
  btnChange = false;
  vehiculo: any = {};

  datosUser: any;
  loggedIn: boolean = false;
  registroActividad: any;


  fotosCertificadoTradicion: string[] = [];
  fotosEstadoCuentaImpuesto: string[] = [];
  fotosSimitPropietario: string[] = [];
  fotosLiquidacionDeudaFinanciera: string[] = [];
  fotosTecnoMecanica: string[] = [];
  fotosManifiestoFactura: string[] = [];
  fotosSoatIniciales: string[] = [];
  fotosImpuestoAno: string[] = [];
  fotosOficioDesembargo: string[] = [];
  fotosReciboCaja: string[] = [];

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
  ver12: boolean = false;

  showModal: boolean = false;
  imagenesModal: string[] = [];
  imagenSeleccionadaIndex: number = 0;
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

  ciudadPlaca: any;
  clients: any = {};
  comprador: any = {};
  compradorTwo: any = {};
  isLoading: boolean = false;
  button1: boolean = false;
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
  valorPago1Actual: number = 0;
  valorPago2Actual: number = 0;
  valorPago3Actual: number = 0;
  verCiudadSelect: boolean = false;
  selectedUserPhone: string = '';
  selectedUserEmail: string = '';
  usuariosGestores: any[] = [];
  selectedUserPhone2: string = '';
  selectedUserEmail2: string = '';
  usuariosAsesor: any[] = [];
  mostrarSiguienteModal: boolean = false;
  mostrarSiguienteModal2: boolean = false;
  mostrarSiguienteModal3: boolean = false;
  formaPagoVentaForm: FormGroup;
  peritajeImprontasForm: FormGroup;

  allClients: any[] = [];
  clienteControl = new FormControl();
  opcionesFiltradas: Observable<any[]> = of([]);
  private apiUrl = environment.apiUrl;

  allVehicles: any[] = [];
  vehiculoInvControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  allVehiclesInv: any[] = [];
  vehiculoInvOneControl = new FormControl();
  opcionesFiltradasVehInv: Observable<any[]> = of([]);

  documentosValoresInicialesForm: FormGroup;
  deudaFinancieraForm: FormGroup;
  obsFase3VentaForm: FormGroup;
  controlAccesoriosForm: FormGroup;
  formasdePagoVentaForm2: FormGroup;
  liquidacionesVentaForm: FormGroup;
  generadorContratosVentasForm: FormGroup;
  tramitesCruceForm: FormGroup;
  tramitesVentasForm: FormGroup;
  provicionTramitesVentasForm: FormGroup;
  variablesLiquidacionVentasForm: FormGroup;
  formattedValue: string = '';
  formattedValueClausula: string = '';
  formattedValue2: string = '';
  formattedValueClausula2: string = '';
  clausulaPenal: any;
  letrasValueClausula: any;
  clausulaPenal2: any;
  valorOfertado: any;
  costosTramites!: any[];
  traspaso50: any;
  subscription: Subscription;
  honorariosTramitador: any;
  diasDevolucionImpuesto: any;
  traspasoNeto: any;
  valorTotalCliente: any;
  private subscriptions: Subscription[] = [];
  btnEsconder: Boolean = false;
  monthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  manejoEnvioAutomango: number = 12000;
  private routerSubscription: Subscription;
  observacionGlobal: string = '';

  constructor(
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
    private formBuilder: FormBuilder
  ) {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeAllModals();
      }
    });

    this.subscription = this.sharedData.currentInventoryId.subscribe({
      next: (id) => {
        if (id) {
          this.irAlInventario(id);
        }
      },
      error: (err) => console.error('Error al recibir inventoryId', err),
    });

    this.fechaActual = new Date().toISOString().substring(0, 10);
    this.fechaActual2 = new Date().toISOString().substring(0, 4);
    this.anoActual = this.fechaActual2 + '-12-31';
    const fechaActualDate = new Date(this.fechaActual);
    const anoActualDate = new Date(this.anoActual);

    let resta = anoActualDate.getTime() - fechaActualDate.getTime();
    this.diasDevolucionImpuesto = resta / (1000 * 3600 * 24);

    this.buscarInventarioForm = this.formBuilder.group({
      buscarInventario: ['', Validators.required],
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

    this.obsFase3VentaForm = this.formBuilder.group({
      obsFase3Venta: ['', Validators.required],
    });

    this.formaPagoVentaForm = this.formBuilder.group({
      valorVentaLetras: ['', Validators.required],
      valorVentaNumero: ['', Validators.required],
      clausulaPenalLetras: ['', Validators.required],
      clausulaPenalNumeros: [{ value: '', disabled: false }],
      fechaEntrega: ['', Validators.required],
      fechaVenta: ['', Validators.required],
    });

    this.peritajeImprontasForm = this.formBuilder.group({
      lugar: [''],
      estado: [''],
      numeroInspeccion: [''],
      linkInspeccion: [''],
      impronta: [''],
    });

    this.documentosValoresInicialesForm = this.formBuilder.group({
      ciudadPlaca: [{ value: '', disabled: true }],
      certificadoTradicion: [{ value: '', disabled: true }],
      oficioDesembargo: [{ value: '', disabled: true }],
      estadoCuentaImpuesto: [{ value: '', disabled: true }],
      estadoCuentaImpuestoValor: [{ value: '$ 0', disabled: true }],
      simitPropietario: [{ value: '', disabled: true }],
      simitPropietarioValor: [{ value: '$ 0', disabled: true }],
      liquidacionDeudaFin: [{ value: '', disabled: true }],
      liquidacionDeudaFinValor: [{ value: '$ 0', disabled: true }],
      estadoTecnicoMecanica: [{ value: '', disabled: true }],
      dateTecnicoMecanica: [{ value: '', disabled: true }],
      manifiestoFactura: [{ value: '', disabled: true }],
      estadoValorTotalSoat: [{ value: '', disabled: true }],
      totalSoatValor: [{ value: '$ 0', disabled: true }],
      fechaFinSoat: [{ value: '', disabled: true }],
      estadoImpAnoEnCurso: [{ value: '', disabled: true }],
      impAnoEnCursoValor: [{ value: '$ 0', disabled: true }],
      estadoValorRetencion: [{ value: '', disabled: true }],
      valorRetencionValor: [{ value: '$ 0', disabled: true }],
      reciboCaja: [{ value: '', disabled: false }]
    });

    this.deudaFinancieraForm = this.formBuilder.group({
      entidadDeudaFinan: [{ value: '', disabled: true }],
      numeroObligacionFinan: [{ value: '', disabled: true }],
      fechaLimitePagoDeudaFinan: [{ value: '', disabled: true }],
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
      fechaUltimoMantenimiento: [{ value: '', disabled: false }],
      llantaRepuesto: [{ value: '', disabled: false }],
      llantaRepuestoObs: [{ value: '', disabled: false }],
      kitCarretera: [{ value: '', disabled: false }],
      kitCarreteraObs: [{ value: '', disabled: false }],
      antena: [{ value: '', disabled: false }],
      antenaObs: [{ value: '', disabled: false }],
    });

    this.formasdePagoVentaForm2 = this.formBuilder.group({
      descripcionPago12: [''],
      formaPagoPago12: [''],
      entidadDepositarPago12: [''],
      numeroCuentaObligaPago12: [''],
      tipoCuentaPago12: [''],
      beneficiarioPago12: [''],
      idBeneficiarioPago12: [''],
      fechaPago12: [''],
      valorPago12: [''],
      descripcionPago22: [''],
      formaPagoPago22: [''],
      entidadDepositarPago22: [''],
      numeroCuentaObligaPago22: [''],
      tipoCuentaPago22: [''],
      beneficiarioPago22: [''],
      idBeneficiarioPago22: [''],
      fechaPago22: [''],
      valorPago22: [''],
      descripcionPago32: [''],
      formaPagoPago32: [''],
      entidadDepositarPago32: [''],
      numeroCuentaObligaPago32: [''],
      tipoCuentaPago32: [''],
      beneficiarioPago32: [''],
      idBeneficiarioPago32: [''],
      fechaPago32: [''],
      valorPago32: [''],
      descripcionPago42: [''],
      formaPagoPago42: [''],
      entidadDepositarPago42: [''],
      numeroCuentaObligaPago42: [''],
      tipoCuentaPago42: [''],
      beneficiarioPago42: [''],
      idBeneficiarioPago42: [''],
      fechaPago42: [''],
      valorPago42: [{ value: '', disabled: true }],
    });

    this.liquidacionesVentaForm = this.formBuilder.group({
      traspaso: [{ value: '$ 0', disabled: true }],
      inscripcionPrenda: [{ value: '$ 0', disabled: true }],
      comparendos: [{ value: '$ 0', disabled: true }],
      proporcionalImpAnoCurso: [{ value: '$ 0', disabled: true }],
      devolucionSoat: [{ value: '$ 0', disabled: true }],
      honorariosIvaIncluido: [{ value: '$ 0', disabled: true }],
      retencionFuente: [{ value: '$ 0', disabled: true }],
      traspasoNeto: [{ value: '$ 0', disabled: true }],
      soat: [{ value: '', disabled: true }],
      impuestoAnoCurso: [{ value: '$ 0', disabled: true }],
      inscripcionPrenda2: [{ value: '$ 0', disabled: true }],
      comparendos2: [{ value: '$ 0', disabled: true }],
      tomaImprontas: [{ value: '$ 0', disabled: true }],
      manejoEnvioAutomango: [
        { value: this.formatSalary(this.manejoEnvioAutomango), disabled: true },
      ],
      trasladoCuenta: [{ value: '$ 0', disabled: true }],
      radicacionCuenta: [{ value: '$ 0', disabled: true }],
      honorariosTramitador: [{ value: '$ 0', disabled: true }],
      totalDocumentacion: [{ value: '$ 0', disabled: true }],
      totalProvision: [{ value: '$ 0', disabled: true }],
    });

    this.cruceDocumentalForm = this.formBuilder.group({
      esCruce: [{ value: false, disabled: false }],
      numInventario: [{ value: '', disabled: false }],
      placa: [{ value: '', disabled: true }],
      ciudad: [{ value: '', disabled: true }],
      traspaso: [{ value: '$ 0', disabled: true }],
      retencion: [{ value: '$ 0', disabled: true }],
      otrosImpuestos: [{ value: '$ 0', disabled: true }],
      levantamientoPrenda: [{ value: '$ 0', disabled: true }],
      comparendos: [{ value: '$ 0', disabled: true }],
      propImpAnoEnCurso: [{ value: '$ 0', disabled: true }],
      devolucionSoat: [{ value: '', disabled: true }],
      totalRetoma: [{ value: '$ 0', disabled: true }],
      totalVentaRetoma: [{ value: '$ 0', disabled: true }],
      placaActual: [{ value: '', disabled: true }],
      ciudadActual: [{ value: '', disabled: true }],
      traspasoActual: [{ value: '$ 0', disabled: true }],
      inscripcionPrendaActual: [{ value: '$ 0', disabled: true }],
      trasladoCuentaActual: [{ value: '$ 0', disabled: true }],
      radicacionCuentaActual: [{ value: '$ 0', disabled: true }],
      comparendosComprador: [{ value: '$ 0', disabled: true }],
      propImpAnoEnCursoActual: [{ value: '$ 0', disabled: true }],
      propSoat: [{ value: '$ 0', disabled: true }],
      honorariosIvaIncluido: [{ value: '$ 0', disabled: true }],
      totalDocumentacionActual: [{ value: '$ 0', disabled: true }],
    });

    this.generadorContratosVentasForm = this.formBuilder.group({
      asesorComercial: ['', Validators.required],
      telefonoAsesor: [{ value: '', disabled: true }],
      correoAsesor: [{ value: '', disabled: true }],
      gestorDocumental: ['', Validators.required],
      telefonoGestor: [{ value: '', disabled: true }],
      correoGestor: [{ value: '', disabled: true }],
      kilometraje: ['', Validators.required],
      horaRecepciom: [''],
      fechaTecnicoMecanica: ['', Validators.required],
      empresa: [''],
      numeroInspeccion: [''],
      garantia: ['', Validators.required],
      tiempo: ['', Validators.required],
    });

    this.tramitesCruceForm = this.formBuilder.group({
      tramites: this.formBuilder.array([]),
    });

    this.tramitesVentasForm = this.formBuilder.group({
      tramitesVentas: this.formBuilder.array([]),
    });

    this.provicionTramitesVentasForm = this.formBuilder.group({
      provicionTramitesVentas: this.formBuilder.array([]),
    });

    this.variablesLiquidacionVentasForm = this.formBuilder.group({
      cobraHonorarios: [true],
      promedioImpuesto: [true],
      promediaSoat: [true],
      traslado: [false],
      tieneCredito: [false],
      ciudadTraslado: [''],
      comparendosVariables: ['$ 0'],
      tomaImprontasVariables: ['$ 0'],
      entidadBancaria: [''],
      monto: ['$ 0'],
    });

    this.documentosValoresInicialesForm
      .get('liquidacionDeudaFinValor')
      ?.disable();
    this.documentosValoresInicialesForm
      .get('estadoCuentaImpuestoValor')
      ?.disable();
    this.documentosValoresInicialesForm.get('simitPropietarioValor')?.disable();
    this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.disable();
  }

  private removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  esCruceDocumental() {
    const esCruce = this.cruceDocumentalForm.get('esCruce')?.value;

    if (esCruce) {
      this.esCruce = true;
      this.cruceDocumentalForm
        .get('placaActual')
        ?.setValue(this.vehiculo.placa);
      this.cruceDocumentalForm
        .get('ciudadActual')
        ?.setValue(this.vehiculo.ciudadPlaca);
      this.cruceDocumentalForm
        .get('traspasoActual')
        ?.setValue(this.liquidacionesVentaForm.get('traspaso')?.value);
      this.cruceDocumentalForm
        .get('inscripcionPrendaActual')
        ?.setValue(this.liquidacionesVentaForm.get('inscripcionPrenda')?.value);
      this.cruceDocumentalForm
        .get('trasladoCuentaActual')
        ?.setValue(this.liquidacionesVentaForm.get('trasladoCuenta')?.value);
      this.cruceDocumentalForm
        .get('radicacionCuentaActual')
        ?.setValue(this.liquidacionesVentaForm.get('radicacionCuenta')?.value);
      this.cruceDocumentalForm
        .get('comparendosComprador')
        ?.setValue(this.liquidacionesVentaForm.get('comparendos')?.value);
      this.cruceDocumentalForm
        .get('propImpAnoEnCursoActual')
        ?.setValue(
          this.liquidacionesVentaForm.get('proporcionalImpAnoCurso')?.value
        );
      this.cruceDocumentalForm
        .get('propSoat')
        ?.setValue(this.liquidacionesVentaForm.get('devolucionSoat')?.value);
      this.cruceDocumentalForm
        .get('honorariosIvaIncluido')
        ?.setValue(
          this.liquidacionesVentaForm.get('honorariosIvaIncluido')?.value
        );

      let totalRetoma = 0;
      let totalDocumentacion = 0;

      const camposRetoma = [
        'traspaso',
        'retencion',
        'otrosImpuestos',
        'comparendos',
        'propImpAnoEnCurso',
        'devolucionSoat',
      ];
      camposRetoma.forEach((campo) => {
        const control = this.cruceDocumentalForm.get(campo);
        const valor = control?.value;

        if (control && valor !== null && valor !== undefined) {
          totalRetoma += this.desformatearMoneda(valor);
        }
      });

      const camposDocumentacion = [
        'traspasoActual',
        'inscripcionPrendaActual',
        'trasladoCuentaActual',
        'radicacionCuentaActual',
        'comparendosComprador',
        'propImpAnoEnCursoActual',
        'propSoat',
        'honorariosIvaIncluido',
      ];
      camposDocumentacion.forEach((campo) => {
        const control = this.cruceDocumentalForm.get(campo);
        const valor = control?.value;

        if (control && valor !== null && valor !== undefined) {
          totalDocumentacion += this.desformatearMoneda(valor);
        }
      });

      if (this.tramitesCruceForm.get('tramites')) {
        this.tramitesCruceForm
          .get('tramites')
          ?.value.forEach((tramite: any) => {
            const valor = this.desformatearMoneda(tramite.valor);
            if (!isNaN(valor)) {
              totalRetoma += valor;
            }
          });
      }

      if (this.tramitesVentasForm.get('tramitesVentas')) {
        this.tramitesVentasForm
          .get('tramitesVentas')
          ?.value.forEach((tramitesVenta: any) => {
            const valor = this.desformatearMoneda(tramitesVenta.valor);
            if (!isNaN(valor)) {
              totalDocumentacion += valor;
            }
          });
      }

      const formattedTotalDocumentacion = this.formatSalary(totalDocumentacion);
      const formattedTotalRetoma = this.formatSalary(totalRetoma);

      this.cruceDocumentalForm
        .get('totalRetoma')
        ?.setValue(formattedTotalRetoma);
      this.cruceDocumentalForm
        .get('totalDocumentacionActual')
        ?.setValue(formattedTotalDocumentacion);

      const totalNegocio = Math.abs(totalRetoma) + Math.abs(totalDocumentacion);
      this.cruceDocumentalForm
        .get('totalVentaRetoma')
        ?.setValue(this.formatSalary(totalNegocio));
    } else {
      this.esCruce = false;
    }
  }

  limpiarFormArrays() {
    this.limpiarFormArray(this.tramites);
    this.limpiarFormArray(this.tramitesVentas);
    this.limpiarFormArray(this.provicionTramitesVentas);
  }

  limpiarFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  limpiarFormularios() {
    this.btnEsconder = false;
    this.mostrarSiguienteModal = false;
    this.mostrarSiguienteModal2 = false;
    this.vehiculo = {};
    this.clients = {
      fechaIngreso: this.fechaActual,
    };
    this.comprador = {};
    this.compradorTwo = {};

    this.fotosCertificadoTradicion = [];
    this.fotosEstadoCuentaImpuesto = [];
    this.fotosSimitPropietario = [];
    this.fotosLiquidacionDeudaFinanciera = [];
    this.fotosTecnoMecanica = [];
    this.fotosManifiestoFactura = [];
    this.fotosSoatIniciales = [];
    this.fotosImpuestoAno = [];
    this.fotosOficioDesembargo = [];
    this.fotosReciboCaja = [];
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

    this.buscarInventarioForm.reset();
    this.filtroBDForm.reset();
    this.obsFase3VentaForm.reset();
    this.formaPagoVentaForm.reset();
    this.peritajeImprontasForm.reset();
    this.archivoDigital = '';
    this.documentosValoresInicialesForm.reset();
    this.deudaFinancieraForm.reset();
    this.controlAccesoriosForm.reset();
    this.formasdePagoVentaForm2.reset();
    this.liquidacionesVentaForm.reset();
    this.liquidacionesVentaForm
      .get('manejoEnvioAutomango')
      ?.setValue(this.formatSalary(this.manejoEnvioAutomango));
    this.generadorContratosVentasForm.reset();
    this.tramitesCruceForm.reset();
    this.tramitesVentasForm.reset();
    this.provicionTramitesVentasForm.reset();
    this.variablesLiquidacionVentasForm.reset();

    this.limpiarFormArray(this.tramitesVentas);
    this.limpiarFormArray(this.provicionTramitesVentas);

    this.cdr.detectChanges();

    this.valorTotalCliente = '$ 0';

    this.documentosValoresInicialesForm
      .get('liquidacionDeudaFinValor')
      ?.reset();
    this.documentosValoresInicialesForm
      .get('estadoCuentaImpuestoValor')
      ?.reset();
    this.documentosValoresInicialesForm.get('simitPropietarioValor')?.reset();
    this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.reset();

    this.limpiarFormArrays();

    this.generadorContratosVentasForm.reset();
  }

  calcularTodo() {
    this.obtenerTraslado();
    this.obtenerHonorariosIvaIncluido();
    this.obtenerValorSoatTotal();
    this.activarImpAnoEnCurso();
    this.obtenerCostoTraspaso50();
    this.calcularTotal();
    this.calcularTotalCliente();
  }

  calcularTotal() {
    let totalDocumentacionVentas = 0;
    let totalProvisionVentas = 0;

    const camposDocumentacion = [
      'traspaso',
      'inscripcionPrenda',
      'comparendos',
      'proporcionalImpAnoCurso',
      'devolucionSoat',
      'honorariosIvaIncluido',
      'trasladoCuenta',
      'radicacionCuenta',
    ];
    camposDocumentacion.forEach((campo) => {
      const control = this.liquidacionesVentaForm.get(campo);
      const valor = control?.value;

      if (control && valor !== null && valor !== undefined) {
        totalDocumentacionVentas += this.desformatearMoneda(valor);
      }
    });

    const camposProvision = [
      'retencionFuente',
      'traspasoNeto',
      'impuestoAnoCurso',
      'inscripcionPrenda2',
      'comparendos2',
      'tomaImprontas',
      'manejoEnvioAutomango',
      'honorariosTramitador',
    ];
    camposProvision.forEach((campo) => {
      const control = this.liquidacionesVentaForm.get(campo);
      const valor = control?.value;

      if (control && valor !== null && valor !== undefined) {
        totalProvisionVentas += this.desformatearMoneda(valor);
      }
    });

    if (this.tramitesVentasForm.get('tramitesVentas')) {
      this.tramitesVentasForm
        .get('tramitesVentas')
        ?.value.forEach((tramitesVenta: any) => {
          const valor = this.desformatearMoneda(tramitesVenta.valor);
          if (!isNaN(valor)) {
            totalDocumentacionVentas += valor;
          }
        });
    }

    if (this.provicionTramitesVentasForm.get('provicionTramitesVentas')) {
      this.provicionTramitesVentasForm
        .get('provicionTramitesVentas')
        ?.value.forEach((provicionTramitesVenta: any) => {
          const valor = this.desformatearMoneda(provicionTramitesVenta.valor2);
          if (!isNaN(valor)) {
            totalProvisionVentas += valor;
          }
        });
    }

    const formattedTotalDocumentacion = this.formatSalary(
      totalDocumentacionVentas
    );
    const formattedTotalProvision = this.formatSalary(totalProvisionVentas);

    this.liquidacionesVentaForm
      .get('totalDocumentacion')
      ?.setValue(formattedTotalDocumentacion);
    this.liquidacionesVentaForm
      .get('totalProvision')
      ?.setValue(formattedTotalProvision);
    this.calcularTotalCliente();
  }

  closeAllModals(): void {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach((modal) => {
      const instance = bootstrap.Modal.getInstance(modal);
      if (instance) {
        instance.hide();
      }
    });
    this.removeModalBackdrop();
  }

  calcularTotalCliente() {
    const valorVehiculoNumerico = this.desformatearMoneda(
      this.formaPagoVentaForm.get('valorVentaNumero')?.value
    );
    const valorDocumentacion = this.desformatearMoneda(
      this.liquidacionesVentaForm.get('totalDocumentacion')?.value
    );
    const valorPago1 = this.desformatearMoneda(
      this.formasdePagoVentaForm2.get('valorPago12')?.value || '$0'
    );
    const valorPago2 = this.desformatearMoneda(
      this.formasdePagoVentaForm2.get('valorPago22')?.value || '$0'
    );
    const valorPago3 = this.desformatearMoneda(
      this.formasdePagoVentaForm2.get('valorPago32')?.value || '$0'
    );

    const totalNegocio = valorVehiculoNumerico + valorDocumentacion;

    const valorRestante = totalNegocio - valorPago1 - valorPago2 - valorPago3;

    this.valorTotalCliente = this.formatSalary(totalNegocio);

    const valorPago4Actual =
      this.formasdePagoVentaForm2.get('valorPago42')?.value;
    if (valorPago4Actual !== valorRestante) {
      this.formasdePagoVentaForm2
        .get('valorPago42')
        ?.setValue(this.formatSalary(valorRestante));
    }
  }

  desformatearMoneda(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();

    const valorNumerico = valorComoCadena.replace(/[^\d-]/g, '');
    return parseFloat(valorNumerico);
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
      maximumFractionDigits: 0,
    }).format(Math.abs(value));

    return (value < 0 ? '-' : '') + formatted;
  }

  convertirAValorNumerico(valor: string): number {
    if (!valor) {
      return 0;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d-]/g, ''));
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  private suscribirACambios(campo: string) {
    const control = this.liquidacionesVentaForm.get(campo);

    if (control) {
      const sub = control.valueChanges.subscribe(() => {
        this.calcularTotal();
        this.esCruceDocumental();
      });

      if (sub) {
        this.subscriptions.push(sub);
      }
    }
  }

  ngOnDestroy(): void {
    this.closeModal();
    this.subscription.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.sharedData.clearCurrentInventoryId();
  }

  updateInventory(inventoryId: string) {
    const vehiculoId = this.vehiculo._id;
    const body = { inventoryId };

    this.http
      .put(`${this.apiUrl}/api/agregarInventario/${vehiculoId}`, body)
      .subscribe(
        (response) => { },
        (error) => { }
      );
  }

  convertirArrayAObjeto(formArray: FormArray): any {
    return formArray.controls.map((control) => {
      const formGroup = control as FormGroup;
      const valor = this.desformatearMoneda(formGroup.get('valor')?.value);
      return {
        descripcion: formGroup.get('descripcion')?.value,
        valor: valor,
      };
    });
  }

  convertirArrayAObjeto2(formArray: FormArray): any {
    return formArray.controls.map((control) => {
      const formGroup = control as FormGroup;
      const valor = this.desformatearMoneda(formGroup.get('valor2')?.value);
      return {
        descripcion2: formGroup.get('descripcion2')?.value,
        valor2: valor,
      };
    });
  }

  isNegative(value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return numericValue < 0;
  }

  get tramitesVentas(): FormArray {
    return this.tramitesVentasForm.get('tramitesVentas') as FormArray;
  }

  get tramites(): FormArray {
    return this.tramitesCruceForm.get('tramites') as FormArray;
  }

  agregarTramite() {
    const tramiteFormGroup = this.formBuilder.group({
      descripcion: [''],
      valor: [''],
    });

    tramiteFormGroup.get('valor')?.valueChanges.subscribe((valorFormateado) => {
      if (valorFormateado !== null) {
        const valorNumerico = this.desformatearMoneda(valorFormateado);
        tramiteFormGroup
          .get('valor')
          ?.setValue(valorNumerico.toString(), { emitEvent: false });
      }
    });

    this.tramitesVentas.push(tramiteFormGroup);
  }

  activarTraslado() {
    const isActived =
      this.variablesLiquidacionVentasForm.get('traslado')?.value;

    if (isActived) {
      this.variablesLiquidacionVentasForm.get('ciudadTraslado')?.enable();
      this.verCiudadSelect = true;
    } else {
      this.variablesLiquidacionVentasForm.get('ciudadTraslado')?.disable();
      this.verCiudadSelect = false;
      this.obtenerTraslado();
    }
  }

  eliminarTramite(index: number) {
    this.tramitesVentas.removeAt(index);
  }

  get provicionTramitesVentas(): FormArray {
    return this.provicionTramitesVentasForm.get(
      'provicionTramitesVentas'
    ) as FormArray;
  }

  agregarProvicionTramites() {
    const provicionTramitesFormGroup = this.formBuilder.group({
      descripcion2: [''],
      valor2: [''],
    });

    provicionTramitesFormGroup
      .get('valor2')
      ?.valueChanges.subscribe((valorFormateado) => {
        if (valorFormateado !== null) {
          const valorNumerico = this.desformatearMoneda(valorFormateado);
          provicionTramitesFormGroup
            .get('valor2')
            ?.setValue(valorNumerico.toString(), { emitEvent: false });
        }
      });

    this.provicionTramitesVentas.push(provicionTramitesFormGroup);
  }

  eliminarProvicionTramites(index: number) {
    this.provicionTramitesVentas.removeAt(index);
  }

  onSelectAsesor(event: any) {
    const selectedAsesor = event.target.value;
    const asesor = this.usuariosAsesor.find(
      (user) => user.nombre === selectedAsesor
    );

    if (asesor) {
      this.generadorContratosVentasForm.patchValue({
        telefonoAsesor: asesor.telefono || '',
        correoAsesor: asesor.email || '',
      });

      this.generadorContratosVentasForm.get('telefonoAsesor')?.disable();
      this.generadorContratosVentasForm.get('correoAsesor')?.disable();
    }
  }

  obtenerCostoTraspaso50() {
    const ciudadPlaca =
      this.documentosValoresInicialesForm.get('ciudadPlaca')?.value;

    let costoTraspaso100;
    const costoProvisional = this.costosTramites.find(
      (costo: any) => costo.ciudad === 'Provisional'
    ).traspaso100;

    const costoEncontrado = this.costosTramites.find(
      (costo: any) => costo.ciudad === ciudadPlaca
    );
    if (costoEncontrado) {
      costoTraspaso100 = costoEncontrado.traspaso100;
    } else {
      costoTraspaso100 = costoProvisional;
    }

    this.traspaso50 = costoTraspaso100 / 2;
    this.traspasoNeto = this.traspaso50 * 2;
    const valorFormateadoTraspaso = this.formatSalary(this.traspaso50);
    const valorFormateadoTraspasoNeto = this.formatSalary(this.traspasoNeto);
    this.liquidacionesVentaForm.controls['traspaso'].setValue(
      valorFormateadoTraspaso
    );
    this.liquidacionesVentaForm.controls['traspasoNeto'].setValue(
      valorFormateadoTraspasoNeto
    );

    this.calcularTotal();
    this.esCruceDocumental();
  }

  fechaSeleccionada: string | null = null;
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaSeleccionada = input.value;
    //this.fechaActual = new Date().toISOString().substring(0, 10);

    console.log('Fecha seleccionada:', this.fechaSeleccionada);
    console.log('Fecha actual:', this.fechaActual || 'Campo vacío');
    this.initFechas();
    this.calcularTodo();
  }

  fechaActualDate: any;
  private initFechas(): void {

    this.fechaActual2 = new Date().toISOString().substring(0, 4);
    this.anoActual = this.fechaActual2 + '-12-31';

    this.fechaActualDate = new Date(this.fechaSeleccionada || '');
    const anoActualDate = new Date(this.anoActual);

    let resta = anoActualDate.getTime() - this.fechaActualDate.getTime();
    this.diasDevolucionImpuesto = resta / (1000 * 3600 * 24);
  }

  obtenerTraslado() {
    const isActived =
      this.variablesLiquidacionVentasForm.get('traslado')?.value;

    if (isActived) {
      const ciudad =
        this.variablesLiquidacionVentasForm.get('ciudadTraslado')?.value;
      let trasladoCuenta;
      let radicacionCuenta;
      const costoProvisional = this.costosTramites.find(
        (costo: any) => costo.ciudad === 'Provisional'
      ).trasladoDeCuenta;
      const costoProvisional2 = this.costosTramites.find(
        (costo: any) => costo.ciudad === 'Provisional'
      ).radicacionDeCuenta;

      const costoEncontrado = this.costosTramites.find(
        (costo: any) => costo.ciudad === ciudad
      );
      if (costoEncontrado) {
        trasladoCuenta = costoEncontrado.trasladoDeCuenta;
        radicacionCuenta = costoEncontrado.radicacionDeCuenta;
      } else {
        trasladoCuenta = costoProvisional;
        radicacionCuenta = costoProvisional2;
      }

      const valorFormateadoTraslado = this.formatSalary(trasladoCuenta);
      const valorFormateadoRadicacion = this.formatSalary(radicacionCuenta);
      this.liquidacionesVentaForm.controls['trasladoCuenta'].setValue(
        valorFormateadoTraslado
      );
      this.liquidacionesVentaForm.controls['radicacionCuenta'].setValue(
        valorFormateadoRadicacion
      );

      this.calcularTotal();
      this.esCruceDocumental();
      this.calcularTotalCliente();
    } else {
      this.liquidacionesVentaForm.controls['trasladoCuenta'].setValue(
        this.formatSalary(0)
      );
      this.liquidacionesVentaForm.controls['radicacionCuenta'].setValue(
        this.formatSalary(0)
      );

      this.calcularTotal();
      this.esCruceDocumental();
      this.calcularTotalCliente();
    }
  }

  obtenerHonorariosTramitador() {
    const ciudadPlaca = this.documentosValoresInicialesForm
      .get('ciudadPlaca')
      ?.getRawValue();
    let honorariosTramitador;

    const honorariosTramitadorProvisional = this.costosTramites.find(
      (costo) => costo.ciudad === 'Provisional'
    )?.honorariosTramitado;

    const honorariosTramitadorEncontrado = this.costosTramites.find(
      (costo) => costo.ciudad === ciudadPlaca
    );

    if (honorariosTramitadorEncontrado) {
      honorariosTramitador = honorariosTramitadorEncontrado.honorariosTramitado;
    } else {
      honorariosTramitador = honorariosTramitadorProvisional;
    }

    this.liquidacionesVentaForm
      .get('honorariosTramitador')
      ?.setValue(this.formatSalary(honorariosTramitador));
  }

  activarPrenda() {
    const isActived = this.variablesLiquidacionVentasForm
      .get('tieneCredito')
      ?.getRawValue();
    console.log("---", isActived);
    if (isActived) {
      const ciudadPlaca =
        this.documentosValoresInicialesForm.get('ciudadPlaca')?.value;
      const costoProvisional =
        this.costosTramites.find((costo: any) => costo.ciudad === 'Provisional')
          ?.inscripcionPrenda || 0;
      let inscripcionPrenda = 0;

      const costoEncontrado = this.costosTramites.find(
        (costo: any) => costo.ciudad === ciudadPlaca
      )?.inscripcionPrenda;
      if (costoEncontrado !== undefined) {
        inscripcionPrenda = costoEncontrado;
      } else {
        inscripcionPrenda = costoProvisional;
      }
      const valorFormateado = this.formatSalary(Math.abs(inscripcionPrenda));
      const esNegativo = inscripcionPrenda < 0;
      this.liquidacionesVentaForm.controls['inscripcionPrenda'].setValue(
        (esNegativo ? '-' : '') + valorFormateado
      );
      this.liquidacionesVentaForm.controls['inscripcionPrenda2'].setValue(
        valorFormateado
      );
    } else {
      this.liquidacionesVentaForm.controls['inscripcionPrenda'].setValue('$ 0');
      this.liquidacionesVentaForm.controls['inscripcionPrenda2'].setValue(
        '$ 0'
      );
    }
  }

  obtenerInscripcionPrenda() {
    const liquidacionDeudaFin = this.documentosValoresInicialesForm.get(
      'liquidacionDeudaFin'
    )?.value;
    let inscripcionPrenda = 0;

    if (liquidacionDeudaFin === 'CON PRENDA') {
      this.documentosValoresInicialesForm
        .get('liquidacionDeudaFinValor')
        ?.enable();
      const ciudadPlaca =
        this.documentosValoresInicialesForm.get('ciudadPlaca')?.value;
      const costoProvisional =
        this.costosTramites.find((costo: any) => costo.ciudad === 'Provisional')
          ?.inscripcionPrenda || 0;

      const costoEncontrado = this.costosTramites.find(
        (costo: any) => costo.ciudad === ciudadPlaca
      )?.inscripcionPrenda;
      if (costoEncontrado !== undefined) {
        inscripcionPrenda = costoEncontrado;
      } else {
        inscripcionPrenda = costoProvisional;
      }
    } else if (liquidacionDeudaFin === 'SIN PRENDA') {
      this.documentosValoresInicialesForm
        .get('liquidacionDeudaFinValor')
        ?.disable();
      this.documentosValoresInicialesForm.controls[
        'liquidacionDeudaFinValor'
      ].setValue('');
    }

    const valorFormateado = this.formatSalary(Math.abs(inscripcionPrenda));
    const esNegativo = inscripcionPrenda < 0;
    this.liquidacionesVentaForm.controls['inscripcionPrenda'].setValue(
      (esNegativo ? '-' : '') + valorFormateado
    );
    this.liquidacionesVentaForm.controls['inscripcionPrenda2'].setValue(
      valorFormateado
    );
  }

  buscarInventarioPlaca() {
    const placa = this.vehiculoInvControl.value;
    this.http
      .get<any[]>(`${this.apiUrl}/api/vehicles/inventarios/${placa}`)
      .subscribe(
        (data) => {
          this.inventarios = data
            .map((inventario) => {
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
                numeroIdentificacionCliente:
                  inventario.numeroIdentificacionCliente,
              };
            })
            .sort((a: any, b: any) => b.inventoryId - a.inventoryId);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'No encontrado',
            text: 'El vehículo no existe',
          });
          this.inventarios = [];
        }
      );
  }

  buscarInventarioPlacaOne() {
    const placa = this.vehiculoInvOneControl.value;
    this.http
      .get<any[]>(`${this.apiUrl}/api/vehicles/inventarios/${placa}`)
      .subscribe(
        (data) => {
          this.inventarios = data
            .map((inventario) => {
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
                numeroIdentificacionCliente:
                  inventario.numeroIdentificacionCliente,
              };
            })
            .sort((a: any, b: any) => b.inventoryId - a.inventoryId);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'No encontrado',
            text: 'El vehículo no existe',
          });
          this.inventarios = [];
        }
      );
  }

  activarImpAnoEnCurso() {
    const isActived =
      this.variablesLiquidacionVentasForm.get('promedioImpuesto')?.value;

    if (isActived) {
      const valorImpAnoEnCurso = this.documentosValoresInicialesForm.get(
        'estadoImpAnoEnCurso'
      )?.value;
      const mes = new Date().toISOString().substring(5, 7);
      if (mes === '12' || mes === '01') {
        const valorImp = this.desformatearMoneda(
          this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value
        );
        const valorFormateado = this.formatSalary(valorImp);
        this.liquidacionesVentaForm.controls[
          'proporcionalImpAnoCurso'
        ].setValue(valorFormateado);
        this.liquidacionesVentaForm.controls['impuestoAnoCurso'].setValue(
          valorFormateado
        );
        this.calcularTotal();
        this.esCruceDocumental();
        this.calcularTotalCliente();
      } else {
        if (valorImpAnoEnCurso === 'CON PAGO') {
          const valorImp = this.desformatearMoneda(
            this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value
          );
          let formula = (valorImp / 365) * this.diasDevolucionImpuesto;
          const valorFormateado = this.formatSalary(formula);
          this.liquidacionesVentaForm.controls[
            'proporcionalImpAnoCurso'
          ].setValue(valorFormateado);
          this.liquidacionesVentaForm.controls['impuestoAnoCurso'].setValue(
            this.formatSalary(0)
          );
          this.calcularTotal();
          this.esCruceDocumental();
          this.calcularTotalCliente();
        } else if (valorImpAnoEnCurso === 'PARA PAGO') {
          const valorImp = this.desformatearMoneda(
            this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value
          );
          let formula = (valorImp / 365) * this.diasDevolucionImpuesto;
          const valorFormateado = this.formatSalary(formula);
          this.liquidacionesVentaForm.controls[
            'proporcionalImpAnoCurso'
          ].setValue(valorFormateado);
          this.liquidacionesVentaForm.controls['impuestoAnoCurso'].setValue(
            this.formatSalary(valorImp)
          );
          this.calcularTotal();
          this.esCruceDocumental();
          this.calcularTotalCliente();
        } else {
          this.liquidacionesVentaForm.controls[
            'proporcionalImpAnoCurso'
          ].setValue(this.formatSalary(0));
          this.liquidacionesVentaForm.controls['impuestoAnoCurso'].setValue(
            this.formatSalary(0)
          );
          this.calcularTotal();
          this.esCruceDocumental();
          this.calcularTotalCliente();
        }
      }
    } else {
      this.liquidacionesVentaForm.controls['proporcionalImpAnoCurso'].setValue(
        this.formatSalary(0)
      );
      this.liquidacionesVentaForm.controls['impuestoAnoCurso'].setValue(
        this.formatSalary(0)
      );
      this.calcularTotal();
      this.esCruceDocumental();
      this.calcularTotalCliente();
    }
  }

  obtenerComparendoComprador() {
    const comparendos = this.desformatearMoneda(
      this.variablesLiquidacionVentasForm.get('comparendosVariables')?.value
    );

    if (comparendos !== null && comparendos !== undefined) {
      let resta = comparendos;
      const valorFormateado = this.formatSalary(resta);
      const valorFormateadoProv = this.formatSalary(comparendos);

      this.liquidacionesVentaForm.controls['comparendos'].setValue(
        valorFormateado
      );
      this.liquidacionesVentaForm.controls['comparendos2'].setValue(
        valorFormateadoProv
      );

      this.calcularTotal();
      this.esCruceDocumental();
      this.calcularTotalCliente();
    } else {
    }
  }

  obtenerTomaImprontas() {
    const improntas = this.desformatearMoneda(
      this.variablesLiquidacionVentasForm.get('tomaImprontasVariables')?.value
    );

    if (improntas !== null && improntas !== undefined) {
      const valorFormateado = this.formatSalary(improntas);

      this.liquidacionesVentaForm.controls['tomaImprontas'].setValue(
        valorFormateado
      );
      this.calcularTotal();
      this.esCruceDocumental();
      this.calcularTotalCliente();
    } else {
    }
  }

  obtenerHonorariosIvaIncluido() {
    const isActived =
      this.variablesLiquidacionVentasForm.get('cobraHonorarios')?.value;

    if (isActived) {
      let valorNumerico = Number(this.honorariosAutomagno);
      let valorConIva = valorNumerico + valorNumerico * 0.19;
      const valorFormateado = this.formatSalary(valorConIva);
      this.liquidacionesVentaForm.controls['honorariosIvaIncluido'].setValue(
        valorFormateado
      );
    } else {
      this.liquidacionesVentaForm.controls['honorariosIvaIncluido'].setValue(
        this.formatSalary(0)
      );
    }
  }

  obtenerValorSoatTotal() {
    const isActived =
      this.variablesLiquidacionVentasForm.get('promediaSoat')?.value;

    if (isActived) {
      const vencimientoSoatDate = new Date(
        this.documentosValoresInicialesForm.get('fechaFinSoat')?.value
      );
      const valorSoatTotal = this.desformatearMoneda(
        this.documentosValoresInicialesForm.get('totalSoatValor')?.value
      );
      const fechaActualDate = new Date(this.fechaActual);

      let resta = vencimientoSoatDate.getTime() - fechaActualDate.getTime();

      let diferenciaDias = resta / (1000 * 3600 * 24);

      let nuevoValor = (valorSoatTotal / 365) * (diferenciaDias + 1);
      let valorRedondeado = Math.round(nuevoValor);

      const valorFormateado = this.formatSalary(valorRedondeado);
      this.liquidacionesVentaForm.controls['devolucionSoat'].setValue(
        valorFormateado
      );

      const estado = this.documentosValoresInicialesForm.get(
        'estadoValorTotalSoat'
      )?.value;
      if (estado === 'VENCIDO COMPRAR') {
        Swal.fire({
          icon: 'warning',
          title: 'RECORDATORIO',
          text: 'Estado del SOAT Vencido, recuerda que es prioridad que esté vigente.',
        });
        this.liquidacionesVentaForm.controls['soat'].setValue(valorFormateado);
      } else if (estado === 'VIGENTE') {
        this.liquidacionesVentaForm.controls['soat'].setValue(
          this.formatSalary(0)
        );
      }
    } else {
      this.liquidacionesVentaForm.controls['devolucionSoat'].setValue(
        this.formatSalary(0)
      );
      this.liquidacionesVentaForm.controls['soat'].setValue(
        this.formatSalary(0)
      );
    }
  }

  obtenerEstadoSoat() {
    const estado = this.documentosValoresInicialesForm.get(
      'estadoValorTotalSoat'
    )?.value;
    if (estado === 'VENCIDO COMPRAR') {
      Swal.fire({
        icon: 'warning',
        title: 'RECORDATORIO',
        text: 'Estado del SOAT Vencido, recuerda que es prioridad que esté vigente.',
      });
      this.liquidacionesVentaForm.controls['soat'].setValue('VENCIDO');
    } else if (estado === 'VIGENTE') {
      this.liquidacionesVentaForm.controls['soat'].setValue('SOAT VIGENTE');
    }
  }

  aplicarRetencionSiNoEsNIT() {
    const tipoIdentificacion = this.comprador?.tipoIdentificacion;
    let valorRetencionFuente;
    if (tipoIdentificacion === 'NIT.') {
      valorRetencionFuente = 0;
    } else {
      valorRetencionFuente = this.desformatearMoneda(
        this.documentosValoresInicialesForm
          .get('valorRetencionValor')
          ?.getRawValue()
      );
    }

    const valorFormateadoFuente = this.formatSalary(valorRetencionFuente);

    if (this.filtroBDForm.get('proveedor')?.value === 'PERSONA NATURAL') {
      this.liquidacionesVentaForm.controls['retencionFuente'].setValue(
        valorFormateadoFuente
      );
    } else {
      this.liquidacionesVentaForm.controls['retencionFuente'].setValue('$ 0');
    }
  }

  convertirANumeros(num: number): string {
    return this.conversionService.numerosALetras(num);
  }

  onValorVentaNumeroLetrasChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorNumerico = this.desformatearMoneda(input.value);

    if (!isNaN(valorNumerico)) {
      let valorEnLetras = this.conversionService.numerosALetras(valorNumerico);

      valorEnLetras = valorEnLetras.replace(/\s+/g, ' ');

      const control = this.formaPagoVentaForm.get('valorVentaLetras');
      if (control) {
        const valorFinal = valorEnLetras.toUpperCase();
        control.setValue(valorFinal);
      }
    }

    this.valorOfertado = valorNumerico;

    this.obtenerCostoTraspaso50();
  }

  calcularClausulaPenalVenta(event: Event) {
    const input = event.target as HTMLInputElement;
    const valorNumerico = this.desformatearMoneda(input.value);

    // Calcula la cláusula penal (10% del valor numérico)
    this.clausulaPenal2 = valorNumerico * 0.1;

    // Formatea el valor numérico
    const clausulaPenalFormateada = this.formatSalary(this.clausulaPenal2);
    this.formattedValueClausula2 = clausulaPenalFormateada;

    // Convierte el valor numérico a letras
    const clausulaPenalLetras = this.conversionService.numerosALetras(this.clausulaPenal2);
    const valorEnLetrasA = clausulaPenalLetras.replace(/\s+/g, ' ');

    // Actualiza el valor en letras y en número en el formulario reactivo
    this.formaPagoVentaForm.patchValue({
      clausulaPenalLetras: valorEnLetrasA.toUpperCase(),  // Letras
      clausulaPenalNumeros: clausulaPenalFormateada       // Números formateados
    });
  }


  onSelectGestor(event: any) {
    const selectedGestor = event.target.value;
    const gestor = this.usuariosGestores.find(
      (user) => user.nombre === selectedGestor
    );

    if (gestor) {
      this.generadorContratosVentasForm.patchValue({
        telefonoGestor: gestor.telefono || '',
        correoGestor: gestor.email || '',
      });

      this.generadorContratosVentasForm.get('telefonoGestor')?.disable();
      this.generadorContratosVentasForm.get('correoGestor')?.disable();
    }
  }

  configureFiltering() {
    this.opcionesFiltradas = this.clienteControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allClients.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  configureFilteringVeh() {
    this.opcionesFiltradasVeh = this.vehiculoInvControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterVeh(value))
    );
  }

  private _filterVeh(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  configureFilteringVehInv() {
    this.opcionesFiltradasVehInv = this.vehiculoInvOneControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterVehInv(value))
    );
  }

  private _filterVehInv(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehiclesInv.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
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

  formatSalary(salary: any): string {
    if (typeof salary === 'string' && salary.includes('$')) {
      return salary;
    }

    let numberSalary = typeof salary === 'string' ? parseFloat(salary) : salary;

    if (isNaN(numberSalary) || numberSalary === null) {
      return '-';
    }

    // Truncar el valor a la parte entera sin redondear
    const truncatedSalary = Math.trunc(numberSalary);

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0, // Sin decimales
      maximumFractionDigits: 0, // Sin decimales
    }).format(truncatedSalary);
  }


  formatNumber(value: number): string {
    if (isNaN(value) || value === null) {
      return '-';
    }
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0,
    }).format(value);
  }

  initForm() {
    this.buscarInventarioForm = new FormGroup({
      buscarInventario: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.loading = true;

    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      this.authService.getUserDetails().subscribe(
        (user) => {
          this.datosUser = user;
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );
    }

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.clientsService.getAllNumerosIdent().subscribe((clients) => {
      this.allClients = clients;
      this.configureFiltering();
    });

    this.vehiclesService.getAllPlaca().subscribe((vehicles) => {
      this.allVehicles = vehicles;
      this.allVehiclesInv = vehicles;
      this.configureFilteringVeh();
      this.configureFilteringVehInv();
    });

    this.initForm();
    this.subscription = this.sharedData.currentInventoryId.subscribe((id) => {
      if (id) {
        this.irAlInventario(id);
      }
    });

    this.liquidacionesVentaForm
      .get('manejoEnvioAutomango')
      ?.setValue(this.formatSalary(this.manejoEnvioAutomango));
    this.suscribirACambios('traspaso');
    this.suscribirACambios('inscripcionPrenda');
    this.suscribirACambios('comparendos');
    this.suscribirACambios('proporcionalImpAnoCurso');
    this.suscribirACambios('devolucionSoat');
    this.suscribirACambios('honorariosIvaIncluido');
    this.suscribirACambios('trasladoCuenta');
    this.suscribirACambios('radicacionCuenta');

    this.suscribirACambios('retencionFuente');
    this.suscribirACambios('traspasoNeto');
    this.suscribirACambios('impuestoAnoCurso');
    this.suscribirACambios('inscripcionPrenda2');
    this.suscribirACambios('comparendos2');
    this.suscribirACambios('tomaImprontas');
    this.suscribirACambios('manejoEnvioAutomango');
    this.suscribirACambios('inscripcionPrenda2');

    const tramitesSub = this.tramitesVentasForm
      .get('tramitesVentas')
      ?.valueChanges.subscribe(() => {
        this.calcularTotal();
        this.esCruceDocumental();
      });
    if (tramitesSub) {
      this.subscriptions.push(tramitesSub);
    }

    // Suscribirse a cambios en provicionTramites y agregar la suscripción al array
    const provicionTramitesSub = this.provicionTramitesVentasForm
      .get('provicionTramitesVentas')
      ?.valueChanges.subscribe(() => {
        this.calcularTotal();
        this.esCruceDocumental();
      });
    if (provicionTramitesSub) {
      this.subscriptions.push(provicionTramitesSub);
    }

    const valorCompraSub = this.formaPagoVentaForm
      .get('valorVentaNumero')
      ?.valueChanges.subscribe(() => {
        this.calcularTotalCliente();
      });

    if (valorCompraSub) {
      this.subscriptions.push(valorCompraSub);
    }

    this.http.get<any[]>(`${this.apiUrl}/api/ciudades`).subscribe((data) => {
      this.lugares = data;
      this.lugares.push({ name: 'Pendiente' });
      this.organizarAlfabeticamente();
    });
    this.http
      .get<any[]>(`${this.apiUrl}/api/getSuppliers`)
      .subscribe((data) => {
        this.suppliers = data;
        this.organizarAlfabeticamenteCliente();
      });
    this.http.get<any[]>(`${this.apiUrl}/api/getVariable`).subscribe((data) => {
      this.variables = data;
      const honorarios = this.variables.find(
        (v) => v.nombre === 'honorariosAutomagno'
      );

      this.honorariosAutomagno = honorarios ? honorarios.valor : undefined;
    });
    this.http
      .get<any[]>(`${this.apiUrl}/api/getTramitadores`)
      .subscribe((data) => {
        this.tramitadores = data;
      });

    this.http
      .get<any[]>(`${this.apiUrl}/api/getCostosTramites`)
      .subscribe((data) => {
        this.costosTramites = data;
      });

    this.http.get<any[]>(`${this.apiUrl}/api/users`).subscribe((data) => {
      this.users = data;

      this.usuariosGestores = this.users.filter(
        (user) => user.role && user.role.includes('Gestor documental')
      );

      this.usuariosAsesor = this.users.filter(
        (user) => user.role && user.role.includes('Asesor Comercial')
      );
    });

    this.vehiculo = {
      _id: '',
      placa: '',
      marca: '',
      linea: '',
      version: '',
      modelo: '',
      cilindraje: '',
      color: '',
      servicio: '',
      clase: '',
      carroceria: '',
      combustible: '',
      pasajeros: '',
      numeroMotor: '',
      ciudadPlaca: '',
      vin: '',
      serie: '',
      chasis: '',
      fechaMatricula: '',
      fechaExpedicion: '',
      fechaIngreso: this.fechaActual,
      inventarios: [],
    };

    this.clients = {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      tipoIdenticacion: '',
      numeroIdentificacion: '',
      ciudadIdentificacion: '',
      direccionResidencia: '',
      ciudadResidencia: '',
      celularOne: '',
      celularTwo: '',
      correoElectronico: '',
      fechaIngreso: this.fechaActual,
    };

    this.comprador = {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      tipoIdenticacion: '',
      numeroIdentificacion: '',
      ciudadIdentificacion: '',
      direccionResidencia: '',
      ciudadResidencia: '',
      celularOne: '',
      celularTwo: '',
      correoElectronico: '',
      fechaIngreso: this.fechaActual,
    };
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, 2000));
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

  ordenCompra() {
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
      const fechaEntrega = this.formaPagoVentaForm.get('fechaEntrega')?.value;
      const dateObj2 = new Date(fechaEntrega);
      const day2 = dateObj2.getDate();
      const monthIndex2 = dateObj2.getMonth();
      const year2 = dateObj2.getFullYear();
      const formattedDate2 = `${day2} de ${this.monthNames[monthIndex2]} del ${year2}`;

      const valorVentaNumero = this.desformatearMoneda(this.formaPagoVentaForm.get('valorVentaNumero')?.value);
      const formatoValorVentaNumero = this.formatSalary(valorVentaNumero);

      const clausulaPenalNumeros = this.clausulaPenal;
      const formattedClausulaPenalNumeros = this.formatSalary(clausulaPenalNumeros);

      const valorVentaLetras = this.formaPagoVentaForm.get('valorVentaLetras')?.value;

      const kilometraje = this.generadorContratosVentasForm.get('kilometraje')?.value;
      const idFormated = this.formatNumber(this.comprador.numeroIdentificacion);

      const estadoTecnicoMecanica = this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.value;
      const estadoValorTotalSoat = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;

      const dataParaDocumento = {
        organizacion: this.filtroBDForm.get('organizacion')?.value,
        numeroInventario,
        fecha: formattedDate,
        fechaEntrega: formattedDate2,
        cliente: this.comprador,
        idFormated: idFormated,
        vehiculo: this.vehiculo,
        valorCompraLetras: valorVentaLetras,
        clausulaPenalLetras: this.letrasValueClausula,
        generadorContratos: this.generadorContratosVentasForm.getRawValue(),
        valorCompraNumero: formatoValorVentaNumero,
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

      this.http.post(`${this.apiUrl}/api/orden-compra`, dataParaDocumento, { responseType: 'blob' })
        .subscribe(blob => {
          Swal.close();
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `ORDEN DE COMPRA ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa} [${numeroInventario}].docx`;
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

  actaEntrega() {
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
      const fechaEntrega = this.formaPagoVentaForm.get('fechaEntrega')?.value;
      const dateObj2 = new Date(fechaEntrega);
      const day2 = dateObj2.getDate();
      const monthIndex2 = dateObj2.getMonth();
      const year2 = dateObj2.getFullYear();
      const formattedDate2 = `${day2} de ${this.monthNames[monthIndex2]} del ${year2}`;

      const valorVentaNumero = this.desformatearMoneda(this.formaPagoVentaForm.get('valorVentaNumero')?.value);
      const formatoValorVentaNumero = this.formatSalary(valorVentaNumero);

      const clausulaPenalNumeros = this.clausulaPenal;
      const formattedClausulaPenalNumeros = this.formatSalary(clausulaPenalNumeros);

      const valorVentaLetras = this.formaPagoVentaForm.get('valorVentaLetras')?.value;

      const kilometraje = this.generadorContratosVentasForm.get('kilometraje')?.value;
      const idFormated = this.formatNumber(this.comprador.numeroIdentificacion);

      const estadoTecnicoMecanica = this.documentosValoresInicialesForm.get('estadoTecnicoMecanica')?.value;
      const estadoValorTotalSoat = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;

      const dataParaDocumento = {
        organizacion: this.filtroBDForm.get('organizacion')?.value,
        numeroInventario,
        fecha: formattedDate,
        fechaEntrega: formattedDate2,
        cliente: this.comprador,
        idFormated: idFormated,
        vehiculo: this.vehiculo,
        valorCompraLetras: valorVentaLetras,
        clausulaPenalLetras: this.letrasValueClausula,
        generadorContratos: this.generadorContratosVentasForm.getRawValue(),
        valorCompraNumero: formatoValorVentaNumero,
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

      this.http.post(`${this.apiUrl}/api/acta-entrega`, dataParaDocumento, { responseType: 'blob' })
        .subscribe(blob => {
          Swal.close();
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `ACTA DE ENTREGA Y PAZ Y SALVO ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa} [${numeroInventario}].docx`;
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

  buscarComprador() {
    if (this.clienteControl.valid) {
      const identificacion = this.clienteControl.value;
      this.clientsService.getClientById(identificacion).subscribe(
        (data) => {
          this.comprador = data;
          this.btnChange = true;
          this.comprador.fechaIngreso = new Date(data.fechaIngreso)
            .toISOString()
            .substring(0, 10);
          this.mostrarSiguienteModal3 = true;
        },
        (error) => {
          this.mostrarSiguienteModal3 = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Cliente no encontrado!',
          });
        }
      );
    }
  }

  buscarCompradorTwo() {
    if (this.clienteControl.valid) {
      const identificacion = this.clienteControl.value;
      this.clientsService.getClientById(identificacion).subscribe(
        (data) => {
          this.compradorTwo = data;
          this.btnChange = true;
          this.compradorTwo.fechaIngreso = new Date(data.fechaIngreso)
            .toISOString()
            .substring(0, 10);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Cliente no encontrado!',
          });
        }
      );
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

  private closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
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

  private addModalEventListeners(modalElement: HTMLElement): void {
    modalElement.addEventListener('hidden.bs.modal', () => { });
  }

  unformatCurrency(value: string): number {
    const numericValue = value
      .replace(/[^0-9,]/g, '')
      .replace('.', '')
      .replace(',', '.');
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

  separacionPago(descripcionPago: any, valorPago: any) {
    const descripcion = this.formasdePagoVentaForm2.get(`${descripcionPago}`)?.value;
    const valor = this.desformatearMoneda(this.formasdePagoVentaForm2.get(`${valorPago}`)?.value);
    const valorVentaNumero = this.desformatearMoneda(this.formaPagoVentaForm.get('valorVentaNumero')?.value);

    const operacion = valorVentaNumero * 0.05;

    if (descripcion === 'SEPARACIÓN') {
      if (valor < operacion) {
        this.separacion = true;
        this.filtroBDForm.get('estadoInventario')?.setValue('SEPARADO DISPONIBLE A LA VENTA');
      } else {
        this.separacion = false;
        this.filtroBDForm.get('estadoInventario')?.setValue('VENDIDO');
      }
    }
  }

  actualizarValorPago12(event: Event) {
    const nuevoValor = this.convertirAValorNumerico(
      (event.target as HTMLInputElement).value
    );
    this.valorPago1Actual = nuevoValor;
    this.actualizarValorPago4();
  }

  actualizarValorPago22(event: Event) {
    const nuevoValor = this.convertirAValorNumerico(
      (event.target as HTMLInputElement).value
    );
    this.valorPago2Actual = nuevoValor;
    this.actualizarValorPago4();
  }

  actualizarValorPago32(event: Event) {
    const nuevoValor = this.convertirAValorNumerico(
      (event.target as HTMLInputElement).value
    );
    this.valorPago3Actual = nuevoValor;
    this.actualizarValorPago4();
  }

  actualizarValoresActualesDePago() {
    this.valorPago1Actual = this.convertirAValorNumerico(
      this.formasdePagoVentaForm2.get('valorPago12')?.value
    );
    this.valorPago2Actual = this.convertirAValorNumerico(
      this.formasdePagoVentaForm2.get('valorPago22')?.value
    );
    this.valorPago3Actual = this.convertirAValorNumerico(
      this.formasdePagoVentaForm2.get('valorPago32')?.value
    );
  }

  actualizarValorPago4() {
    const valorVehiculoNumerico = this.desformatearMoneda(
      this.formaPagoVentaForm.get('valorVentaNumero')?.value
    );
    const valorDocumentacion = this.desformatearMoneda(
      this.liquidacionesVentaForm.get('totalDocumentacion')?.value
    );
    const totalNegocio = valorVehiculoNumerico + valorDocumentacion;
    const valorPago1 = this.convertirAValorNumerico(
      this.formasdePagoVentaForm2.get('valorPago12')?.value
    );
    const valorPago2 = this.convertirAValorNumerico(
      this.formasdePagoVentaForm2.get('valorPago22')?.value
    );
    const valorPago3 = this.convertirAValorNumerico(
      this.formasdePagoVentaForm2.get('valorPago32')?.value
    );

    const sumaPagos = valorPago1 + valorPago2 + valorPago3;
    const nuevoValorPago4 = totalNegocio - sumaPagos;

    this.formasdePagoVentaForm2
      .get('valorPago42')
      ?.setValue(this.currencyService.formatCurrency(nuevoValorPago4), {
        emitEvent: false,
      });
  }

  buscarInventario() {
    this.isLoading = true; // Iniciar carga
    this.btnEsconder = false;
    this.limpiarFormArray(this.tramitesVentas);
    this.limpiarFormArray(this.provicionTramitesVentas);

    if (this.buscarInventarioForm.valid) {
      setTimeout(() => {
        const inventarioId =
          this.buscarInventarioForm.get('buscarInventario')?.value;
        this.http
          .get<any>(
            `${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`
          )
          .subscribe(
            (data) => {
              this.inventoryId = data._id;
              this.btnEsconder = true;
              this.btnChange = true;
              this.buscarClientePorId(data.cliente);
              this.mostrarSiguienteModal = true;
              this.buscarVehiculoPorId(data.vehiculo);

              this.mostrarSiguienteModal2 = true;
              this.buscarCompradorPorId(data.comprador);
              if (data.compradorTwo !== undefined) {
                this.buscarCompradorTwoPorId(data.compradorTwo);
              }
              this.mostrarSiguienteModal3 = true;

              let fechaIngreso: any = new Date(data.filtroBaseDatos.fechaIngreso)
                .toISOString()
                .substring(0, 10);

              if (fechaIngreso === '1970-01-01') {
                fechaIngreso = null;
              }

              let fechaExpedicion: any = new Date(
                data.filtroBaseDatos.fechaExpedicion
              )
                .toISOString()
                .substring(0, 10);

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
                fechaExpedicion: fechaExpedicion,
              });

              this.peritajeImprontasForm.patchValue({
                lugar: data.peritajeProveedor.lugar,
                estado: data.peritajeProveedor.estado,
                numeroInspeccion: data.peritajeProveedor.numeroInspeccion,
                linkInspeccion: data.peritajeProveedor.linkInspeccion,
                impronta: data.peritajeProveedor.impronta,
              });

              this.generadorContratosVentasForm
                .get('empresa')
                ?.setValue(data.peritajeProveedor.lugar);
              this.generadorContratosVentasForm
                .get('numeroInspeccion')
                ?.setValue(data.peritajeProveedor.numeroInspeccion);

              let fechaEntrega2: any = new Date(data.formaPagoVenta.fechaEntrega)
                .toISOString()
                .substring(0, 10);

              if (fechaEntrega2 === '1970-01-01') {
                fechaEntrega2 = null;
              }

              let fechaVenta: any = new Date(data.formaPagoVenta.fechaVenta)
                .toISOString()
                .substring(0, 10);

              if (fechaVenta === '1970-01-01') {
                fechaVenta = null;
              }

              this.observacionGlobal = data.observacionGlobal;

              this.formattedValue = this.formatSalary(
                data.formaPagoCompra.valorCompraNumero
              );

              let valorVentaNumero = data.formaPagoVenta.valorVentaNumero;

              if (
                valorVentaNumero === null ||
                valorVentaNumero === undefined ||
                valorVentaNumero === ''
              ) {
                valorVentaNumero = this.formatSalary(data.precioPublicacion);
              } else {
                valorVentaNumero = this.formatSalary(valorVentaNumero);
              }

              this.formaPagoVentaForm.patchValue({
                valorVentaLetras: data.formaPagoVenta.valorVentaLetras,
                valorVentaNumero: valorVentaNumero,
                clausulaPenalLetras: data.formaPagoVenta.clausulaPenalLetras,
                fechaEntrega: fechaEntrega2,
                fechaVenta: fechaVenta,
              });

              if (data.precioPublicacion > 0) {
                this.valorOfertado = data.precioPublicacion;
              } else {
                this.valorOfertado = data.formaPagoVenta.valorVentaNumero;
              }

              this.formattedValueClausula2 = this.formatSalary(data.formaPagoVenta.clausulaPenalNumeros);

              this.formattedValue2 = this.formatSalary(
                data.formaPagoVenta.valorVentaNumero
              );

              this.archivoDigital = data.link;

              let estadoCuentaImpuestoValor =
                data.documentosValoresIniciales.estadoCuentaImpuestoValor;
              let simitPropietarioValor =
                data.documentosValoresIniciales.simitPropietarioValor;
              let liquidacionDeudaFinValor =
                data.documentosValoresIniciales.liquidacionDeudaFinValor;
              let totalSoatValor =
                data.documentosValoresIniciales.totalSoatValor;
              let impAnoEnCursoValor =
                data.documentosValoresIniciales.impAnoEnCursoValor;
              let valorRetencionValor =
                data.documentosValoresIniciales.valorRetencionValor;

              if (
                estadoCuentaImpuestoValor === null ||
                estadoCuentaImpuestoValor === undefined ||
                estadoCuentaImpuestoValor === ''
              ) {
                estadoCuentaImpuestoValor = '$ 0';
              } else {
                estadoCuentaImpuestoValor = this.formatSalary(
                  estadoCuentaImpuestoValor
                );
              }

              if (
                simitPropietarioValor === null ||
                simitPropietarioValor === undefined ||
                simitPropietarioValor === ''
              ) {
                simitPropietarioValor = '$ 0';
              } else {
                simitPropietarioValor = this.formatSalary(
                  simitPropietarioValor
                );
              }

              if (
                liquidacionDeudaFinValor === null ||
                liquidacionDeudaFinValor === undefined ||
                liquidacionDeudaFinValor === ''
              ) {
                liquidacionDeudaFinValor = '$ 0';
              } else {
                liquidacionDeudaFinValor = this.formatSalary(
                  liquidacionDeudaFinValor
                );
              }

              if (
                totalSoatValor === null ||
                totalSoatValor === undefined ||
                totalSoatValor === ''
              ) {
                totalSoatValor = '$ 0';
              } else {
                totalSoatValor = this.formatSalary(totalSoatValor);
              }

              if (
                impAnoEnCursoValor === null ||
                impAnoEnCursoValor === undefined ||
                impAnoEnCursoValor === ''
              ) {
                impAnoEnCursoValor = '$ 0';
              } else {
                impAnoEnCursoValor = this.formatSalary(impAnoEnCursoValor);
              }

              if (
                valorRetencionValor === null ||
                valorRetencionValor === undefined ||
                valorRetencionValor === ''
              ) {
                valorRetencionValor = '$ 0';
              } else {
                valorRetencionValor = this.formatSalary(valorRetencionValor);
              }

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
                reciboCaja: data.documentosValoresIniciales.reciboCaja,
                manifiestoFactura: data.documentosValoresIniciales.manifiestoFactura,
                estadoValorTotalSoat: data.documentosValoresIniciales.estadoValorTotalSoat,
                totalSoatValor: totalSoatValor,
                fechaFinSoat: dateFinSoat,
                estadoImpAnoEnCurso: data.documentosValoresIniciales.estadoImpAnoEnCurso,
                impAnoEnCursoValor: impAnoEnCursoValor,
                estadoValorRetencion: data.documentosValoresIniciales.estadoValorRetencion,
                valorRetencionValor: valorRetencionValor,
              });

              this.fotosCertificadoTradicion = data.documentosValoresIniciales.fotosCertificadoTradicion || [];
              this.fotosEstadoCuentaImpuesto = data.documentosValoresIniciales.fotosEstadoCuentaImpuesto || [];
              this.fotosSimitPropietario = data.documentosValoresIniciales.fotosSimitPropietario || [];
              this.fotosLiquidacionDeudaFinanciera = data.documentosValoresIniciales.fotosLiquidacionDeudaFinanciera || [];
              this.fotosTecnoMecanica = data.documentosValoresIniciales.fotosTecnoMecanica || [];
              this.fotosManifiestoFactura = data.documentosValoresIniciales.fotosManifiestoFactura || [];
              this.fotosSoatIniciales = data.documentosValoresIniciales.fotosSoatIniciales || [];
              this.fotosImpuestoAno = data.documentosValoresIniciales.fotosImpuestoAno || [];
              this.fotosOficioDesembargo = data.documentosValoresIniciales.fotosOficioDesembargo || [];
              this.fotosReciboCaja = data.documentosValoresIniciales.fotosReciboCaja || [];

              let fechaUltimoMantenimiento: any = new Date(
                data.controlAccesorios.fechaUltimoMantenimiento
              )
                .toISOString()
                .substring(0, 10);

              if (fechaUltimoMantenimiento === '1970-01-01') {
                fechaUltimoMantenimiento = null;
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
                historialMantenimiento:
                  data.controlAccesorios.historialMantenimiento,
                historialMantenimientoObs:
                  data.controlAccesorios.historialMantenimientoObs,
                manual: data.controlAccesorios.manual,
                manualObs: data.controlAccesorios.manualObs,
                palomera: data.controlAccesorios.palomera,
                palomeraObs: data.controlAccesorios.palomeraObs,
                tapetes: data.controlAccesorios.tapetes,
                tapetesObs: data.controlAccesorios.tapetesObs,
                ultimoKilometraje: data.controlAccesorios.ultimoKilometraje,
                lugarUltimoMantenimiento:
                  data.controlAccesorios.lugarUltimoMantenimiento,
                fechaUltimoMantenimiento: fechaUltimoMantenimiento,
                llantaRepuesto: data.controlAccesorios.llantaRepuesto,
                llantaRepuestoObs: data.controlAccesorios.llantaRepuestoObs,
                kitCarretera: data.controlAccesorios.kitCarretera,
                kitCarreteraObs: data.controlAccesorios.kitCarreteraObs,
                antena: data.controlAccesorios.antena,
                antenaObs: data.controlAccesorios.antenaObs,
              });

              this.fotosCopiaLlave =
                data.controlAccesorios.fotosCopiaLlave || [];
              this.fotosGato = data.controlAccesorios.fotosGato || [];
              this.fotosLlavePernos =
                data.controlAccesorios.fotosLlavePernos || [];
              this.fotosCopaSeguridad =
                data.controlAccesorios.fotosCopaSeguridad || [];
              this.fotosTiroArrastre =
                data.controlAccesorios.fotosTiroArrastre || [];
              this.fotosHistorialMantenimiento =
                data.controlAccesorios.fotosHistorialMantenimiento || [];
              this.fotosManual = data.controlAccesorios.fotosManual || [];
              this.fotosPalomera = data.controlAccesorios.fotosPalomera || [];
              this.fotosTapetes = data.controlAccesorios.fotosTapetes || [];
              this.fotosLlantaRepuesto =
                data.controlAccesorios.fotosLlantaRepuesto || [];
              this.fotosKitCarretera =
                data.controlAccesorios.fotosKitCarretera || [];
              this.fotosAntena = data.controlAccesorios.fotosAntena || [];

              const datosTramitesVentas = data.otrosTramitesAccesoriosVentas;
              const controlTramitesVentas = <FormArray>(
                this.tramitesVentasForm.controls['tramitesVentas']
              );

              datosTramitesVentas.forEach((t: any) => {
                controlTramitesVentas.push(
                  this.formBuilder.group({
                    descripcion: [t.descripcion],
                    valor: [this.formatSalary(t.valor)],
                  })
                );
              });

              const datosProvicionTramitesVentas =
                data.otrosTramitesVendedorVentas;
              const controlProvicionTramitesVentas = <FormArray>(
                this.provicionTramitesVentasForm.controls[
                'provicionTramitesVentas'
                ]
              );

              datosProvicionTramitesVentas.forEach((pt: any) => {
                controlProvicionTramitesVentas.push(
                  this.formBuilder.group({
                    descripcion2: [pt.descripcion2],
                    valor2: [this.formatSalary(pt.valor2)],
                  })
                );
              });

              const comparendosVariables = this.formatSalary(
                data.variablesLiquidacionVentas.comparendosVariables
              );
              const tomaImprontasVariables = this.formatSalary(
                data.variablesLiquidacionVentas.tomaImprontasVariables
              );
              let monto = data.variablesLiquidacionVentas.monto;

              if (monto === null || monto === undefined || monto === '') {
                monto = '$ 0';
              } else {
                monto = this.formatSalary(monto);
              }

              this.variablesLiquidacionVentasForm.patchValue({
                traslado: data.variablesLiquidacionVentas.traslado,
                ciudadTraslado: data.variablesLiquidacionVentas.ciudadTraslado,
                cobraHonorarios:
                  data.variablesLiquidacionVentas.cobraHonorarios,
                promedioImpuesto:
                  data.variablesLiquidacionVentas.promedioImpuesto,
                promediaSoat: data.variablesLiquidacionVentas.promediaSoat,
                tieneCredito: data.variablesLiquidacionVentas.tieneCredito,
                comparendosVariables: comparendosVariables,
                tomaImprontasVariables: tomaImprontasVariables,
                entidadBancaria:
                  data.variablesLiquidacionVentas.entidadBancaria,
                monto: monto,
              });

              let fechaPago1: any = new Date(data.formadePagoVenta2.fechaPago12)
                .toISOString()
                .substring(0, 10);

              if (fechaPago1 === '1970-01-01') {
                fechaPago1 = null;
              }

              let fechaPago2: any = new Date(data.formadePagoVenta2.fechaPago22)
                .toISOString()
                .substring(0, 10);

              if (fechaPago2 === '1970-01-01') {
                fechaPago2 = null;
              }

              let fechaPago3: any = new Date(data.formadePagoVenta2.fechaPago32)
                .toISOString()
                .substring(0, 10);

              if (fechaPago3 === '1970-01-01') {
                fechaPago3 = null;
              }

              let fechaPago4: any = new Date(data.formadePagoVenta2.fechaPago42)
                .toISOString()
                .substring(0, 10);

              if (fechaPago4 === '1970-01-01') {
                fechaPago4 = null;
              }

              let valorPago12 = data.formadePagoVenta2.valorPago12;

              if (
                valorPago12 === null ||
                valorPago12 === undefined ||
                valorPago12 === ''
              ) {
                valorPago12 = '$ 0';
              } else {
                valorPago12 = this.formatSalary(valorPago12);
              }

              this.formasdePagoVentaForm2
                .get('valorPago12')
                ?.setValue(valorPago12);

              let valorPago22 = data.formadePagoVenta2.valorPago22;

              if (
                valorPago22 === null ||
                valorPago22 === undefined ||
                valorPago22 === ''
              ) {
                valorPago22 = '$ 0';
              } else {
                valorPago22 = this.formatSalary(valorPago22);
              }

              this.formasdePagoVentaForm2
                .get('valorPago22')
                ?.setValue(valorPago22);

              let valorPago32 = data.formadePagoVenta2.valorPago32;

              if (
                valorPago32 === null ||
                valorPago32 === undefined ||
                valorPago32 === ''
              ) {
                valorPago32 = '$ 0';
              } else {
                valorPago32 = this.formatSalary(valorPago32);
              }

              this.formasdePagoVentaForm2
                .get('valorPago32')
                ?.setValue(valorPago32);

              this.formasdePagoVentaForm2.patchValue({
                descripcionPago12: data.formadePagoVenta2.descripcionPago12,
                formaPagoPago12: data.formadePagoVenta2.formaPagoPago12,
                entidadDepositarPago12:
                  data.formadePagoVenta2.entidadDepositarPago12,
                numeroCuentaObligaPago12:
                  data.formadePagoVenta2.numeroCuentaObligaPago12,
                tipoCuentaPago12: data.formadePagoVenta2.tipoCuentaPago12,
                beneficiarioPago12: data.formadePagoVenta2.beneficiarioPago12,
                idBeneficiarioPago12:
                  data.formadePagoVenta2.idBeneficiarioPago12,
                fechaPago12: fechaPago1,
                descripcionPago22: data.formadePagoVenta2.descripcionPago22,
                formaPagoPago22: data.formadePagoVenta2.formaPagoPago22,
                entidadDepositarPago22:
                  data.formadePagoVenta2.entidadDepositarPago22,
                numeroCuentaObligaPago22:
                  data.formadePagoVenta2.numeroCuentaObligaPago22,
                tipoCuentaPago22: data.formadePagoVenta2.tipoCuentaPago22,
                beneficiarioPago22: data.formadePagoVenta2.beneficiarioPago22,
                idBeneficiarioPago22:
                  data.formadePagoVenta2.idBeneficiarioPago22,
                fechaPago22: fechaPago2,
                descripcionPago32: data.formadePagoVenta2.descripcionPago32,
                formaPagoPago32: data.formadePagoVenta2.formaPagoPago32,
                entidadDepositarPago32:
                  data.formadePagoVenta2.entidadDepositarPago32,
                numeroCuentaObligaPago32:
                  data.formadePagoVenta2.numeroCuentaObligaPago32,
                tipoCuentaPago32: data.formadePagoVenta2.tipoCuentaPago32,
                beneficiarioPago32: data.formadePagoVenta2.beneficiarioPago32,
                idBeneficiarioPago32:
                  data.formadePagoVenta2.idBeneficiarioPago32,
                fechaPago32: fechaPago3,
                descripcionPago42: data.formadePagoVenta2.descripcionPago42,
                formaPagoPago42: data.formadePagoVenta2.formaPagoPago42,
                entidadDepositarPago42:
                  data.formadePagoVenta2.entidadDepositarPago42,
                numeroCuentaObligaPago42:
                  data.formadePagoVenta2.numeroCuentaObligaPago42,
                tipoCuentaPago42: data.formadePagoVenta2.tipoCuentaPago42,
                beneficiarioPago42: data.formadePagoVenta2.beneficiarioPago42,
                idBeneficiarioPago42:
                  data.formadePagoVenta2.idBeneficiarioPago42,
                fechaPago42: fechaPago4,
              });

              let fechaLimitePagoDeudaFinan: any = new Date(
                data.deudaFinanciera.fechaLimitePagoDeudaFinan
              )
                .toISOString()
                .substring(0, 10);

              if (fechaLimitePagoDeudaFinan === '1970-01-01') {
                fechaLimitePagoDeudaFinan = null;
              }

              this.deudaFinancieraForm.patchValue({
                entidadDeudaFinan: data.deudaFinanciera.entidadDeudaFinan,
                numeroObligacionFinan:
                  data.deudaFinanciera.numeroObligacionFinan,
                fechaLimitePagoDeudaFinan: fechaLimitePagoDeudaFinan,
              });

              this.obsFase3VentaForm.patchValue({
                obsFase3Venta: data.obsFase3Venta,
              });

              let fechaTecnicoMecanica: any = new Date(
                data.generadorContratos.fechaTecnicoMecanica
              )
                .toISOString()
                .substring(0, 10);

              if (fechaTecnicoMecanica === '1970-01-01') {
                fechaTecnicoMecanica = null;
              }

              this.generadorContratosVentasForm.patchValue({
                asesorComercial: data.generadorContratosVentas.asesorComercial,
                telefonoAsesor: data.generadorContratosVentas.telefonoAsesor,
                correoAsesor: data.generadorContratosVentas.correoAsesor,
                gestorDocumental:
                  data.generadorContratosVentas.gestorDocumental,
                telefonoGestor: data.generadorContratosVentas.telefonoGestor,
                correoGestor: data.generadorContratosVentas.correoGestor,
                kilometraje: this.formatThousands(data.generadorContratos.kilometraje),
                horaRecepciom: data.generadorContratosVentas.horaRecepciom,
                fechaTecnicoMecanica: fechaTecnicoMecanica,
                garantia: data.generadorContratosVentas.garantia,
                tiempo: data.generadorContratosVentas.tiempo
              });

              this.liquidacionesVentaForm.patchValue({
                traspaso: data.liquidacionesVenta.traspaso,
                inscripcionPrenda: data.liquidacionesVenta.inscripcionPrenda,
                comparendos: data.liquidacionesVenta.comparendos,
                proporcionalImpAnoCurso:
                  data.liquidacionesVenta.proporcionalImpAnoCurso,
                devolucionSoat: data.liquidacionesVenta.devolucionSoat,
                honorariosIvaIncluido:
                  data.liquidacionesVenta.honorariosIvaIncluido,
                retencionFuente: data.liquidacionesVenta.retencionFuente,
                traspasoNeto: data.liquidacionesVenta.traspasoNeto,
                soat: data.liquidacionesVenta.soat,
                impuestoAnoCurso: data.liquidacionesVenta.impuestoAnoCurso,
                inscripcionPrenda2: data.liquidacionesVenta.inscripcionPrenda2,
                comparendos2: data.liquidacionesVenta.comparendos2,
                tomaImprontas: data.liquidacionesVenta.tomaImprontas,
                trasladoCuenta: data.liquidacionesVenta.trasladoCuenta,
                radicacionCuenta: data.liquidacionesVenta.radicacionCuenta,
                honorariosTramitador:
                  data.liquidacionesVenta.honorariosTramitador,
                totalDocumentacion: data.liquidacionesVenta.totalDocumentacion,
                totalProvision: data.liquidacionesVenta.totalProvision,
              });

              const valorVehiculo = this.desformatearMoneda(
                this.formaPagoVentaForm.get('valorVentaNumero')?.value
              );
              const valorDocumentacion = this.convertirAValorNumerico(
                this.liquidacionesVentaForm.get('totalDocumentacion')?.value
              );

              const suma = valorVehiculo + valorDocumentacion;

              this.valorTotalCliente = this.formatSalary(suma);

              this.suscribirACambios('traspaso');
              this.suscribirACambios('inscripcionPrenda');
              this.suscribirACambios('comparendos');
              this.suscribirACambios('proporcionalImpAnoCurso');
              this.suscribirACambios('devolucionSoat');
              this.suscribirACambios('honorariosIvaIncluido');
              this.suscribirACambios('trasladoCuenta');
              this.suscribirACambios('radicacionCuenta');

              this.suscribirACambios('retencionFuente');
              this.suscribirACambios('traspasoNeto');
              this.suscribirACambios('impuestoAnoCurso');
              this.suscribirACambios('inscripcionPrenda2');
              this.suscribirACambios('comparendos2');
              this.suscribirACambios('tomaImprontas');
              this.suscribirACambios('manejoEnvioAutomango');
              this.suscribirACambios('inscripcionPrenda2');

              const tramitesSub = this.tramitesVentasForm
                .get('tramitesVentas')
                ?.valueChanges.subscribe(() => {
                  this.calcularTotal();
                });

              if (tramitesSub) {
                this.subscriptions.push(tramitesSub);
              }

              // Suscribirse a cambios en provicionTramites y agregar la suscripción al array
              const provicionTramitesSub = this.provicionTramitesVentasForm
                .get('provicionTramitesVentas')
                ?.valueChanges.subscribe(() => {
                  this.calcularTotal();
                });
              if (provicionTramitesSub) {
                this.subscriptions.push(provicionTramitesSub);
              }

              const valorCompraSub = this.formaPagoVentaForm
                .get('valorVentaNumero')
                ?.valueChanges.subscribe(() => {
                  this.calcularTotalCliente();
                });

              if (valorCompraSub) {
                this.subscriptions.push(valorCompraSub);
              }

              this.cruceDocumentalForm
                .get('traspasoActual')
                ?.setValue(this.liquidacionesVentaForm.get('traspaso')?.value);
              this.cruceDocumentalForm
                .get('inscripcionPrendaActual')
                ?.setValue(
                  this.liquidacionesVentaForm.get('inscripcionPrenda')?.value
                );
              this.cruceDocumentalForm
                .get('trasladoCuentaActual')
                ?.setValue(
                  this.liquidacionesVentaForm.get('trasladoCuenta')?.value
                );
              this.cruceDocumentalForm
                .get('radicacionCuentaActual')
                ?.setValue(
                  this.liquidacionesVentaForm.get('radicacionCuenta')?.value
                );
              this.cruceDocumentalForm
                .get('comparendosComprador')
                ?.setValue(
                  this.liquidacionesVentaForm.get('comparendos')?.value
                );
              this.cruceDocumentalForm
                .get('propImpAnoEnCursoActual')
                ?.setValue(
                  this.liquidacionesVentaForm.get('proporcionalImpAnoCurso')
                    ?.value
                );
              this.cruceDocumentalForm
                .get('propSoat')
                ?.setValue(
                  this.liquidacionesVentaForm.get('devolucionSoat')?.value
                );
              this.cruceDocumentalForm
                .get('honorariosIvaIncluido')
                ?.setValue(
                  this.liquidacionesVentaForm.get('honorariosIvaIncluido')
                    ?.value
                );

              this.cruceDocumentalForm.patchValue({
                esCruce: data.cruceDocumental.esCruce,
                numInventario: data.cruceDocumental.numInventario,
                placa: data.cruceDocumental.placa,
                ciudad: data.cruceDocumental.ciudad,
                traspaso: data.cruceDocumental.traspaso,
                retencion: data.cruceDocumental.retencion,
                otrosImpuestos: data.cruceDocumental.otrosImpuestos,
                levantamientoPrenda: data.cruceDocumental.levantamientoPrenda,
                comparendos: data.cruceDocumental.comparendos,
                propImpAnoEnCurso: data.cruceDocumental.propImpAnoEnCurso,
                devolucionSoat: data.cruceDocumental.devolucionSoat,
                totalRetoma: data.cruceDocumental.totalRetoma,
                totalVentaRetoma: data.cruceDocumental.totalVentaRetoma,
                totalDocumentacionActual:
                  data.cruceDocumental.totalDocumentacionActual,
              });

              this.limpiarFormArray(this.tramites);

              const inventarioId = this.cruceDocumentalForm.get('numInventario')?.value;

              if (this.cruceDocumentalForm.valid && inventarioId !== '') {
                this.http.get<any>(`${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`)
                  .subscribe(
                    (data) => {
                      this.buscarVehiculoPorIdCruce(data.vehiculo);

                      this.cruceDocumentalForm.patchValue({
                        traspaso: data.liquidaciones.traspaso,
                        retencion: data.liquidaciones.retencion,
                        otrosImpuestos: data.liquidaciones.otrosImpuestos,
                        comparendos: data.liquidaciones.comparendos,
                        propImpAnoEnCurso:
                          data.liquidaciones.proporcionalImpAnoCurso,
                        devolucionSoat: data.liquidaciones.devolucionSoat,
                      });

                      const datosTramites = data.otrosTramitesAccesorios;
                      const controlTramites = <FormArray>(
                        this.tramitesCruceForm.controls['tramites']
                      );

                      datosTramites.forEach((t: any) => {
                        controlTramites.push(
                          this.formBuilder.group({
                            descripcion: [t.descripcion],
                            valor: [this.formatSalary(t.valor)],
                          })
                        );
                      });

                      this.esCruceDocumental();
                      this.cdr.detectChanges();
                    },
                    (error) => { }
                  );
              }

              this.esCruceDocumental();
              this.actualizarValoresActualesDePago();
              this.actualizarValorPago4();
              this.cdr.detectChanges();
              this.initialValues = this.getCurrentFormValues();

              this.isLoading = false; // Terminar carga
            },
            (error) => {
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
      });
    }
  }

  buscarInventarioCruce() {
    this.limpiarFormArray(this.tramites);

    if (this.cruceDocumentalForm.valid) {
      const inventarioId = this.cruceDocumentalForm.get('numInventario')?.value;
      this.http
        .get<any>(
          `${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`
        )
        .subscribe(
          (data) => {
            this.buscarVehiculoPorIdCruce(data.vehiculo);

            this.cruceDocumentalForm.patchValue({
              traspaso: data.liquidaciones.traspaso,
              retencion: data.liquidaciones.retencion,
              otrosImpuestos: data.liquidaciones.otrosImpuestos,
              comparendos: data.liquidaciones.comparendos,
              propImpAnoEnCurso: data.liquidaciones.proporcionalImpAnoCurso,
              devolucionSoat: data.liquidaciones.devolucionSoat,
            });

            const datosTramites = data.otrosTramitesAccesorios;
            const controlTramites = <FormArray>(
              this.tramitesCruceForm.controls['tramites']
            );

            datosTramites.forEach((t: any) => {
              controlTramites.push(
                this.formBuilder.group({
                  descripcion: [t.descripcion],
                  valor: [this.formatSalary(t.valor)],
                })
              );
            });

            this.esCruceDocumental();
            this.cdr.detectChanges();
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Inventario no encontrado!',
            });
          }
        );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingresa el numero del inventario!',
      });
    }
  }

  onKilometrajeInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    if (value) {
      const formattedValue = this.formatThousands(value);
      this.generadorContratosVentasForm.get('kilometraje')?.setValue(formattedValue, { emitEvent: false });
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

  liquidacionVenta() {
    const numeroInventario =
      this.buscarInventarioForm.get('buscarInventario')?.value;
    const now = new Date();
    const formattedDate = this.datePipe.transform(
      now,
      "EEEE, d 'de' MMMM 'del' y",
      'es-CO'
    );
    const nombreCompleto =
      this.comprador.primerNombre +
      ' ' +
      this.comprador.segundoNombre +
      ' ' +
      this.comprador.primerApellido +
      ' ' +
      this.comprador.segundoApellido;
    const formattedNumeroIdentificacion = this.formatNumber(
      this.comprador.numeroIdentificacion
    );
    let numeroIdentificacion = '';

    if (this.comprador.tipoIdentificacion === 'NIT.') {
      numeroIdentificacion =
        formattedNumeroIdentificacion +
        '-' +
        this.comprador.digitoVerificacion +
        ' de ' +
        this.comprador.ciudadIdentificacion;
    } else {
      numeroIdentificacion =
        formattedNumeroIdentificacion +
        ' de ' +
        this.comprador.ciudadIdentificacion;
    }

    let nombreCompletoTwo;
    let formattedNumeroIdentificacionTwo;
    let numeroIdentificacionTwo;

    if (this.compradorTwo.numeroIdentificacion !== '') {
      nombreCompletoTwo =
        this.compradorTwo.primerNombre +
        ' ' +
        this.compradorTwo.segundoNombre +
        ' ' +
        this.compradorTwo.primerApellido +
        ' ' +
        this.compradorTwo.segundoApellido;
      formattedNumeroIdentificacionTwo = this.formatNumber(
        this.compradorTwo.numeroIdentificacion
      );
      numeroIdentificacionTwo = '';

      if (this.compradorTwo.tipoIdentificacion === 'NIT.') {
        numeroIdentificacionTwo =
          formattedNumeroIdentificacionTwo +
          '-' +
          this.compradorTwo.digitoVerificacion +
          ' de ' +
          this.compradorTwo.ciudadIdentificacion;
      } else {
        numeroIdentificacionTwo =
          formattedNumeroIdentificacionTwo +
          ' de ' +
          this.compradorTwo.ciudadIdentificacion;
      }
    }

    const marcaLinea = this.vehiculo.marca + ' ' + this.vehiculo.linea;
    const tramites = this.tramitesVentasForm.get('tramitesVentas') as FormArray;

    const tramitesData = tramites.controls.map((control: AbstractControl) => {
      const group = control as FormGroup;
      return group.getRawValue();
    });

    let dataParaDocumento;

    let provisional = '';
    const estadoValorTotalSoat = this.documentosValoresInicialesForm.get('estadoValorTotalSoat')?.value;
    const estadoImpAnoEnCurso = this.documentosValoresInicialesForm.get('estadoImpAnoEnCurso')?.value;

    if (estadoValorTotalSoat === 'PROVISIONAL' || estadoImpAnoEnCurso === 'PROVISIONAL') {
      provisional = 'Estimado cliente los valores reflejados en la liquidación se encuentran en estado "PROVISIONAL” por tal motivo esta liquidación está sujeta a cambios de acuerdo con los valores entregados por las entidades públicas correspondientes.'
    } else {
      provisional = '';
    }

    let obsFase3 = '';
    const obsFase3Venta = this.obsFase3VentaForm.get('obsFase3Venta')?.value;

    if (obsFase3Venta === 'N/A' || obsFase3Venta === undefined) {
      obsFase3 = ''
    }

    if (this.compradorTwo.numeroIdentificacion !== '') {
      dataParaDocumento = {
        numeroInventario: numeroInventario,
        fecha: formattedDate,
        nombreCompleto: nombreCompleto,
        nombreCompletoTwo: nombreCompletoTwo,
        numeroIdentificacion: numeroIdentificacion,
        numeroIdentificacionTwo: numeroIdentificacionTwo,
        direccionResidencia: this.comprador.direccionResidencia,
        celularOne: this.comprador.celularOne,
        correoElectronico: this.comprador.correoElectronico,
        direccionResidenciaTwo: this.compradorTwo.direccionResidencia,
        celularOneTwo: this.compradorTwo.celularOne,
        correoElectronicoTwo: this.compradorTwo.correoElectronico,
        placa: this.vehiculo.placa,
        modelo: this.vehiculo.modelo,
        ciudadPlaca: this.vehiculo.ciudadPlaca,
        marcaLinea: marcaLinea,
        obsFase3Venta: obsFase3,
        provisional: provisional,
        valorPactado: this.desformatearMoneda(this.formaPagoVentaForm.get('valorVentaNumero')?.value),
        entidadBancaria: this.variablesLiquidacionVentasForm.get('entidadBancaria')?.value,
        monto: this.desformatearMoneda(this.variablesLiquidacionVentasForm.get('monto')?.value),
        traspaso: this.desformatearMoneda(this.liquidacionesVentaForm.get('traspaso')?.value),
        inscripcionPrenda: this.desformatearMoneda(this.liquidacionesVentaForm.get('inscripcionPrenda')?.value),
        comparendos: this.desformatearMoneda(this.liquidacionesVentaForm.get('comparendos')?.value),
        proporcionalImpAnoCurso: this.desformatearMoneda(this.liquidacionesVentaForm.get('proporcionalImpAnoCurso')?.value),
        devolucionSoat: this.desformatearMoneda(this.liquidacionesVentaForm.get('devolucionSoat')?.value),
        honorariosIvaIncluido: this.desformatearMoneda(this.liquidacionesVentaForm.get('honorariosIvaIncluido')?.value),
        trasladoCuenta: this.desformatearMoneda(this.liquidacionesVentaForm.get('trasladoCuenta')?.value),
        radicacionCuenta: this.desformatearMoneda(this.liquidacionesVentaForm.get('radicacionCuenta')?.value),
        totalDocumentacion: this.desformatearMoneda(this.liquidacionesVentaForm.get('totalDocumentacion')?.value),
        totalCliente: this.desformatearMoneda(this.valorTotalCliente),
        asesorComercial: this.generadorContratosVentasForm.get('asesorComercial')?.value,
        telefonoAsesor: this.generadorContratosVentasForm.get('telefonoAsesor')?.value,
        correoAsesor: this.generadorContratosVentasForm.get('correoAsesor')?.value,
        gestorDocumental: this.generadorContratosVentasForm.get('gestorDocumental')?.value,
        telefonoGestor: this.generadorContratosVentasForm.get('telefonoGestor')?.value,
        correoGestor: this.generadorContratosVentasForm.get('correoGestor')?.value,
        formaDePago: {
          ...this.formasdePagoVentaForm2.getRawValue(),
          valorPago12: this.desformatearMoneda(this.formasdePagoVentaForm2.get('valorPago12')?.value),
          valorPago22: this.desformatearMoneda(this.formasdePagoVentaForm2.get('valorPago22')?.value),
          valorPago32: this.desformatearMoneda(this.formasdePagoVentaForm2.get('valorPago32')?.value),
          valorPago42: this.desformatearMoneda(this.formasdePagoVentaForm2.get('valorPago42')?.value),
        },
        tramites: tramitesData,
      };
    } else {
      dataParaDocumento = {
        numeroInventario: numeroInventario,
        fecha: formattedDate,
        nombreCompleto: nombreCompleto,
        numeroIdentificacion: numeroIdentificacion,
        direccionResidencia: this.comprador.direccionResidencia,
        celularOne: this.comprador.celularOne,
        correoElectronico: this.comprador.correoElectronico,
        placa: this.vehiculo.placa,
        modelo: this.vehiculo.modelo,
        ciudadPlaca: this.vehiculo.ciudadPlaca,
        marcaLinea: marcaLinea,
        obsFase3Venta: obsFase3,
        provisional: provisional,
        valorPactado: this.desformatearMoneda(
          this.formaPagoVentaForm.get('valorVentaNumero')?.value
        ),
        entidadBancaria: this.variablesLiquidacionVentasForm.get('entidadBancaria')?.value,
        monto: this.desformatearMoneda(this.variablesLiquidacionVentasForm.get('monto')?.value),
        traspaso: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('traspaso')?.value
        ),
        inscripcionPrenda: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('inscripcionPrenda')?.value
        ),
        comparendos: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('comparendos')?.value
        ),
        proporcionalImpAnoCurso: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('proporcionalImpAnoCurso')?.value
        ),
        devolucionSoat: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('devolucionSoat')?.value
        ),
        honorariosIvaIncluido: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('honorariosIvaIncluido')?.value
        ),
        trasladoCuenta: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('trasladoCuenta')?.value
        ),
        radicacionCuenta: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('radicacionCuenta')?.value
        ),
        totalDocumentacion: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('totalDocumentacion')?.value
        ),
        totalCliente: this.desformatearMoneda(this.valorTotalCliente),
        asesorComercial:
          this.generadorContratosVentasForm.get('asesorComercial')?.value,
        telefonoAsesor:
          this.generadorContratosVentasForm.get('telefonoAsesor')?.value,
        correoAsesor:
          this.generadorContratosVentasForm.get('correoAsesor')?.value,
        gestorDocumental:
          this.generadorContratosVentasForm.get('gestorDocumental')?.value,
        telefonoGestor:
          this.generadorContratosVentasForm.get('telefonoGestor')?.value,
        correoGestor:
          this.generadorContratosVentasForm.get('correoGestor')?.value,
        formaDePago: {
          ...this.formasdePagoVentaForm2.getRawValue(),
          valorPago12: this.desformatearMoneda(
            this.formasdePagoVentaForm2.get('valorPago12')?.value
          ),
          valorPago22: this.desformatearMoneda(
            this.formasdePagoVentaForm2.get('valorPago22')?.value
          ),
          valorPago32: this.desformatearMoneda(
            this.formasdePagoVentaForm2.get('valorPago32')?.value
          ),
          valorPago42: this.desformatearMoneda(
            this.formasdePagoVentaForm2.get('valorPago42')?.value
          ),
        },
        tramites: tramitesData,
      };
    }

    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.http
      .post(`${this.apiUrl}/api/liquidacion-venta`, dataParaDocumento, {
        responseType: 'blob',
      })
      .subscribe(
        (blob) => {
          Swal.close();

          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `LIQUIDACION ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          Swal.close();
        }
      );
  }

  DocCruceDocumental() {
    const numeroInventario =
      this.buscarInventarioForm.get('buscarInventario')?.value;
    const tramitesRetoma = this.tramitesCruceForm.get('tramites') as FormArray;
    const tramitesVenta = this.tramitesVentasForm.get(
      'tramitesVentas'
    ) as FormArray;

    const tramitesRetomaData = tramitesRetoma.controls.map(
      (control: AbstractControl) => {
        const group = control as FormGroup;
        return group.getRawValue();
      }
    );

    const tramitesVentaData = tramitesVenta.controls.map(
      (control: AbstractControl) => {
        const group = control as FormGroup;
        return group.getRawValue();
      }
    );

    const dataParaDocumento = {
      numeroInventario: numeroInventario,
      tramitesRetoma: tramitesRetomaData,
      tramitesVenta: tramitesVentaData,
      cruceDocumental: {
        ...this.cruceDocumentalForm.getRawValue(),
        traspaso: this.desformatearMoneda(
          this.cruceDocumentalForm.get('traspaso')?.value
        ),
        retencion: this.desformatearMoneda(
          this.cruceDocumentalForm.get('retencion')?.value
        ),
        otrosImpuestos: this.desformatearMoneda(
          this.cruceDocumentalForm.get('otrosImpuestos')?.value
        ),
        levantamientoPrenda: this.desformatearMoneda(
          this.cruceDocumentalForm.get('levantamientoPrenda')?.value
        ),
        comparendos: this.desformatearMoneda(
          this.cruceDocumentalForm.get('comparendos')?.value
        ),
        propImpAnoEnCurso: this.desformatearMoneda(
          this.cruceDocumentalForm.get('propImpAnoEnCurso')?.value
        ),
        devolucionSoat: this.desformatearMoneda(
          this.cruceDocumentalForm.get('devolucionSoat')?.value
        ),
        totalRetoma: this.desformatearMoneda(
          this.cruceDocumentalForm.get('totalRetoma')?.value
        ),
        totalVentaRetoma: this.desformatearMoneda(
          this.cruceDocumentalForm.get('totalVentaRetoma')?.value
        ),
        traspasoActual: this.desformatearMoneda(
          this.cruceDocumentalForm.get('traspasoActual')?.value
        ),
        inscripcionPrendaActual: this.desformatearMoneda(
          this.cruceDocumentalForm.get('inscripcionPrendaActual')?.value
        ),
        trasladoCuentaActual: this.desformatearMoneda(
          this.cruceDocumentalForm.get('trasladoCuentaActual')?.value
        ),
        radicacionCuentaActual: this.desformatearMoneda(
          this.cruceDocumentalForm.get('radicacionCuentaActual')?.value
        ),
        comparendosComprador: this.desformatearMoneda(
          this.cruceDocumentalForm.get('comparendosComprador')?.value
        ),
        propImpAnoEnCursoActual: this.desformatearMoneda(
          this.cruceDocumentalForm.get('propImpAnoEnCursoActual')?.value
        ),
        propSoat: this.desformatearMoneda(
          this.cruceDocumentalForm.get('propSoat')?.value
        ),
        honorariosIvaIncluido: this.desformatearMoneda(
          this.cruceDocumentalForm.get('honorariosIvaIncluido')?.value
        ),
        totalDocumentacionActual: this.desformatearMoneda(
          this.cruceDocumentalForm.get('totalDocumentacionActual')?.value
        ),
      },
    };

    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.http
      .post(`${this.apiUrl}/api/cruce-documental`, dataParaDocumento, {
        responseType: 'blob',
      })
      .subscribe(
        (blob) => {
          Swal.close();

          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `CRUCE DOCUMENTAL VENTA ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          Swal.close();
        }
      );
  }

  async tramitesSalida() {
    const numeroInventario =
      this.buscarInventarioForm.get('buscarInventario')?.value;
    const now = new Date();
    const formattedDate = this.datePipe.transform(
      now,
      "EEEE, d 'de' MMMM 'del' y",
      'es-CO'
    );

    const nombreCompleto =
      this.comprador.primerApellido +
      ' ' +
      this.comprador.segundoApellido +
      ' ' +
      this.comprador.primerNombre +
      ' ' +
      this.comprador.segundoNombre;
    const formattedNumeroIdentificacion = this.formatNumber(
      this.comprador.numeroIdentificacion
    );
    let numeroIdentificacion = '';

    if (this.comprador.tipoIdentificacion === 'NIT.') {
      numeroIdentificacion =
        formattedNumeroIdentificacion +
        '-' +
        this.comprador.digitoVerificacion +
        ' de ' +
        this.comprador.numeroIdentificacion;
    } else {
      numeroIdentificacion =
        formattedNumeroIdentificacion +
        ' de ' +
        this.comprador.numeroIdentificacion;
    }

    let nombreCompletoTwo;
    let formattedNumeroIdentificacionTwo;
    let numeroIdentificacionTwo;

    if (this.compradorTwo.numeroIdentificacion !== '') {
      nombreCompletoTwo =
        this.compradorTwo.primerNombre +
        ' ' +
        this.compradorTwo.segundoNombre +
        ' ' +
        this.compradorTwo.primerApellido +
        ' ' +
        this.compradorTwo.segundoApellido;
      formattedNumeroIdentificacionTwo = this.formatNumber(
        this.compradorTwo.numeroIdentificacion
      );
      numeroIdentificacionTwo = '';

      if (this.compradorTwo.tipoIdentificacion === 'NIT.') {
        numeroIdentificacionTwo =
          formattedNumeroIdentificacionTwo +
          '-' +
          this.compradorTwo.digitoVerificacion +
          ' de ' +
          this.compradorTwo.ciudadIdentificacion;
      } else {
        numeroIdentificacionTwo =
          formattedNumeroIdentificacionTwo +
          ' de ' +
          this.compradorTwo.ciudadIdentificacion;
      }
    }

    const marcaLinea = this.vehiculo.marca + ' ' + this.vehiculo.linea;
    const provicionTramites = this.provicionTramitesVentasForm.get(
      'provicionTramitesVentas'
    ) as FormArray;

    const provicionTramitesData = provicionTramites.controls.map(
      (control: AbstractControl) => {
        const group = control as FormGroup;
        const rawValue = group.getRawValue();

        if (rawValue.valor2) {
          rawValue.valor2 = this.desformatearMoneda(rawValue.valor2);
        }

        return rawValue;
      }
    );

    const ciudadPlaca = this.vehiculo.ciudadPlaca;
    const tramitadoresEncontrados = this.tramitadores.filter(
      (t) => t.ciudad === ciudadPlaca
    );
    let tramitador: any;
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
        showCancelButton: true,
      });

      if (resultado.value) {
        tramitador = tramitadoresEncontrados.find(
          (t) => t._id === resultado.value
        );
      } else {
        return;
      }
    } else if (tramitadoresEncontrados.length === 1) {
      tramitador = tramitadoresEncontrados[0];
    }

    let manejoEnvioAutomango = 0;

    if (tramitador && tramitador.responsable === 'KATHERINE NAVARRO') {
      manejoEnvioAutomango = 0;
    } else if (tramitador) {
      manejoEnvioAutomango = this.liquidacionesVentaForm.get('manejoEnvioAutomango')?.value;
    } else {
      Swal.fire({
        title: 'Error',
        text: `No se encontró un tramitador para la ciudad "${ciudadPlaca}". Por favor primero crea el Tramitador en "bd-tramitadores"`,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    let honorariosProveedorNumerico: number = parseFloat(
      tramitador.honorariosProveedor
    );

    let dataParaDocumento;

    if (this.compradorTwo.numeroIdentificacion !== '') {
      dataParaDocumento = {
        numeroInventario: numeroInventario,
        fecha: formattedDate,
        nombreCompleto: nombreCompleto,
        numeroIdentificacion: numeroIdentificacion,
        direccionResidencia: this.comprador.direccionResidencia,
        celularOne: this.comprador.celularOne,
        correoElectronico: this.comprador.correoElectronico,

        nombreCompletoTwo: nombreCompletoTwo,
        numeroIdentificacionTwo: numeroIdentificacionTwo,
        direccionResidenciaTwo: this.compradorTwo.direccionResidencia,
        celularOneTwo: this.compradorTwo.celularOne,
        correoElectronicoTwo: this.compradorTwo.correoElectronico,

        placa: this.vehiculo.placa,
        modelo: this.vehiculo.modelo,
        ciudadPlaca: this.vehiculo.ciudadPlaca,
        marcaLinea: marcaLinea,

        valorPactado: this.formaPagoVentaForm.get('valorVentaNumero')?.value,
        entidadDeudaFinan:
          this.deudaFinancieraForm.get('entidadDeudaFinan')?.value,
        numeroObligacionFinan: this.deudaFinancieraForm.get(
          'numeroObligacionFinan'
        )?.value,
        fechaPagoDeudaFinan: this.deudaFinancieraForm.get(
          'fechaLimitePagoDeudaFinan'
        )?.value,
        valorDeudaFinanciera: this.desformatearMoneda(
          this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')
            ?.value
        ),

        retencionFuente: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('retencionFuente')?.value
        ),
        traspasoNeto: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('traspasoNeto')?.value
        ),
        soat: this.liquidacionesVentaForm.get('soat')?.value,
        impuestoAnoCurso: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('impuestoAnoCurso')?.value
        ),
        inscripcionPrenda2: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('inscripcionPrenda2')?.value
        ),
        comparendos2: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('comparendos2')?.value
        ),
        tomaImprontas: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('tomaImprontas')?.value
        ),
        manejoEnvioAutomango: this.desformatearMoneda(manejoEnvioAutomango),
        totalProvision: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('totalProvision')?.value
        ),

        asesorComercial:
          this.generadorContratosVentasForm.get('asesorComercial')?.value,
        telefonoAsesor:
          this.generadorContratosVentasForm.get('telefonoAsesor')?.value,
        correoAsesor:
          this.generadorContratosVentasForm.get('correoAsesor')?.value,
        gestorDocumental:
          this.generadorContratosVentasForm.get('gestorDocumental')?.value,
        telefonoGestor:
          this.generadorContratosVentasForm.get('telefonoGestor')?.value,
        correoGestor:
          this.generadorContratosVentasForm.get('correoGestor')?.value,
        provicionTramites: provicionTramitesData,
        tramitador: tramitador,
        honorariosProveedor: honorariosProveedorNumerico,
      };
    }
    else {
      dataParaDocumento = {
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

        valorPactado: this.formaPagoVentaForm.get('valorVentaNumero')?.value,
        entidadDeudaFinan:
          this.deudaFinancieraForm.get('entidadDeudaFinan')?.value,
        numeroObligacionFinan: this.deudaFinancieraForm.get(
          'numeroObligacionFinan'
        )?.value,
        fechaPagoDeudaFinan: this.deudaFinancieraForm.get(
          'fechaLimitePagoDeudaFinan'
        )?.value,
        valorDeudaFinanciera: this.desformatearMoneda(
          this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')
            ?.value
        ),

        retencionFuente: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('retencionFuente')?.value
        ),
        traspasoNeto: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('traspasoNeto')?.value
        ),
        soat: this.liquidacionesVentaForm.get('soat')?.value,
        impuestoAnoCurso: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('impuestoAnoCurso')?.value
        ),
        inscripcionPrenda2: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('inscripcionPrenda2')?.value
        ),
        comparendos2: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('comparendos2')?.value
        ),
        tomaImprontas: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('tomaImprontas')?.value
        ),
        manejoEnvioAutomango: this.desformatearMoneda(manejoEnvioAutomango),
        totalProvision: this.desformatearMoneda(
          this.liquidacionesVentaForm.get('totalProvision')?.value
        ),

        asesorComercial:
          this.generadorContratosVentasForm.get('asesorComercial')?.value,
        telefonoAsesor:
          this.generadorContratosVentasForm.get('telefonoAsesor')?.value,
        correoAsesor:
          this.generadorContratosVentasForm.get('correoAsesor')?.value,
        gestorDocumental:
          this.generadorContratosVentasForm.get('gestorDocumental')?.value,
        telefonoGestor:
          this.generadorContratosVentasForm.get('telefonoGestor')?.value,
        correoGestor:
          this.generadorContratosVentasForm.get('correoGestor')?.value,
        provicionTramites: provicionTramitesData,
        tramitador: tramitador,
        honorariosProveedor: honorariosProveedorNumerico,
      };
    }

    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.http
      .post(`${this.apiUrl}/api/tramites-salida`, dataParaDocumento, {
        responseType: 'blob',
      })
      .subscribe(
        (blob) => {
          Swal.close();

          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `TRÁMITES DE SALIDA ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          Swal.close();
        }
      );
  }


  onSoatSelected(event: any) {
    this.onFileChange('fotosSoat', event);
    const fotosSoat = Array.from(event.target.files) as File[];
    this.uploadPhotos(fotosSoat, 'fotosSoat');
  }

  onLiquidacionDeudaFinancieraSelected(event: any) {
    const fotosLiquidacionDeudaFinanciera = Array.from(
      event.target.files
    ) as File[];
    this.uploadLiquidacionDeudaFinancieraPhotos(
      fotosLiquidacionDeudaFinanciera
    );
  }

  onTecnoMecanicaSelected(event: any) {
    const fotosTecnoMecanica = Array.from(event.target.files) as File[];
    this.uploadTecnoMecanicaPhotos(fotosTecnoMecanica);
  }

  onManifiestoFacturaSelected(event: any) {
    const fotosManifiestoFactura = Array.from(event.target.files) as File[];
    this.uploadManifiestoFacturaPhotos(fotosManifiestoFactura);
  }

  onSoatInicialesSelected(event: any) {
    const fotosSoatIniciales = Array.from(event.target.files) as File[];
    this.uploadSoatInicialesPhotos(fotosSoatIniciales);
  }

  onImpuestoAnoSelected(event: any) {
    const fotosImpuestoAno = Array.from(event.target.files) as File[];
    this.uploadImpuestoAnoPhotos(fotosImpuestoAno);
  }

  onCopiaLlaveSelected(event: any) {
    const fotosCopiaLlave = Array.from(event.target.files) as File[];
    this.uploadCopiaLlavePhotos(fotosCopiaLlave);
  }

  onGatoSelected(event: any) {
    const fotosGato = Array.from(event.target.files) as File[];
    this.uploadGatoPhotos(fotosGato);
  }

  onLlavePernosSelected(event: any) {
    const fotosLlavePernos = Array.from(event.target.files) as File[];
    this.uploadLlavePernosPhotos(fotosLlavePernos);
  }

  onCopaSeguridadSelected(event: any) {
    const fotosCopaSeguridad = Array.from(event.target.files) as File[];
    this.uploadCopaSeguridadPhotos(fotosCopaSeguridad);
  }

  onReciboCajaSelected(event: any) {
    this.onFileChange('fotosReciboCaja', event);
    const fotosReciboCaja = Array.from(event.target.files) as File[];
    this.uploadReciboCajaPhotos(fotosReciboCaja);
  }

  onTiroArrastreSelected(event: any) {
    const fotosTiroArrastre = Array.from(event.target.files) as File[];
    this.uploadTiroArrastrePhotos(fotosTiroArrastre);
  }

  onHistorialMantenimientoSelected(event: any) {
    const fotosHistorialMantenimiento = Array.from(
      event.target.files
    ) as File[];
    this.uploadHistorialMantenimientoPhotos(fotosHistorialMantenimiento);
  }

  onManualSelected(event: any) {
    const fotosManual = Array.from(event.target.files) as File[];
    this.uploadManualPhotos(fotosManual);
  }

  onPalomeraSelected(event: any) {
    const fotosPalomera = Array.from(event.target.files) as File[];
    this.uploadPalomeraPhotos(fotosPalomera);
  }

  onTapetesSelected(event: any) {
    const fotosTapetes = Array.from(event.target.files) as File[];
    this.uploadTapetesPhotos(fotosTapetes);
  }

  onLlantaRepuestoSelected(event: any) {
    const fotosLlantaRepuesto = Array.from(event.target.files) as File[];
    this.uploadLlantaRepuestoPhotos(fotosLlantaRepuesto);
  }

  onKitCarreteraSelected(event: any) {
    const fotosKitCarretera = Array.from(event.target.files) as File[];
    this.uploadKitCarreteraPhotos(fotosKitCarretera);
  }

  onAntenaSelected(event: any) {
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

  async uploadReciboCajaPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosReciboCaja');
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

  openModal2(imagenes: string[], index: number) {
    this.imagenesModal = imagenes;
    this.imagenSeleccionadaIndex = index;
    this.showModal = true;
  }

  closeModal2() {
    this.showModal = false;
  }

  // Función de subida de archivos reutilizable
  async uploadPhotos(files: File[], fieldName: string) {
    const formData = new FormData();
    files.forEach((file: File) => {
      formData.append(fieldName, file, file.name);
    });

    try {
      const response: any = await this.http
        .put(
          `${this.apiUrl}/api/updateInventoryPhotos/${this.inventoryId}`,
          formData
        )
        .toPromise();
      Swal.fire('Fotos actualizadas!', '', 'success');

      // Actualiza las fotos directamente en la vista después de subirlas
      if (fieldName === 'fotosCopiaLlave') {
        this.fotosCopiaLlave = response.fotosCopiaLlave;
      } else if (fieldName === 'fotosGato') {
        this.fotosGato = response.fotosGato;
      } else if (fieldName === 'fotosLlavePernos') {
        this.fotosLlavePernos = response.fotosLlavePernos;
      } else if (fieldName === 'fotosCopaSeguridad') {
        this.fotosCopaSeguridad = response.fotosCopaSeguridad;
      } else if (fieldName === 'fotosReciboCaja') {
        this.fotosReciboCaja = response.documentosValoresIniciales.fotosReciboCaja;
      } else if (fieldName === 'fotosTiroArrastre') {
        this.fotosTiroArrastre = response.fotosTiroArrastre;
      } else if (fieldName === 'fotosHistorialMantenimiento') {
        this.fotosHistorialMantenimiento = response.fotosHistorialMantenimiento;
      } else if (fieldName === 'fotosManual') {
        this.fotosManual = response.fotosManual;
      } else if (fieldName === 'fotosPalomera') {
        this.fotosPalomera = response.fotosPalomera;
      } else if (fieldName === 'fotosTapetes') {
        this.fotosTapetes = response.fotosTapetes;
      } else if (fieldName === 'fotosLlantaRepuesto') {
        this.fotosLlantaRepuesto = response.fotosLlantaRepuesto;
      } else if (fieldName === 'fotosKitCarretera') {
        this.fotosKitCarretera = response.fotosKitCarretera;
      } else if (fieldName === 'fotosAntena') {
        this.fotosAntena = response.fotosAntena;
      }

      this.cdr.detectChanges();
    } catch (error: any) {
      Swal.fire('Error al actualizar las fotos!', '', 'error');
    }
  }

  async eliminarFoto(fieldName: string, index: number) {
    let fotoUrl: any;
    if (fieldName === 'fotosCopiaLlave') {
      fotoUrl = this.fotosCopiaLlave[index];
    } else if (fieldName === 'fotosGato') {
      fotoUrl = this.fotosGato[index];
    } else if (fieldName === 'fotosLlavePernos') {
      fotoUrl = this.fotosLlavePernos[index];
    } else if (fieldName === 'fotosCopaSeguridad') {
      fotoUrl = this.fotosCopaSeguridad[index];
    } else if (fieldName === 'fotosReciboCaja') {
      fotoUrl = this.fotosReciboCaja[index];
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
    } else if (fieldName === 'fotosReciboCaja') {
      fotoUrl = this.fotosReciboCaja[index];
    } else if (fieldName === 'fotosLlantaRepuesto') {
      fotoUrl = this.fotosLlantaRepuesto[index];
    } else if (fieldName === 'fotosKitCarretera') {
      fotoUrl = this.fotosKitCarretera[index];
    } else if (fieldName === 'fotosAntena') {
      fotoUrl = this.fotosAntena[index];
    }

    try {
      await this.http
        .delete(`${this.apiUrl}/api/deleteInventoryPhoto`, {
          body: {
            inventoryId: this.inventoryId,
            field: fieldName,
            photoUrl: fotoUrl,
          },
        })
        .toPromise();

      if (fieldName === 'fotosCopiaLlave') {
        this.fotosCopiaLlave.splice(index, 1);
      } else if (fieldName === 'fotosGato') {
        this.fotosGato.splice(index, 1);
      } else if (fieldName === 'fotosLlavePernos') {
        this.fotosLlavePernos.splice(index, 1);
      } else if (fieldName === 'fotosCopaSeguridad') {
        this.fotosCopaSeguridad.splice(index, 1);
      } else if (fieldName === 'fotosReciboCaja') {
        this.fotosReciboCaja.splice(index, 1);
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

      this.cdr.detectChanges();
    } catch (error: any) {
      // Manejo del error
      console.error('Error al eliminar la foto!', error);
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

  esAutomagnos(
    beneficiario: string,
    idBeneficiario: string,
    numeroCuentaObligaPago: string,
    tipoCuentaPago: string,
    entidadDepositarPago: string
  ) {
    const is = this.formasdePagoVentaForm2.get(beneficiario)?.value;

    if (is && is.toLowerCase() === 'automagno sas bancol') {
      this.formasdePagoVentaForm2
        .get(entidadDepositarPago)
        ?.setValue('BANCOLOMBIA');
      this.formasdePagoVentaForm2.get(tipoCuentaPago)?.setValue('CORRIENTE');
      this.formasdePagoVentaForm2.get(idBeneficiario)?.setValue('900187453-0');
      this.formasdePagoVentaForm2
        .get(numeroCuentaObligaPago)
        ?.setValue('18042423520');
    } else if (is && is.toLowerCase() === 'automagno sas davi') {
      this.formasdePagoVentaForm2
        .get(entidadDepositarPago)
        ?.setValue('BANCO DAVIVIENDA');
      this.formasdePagoVentaForm2.get(tipoCuentaPago)?.setValue('AHORROS');
      this.formasdePagoVentaForm2.get(idBeneficiario)?.setValue('900187453-0');
      this.formasdePagoVentaForm2
        .get(numeroCuentaObligaPago)
        ?.setValue('006301228950');
    } else {
      return;
    }
  }

  async actualizarInventario() {

    const otrosTramitesAccesoriosVentas = this.convertirArrayAObjeto(
      this.tramitesVentasForm.get('tramitesVentas') as FormArray
    );
    const otrosTramitesVendedorVentas = this.convertirArrayAObjeto2(
      this.provicionTramitesVentasForm.get(
        'provicionTramitesVentas'
      ) as FormArray
    );
    const valorVentaNumerico = this.desformatearMoneda(
      this.formaPagoVentaForm.get('valorVentaNumero')?.value
    );
    const estadoCuentaImpuestoValor = this.desformatearMoneda(
      this.documentosValoresInicialesForm.get('estadoCuentaImpuestoValor')
        ?.value
    );
    const simitPropietarioValor = this.desformatearMoneda(
      this.documentosValoresInicialesForm.get('simitPropietarioValor')?.value
    );
    const liquidacionDeudaFinValor = this.desformatearMoneda(
      this.documentosValoresInicialesForm.get('liquidacionDeudaFinValor')?.value
    );
    const totalSoatValor = this.desformatearMoneda(
      this.documentosValoresInicialesForm.get('totalSoatValor')?.value
    );
    const impAnoEnCursoValor = this.desformatearMoneda(
      this.documentosValoresInicialesForm.get('impAnoEnCursoValor')?.value
    );
    const valorRetencionValor = this.desformatearMoneda(
      this.documentosValoresInicialesForm.get('valorRetencionValor')?.value
    );
    const comparendosVariables = this.desformatearMoneda(
      this.variablesLiquidacionVentasForm.get('comparendosVariables')?.value
    );
    const monto = this.desformatearMoneda(
      this.variablesLiquidacionVentasForm.get('monto')?.value
    );
    const tomaImprontasVariables = this.desformatearMoneda(
      this.variablesLiquidacionVentasForm.get('tomaImprontasVariables')?.value
    );
    const valorPago12 = this.desformatearMoneda(
      this.formasdePagoVentaForm2.get('valorPago12')?.value
    );
    const valorPago22 = this.desformatearMoneda(
      this.formasdePagoVentaForm2.get('valorPago22')?.value
    );
    const valorPago32 = this.desformatearMoneda(
      this.formasdePagoVentaForm2.get('valorPago32')?.value
    );
    const valorPago42 = this.desformatearMoneda(
      this.formasdePagoVentaForm2.get('valorPago42')?.value
    );
    const updatedInventoryData = {
      comprador: this.comprador._id,
      compradorTwo: this.compradorTwo._id,
      placa: this.vehiculo.placa,
      filtroBaseDatos: {
        organizacion: this.filtroBDForm.get('organizacion')?.getRawValue(),
        tipoNegocio: this.filtroBDForm.get('tipoNegocio')?.getRawValue(),
        proveedor: this.filtroBDForm.get('proveedor')?.getRawValue(),
        estadoInventario: this.filtroBDForm.get('estadoInventario')?.getRawValue(),
        fechaIngreso: this.filtroBDForm.get('fechaIngreso')?.getRawValue(),
        ubicacion: this.filtroBDForm.get('ubicacion')?.getRawValue(),
        tallerProveedor: this.filtroBDForm.get('tallerProveedor')?.getRawValue(),
        fechaExpedicion: this.filtroBDForm.get('fechaExpedicion')?.getRawValue(),
      },
      peritajeProveedor: {
        lugar: this.peritajeImprontasForm.get('lugar')?.getRawValue(),
        estado: this.peritajeImprontasForm.get('estado')?.getRawValue(),
        numeroInspeccion: this.peritajeImprontasForm
          .get('numeroInspeccion')
          ?.getRawValue(),
        linkInspeccion: this.peritajeImprontasForm
          .get('linkInspeccion')
          ?.getRawValue(),
        impronta: this.peritajeImprontasForm.get('impronta')?.getRawValue(),
      },
      link: this.archivoDigital,
      documentosValoresIniciales: {
        ...this.documentosValoresInicialesForm.getRawValue(),
        estadoCuentaImpuestoValor: estadoCuentaImpuestoValor,
        simitPropietarioValor: simitPropietarioValor,
        liquidacionDeudaFinValor: liquidacionDeudaFinValor,
        totalSoatValor: totalSoatValor,
        impAnoEnCursoValor: impAnoEnCursoValor,
        valorRetencionValor: valorRetencionValor,
      },
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
      obsFase3Venta: this.obsFase3VentaForm.value,
      deudaFinanciera: this.deudaFinancieraForm.value,
      liquidacionesVenta: this.liquidacionesVentaForm.getRawValue(),
      cruceDocumental: this.cruceDocumentalForm.getRawValue(),
      otrosTramitesAccesoriosVentas,
      observacionGlobal: this.observacionGlobal,
      otrosTramitesVendedorVentas,
      variablesLiquidacionVentas: {
        ...this.variablesLiquidacionVentasForm.value,
        comparendosVariables: comparendosVariables,
        tomaImprontasVariables: tomaImprontasVariables,
        monto: monto,
      },

      formaPagoVenta: {
        valorVentaLetras: this.formaPagoVentaForm
          .get('valorVentaLetras')
          ?.getRawValue(),
        clausulaPenalLetras: this.formaPagoVentaForm
          .get('clausulaPenalLetras')
          ?.getRawValue(),
        clausulaPenalNumeros: this.desformatearMoneda(this.formattedValueClausula2),
        fechaEntrega: this.formaPagoVentaForm
          .get('fechaEntrega')
          ?.getRawValue(),
        valorVentaNumero: valorVentaNumerico,
        fechaVenta: this.formaPagoVentaForm.get('fechaVenta')?.value,
      },
      formadePagoVenta2: {
        ...this.formasdePagoVentaForm2.value,
        valorPago12: valorPago12,
        valorPago22: valorPago22,
        valorPago32: valorPago32,
        valorPago42: valorPago42,
      },
      generadorContratosVentas: this.generadorContratosVentasForm.getRawValue(),


    };

    try {
      let response: any = await this.http
        .put(
          `${this.apiUrl}/api/updateInventories/${this.inventoryId}`,
          updatedInventoryData
        )
        .toPromise();
      this.registroActividad = (response.controlAccesorios.registroActividad || []).reverse();
      this.initialValues = this.getCurrentFormValues();
      const toastEl = document.getElementById('actualizado');
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
      /*
      if (updatedInventoryData.filtroBaseDatos.estadoInventario === 'VENDIDO') {
        await this.actualizarMondayCom(updatedInventoryData.placa, this.buscarInventarioForm.get('buscarInventario')?.value, updatedInventoryData.liquidacionesVenta.totalDocumentacion);
      }
        */

      this.updateInventory(this.inventoryId);
    } catch (error: any) { }
  }

  deepCompare(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  getCurrentFormValues() {
    return {
      filtroBDForm: this.filtroBDForm.getRawValue(),
      cruceDocumentalForm: this.cruceDocumentalForm.getRawValue(),
      formaPagoVentaForm: this.formaPagoVentaForm.getRawValue(),
      peritajeImprontasForm: this.peritajeImprontasForm.getRawValue(),
      documentosValoresInicialesForm: this.documentosValoresInicialesForm.getRawValue(),
      deudaFinancieraForm: this.deudaFinancieraForm.getRawValue(),
      obsFase3VentaForm: this.obsFase3VentaForm.getRawValue(),
      controlAccesoriosForm: this.controlAccesoriosForm.getRawValue(),
      formasdePagoVentaForm2: this.formasdePagoVentaForm2.getRawValue(),
      liquidacionesVentaForm: this.liquidacionesVentaForm.getRawValue(),
      generadorContratosVentasForm: this.generadorContratosVentasForm.getRawValue(),
      tramitesCruceForm: this.tramitesCruceForm.getRawValue(),
      tramitesVentasForm: this.tramitesVentasForm.getRawValue(),
      provicionTramitesVentasForm: this.provicionTramitesVentasForm.getRawValue(),
      variablesLiquidacionVentasForm: this.variablesLiquidacionVentasForm.getRawValue(),
    };
  }

  async actualizarMondayCom(placa: string, inventoryId: any, totalDocumentacion: string) {
    try {
      await this.http.post(`${this.apiUrl}/api/updateMondayCom`, {
        placa,
        inventoryId,
        totalDocumentacion
      }).toPromise();
    } catch (error: any) {
      console.error('Error actualizando Monday.com:', error);
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

  funcionVer12() {
    if (this.ver12) {
      this.ver12 = false;
    } else {
      this.ver12 = true;
    }
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

    const numeroIdentificacionC = this.comprador.numeroIdentificacion;
    const formattedNumeroIdentificacionC = this.formatNumber(numeroIdentificacionC);

    if (numeroIdentificacionC === '') {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No hay ningun comprador registrado",
      });
      return;
    }

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
      primerApellidoC: this.comprador.primerApellido,
      segundoApellidoC: this.comprador.segundoApellido,
      primerNombreC: this.comprador.primerNombre,
      segundoNombreC: this.comprador.segundoNombre,
      tipoIdentificacionC: this.comprador.tipoIdentificacion,
      digitoVerificacionC: this.comprador.digitoVerificacion,
      numeroIdentificacionC: formattedNumeroIdentificacionC,
      direccionResidenciaC: this.comprador.direccionResidencia,
      ciudadResidenciaC: this.comprador.ciudadResidencia,
      celularOneC: this.comprador.celularOne,
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

    this.http.post(`${this.apiUrl}/api/funt-venta`, dataParaDocumento, { responseType: 'blob' })
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

  buscarClientePorId(clienteId: string) {
    this.http.get<any>(`${this.apiUrl}/api/getClients/${clienteId}`).subscribe(
      (clienteData) => {
        this.clients = clienteData;
        this.clients.fechaIngreso = new Date(clienteData.fechaIngreso).toISOString().substring(0, 10);
      },
      (error) => { }
    );
  }

  buscarCompradorPorId(clienteId: string) {
    if (this.comprador._id !== '') {
      this.http
        .get<any>(`${this.apiUrl}/api/getClients/${clienteId}`)
        .subscribe(
          (compradorData) => {
            this.comprador = compradorData;
            this.comprador.fechaIngreso = new Date(compradorData.fechaIngreso).toISOString().substring(0, 10);
            this.aplicarRetencionSiNoEsNIT();
          },
          (error) => { }
        );
    }
  }

  buscarCompradorTwoPorId(clienteId: string) {
    if (this.compradorTwo._id !== '') {
      this.http
        .get<any>(`${this.apiUrl}/api/getClients/${clienteId}`)
        .subscribe(
          (compradorData) => {
            this.compradorTwo = compradorData;
            this.compradorTwo.fechaIngreso = new Date(compradorData.fechaIngreso)
              .toISOString()
              .substring(0, 10);
            this.aplicarRetencionSiNoEsNIT();
          },
          (error) => { }
        );
    }
  }

  buscarVehiculoPorId(vehiculoId: string) {
    this.http
      .get<any>(`${this.apiUrl}/api/getVehicles/${vehiculoId}`)
      .subscribe(
        (vehiculoData) => {
          this.vehiculo = vehiculoData;
          this.vehiculo.fechaMatricula = new Date(vehiculoData.fechaMatricula).toISOString().substring(0, 10);
          this.vehiculo.fechaImportacion = new Date(vehiculoData.fechaImportacion).toISOString().substring(0, 10);

          const esTrue = this.cruceDocumentalForm.get('esCruce')?.value;

          if (esTrue) {
            this.cruceDocumentalForm.get('placaActual')?.setValue(this.vehiculo.placa);
            this.cruceDocumentalForm.get('ciudadActual')?.setValue(this.vehiculo.ciudadPlaca);
          }
        },
        (error) => { }
      );
  }

  buscarVehiculoPorIdCruce(vehiculoId: string) {
    this.http
      .get<any>(`${this.apiUrl}/api/getVehicles/${vehiculoId}`)
      .subscribe(
        (vehiculoData) => {
          this.cruceDocumentalForm.get('placa')?.setValue(vehiculoData.placa);
          this.cruceDocumentalForm.get('ciudad')?.setValue(vehiculoData.ciudadPlaca);
        },
        (error) => { }
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
    if (!this.suppliers) {
      console.error('No se ha inicializado el arreglo de proveedores.');
      return;
    }

    this.suppliers.sort((a, b) => {
      const departamentoA = a.name ? a.name.toLowerCase() : '';
      const departamentoB = b.name ? b.name.toLowerCase() : '';

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

  onFileChange(fieldName: string, event: any) {
    const files = Array.from(event.target.files).map((file: any) => file.name);
    this.sendActivityLog({
      type: 'file',
      fieldName: fieldName,
      value: files
    });
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

  sendActivityLog(activity: { type: string; fieldName: string; value: any }) {
    const newActivity = this.createActivityLogEntry(
      activity.type,
      activity.fieldName,
      activity.value
    );

    const inventoryId = this.inventoryId;
    this.http
      .post(
        `${this.apiUrl}/api/inventories/addActivityLog/${inventoryId}`,
        newActivity
      )
      .subscribe({
        next: (response: any) => {
          this.registroActividad = response.registroActividad.reverse();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al registrar la actividad:', error);
        },
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
      descripcion = `${user} modificó la observación del ${this.getFieldDisplayName(
        fieldNameWithoutObs
      )} a "${value}"`;
    } else if (fieldName.startsWith('check')) {
      const fieldNameWithoutCheck = fieldName.slice(5);
      const estado = value ? 'activó' : 'desactivó';
      descripcion = `${user} ${estado} el ${this.getFieldDisplayName(
        fieldNameWithoutCheck
      )}`;
    } else if (type === 'select') {
      descripcion = `${user} modificó ${this.getFieldDisplayName(
        fieldName
      )} a "${value}"`;
    } else if (type === 'file') {
      descripcion = `${user} agregó un archivo en ${this.getFieldDisplayName(
        fieldName
      )}`;
    } else if (type === 'fileDelete') {
      descripcion = `${user} eliminó un archivo de ${this.getFieldDisplayName(
        fieldName
      )}`;
    } else {
      descripcion = `${user} modificó ${this.getFieldDisplayName(
        fieldName
      )} a "${value}"`;
    }

    return { type, fieldName, value, image, descripcion, fecha: new Date() };
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldDisplayNames: { [key: string]: string } = {
      organizacion: 'Organización',
      tipoNegocio: 'Tipo Negocio',
      proveedor: 'Proveedor',
      estadoInventario: 'Estado Inventario',
      fechaIngreso: 'Fecha Ingreso',
      ubicacion: 'Ubicación',
      tallerProveedor: 'Taller Proveedor',
      fechaExpedicion: 'Fecha Expedición',
      obsFase3Venta: 'Observación Fase 3 Venta',
      copiaLlave: 'Copia Llave',
      valorCompraLetras: 'Valor Compra Letras',
      valorCompraNumero: 'Valor Compra Número',
      fechaEntrega: 'Fecha Entrega',
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
      descripcionPago12: 'Descripción Pago 1',
      formaPagoPago12: 'Forma de Pago 1',
      entidadDepositarPago12: 'Entidad a Depositar Pago 1',
      numeroCuentaObligaPago12: 'Número Cuenta Obligación Pago 1',
      tipoCuentaPago12: 'Tipo Cuenta Pago 1',
      beneficiarioPago12: 'Beneficiario Pago 1',
      idBeneficiarioPago12: 'ID Beneficiario Pago 1',
      fechaPago12: 'Fecha Pago 1',
      valorPago12: 'Valor Pago 1',
      descripcionPago22: 'Descripción Pago 2',
      formaPagoPago22: 'Forma de Pago 2',
      entidadDepositarPago22: 'Entidad a Depositar Pago 2',
      numeroCuentaObligaPago22: 'Número Cuenta Obligación Pago 2',
      tipoCuentaPago22: 'Tipo Cuenta Pago 2',
      beneficiarioPago22: 'Beneficiario Pago 2',
      idBeneficiarioPago22: 'ID Beneficiario Pago 2',
      fechaPago22: 'Fecha Pago 2',
      valorPago22: 'Valor Pago 2',
      descripcionPago32: 'Descripción Pago 3',
      formaPagoPago32: 'Forma de Pago 3',
      entidadDepositarPago32: 'Entidad a Depositar Pago 3',
      numeroCuentaObligaPago32: 'Número Cuenta Obligación Pago 3',
      tipoCuentaPago32: 'Tipo Cuenta Pago 3',
      beneficiarioPago32: 'Beneficiario Pago 3',
      idBeneficiarioPago32: 'ID Beneficiario Pago 3',
      fechaPago32: 'Fecha Pago 3',
      valorPago32: 'Valor Pago 3',
      descripcionPago42: 'Descripción Pago 4',
      formaPagoPago42: 'Forma de Pago 4',
      entidadDepositarPago42: 'Entidad a Depositar Pago 4',
      numeroCuentaObligaPago42: 'Número Cuenta Obligación Pago 4',
      tipoCuentaPago42: 'Tipo Cuenta Pago 4',
      beneficiarioPago42: 'Beneficiario Pago 4',
      idBeneficiarioPago42: 'ID Beneficiario Pago 4',
      fechaPago42: 'Fecha Pago 4',
      asesorComercial: 'Asesor Comercial',
      telefonoAsesor: 'Teléfono Asesor',
      correoAsesor: 'Correo Asesor',
      gestorDocumental: 'Gestor Documental',
      telefonoGestor: 'Teléfono Gestor',
      correoGestor: 'Correo Gestor',
      kilometraje: 'Kilometraje',
      horaRecepcion: 'Hora Recepción',
      empresa: 'Empresa',
      traslado: 'Traslado',
      tieneCredito: 'Tiene Crédito',
      ciudadTraslado: 'Ciudad Traslado',
      comparendosVariables: 'Comparendos Variables',
      tomaImprontasVariables: 'Toma Improntas Variables',
      entidadBancaria: 'Entidad Bancaria',
      monto: 'Monto',
      fechaTecnicoMecanica: 'Fecha Técnico Mecánica',
      cobraHonorarios: 'Cobra Honorarios',
      promedioImpuesto: 'Promedio Impuesto',
      promediaSoat: 'Promedia SOAT',
      ultimoKilometraje: 'Último Kilometraje',
      lugarUltimoMantenimiento: 'Lugar del Último Mantenimiento',
      fechaUltimoMantenimiento: 'Fecha del Último Mantenimiento',
      fotosCedulaPropietario: 'Cédula Propietario',
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
      fotosReciboCaja: 'Recibo de caja',
      fotosTiroArrastre: 'Tiro de Arrastre',
      fotosHistorialMantenimiento: 'Historial de Mantenimiento',
      fotosManual: 'Manual',
      fotosPalomera: 'Palomera',
      fotosTapetes: 'Tapetes',
      fotosLlantaRepuesto: 'Llanta de Repuesto',
      fotosKitCarretera: 'Kit de Carretera',
      fotosAntena: 'Antena',
      valorVentaLetras: 'Valor de Venta en Letras',
      valorVentaNumero: 'Valor de Venta en Numero',
      clausulaPenalLetras: 'Clausula Penal en Letras',
      clausulaPenalNumeros: 'Clausula Penal en Números',
      oficioDesembargo: 'Oficio de Desembargo',
      copiaLlaveObs: 'Observación de Copia de Llave',
      gato: 'Gato',
      gatoObs: 'Observación de Gato',
      llavePernos: 'Llave de Pernos',
      llavePernosObs: 'Observación de llave de Pernos',
      copaSeguridad: 'Copa de Seguridad',
      copaSeguridadObs: 'Observación de Copa Seguridad',
      tiroArrastre: 'Tiro de Arrastre',
      tiroArrastreObs: 'Observación de Tiro de Arrastre',
      historialMantenimiento: 'Historial de Mantenimiento',
      historialMantenimientoObs: 'Observación de Historial de Mantenimiento',
      manual: 'Manual',
      manualObs: 'Observación de Manual',
      palomera: 'Palomera',
      palomeraObs: 'Observación de Palomera',
      tapetes: 'Tapetes',
      tapetesObs: 'Observación de Tapetes',
      llantaRepuesto: 'Llanta Repuesto',
      llantaRepuestoObs: 'Observación de Llanta Repuesto',
      kitCarretera: 'Kit Carretera',
      kitCarreteraObs: 'Observación de kit de Carretera',
      antena: 'Antena',
      antenaObs: 'Observación de Antena',
      valorPago42: 'Valor de Pago',
      inscripcionPrenda: 'Inscripción de Prenda',
      proporcionalImpAnoCurso: 'Proporcional del Impuesto Año en Curso',
      devolucionSoat: 'Devolución de Soat',
      honorariosIvaIncluido: 'Honorarios Iva Incluido',
      retencionFuente: 'Retención de Fuente',
      traspasoNeto: 'Traspaso Neto',
      impuestoAnoCurso: 'Impuesto Año en Curso',
      inscripcionPrenda2: 'Inscripción Prenda',
      comparendos2: 'Comparendos',
      tomaImprontas: 'Toma de Improntas',
      manejoEnvioAutomango: 'Manejo Envio Automango',
      trasladoCuenta: 'Traslado de Cuenta',
      radicacionCuenta: 'Radicación Cuenta',
      honorariosTramitador: 'Honorarios de Tramitador',
      totalDocumentacion: 'Total Documentación',
      totalProvision: 'Total de Provisión',
      esCruce: 'Es Cruce',
      numInventario: 'Número de Inventario',
      placa: 'Placa',
      ciudad: 'Ciudad',
      retencion: 'Retencion',
      otrosImpuestos: 'Otros Impuestos',
      levantamientoPrenda: 'Levantamiento de Prenda',
      propImpAnoEnCurso: 'Proporcional del Impuesto Año en Curso',
      totalRetoma: 'Total Retoma',
      totalVentaRetoma: 'Total Venta Retoma',
      placaActual: 'Placa Actual',
      ciudadActual: 'Ciudad Actual',
      traspasoActual: 'Traspaso Actual',
      inscripcionPrendaActual: 'Inscripción de Prenda Actual',
      trasladoCuentaActual: 'Traslado de Cuenta Actual',
      radicacionCuentaActual: 'Radicación de Cuenta Actual',
      comparendosComprador: 'Comparendos del Comprador',
      propImpAnoEnCursoActual: 'Proporcional del Impuesto Año Actual',
      propSoat: 'Proporcional Soat',
      totalDocumentacionActual: 'Total Documentación Actual',
      horaRecepciom: 'Hora de Recepción',
      tramites: 'Trámites',
      tramitesVentas: 'Trámites de Ventas',
      provicionTramitesVentas: 'Provisión de Trámites Ventas',
    };

    return fieldDisplayNames[fieldName] || fieldName;
  }
}
