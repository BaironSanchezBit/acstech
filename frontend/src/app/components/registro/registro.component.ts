import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ClientsService } from 'src/app/services/clients.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm, NgModel } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { FasecoldaService } from 'src/app/services/fasecolda.service';
import { FormBuilder } from '@angular/forms';

interface carroceria {
  clase: string;
  carroceria: string;
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit, OnDestroy {

  @ViewChild('correoElectronico') correoElectronico?: NgModel;

  lugares!: any[];
  fechaActual: string;
  vehiculoForm: FormGroup;
  clienteForm: FormGroup;
  vehiculoForm2: FormGroup;
  clienteForm2: FormGroup;

  fasecoldaForm: FormGroup;
  modelos: string[] = [];
  marcas: string[] = [];
  referencias: string[] = [];
  detallesVehiculos: any[] = [];

  loading = false;
  ocultar = false;
  filteredItems: any[] = [];
  placaValue = '';
  placaBusqueda = '';
  isCreatingCliente = false;
  isCreatingVehiculo = false;

  clienteBusqueda: any;
  btnChange = false;
  btnChange2 = false;
  btnChange3 = false;
  btnChange4 = false;
  vehiculo: any;
  selectedFile: File | null = null;

  allClients: any[] = [];
  clienteControl = new FormControl();
  opcionesFiltradas: Observable<any[]> = of([]);

  allVehicles: any[] = [];
  vehiculoControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  clients: any;
  previewImgVeh: any;
  cargo: string = "";
  carroceriasFiltradas: string[] = [];
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
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;


  constructor(private formBuilder: FormBuilder, private modalService: NgbModal, private fasecoldaService: FasecoldaService, private changeDetectorRef: ChangeDetectorRef, private router: Router, private http: HttpClient, private vehiclesService: VehiclesService, private authService: AuthService, private webSocketService: WebSocketService, private clientsService: ClientsService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.fechaActual = new Date().toISOString().substring(0, 10);

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

    this.vehiculoForm2 = new FormGroup({
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

    this.clienteForm2 = new FormGroup({
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

    this.clienteForm.get('fechaIngreso')?.disable();
    this.clienteForm2.get('fechaIngreso')?.disable();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  ngOnInit(): void {
    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.clientsService.getAllNumerosIdent().subscribe(clients => {
      this.allClients = clients;
      this.configureFiltering();
    });

    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
      this.configureFilteringVeh();
    });


    this.http.get<any[]>(`${this.apiUrl}/api/ciudades`).subscribe(data => {
      this.lugares = data;
      this.lugares.push({ name: 'Pendiente' });
      this.organizarAlfabeticamente();
    });

    this.authService.getUserDetails().subscribe(
      user => {
        this.cargo = user.cargo;
      },
      error => {
      }
    );

    this.placaBusqueda = '';
    this.clienteBusqueda = '';

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

  displayFn(cliente: string): string {
    return cliente || '';
  }

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  actualizarCarrocerias(claseSeleccionada: string): void {
    this.carroceriasFiltradas = this.tipo
      .filter(t => t.clase === claseSeleccionada)
      .map(t => t.carroceria)
      .sort((a, b) => a.localeCompare(b));

    this.vehiculoForm.get('carroceria')?.setValue('');
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

  buscarVehiculo() {
    if (this.vehiculoControl.valid) {
      this.vehiclesService.getVehicleByPlaca(this.vehiculoControl.value).subscribe(
        (data) => {
          this.vehiculo = data;

          const fechaMatriculaFormatted = new Date(data.fechaMatricula).toISOString().substring(0, 10);
          const fechaImportacionFormatted = new Date(data.fechaImportacion).toISOString().substring(0, 10);
          this.actualizarCarrocerias(data.clase)

          this.vehiculoForm2.patchValue({
            placa: data.placa,
            marca: data.marca,
            linea: data.linea,
            version: data.version,
            modelo: data.modelo,
            cilindraje: data.cilindraje,
            color: data.color,
            servicio: data.servicio,
            noDocumentoImportacion: data.noDocumentoImportacion,
            fechaImportacion: fechaImportacionFormatted,
            clase: data.clase,
            carroceria: data.carroceria,
            combustible: data.combustible,
            pasajeros: data.pasajeros,
            numeroMotor: data.numeroMotor,
            ciudadPlaca: data.ciudadPlaca,
            vin: data.vin,
            serie: data.serie,
            chasis: data.chasis,
            imagenVehiculo: data.imagenVehiculo,
            observaciones: data.observaciones,
            fechaMatricula: fechaMatriculaFormatted
          });

          this.previewImgVeh = data.imagenVehiculo;
          this.btnChange4 = true;
        },
        (error) => {
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
      this.clientsService.getClientById(this.clienteControl.value).subscribe(
        (data) => {
          this.clients = data;

          if (data.fechaIngreso) {
            const fechaIngreso = new Date(data.fechaIngreso);

            const fechaIngresoFormatted = fechaIngreso.toISOString().substring(0, 10);

            this.clienteForm2.patchValue({
              primerNombre: data.primerNombre,
              segundoNombre: data.segundoNombre,
              primerApellido: data.primerApellido,
              segundoApellido: data.segundoApellido,
              tipoIdentificacion: data.tipoIdentificacion,
              numeroIdentificacion: data.numeroIdentificacion,
              digitoVerificacion: data.digitoVerificacion,
              ciudadIdentificacion: data.ciudadIdentificacion,
              direccionResidencia: data.direccionResidencia,
              ciudadResidencia: data.ciudadResidencia,
              celularOne: data.celularOne,
              celularTwo: data.celularTwo,
              correoElectronico: data.correoElectronico,
              fechaIngreso: fechaIngresoFormatted
            });


            const tipoIdentificacion = data.tipoIdentificacion;

            if (tipoIdentificacion === 'NIT.') {
              this.ocultar = true;
            } else {
              this.ocultar = false;
            }

            this.btnChange3 = true;
          }
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

  siNitActivar() {
    const tipoIdentificacion = this.clienteForm.get('tipoIdentificacion')?.value;

    if (tipoIdentificacion === 'NIT.') {
      this.ocultar = true;
    } else {
      this.ocultar = false;
    }
  }

  limpiar() {
    this.vehiculoForm.reset();

    this.previewImgVeh = '';
    this.placaBusqueda = '';
    this.btnChange2 = false;
  }

  limpiar2() {
    this.vehiculoForm2.reset();

    this.previewImgVeh = '';
    this.placaBusqueda = '';
    this.btnChange4 = false;
  }

  limpiarCliente() {
    this.clienteForm.reset({
      tipoIdentificacion: 'C.C.',
      fechaIngreso: this.fechaActual
    });
    this.btnChange = false;
  }

  limpiarCliente2() {
    this.clienteForm2.reset({
      tipoIdentificacion: 'C.C.',
      fechaIngreso: this.fechaActual
    });
    this.clienteBusqueda = '';
    this.btnChange = false;
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  async guardarVehiculo() {
    if (this.vehiculoForm.valid) {
      if (this.isCreatingVehiculo) {
        return;
      }

      this.isCreatingVehiculo = true;

      this.convertirAMayusculasExceptoLink(this.vehiculoForm);

      const formData = new FormData();
      for (const key in this.vehiculoForm.value) {
        if (this.vehiculoForm.value.hasOwnProperty(key)) {
          let value = this.vehiculoForm.value[key];

          // Verifica si el campo es una fecha y ajusta el formato
          if (key === 'fechaMatricula' || key === 'fechaImportacion') {
            // Convierte la fecha al formato YYYY-MM-DD
            const fecha = new Date(value);
            value = fecha.toISOString().substring(0, 10);
          }

          if (key !== 'imagenVehiculo') {
            formData.append(key, value);
          }
        }
      }

      const fileInput = document.getElementById('imagenVehiculo') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append('imagenVehiculo', fileInput.files[0]);
      }

      try {
        await this.vehiclesService.createVehicles(formData).toPromise();

        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Vehículo creado con éxito',
          showConfirmButton: false,
          timer: 1500
        });

        window.location.reload();

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
      } finally {
        this.isCreatingVehiculo = false;
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

  async guardarCliente() {
    if (this.clienteForm.valid) {
      if (this.isCreatingCliente) {
        return;
      }

      this.isCreatingCliente = true;

      this.convertirAMayusculasExceptoEmail(this.clienteForm);

      // Formatear fechas antes de enviarlas
      const clienteData = this.clienteForm.getRawValue();
      if (clienteData.fechaIngreso) {
        const fechaIngreso = new Date(clienteData.fechaIngreso);
        clienteData.fechaIngreso = fechaIngreso.toISOString().substring(0, 10);
      }

      try {
        await this.clientsService.createClients(clienteData).toPromise();

        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Cliente creado con éxito',
          showConfirmButton: false,
          timer: 1500
        });

        window.location.reload();

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
      } finally {
        this.isCreatingCliente = false;
      }
    } else {
      Object.values(this.clienteForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  async actualizarVehiculo() {
    this.convertirAMayusculasExceptoLink(this.vehiculoForm2);
    const vehiculoActualizado = this.vehiculoForm2.value;
    const vehiculoId = this.vehiculo._id;

    if (this.vehiculoForm2.valid) {
      const formData = new FormData();

      for (const key in vehiculoActualizado) {
        if (vehiculoActualizado.hasOwnProperty(key)) {
          let value = vehiculoActualizado[key];

          // Verifica si el campo es una fecha y ajusta el formato
          if (key === 'fechaMatricula' || key === 'fechaImportacion') {
            // Convierte la fecha al formato YYYY-MM-DD
            const fecha = new Date(value);
            value = fecha.toISOString().substring(0, 10);
          }

          formData.append(key, value);
        }
      }

      if (this.selectedFile) {
        formData.append('imagenVehiculo', this.selectedFile);
      }

      try {
        await this.vehiclesService.updateVehicles(vehiculoId, formData).toPromise();

        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Vehículo actualizado con éxito',
          showConfirmButton: false,
          timer: 1500
        });

        window.location.reload();
      } catch (error: any) { // Manejo del error como tipo genérico
        if (error.status === 404) {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Vehículo no encontrado!',
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error al actualizar el vehículo, verifique la información!',
          });
        }
      }
    } else {
      Object.values(this.vehiculoForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  async actualizarCliente() {
    this.convertirAMayusculasExceptoEmail(this.clienteForm2);
    const clienteActualizado = this.clienteForm2.value;
    const clienteId = this.clients._id;

    // Formatear fechas antes de enviarlas
    if (clienteActualizado.fechaIngreso) {
      const fechaIngreso = new Date(clienteActualizado.fechaIngreso);
      clienteActualizado.fechaIngreso = fechaIngreso.toISOString().substring(0, 10);
    }

    if (this.clienteForm2.valid) {
      try {
        await this.clientsService.updateClients(clienteId, clienteActualizado).toPromise();

        await Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Cliente actualizado con éxito!',
          showConfirmButton: false,
          timer: 1500
        });

        window.location.reload();
      } catch (error: any) {
        if (error.status === 404) {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Cliente no encontrado!',
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error al actualizar el cliente, verifique la información!',
          });
        }
      }
    } else {
      Object.values(this.clienteForm2.controls).forEach(control => {
        control.markAsTouched();
      });
    }
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
}
