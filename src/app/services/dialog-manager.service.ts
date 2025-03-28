import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../commons/components/yes-no-dialog/yes-no-dialog.component';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { IDialogManagerService } from './idialog-manager.service';

@Injectable({
  providedIn: 'root'
})
export class DialogManagerService implements IDialogManagerService{

  constructor(private readonly dialog: MatDialog) { }

  public showYesNoDialog(component: ComponentType<YesNoDialogComponent>, data: { title: string; content: string; }): Observable<any> {
    const dialogRef = this.dialog.open(component, {
      width: '400px',
      data
    })

    return dialogRef.afterClosed()
  }
}
