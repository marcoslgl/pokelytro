import {
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * FilterPanel Component - Reutilizable para paneles de filtro desplegables
 * Maneja:
 * - Toggle del panel (showFilters)
 * - Cierre al hacer click fuera
 * - Slot de contenido para filtros específicos
 */
@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-panel.html',
  styleUrls: ['./filter-panel.css'],
})
export class FilterPanel {
  showFilters = false;

  @ViewChild('filtersPanel') filtersPanel?: ElementRef<HTMLElement>;
  @ViewChild('filterButton') filterButton?: ElementRef<HTMLElement>;
  @ContentChild('filterContent') filterContent?: TemplateRef<any>;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showFilters) return;
    const target = event.target as Node | null;
    const panel = this.filtersPanel?.nativeElement;
    const button = this.filterButton?.nativeElement;
    if (target && (panel?.contains(target) || button?.contains(target))) {
      return;
    }
    this.showFilters = false;
  }

  closeFilters(): void {
    this.showFilters = false;
  }
}
