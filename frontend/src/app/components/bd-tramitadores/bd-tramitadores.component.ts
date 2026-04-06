import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-bd-tramitadores',
  templateUrl: './bd-tramitadores.component.html',
  styleUrls: ['./bd-tramitadores.component.css']
})
export class BdTramitadoresComponent implements OnInit, OnDestroy {
  datosUser: any;
  loggedIn: boolean = false;
  user: any;
  cargo: string = "";
  tramitadorSeleccionado: any = {};
  nuevoTramitador: FormGroup;
  tramitadores: any;
  tramitadoresOriginal: any;
  busqueda: string = '';
  lugares!: any[];
  departamentos!: any[];
  honorariosProveedorNumerico: number = 0;
  loading = false;
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder, private authService: AuthService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.nuevoTramitador = this.formBuilder.group({
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      proveedor: ['', Validators.required],
      responsable: ['', Validators.required],
      telefono: ['', Validators.required],
      correoElectronico: ['', Validators.required],
      direccion: ['', Validators.required],
      honorariosProveedor: ['', Validators.required],
      ciudadResidencia: ['', Validators.required],
      numeroCuenta: ['', Validators.required],
      entidad: ['', Validators.required],
      tipoCuenta: ['', Validators.required]
    });
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
    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      this.user = this.authService.getUser();
      this.authService.getUserDetails().subscribe(
        user => {
          this.datosUser = user;
          this.cargo = user.cargo;
        },
        error => {
          console.error('Error fetching user details:', error);
        }
      );
    }
    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/ciudades`).subscribe(data => {
      this.lugares = data;
      this.lugares.push({ name: 'Pendiente' });
      this.organizarAlfabeticamente();
    });
    this.http.get<any[]>(`${this.apiUrl}/api/departamentos`).subscribe(data => {
      this.departamentos = data;
      this.organizarAlfabeticamenteDe();
    });
    this.http.get<any[]>(`${this.apiUrl}/api/getTramitadores`).subscribe(data => {
      this.tramitadoresOriginal = [...data];
      this.tramitadores = [...data];
    });
  }

  tieneRol(rolesNecesarios: string[]): boolean {
    const rolesUsuario = this.datosUser?.role || [];
    return rolesNecesarios.some(rolNecesario => rolesUsuario.includes(rolNecesario));
  }

  filtrarBD() {
    const busquedaNormalizada = this.busqueda.trim().toLowerCase();

    this.tramitadores = this.tramitadoresOriginal.filter((tramitador: any) => {
      return (
        (tramitador.departamento?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.ciudad?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.proveedor?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.responsable?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.telefono?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.correoElectronico?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.direccion?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.ciudadResidencia?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.numeroCuenta?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.entidad?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (tramitador.tipoCuenta?.toLowerCase() || '').includes(busquedaNormalizada)
      );
    });
  }

  seleccionarTramitador(tramitador: any): void {
    this.tramitadorSeleccionado = { ...tramitador };
    this.honorariosProveedorNumerico = this.parseCurrency(tramitador.honorariosProveedor);
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  formatSalary(salary: number): string {
    if (isNaN(salary) || salary === null) {
      return '-';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
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

  organizarAlfabeticamenteDe() {
    this.departamentos.sort((a, b) => {
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

  async crearTramitador() {
    if (this.nuevoTramitador.valid) {
      try {
        const response = await this.http.post(`${this.apiUrl}/api/postTramitadores`, this.nuevoTramitador.value).toPromise();
        this.tramitadores.push(response);
        await Swal.fire(
          '¡Éxito!',
          'Tramitador creado correctamente.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear el tramitador',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    } else {
      await Swal.fire({
        title: 'Error',
        text: 'Verifica los campos',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });
    }
  }

  async actualizarTramitador() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Confirmas la actualización de este usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {

        const tramitadorData = {
          ...this.tramitadorSeleccionado,
          honorariosProveedor: this.honorariosProveedorNumerico
        }

        const response = await this.http.put(`${this.apiUrl}/api/updateTramitadores/${this.tramitadorSeleccionado._id}`, tramitadorData).toPromise();
        await Swal.fire(
          '¡Éxito!',
          'Tramitador actualizado correctamente.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el tramitador',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
  }

  async eliminarTramitador(id: string) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await this.http.delete(`${this.apiUrl}/api/deleteTramitadores/${id}`).toPromise();
        await Swal.fire(
          'Eliminado',
          'El tramitador ha sido eliminado.',
          'success'
        );
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar el tramitador',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
  }

  get honorariosProveedorFormateado(): string {
    return this.formatCurrency(this.honorariosProveedorNumerico);
  }

  onCurrencyInput(controlName: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue)) {
      const formattedValue = this.formatCurrency(numericValue);
      this.nuevoTramitador.controls[controlName].setValue(formattedValue, { emitEvent: false });
    } else {
      this.nuevoTramitador.controls[controlName].setValue('', { emitEvent: false });
    }
  }

  onCurrencyInput2(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    this.honorariosProveedorNumerico = parseInt(value, 10) || 0;
  }

  parseCurrency(value: string): number {
    return parseInt(value.replace(/[$,.]/g, ''), 10) || 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatearValoresParaEdicion(): void {
    this.tramitadorSeleccionado.honorariosProveedor = this.formatCurrency(this.tramitadorSeleccionado.honorariosProveedor);
  }
}
