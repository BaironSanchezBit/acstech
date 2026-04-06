import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-bd-usuarios',
  templateUrl: './bd-usuarios.component.html',
  styleUrls: ['./bd-usuarios.component.css']
})
export class BdUsuariosComponent implements OnInit, OnDestroy {
  loading = false;
  usuarios: any;
  userSeleccionado: any = {};
  userForm: FormGroup;
  lugares!: any[];
  roles: string[] = [];
  userId: string = "";
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder, private authService: AuthService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.userForm = this.formBuilder.group({
      email: ['', Validators.required],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      password: ['', Validators.required],
      cargo: ['', Validators.required],
      imagen: [null]
    });
  }

  ngOnInit(): void {
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

    this.http.get<any[]>(`${this.apiUrl}/api/ciudades`).subscribe(data => {
      this.lugares = data;
      this.organizarAlfabeticamente();
    });


    this.http.get<any[]>(`${this.apiUrl}/api/users`).subscribe(data => {
      this.usuarios = data;
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.userForm.patchValue({
      imagen: file
    });
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

  seleccionarUser(user: any) {
    this.userSeleccionado = { ...user };
    this.roles = user.roles ? [...user.roles] : [];
  }

  formatSalary(salary: number): string {
    if (isNaN(salary) || salary === null) {
      return '-';
    }
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(salary);
  }

  async crearUser() {
    if (this.userForm.valid) {
      const userData = {
        ...this.userForm.getRawValue(),
        roles: this.roles
      };

      const formData = new FormData();
      const inputElement = document.getElementById('inputGroupFile04') as HTMLInputElement;

      if (inputElement && inputElement.files && inputElement.files.length > 0) {
        formData.append('imagen', inputElement.files[0]);
      }

      formData.append('email', userData.email);
      formData.append('nombre', userData.nombre);
      formData.append('telefono', userData.telefono);
      formData.append('password', userData.password);
      formData.append('cargo', userData.cargo);

      userData.roles.forEach((role: string, index: number) => {
        formData.append(`roles[${index}]`, role);
      });

      // Obtén el token del servicio de autenticación
      const token = this.authService.getToken(); // Asegúrate de que este método exista

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      try {
        const response = await this.http.post(`${this.apiUrl}/api/app-admin/register`, formData, { headers }).toPromise();
        this.usuarios.push(response);
        await Swal.fire(
          'Creado',
          'El usuario ha sido creado.',
          'success'
        );
        location.reload();
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear el usuario',
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



  async actualizarUser() {
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
      const userData = {
        ...this.userSeleccionado,
        roles: this.roles,
      };

      const formData = new FormData();
      const inputFile = (document.getElementById('inputGroupFile05') as HTMLInputElement);
      if (inputFile.files && inputFile.files.length > 0) {
        formData.append('imagen', inputFile.files[0]);
      }
      userData.roles.forEach((role: string, index: number) => {
        formData.append(`roles[${index}]`, role);
      });

      Object.keys(userData).forEach(key => {
        if (key !== 'roles') {
          formData.append(key, userData[key]);
        }
      });

      // Obtén el token del servicio de autenticación
      const token = this.authService.getToken(); // Asegúrate de que este método exista

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      try {
        const response = await this.http.put(`${this.apiUrl}/api/updateuser/${this.userSeleccionado._id}`, formData, { headers }).toPromise();
        await Swal.fire(
          'Actualizado',
          'El usuario ha sido actualizado.',
          'success'
        );
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


  async eliminarUser(id: string) {
    const payload: any = {
      id: id,
      userId: this.userId,
    };
  
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
      const token = this.authService.getToken();
      console.log("Token:", token); // Verificar el token
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
  
      try {
        const response = await this.http.delete(`${this.apiUrl}/api/deleteuser`, { body: payload, headers }).toPromise();
        await Swal.fire(
          'Eliminado',
          'El usuario ha sido eliminado.',
          'success'
        );
        location.reload();
      } catch (error) {
        const errResponse = error as HttpErrorResponse; // Especificar el tipo de error
  
        if (errResponse.status === 401) {
          await Swal.fire({
            title: 'Error',
            text: 'No tienes permiso para eliminar este usuario. Asegúrate de estar autenticado.',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        } else {
          await Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al eliminar el usuario',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        }
      }
    }
  }
  

  agregarRol(rol: string) {
    if (rol && rol.trim() !== '' && !this.roles.includes(rol)) {
      this.roles.push(rol.trim());
    }
  }

  eliminarRol(rolAEliminar: string) {
    this.roles = this.roles.filter(rol => rol !== rolAEliminar);
  }

  agregarRol2(nuevoRol: string) {
    if (nuevoRol && !this.userSeleccionado.role.includes(nuevoRol)) {
      this.userSeleccionado.role.push(nuevoRol);
    }
  }

  eliminarRol2(index: number) {
    this.userSeleccionado.role.splice(index, 1);
  }

}
