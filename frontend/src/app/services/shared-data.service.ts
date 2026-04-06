import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private currentInventoryIdSource = new BehaviorSubject<string | null>(null);
  currentInventoryId = this.currentInventoryIdSource.asObservable();

  constructor() {}

  changeInventoryId(id: string | null): void {
    this.currentInventoryIdSource.next(id);
  }

  clearCurrentInventoryId(): void {
    this.currentInventoryIdSource.next(null);
  }
}
