import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-bd-contrasenas',
  templateUrl: './bd-contrasenas.component.html',
  styleUrl: './bd-contrasenas.component.css'
})
export class BdContrasenasComponent implements OnInit, OnDestroy  {
  loading = false;
  cargar = false;
  datos: any;
  datosSeleccionado: any = {};
  datosForm: FormGroup;
  userId: string = "";
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder, private authService: AuthService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.datosForm = this.formBuilder.group({
      website: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
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
    this.solicitarContrasena();
  }

  async solicitarContrasena() {
    const { value: password } = await Swal.fire({
      title: 'Ingresa tu contraseña',
      input: 'password',
      inputPlaceholder: 'Introduce la contraseña',
      inputAttributes: {
        maxlength: '10',
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      confirmButtonText: 'Ingresar',
      allowOutsideClick: false,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value === '1234') {
            resolve();
            this.cargar = true;
          } else {
            resolve('Contraseña incorrecta');
          }
        })
      }
    });

    if (password) {
      this.cargarDatosComponente();
    } else {
    }
  }

  cargarDatosComponente() {
    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.authService.getUserDetails().subscribe(
      user => {
        this.userId = user._id;
      },
      error => {
      }
    );

    this.http.get<any[]>(`${this.apiUrl}/api/getWebsite`).subscribe(data => {
      this.datos = data;
    });
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  seleccionarDato(dato: any) {
    this.datosSeleccionado = { ...dato };
  }

  async crearDato() {
    if (this.datosForm.valid) {
      const datoData = {
        ...this.datosForm.value
      };

      try {
        const response = await this.http.post(`${this.apiUrl}/api/postWebsite`, datoData).toPromise();
        this.datos.push(response);
        await Swal.fire(
          'Creado',
          'El dato ha sido creado.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear el dato',
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

  async actualizarDato() {

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Confirmas la actualización de este dato?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const userData = {
        ...this.datosSeleccionado
      };

      try {
        const response = await this.http.put(`${this.apiUrl}/api/updateWebsite/${this.datosSeleccionado._id}`, userData).toPromise();
        await Swal.fire(
          'Actualizado',
          'El dato ha sido actualizado..',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el dato',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
  }

  async eliminarDato(id: string) {
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
        const response = await this.http.delete(`${this.apiUrl}/api/deleteWebsite/${id}`).toPromise();
        await Swal.fire(
          'Eliminado',
          'El dato ha sido eliminado.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar el dato',
          icon: 'error',
          confirmButtonText: 'Ok'
        }).then((result) => {
        });
      }
    }
  }
}
