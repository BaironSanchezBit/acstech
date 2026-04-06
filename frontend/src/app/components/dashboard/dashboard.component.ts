import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationStart, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importa tu AuthService

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  private routerSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService // Inyecta tu AuthService
  ) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });
  }

  ngOnInit(): void {
    this.loading = true;

    // Verificar si hay un token en los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.setUser({ accessToken: token });
        this.router.navigate(['/sistema']);
      }
    });

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
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

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }
}