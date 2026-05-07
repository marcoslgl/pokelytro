import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-controls.html',
  styleUrls: ['./pagination-controls.css'],
})
export class PaginationControls {
  @Input() page = 1;
  @Input() totalPages = 1;

  @Output() nextPage = new EventEmitter<void>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();

  onNextClick(): void {
    this.nextPage.emit();
  }

  onPrevClick(): void {
    this.prevPage.emit();
  }

  onGoToPage(page: string): void {
    const pageNum = Number(page);
    if (Number.isFinite(pageNum) && pageNum > 0) {
      this.goToPage.emit(pageNum);
    }
  }

  /**
   * Helper estático para calcular el total de páginas
   * @param totalItems Cantidad total de items
   * @param pageSize Tamaño de página
   * @returns Total de páginas
   */
  static calculateTotalPages(totalItems: number, pageSize: number): number {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }

  /**
   * Helper estático para normalizar página
   * @param page Página solicitada
   * @param totalPages Total de páginas disponibles
   * @returns Página normalizada (válida)
   */
  static normalizePage(page: number, totalPages: number): number {
    if (page < 1) return 1;
    if (page > totalPages) return totalPages;
    return page;
  }

  /**
   * Helper estático para calcular siguiente página
   * @param currentPage Página actual
   * @param totalPages Total de páginas
   * @returns Nueva página o undefined si ya está en la última
   */
  static getNextPage(currentPage: number, totalPages: number): number | undefined {
    if (currentPage < totalPages) {
      return currentPage + 1;
    }
    return undefined;
  }

  /**
   * Helper estático para calcular página anterior
   * @param currentPage Página actual
   * @returns Nueva página o undefined si ya está en la primera
   */
  static getPrevPage(currentPage: number): number | undefined {
    if (currentPage > 1) {
      return currentPage - 1;
    }
    return undefined;
  }

  /**
   * Helper estático para calcular rango de items a mostrar
   * @param page Página actual
   * @param pageSize Tamaño de página
   * @returns Objeto con start e end
   */
  static getPageRange(page: number, pageSize: number): { start: number; end: number } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { start, end };
  }

  /**
   * Helper estático para obtener slice de items
   * @param items Array de items
   * @param page Página actual
   * @param pageSize Tamaño de página
   * @returns Items de la página
   */
  static getPagedItems<T>(items: T[], page: number, pageSize: number): T[] {
    const { start, end } = this.getPageRange(page, pageSize);
    return items.slice(start, end);
  }
}
