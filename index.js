(function(){
  angular.module('foss4gapp',[])
  .controller('foss4gctrl', function($scope, $timeout){
    $scope.points = {};
    $scope.center = [0, 0];
    $scope.radius = 3;
    $scope.deltaLoc = [0.1, 0.1];
    $scope.newPoint = [0, 0];
    $scope.pointsLeft = 0;
    $scope.numOfPoints = 100;
    $scope.calculatingLocation = false;
    $scope.addPoint = addPoint;
    $scope.removePoint = removePoint;
    $scope.updateCriteria = updateCriteria;
    $scope.addRamdonPoints = addRamdonPoints;
    $scope.currentLocation = currentLocation;

    var geoQuery;

    // Initialize Firebase: see console.
    var config = {
      apiKey: "AIzaSyA8MbZAP3FFBsSyModPezSvts51l8BPXKA",
      authDomain: "project-9154129149099457236.firebaseapp.com",
      databaseURL: "https://project-9154129149099457236.firebaseio.com",
      storageBucket: "project-9154129149099457236.appspot.com",
    };
    var db = firebase.initializeApp(config).database();

    // GeoFire: https://github.com/firebase/geofire-js/blob/master/docs/reference.md
    var geoFire = new GeoFire(db.ref("locations"));

    geoFireEvents();
    ///////////////////////////////////////////////////////////////////////////
    function currentLocation() {
      $scope.calculatingLocation = true;
      navigator.geolocation.getCurrentPosition(function(location){
        $timeout(function(){
          $scope.calculatingLocation = false;
          $scope.center=[location.coords.latitude, location.coords.longitude];
          updateCriteria($scope.center, $scope.radius);
        });
      });
    }

    function geoFireEvents() {
      // location from http://mygeoposition.com/
      geoQuery = geoFire.query({
        center: $scope.center,
        radius: $scope.radius
      });

      var onReadyRegistration = geoQuery.on("ready", function() {
        console.log("GeoQuery has loaded and fired all other events for initial data");
      });

      var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
        console.log(key + " entered query at " + location + " (" + distance + " km from center)");
        $timeout(function(){
          $scope.points[key]=location;
        });
      });

      var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
        console.log(key + " exited query to " + location + " (" + distance + " km from center)");
        $timeout(function(){
          delete $scope.points[key];
        });
      });

      var onKeyMovedRegistration = geoQuery.on("key_moved", function(key, location, distance) {
        $timeout(function(){
          $scope.points[key]=location;
        });
      });
    } // geoFireEvents

    function addPoint(location) {
      var key = Math.random().toString().substr(2,6);
      $scope.pointsLeft += 1;

      geoFire.set(key, location)
        .then(function(){
          console.log(key + " added at " + location + " at " + GeoFire.distance(location, geoQuery.center()) + " km from center");

          $timeout(function(){
            $scope.pointsLeft--;
          });
        })
        .catch(function(error){
          console.log(error);
        });
    }

    function removePoint(key) {
      geoFire.remove(key)
        .then(function(){
          console.log(key + " deleted");
        })
        .catch(function(error){
          console.log(error);
        });
    }

    function updateCriteria(center, radius) {
      geoQuery.updateCriteria({
        center: center,
        radius: radius
      });

      $scope.newPoint = center;
    }

    function addRamdonPoints(deltaLoc, numOfPoints) {
      $scope.pointsLeft += numOfPoints;

      for (var i=0; i<numOfPoints; i++) {
        var center = [0,0];
        center[0] = 2 * deltaLoc[0] * (Math.random() - 1/2) + $scope.center[0];
        center[0] = Math.min(90, center[0]);
        center[0] = Math.max(-90, center[0]);

        center[1] = 2 * deltaLoc[1] * (Math.random() - 1/2) + $scope.center[1];
        center[1] = Math.min(180, center[1]);
        center[1] = Math.max(-180, center[1]);

        console.log("adding " + i + " ot ouf " + numOfPoints + " ==> " + center );
        addPoint(center);
      }
    }
  });

})();
