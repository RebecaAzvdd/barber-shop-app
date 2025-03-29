import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {
  ClientScheduleAppointmentModel,
  SaveScheduleModel,
  ScheduleAppointementMonthModel,
  SelectClientModel,
} from '../../schedule.models';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { SERVICES_TOKEN } from '../../../services/service.token';
import { DialogManagerService } from '../../../services/dialog-manager.service';
import { IDialogManagerService } from '../../../services/idialog-manager.service';
import { YesNoDialogComponent } from '../../../commons/components/yes-no-dialog/yes-no-dialog.component';
@Component({
  selector: 'app-schedule-calendar',
  imports: [
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatTimepickerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatButtonModule,
    MatDatepickerModule,
    MatCardModule
  ],
  templateUrl: './schedule-calendar.component.html',
  styleUrl: './schedule-calendar.component.scss',
  providers: [
    provideNativeDateAdapter(),
    {
      provide: SERVICES_TOKEN.DIALOG, useClass: DialogManagerService
    }
  ]
})
export class ScheduleCalendarComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  private subscription?: Subscription;

  private _selected: Date = new Date();

  public displayedColumns: string[] = ['startAt', 'endAt', 'client', 'actions'];

  public dataSource!: MatTableDataSource<ClientScheduleAppointmentModel>;

  public addingSchedule: boolean = false;

  public newSchedule: SaveScheduleModel = {
    startAt: undefined,
    endAt: undefined,
    clientId: undefined,
  };

  public clientSelectFormControl = new FormControl();

  @Input() monthSchedule!: ScheduleAppointementMonthModel;

  @Input() clients: SelectClientModel[] = [];

  @Output() onDateChange = new EventEmitter<Date>();

  @Output() onConfirmDelete =
    new EventEmitter<ClientScheduleAppointmentModel>();

  @Output() onScheduleClient = new EventEmitter<SaveScheduleModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  

  constructor(@Inject (SERVICES_TOKEN.DIALOG) private readonly dialogManagerService: IDialogManagerService) {}

  public get selected(): Date {
    return this._selected
  }

  public set selected(selected: Date) {
    if (this._selected.getTime() !== selected.getTime()) {
      this.onDateChange.emit(selected)
      this.buildTable()
      this._selected = selected
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthSchedule'] && this.monthSchedule) {
      this.buildTable()
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  public onSubmit(form: NgForm) {
    const startAt = new Date(this._selected)
    const endAt = new Date(this._selected)
    startAt.setHours(this.newSchedule.startAt!.getHours(), this.newSchedule.startAt!.getMinutes())
    endAt.setHours(this.newSchedule.endAt!.getHours(), this.newSchedule.endAt!.getMinutes())
    const saved: ClientScheduleAppointmentModel = {
      id: -1,
      day: this._selected.getDate(),
      startAt,
      endAt,
      clientId: this.newSchedule.clientId!,
      clientName: this.clients.find(c => c.id === this.newSchedule.clientId!)!.name
    }
    this.monthSchedule.scheduledAppointments.push(saved)
    this.onScheduleClient.emit(saved)
    this.buildTable()
    form.resetForm()
    this.newSchedule = { startAt: undefined, endAt: undefined, clientId: undefined }
  }

  public requestDelete(schedule: ClientScheduleAppointmentModel) {
    this.subscription = this.dialogManagerService.showYesNoDialog(
      YesNoDialogComponent,
      { title: 'Exclusão de agendamento', content: 'Confirma a exclusão do agendamento?' }
    ).subscribe(result => {
      if (result) {
        this.onConfirmDelete.emit(schedule)
        const updatedeList = this.dataSource.data.filter(c => c.id !== schedule.id)
        this.dataSource = new MatTableDataSource<ClientScheduleAppointmentModel>(updatedeList)
        if (this.paginator) {
          this.dataSource.paginator = this.paginator
        }
      }
    })
  }

  public onTimeChange(time: Date) {
    const endAt = new Date(time)
    endAt.setHours(time.getHours() + 1)
    this.newSchedule.endAt = endAt
  }

  private buildTable() {
    const appointments = this.monthSchedule.scheduledAppointments.filter(a =>
      this.monthSchedule.year === this._selected.getFullYear() &&
      this.monthSchedule.month - 1 === this._selected.getMonth() &&
      a.day === this._selected.getDate()
    )
    this.dataSource = new MatTableDataSource<ClientScheduleAppointmentModel>(appointments);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator
    }
  }
}
