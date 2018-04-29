import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DataVisualizationPage } from './data-visualization';

@NgModule({
  declarations: [
    DataVisualizationPage,
  ],
  imports: [
    IonicPageModule.forChild(DataVisualizationPage),
  ],
})
export class DataVisualizationPageModule {}
