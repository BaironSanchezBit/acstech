import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConversionService {

  constructor() { }

  private unidades(num: number): string {
    switch (num) {
      case 1: return 'Uno';
      case 2: return 'Dos';
      case 3: return 'Tres';
      case 4: return 'Cuatro';
      case 5: return 'Cinco';
      case 6: return 'Seis';
      case 7: return 'Siete';
      case 8: return 'Ocho';
      case 9: return 'Nueve';
      default: return `Número no esperado: ${num}`;
    }
  }

  private decenas(num: number): string {
    if (num < 10) return this.unidades(num);
    if (num >= 10 && num < 20) {
      switch (num) {
        case 10: return 'Diez';
        case 11: return 'Once';
        case 12: return 'Doce';
        case 13: return 'Trece';
        case 14: return 'Catorce';
        case 15: return 'Quince';
        case 16: return 'Dieciséis';
        case 17: return 'Diecisiete';
        case 18: return 'Dieciocho';
        case 19: return 'Diecinueve';
        default: break;
      }
    } else if (num >= 20 && num < 30) {
      return 'Veint' + (num > 20 ? 'i' + this.unidades(num - 20).toLowerCase() : '');
    } else {
      const decenas = ['Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
      let decena = Math.floor(num / 10);
      let unidad = Math.floor(num % 10);
      let resultadoUnidades = this.unidades(unidad);
      return decenas[decena - 3] + (unidad > 0 ? ' y ' + this.unidades(unidad).toLowerCase() : '');
    }
    return '';
  }

  private centenas(num: number): string {
    if (num < 100) return this.decenas(num);
    if (num === 100) return 'Cien';
    let centenas = ['Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
    let centena = Math.floor(num / 100);
    let resto = num % 100;
    return centenas[centena - 1] + (resto ? ' ' + this.decenas(resto).toLowerCase() : '');
  }

  private miles(num: number): string {
    if (num < 1000) return this.centenas(num);
    if (num === 1000) return 'Mil';
    if (num < 2000) return 'Mil ' + this.centenas(num % 1000);
    return this.centenas(Math.floor(num / 1000)) + ' Mil' + (num % 1000 ? ' ' + this.centenas(num % 1000) : '');
  }

  private millones(num: number): string {
    if (num < 1000000) return this.miles(num);
    if (num === 1000000) return 'Un Millón';
    if (num < 2000000) return 'Un Millón ' + this.miles(num % 1000000);
    return this.miles(Math.floor(num / 1000000)) + ' Millones' + (num % 1000000 ? ' ' + this.miles(num % 1000000) : '');
  }

  public numerosALetras(num: number): string {
    if (num === 0) return 'Cero Pesos M/CTE';
    let resultado = this.millones(num).trim();
    return resultado + (resultado.endsWith('Millón') || resultado.endsWith('Millones') ? ' de' : '') + ' Pesos M/CTE';
  }
}
