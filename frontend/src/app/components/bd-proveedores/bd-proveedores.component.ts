import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-bd-proveedores',
  templateUrl: './bd-proveedores.component.html',
  styleUrls: ['./bd-proveedores.component.css']
})
export class BdProveedoresComponent implements OnInit, OnDestroy {
  loading = false;
  proveedores: any;
  proveedoresOriginal: any;
  busqueda: string = '';
  proveedoresSeleccionada: any = {};
  proveedoresForm: FormGroup;
  lugares!: any[];
  ocultar = false;
  ocultar2 = false;
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.proveedoresForm = this.formBuilder.group({
      tercero: ['', Validators.required],
      nombreComercial: [''],
      servicio: [''],
      direccion: [''],
      telefono: [''],
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

  onMayuscula(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  ngOnInit(): void {
    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getSuppliers`).subscribe(data => {
      this.proveedoresOriginal = [...data];
      this.proveedores = data.sort((a: any, b: any) => a.tercero.localeCompare(b.tercero));
    });
  }

  filtrarBD() {
    const busquedaNormalizada = this.busqueda.trim().toLowerCase();

    this.proveedores = this.proveedoresOriginal.filter((proveedor: any) => {
      return (
        (proveedor.tercero?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (proveedor.nombreComercial?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (proveedor.servicio?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (proveedor.direccion?.toLowerCase() || '').includes(busquedaNormalizada) ||
        (proveedor.telefono?.toLowerCase() || '').includes(busquedaNormalizada)
      );
    });
  }

  seleccionarProveedor(proveedor: any) {
    this.proveedoresSeleccionada = { ...proveedor };
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  async crearProveedor() {
    if (this.proveedoresForm.valid) {
      try {
        const response = await this.http.post(`${this.apiUrl}/api/postSuppliers`, this.proveedoresForm.value).toPromise();
        this.proveedores.push(response);
        await Swal.fire(
          '¡Éxito!',
          'Proveedor creado correctamente.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear el proveedor',
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

  async actualizarProveedor() {
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
        const response = await this.http.put(`${this.apiUrl}/api/updateSuppliers/${this.proveedoresSeleccionada._id}`, this.proveedoresSeleccionada).toPromise();
        await Swal.fire(
          '¡Éxito!',
          'Proveedor actualizado correctamente.',
          'success'
        )
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el usuario',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
  }

  async eliminarProveedor(id: string) {
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
        const response = await this.http.delete(`${this.apiUrl}/api/deleteSuppliers/${id}`).toPromise();
        await Swal.fire(
          'Eliminado',
          'El proveedor ha sido eliminado.',
          'success'
        );
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar el proveedor',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      }
    }
  }
}
