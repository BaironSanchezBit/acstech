import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { startWith, map, throttleTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { ChangeDetectorRef } from '@angular/core';
import { VehiclesService } from 'src/app/services/vehicles.service';

declare var bootstrap: any;

interface Notificacion {
  titulo: string;
  mensaje: string;
  hora: string;
  vehiculoId: string;
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  private routerSubscription: Subscription;
  objectKeys = Object.keys;
  notificacionesPorVehiculo: Record<string, any[]> = {};
  busquedaPlaca: string = '';
  placaValue: BehaviorSubject<string> = new BehaviorSubject('');

  allVehicles: any[] = [];
  opcionesFiltradasVeh: Observable<any[]> = of([]);

  constructor(private cdr: ChangeDetectorRef, private router: Router, private vehiclesService: VehiclesService,
    private webSocketService: WebSocketService, public notificationService: NotificationService) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onMayuscula(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  onPlacaInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();

    if (value === '') {
      this.placaValue.next(value);
    } else if (value.match(/^[A-Z]{1,3}$/)) {
      this.placaValue.next(value);
    } else if (value.match(/^[A-Z]{3}[0-9]{0,3}$/)) {
      this.placaValue.next(value);
    }

    // Actualizar el valor del input
    input.value = this.placaValue.getValue();
  }

  private removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  crearIdValido(vehiculoId: string): string {
    return vehiculoId.replace(/[^a-zA-Z0-9]/g, '_');
  }

  ngOnInit(): void {
    this.vehiclesService.getAllPlaca().subscribe(vehicles => {
      this.allVehicles = vehicles;
      this.configureFilteringVeh();
    });

    this.notificationService.getNotificationsObservable().subscribe((notificaciones) => {
      this.notificaciones = notificaciones;
      this.notificacionesPorVehiculo = this.agruparNotificacionesPorVehiculo(notificaciones);
      this.cdr.detectChanges();
    });

    this.webSocketService.listenForExpirations()
      .pipe(throttleTime(1000))
      .subscribe((data: any) => {
        this.showNotification(data.message);
      });

    this.webSocketService.listenForObservations();
  }

  displayFnVeh(vehiculo: string): string {
    return vehiculo || '';
  }

  configureFilteringVeh() {
    this.opcionesFiltradasVeh = this.placaValue.pipe(
      startWith(''),
      map(value => this._filterVeh(value))
    );
  }

  private _filterVeh(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allVehicles.filter(option => option.toLowerCase().includes(filterValue));
  }

  get notificacionesFiltradas(): Record<string, any[]> {
    if (!this.busquedaPlaca) {
      return this.notificacionesPorVehiculo;
    }

    return Object.keys(this.notificacionesPorVehiculo).reduce((acc, vehiculoId) => {
      if (vehiculoId.toLowerCase().includes(this.busquedaPlaca.toLowerCase())) {
        acc[vehiculoId] = this.notificacionesPorVehiculo[vehiculoId];
      }
      return acc;
    }, {} as Record<string, any[]>);
  }

  agruparNotificacionesPorVehiculo(notificaciones: any[]): Record<string, any[]> {
    const agrupadas = notificaciones.reduce((acc, notificacion) => {
      const { vehiculoId } = notificacion;
      if (!acc[vehiculoId]) {
        acc[vehiculoId] = [];
      }
      acc[vehiculoId].push(notificacion);
      return acc;
    }, {} as Record<string, any[]>);

    return agrupadas;
  }

  showNotification(message: string): void {
    const toastElement = document.getElementById('liveToast');
    const toastContent = document.getElementById('toast-content');
    if (toastElement && toastContent) {
      toastContent.textContent = message;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }
}
