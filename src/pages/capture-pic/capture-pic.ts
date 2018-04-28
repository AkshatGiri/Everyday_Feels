import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { ToastController } from 'ionic-angular';

/**
 * Generated class for the CapturePicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name: "CapturePicPage"
})
@Component({
  selector: "page-capture-pic",
  templateUrl: "capture-pic.html"
})
export class CapturePicPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private toastCtrl: ToastController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad CapturePicPage");
  }

  takePicture() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then(
      imageData => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = "data:image/jpeg;base64," + imageData;
        console.log(base64Image);
      },
      err => {
        // Handle error
        console.log("There was an error taking the picture: " + err);
        // this.toast.
        this.showErrorToast();
      }
    );
  } // takePicture



  private showErrorToast() {
    let toast = this.toastCtrl.create({
      message: 'Error getting the picture.',
      duration: 2000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }
}
