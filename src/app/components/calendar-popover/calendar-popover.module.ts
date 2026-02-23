import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CalendarPopoverComponent } from './calendar-popover.component';

@NgModule({
  declarations: [CalendarPopoverComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [CalendarPopoverComponent] // Exporta o componente para que outros módulos possam usá-lo
})
export class CalendarPopoverComponentModule {}