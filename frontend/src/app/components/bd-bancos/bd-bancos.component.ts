import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-bd-bancos',
  templateUrl: './bd-bancos.component.html',
  styleUrls: ['./bd-bancos.component.css']
})
export class BdBancosComponent implements OnInit, OnDestroy {
  loading = false;
  bancos: any;
  bancoSeleccionado: any = {};
  bancosForm: FormGroup;
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.bancosForm = this.formBuilder.group({
      nombreBanco: ['', Validators.required],
      nombreAsesorBancario: ['', Validators.required],
      telefonoAsesorBancario: ['', Validators.required],
      correoAsesorBancario: ['', Validators.required]
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

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getBancos`).subscribe(data => {
      this.bancos = data;
    });
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  seleccionarBanco(bancos: any) {
    this.bancoSeleccionado = { ...bancos };
  }

  async crearBanco() {
    if (this.bancosForm.valid) {
      try {
        const response = await this.http.post(`${this.apiUrl}/api/postBancos`, this.bancosForm.value).toPromise();
        this.bancos.push(response);
        await Swal.fire(
          '¡Éxito!',
          'Banco creado correctamente.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear el banco',
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

  async actualizarBanco() {
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
        const response = await this.http.put(`${this.apiUrl}/api/updateBancos/${this.bancoSeleccionado._id}`, this.bancoSeleccionado.value).toPromise();
        await Swal.fire(
          '¡Éxito!',
          'Banco actualizado correctamente.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el Banco',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
  }

  async eliminarBanco(id: string) {
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
        const response = await this.http.delete(`${this.apiUrl}/api/deleteBancos/${id}`).toPromise();
        await Swal.fire(
          'Eliminado',
          'El banco ha sido eliminado.',
          'success'
        );
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar el banco',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
  }
}
