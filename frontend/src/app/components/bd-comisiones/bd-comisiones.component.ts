import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/app/environments/environment';

@Component({
  selector: 'app-bd-comisiones',
  templateUrl: './bd-comisiones.component.html',
  styleUrls: ['./bd-comisiones.component.css']
})
export class BdComisionesComponent implements OnInit, OnDestroy {
  loading = false;
  comisiones: any;
  comisionSeleccionada: any = {};
  comisionForm: FormGroup;
  min: number = 0;
  max: number = 0;
  valor: number = 0;
  private routerSubscription: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private http: HttpClient, private formBuilder: FormBuilder) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removeModalBackdrop();
      }
    });

    this.comisionForm = this.formBuilder.group({
      min: ['', Validators.required],
      max: ['', Validators.required],
      valor: ['', Validators.required]
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

  ngOnInit(): void {
    this.loading = true;

    this.algunaOperacionAsincrona().then(() => {
      this.loading = false;
    });

    this.http.get<any[]>(`${this.apiUrl}/api/getComisiones`).subscribe(data => {
      this.comisiones = data;
    });
  }

  algunaOperacionAsincrona(): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  seleccionarComision(comision: any) {
    this.comisionSeleccionada = { ...comision };

    this.min = this.parseCurrency(comision.min);
    this.max = this.parseCurrency(comision.max);
    this.valor = this.parseCurrency(comision.valor);
  }

  get minFormatted(): string {
    return this.formatCurrency(this.min);
  }

  get maxFormatted(): string {
    return this.formatCurrency(this.max);
  }

  get valorFormatted(): string {
    return this.formatCurrency(this.valor);
  }

  parseCurrency(value: string): number {
    return parseInt(value.replace(/[$,.]/g, ''), 10) || 0;
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

  async actualizarComision() {
    try {
      const datosActualizados = {
        min: this.min,
        max: this.max,
        valor: this.valor
      };

      const response = await this.http.put(`${this.apiUrl}/api/updateComisiones/${this.comisionSeleccionada._id}`, datosActualizados).toPromise();
      await Swal.fire(
        '¡Éxito!',
        'Comisión actualizada correctamente.',
        'success'
      )
      location.reload();
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar la comisión',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }

  onCurrencyInput(property: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const cleanValue = inputElement.value.replace(/[^\d.]/g, '');
    if (!cleanValue) {
      this.comisionSeleccionada[property] = 0;
      return;
    }
    const numericValue = parseFloat(cleanValue);
    if (!isNaN(numericValue)) {
      this.comisionSeleccionada[property] = numericValue;
      inputElement.value = this.formatCurrency(numericValue);
    } else {
      this.comisionSeleccionada[property] = 0;
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

  onCurrencyInput2(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    this.min = parseInt(value, 10) || 0;
  }

  onCurrencyInput3(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    this.max = parseInt(value, 10) || 0;
  }

  onCurrencyInput4(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    this.valor = parseInt(value, 10) || 0;
  }

  formatearValoresParaEdicion(): void {
    this.comisionSeleccionada.minFormatted = this.formatCurrency(this.comisionSeleccionada.min);
    this.comisionSeleccionada.maxFormatted = this.formatCurrency(this.comisionSeleccionada.max);
    this.comisionSeleccionada.valorFormatted = this.formatCurrency(this.comisionSeleccionada.valor);
  }

}
