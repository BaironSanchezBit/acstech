import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ClientsService } from 'src/app/services/clients.service';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable, Subscription, debounceTime, distinctUntilChanged, map, of, startWith } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { environment } from 'src/app/environments/environment';
declare var bootstrap: any;
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-imagenes-ingreso',
  templateUrl: './imagenes-ingreso.component.html',
  styleUrl: './imagenes-ingreso.component.css'
})
export class ImagenesIngresoComponent {
  ImagenesIngresoForm: FormGroup;
  buscarInventarioForm: FormGroup;
  placaValue = '';
  inventarios: any[] = [];
  monthNames = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre",
    "noviembre", "diciembre"
  ];
  inventoryId: string = '';
  btnEsconder: Boolean = false;
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
  button13: boolean = false;
  button14: boolean = false;
  loading = false;

  datosUser: any;
  loggedIn: boolean = false;
  private formStateStack: any[] = [];
  private redoStack: any[] = [];

  fotosTresCuartosFrente: string[] = [];
  fotosFrente: string[] = [];
  fotosFrenteCapoAbierto: string[] = [];
  fotosMotor: string[] = [];
  fotosLateralDerecho: string[] = [];
  fotosTrasera: string[] = [];
  fotosTraseraBaulAbierto: string[] = [];
  fotosBaul: string[] = [];
  fotosTresCuartosTrasera: string[] = [];
  fotosLateralIzquierdo: string[] = [];
  fotosAsientosDelanteros: string[] = [];
  fotosAsientosTraseros: string[] = [];
  fotosPanelCompleto: string[] = [];
  registroActividad: any;
  deleteMessageIndex: number | null = null;
  deleteMessageField: string | null = null;
  showModal: boolean = false;
  imagenesModal: string[] = [];
  imagenSeleccionadaIndex: number = 0;

  subscription: Subscription;
  private modalInstance: any;
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  allVehicles: any[] = [];
  vehiculoControl = new FormControl();
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  constructor(private router: Router, private sharedData: SharedDataService, private cdr: ChangeDetectorRef, private http: HttpClient, private vehiclesService: VehiclesService, private clientsService: ClientsService, private authService: AuthService, private formBuilder: FormBuilder) {
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
          this.irAlInventario(id);
        }
      },
      error: (err) => console.error('', err)
    });

    this.buscarInventarioForm = this.formBuilder.group({
      buscarInventario: ['', Validators.required]
    });

    this.ImagenesIngresoForm = this.formBuilder.group({
      tresCuartosFrente: [''],
      tresCuartosFrenteObs: [''],
      frente: [''],
      frenteObs: [''],
      frenteCapoAbierto: [''],
      frenteCapoAbiertoObs: [''],
      motor: [''],
      motorObs: [''],
      lateralDerecho: [''],
      lateralDerechoObs: [''],
      trasera: [''],
      traseraObs: [''],
      traseraBaulAbierto: [''],
      traseraBaulAbiertoObs: [''],
      baul: [''],
      baulObs: [''],
      ultimoKilometraje: [''],
      lugarUltimoMantenimiento: [''],
      fechaUltimoMantenimiento: [''],
      tresCuartosTrasera: [''],
      tresCuartosTraseraObs: [''],
      lateralIzquierdo: [''],
      lateralIzquierdoObs: [''],
      asientosDelanteros: [''],
      asientosDelanterosObs: [''],
      asientosTraseros: [''],
      asientosTraserosObs: [''],
      panelCompleto: [''],
      panelCompletoObs: [''],
      registroActividad: [[]]
    });
  }

  ngOnInit(): void {
    this.loading = true;

    document.addEventListener('keydown', this.handleUndoRedo.bind(this));

    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      this.authService.getUserDetails().subscribe(
        user => {
          this.datosUser = user;
        },
        error => {
          console.error('Error fetching user details:', error);
        }
      );
    }

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
      this.configureFilteringVeh();
    });

    this.subscription = this.sharedData.currentInventoryId.subscribe(id => {
      if (id) {
        this.irAlInventario(id);
      }
    });
  }

  triggerFileInput(fieldName: string) {
    console.log(fieldName);
    const fileInput = document.getElementById(fieldName) as HTMLInputElement;
    console.log(fileInput);
    if (fileInput) {
      fileInput.click();
    }
  }

  ngOnDestroy(): void {
    this.closeModal();
    document.removeEventListener('keydown', this.handleUndoRedo.bind(this));
    this.subscription.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.sharedData.clearCurrentInventoryId();
  }

  saveCurrentState() {
    const currentState = this.ImagenesIngresoForm.getRawValue();
    if (this.formStateStack.length === 0 || JSON.stringify(this.formStateStack[this.formStateStack.length - 1]) !== JSON.stringify(currentState)) {
      console.log(currentState);
      this.formStateStack.push(currentState);
      this.redoStack = []; // Clear redo stack whenever a new action is performed
    }
  }

  handleUndoRedo(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.undo();
    } else if (event.ctrlKey && event.key === 'y') {
      event.preventDefault();
      this.redo();
    }
  }

  undo() {
    try {
      if (this.formStateStack.length > 0) {
        const previousState = this.formStateStack.pop();
        this.redoStack.push(this.ImagenesIngresoForm.getRawValue());
        this.setFormValueSafely(previousState);
        this.actualizarInventario(); // Actualizar el inventario después de deshacer
      } else {
      }
    } catch (error) {
    }
  }

  redo() {
    try {
      if (this.redoStack.length > 0) {
        const nextState = this.redoStack.pop();
        this.formStateStack.push(this.ImagenesIngresoForm.getRawValue());
        this.setFormValueSafely(nextState);
        this.actualizarInventario(); // Actualizar el inventario después de rehacer
      } else {
      }
    } catch (error) {
    }
  }

  restorePreviousState() {
    try {
      if (this.formStateStack.length > 0) {
        const previousState = this.formStateStack.pop();
        this.setFormValueSafely(previousState);
      } else {
      }
    } catch (error) {
    }
  }

  setFormValueSafely(state: any) {
    this.ImagenesIngresoForm.patchValue(state);
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
    const placa = this.vehiculoControl.value;
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

  irAlInventario(inventarioId: string) {
    this.buscarInventarioForm.get('buscarInventario')?.setValue(inventarioId);
    this.limpiarFormularios();
    this.buscarInventario();
    this.openModal();
  }

  buscarInventario() {

    this.btnEsconder = false;

    if (this.buscarInventarioForm.valid) {
      Swal.fire({
        title: 'Buscando inventario',
        html: 'Espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      setTimeout(() => {
        const inventarioId = this.buscarInventarioForm.get('buscarInventario')?.value;

        this.http.get<any>(`${this.apiUrl}/api/getInventories/idInventories/${inventarioId}`).subscribe(
          data => {
            this.inventoryId = data._id;
            //const fechaUltimoMantenimiento = new Date(data.ImagenesIngreso.fechaUltimoMantenimiento).toISOString().substring(0, 10);
            
            this.ImagenesIngresoForm.patchValue({
              tresCuartosFrente: data.ImagenesIngreso.tresCuartosFrente,
              tresCuartosFrenteObs: data.ImagenesIngreso.tresCuartosFrenteObs,
              frente: data.ImagenesIngreso.frente,
              frenteObs: data.ImagenesIngreso.frenteObs,
              frenteCapoAbierto: data.ImagenesIngreso.frenteCapoAbierto,
              frenteCapoAbiertoObs: data.ImagenesIngreso.frenteCapoAbiertoObs,
              motor: data.ImagenesIngreso.motor,
              motorObs: data.ImagenesIngreso.motorObs,
              lateralDerecho: data.ImagenesIngreso.lateralDerecho,
              lateralDerechoObs: data.ImagenesIngreso.lateralDerechoObs,
              trasera: data.ImagenesIngreso.trasera,
              traseraObs: data.ImagenesIngreso.traseraObs,
              traseraBaulAbierto: data.ImagenesIngreso.traseraBaulAbierto,
              traseraBaulAbiertoObs: data.ImagenesIngreso.traseraBaulAbiertoObs,
              baul: data.ImagenesIngreso.baul,
              baulObs: data.ImagenesIngreso.baulObs,
              ultimoKilometraje: data.ImagenesIngreso.ultimoKilometraje,
              lugarUltimoMantenimiento: data.ImagenesIngreso.lugarUltimoMantenimiento,
              //fechaUltimoMantenimiento: fechaUltimoMantenimiento,
              tresCuartosTrasera: data.ImagenesIngreso.tresCuartosTrasera,
              tresCuartosTraseraObs: data.ImagenesIngreso.tresCuartosTraseraObs,
              lateralIzquierdo: data.ImagenesIngreso.lateralIzquierdo,
              lateralIzquierdoObs: data.ImagenesIngreso.lateralIzquierdoObs,
              asientosDelanteros: data.ImagenesIngreso.asientosDelanteros,
              asientosDelanterosObs: data.ImagenesIngreso.asientosDelanterosObs,
              asientosTraseros: data.ImagenesIngreso.asientosTraseros,
              asientosTraserosObs: data.ImagenesIngreso.asientosTraserosObs,
              panelCompleto: data.ImagenesIngreso.panelCompleto,
              panelCompletoObs: data.ImagenesIngreso.panelCompletoObs,
            });
            console.log(this.ImagenesIngresoForm)
            console.log(data.ImagenesIngreso.tresCuartosFrente)
            console.log(data.ImagenesIngreso.fotosTresCuartosFrente)

            this.fotosTresCuartosFrente = data.ImagenesIngreso.fotosTresCuartosFrente || [];
            this.fotosFrente = data.ImagenesIngreso.fotosFrente || [];
            this.fotosFrenteCapoAbierto = data.ImagenesIngreso.fotosFrenteCapoAbierto || [];
            this.fotosMotor = data.ImagenesIngreso.fotosMotor || [];
            this.fotosLateralDerecho = data.ImagenesIngreso.fotosLateralDerecho || [];
            this.fotosTrasera = data.ImagenesIngreso.fotosTrasera || [];
            this.fotosTraseraBaulAbierto = data.ImagenesIngreso.fotosTraseraBaulAbierto || [];
            this.fotosBaul = data.ImagenesIngreso.fotosBaul || [];
            this.fotosTresCuartosTrasera = data.ImagenesIngreso.fotosTresCuartosTrasera || [];
            this.fotosLateralIzquierdo = data.ImagenesIngreso.fotosLateralIzquierdo || [];
            this.fotosAsientosDelanteros = data.ImagenesIngreso.fotosAsientosDelanteros || [];
            this.fotosAsientosTraseros = data.ImagenesIngreso.fotosAsientosTraseros || [];
            this.fotosPanelCompleto = data.ImagenesIngreso.fotosPanelCompleto || [];
            this.registroActividad = (data.ImagenesIngreso.registroActividad || []).reverse();

            this.saveCurrentState();
            Swal.close()
          },
          error => {
            Swal.close()
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

  async actualizarInventario(updatedInventoryData?: any) {
    const currentData = this.ImagenesIngresoForm.value;
    const dataToUpdate = {
      ImagenesIngreso: {
        tresCuartosFrente: currentData.tresCuartosFrente,
        tresCuartosFrenteObs: currentData.tresCuartosFrenteObs,
        fotosTresCuartosFrente: this.fotosTresCuartosFrente,
        frente: currentData.frente,
        frenteObs: currentData.frenteObs,
        fotosFrente: this.fotosFrente,
        frenteCapoAbierto: currentData.frenteCapoAbierto,
        frenteCapoAbiertoObs: currentData.frenteCapoAbiertoObs,
        fotosFrenteCapoAbierto: this.fotosFrenteCapoAbierto, 
        motor: currentData.motor,
        motorObs: currentData.motorObs,
        fotosMotor: this.fotosMotor,
        lateralDerecho: currentData.lateralDerecho,
        lateralDerechoObs: currentData.lateralDerechoObs,
        fotosLateralDerecho: this.fotosLateralDerecho,
        trasera: currentData.trasera,
        traseraObs: currentData.traseraObs,
        fotosTrasera: this.fotosTrasera,
        traseraBaulAbierto: currentData.traseraBaulAbierto,
        traseraBaulAbiertoObs: currentData.traseraBaulAbiertoObs,
        fotosTraseraBaulAbierto: this.fotosTraseraBaulAbierto,
        baul: currentData.baul,
        baulObs: currentData.baulObs,
        fotosBaul: this.fotosBaul,
        tresCuartosTrasera: currentData.tresCuartosTrasera,
        tresCuartosTraseraObs: currentData.tresCuartosTraseraObs,
        fotosTresCuartosTrasera: this.fotosTresCuartosTrasera,
        lateralIzquierdo: currentData.lateralIzquierdo,
        lateralIzquierdoObs: currentData.lateralIzquierdoObs,
        fotosLateralIzquierdo: this.fotosLateralIzquierdo,
        asientosTraseros: currentData.asientosTraseros,
        asientosTraserosObs: currentData.asientosTraserosObs,
        fotosAsientosTraseros: this.fotosAsientosTraseros,
        asientosDelanteros: currentData.asientosDelanteros,
        asientosDelanterosObs: currentData.asientosDelanterosObs,
        fotosAsientosDelanteros: this.fotosAsientosDelanteros,
        panelCompleto: currentData.panelCompleto,
        panelCompletoObs: currentData.panelCompletoObs,
        fotosPanelCompleto: this.fotosPanelCompleto,
        registroActividad: [
          ...(currentData.registroActividad || []),
          ...(updatedInventoryData?.ImagenesIngreso?.registroActividad || [])
        ]
      }
    };

    try {
      let response: any = await this.http.put(`${this.apiUrl}/api/updateInventories/${this.inventoryId}`, dataToUpdate).toPromise();
      this.registroActividad = (response.ImagenesIngreso.registroActividad || []).reverse();
      this.saveCurrentState();
    } catch (error: any) {
    }
  }

  limpiarFormularios() {
    this.btnEsconder = false;
    this.ImagenesIngresoForm.reset();

    this.fotosTresCuartosFrente = [];
    this.fotosFrente = [];
    this.fotosFrenteCapoAbierto = [];
    this.fotosMotor = [];
    this.fotosLateralDerecho = [];
    this.fotosTrasera = [];
    this.fotosTraseraBaulAbierto = [];
    this.fotosBaul = [];
    this.fotosTresCuartosTrasera = [];
    this.fotosLateralIzquierdo = [];
    this.fotosAsientosDelanteros = [];
    this.fotosAsientosTraseros = [];
    this.fotosPanelCompleto = [];
    this.registroActividad = [];

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

  funcionButton13() {
    if (this.button13) {
      this.button13 = false;
    } else {
      this.button13 = true;
    }
  }

  funcionButton14() {
    if (this.button14) {
      this.button14 = false;
    } else {
      this.button14 = true;
    }
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

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  private openModal(): void {
    const modalElement = document.getElementById('staticBackdrop12');
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


  onTresCuartosFrenteSelected(event: any) {
    this.onFileChange('fotosTresCuartosFrente', event);
    const fotosTresCuartosFrente = Array.from(event.target.files) as File[];
    this.uploadTresCuartosFrentePhotos(fotosTresCuartosFrente);
  }

  onFrenteSelected(event: any) {
    this.onFileChange('fotosFrente', event);
    const fotosFrente = Array.from(event.target.files) as File[];
    this.uploadFrentePhotos(fotosFrente);
  }

  onFrenteCapoAbiertoSelected(event: any) {
    this.onFileChange('fotosFrenteCapoAbierto', event);
    const fotosFrenteCapoAbierto = Array.from(event.target.files) as File[];
    this.uploadFrenteCapoAbiertoPhotos(fotosFrenteCapoAbierto);
  }

  onMotorSelected(event: any) {
    this.onFileChange('fotosMotor', event);
    const fotosMotor = Array.from(event.target.files) as File[];
    this.uploadMotorPhotos(fotosMotor);
  }

  onLateralDerechoSelected(event: any) {
    this.onFileChange('fotosLateralDerecho', event);
    const fotosLateralDerecho = Array.from(event.target.files) as File[];
    this.uploadLateralDerechoPhotos(fotosLateralDerecho);
  }

  onTraseraSelected(event: any) {
    this.onFileChange('fotosTrasera', event);
    const fotosTrasera = Array.from(event.target.files) as File[];
    this.uploadTraseraPhotos(fotosTrasera);
  }

  onTraseraBaulAbiertoSelected(event: any) {
    this.onFileChange('fotosTraseraBaulAbierto', event);
    const fotosTraseraBaulAbierto = Array.from(event.target.files) as File[];
    this.uploadTraseraBaulAbiertoPhotos(fotosTraseraBaulAbierto);
  }

  onBaulSelected(event: any) {
    this.onFileChange('fotosBaul', event);
    const fotosBaul = Array.from(event.target.files) as File[];
    this.uploadBaulPhotos(fotosBaul);
  }

  onTresCuartosTraseraSelected(event: any) {
    this.onFileChange('fotosTresCuartosTrasera', event);
    const fotosTresCuartosTrasera = Array.from(event.target.files) as File[];
    this.uploadTresCuartosTraseraPhotos(fotosTresCuartosTrasera);
  }

  onLateralIzquierdoSelected(event: any) {
    this.onFileChange('fotosLateralIzquierdo', event);
    const fotosLateralIzquierdo = Array.from(event.target.files) as File[];
    this.uploadLateralIzquierdoPhotos(fotosLateralIzquierdo);
  }

  onAsientosDelanterosSelected(event: any) {
    this.onFileChange('fotosAsientosDelanteros', event);
    const fotosAsientosDelanteros = Array.from(event.target.files) as File[];
    this.uploadAsientosDelanterosPhotos(fotosAsientosDelanteros);
  }

  onAsientosTraserosSelected(event: any) {
    this.onFileChange('fotosAsientosTraseros', event);
    const fotosAsientosTraseros = Array.from(event.target.files) as File[];
    this.uploadAsientosTraserosPhotos(fotosAsientosTraseros);
  }

  onPanelCompletoSelected(event: any) {
    this.onFileChange('fotosPanelCompleto', event);
    const fotosPanelCompleto = Array.from(event.target.files) as File[];
    this.uploadPanelCompletoPhotos(fotosPanelCompleto);
  }


  async uploadTresCuartosFrentePhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTresCuartosFrente');
  }

  async uploadFrentePhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosFrente');
  }

  async uploadFrenteCapoAbiertoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosFrenteCapoAbierto');
  }

  async uploadMotorPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosMotor');
  }

  async uploadLateralDerechoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosLateralDerecho');
  }

  async uploadTraseraPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTrasera');
  }

  async uploadTraseraBaulAbiertoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTraseraBaulAbierto');
  }

  async uploadBaulPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosBaul');
  }

  async uploadTresCuartosTraseraPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosTresCuartosTrasera');
  }

  async uploadLateralIzquierdoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosLateralIzquierdo');
  }

  async uploadAsientosDelanterosPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosAsientosDelanteros');
  }

  async uploadAsientosTraserosPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosAsientosTraseros');
  }

  async uploadPanelCompletoPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosPanelCompleto');
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


  updatePhotoArrays(fieldName: string, response: any) {
    if (fieldName === 'fotosTresCuartosFrente') {
      this.fotosTresCuartosFrente = response.ImagenesIngreso.fotosTresCuartosFrente;
    } else if (fieldName === 'fotosFrente') {
      this.fotosFrente = response.ImagenesIngreso.fotosFrente;
    } else if (fieldName === 'fotosFrenteCapoAbierto') {
      this.fotosFrenteCapoAbierto = response.ImagenesIngreso.fotosFrenteCapoAbierto;
    } else if (fieldName === 'fotosMotor') {
      this.fotosMotor = response.ImagenesIngreso.fotosMotor;
    } else if (fieldName === 'fotosLateralDerecho') {
      this.fotosLateralDerecho = response.ImagenesIngreso.fotosLateralDerecho;
    } else if (fieldName === 'fotosTrasera') {
      this.fotosTrasera = response.ImagenesIngreso.fotosTrasera;
    } else if (fieldName === 'fotosTraseraBaulAbierto') {
      this.fotosTraseraBaulAbierto = response.ImagenesIngreso.fotosTraseraBaulAbierto;
    } else if (fieldName === 'fotosBaul') {
      this.fotosBaul = response.ImagenesIngreso.fotosBaul;
    } else if (fieldName === 'fotosTresCuartosTrasera') {
      this.fotosTresCuartosTrasera = response.ImagenesIngreso.fotosTresCuartosTrasera;
    } else if (fieldName === 'fotosLateralIzquierdo') {
      this.fotosLateralIzquierdo = response.ImagenesIngreso.fotosLateralIzquierdo;
    } else if (fieldName === 'fotosAsientosDelanteros') {
      this.fotosAsientosDelanteros = response.ImagenesIngreso.fotosAsientosDelanteros;
    } else if (fieldName === 'fotosAsientosTraseros') {
      this.fotosAsientosTraseros = response.ImagenesIngreso.fotosAsientosTraseros;
    } else if (fieldName === 'fotoPanelCompleto') {
      this.fotosPanelCompleto = response.ImagenesIngreso.fotosPanelCompleto;
    }

    this.cdr.detectChanges();
  }

  async eliminarFoto(fieldName: string, Name: string, index: number) {
    this.goToSlide(Name,index-1);
    let fotoUrl: any;
    if (fieldName === 'fotosTresCuartosFrente') {
      fotoUrl = this.fotosTresCuartosFrente[index];
    } else if (fieldName === 'fotosFrente') {
      fotoUrl = this.fotosFrente[index];
    } else if (fieldName === 'fotosFrenteCapoAbierto') {
      fotoUrl = this.fotosFrenteCapoAbierto[index];
    } else if (fieldName === 'fotosMotor') {
      fotoUrl = this.fotosMotor[index];
    } else if (fieldName === 'fotosLateralDerecho') {
      fotoUrl = this.fotosLateralDerecho[index];
    } else if (fieldName === 'fotosTrasera') {
      fotoUrl = this.fotosTrasera[index];
    } else if (fieldName === 'fotosTraseraBaulAbierto') {
      fotoUrl = this.fotosTraseraBaulAbierto[index];
    } else if (fieldName === 'fotosBaul') {
      fotoUrl = this.fotosBaul[index];
    } else if (fieldName === 'fotosTresCuartosTrasera') {
      fotoUrl = this.fotosTresCuartosTrasera[index];
    } else if (fieldName === 'fotosLateralIzquierdo') {
      fotoUrl = this.fotosLateralIzquierdo[index];
    } else if (fieldName === 'fotosAsientosDelanteros') {
      fotoUrl = this.fotosAsientosDelanteros[index];
    } else if (fieldName === 'fotosAsientosTraseros') {
      fotoUrl = this.fotosAsientosTraseros[index];
    } else if (fieldName === 'fotosPanelCompleto') {
      fotoUrl = this.fotosPanelCompleto[index];
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

    console.log(this.inventoryId, fieldName, fotoUrl);
    try {
      await this.http.delete(`${this.apiUrl}/api/deleteInventoryPhoto`, {
        body: { inventoryId: this.inventoryId, field: fieldName, photoUrl: fotoUrl }
      }).toPromise();

      if (fieldName === 'fotosTresCuartosFrente') {
        this.fotosTresCuartosFrente.splice(index, 1);
      } else if (fieldName === 'fotosFrente') {
        this.fotosFrente.splice(index, 1);
      } else if (fieldName === 'fotosFrenteCapoAbierto') {
        this.fotosFrenteCapoAbierto.splice(index, 1);
      } else if (fieldName === 'fotosMotor') {
        this.fotosMotor.splice(index, 1);
      } else if (fieldName === 'fotosLateralDerecho') {
        this.fotosLateralDerecho.splice(index, 1);
      } else if (fieldName === 'fotosTrasera') {
        this.fotosTrasera.splice(index, 1);
      } else if (fieldName === 'fotosTraseraBaulAbierto') {
        this.fotosTraseraBaulAbierto.splice(index, 1);
      } else if (fieldName === 'fotosBaul') {
        this.fotosBaul.splice(index, 1);
      } else if (fieldName === 'fotosTresCuartosTrasera') {
        this.fotosTresCuartosTrasera.splice(index, 1);
      } else if (fieldName === 'fotosLateralIzquierdo') {
        this.fotosLateralIzquierdo.splice(index, 1);
      } else if (fieldName === 'fotosAsientosDelanteros') {
        this.fotosAsientosDelanteros.splice(index, 1);
      } else if (fieldName === 'fotosAsientosTraseros') {
        this.fotosAsientosTraseros.splice(index, 1);
      } else if (fieldName === 'fotosPanelCompleto') {
        this.fotosPanelCompleto.splice(index, 1);
      }
      // Muestra el mensaje de eliminación
      this.deleteMessageIndex = index;
      this.deleteMessageField = fieldName;
      console.log(this.deleteMessageIndex);
      console.log(this.deleteMessageField);
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
      // Cerrar el mensaje de espera en caso de error
      Swal.close();
      // Manejo del error
      Swal.fire("Error al eliminar la foto!", "", "error");
      console.error("", error);
    }
  }


  openModal2(imagenes: string[], index: number) {
    this.imagenesModal = imagenes;
    this.imagenSeleccionadaIndex = index;
    this.showModal = true;
  }

  closeModal2() {
    this.showModal = false;
  }

  sendActivityLog(activity: { type: string, fieldName: string, value: any }) {
    const newActivity = this.createActivityLogEntry(activity.type, activity.fieldName, activity.value);

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

    if (fieldName.endsWith('Obs')) {
      const fieldNameWithoutObs = fieldName.slice(0, -3); // Remover 'Obs' del nombre del campo
      descripcion = `${user} modificó la observación del ${this.getFieldDisplayName(fieldNameWithoutObs)} a "${value}"`;
    } else if (type === 'select') {
      descripcion = `${user} modificó ${this.getFieldDisplayName(fieldName)} a "${value}"`;
    } else if (type === 'file') {
      descripcion = `${user} agregó una foto en ${this.getFieldDisplayName(fieldName)}`;
    } else if (type === 'fileDelete') {
      descripcion = `${user} eliminó una foto de ${this.getFieldDisplayName(fieldName)}`;
    } else if (type === 'undo' || type === 'redo') {
      descripcion = `${user} realizó un ${type} en todos los campos`;
    } else {
      descripcion = `${user} modificó ${this.getFieldDisplayName(fieldName)} a "${value}"`;
    }

    return { type, fieldName, value, image, descripcion, fecha: new Date() };
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldDisplayNames: { [key: string]: string } = {
      tresCuartosFrente: 'TresCuartosFrente',
      frente: 'Frente',
      frenteCapoAbierto: 'FrenteCapoAbierto',
      motor: 'Motor',
      lateralDerecho: 'LateralDerecho',
      trasera: 'Trasera',
      traseraBaulAbierto: 'TraseraBaulAbierto',
      baul: 'Baul',
      ultimoKilometraje: 'Último Kilometraje',
      lugarUltimoMantenimiento: 'Lugar del Último Mantenimiento',
      fechaUltimoMantenimiento: 'Fecha del Último Mantenimiento',
      tresCuartosTrasera: 'TresCuartosTrasera',
      lateralIzquierdo: 'LateralIzquierdo',
      asientosDelanteros: 'AsientosDelanteros',
      asientosTraseros: 'AsientosTraseros',
      panelCompleto: 'PanelCompleto',
      fotosTresCuartosFrente: 'TresCuartosFrente',
      fotosFrente: 'Frente',
      fotosFrenteCapoAbierto: 'FrenteCapoAbierto',
      fotosMotor: 'Motor',
      fotosLateralDerecho: 'LateralDerecho',
      fotosTrasera: 'Trasera',
      fotosTraseraBaulAbierto: 'TraseraBaulAbierto',
      fotosBaul: 'Baul',
      fotosTresCuartosTrasera: 'TresCuartosTrasera',
      fotosLateralIzquierdo: 'LateralIzquierdo',
      fotosAsientosDelanteros: 'AsientosDelanteros',
      fotosAsientosTraseros: 'AsientosTraseros',
      fotosPanelCompleto: 'PanelCompleto'
    };

    return fieldDisplayNames[fieldName] || fieldName;
  }

  onSelectChange(fieldName: string, event: any) {
    this.saveCurrentState();
    const value = event.target.value;
    this.sendActivityLog({
      type: 'select',
      fieldName: fieldName,
      value: value
    });
    this.actualizarInventario();
  }

  onInputChange(fieldName: string, event: any) {
    this.saveCurrentState();
    const value = event.target.value;
    this.sendActivityLog({
      type: 'input',
      fieldName: fieldName,
      value: value
    });
    this.actualizarInventario();
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

// Navegar a un slide específico
goToSlide(name: string, index: number): void {
  const carousel = document.getElementById(name);
  console.log(index);
  console.log(carousel);
  if (carousel) {
    const bsCarousel = new (window as any).bootstrap.Carousel(carousel);
    console.log(index);
    bsCarousel.to(index);
  }
}

// Acción del botón principal
buttonAction(): void {
// Implementa la lógica que necesites
console.log('Botón principal clickeado');
}

// Abrir selector de archivos (si lo necesitas)
openFileInput(): void {
// Implementa la lógica para añadir más fotos
document.getElementById('fileInputTresCuartos')?.click();
}
}

