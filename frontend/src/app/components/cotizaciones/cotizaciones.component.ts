import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientsService } from 'src/app/services/clients.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription, map, of, startWith } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { environment } from 'src/app/environments/environment';
declare var bootstrap: any;

interface CotizacionGuardada {
  _id?: string;
  cliente: string;
  vehiculo: string;
  valorVehiculo: string;
  tieneCredito?: boolean;
  valorCredito?: string;
  cobraSoat?: boolean;
  cobraImpuesto?: boolean;
  valorTotalSoat?: string;
  fechaFinSoat?: string;
  valorImpAnoEnCurso?: string;
  honorarios?: string;
  traspaso50?: string;
  propImpAnoCurso?: string;
  PropSoat?: string;
  kilometraje?: string;
  costoVehiculo?: string;
  totalDocumentacion?: string;
  totalNegocio?: string;
  prenda?: string;
  asesorComercial?: string;
  numeroAsesor?: string;
  separacion5?: string;
  valorFinanciar?: string;
  cuotaMensual?: string;
  noCuotas?: string;
  tasaInteresConFormato?: string;
  plazoEnAnosYMeses?: string;
  noCotizacion: any;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.css'
})

export class CotizacionesComponent implements OnInit, OnDestroy {
  lugares!: any[];
  loading = false;
  suppliers!: any[];
  users!: any[];
  variables!: any[];
  clienteForm: FormGroup;
  fechaActual: string;
  inventoryId: string = '';
  btnChange = false;
  placaValue = '';
  inventarios: any[] = [];
  pagoMensual: string = '0';
  ocultar = false;
  mostrarSiguienteModal: boolean = false;
  provisional: boolean = false;
  mostrarSiguienteModal2: boolean = false;
  btnEsconderCotizacion: boolean = false;
  mostrarCredito: boolean = false;
  buscarInventarioForm: FormGroup;
  financiamientoForm: FormGroup;
  buscarInventarioPlacaForm: FormGroup;
  buscarCotizacionForm: FormGroup;
  condicionesNegocioForm: FormGroup;
  datosCotizacionesForm: FormGroup;
  cotizaciones: any[] = [];
  buscarCotizacionPlacaForm: FormGroup;
  vehiculo: any = {};
  noCotizacion: any;
  impuesto: any;
  usuariosGestores: any[] = [];
  usuariosAsesor: any[] = [];
  mostrarSiguienteModal3: boolean = false;
  costosTramites!: any[];
  traspaso50: any;
  prenda: any;
  honorariosTramitador: any;
  diasDevolucionImpuesto: any;
  traspasoNeto: any;
  valorTotalCliente: any;
  fechaActual2: any;
  subscription: Subscription;
  private modalInstance: any;

  allVehicles: any[] = [];
  vehiculoInvControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  allVehiclesInv: any[] = [];
  vehiculoInvOneControl = new FormControl();
  opcionesFiltradasVehInv: Observable<any[]> = of([]);

