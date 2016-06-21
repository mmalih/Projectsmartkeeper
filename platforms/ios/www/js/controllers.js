angular.module('starter.controllers', [])

.controller('scanCtrl', function($scope,Camera) {
    $scope.Todo = ""; 
    $scope.getPhoto = function() {
        console.log('Getting camera');
        Camera.getPicture({
            quality: 100,
            targetWidth: 320,
            targetHeight: 320,
            saveToPhotoAlbum: false
            }).then(function(imageURI) {
            console.log(imageURI);
            $scope.lastPhoto = imageURI;
            }, function(err) {
            console.err(err);
            });}
})
  
.controller('fichiersCtrl', function($scope) {
    $scope.Todo = "Accès aux documents scannés à faire : https://www.airpair.com/ionic-framework/posts/ionic-file-browser-app";
})

;
