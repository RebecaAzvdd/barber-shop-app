import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ScheduleCalendarComponent } from '../components/schedule-calendar/schedule-calendar.component';
import { SERVICES_TOKEN } from '../../services/service.token';
import { SchedulesService } from '../../services/api-client/schedules/schedules.service';
import { ClientsService } from '../../services/api-client/clients/clients.service';
import { SnackbarManagerService } from '../../services/snackbar-manager.service';
import { IScheduleService } from '../../services/api-client/schedules/ischedules.service';
import { ICLientService } from '../../services/api-client/clients/iclients.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { Subscription } from 'rxjs';
import {
  ClientScheduleAppointmentModel,
  SaveScheduleModel,
  ScheduleAppointementMonthModel,
  SelectClientModel,
} from '../schedule.models';
import { SaveScheduleRequest } from '../../services/api-client/schedules/schedule.models';

@Component({
  selector: 'app-schedules-month',
  imports: [ScheduleCalendarComponent],
  templateUrl: './schedules-month.component.html',
  styleUrl: './schedules-month.component.scss',
  providers: [
    { provide: SERVICES_TOKEN.HTTP.SCHEDULE, useClass: SchedulesService },
    { provide: SERVICES_TOKEN.HTTP.CLIENT, useClass: ClientsService },
    { provide: SERVICES_TOKEN.SNACKBAR, useClass: SnackbarManagerService },
  ],
})
export class SchedulesMonthComponent implements OnInit, OnDestroy {

  public monthSchedule!: ScheduleAppointementMonthModel;
  public clients: SelectClientModel[] = [];

  private subscriptions: Subscription[] = [];
  private selectedDate?: Date;

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.SCHEDULE)
    private readonly httpService: IScheduleService,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT)
    private readonly clientHttpService: ICLientService,
    @Inject(SERVICES_TOKEN.SNACKBAR)
    private readonly snackbarManage: ISnackbarManagerService
  ) {}

  ngOnInit(): void {
    this.fetchSchedules(new Date());
    this.subscriptions.push(this.clientHttpService.list().subscribe(data => this.clients = data))
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  public onScheduleClient(schedule: SaveScheduleModel) {
    if (schedule.startAt && schedule.endAt && schedule.clientId) {
      const request: SaveScheduleRequest = { startAt: schedule.startAt, endAt: schedule.endAt, clientId: schedule.clientId }
      this.subscriptions.push(this.httpService.save(request).subscribe(() => {
        this.snackbarManage.show('Agendamento realizado com sucesso')
        if (this.selectedDate) {
          this.fetchSchedules(this.selectedDate)
        }
      }))
    }
  }

  public onConfirmDelete(schedule: ClientScheduleAppointmentModel) {
    this.subscriptions.push(this.httpService.delete(schedule.id).subscribe())
  }

  public onDateChange(date: Date) {
    this.selectedDate = date
    this.fetchSchedules(date)
  }

  private fetchSchedules(currentDate: Date) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    this.subscriptions.push(this.httpService.listInMonth(year, month).subscribe(data => this.monthSchedule = data));

  }

}
