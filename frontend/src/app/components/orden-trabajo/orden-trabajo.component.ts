import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { ClientsService } from 'src/app/services/clients.service';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { VehiclesService } from 'src/app/services/vehicles.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, of, startWith } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/app/environments/environment';
import { map } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-orden-trabajo',
  templateUrl: './orden-trabajo.component.html',
  styleUrls: ['./orden-trabajo.component.css']
})
export class OrdenTrabajoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modalFotosMecanica') modalFotosMecanica!: ElementRef;
  @ViewChild(ImageModalComponent) modalComponent!: ImageModalComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;
  isDataLoaded = false;

  showModal: boolean = false;
  imagenSeleccionadaIndex: number = 0;
  imagenesModal: string[] = [];
  adjuntosToShow: string[] = [];
  mostrarTodosAdjuntos: boolean = false;

  allProveedores: any[] = [];
  proveedoresControl = new FormControl();
  opcionesFiltradas: Observable<any[]> = of([]);
  filteredSuppliers = new BehaviorSubject<any[]>([]);

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
  adjuntos: string[] = [];

  ordenesForm: FormGroup;
  modificacion: any;
  loading = false;
  btnEsconder = false;
  btnEsconder2 = false;
  mostrarSiguienteModal2 = false;
  mostrarSiguienteModal3 = false;
  buscarInventarioForm: FormGroup;
  loggedIn: boolean = false;
  datosUser: any;

  inventarios: any[] = [];
  ordenes: any[] = [];
  acordeonesAbiertos: { [key: number]: boolean } = {};
  usuarios!: any[];
  proveedores!: any[];
  peritajes!: any[];
  clients: any;
  opcionesTiempo: string[] = [];
  vehiculo: any = {};
  cliente: any = {};
  ordenId: any;
  fechaActual: string;
  private apiUrl = environment.apiUrl;
  fechaInicioOrden: any;
  inventoryId: string = '';
  _id: string = '';
  placaValue = '';
  numeroInventario = '';
  allVehicles: any[] = [];
  vehiculoInvControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);
  proveedoresFiltrados: BehaviorSubject<any[]>[] = [];

  tiposDeTrabajo: { [key: string]: string } = {
    mecanica: 'Mecánica',
    luces: 'Luces',
    peritaje: 'Peritaje',
    tomaImprontas: 'Toma Improntas',
    latoneriaPintura: 'Latonería y Pintura',
    repuestosAccesorios: 'Repuestos y Accesorios',
    tapiceria: 'Tapicería',
    lavado: 'Lavado',
    suspencionFrenos: 'Suspensión y Frenos',
    otros: 'Otros'
  };

  allVehiclesInv: any[] = [];
  vehiculoInvOneControl = new FormControl();
  opcionesFiltradasVehInv: Observable<any[]> = of([]);
  camposForm: FormGroup;
  suppliers!: any[];

  btnChange = false;
  btnChange2 = false;
  monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];
  private routerSubscription: Subscription;

  constructor(private router: Router, private cd: ChangeDetectorRef, private http: HttpClient, private authService: AuthService, private datePipe: DatePipe, private vehiclesService: VehiclesService, private formBuilder: FormBuilder, private clientsService: ClientsService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    const today = new Date();
    const todayLocal = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    this.fechaActual = todayLocal.toISOString().substring(0, 10);

    this.ordenesForm = this.formBuilder.group({
      estadoOrden: ['', Validators.required],
      pruebaDeRuta: ['', Validators.required]
    });

    this.camposForm = this.formBuilder.group({
      campos: this.formBuilder.array([])
    });

    this.buscarInventarioForm = this.formBuilder.group({
      buscarInventario: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loading = true;

    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      this.authService.getUserDetails().subscribe(
        user => {
          this.datosUser = user.nombre;
        },
        error => {
        }
      );
    } else {
      this.loggedIn = false;
    }

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getSuppliers`).subscribe(data => {
      this.allProveedores = data;
  
      // Configurar el filtrado de proveedores para los campos existentes
      this.campos.controls.forEach((control, index) => {
        this.proveedoresFiltrados[index] = new BehaviorSubject<any[]>([]);
        const proveedorControl = control.get('proveedor') as FormControl;
        proveedorControl.valueChanges.pipe(
          startWith(''),
          map((value: any) => this._filterSuppliers(value))
        ).subscribe(filteredSuppliers => {
          this.proveedoresFiltrados[index].next(filteredSuppliers);
        });
      });
    });

    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
      this.allVehiclesInv = vehicles;
      this.configureFilteringVeh();
      this.configureFilteringVehInv();
    });

    this.http.get<any[]>(`${this.apiUrl}/api/users`).subscribe(data => {
      this.usuarios = data;
    });

    this.vehiculo = {
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
    };

    this.opcionesTiempo = this.generarOpcionesTiempo();

    this.ordenesForm.valueChanges.subscribe(() => {
      if (this.isDataLoaded) {
        this.actualizarOrden();
      }
    });

    this.camposForm.valueChanges.subscribe(() => {
      if (this.isDataLoaded) {
        this.actualizarOrden();
      }
    });

    this.ordenesForm.updateValueAndValidity();
    this.camposForm.updateValueAndValidity();
  }


  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = Array.from(tooltipTriggerList).map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  organizarAlfabeticamenteCliente() {
    this.suppliers.sort((a, b) => {
      const departamentoA = a.tercero.toLowerCase();
      const departamentoB = b.tercero.toLowerCase();

      if (departamentoA < departamentoB) {
        return -1;
      }
      if (departamentoA > departamentoB) {
        return 1;
      }
      return 0;
    });
  }

  private _filterSuppliers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.allProveedores.filter(option => option.tercero.toLowerCase().includes(filterValue));
  }

  generarOpcionesTiempo(): string[] {
    const opciones: string[] = [];
    for (let i = 1; i <= 24; i++) {
      opciones.push(`${i} hora${i > 1 ? 's' : ''}`);
    }
    for (let i = 1; i <= 30; i++) {
      opciones.push(`${i} día${i > 1 ? 's' : ''}`);
    }
    return opciones;
  }

  openModal(imagenes: string[], index: number) {
    this.imagenesModal = imagenes;
    this.imagenSeleccionadaIndex = index;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  agregarCampos() {
    Swal.fire({
      title: 'Selecciona el tipo de trabajo',
      input: 'select',
      inputOptions: this.tiposDeTrabajo,
      inputPlaceholder: 'Selecciona el tipo',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        const tipo = result.value;
        const tipoDescripcion = this.tiposDeTrabajo[tipo];
  
        const campos = this.formBuilder.group({
          tipo: [tipo],
          tipoDescripcion: [tipoDescripcion],
          estado: [''],
          proveedor: [''],
          responsable: [''],
          tiempo: [''],
          diaRealizacion: [''],
          atiende: [''],
          telefono: [''],
          observacion: [''],
          imagenes: [[]],
          imagenPrevia: [[]],
          imagenesNuevas: [[]],
          imagenPreviaNuevas: [[]]
        });
  
        const index = this.campos.length;
  
        this.campos.push(campos);
  
        this.proveedoresFiltrados[index] = new BehaviorSubject<any[]>([]);
  
        const proveedorControl = campos.get('proveedor') as FormControl;
        proveedorControl.valueChanges.pipe(
          startWith(''),
          map((value: any) => this._filterSuppliers(value))
        ).subscribe(filteredSuppliers => {
          this.proveedoresFiltrados[index].next(filteredSuppliers);
        });
      }
    });
  }
  
  get campos(): FormArray {
    return this.camposForm.get('campos') as FormArray;
  }

  toggleAccordion(index: number) {
    this.acordeonesAbiertos[index] = !this.acordeonesAbiertos[index];
    Object.keys(this.acordeonesAbiertos).forEach(key => {
      if (+key !== index) {
        this.acordeonesAbiertos[+key] = false;
      }
    });
  }

  isAccordionOpen(index: number): boolean {
    return !!this.acordeonesAbiertos[index];
  }

  convertirArrayAObjeto(formArray: FormArray): any[] {
    return formArray.controls.map(control => {
      const formGroup = control as FormGroup;
      return {
        tipo: formGroup.get('tipo')?.value,
        estado: formGroup.get('estado')?.value,
        proveedor: formGroup.get('proveedor')?.value,
        responsable: formGroup.get('responsable')?.value,
        tiempo: formGroup.get('tiempo')?.value,
        diaRealizacion: formGroup.get('diaRealizacion')?.value,
        atiende: formGroup.get('atiende')?.value,
        telefono: formGroup.get('telefono')?.value,
        observacion: formGroup.get('observacion')?.value,
        imagenes: formGroup.get('imagenes')?.value,
        imagenesNuevas: formGroup.get('imagenesNuevas')?.value
      };
    });
  }

  desformatearMoneda(valorFormateado: any): number {
    const valorComoCadena = (valorFormateado ?? '').toString();

    const valorNumerico = valorComoCadena.replace(/[^\d-]/g, '');
    return parseFloat(valorNumerico);
  }

  async crearOrden() {
    const camposOrden = this.convertirArrayAObjeto(this.campos);

    const formData = new FormData();
    formData.append('vehiculo', this.vehiculo._id);
    formData.append('cliente', this.cliente._id);
    formData.append('estadoOrden', this.ordenesForm.get('estadoOrden')?.value);
    formData.append('pruebaDeRuta', this.ordenesForm.get('pruebaDeRuta')?.value);
    formData.append('numeroInventario', this.numeroInventario.toString());

    const fechaActual = new Date().toISOString();

    formData.append('modificacion', JSON.stringify([{
      quien: this.datosUser,
      fecha: fechaActual
    }]));

    formData.append('trabajos', JSON.stringify(camposOrden));
    console.log(JSON.stringify(camposOrden))
    camposOrden.forEach((campo: any, index: any) => {
      if (campo.imagenesNuevas) {
        for (let i = 0; i < campo.imagenesNuevas.length; i++) {
          formData.append(`trabajos[${index}].imagenesNuevas`, campo.imagenesNuevas[i]);
        }
      }
    });

    try {
      const response: any = await this.http.post(`${this.apiUrl}/api/postOrdenes`, formData).toPromise();
      this.ordenId = response._id;
      this.isDataLoaded = true;

    } catch (error) {
      let mensajeError = 'Hubo un problema al guardar la información del trámite';
      await Swal.fire({
        title: 'Error',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }

  onFileChange(event: any, index: number) {
    const files = event.target.files as FileList;
    const fileArray = Array.from(files);
    this.uploadImagesToS3(fileArray, index);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
    (event.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
  }

  onDrop(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('dragover');

    const files = event.dataTransfer!.files as FileList;
    const fileArray = Array.from(files);
    this.uploadImagesToS3(fileArray, index);
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  private removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
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

  buscarInventario() {
    this.limpiarFormularios();

    if (this.buscarInventarioForm.valid) {
      const inventarioId = this.buscarInventarioForm.get('buscarInventario')?.value;
      this.http.get<any>(`${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`).subscribe(
        data => {
          this._id = data._id;
          this.numeroInventario = data.inventoryId;
          this.btnEsconder2 = true;
          this.buscarVehiculoPorId(data.vehiculo);
          this.mostrarSiguienteModal3 = true;

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

          this.adjuntos = [
            ...this.fotosCedulaPropietario,
            ...this.fotosTarjetaPropietario,
            ...this.fotosSoat,
            ...this.fotosCertificadoTradicion,
            ...this.fotosEstadoCuentaImpuesto,
            ...this.fotosSimitPropietario,
            ...this.fotosLiquidacionDeudaFinanciera,
            ...this.fotosTecnoMecanica,
            ...this.fotosManifiestoFactura,
            ...this.fotosSoatIniciales,
            ...this.fotosImpuestoAno
          ];


          this.mostrarTodosAdjuntos = false;
          this.actualizarAdjuntosToShow();
        },
        error => {
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
      })
    }
  }

  buscarOrdenTrabajoPorInventarioOPlaca(inventoryId: string) {
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/ordenes/${inventoryId}`).subscribe(
      data => {
        if (data.length > 0) {
          const ultimaOrden = data[0];
          this.cargarInformacionOrden(ultimaOrden.numeroOrden);
        } else {
          Swal.fire({
            title: 'Sin Orden de Trabajo',
            text: 'No se encontró ninguna orden de trabajo para este inventario.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.cargarInformacionInventarioPorPlaca(inventoryId);
            }
          });
        }
      },
      error => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al buscar la orden de trabajo."
        });
      }
    );
  }

  buscarInventarioPlaca(placa: string) {
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/inventarios/${placa}`).subscribe(
      data => {
        this.inventarios = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (this.inventarios.length > 0) {
          const ultimoInventario = this.inventarios[0];
          this.buscarOrdenTrabajoPorInventarioOPlaca(ultimoInventario.inventoryId);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se encontró inventario para esta placa!',
          });
        }
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'No encontrado',
          text: 'El vehículo no existe',
        });
        this.inventarios = [];
      }
    );
  }

  cargarInformacionInventarioPorPlaca(placa: string) {
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/inventarios/${placa}`).subscribe(
      data => {
        this.btnChange2 = true;
        this.inventarios = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (this.inventarios.length > 0) {
          const ultimoInventario = this.inventarios[0];
          this.cargarInformacionInventario(ultimoInventario.inventoryId);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No se encontró inventario para esta placa!',
          });
        }
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'No encontrado',
          text: 'El vehículo no existe',
        });
        this.inventarios = [];
      }
    );
  }

  cargarInformacionInventario(inventoryId: string) {
    Swal.fire({
      title: 'Cargando...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.get<any>(`${this.apiUrl}/api/getInventories/idInventories/${inventoryId}`).subscribe(
      data => {
        this._id = data._id;
        this.numeroInventario = data.inventoryId;
        this.btnEsconder2 = true;
        this.buscarVehiculoPorId(data.vehiculo);
        this.buscarClientePorId(data.cliente);
        this.mostrarSiguienteModal3 = true;

        this.llenarFormularioConInventario(data);

        Swal.close();
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Inventario no encontrado!',
        });
      }
    );
  }

  llenarFormularioConInventario(data: any) {
    this.ordenesForm.patchValue({
        estadoOrden: data.estadoOrden,
        pruebaDeRuta: data.pruebaDeRuta,
    });

    this.fotosCedulaPropietario = data.documentosTraspasos?.fotosCedulaPropietario || [];
    this.fotosTarjetaPropietario = data.documentosTraspasos?.fotosTarjetaPropietario || [];
    this.fotosSoat = data.documentosTraspasos?.fotosSoat || [];
    this.fotosCertificadoTradicion = data.documentosValoresIniciales?.fotosCertificadoTradicion || [];
    this.fotosEstadoCuentaImpuesto = data.documentosValoresIniciales?.fotosEstadoCuentaImpuesto || [];
    this.fotosSimitPropietario = data.documentosValoresIniciales?.fotosSimitPropietario || [];
    this.fotosLiquidacionDeudaFinanciera = data.documentosValoresIniciales?.fotosLiquidacionDeudaFinanciera || [];
    this.fotosTecnoMecanica = data.documentosValoresIniciales?.fotosTecnoMecanica || [];
    this.fotosManifiestoFactura = data.documentosValoresIniciales?.fotosManifiestoFactura || [];
    this.fotosSoatIniciales = data.documentosValoresIniciales?.fotosSoatIniciales || [];
    this.fotosImpuestoAno = data.documentosValoresIniciales?.fotosImpuestoAno || [];

    this.adjuntos = [
        ...this.fotosCedulaPropietario,
        ...this.fotosTarjetaPropietario,
        ...this.fotosSoat,
        ...this.fotosCertificadoTradicion,
        ...this.fotosEstadoCuentaImpuesto,
        ...this.fotosSimitPropietario,
        ...this.fotosLiquidacionDeudaFinanciera,
        ...this.fotosTecnoMecanica,
        ...this.fotosManifiestoFactura,
        ...this.fotosSoatIniciales,
        ...this.fotosImpuestoAno
    ];

    this.mostrarTodosAdjuntos = false;
    this.actualizarAdjuntosToShow();

    const trabajosFormArray = this.camposForm.get('campos') as FormArray;
    trabajosFormArray.clear();

    if (Array.isArray(data.trabajos)) {
        data.trabajos.forEach((trabajo: any, index: number) => {
            const diaRealizacion = new Date(trabajo.diaRealizacion).toISOString().substring(0, 10);

            const campos = this.formBuilder.group({
                tipo: [trabajo.tipo],
                tipoDescripcion: [this.tiposDeTrabajo[trabajo.tipo]],
                estado: [trabajo.estado],
                proveedor: [trabajo.proveedor],
                responsable: [trabajo.responsable],
                tiempo: [trabajo.tiempo],
                diaRealizacion: [diaRealizacion],
                atiende: [trabajo.atiende],
                telefono: [trabajo.telefono],
                observacion: [trabajo.observacion],
                imagenes: [trabajo.imagenes],
            });

            trabajosFormArray.push(campos);

            this.proveedoresFiltrados[index] = new BehaviorSubject<any[]>(this.allProveedores);

            const proveedorControl = campos.get('proveedor') as FormControl;
            proveedorControl.valueChanges.pipe(
                startWith(proveedorControl.value || ''),
                map((value: any) => this._filterSuppliers(value))
            ).subscribe(filteredSuppliers => {
                this.proveedoresFiltrados[index].next(filteredSuppliers);
            });
        });
    }

    setTimeout(() => {
        this.isDataLoaded = true;
        this.crearOrden()
    }, 1500);
}


  cargarInformacionOrden(numeroOrden: any) {
    Swal.fire({
      title: 'Cargando...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.limpiarFormularios();

    this.http.get<any>(`${this.apiUrl}/api/getOrdenes/ordenes/${numeroOrden}`).subscribe(
      data => {
        this.btnEsconder = true;
        this.ordenId = data._id;
        this.btnChange = true;
        this.mostrarSiguienteModal2 = true;
        this.vehiculo = data.vehiculo;
        this.cliente = data.cliente;
        this.numeroInventario = data.numeroInventario;

        this._id = data._id;

        this.ordenesForm.patchValue({
          estadoOrden: data.estadoOrden,
          pruebaDeRuta: data.pruebaDeRuta,
        });

        const trabajosFormArray = this.camposForm.get('campos') as FormArray;
        data.trabajos.forEach((trabajo: any, index: number) => {
          const diaRealizacion = new Date(trabajo.diaRealizacion).toISOString().substring(0, 10);

          trabajosFormArray.push(this.formBuilder.group({
            tipo: [trabajo.tipo],
            tipoDescripcion: [this.tiposDeTrabajo[trabajo.tipo]],
            estado: [trabajo.estado],
            proveedor: [trabajo.proveedor],
            responsable: [trabajo.responsable],
            tiempo: [trabajo.tiempo],
            diaRealizacion: diaRealizacion,
            atiende: [trabajo.atiende],
            telefono: [trabajo.telefono],
            observacion: [trabajo.observacion],
            imagenes: [trabajo.imagenes],
          }));

          const proveedorControl = trabajosFormArray.at(index).get('proveedor') as FormControl;
          this.proveedoresFiltrados[index] = new BehaviorSubject<any[]>(this.allProveedores);

          proveedorControl.valueChanges.pipe(
            startWith(proveedorControl.value || ''),
            map((value: any) => this._filterSuppliers(value))
          ).subscribe(filteredSuppliers => {
            this.proveedoresFiltrados[index].next(filteredSuppliers);
          });
        });

        if (data.adjuntos) {
          this.fotosCedulaPropietario = data.adjuntos.fotosCedulaPropietario || [];
          this.fotosTarjetaPropietario = data.adjuntos.fotosTarjetaPropietario || [];
          this.fotosSoat = data.adjuntos.fotosSoat || [];
          this.fotosCertificadoTradicion = data.adjuntos.fotosCertificadoTradicion || [];
          this.fotosEstadoCuentaImpuesto = data.adjuntos.fotosEstadoCuentaImpuesto || [];
          this.fotosSimitPropietario = data.adjuntos.fotosSimitPropietario || [];
          this.fotosLiquidacionDeudaFinanciera = data.adjuntos.fotosLiquidacionDeudaFinanciera || [];
          this.fotosTecnoMecanica = data.adjuntos.fotosTecnoMecanica || [];
          this.fotosManifiestoFactura = data.adjuntos.fotosManifiestoFactura || [];
          this.fotosSoatIniciales = data.adjuntos.fotosSoatIniciales || [];
          this.fotosImpuestoAno = data.adjuntos.fotosImpuestoAno || [];

          this.adjuntos = [
            ...this.fotosCedulaPropietario,
            ...this.fotosTarjetaPropietario,
            ...this.fotosSoat,
            ...this.fotosCertificadoTradicion,
            ...this.fotosEstadoCuentaImpuesto,
            ...this.fotosSimitPropietario,
            ...this.fotosLiquidacionDeudaFinanciera,
            ...this.fotosTecnoMecanica,
            ...this.fotosManifiestoFactura,
            ...this.fotosSoatIniciales,
            ...this.fotosImpuestoAno
          ];
        }

        this.modificacion = data.modificacion.reverse();

        this.btnChange = true;

        Swal.close();
        setTimeout(() => {
          this.isDataLoaded = true;
        }, 1500);

        this.actualizarAdjuntosToShow();
      },
      error => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la información de la orden de trabajo',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    );
  }

  configureFiltering() {
    this.opcionesFiltradas = this.proveedoresControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allProveedores.filter(option => option.toLowerCase().includes(filterValue));
  }

  displayFn(proveedor: string): string {
    return proveedor || '';
  }

  buscarVehiculoPorId(vehiculoId: string) {
    this.http.get<any>(`${this.apiUrl}/api/getVehicles/${vehiculoId}`).subscribe(
      vehiculoData => {
        this.vehiculo = vehiculoData;
        this.vehiculo.fechaMatricula = new Date(vehiculoData.fechaMatricula).toISOString().substring(0, 10);
      },
      error => {
      }
    );
  }

  buscarClientePorId(clienteId: string) {
    this.http.get<any>(`${this.apiUrl}/api/getClients/${clienteId}`).subscribe(
      clienteData => {
        this.cliente = clienteData;
        this.cliente.fechaIngreso = new Date(clienteData.fechaIngreso).toISOString().substring(0, 10);
      },
      error => {
      }
    );
  }

  eliminarTrabajo(index: number) {
    const trabajosFormArray = this.camposForm.get('campos') as FormArray;
    trabajosFormArray.removeAt(index);
    this.actualizarOrden();
  }

  async actualizarOrden() {
    if (this.isDataLoaded && this.ordenesForm.valid) {
      const camposOrden = this.convertirArrayAObjeto(this.campos);

      const datosActualizados = {
        vehiculo: this.vehiculo._id,
        cliente: this.cliente._id,
        estadoOrden: this.ordenesForm.get('estadoOrden')?.value,
        pruebaDeRuta: this.ordenesForm.get('pruebaDeRuta')?.value,
        numeroInventario: this.numeroInventario.toString(),
        modificacion: JSON.stringify([{ quien: this.datosUser, fecha: new Date().toISOString() }]),
        trabajos: JSON.stringify(camposOrden)
      };

      try {
        const response: any = await this.http.put(`${this.apiUrl}/api/updateOrdenes/${this.ordenId}`, datosActualizados).toPromise();
      } catch (error) {
      }
    }
  }

  limpiarFormularios() {
    this.btnEsconder2 = false;
    this.btnEsconder = false;

    this.ordenesForm.reset();

    const camposFormArray = this.camposForm.get('campos') as FormArray;
    while (camposFormArray.length !== 0) {
      camposFormArray.removeAt(0);
    }

    this.modificacion = [];

    this.buscarInventarioForm.reset();

    this.vehiculo = {
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
    };

    this.cliente = {};

    this.numeroInventario = '';
    this.ordenId = '';
    this.btnChange = false;
    this.btnChange2 = false;
    this.isDataLoaded = false;

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
    this.adjuntos = [];
    this.adjuntosToShow = [];
  }

  limpiarFormularios2() {
    this.modificacion = [];
    this.limpiarFormularios();
  }

  buscarOrdenPlaca() {
    const placa = this.vehiculoInvOneControl.value;
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/ordenes/${placa}`).subscribe(
      data => {
        this.ordenes = data.map(orden => {
          const fechaCreacion = new Date(orden.createdAt);
          const day = fechaCreacion.getDate();
          const monthIndex = fechaCreacion.getMonth();
          const year = fechaCreacion.getFullYear();
          const formattedDate = `${day} de ${this.monthNames[monthIndex]} del ${year}`;

          return {
            numeroOrden: orden.numeroOrden,
            createdAt: formattedDate,
            estado: orden.estado,
            vehiculo: orden.vehiculo,
            cliente: orden.cliente
          };
        }).sort((a: any, b: any) => b.numeroOrden - a.numeroOrden);
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

  generarOrden(datos: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/api/ordenTrabajo`, datos, { responseType: 'blob' });
  }

  async generarOrdenTrabajo(index: number) {
    const campo = this.campos.at(index) as FormGroup;
    let numero = this.numeroInventario + "-" + (index + 1);
    let vehiculo = this.vehiculo.marca + " " + this.vehiculo.linea + " " + this.vehiculo.version + " " + this.vehiculo.modelo
    const datos = {
      numero: numero,
      vehiculo: vehiculo,
      fecha: this.formatearFecha(this.fechaActual),
      placa: this.vehiculo.placa,
      tipo: campo.get('tipo')?.value,
      proveedor: campo.get('proveedor')?.value,
      responsable: campo.get('responsable')?.value,
      tiempo: campo.get('tiempo')?.value,
      diaRealizacion: this.formatearFecha(campo.get('diaRealizacion')?.value),
      atiende: campo.get('atiende')?.value,
      telefono: campo.get('telefono')?.value,
      observacion: campo.get('observacion')?.value,
      imagenes: campo.get('imagenPrevia')?.value || [],
    };

    try {
      const blob = await this.generarOrden(datos).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orden_trabajo.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Swal.fire('Éxito', 'Documento generado correctamente', 'success');
      } else {
        throw new Error('No se recibió un blob válido del servidor');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al generar el documento', 'error');
    }
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

  formatearFecha(fecha: String) {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const partes = fecha.split("-");
    const año = partes[0];
    const mes = meses[parseInt(partes[1]) - 1];
    const día = partes[2];
    return `${día} de ${mes} del ${año}`;
  }

  formatearFecha2(fecha: string) {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const fechaHora = new Date(fecha);

    const año = fechaHora.getFullYear();
    const mes = meses[fechaHora.getMonth()];
    const día = fechaHora.getDate();

    let horas = fechaHora.getHours();
    const minutos = fechaHora.getMinutes();
    const segundos = fechaHora.getSeconds();
    const ampm = horas >= 12 ? 'PM' : 'AM';

    horas = horas % 12;
    horas = horas ? horas : 12; // La hora '0' debe ser '12'
    const formatoHoras = horas < 10 ? `0${horas}` : horas;
    const formatoMinutos = minutos < 10 ? `0${minutos}` : minutos;
    const formatoSegundos = segundos < 10 ? `0${segundos}` : segundos;

    return `${día} de ${mes} del ${año} ${formatoHoras}:${formatoMinutos}:${formatoSegundos} ${ampm}`;
  }

  splif(url: any) {
    return url.split('/').pop();
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

  onSelectResponsable(event: any, index: number) {
    const selectedResponsable = event.target.value;
    const responsable = this.usuarios.find(user => user.nombre === selectedResponsable);

    if (responsable) {
      this.campos.at(index).get('telefono')?.setValue(responsable.telefono || '');
      this.campos.at(index).get('telefono')?.disable();
    } else {
      this.campos.at(index).get('telefono')?.setValue('');
      this.campos.at(index).get('telefono')?.enable();
    }
  }

  uploadImagesToS3(files: File[], index: number) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append(`trabajos[${index}].imagenesNuevas`, file);
    });

    formData.append('ordenId', this.ordenId);
    formData.append('trabajoIndex', index.toString());

    this.http.post(`${this.apiUrl}/api/uploadImages`, formData).subscribe(
      (response: any) => {
        const imagePaths = response.nuevasImagenes;
        const campo = this.campos.at(index) as FormGroup;
        const imagenesGuardadas = campo.get('imagenes')?.value || [];

        campo.patchValue({
          imagenes: [...imagenesGuardadas, ...imagePaths],
          imagenPrevia: [...imagenesGuardadas, ...imagePaths]
        });
      },
      error => {
      }
    );
  }

  removeImage(formIndex: number, imageIndex: number) {
    const campo = this.campos.at(formIndex) as FormGroup;
    const imagenes = campo.get('imagenes')?.value || [];

    const imageUrl = imagenes[imageIndex];
    if (!imageUrl) {
      return;
    }

    this.http.post(`${this.apiUrl}/api/deleteImage`, {
      path: imageUrl,
      ordenId: this.ordenId,
      trabajoIndex: formIndex,
      imageIndex: imageIndex
    }).subscribe(
      response => {
        imagenes.splice(imageIndex, 1);

        campo.patchValue({
          imagenes: imagenes,
          imagenPrevia: imagenes
        });
      },
      error => {
      }
    );
  }
}