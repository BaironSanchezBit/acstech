import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-bd-costos-tramites',
  templateUrl: './bd-costos-tramites.component.html',
  styleUrls: ['./bd-costos-tramites.component.css']
})
export class BdCostosTramitesComponent implements OnInit, OnDestroy {
  costoTramiteSeleccionado: any = {};
  nuevoCostoTramites: FormGroup;
  loading = false;
  costosTramites: any;
  costosTramitesOriginal: any;
  lugares!: any[];
  busqueda: string = '';
  departamentos!: any[];
  valoresNumericos: { [key: string]: number } = {
    traspaso100: 0,
    inscripcionPrenda: 0,
    levantamientoPrenda: 0,
    trasladoDeCuenta: 0,
    radicacionDeCuenta: 0,
    duplicadoDePlacas: 0,
    certificadoDeTradicion: 0,
    certificacionDeImpuestos: 0,
    historicoVehicular: 0,
    honorariosTramitado: 0,
    honorariosAutomagno: 0
  };
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.nuevoCostoTramites = this.formBuilder.group({
      ciudad: ['', Validators.required],
      traspaso100: ['', Validators.required],
      inscripcionPrenda: ['', Validators.required],
      levantamientoPrenda: ['', Validators.required],
      trasladoDeCuenta: ['', Validators.required],
      radicacionDeCuenta: ['', Validators.required],
      duplicadoDePlacas: ['', Validators.required],
      certificadoDeTradicion: ['', Validators.required],
      certificacionDeImpuestos: ['', Validators.required],
      historicoVehicular: ['', Validators.required],
      honorariosTramitado: ['', Validators.required],
      honorariosAutomagno: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/ciudades`).subscribe(data => {
      this.lugares = data;
      this.lugares.push({ name: 'Pendiente' });
      this.organizarAlfabeticamente();
    });
    this.http.get<any[]>(`${this.apiUrl}/api/departamentos`).subscribe(data => {
      this.departamentos = data;
      this.organizarAlfabeticamente();
    });
    this.http.get<any[]>(`${this.apiUrl}/api/getCostosTramites`).subscribe(data => {
      this.costosTramitesOriginal = [...data]; // Guarda una copia original de los datos
      this.costosTramites = [...data];         // Datos que se filtrarán
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private removeModalBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  seleccionarCostoTramite(costosTramites: any): void {
    this.costoTramiteSeleccionado = { ...costosTramites };
    this.formatearValoresParaEdicion();
  }

  formatSalary(salary: number): string {
    if (isNaN(salary) || salary === null) {
      return '-';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  }

  filtrarBD() {
    // Primero, asegúrate de que tienes una copia original de los datos para no perderlos al filtrar
    const busquedaNormalizada = this.busqueda.trim().toLowerCase();

    // Filtrar por cualquier campo
    this.costosTramites = this.costosTramitesOriginal.filter((costo: any) => {
      return (
        costo.ciudad.toLowerCase().includes(busquedaNormalizada)
      );
    });
  }

  organizarAlfabeticamente() {
    this.lugares.sort((a, b) => {
      const departamentoA = a.name.toLowerCase();
      const departamentoB = b.name.toLowerCase();

      if (departamentoA < departamentoB) {
        return -1;
      }
      if (departamentoA > departamentoB) {
        return 1;
      }
      return 0;
    });
  }

  async crearCostoTramite() {
    const data = { ...this.valoresNumericos, ciudad: this.nuevoCostoTramites.controls['ciudad'].value };
  
    if (this.nuevoCostoTramites.valid) {
      try {
        const response = await this.http.post(`${this.apiUrl}/api/postCostosTramites`, data).toPromise();
        this.costosTramites.push(response);
  
        await Swal.fire('¡Éxito!', 'Costo trámite creado correctamente.', 'success');
        location.reload();
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire('Error', 'Hubo un problema al crear el costo del trámite', 'error');
      }
    } else {
      await Swal.fire('Error', 'Verifica los campos', 'warning');
    }
  }  

  async actualizarCostoTramite() {
    try {
      const costoTramiteData = {
        ...this.costoTramiteSeleccionado,
        traspaso100: this.valoresNumericos["traspaso100"],
        inscripcionPrenda: this.valoresNumericos["inscripcionPrenda"],
        levantamientoPrenda: this.valoresNumericos["levantamientoPrenda"],
        trasladoDeCuenta: this.valoresNumericos["trasladoDeCuenta"],
        radicacionDeCuenta: this.valoresNumericos["radicacionDeCuenta"],
        duplicadoDePlacas: this.valoresNumericos["duplicadoDePlacas"],
        certificadoDeTradicion: this.valoresNumericos["certificadoDeTradicion"],
        certificacionDeImpuestos: this.valoresNumericos["certificacionDeImpuestos"],
        historicoVehicular: this.valoresNumericos["historicoVehicular"],
        honorariosTramitado: this.valoresNumericos["honorariosTramitado"],
        honorariosAutomagno: this.valoresNumericos["honorariosAutomagno"],
      }

      const response = await this.http.put(`${this.apiUrl}/api/updateCostosTramites/${this.costoTramiteSeleccionado._id}`, costoTramiteData).toPromise();

      await Swal.fire(
        '¡Éxito!',
        'Proveedor creado correctamente.',
        'success'
      )
      location.reload();
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el costo del trámite',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }

  get traspaso100Formatted(): string {
    return this.formatCurrency(this.valoresNumericos['traspaso100']);
  }

  get inscripcionPrenda(): string {
    return this.formatCurrency(this.valoresNumericos['inscripcionPrenda']);
  }

  get levantamientoPrenda(): string {
    return this.formatCurrency(this.valoresNumericos['levantamientoPrenda'])
  }
  get trasladoDeCuenta(): string {
    return this.formatCurrency(this.valoresNumericos['trasladoDeCuenta'])
  }
  get radicacionDeCuenta(): string {
    return this.formatCurrency(this.valoresNumericos['radicacionDeCuenta'])
  }
  get duplicadoDePlacas(): string {
    return this.formatCurrency(this.valoresNumericos['duplicadoDePlacas'])
  }
  get certificadoDeTradicion(): string {
    return this.formatCurrency(this.valoresNumericos['certificadoDeTradicion'])
  }
  get certificacionDeImpuestos(): string {
    return this.formatCurrency(this.valoresNumericos['certificacionDeImpuestos'])
  }
  get historicoVehicular(): string {
    return this.formatCurrency(this.valoresNumericos['historicoVehicular'])
  }
  get honorariosTramitado(): string {
    return this.formatCurrency(this.valoresNumericos['honorariosTramitado'])
  }
  get honorariosAutomagno(): string {
    return this.formatCurrency(this.valoresNumericos['honorariosAutomagno'])
  }

  onCurrencyInput2(controlName: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const numericValue = parseInt(value, 10) || 0;
    this.valoresNumericos[controlName] = numericValue;
    const formattedValue = this.formatCurrency(numericValue);
    this.nuevoCostoTramites.controls[controlName].setValue(formattedValue, { emitEvent: false });
  }

  onCurrencyInput(controlName: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue)) {
      const formattedValue = this.formatCurrency(numericValue);
      this.nuevoCostoTramites.controls[controlName].setValue(formattedValue, { emitEvent: false });
    } else {
      this.nuevoCostoTramites.controls[controlName].setValue('', { emitEvent: false });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatearValoresParaEdicion(): void {
    for (const key in this.valoresNumericos) {
      if (this.costoTramiteSeleccionado.hasOwnProperty(key)) {
        this.valoresNumericos[key] = this.costoTramiteSeleccionado[key];
        const formattedValue = this.formatCurrency(this.costoTramiteSeleccionado[key]);
        this.nuevoCostoTramites.controls[key].setValue(formattedValue, { emitEvent: false });
      }
    }
  }
}
