import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-calendar-popover',
  templateUrl: './calendar-popover.component.html',
  styleUrls: ['./calendar-popover.component.scss'],
})
export class CalendarPopoverComponent {

  constructor(private popoverCtrl: PopoverController) { }

  onDateChange(event: any) {
    const selectedDate = event.detail.value;
    // Envia a data selecionada de volta e fecha o popover
    this.popoverCtrl.dismiss({ date: selectedDate });
  }
}