import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DatePipe } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [DatePipe]
})
export class CalendarComponent implements OnInit {
  selectedTime: string | null = null;
  events2: EventInput[] = [];
  loggedIn: boolean = false;
  userData: string = "";
  user: any;
  datosUser: any;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: this.events2,
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    locale: 'es',
    themeSystem: 'bootstrap',
    selectable: true,
    editable: true,
    select: this.handleDateSelect.bind(this),
    unselect: this.handleUnselect.bind(this),
    selectOverlap: false,
    slotDuration: '00:15:00',
    slotLabelInterval: '01:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
  };

  constructor(private datePipe: DatePipe, private calendarService: CalendarService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      this.user = this.authService.getUser();
      this.authService.getUserDetails().subscribe(
        user => {
          this.datosUser = user;
          this.loadEvents(this.datosUser._id);  // Llama a loadEvents aquí después de obtener los detalles del usuario
        },
        error => {
          console.error('Error fetching user details:', error);
        }
      );
    }
  }

  getEvents() {
    return this.events2;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const startTime = this.datePipe.transform(selectInfo.start, 'h:mm a');
    const endTime = this.datePipe.transform(selectInfo.end, 'h:mm a');
    this.selectedTime = `${startTime} - ${endTime}`;
  }

  handleUnselect() {
    this.selectedTime = null;
  }

  handleEventClick(clickInfo: any) {
    if (confirm(`¿Desea eliminar el evento '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
    }
  }

  loadEvents(userId: string) {
    this.calendarService.getEvents(userId).subscribe(
      data => {
        this.events2 = data.map((event: any) => ({
          title: event.summary,
          start: event.start.dateTime,
          end: event.end.dateTime
        }));
        this.calendarOptions.events = this.events2; // Actualiza el array de eventos del calendario
      },
      error => {
        console.error('Error fetching events:', error);
      }
    );
  }
}
