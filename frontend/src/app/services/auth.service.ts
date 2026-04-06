import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private imageSource = new BehaviorSubject<string>('');
  currentImage = this.imageSource.asObservable();
  private tempToken: string | null = null;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) { }

  headers: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });

  changeImage(imageUrl: string) {
    this.imageSource.next(imageUrl);
  }

  getApiUrl() {
    return this.apiUrl;
  }

  createUser(userData: any): Observable<any> {
    const user = JSON.parse(this.cookieService.get('user') || '{}');
    const token = user.accessToken;

    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    const url_api = `${this.apiUrl}/api/app-admin/register`;

    return this.http.post<any>(url_api, userData, { headers: headers });
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/send-verification-code`, { email });
  }

  verifyVerificationCode(email: string, verificationCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/verify-verification-code`, { email, verificationCode });
  }

  loginUserUsuario(email: string, password: string): Observable<any> {
    const url_api = `${this.apiUrl}/api/adminLogin/login`;
    const loginData = { email, password };

    return this.http.post<any>(url_api, loginData, { headers: this.headers })
      .pipe(
        map(res => {
          return res;
        }),
        catchError(err => {
          console.error('Login error:', err);
          return throwError(err.message || 'Server error');
        })
      );
  }

  onGoogleLogin() {
    window.location.href = `${this.apiUrl}/api/auth/google`;
  }

  handleGoogleCallback(accessToken: string): void {
    this.setUser({ accessToken });
    this.router.navigate(['/sistema']);
  }

  enableTwoFactorAuth(userId: string): Observable<any> {
    const user = this.getUser();
    const token = user?.accessToken;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const url_api = `${this.apiUrl}/api/enable-2fa`;
    return this.http.post(url_api, { userId }, { headers })
      .pipe(
        tap(res => console.log('', res)),
        catchError(err => {
          console.error('Error enabling 2FA', err);
          return throwError(err);
        })
      );
  }

  verifyTwoFactorAuth(userId: string, token: string): Observable<any> {
    const url = `${this.apiUrl}/api/2fa/verify-2fa`;
    const body = { userId, token };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, body, { headers });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error.message || error);
  }

  setTempToken(token: string): void {
    this.tempToken = token;
  }

  getTempToken(): string | null {
    return this.tempToken;
  }


  isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
      const decodedToken: any = jwtDecode(token);
      if (decodedToken.exp === undefined) return true;

      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);
      const currentDate = new Date();
      return expirationDate <= currentDate;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  getRoleFromToken(): string | null {
    const user = this.getUser();
    if (!user || !user.accessToken) {
      return null;
    }
    const decodedToken = jwtDecode(user.accessToken) as any;
    return decodedToken.role;
  }

  isAdmin(): boolean {
    const role = this.getRoleFromToken();
    return role === 'Admin';
  }

  getUserDetails(): Observable<any> {
    const user = this.getUser();
    const decodedToken = jwtDecode(user.accessToken) as any;
    const userId = decodedToken.id;
    return this.getUserById(userId);
  }

  getUserByIdAdmin(id: string): Observable<any> {
    const url_api = `${this.apiUrl}/api/getuser/${id}`;
    return this.http.get(url_api);
  }

  getUserById(id: string): Observable<any> {
    const url_api = `${this.apiUrl}/api/user/${id}`;
    return this.http.get(url_api);
  }

  getUserAll(): Observable<any> {
    const url_api = `${this.apiUrl}/api/users`;
    return this.http.get(url_api);
  }

  setUser(user: any): void {
    this.cookieService.set('user', JSON.stringify(user), { path: '/', secure: false, sameSite: 'Lax' });
  }

  getUser(): any {
    const user = this.cookieService.get('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    const user = this.getUser();
    return user ? user.accessToken : null;
  }

  logoutUser(): void {
    this.http.post(`${this.apiUrl}/api/adminLogin/logout`, {}).subscribe(() => {
      this.cookieService.deleteAll('/');
      this.cookieService.deleteAll();
      this.router.navigate(['/']);
    });
  }

  isLoggedIn(): boolean {
    const user = this.getUser();
    return !!user && !!user.accessToken && !this.isTokenExpired(user.accessToken);
  }

  updateUser(id: string, userData: any): Observable<any> {
    if (!this.isLoggedIn()) {
      return throwError({ error: 'User is not authenticated' });
    }

    const url_api = `${this.apiUrl}/api/updateuser/${id}`;

    const user = JSON.parse(this.cookieService.get('user') || '{}');
    const token = user.accessToken;
    const headers = { 'Authorization': 'Bearer ' + token };

    return this.http.put(url_api, userData, { headers })
      .pipe(
        map((res) => res),
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  deleteUser(id: string): Observable<any> {
    const user = this.getUser();
    const token = user?.accessToken; // Usar getUser() para obtener el token
  
    const url_api = `${this.apiUrl}/api/deleteuser/${id}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.delete(url_api, { headers })
      .pipe(
        catchError((err) => {
          console.error('Error deleting user:', err);
          return throwError(err);
        })
      );
  }  

  resetPassword(token: string, newPassword: string): Observable<any> {
    const url_api = `${this.apiUrl}/api/reset-password`;
    return this.http.post(url_api, { token, newPassword }, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error al cambiar la contraseña:', error);
        throw error;
      })
    );
  }
}
