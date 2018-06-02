import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ModalController,
  AlertController
} from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { ToastController } from "ionic-angular";
import { Http, Headers, RequestOptions } from "@angular/http";
import { AuthData } from "../../providers/auth-data";
import { AngularFireAuth } from "angularfire2/auth";

import {
  AngularFireDatabase,
  FirebaseListObservable
} from "angularfire2/database-deprecated";
import { GalleryModal } from "ionic-gallery-modal";

@IonicPage({
  name: "CapturePicPage"
})
@Component({
  selector: "page-capture-pic",
  templateUrl: "capture-pic.html"
})
export class CapturePicPage {
  //
  loaded: boolean;
  imgGallery: FirebaseListObservable<any[]>;
  imgGalleryArray: any = [];
  photos: any[] = [];
  getIndex: number;
  galleryView: string = "three";
  SERVER_URL = "https://clonedevtests-juandiegoio.c9users.io";
  //

  uid: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private toastCtrl: ToastController,
    public http: Http,
    private auth: AuthData,
    private afAuth: AngularFireAuth,
    public loadingCtrl: LoadingController,
    public afDB: AngularFireDatabase,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  // Gallery
  fullscreenImage(getIndex) {
    //console.log("NEW ==== getIndex="+getIndex);
    let modal = this.modalCtrl.create(GalleryModal, {
      // For multiple images //
      photos: this.imgGalleryArray,
      // For single image //
      // photos: [{url:getImage}],
      closeIcon: "close-circle",
      initialSlide: getIndex
    });
    // console.log("getIndex="+getIndex);
    modal.present();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CapturePicPage");

    this.afAuth.authState.subscribe(userAuth => {
      if (userAuth) {
        this.uid = userAuth.uid;
        console.log("auth true!: ", this.uid);

        // Gallery shit

        // Gallary
        let loadingPopup = this.loadingCtrl.create({
          spinner: "crescent",
          content: ""
        });
        loadingPopup.present();
        this.imgGallery = this.afDB.list("/Expressions/" + this.uid);
        this.imgGallery.subscribe(imgGallery => {
          this.imgGalleryArray = imgGallery;
          loadingPopup.dismiss();
        });
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
      position: "bottom"
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
  }

  // makes a post Request and sends picture data to /fileUpload
  async postRequest(pData: any) {
    return new Promise((resolve, reject) => {
      this.showToast("Sending Post Req");
      var headers = new Headers();
      // headers.append("Accept", 'application/json');
      // headers.append('Content-Type', 'application/json' );
      let options = new RequestOptions({ headers: headers });

      let postParams = {
        uid: this.uid,
        picture: pData
      };

      try {
        this.http
          .post(
            "https://clonedevtests-juandiegoio.c9users.io/fileUpload",
            postParams,
            options
          )
          .subscribe(
            data => {
              let emotion = data.json().emotion;
              this.showAlert("Picture Analysis", emotion);
              console.log(data);
              resolve(data);
            },
            error => {
              console.log(error); // Error getting the data
              this.showToast("Post Req Err: ." + error);
              reject(error);
            }
          ); // subscribe
      } catch (e) {
        console.log("Error sending the picture.");
        this.showToast("Error: Sorry image could not be sent to our servers.");
      }
    }); // Promise
  } // postRequest


  private showAlert(title: string, message: string){
      let alert = this.alertCtrl.create({
        title: title,
        subTitle: message,
        buttons: ['Done']
      });
      alert.present();
  }
}
