(function(){
  angular.module('foss4gapp',[])
  .controller('foss4gctrl', function($scope, $timeout){
    $scope.points = {};
    $scope.center = [0, 0];
    $scope.radius = 3;
    $scope.deltaPosition = [0.1, 0.1];
    $scope.newPoint = [0, 0];
    $scope.pointsLeft = 0;
    $scope.numOfPoints = 100;
    $scope.calculatingPosition = false;
    $scope.addPoint = addPoint;
    $scope.removePoint = removePoint;
    $scope.updateCriteria = updateCriteria;
    $scope.addRamdonPoints = addRamdonPoints;
    $scope.getCurrentPosition = getCurrentPosition;

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
    var geoFire = new GeoFire(db.ref("positions"));

    _setGeoFireEvents();

    ///////////////////////////////////////////////////////////////////////////
    function getCurrentPosition() {
      $scope.calculatingPosition = true;
      navigator.geolocation.getCurrentPosition(function(position){
        $timeout(function(){
          $scope.calculatingPosition = false;
          $scope.center=[position.coords.latitude, position.coords.longitude];
          updateCriteria($scope.center, $scope.radius);
        });
      });
    }

    function _setGeoFireEvents() {
      // position from http://mygeoposition.com/
      geoQuery = geoFire.query({
        center: $scope.center,
        radius: $scope.radius
      });

      var onReadyRegistration = geoQuery.on("ready", function() {
        console.log("GeoQuery has loaded and fired all other events for initial data");
      });

      var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, position, distance) {
        console.log(key + " entered query at " + position + " (" + distance + " km from center)");
        $timeout(function(){
          $scope.points[key]=position;
        });
      });

      var onKeyExitedRegistration = geoQuery.on("key_exited", function(key, position, distance) {
        console.log(key + " exited query to " + position + " (" + distance + " km from center)");
        $timeout(function(){
          delete $scope.points[key];
        });
      });

      var onKeyMovedRegistration = geoQuery.on("key_moved", function(key, position, distance) {
        $timeout(function(){
          $scope.points[key]=position;
        });
      });
    } // _setGeoFireEvents

    function addPoint(position) {
      var key = Math.random().toString().substr(2,6);
      $scope.pointsLeft += 1;

      geoFire.set(key, position)
        .then(function(){
          $timeout(function(){
            console.log("(" + $scope.pointsLeft + ")" + key + " added at " + position + " at " + GeoFire.distance(position, geoQuery.center()) + " km from center");
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

    function addRamdonPoints(deltaPosition, numOfPoints) {
      for (var i=0; i<numOfPoints; i++) {
        var center = [0,0];
        center[0] = 2 * deltaPosition[0] * (Math.random() - 1/2) + $scope.center[0];
        center[0] = Math.min(90, center[0]);
        center[0] = Math.max(-90, center[0]);

        center[1] = 2 * deltaPosition[1] * (Math.random() - 1/2) + $scope.center[1];
        center[1] = Math.min(180, center[1]);
        center[1] = Math.max(-180, center[1]);

        console.log("adding " + i + " ot ouf " + numOfPoints + " ==> " + center );
        addPoint(center);
      }
    }
  });

})();
