import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { DatePipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { FullCalendarModule } from '@fullcalendar/angular';
import { NgSelectModule } from '@ng-select/ng-select'; // Importar ng-select


import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegistroComponent } from './components/registro/registro.component';
import { AdquisicionComponent } from './components/adquisicion/adquisicion.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ControlBdComponent } from './components/control-bd/control-bd.component';
import { BdCostosTramitesComponent } from './components/bd-costos-tramites/bd-costos-tramites.component';
import { BdTramitadoresComponent } from './components/bd-tramitadores/bd-tramitadores.component';
import { BdUsuariosComponent } from './components/bd-usuarios/bd-usuarios.component';
import { BdProveedoresComponent } from './components/bd-proveedores/bd-proveedores.component';
import { BdComisionesComponent } from './components/bd-comisiones/bd-comisiones.component';
import { CreditoComponent } from './components/credito/credito.component';
import { BdBancosComponent } from './components/bd-bancos/bd-bancos.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TramitesComponent } from './components/tramites/tramites.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { BdContrasenasComponent } from './components/bd-contrasenas/bd-contrasenas.component';
import { CuadroGerencialComponent } from './components/cuadro-gerencial/cuadro-gerencial.component';
import { MantenimientoComponent } from './components/mantenimiento/mantenimiento.component';
import { ContabilidadComponent } from './components/contabilidad/contabilidad.component';
import { BdVariablesComponent } from './components/bd-variables/bd-variables.component';
import { AlistamientoComponent } from './components/alistamiento/alistamiento.component';
import { OrdenTrabajoComponent } from './components/orden-trabajo/orden-trabajo.component';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { KanbanComponent } from './components/kanban/kanban.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ContaCuentasPagarComponent } from './components/conta-cuentas-pagar/conta-cuentas-pagar.component';
import { ContaCuentasPagarFijaComponent } from './components/conta-cuentas-pagar-fija/conta-cuentas-pagar-fija.component';
import { CuentasPagarAprobacionComponent } from './components/cuentas-pagar-aprobacion/cuentas-pagar-aprobacion.component';
import { HistoricoFijasComponent } from './components/historico-fijas/historico-fijas.component';
import { HistoricoVariablesComponent } from './components/historico-variables/historico-variables.component';
import { GraficaMarcasComponent } from './components/grafica-marcas/grafica-marcas.component';
import { PreInventariosComponent } from './components/pre-inventarios/pre-inventarios.component';
import { GoogleAuthCallbackComponent } from './components/google-auth-callback/google-auth-callback.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ManualComponent } from './components/manual/manual.component';
import { DocumentacionComponent } from './components/documentacion/documentacion.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PruebaComponent } from './components/prueba/prueba.component';

import { PanelGerenciaComponent } from './components/panel-gerencia/panel-gerencia.component';
import { ImagenesIngresoComponent } from './components/imagenes-ingreso/imagenes-ingreso.component';
registerLocaleData(localeEsCo);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    DashboardComponent,
    KanbanComponent,
    PreInventariosComponent,
    RegistroComponent,
    AdquisicionComponent,
    ControlBdComponent,
    BdCostosTramitesComponent,
    BdTramitadoresComponent,
    GoogleAuthCallbackComponent,
    BdUsuariosComponent,
    BdProveedoresComponent,
    CalendarComponent,
    BdComisionesComponent,
    CreditoComponent,
    BdBancosComponent,
    TramitesComponent,
    VentasComponent,
    CotizacionesComponent,
    NotificacionesComponent,
    BdContrasenasComponent,
    BdVariablesComponent,
    AlistamientoComponent,
    CuadroGerencialComponent,
    GraficaMarcasComponent,
    OrdenTrabajoComponent,
    ImageModalComponent,
    DocumentacionComponent,
    MantenimientoComponent,
    ContabilidadComponent,
    ContaCuentasPagarComponent,
    ContaCuentasPagarFijaComponent,
    CuentasPagarAprobacionComponent,
    HistoricoFijasComponent,
    HistoricoVariablesComponent,
    ManualComponent,
    PruebaComponent,
    PanelGerenciaComponent,
    ImagenesIngresoComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    BrowserAnimationsModule,
    MatInputModule,
    FullCalendarModule,
    DragDropModule,
    NgSelectModule, // Agregar NgSelectModule aquí

    InfiniteScrollModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  exports: [MatFormFieldModule, MatSelectModule, MatIconModule, MatAutocompleteModule, MatInputModule, BrowserAnimationsModule,NavbarComponent ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' },
    DatePipe],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }