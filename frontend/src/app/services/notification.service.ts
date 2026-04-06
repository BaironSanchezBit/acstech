import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: any[] = [];
  private notificationsSubject = new BehaviorSubject<any[]>([]);

  constructor() { }

  addNotification(notification: any) {
    this.notifications.push(notification);
    this.notificationsSubject.next(this.notifications);
    this.showBrowserNotification(notification);
  }

  getNotificationsObservable() {
    return this.notificationsSubject.asObservable();
  }

  clearNotifications() {
    this.notifications = [];
    this.notificationsSubject.next(this.notifications);
  }

  private showBrowserNotification(notification: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.titulo, {
          body: notification.mensaje,
          icon: 'https://via.placeholder.com/48' // Prueba con un ícono de placeholder en línea
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    } else {
    }
  }
  

}
