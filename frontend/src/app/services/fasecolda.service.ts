import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FasecoldaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getModelos() {
    return this.http.get<string[]>(`${this.apiUrl}/api/fasecolda/modelos`);
  }

  getMarcasByModelo(modelo: string) {
    return this.http.get<string[]>(`${this.apiUrl}/api/fasecolda/marcas/${modelo}`);
  }

  getReferenciasByModeloAndMarca(modelo: string, marca: string) {
    return this.http.get<string[]>(`${this.apiUrl}/api/fasecolda/referencias/${modelo}/${marca}`);
  }

  getDetallesByModeloMarcaReferencia(modelo: string, marca: string, referencia: string) {
    return this.http.get<any[]>(`${this.apiUrl}/api/fasecolda/detalles/${modelo}/${marca}/${encodeURIComponent(referencia)}`);
  }
}
