import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-prueba',
  templateUrl: './prueba.component.html',
  styleUrls: ['./prueba.component.css']
})
export class PruebaComponent implements OnInit {
  inventories: any[] = [];
  apiUrl = environment.apiUrl;

  ubicaciones = {
    AUTOMAGNO_VITRINA: [] as any[],
    AUTOMAGNO_CASA_1: [] as any[],
    AUTOMAGNO_CASA_2: [] as any[],
    AUTOMAGNO_CASA_3: [] as any[],
    ENTREGADO: [] as any[]
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/getInventoriesAllPrueba`).subscribe(data => {
      this.organizarInventarios(data);
    });
  }

  organizarInventarios(data: any[]) {
    this.ubicaciones.AUTOMAGNO_VITRINA = data.filter(inv => inv.filtroBaseDatos?.ubicacion === "AUTOMAGNO VITRINA");
    this.ubicaciones.AUTOMAGNO_CASA_1 = data.filter(inv => inv.filtroBaseDatos?.ubicacion === "AUTOMAGNO CASA 1");
    this.ubicaciones.AUTOMAGNO_CASA_2 = data.filter(inv => inv.filtroBaseDatos?.ubicacion === "AUTOMAGNO CASA 2");
    this.ubicaciones.AUTOMAGNO_CASA_3 = data.filter(inv => inv.filtroBaseDatos?.ubicacion === "AUTOMAGNO CASA 3");
    this.ubicaciones.ENTREGADO = data.filter(inv => inv.filtroBaseDatos?.ubicacion === "ENTREGADO");
  }

  drop(event: CdkDragDrop<any[]>, nuevoEstado: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];

      // Actualizar el estado en el frontend
      item.filtroBaseDatos.estadoInventario = nuevoEstado;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Llamar al backend para actualizar el estado
      this.actualizarEstado(item);
    }
  }

  actualizarEstado(inventory: any) {
    this.http.put(`${this.apiUrl}/api/updateInventory/${inventory._id}`, {
      estadoInventario: inventory.filtroBaseDatos.estadoInventario
    }).subscribe(
      () => console.log(`✅ Estado actualizado a ${inventory.filtroBaseDatos.estadoInventario}`),
      error => console.error("❌ Error al actualizar el estado:", error)
    );
  }
}