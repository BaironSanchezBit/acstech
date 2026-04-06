import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../environments/environment';

interface VehicleItem {
  imagenVehiculo: string;
  observaciones: string;
  numeroMotor: string;
  placa: string;
  marca: string;
  linea: string;
  version: string;
  modelo: string;
  cilindraje: number;
  color: string;
  noDocumentoImportacion: string;
  fechaImportacion: string;
  servicio: string;
  clase: string;
  carroceria: String;
  combustible: string;
  pasajeros: string;
  ciudadPlaca: string;
  vin: string;
  serie: string;
  chasis: string;
  fechaMatricula: Date;
  fechaExpedicion: Date;
  fechaIngreso: Date;

}

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {

  private apiUrl = environment.apiUrl;
  private allVehicles: Observable<any[]> | null = null;

  constructor(private http: HttpClient) { }

  getVehicleByPlaca(placa: string): Observable<VehicleItem> {
    return this.http.get<VehicleItem>(`${this.apiUrl}/api/getVehicles/placa/${placa}`);
  }

  createVehicles(vehicle: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/postVehicles`, vehicle);
  }

  getAllVehicles(): Observable<VehicleItem[]> {
    return this.http.get<VehicleItem[]>(`${this.apiUrl}/api/getVehicles`);
  }

  getVehicles(id: string) {
    return this.http.get(`${this.apiUrl}/api/getVehicles/${id}`);
  }

  getAllPlaca(): Observable<any[]> {
    if (!this.allVehicles) {
      this.allVehicles = this.http.get<any[]>(`${this.apiUrl}/api/getAllPlaca`).pipe(
        tap(() => console.log()),
        shareReplay(1)
      );
    }
    return this.allVehicles;
  }

  updateVehicles(id: string, vehicle: any) {
    return this.http.put(`${this.apiUrl}/api/updateVehicles/${id}`, vehicle);
  }

}
