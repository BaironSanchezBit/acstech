import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '../environments/environment';

interface ClientItem {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  tipoIdentificacion: string;
  numeroIdentificacion: number;
  digitoVerificacion: string,
  ciudadIdentificacion: string;
  direccionResidencia: string;
  ciudadResidencia: string;
  celularOne: String;
  celularTwo: string;
  correoElectronico: string;
  fechaIngreso: Date;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private apiUrl = environment.apiUrl;
  private allClients: Observable<any[]> | null = null;

  constructor(private http: HttpClient) { }

  getClientById(client: string): Observable<ClientItem> {
    return this.http.get<ClientItem>(`${this.apiUrl}/api/getClientsById/client/${client}`);
  }

  getClientByName(client: string): Observable<ClientItem> {
    return this.http.get<ClientItem>(`${this.apiUrl}/api/getClientsByName/client/${client}`);
  }

  createClients(client: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/postClients`, client);
  }

  getAllClients(): Observable<ClientItem[]> {
    return this.http.get<ClientItem[]>(`${this.apiUrl}/api/getClients`);
  }

  getAllNumerosIdent(): Observable<any[]> {
    if (!this.allClients) {
      this.allClients = this.http.get<any[]>(`${this.apiUrl}/api/getAllNumerosIdent`).pipe(
        tap(() => console.log()),
        shareReplay(1)
      );
    }
    return this.allClients;
  }

  getClient(id: string) {
    return this.http.get(`${this.apiUrl}/api/getClients/${id}`);
  }

  updateClients(id: string, client: any) {
    return this.http.put(`${this.apiUrl}/api/updateClients/${id}`, client);
  }
}
