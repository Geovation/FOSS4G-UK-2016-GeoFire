(function(){
  angular.module('foss4gapp',[])
  .controller('foss4gctrl', function($scope, $timeout){
    $scope.points = {};
    $scope.center = [0, 0];
    $scope.radius = 3;
    $scope.pmlat = 0.1;
    $scope.pmlon = 0.1;
    $scope.lat = 0;
    $scope.lon = 0;
    $scope.left = 0;
    $scope.amount = 100;
    $scope.calculatingLocation = false;
    $scope.add = add;
    $scope.remove = remove;
    $scope.update = update;
    $scope.addRamdon = addRamdon;
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
          update($scope.center, $scope.radius);
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

    function add(loc) {
      var key = "" + Math.floor(Math.random()*10000000);
      geoFire.set(key, loc)
        .then(function(){
          console.log(key + " added at " + loc + " at " + GeoFire.distance(loc, geoQuery.center()) + " km from center");
        })
        .catch(function(error){
          console.log(error);
        });
    }

    function remove(key) {
      geoFire.remove(key)
        .then(function(){
          console.log(key + " deleted");
        })
        .catch(function(error){
          console.log(error);
        });
    }

    function update(center, radius) {
      geoQuery.updateCriteria({
        center: center,
        radius: radius
      });

      $scope.lat = center[0];
      $scope.lon = center[1];
    }

    function addRamdon(pmlat, pmlon, amount) {
      $scope.left = amount;

      for (var i=0; i<amount; i++) {
        var lat = 2 * pmlat * (Math.random() - 1) + $scope.center[0];
        var lon = 2 * pmlon * (Math.random() - 1) + $scope.center[1];
        if (lat > 90) lat = 90;
        if (lat < -90) lat = -90;
        if (lon > 180) lat = 180;
        if (lon < -180) lat = -180;

        var key = "" + Math.floor(Math.random()*10000000);

        console.log("adding " + i + " ==> [" + [lat, lon] + "]");
        geoFire.set(key, [lat, lon])
        .then(function(i, lat, lon){return function(){
          console.log(i + " => [" + [lat, lon] + "] added");
          $timeout(function(){
            $scope.left--;
          });
        }}(i, lat,lon))
        .catch(function(error){
          console.error(error);
        });
      }
    }
  });

})();
