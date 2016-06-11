var firebase = require("firebase");
var GeoFire = require("geofire");

// Initialize Firebase: https://firebase.google.com/docs/server/setup#add_the_sdk
var config = {
  serviceAccount: "GeoSeb-ade75b26590c.json",
  databaseURL: "https://project-9154129149099457236.firebaseio.com"
};
var db = firebase.initializeApp(config).database();

// GeoFire: https://github.com/firebase/geofire-js/blob/master/docs/reference.md
var geoFire = new GeoFire(db.ref("locations"));

// location from http://mygeoposition.com/
var center = [51.5034070,-0.1275920];

var amount = 200;

var left = amount;
for (i=0; i<amount; i++) {
  var lat = Math.random()*4 - 2 + center[0];
  var lon = Math.random()*4 - 2 + center[1];

  console.log("adding " + i + " ==> [" + [lat, lon] + "]");
  geoFire.set("" + i, [lat, lon])
  .then(function(){
    left--;
    console.log(left + " left");
    if (left === 0 ) process.exit();
  })
  .catch(function(error){
    console.error(error);
  });

}
