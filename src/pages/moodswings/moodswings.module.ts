import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoodswingsPage } from './moodswings';

@NgModule({
  declarations: [
    MoodswingsPage,
  ],
  imports: [
    IonicPageModule.forChild(MoodswingsPage),
  ],
})
export class MoodswingsPageModule {}
