import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { PokemonList } from '../pokemon-list/pokemon-list';
import { Pokemon } from '../../models/pokemon/pokemon';

type PokemonPickerDialogData = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
};

@Component({
  selector: 'app-pokemon-picker-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, PokemonList],
  templateUrl: './pokemon-picker-dialog.html',
  styleUrls: ['./pokemon-picker-dialog.css'],
})
export class PokemonPickerDialog {
  private dialogRef = inject(MatDialogRef<PokemonPickerDialog>);
  data = inject(MAT_DIALOG_DATA) as PokemonPickerDialogData;

  onPick(pokemon: Pokemon): void {
    this.dialogRef.close(pokemon);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
