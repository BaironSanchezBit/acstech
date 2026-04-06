import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginRedirectGuard } from './guards/LoginRedirectGuard.guard';
import { AuthGuard } from './guards/auth.guard';
import { RegistroComponent } from './components/registro/registro.component';
import { AdquisicionComponent } from './components/adquisicion/adquisicion.component';
import { ControlBdComponent } from './components/control-bd/control-bd.component';
import { BdComisionesComponent } from './components/bd-comisiones/bd-comisiones.component';
import { BdCostosTramitesComponent } from './components/bd-costos-tramites/bd-costos-tramites.component';
import { BdProveedoresComponent } from './components/bd-proveedores/bd-proveedores.component';
import { BdTramitadoresComponent } from './components/bd-tramitadores/bd-tramitadores.component';
import { BdBancosComponent } from './components/bd-bancos/bd-bancos.component';
import { BdUsuariosComponent } from './components/bd-usuarios/bd-usuarios.component';
import { CreditoComponent } from './components/credito/credito.component';
import { TramitesComponent } from './components/tramites/tramites.component';
import { VentasComponent } from './components/ventas/ventas.component';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { BdContrasenasComponent } from './components/bd-contrasenas/bd-contrasenas.component';
import { CuadroGerencialComponent } from './components/cuadro-gerencial/cuadro-gerencial.component';
import { ContabilidadComponent } from './components/contabilidad/contabilidad.component';
import { BdVariablesComponent } from './components/bd-variables/bd-variables.component';
import { AlistamientoComponent } from './components/alistamiento/alistamiento.component';
import { OrdenTrabajoComponent } from './components/orden-trabajo/orden-trabajo.component';
import { KanbanComponent } from './components/kanban/kanban.component';
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
import { PruebaComponent } from './components/prueba/prueba.component';
import { PanelGerenciaComponent } from './components/panel-gerencia/panel-gerencia.component';
import { ImagenesIngresoComponent } from './components/imagenes-ingreso/imagenes-ingreso.component';

const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'auth/callback', component: GoogleAuthCallbackComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'sistema', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'inventarios', component: KanbanComponent, canActivate: [AuthGuard] },
  { path: 'panel-gerencia', component: PanelGerenciaComponent, canActivate: [AuthGuard] },
  { path: 'pre-inventario', component: PreInventariosComponent, canActivate: [AuthGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [AuthGuard] },
  { path: 'control-bd', component: ControlBdComponent, canActivate: [AuthGuard] },
  { path: 'bd-comisiones', component: BdComisionesComponent, canActivate: [AuthGuard] },
  { path: 'bd-costosTramites', component: BdCostosTramitesComponent, canActivate: [AuthGuard] },
  { path: 'bd-proveedores', component: BdProveedoresComponent, canActivate: [AuthGuard] },
  { path: 'bd-tramitadores', component: BdTramitadoresComponent, canActivate: [AuthGuard] },
  { path: 'bd-bancos', component: BdBancosComponent, canActivate: [AuthGuard] },
  { path: 'bd-usuarios', component: BdUsuariosComponent, canActivate: [AuthGuard] },
  { path: 'bd-contrasenas', component: BdContrasenasComponent, canActivate: [AuthGuard] },
  { path: 'bd-variables', component: BdVariablesComponent, canActivate: [AuthGuard] },
  { path: 'alistamiento', component: AlistamientoComponent, canActivate: [AuthGuard] },
  { path: 'tramites', component: TramitesComponent, canActivate: [AuthGuard] },
  { path: 'modulo-credito', component: CreditoComponent, canActivate: [AuthGuard]},
  { path: 'adquisicion', component: AdquisicionComponent, canActivate: [AuthGuard]},
  { path: 'manual', component: ManualComponent, canActivate: [AuthGuard]},
  { path: 'documentacion', component: DocumentacionComponent, canActivate: [AuthGuard]},
  //{ path: 'contabilidad', component: ContabilidadComponent, canActivate: [AuthGuard]},
  //{ path: 'cuentas-por-pagar', component: ContaCuentasPagarComponent, canActivate: [AuthGuard]},
  //{ path: 'cuentas-por-pagar-fija', component: ContaCuentasPagarFijaComponent, canActivate: [AuthGuard]},
  //{ path: 'cuentas-pagar-aprobacion', component: CuentasPagarAprobacionComponent, canActivate: [AuthGuard]},
  { path: 'venta', component: VentasComponent, canActivate: [AuthGuard]},
  //{ path: 'historico-fijas', component: HistoricoFijasComponent, canActivate: [AuthGuard]},
  //{ path: 'historico-variables', component: HistoricoVariablesComponent, canActivate: [AuthGuard]},
  { path: 'modulo-credito', component: CreditoComponent, canActivate: [AuthGuard]},
  { path: 'orden-trabajo', component: OrdenTrabajoComponent, canActivate: [AuthGuard]},
  { path: 'cotizaciones', component: CotizacionesComponent, canActivate: [AuthGuard] },
  { path: 'pruebas', component: PruebaComponent, canActivate: [AuthGuard] },
  { path: 'cuadro-gerencial', component: CuadroGerencialComponent, canActivate: [AuthGuard] },
  { path: 'grafica-distribucion-marcas', component: GraficaMarcasComponent, canActivate: [AuthGuard] },
  { path: 'imagenes-ingreso', component: ImagenesIngresoComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
