import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PokemonList } from '../../components/pokemon-list/pokemon-list';
import { Pokemon } from '../../models/pokemon/pokemon';

type TeamDetailDialogData = {
  selectedPokemon: Pokemon;
};

@Component({
  selector: 'app-team-detail-replace-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, PokemonList],
  templateUrl: './team-detail-replace-dialog.html',
  styleUrls: ['./team-detail-replace-dialog.css'],
})
export class TeamDetailReplaceDialog {
  private dialogRef = inject(MatDialogRef<TeamDetailReplaceDialog>);
  data = inject(MAT_DIALOG_DATA) as TeamDetailDialogData;

  onReplace(pokemon: Pokemon) {
    this.dialogRef.close(pokemon);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
