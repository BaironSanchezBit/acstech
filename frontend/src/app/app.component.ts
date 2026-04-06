import { Component, OnInit } from '@angular/core';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent /*implements OnInit*/ {
  title = 'ACS';

  constructor(private notificationService: NotificationService) { }

  /*
  ngOnInit() {
    this.requestNotificationPermission();
    this.sendTestNotification();
  }

  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.sendTestNotification();
        } else {
        }
      });
    } else {
    }
  }

  sendTestNotification() {
    const testNotification = {
      titulo: 'Test Notification',
      mensaje: 'This is a test notification',
      hora: new Date().toLocaleTimeString(),
      vehiculoId: 'TestVehicleID'
    };
    this.notificationService.addNotification(testNotification);
  }
    */
}