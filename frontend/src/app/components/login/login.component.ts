import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavigationStart, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  passwordFieldType: string = 'password';
  rememberMe: boolean = false;
  private routerSubscription: Subscription;
  showTwoFactorAuth: boolean = false;
  showTwoFactorEmail: boolean = false;
  showTwoFactorSetup: boolean = false;
  showTwoFactorMethodSelection: boolean = false;
  twoFactorAuthForm: FormGroup;
  emailVerificationForm: FormGroup;
  userId: string = '';
  qrCodeUrl: string | null = null;
  isFormLoading: boolean = false;
  noMostrar: boolean = false;
  isLoading: boolean = false;
  isSuccess: boolean = false;
  isError: boolean = false;
  selectedTwoFactorMethod: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.twoFactorAuthForm = this.formBuilder.group({
      code1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code6: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    });

    this.emailVerificationForm = this.formBuilder.group({
      code1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      code6: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    });
  }

  get controls() {
    return Object.keys(this.twoFactorAuthForm.controls);
  }

  get controlsEmail() {
    return Object.keys(this.emailVerificationForm.controls);
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/sistema']);
    } else {
      this.route.queryParams.subscribe(params => {
        if (params['accessToken']) {
          this.authService.handleGoogleCallback(params['accessToken']);
        }
      });
    }
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

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isFormLoading = true;
      this.noMostrar = true;
      this.isError = false;
      const { email, password } = this.loginForm.value;

      Swal.fire({
        title: 'Iniciando sesión...',
        text: 'Por favor, espera.',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      setTimeout(() => {
        this.authService.loginUserUsuario(email, password).subscribe(
          res => {
            this.isFormLoading = false;
            Swal.close(); // Cierra el SweetAlert cuando se recibe la respuesta
            if (res.success) {
              this.completeLogin(res.accessToken);
            } else {
              this.isError = true;
              Swal.fire({
                title: 'Error',
                text: 'Credenciales incorrectas. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          },
          err => {
            this.isFormLoading = false;
            this.isError = true;
            Swal.close(); // Cierra el SweetAlert en caso de error
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error durante el inicio de sesión. Inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
            console.error('Login error:', err);
          }
        );
      }, 2000);
    } else {
      this.isError = true;
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  onGoogleLogin() {
    this.authService.onGoogleLogin();
  }

  enableTwoFactorAuth(userId: string) {
    this.authService.enableTwoFactorAuth(userId).subscribe(
      res => {
        this.qrCodeUrl = res.qrCodeUrl;
        this.showTwoFactorAuth = true;
        this.selectedTwoFactorMethod = 'googleAuthenticator';
        this.userId = res.userId;
      },
      err => {
        console.error('Error enabling 2FA:', err);
      }
    );
  }

  selectTwoFactorMethod(method: string) {
    this.selectedTwoFactorMethod = method;
    this.isFormLoading = true;
    this.showTwoFactorMethodSelection = false;
    this.showTwoFactorSetup = false;

    setTimeout(() => {
      if (method === 'email') {
        this.sendEmailVerificationCode();
      } else if (method === 'googleAuthenticator') {
        this.showTwoFactorAuth = true;
      }
      this.isFormLoading = false;
    }, 2000);
  }

  sendEmailVerificationCode() {
    this.showTwoFactorMethodSelection = false;
    this.showTwoFactorAuth = false;
    this.showTwoFactorSetup = false;

    this.authService.sendVerificationCode(this.loginForm.value.email).subscribe(
      res => {
        this.showTwoFactorEmail = true;
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.isError = true;
      }
    );
  }

  onInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length === 1 && index < this.controls.length - 1) {
      const nextInput = document.querySelectorAll<HTMLInputElement>('.input-code')[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    } else if (value.length === 0 && index > 0) {
      const prevInput = document.querySelectorAll<HTMLInputElement>('.input-code')[index - 1];
      if (prevInput && !this.twoFactorAuthForm.get(this.controls[index - 1])?.value) {
        prevInput.focus();
      }
    }

    if (this.controls.every(ctrl => this.twoFactorAuthForm.get(ctrl)?.value.length === 1)) {
      this.onVerifyTwoFactorAuth();
    }
  }

  onKeydown(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = document.querySelectorAll<HTMLInputElement>('.input-code')[index - 1];
      if (prevInput) {
        prevInput.focus();
        prevInput.value = '';  // Clear the previous input value
        this.twoFactorAuthForm.get(this.controls[index - 1])?.setValue('');
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    if (pasteData.length === this.controls.length) {
      pasteData.split('').forEach((char, index) => {
        const input = document.querySelectorAll<HTMLInputElement>('.input-code')[index];
        if (input) {
          input.value = char;
          this.twoFactorAuthForm.get(this.controls[index])?.setValue(char);
        }
      });
      const lastInput = document.querySelectorAll<HTMLInputElement>('.input-code')[this.controls.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
      if (this.controls.every(ctrl => this.twoFactorAuthForm.get(ctrl)?.value.length === 1)) {
        this.onVerifyTwoFactorAuth();
      }
    }
  }

  onInputEmail(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length === 1 && index < this.controlsEmail.length - 1) {
      const nextInput = document.querySelectorAll<HTMLInputElement>('.input-code')[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    } else if (value.length === 0 && index > 0) {
      const prevInput = document.querySelectorAll<HTMLInputElement>('.input-code')[index - 1];
      if (prevInput && !this.emailVerificationForm.get(this.controlsEmail[index - 1])?.value) {
        prevInput.focus();
      }
    }

    if (this.controlsEmail.every(ctrl => this.emailVerificationForm.get(ctrl)?.value.length === 1)) {
      this.verifyEmailCode();
    }
  }

  onKeydownEmail(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = document.querySelectorAll<HTMLInputElement>('.input-code')[index - 1];
      if (prevInput) {
        prevInput.focus();
        prevInput.value = '';
        this.emailVerificationForm.get(this.controlsEmail[index - 1])?.setValue('');
      }
    }
  }

  onPasteEmail(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    if (pasteData.length === this.controlsEmail.length) {
      pasteData.split('').forEach((char, index) => {
        const input = document.querySelectorAll<HTMLInputElement>('.input-code')[index];
        if (input) {
          input.value = char;
          this.emailVerificationForm.get(this.controlsEmail[index])?.setValue(char);
        }
      });
      const lastInput = document.querySelectorAll<HTMLInputElement>('.input-code')[this.controlsEmail.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
      if (this.controlsEmail.every(ctrl => this.emailVerificationForm.get(ctrl)?.value.length === 1)) {
        this.verifyEmailCode();
      }
    }
  }

  onVerifyTwoFactorAuth() {
    if (this.twoFactorAuthForm.valid) {
      this.isLoading = true;
      setTimeout(() => {
        this.isError = false;
        const verificationCode = this.controls.map(ctrl => this.twoFactorAuthForm.get(ctrl)?.value).join('');
        this.authService.verifyTwoFactorAuth(this.userId, verificationCode).subscribe(
          res => {
            this.isLoading = false;
            if (res.success) {
              this.completeLogin(res.accessToken);
            } else {
              this.isError = true;
            }
          },
          err => {
            this.isLoading = false;
            this.isError = true;
            console.error('Verification error:', err);
          }
        );
      }, 2000);
    }
  }

  verifyEmailCode() {
    if (this.emailVerificationForm.valid) {
      this.isLoading = true;
      setTimeout(() => {
        this.isError = false;
        const emailCode = this.controlsEmail.map(ctrl => this.emailVerificationForm.get(ctrl)?.value).join('');
        this.authService.verifyVerificationCode(this.loginForm.value.email, emailCode).subscribe(
          res => {
            this.isLoading = false;
            if (res.success) {
              this.completeLogin(res.accessToken);
            } else {
              this.isError = true;
            }
          },
          err => {
            this.isLoading = false;
            this.isError = true;
            console.error('Verification error:', err);
          }
        );
      }, 2000);
    }
  }

  completeLogin(accessToken: string) {
    this.isSuccess = true;
    setTimeout(() => {
      this.authService.setUser({ accessToken });
      this.router.navigate(['/sistema']);
    }, 1000);
  }
}