  anoActual: any;
  tasaInteres: any;
  honorariosAutomagno: any;
  btnEsconder: Boolean = false;
  monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];
  manejoEnvioAutomango: number = 0;
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private sharedData: SharedDataService, private http: HttpClient, private vehiclesService: VehiclesService, private clientsService: ClientsService, private authService: AuthService, private formBuilder: FormBuilder) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });


    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.closeAllModals();
      }
    });

    this.subscription = this.sharedData.currentInventoryId.subscribe({
      next: (id) => {
        if (id) {
          this.utilizarInventario(id);
        }
      },
      error: (err) => console.error('', err)
    });

    this.fechaActual = new Date().toISOString().substring(0, 10);
    this.fechaActual2 = new Date().toISOString().substring(0, 4);
    this.anoActual = this.fechaActual2 + '-12-31';
    const fechaActualDate = new Date(this.fechaActual);
    const anoActualDate = new Date(this.anoActual); // Convertir a objeto Date
    let resta = anoActualDate.getTime() - fechaActualDate.getTime();
    this.diasDevolucionImpuesto = resta / (1000 * 3600 * 24);

    this.financiamientoForm = this.formBuilder.group({
      valorFinanciar: ['$ 0'],
      plazoMeses: ['']
    });

    this.buscarInventarioForm = this.formBuilder.group({
      buscarInventario: ['', Validators.required]
    });

    this.buscarCotizacionForm = this.formBuilder.group({
      buscarCotizacion: ['', Validators.required]
    });

    this.buscarInventarioPlacaForm = this.formBuilder.group({
      buscarInventarioPlaca: ['', Validators.required]
    });

    this.buscarCotizacionPlacaForm = this.formBuilder.group({
      buscarCotizacionPlaca: ['', Validators.required]
    });

    this.clienteForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      tipoIdentificacion: [''],
      numeroIdentificacion: [''],
      telefono: [''],
      email: ['', Validators.email]
    });


    this.condicionesNegocioForm = this.formBuilder.group({
      valorVehiculo: ['$ 0', Validators.required],
      tieneCredito: [false],
      valorCredito: [{ value: '$ 0', disabled: true }],
      cobraSoat: [true],
      cobraImpuesto: [true]
    });

    this.condicionesNegocioForm.get('cobraSoat')?.setValue(true);
    this.condicionesNegocioForm.get('cobraImpuesto')?.setValue(true);
    this.condicionesNegocioForm.get('valorCredito')?.setValue('$ 0');

    this.datosCotizacionesForm = this.formBuilder.group({
      valorTotalSoat: [{ value: '$ 0', disabled: true }],
      fechaFinSoat: [{ value: '', disabled: true }],
      valorImpAnoEnCurso: [{ value: '$ 0', disabled: true }],
      honorarios: [{ value: '$ 0', disabled: true }],
      traspaso50: [{ value: '$ 0', disabled: true }],
      propImpAnoCurso: [{ value: '$ 0', disabled: true }],
      PropSoat: [{ value: '$ 0', disabled: true }],
      kilometraje: [''],
      costoVehiculo: [{ value: '$ 0', disabled: true }],
      valorCredito: [{ value: '$ 0', disabled: true }],
      totalDocumentacion: [{ value: '$ 0', disabled: true }],
      totalNegocio: [{ value: '$ 0', disabled: true }],
      prenda: [{ value: '$ 0', disabled: true }],
      asesorComercial: ['', Validators.required],
      numeroAsesor: [{ value: '', disabled: true }],
      separacion5: [{ value: '$ 0', disabled: true }],
    });
    this.condicionesNegocioForm.get('valorCredito')?.disable();
  }

  ngOnDestroy(): void {
    this.closeModal();
    this.subscription.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.sharedData.clearCurrentInventoryId();
  }

  private validarFormularios(): boolean {
    const forms = [
      this.clienteForm,
      this.financiamientoForm,
      this.condicionesNegocioForm,
      this.datosCotizacionesForm,
    ];

    let isValid = true;

    for (const form of forms) {
      if (form.invalid) {
        isValid = false;
        Object.values(form.controls).forEach(control => {
          control.markAsTouched();
        });
      }
    }

    return isValid;
  }

  private removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  utilizarInventario(inventarioId: string) {
    this.buscarInventarioForm.get('buscarInventario')?.setValue(inventarioId);
    this.limpiarFormularios();
    this.buscarInventario();
    this.openModal();
  }

  isInvalidValue(value: string): boolean {
    return this.desformatearMoneda(value) === 0;
  }

  private openModal(): void {
    const modalElement = document.getElementById('staticBackdrop17');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
      this.addModalEventListeners(modalElement);
    }
  }

  private addModalEventListeners(modalElement: HTMLElement): void {
    modalElement.addEventListener('hidden.bs.modal', () => {
    });
  }

  private closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  buscarInventario() {
    this.limpiarFormularios();

    if (this.buscarInventarioForm.valid) {
      setTimeout(() => {
        const inventarioId = this.buscarInventarioForm.get('buscarInventario')?.value;
        this.http.get<any>(`${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`).subscribe(
          data => {
            this.inventoryId = data._id;
            this.btnEsconder = true;
            this.btnChange = true;
            this.buscarVehiculoPorId(data.vehiculo);
            this.mostrarSiguienteModal2 = true;
            const fechaFinSoat = new Date(data.documentosValoresIniciales.fechaFinSoat).toISOString().substring(0, 10);
            this.impuesto = data.documentosValoresIniciales.impAnoEnCursoValor;
            const kilometraje = this.formatNumberWithSeparators2(data.generadorContratos.kilometraje);

            this.datosCotizacionesForm.patchValue({
              valorTotalSoat: this.formatCurrency(data.documentosValoresIniciales.totalSoatValor),
              fechaFinSoat: fechaFinSoat,
              valorImpAnoEnCurso: this.formatCurrency(data.documentosValoresIniciales.impAnoEnCursoValor),
              kilometraje: kilometraje
            });

            const estadoValorTotalSoat = data.documentosValoresIniciales.estadoValorTotalSoat;
            const estadoImpAnoEnCurso = data.documentosValoresIniciales.estadoImpAnoEnCurso;

            if (estadoValorTotalSoat === 'PROVISIONAL' || estadoImpAnoEnCurso === 'PROVISIONAL') {
              this.provisional = true;
            } else {
              this.provisional = false;
            }
            
            this.condicionesNegocioForm.get('valorCredito')?.setValue('$ 0');
            this.condicionesNegocioForm.get('valorVehiculo')?.setValue('$ 0');
            this.datosCotizacionesForm.get('valorCredito')?.setValue('$ 0');
            this.datosCotizacionesForm.get('costoVehiculo')?.setValue('$ 0');

            this.obtenerCostoTraspaso50();
            this.obtenerHonorariosIvaIncluido();
            this.activarImpAnoEnCurso();
            this.activarValorSoatTotal();
            this.obtenerPrenda();
            this.calcularTotal();
            this.calcularTotalCliente();
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

  buscarCotizacionPlaca() {
    const placa = this.vehiculoInvControl.value;
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/cotizaciones/${placa}`).subscribe(
      data => {
        this.cotizaciones = data.map(cotizacion => ({
          noCotizacion: cotizacion.noCotizacion,
          nombre: cotizacion.nombre,
          numeroIdentificacion: cotizacion.numeroIdentificacion,
          marcaVehiculo: cotizacion.marcaVehiculo,
          lineaVehiculo: cotizacion.lineaVehiculo,
          totalNegocio: cotizacion.totalNegocio
        })).sort((a: any, b: any) => b.noCotizacion - a.noCotizacion);

      },
      error => {
        Swal.fire({
          icon: "error",
          title: "No encontrado",
          text: "El vehículo no existe",
        });
        this.cotizaciones = [];
      }
    );
  }

  cotizacionBuscar() {
    if (!this.vehiculo.imagenVehiculo) {
      Swal.fire({
        icon: "warning",
        title: "Imagen del Vehículo Faltante",
        text: "Por favor, actualice la imagen del vehículo antes de guardar la cotización.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido"
      });
      return;
    }

    const now = new Date();
    const localOffset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - localOffset);

    const day = localTime.getDate();
    const monthIndex = localTime.getMonth();
    const year = localTime.getFullYear();
    const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

    const fechaVencimientoSoat = this.datosCotizacionesForm.get('fechaFinSoat')?.value;
    const dateObj2 = new Date(fechaVencimientoSoat);
    const day2 = dateObj2.getDate();
    const monthIndex2 = dateObj2.getMonth();
    const year2 = dateObj2.getFullYear();
    const formattedDate2 = `${day2} de ${this.monthNames[monthIndex2]} del ${year2}`;

    const dataParaDocumento = {
      noCotizacion: this.noCotizacion,
      fecha: formattedDate,
      nombre: this.clienteForm.get('nombre')?.value,
      numeroIdentificacion: this.clienteForm.get('numeroIdentificacion')?.value,
      vehiculo: this.vehiculo,
      imagenVehiculo: this.vehiculo.imagenVehiculo,
      fechaVencimientoSoat: formattedDate2,
      provisional: this.provisional,
      valorTotalSoat: this.datosCotizacionesForm.get('valorTotalSoat')?.value,
      valorTotalImpAnoCurso: this.datosCotizacionesForm.get('valorImpAnoEnCurso')?.value,
      valorFinanciar: this.financiamientoForm.get('valorFinanciar')?.value,
      plazoMeses: this.financiamientoForm.get('plazoMeses')?.value,
      pagoMensual: this.pagoMensual,
      kilometraje: this.datosCotizacionesForm.get('kilometraje')?.value,
      separacion5: this.datosCotizacionesForm.get('separacion5')?.value,
      traspaso50: this.datosCotizacionesForm.get('traspaso50')?.value,
      proporSoat: this.datosCotizacionesForm.get('PropSoat')?.value,
      propImpAnoCurso: this.datosCotizacionesForm.get('propImpAnoCurso')?.value,
      inscripcionPrenda: this.datosCotizacionesForm.get('prenda')?.value,
      honorarios: this.datosCotizacionesForm.get('honorarios')?.value,
      totalDocumentacion: this.datosCotizacionesForm.get('totalDocumentacion')?.value,
      valorVehiculo: this.datosCotizacionesForm.get('costoVehiculo')?.value,
      totalNegocio: this.datosCotizacionesForm.get('totalNegocio')?.value,
      asesor: this.datosCotizacionesForm.get('asesorComercial')?.value,
      numeroAsesor: this.datosCotizacionesForm.get('numeroAsesor')?.value,
    };

    this.http.post(`${this.apiUrl}/api/generar-cotizacion`, dataParaDocumento, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `COTIZACIÓN ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa} [${this.noCotizacion}].docx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      });
  }

  limpiarFormularios() {
    this.btnEsconder = false;
    this.mostrarSiguienteModal = false;
    this.mostrarSiguienteModal2 = false;
    this.condicionesNegocioForm.reset();
    this.datosCotizacionesForm.reset();
    this.mostrarCredito = false;

    this.condicionesNegocioForm.get('valorCredito')?.disable();
    this.condicionesNegocioForm.get('cobraSoat')?.setValue(true);
    this.condicionesNegocioForm.get('cobraImpuesto')?.setValue(true);
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

  irAlCotizacion(noCotizacion: string) {
    this.limpiarFormularios();
    this.buscarCotizacionForm.get('buscarCotizacion')?.setValue(noCotizacion);
    this.buscarCotizacion();
  }

  siNitActivar() {
    const tipoIdentificacion = this.clienteForm.get('tipoIdentificacion')?.value;

    if (tipoIdentificacion === 'NIT.') {
      this.ocultar = true;
    } else {
      this.ocultar = false;
    }
  }

  buscarCotizacion() {
    this.limpiarFormularios();
    this.btnEsconder = false;

    if (this.buscarCotizacionForm.valid) {
      const noCotizacion = this.buscarCotizacionForm.get('buscarCotizacion')?.value;
      this.http.get<any>(`${this.apiUrl}/api/getCotizaciones/cotizacion/${noCotizacion}`).subscribe(
        data => {
          this.inventoryId = data._id;
          this.noCotizacion = data.noCotizacion;
          this.btnEsconder = true;
          this.btnEsconderCotizacion = true;
          this.btnChange = true;
          this.mostrarSiguienteModal = true;
          this.buscarVehiculoPorId(data.vehiculo);
          this.mostrarSiguienteModal2 = true;
          const fechaFinSoat = new Date(data.fechaFinSoat).toISOString().substring(0, 10);

          this.clienteForm.patchValue({
            nombre: data.nombre,
            tipoIdentificacion: data.tipoIdentificacion,
            numeroIdentificacion: data.numeroIdentificacion,
          });

          this.condicionesNegocioForm.patchValue({
            valorVehiculo: data.valorVehiculo,
            tieneCredito: data.tieneCredito,
            valorCredito: data.valorCredito,
            cobraSoat: data.cobraSoat,
            cobraImpuesto: data.cobraImpuesto,
          });

          this.activarCredito();

          this.datosCotizacionesForm.patchValue({
            valorTotalSoat: data.valorTotalSoat,
            fechaFinSoat: fechaFinSoat,
            valorImpAnoEnCurso: data.valorImpAnoEnCurso,
            honorarios: data.honorarios,
            traspaso50: data.traspaso50,
            propImpAnoCurso: data.propImpAnoCurso,
            PropSoat: data.PropSoat,
            kilometraje: data.kilometraje,
            costoVehiculo: data.costoVehiculo,
            valorCredito: data.valorCredito,
            totalDocumentacion: data.totalDocumentacion,
            totalNegocio: data.totalNegocio,
            prenda: data.prenda,
            asesorComercial: data.asesorComercial,
            numeroAsesor: data.numeroAsesor,
            separacion5: data.separacion5,
          });

          this.financiamientoForm.get('principal')?.setValue(this.convertirAValorNumerico(data.valorFinanciar));
          this.financiamientoForm.get('plazoMeses')?.setValue(this.convertirAValorNumerico(data.plazoMeses));
          this.pagoMensual = data.pagoMensual;
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Cotización no encontrado!',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingresa el numero del Cotización!',
      })
    }
  }

  updateCotizaciones(noCotizacion: string) {
    const vehiculoId = this.vehiculo._id;
    const body = { noCotizacion };

    this.http.put(`${this.apiUrl}/api/agregarCotizacion/${vehiculoId}`, body)
      .subscribe(
        response => {
        },
        error => {
        }
      );
  }

  obtenerCostoVehiculo() {
    const valor = this.condicionesNegocioForm.get('valorVehiculo')?.value;
    this.datosCotizacionesForm.get('costoVehiculo')?.setValue(valor)
    const calcular = this.convertirAValorNumerico(valor) * .05;
    this.datosCotizacionesForm.get('separacion5')?.setValue(this.formatCurrency(calcular));
    this.calcularTotal();
    this.calcularTotalCliente();
  }

  guardarCotizacion(): Promise<CotizacionGuardada> {
    if (!this.validarFormularios()) {
      Swal.fire({
        icon: 'error',
        title: 'Campos requeridos faltantes',
        text: 'Por favor, complete todos los campos obligatorios.',
      });
      return Promise.reject(new Error("Campos requeridos faltantes."));
    }

    if (!this.vehiculo.imagenVehiculo) {
      Swal.fire({
        icon: "warning",
        title: "Imagen del Vehículo Faltante",
        text: "Por favor, actualice la imagen del vehículo antes de guardar la cotización.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido"
      });
      return Promise.reject(new Error("Imagen del vehículo no actualizada."));
    }

    const datosCotizacion = {
      nombre: this.clienteForm.get('nombre')?.value,
      tipoIdentificacion: this.clienteForm.get('tipoIdentificacion')?.value,
      numeroIdentificacion: this.clienteForm.get('numeroIdentificacion')?.value,
      telefono: this.clienteForm.get('telefono')?.value,
      vehiculo: this.vehiculo._id,
      valorVehiculo: this.condicionesNegocioForm.get('valorVehiculo')?.value,
      tieneCredito: this.condicionesNegocioForm.get('tieneCredito')?.value,
      valorCredito: this.condicionesNegocioForm.get('valorCredito')?.value,
      cobraSoat: this.condicionesNegocioForm.get('cobraSoat')?.value,
      valorTotalSoat: this.datosCotizacionesForm.get('valorTotalSoat')?.value,
      fechaFinSoat: this.datosCotizacionesForm.get('fechaFinSoat')?.value,
      cobraImpuesto: this.condicionesNegocioForm.get('cobraImpuesto')?.value,
      valorImpAnoEnCurso: this.datosCotizacionesForm.get('valorImpAnoEnCurso')?.value,
      honorarios: this.datosCotizacionesForm.get('honorarios')?.value,
      traspaso50: this.datosCotizacionesForm.get('traspaso50')?.value,
      propImpAnoCurso: this.datosCotizacionesForm.get('propImpAnoCurso')?.value,
      PropSoat: this.datosCotizacionesForm.get('PropSoat')?.value,
      kilometraje: this.datosCotizacionesForm.get('kilometraje')?.value,
      costoVehiculo: this.datosCotizacionesForm.get('costoVehiculo')?.value,
      totalDocumentacion: this.datosCotizacionesForm.get('totalDocumentacion')?.value,
      totalNegocio: this.datosCotizacionesForm.get('totalNegocio')?.value,
      prenda: this.datosCotizacionesForm.get('prenda')?.value,
      asesorComercial: this.datosCotizacionesForm.get('asesorComercial')?.value,
      numeroAsesor: this.datosCotizacionesForm.get('numeroAsesor')?.value,
      separacion5: this.datosCotizacionesForm.get('separacion5')?.value,
      valorFinanciar: this.financiamientoForm.get('valorFinanciar')?.value,
      plazoMeses: this.financiamientoForm.get('plazoMeses')?.value,
      pagoMensual: this.pagoMensual
    };

    Swal.fire({
      title: 'Guardando cotización',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    return new Promise((resolve, reject) => {
      this.http.post<CotizacionGuardada>(`${this.apiUrl}/api/postCotizaciones`, datosCotizacion)
        .subscribe({
          next: (response) => {
            if ('noCotizacion' in response) {
              Swal.close();
              resolve(response);
            } else {
              reject(new Error('Respuesta inesperada del servidor'));
            }
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al guardar la cotización',
              text: error.message,
            });
            reject(error);
          }
        });
    });
  }

  cotizacion() {
    this.guardarCotizacion().then((cotizacionGuardada: CotizacionGuardada) => {
      this.generarDocumento(cotizacionGuardada.noCotizacion);
      this.updateCotizaciones(cotizacionGuardada.noCotizacion);
    }).catch((error) => {
    });
  }

  generarDocumento(noCotizacion: any) {
    Swal.fire({
      title: 'Generando documento',
      html: 'Espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

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
    const fechaVencimientoSoat = this.datosCotizacionesForm.get('fechaFinSoat')?.value;
    const dateObj2 = new Date(fechaVencimientoSoat);
    const day2 = dateObj2.getDate();
    const monthIndex2 = dateObj2.getMonth();
    const year2 = dateObj2.getFullYear();
    const formattedDate2 = `${day2} de ${this.monthNames[monthIndex2]} del ${year2}`;
    const idFormated = this.formatNumber(this.clienteForm.get('numeroIdentificacion')?.value,);

    const dataParaDocumento = {
      noCotizacion: noCotizacion,
      fecha: formattedDate,
      nombre: this.clienteForm.get('nombre')?.value,
      numeroIdentificacion: idFormated,
      vehiculo: this.vehiculo,
      imagenVehiculo: this.vehiculo.imagenVehiculo,
      fechaVencimientoSoat: formattedDate2,
      valorTotalSoat: this.datosCotizacionesForm.get('valorTotalSoat')?.value,
      valorTotalImpAnoCurso: this.datosCotizacionesForm.get('valorImpAnoEnCurso')?.value,
      valorFinanciar: this.financiamientoForm.get('valorFinanciar')?.value,
      plazoMeses: this.financiamientoForm.get('plazoMeses')?.value,
      pagoMensual: this.pagoMensual,
      provisional: this.provisional,
      kilometraje: this.datosCotizacionesForm.get('kilometraje')?.value,
      separacion5: this.datosCotizacionesForm.get('separacion5')?.value,
      traspaso50: this.datosCotizacionesForm.get('traspaso50')?.value,
      proporSoat: this.datosCotizacionesForm.get('PropSoat')?.value,
      propImpAnoCurso: this.datosCotizacionesForm.get('propImpAnoCurso')?.value,
      inscripcionPrenda: this.datosCotizacionesForm.get('prenda')?.value,
      honorarios: this.datosCotizacionesForm.get('honorarios')?.value,
      totalDocumentacion: this.datosCotizacionesForm.get('totalDocumentacion')?.value,
      valorVehiculo: this.datosCotizacionesForm.get('costoVehiculo')?.value,
      totalNegocio: this.datosCotizacionesForm.get('totalNegocio')?.value,
      asesor: this.datosCotizacionesForm.get('asesorComercial')?.value,
      numeroAsesor: this.datosCotizacionesForm.get('numeroAsesor')?.value,
    };



    this.http.post(`${this.apiUrl}/api/generar-cotizacion`, dataParaDocumento, { responseType: 'blob' })
      .subscribe(blob => {
        Swal.close();
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `COTIZACIÓN ${this.vehiculo.marca} ${this.vehiculo.linea} ${this.vehiculo.version} ${this.vehiculo.modelo} ${this.vehiculo.placa} [${numeroInventario}].docx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        Swal.close();
      });
  }

  limpiarCliente() {
    this.clienteForm.reset({
      tipoIdentificacion: 'C.C.',
      fechaIngreso: this.fechaActual
    });
    this.btnChange = false;
  }

  async guardarCliente() {
    if (this.clienteForm.valid) {
      this.convertirAMayusculasExceptoEmail(this.clienteForm);
      try {
        await this.clientsService.createClients(this.clienteForm.getRawValue()).toPromise();

        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Cliente creado con éxito',
          showConfirmButton: false,
          timer: 1500
        });

        window.location.reload();

      } catch (error: any) {  // Manejo del error como tipo genérico
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

  activarImpAnoEnCurso() {
    const isActived = this.condicionesNegocioForm.get('cobraImpuesto')?.value;
    if (isActived) {
      const mes = new Date().toISOString().substring(5, 7);
      if (mes === "12" || mes === "01") {
        const valorImp = this.convertirAValorNumerico(this.impuesto);
        const nuevoValor = valorImp + (valorImp * .1);
        const valorFormateado = this.formatCurrency(nuevoValor);
        this.datosCotizacionesForm.controls['propImpAnoCurso'].setValue(valorFormateado);
        this.calcularTotal();
        this.calcularTotalCliente();
      } else {
        const valorImp = this.convertirAValorNumerico(this.impuesto);
        let formula = ((valorImp / 365) * (this.diasDevolucionImpuesto));
        const valorFormateado = this.formatCurrency(formula);
        this.datosCotizacionesForm.controls['propImpAnoCurso'].setValue(valorFormateado);
        this.calcularTotal();
        this.calcularTotalCliente();
      }
    } else {
      this.datosCotizacionesForm.controls['propImpAnoCurso'].setValue(this.formatCurrency(0));
      this.calcularTotal();
      this.calcularTotalCliente();
    }
  }

  activarValorSoatTotal() {
    const isActived = this.condicionesNegocioForm.get('cobraSoat')?.value;

    if (isActived) {
      const vencimientoSoatDate = new Date(this.datosCotizacionesForm.get('fechaFinSoat')?.value);
      const valorSoatTotal = this.convertirAValorNumerico(this.datosCotizacionesForm.get('valorTotalSoat')?.value);
      const fechaActualDate = new Date(this.fechaActual);

      let resta = vencimientoSoatDate.getTime() - fechaActualDate.getTime();
      let diferenciaDias = resta / (1000 * 3600 * 24);

      let nuevoValor = ((valorSoatTotal / 365) * (diferenciaDias + 1));
      let valorRedondeado = Math.round(nuevoValor);

      const valorFormateado = this.formatCurrency(valorRedondeado);
      this.datosCotizacionesForm.controls['PropSoat'].setValue(valorFormateado);
      this.calcularTotal();
      this.calcularTotalCliente();
    } else {
      this.datosCotizacionesForm.controls['PropSoat'].setValue(this.formatCurrency(0));
      this.calcularTotal();
      this.calcularTotalCliente();
    }
  }

  obtenerCostoTraspaso50() {
    const ciudadPlaca = this.vehiculo.ciudadPlaca;
    const costoProvisional = this.costosTramites.find((costo: any) => costo.ciudad === 'Provisional')?.traspaso100 || 0;

    const costoEncontrado = this.costosTramites.find((costo: any) => costo.ciudad === ciudadPlaca);

    const costoTraspaso100 = costoEncontrado ? costoEncontrado.traspaso100 : costoProvisional;

    this.traspaso50 = costoTraspaso100 / 2;
    const valorFormateadoTraspaso = this.formatCurrency(this.traspaso50);
    this.datosCotizacionesForm.controls['traspaso50'].setValue(valorFormateadoTraspaso);
  }

  obtenerHonorariosIvaIncluido() {
    let valorNumerico = Number(this.honorariosAutomagno);
    let valorConIva = valorNumerico + (valorNumerico * 0.19);
    const valorFormateado = this.formatCurrency(valorConIva);
    this.datosCotizacionesForm.controls['honorarios'].setValue(valorFormateado);
  }

  buscarInventarioPlaca() {
    const placa = this.vehiculoInvOneControl.value;
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

  setupValueChangesListener() {
    const valor = this.convertirAValorNumerico(this.condicionesNegocioForm.get('valorCredito')?.value);
    this.financiamientoForm.get('valorFinanciar')?.setValue(this.formatSalary(valor));
    this.datosCotizacionesForm.get('valorCredito')?.setValue(this.formatSalary(valor));
    this.condicionesNegocioForm.get('valorCredito')?.setValue(this.formatSalary(valor));
  }

  setupValueChangesListener2() {
    const valor = this.convertirAValorNumerico(this.financiamientoForm.get('valorFinanciar')?.value);
    this.condicionesNegocioForm.get('valorCredito')?.setValue(this.formatSalary(valor));
    this.datosCotizacionesForm.get('valorCredito')?.setValue(this.formatSalary(valor));
  }

  buscarVehiculoPorId(vehiculoId: string) {
    this.http.get<any>(`${this.apiUrl}/api/getVehicles/${vehiculoId}`).subscribe(
      vehiculoData => {
        this.vehiculo = vehiculoData;
        this.vehiculo.fechaMatricula = new Date(vehiculoData.fechaMatricula).toISOString().substring(0, 10);
        this.obtenerCostoTraspaso50();
      },
      error => {
      }
    );
  }

  formatNumber(value: number): string {
    if (isNaN(value) || value === null) {
      return '-';
    }
    return new Intl.NumberFormat('es-CO', {
      maximumFractionDigits: 0
    }).format(value);
  }

  ngOnInit(): void {

    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
      this.allVehiclesInv = vehicles;
      this.configureFilteringVeh();
      this.configureFilteringVehInv();
    });

    this.subscription = this.sharedData.currentInventoryId.subscribe(id => {
      if (id) {
        this.utilizarInventario(id);
      }
    });

    this.http.get<any[]>(`${this.apiUrl}/api/ciudades`).subscribe(data => {
      this.lugares = data;
      this.lugares.push({ name: 'Pendiente' });
      this.organizarAlfabeticamente();
    });
    this.http.get<any[]>(`${this.apiUrl}/api/getSuppliers`).subscribe(data => {
      this.suppliers = data;
      this.organizarAlfabeticamenteCliente();
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getCostosTramites`).subscribe(data => {
      this.costosTramites = data;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getVariable`).subscribe(data => {
      this.variables = data;
      const tasaInteres = this.variables.find(v => v.nombre === 'tasaInteres');

      this.tasaInteres = tasaInteres ? tasaInteres.valor : undefined;

      const honorarios = this.variables.find(v => v.nombre === 'honorariosAutomagno');

      this.honorariosAutomagno = honorarios ? honorarios.valor : undefined;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/users`).subscribe(data => {
      this.users = data;

      this.usuariosGestores = this.users.filter(user =>
        user.role && user.role.includes("Gestor documental")
      );

      this.usuariosAsesor = this.users.filter(user =>
        user.role && user.role.includes("Asesor Comercial")
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
      fechaIngreso: this.fechaActual,
      inventarios: []
    };

    this.condicionesNegocioForm = this.formBuilder.group({
      valorVehiculo: ['$ 0', Validators.required],
      tieneCredito: [false],
      valorCredito: [{ value: '$ 0', disabled: true }],
      cobraSoat: [true],
      cobraImpuesto: [true]
    });

    this.condicionesNegocioForm.get('cobraSoat')?.setValue(true);
    this.condicionesNegocioForm.get('cobraImpuesto')?.setValue(true);
    this.condicionesNegocioForm.get('valorCredito')?.setValue('$ 0');
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

  calcularYFormatearPago(): void {
    const valorFinanciar = this.convertirAValorNumerico(this.financiamientoForm.get('valorFinanciar')?.value);
    const plazoMeses = this.convertirAValorNumerico(this.financiamientoForm.get('plazoMeses')?.value);

    if (valorFinanciar > 0 && this.tasaInteres > 0 && plazoMeses > 0) {
      const tasaInteresMensual = this.tasaInteres / 10 / 12;
      const pago = valorFinanciar * tasaInteresMensual / (1 - Math.pow(1 + tasaInteresMensual, -plazoMeses));
      const pagoRedondeado = Math.round(pago);
      this.pagoMensual = ` $ ${pagoRedondeado.toLocaleString('es-CO')}`;
    } else {
      this.pagoMensual = '$ 0';
    }
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  onCurrencyInput2(event: Event): void {
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

  onSelectAsesor(event: any) {
    const selectedAsesor = event.target.value;
    const asesor = this.usuariosAsesor.find(user => user.nombre === selectedAsesor);

    if (asesor) {
      this.datosCotizacionesForm.patchValue({
        numeroAsesor: asesor.telefono || '',
      });

      this.datosCotizacionesForm.get('numeroAsesor')?.disable();
    } else {
      this.datosCotizacionesForm.get('numeroAsesor')?.setValue('');
    }
  }

  onCurrencyInput(controlName: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue)) {
      const formattedValue = this.formatCurrency(numericValue);
      this.condicionesNegocioForm.controls[controlName].setValue(formattedValue, { emitEvent: false });
    } else {
      this.condicionesNegocioForm.controls[controlName].setValue('', { emitEvent: false });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  activarCredito() {
    const isActived = this.condicionesNegocioForm.get('tieneCredito')?.value;

    if (isActived) {
      this.mostrarCredito = true;
      this.condicionesNegocioForm.get('valorCredito')?.enable();
      this.obtenerPrenda();
    } else {
      this.mostrarCredito = false;
      this.condicionesNegocioForm.get('valorCredito')?.disable();
      this.obtenerPrenda();
    }

  }

  obtenerPrenda() {
    let tieneCredito = this.condicionesNegocioForm.get('tieneCredito')?.value;

    if (tieneCredito) {
      const ciudadPlaca = this.vehiculo.ciudadPlaca;
      let prenda;
      const prendaProvisional = this.costosTramites.find((costo: any) => costo.ciudad === 'Provisional').inscripcionPrenda;

      const costoEncontrado = this.costosTramites.find((costo: any) => costo.ciudad === ciudadPlaca);
      if (costoEncontrado) {
        prenda = costoEncontrado.inscripcionPrenda;
      } else {
        prenda = prendaProvisional;
      }

      this.prenda = prendaProvisional;
      const valorFormateadoPrenda = this.formatCurrency(prenda);
      this.datosCotizacionesForm.controls['prenda'].setValue(valorFormateadoPrenda);
      this.calcularTotal();
    } else {
      this.datosCotizacionesForm.controls['prenda'].setValue(this.formatCurrency(0));
      this.calcularTotal();
    }
  }

  calcularTotal() {
    let totalDocumentacion = 0;

    const camposDocumentacion = ['traspaso50', 'propImpAnoCurso', 'PropSoat', 'prenda', 'honorarios'];
    camposDocumentacion.forEach(campo => {
      const valor = this.datosCotizacionesForm.get(campo)?.value;
      totalDocumentacion += this.convertirAValorNumerico(valor);
    });

    this.datosCotizacionesForm.get('totalDocumentacion')?.setValue(this.formatCurrency(totalDocumentacion));
    this.calcularTotalCliente();
  }

  calcularTotalCliente() {
    const valorVehiculoNumerico = this.convertirAValorNumerico(this.condicionesNegocioForm.get('valorVehiculo')?.value);
    const valorDocumentacion = this.convertirAValorNumerico(this.datosCotizacionesForm.get('totalDocumentacion')?.value);

    const suma = valorVehiculoNumerico + valorDocumentacion;
    this.datosCotizacionesForm.get('totalNegocio')?.setValue(this.formatCurrency(suma))
  }

  convertirAValorNumerico(valor: string): number {
    if (!valor) {
      return 0;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d-]/g, ''));
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  convertirAValorNumerico2(valor: string): number {
    if (!valor) {
      return 0;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d-.]/g, ''));
    return isNaN(valorNumerico) ? 0 : valorNumerico;
  }

  onNumberInput(controlName: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue)) {
      const formattedValue = this.formatNumberWithThousandsSeparator(numericValue);
      this.datosCotizacionesForm.controls[controlName].setValue(formattedValue, { emitEvent: false });
    } else {
      this.datosCotizacionesForm.controls[controlName].setValue('', { emitEvent: false });
    }
  }

  formatNumberWithThousandsSeparator(value: number): string {
    return value.toLocaleString('es-CO');
  }

  formatNumberWithSeparators(numberOrString: number | string): string {
    const numericValue = typeof numberOrString === 'string'
      ? parseInt(numberOrString.replace(/\D/g, ''), 10)
      : numberOrString;

    if (!isNaN(numericValue)) {
      return numericValue.toLocaleString('es-CO');
    } else {
      return '';
    }
  }

  formatNumberWithSeparators2(number: any) {
    if (number === null || number === undefined) {
      return "0";
    }
    return this.formatNumberWithSeparators(number);
  }

  desformatearMoneda(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();

    const valorNumerico = valorComoCadena.replace(/[^\d-]/g, '');
    return parseFloat(valorNumerico);
  }

  configureFilteringVeh() {
    this.opcionesFiltradasVeh = this.vehiculoInvControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVeh(value))
    );
  }

  private _filterVeh(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter(option => option.toLowerCase().includes(filterValue));
  }

  configureFilteringVehInv() {
    this.opcionesFiltradasVehInv = this.vehiculoInvOneControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVehInv(value))
    );
  }

  private _filterVehInv(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehiclesInv.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  displayFnVehInv(vehiculo: string): string {
    return vehiculo || '';
  }
}
