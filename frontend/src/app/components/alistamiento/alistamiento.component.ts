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
  selector: 'app-alistamiento',
  templateUrl: './alistamiento.component.html',
  styleUrl: './alistamiento.component.css'
})
export class AlistamientoComponent implements OnInit, OnDestroy {
  controlAccesoriosForm: FormGroup;
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

  loading = false;

  datosUser: any;
  loggedIn: boolean = false;
  private formStateStack: any[] = [];
  private redoStack: any[] = [];

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
  fotosElementosPersonales: string[] = [];
  fotosAntena: string[] = [];
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

    this.controlAccesoriosForm = this.formBuilder.group({
      copiaLlave: [{ value: '', disabled: true }],
      copiaLlaveObs: [{ value: '', disabled: true }],
      gato: [''],
      gatoObs: [''],
      llavePernos: [''],
      llavePernosObs: [''],
      copaSeguridad: [''],
      copaSeguridadObs: [''],
      tiroArrastre: [''],
      tiroArrastreObs: [''],
      historialMantenimiento: [''],
      historialMantenimientoObs: [''],
      manual: [''],
      manualObs: [''],
      palomera: [''],
      palomeraObs: [''],
      tapetes: [''],
      tapetesObs: [''],
      ultimoKilometraje: [''],
      lugarUltimoMantenimiento: [''],
      fechaUltimoMantenimiento: [''],
      llantaRepuesto: [''],
      llantaRepuestoObs: [''],
      kitCarretera: [''],
      kitCarreteraObs: [''],
      elementosPersonales: [''],
      elementosPersonalesObs: [''],
      antena: [''],
      antenaObs: [''],
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
    const fileInput = document.getElementById(fieldName) as HTMLInputElement;
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
    const currentState = this.controlAccesoriosForm.getRawValue();
    if (this.formStateStack.length === 0 || JSON.stringify(this.formStateStack[this.formStateStack.length - 1]) !== JSON.stringify(currentState)) {
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
        this.redoStack.push(this.controlAccesoriosForm.getRawValue());
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
        this.formStateStack.push(this.controlAccesoriosForm.getRawValue());
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
    this.controlAccesoriosForm.patchValue(state);
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
    this.http.get<any[]>(`${this.apiUrl}/api/vehicles/preinventarios/${placa}`).subscribe(
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
      setTimeout(() => {
        const inventarioId = this.buscarInventarioForm.get('buscarInventario')?.value;

        this.http.get<any>(`${this.apiUrl}/api/getpreinventories/idpreinventories/${inventarioId}`).subscribe(
          data => {
            this.inventoryId = data._id;
            const fechaUltimoMantenimiento = new Date(data.controlAccesorios.fechaUltimoMantenimiento).toISOString().substring(0, 10);

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
              elementosPersonales: data.controlAccesorios.elementosPersonales,
              elementosPersonalesObs: data.controlAccesorios.elementosPersonalesObs,
              antena: data.controlAccesorios.antena,
              antenaObs: data.controlAccesorios.antenaObs
            });

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
            this.fotosElementosPersonales = data.controlAccesorios.fotosElementosPersonales || [];
            this.fotosAntena = data.controlAccesorios.fotosAntena || [];
            this.registroActividad = (data.controlAccesorios.registroActividad || []).reverse();

            this.saveCurrentState();
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

  async actualizarInventario(updatedInventoryData?: any) {
    const currentData = this.controlAccesoriosForm.value;

    const dataToUpdate = {
      controlAccesorios: {
        gato: currentData.gato,
        gatoObs: currentData.gatoObs,
        fotosGato: this.fotosGato,
        llavePernos: currentData.llavePernos,
        llavePernosObs: currentData.llavePernosObs,
        fotosLlavePernos: this.fotosLlavePernos,
        copaSeguridad: currentData.copaSeguridad,
        copaSeguridadObs: currentData.copaSeguridadObs,
        fotosCopaSeguridad: this.fotosCopaSeguridad,
        tiroArrastre: currentData.tiroArrastre,
        tiroArrastreObs: currentData.tiroArrastreObs,
        fotosTiroArrastre: this.fotosTiroArrastre,
        historialMantenimiento: currentData.historialMantenimiento,
        historialMantenimientoObs: currentData.historialMantenimientoObs,
        fotosHistorialMantenimiento: this.fotosHistorialMantenimiento,
        manual: currentData.manual,
        manualObs: currentData.manualObs,
        fotosManual: this.fotosManual,
        palomera: currentData.palomera,
        palomeraObs: currentData.palomeraObs,
        fotosPalomera: this.fotosPalomera,
        tapetes: currentData.tapetes,
        tapetesObs: currentData.tapetesObs,
        fotosTapetes: this.fotosTapetes,
        ultimoKilometraje: currentData.ultimoKilometraje,
        lugarUltimoMantenimiento: currentData.lugarUltimoMantenimiento,
        fechaUltimoMantenimiento: currentData.fechaUltimoMantenimiento,
        llantaRepuesto: currentData.llantaRepuesto,
        llantaRepuestoObs: currentData.llantaRepuestoObs,
        kitCarretera: currentData.kitCarretera,
        kitCarreteraObs: currentData.kitCarreteraObs,
        elementosPersonales: currentData.elementosPersonales,  
        elementosPersonalesObs: currentData.elementosPersonalesObs,
        antena: currentData.antena,
        antenaObs: currentData.antenaObs,
        registroActividad: [
          ...(currentData.registroActividad || []),
          ...(updatedInventoryData?.controlAccesorios?.registroActividad || [])
        ]
      }
    };

    try {
      let response: any = await this.http.put(`${this.apiUrl}/api/updatepreinventories/${this.inventoryId}`, dataToUpdate).toPromise();
      this.registroActividad = (response.controlAccesorios.registroActividad || []).reverse();
      this.saveCurrentState();
    } catch (error: any) {
    }
  }

  limpiarFormularios() {
    this.btnEsconder = false;
    this.controlAccesoriosForm.reset();

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
    this.fotosElementosPersonales = [];
    this.fotosAntena = [];
    this.registroActividad = [];
    this.fotosKitCarretera = [];

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

  onElementosPersonalesSelected(event: any) {
    this.onFileChange('fotosElementosPersonales', event);
    const fotosElementosPersonales = Array.from(event.target.files) as File[];
    this.uploadElementosPersonalesPhotos(fotosElementosPersonales);
  }

  onAntenaSelected(event: any) {
    this.onFileChange('fotosAntena', event);
    const fotosAntena = Array.from(event.target.files) as File[];
    this.uploadAntenaPhotos(fotosAntena);
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

  async uploadElementosPersonalesPhotos(files: File[]) {
    await this.uploadPhotos(files, 'fotosElementosPersonales');
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
      const response: any = await this.http.put(`${this.apiUrl}/api/updatePreInventoryPhotos/${this.inventoryId}`, formData).toPromise();
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
    if (fieldName === 'fotosCopiaLlave') {
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
    } else if (fieldName === 'fotosElementosPersonales') {
      this.fotosElementosPersonales = response.controlAccesorios.fotosElementosPersonales;
    } else if (fieldName === 'fotosAntena') {
      this.fotosAntena = response.controlAccesorios.fotosAntena;
    }

    this.cdr.detectChanges();
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
    } else if (fieldName === 'fotosElementosPersonales') {
      fotoUrl = this.fotosElementosPersonales[index];
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
      await this.http.delete(`${this.apiUrl}/api/deletePreInventoryPhoto`, {
        body: { inventoryId: this.inventoryId, field: fieldName, photoUrl: fotoUrl }
      }).toPromise();

      if (fieldName === 'fotosCopiaLlave') {
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
      } else if (fieldName === 'fotosElementosPersonales') {
        this.fotosElementosPersonales.splice(index, 1);
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
    this.http.post(`${this.apiUrl}/api/preinventarios/addActivityLog/${inventoryId}`, newActivity)
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
      copiaLlave: 'Copia Llave',
      gato: 'Gato',
      llavePernos: 'Llave Pernos',
      copaSeguridad: 'Copa Seguridad',
      tiroArrastre: 'Tiro de Arrastre',
      historialMantenimiento: 'Historial de Mantenimiento',
      manual: 'Manual',
      palomera: 'Palomera',
      tapetes: 'Tapetes',
      ultimoKilometraje: 'Último Kilometraje',
      lugarUltimoMantenimiento: 'Lugar del Último Mantenimiento',
      fechaUltimoMantenimiento: 'Fecha del Último Mantenimiento',
      llantaRepuesto: 'Llanta de Repuesto',
      kitCarretera: 'Kit de Carretera',
      elementosPersonales: 'Elementos Personales',
      antena: 'Antena',
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
      fotosElementosPersonales: 'Elementos Personales',
      fotosAntena: 'Antena'
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
}
