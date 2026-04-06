import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  private apiUrl = environment.apiUrl;

  constructor(private notificationService: NotificationService) {
    this.socket = io(`${this.apiUrl}`, {
      transports: ['websocket']
    });
    this.checkSoatOnLogin();
    this.checkObseOnLogin();
    this.listenForTallerNotice();
    this.listenForExpiration();
    this.listenForObservations();
    this.listenForContractExpiration();
    this.listenForProvNotice();

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión con el servidor de Socket.IO:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Error en la conexión con el servidor de Socket.IO:', error);
    });
  }

  checkSoatOnLogin() {
    this.socket.emit('checkSoatOnLogin');
  }

  checkObseOnLogin() {
    this.socket.emit('checkObsOnLogin');
  }

  listenForExpiration() {
    this.socket.off('expirationNotice').on('expirationNotice', (data) => {
      const notificacion = {
        titulo: data.title,
        mensaje: data.message,
        hora: new Date().toLocaleTimeString(),
        vehiculoId: data.vehiculoId
      };
      this.notificationService.addNotification(notificacion);
    });
  }


  listenForTallerNotice() {
    this.socket.off('tallerNotice').on('tallerNotice', (data) => {
      const notificacion = {
        titulo: data.title,
        mensaje: data.message,
        hora: new Date().toLocaleTimeString(),
        vehiculoId: data.vehiculoId
      };
      this.notificationService.addNotification(notificacion);
    });
  }

  listenForObservations() {
    this.socket.off('observationNotice').on('observationNotice', (data) => {
      const notification = {
        titulo: data.title,
        mensaje: data.message,
        hora: new Date().toLocaleTimeString(),
        vehiculoId: data.vehiculoId
      };
      this.notificationService.addNotification(notification);
    });
  }

  listenForProvNotice() {
    this.socket.off('provNotice').on('provNotice', (data) => {
      const notificacion = {
        titulo: data.title,
        mensaje: data.message,
        hora: new Date().toLocaleTimeString(),
        vehiculoId: data.vehiculoId
      };
      this.notificationService.addNotification(notificacion);
    });
  }

  listenForExpirations(): Observable<any> {
    return new Observable(subscriber => {
      this.socket.on('expirationNotice', (data) => {
        subscriber.next(data);
      });
    });
  }

  listenForContractExpiration() {
    this.socket.off('contractExpirationNotice').on('contractExpirationNotice', (data) => {

      const notificacion = {
        titulo: data.title,
        mensaje: data.message,
        hora: new Date().toLocaleTimeString(),
        vehiculoId: data.vehiculoId
      };

      this.notificationService.addNotification(notificacion);
    });
  }
}
