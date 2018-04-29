import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { ToastController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AuthData } from "../../providers/auth-data";
import { AngularFireAuth } from "angularfire2/auth";


@IonicPage({
  name: "CapturePicPage"
})
@Component({
  selector: "page-capture-pic",
  templateUrl: "capture-pic.html"
})
export class CapturePicPage {


  uid: string; 

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private toastCtrl: ToastController,
    public http: Http,
    private auth: AuthData,
    private afAuth: AngularFireAuth
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad CapturePicPage");

    this.afAuth.authState.subscribe(userAuth => {
     
        if(userAuth) {
          this.uid = userAuth.uid;  
          console.log("auth true!: ", this.uid);
        }
      });
  }


  // takes and sends the picture to the server
  takePicture() {
    const options: CameraOptions = {
      quality: 50,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection: 1
    };

    this.camera.getPicture(options).then(
      imageData => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = imageData; // "data:image/jpeg;base64," + imageData;
        console.log(base64Image);
        this.showToast("Success: Analyzing the picture.");
        this.postRequest(base64Image);
      },
      err => {
        // Handle error
        console.log("There was an error taking the picture: " + err);
        this.showToast("Error Getting the picture!");
      } // err
    ); // then
  } // takePicture



  private showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }


  // makes a post Request and sends picture data to /fileUpload
  async postRequest(pData: any) {
    return new Promise((resolve , reject)=> {

      this.showToast("Sending Post Req");
      var headers = new Headers();
      // headers.append("Accept", 'application/json');
      // headers.append('Content-Type', 'application/json' );
      let options = new RequestOptions({ headers: headers });
  
      let postParams = {
        uid: this.uid,
        picture: pData
      }
      
      try{
        this.http.post("https://clonedevtests-juandiegoio.c9users.io/fileUpload", postParams, options)
          .subscribe(data => {
            let joyLikelihood = data.json().filename;
            this.showToast("Data: " + joyLikelihood);
            console.log(data);
            resolve(data);
           }, error => {
            console.log(error);// Error getting the data
            this.showToast("Post Req Err: ." + error);
            reject(error);
          }); // subscribe 
      }
      catch (e) { 
        console.log("Error sending the picture.");
        this.showToast("Error: Sorry image could not be sent to our servers.")
      }
    }); // Promise
  } // postRequest
}
