import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2'
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  loggedIn: boolean = false;
  userData: string = "";
  user: any;
  datosUser: any;
  usuarioCargo: string = '';
  time: string = '';
  intervalId: any;
  cargo: string = "";
  navbarOpen = false;
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  ngOnInit() {
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

    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });
  }

  tieneRol(rolesNecesarios: string[]): boolean {
    const rolesUsuario = this.datosUser?.role || [];
    return rolesNecesarios.some(rolNecesario => rolesUsuario.includes(rolNecesario));
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
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

  updateTime(): void {
    const currentTime = new Date();
    this.time = currentTime.toLocaleTimeString();
  }

  onLogout() {
    Swal.fire({
      title: 'Cerrando Sesión!',
      timer: 1000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        this.authService.logoutUser();
      }
    }).then(() => {
      this.router.navigate(['/']);
    });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }
}
