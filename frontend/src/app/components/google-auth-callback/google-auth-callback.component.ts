import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-google-auth-callback',
  template: '<p>Procesando autenticación de Google...</p>',
  styles: []
})
export class GoogleAuthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['accessToken'];
      if (accessToken) {
        this.authService.handleGoogleCallback(accessToken);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}
