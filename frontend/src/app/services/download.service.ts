import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  downloadWordDocument() {
    return this.http.get(`${this.apiUrl}/api/download-word-document`, { responseType: 'blob' });
  }
}
