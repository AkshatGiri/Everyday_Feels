import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CapturePicPage } from './capture-pic';

@NgModule({
  declarations: [
    CapturePicPage,
  ],
  imports: [
    IonicPageModule.forChild(CapturePicPage),
  ],
})
export class CapturePicPageModule {}
