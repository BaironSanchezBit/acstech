import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) { }

  getEvents(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/calendar/events?userId=${userId}`);
  }
}