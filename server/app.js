var express = require('express')
var app = express();
var cors = require("cors");

var bodyParser = require("body-parser");

// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

var fs = require("fs")
// Creates a client
const client = new vision.ImageAnnotatorClient('./service.json');
var admin = require("firebase-admin");

var serviceAccount = require("./firebase/service.json");
var SERVERURL = 'https://clonedevtests-juandiegoio.c9users.io/'


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: ""

});

// Host all files to frontend
app.use(express.static("uploads"));

app.use(cors());
app.options('*', cors());



// Create a storage reference from our storage service


app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));


var db = admin.database();



// Upload a file to the server
app.post('/fileUpload', (req, res, next) => {

  var newId = 'image-' + Date.now() + '.png';
  var path = './uploads/' + req.body.uid + '/';


  // Make a new directory if it doesnt exist, cuz node sucks
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  // Save file to disk

  fs.writeFile(path + newId, req.body.picture, 'base64', function(err) {
    // Use google AI to get back value for emotion
    detectFaces(path + newId);
  });

  function detectFaces(inputFile, callback) {
    // Make a call to the Vision API to detect the faces
    const request = { image: { source: { filename: inputFile } } };
    client
      .faceDetection(request)
      .then(results => {

        // Give the values 0-4 being the likeliest
        function switcher(emotion) {
          switch (emotion) {
            case 'VERY_UNLIKELY':
              return 0
              break;
            case 'UNLIKELY':
              return 1
              break;
            case 'POSSIBLE':
              return 2
              break;
            case 'LIKELY':
              return 3;
              break;
            case 'VERY_LIKELY':
              return 4;
              break;
          }
        }
        console.log(req.body.uid);

        var obj = {
          joyLikelihood: switcher(results[0].faceAnnotations[0].joyLikelihood),
          sorrowLikelihood: switcher(results[0].faceAnnotations[0].sorrowLikelihood),
          angerLikelihood: switcher(results[0].faceAnnotations[0].angerLikelihood)
          // surpriseLikelihood: switcher(results[0].faceAnnotations[0].surpriseLikelihood)
        }

        // Detect the most accurate emotion
        var max = 0;
        var maxEmotion = '';

        for (let emotion in obj) {
          if (obj[emotion] > max) {
            maxEmotion = emotion
            max = obj[emotion]
          }
        }


        // If everything is unlikely, lets add a randomness factor to our code, cuz thats how AI should work!
        if (obj.joyLikelihood === 0 && obj.sorrowLikelihood === 0 && obj.angerLikelihood === 0) {

          const index = Math.floor(Math.random() * 3);
          const emotions = ['joyLikelihood', 'sorrowLikelihood', 'angerLikelihood'];
          obj.emotion = emotions[index];

        }
        // Else do it the real way
        else {
          obj.emotion = maxEmotion;
        }


        // var emotionVal = obj[maxEmotion]
        // var finalVal;

        // // Happy is from 1 to 10
        // if (obj.emotion === 'joyLikelihood') {
        //   finalVal = 2 + emotionVal * 2;
        // }
        // // Sorrow is from -1 to -5
        // if (obj.emotion === 'sorrowLikelihood') {
        //   finalVal = (1 + emotionVal) * -1;
        // }
        // // Anger is from -6 to -10
        // if (obj.emotion === 'angerLikelihood') {
        //   finalVal = (1 + emotionVal + 5) * -1;
        // }


        // obj.finalVal = finalVal;
        obj.url = SERVERURL + req.body.uid + '/' + newId;

        // Push everything to firebase
        db.ref("Expressions").child(req.body.uid).push(obj).then(() => {


          // Send a response to the frontend
          res.send(obj)
        });


      })
      .catch(err => {
        console.error('ERROR:', err);
        res.send("Error lol!")
      });
  }


});



app.listen(process.env.PORT);
console.log('Listening on port', process.env.PORT);
