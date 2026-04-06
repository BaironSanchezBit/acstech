import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-control-bd',
  templateUrl: './control-bd.component.html',
  styleUrls: ['./control-bd.component.css']
})
export class ControlBdComponent implements OnInit, OnDestroy {
  loading = false;
  private routerSubscription: Subscription;
  datosUser: any;

  constructor(private router: Router, private authService: AuthService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  tieneRol(rolesNecesarios: string[]): boolean {
    const rolesUsuario = this.datosUser?.role || [];
    return rolesNecesarios.some(rolNecesario => rolesUsuario.includes(rolNecesario));
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

  ngOnInit(): void {
    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.authService.getUserDetails().subscribe(
      user => {
        this.datosUser = user;
      },
      error => {
      }
    );
  }
}
