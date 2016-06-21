angular.module('starter.controllers', ['ngSanitize'])

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
  
.controller("categoriesCtrl", function($scope, $ionicPlatform, $fileFactory, $sce, $ionicPopup) {

    var fs = new $fileFactory();
    var dossierStockageParent = cordova.file.dataDirectory;
    var nomDossierStockage = "Scanned";
    var dossierStockage = dossierStockageParent+nomDossierStockage;

    //Création du dossier s'il n'existe pas...
    window.resolveLocalFileSystemURL(dossierStockageParent, function (dirEntry) {
        dirEntry.getDirectory(nomDossierStockage, { create: true }, function () {});
    });

    dossierStockage="file:///storage/emulated/0/Android/data/com.ionicframework.smartkeeper910580/"; //ligne à supprimer

    $ionicPlatform.ready(function() {
        fs.getEntries(dossierStockage).then(function(result) {
            $scope.files = result;
        }, function(error) {
            console.error(error);
        });

        $scope.getFilesOfACategory = function(path) {

            fs.getEntries(path).then(function(result) {
                $scope.files = result;
                if(path !== dossierStockage)
                    $scope.files.unshift({name: "...", nativeURL: dossierStockage, isDirectory:true});
            });
        };

        $scope.addCategory = function() {
            // A ecrire : POPUP 
            $scope.data = {};
            $ionicPopup.show({
                template: '<input type="text" ng-model="data.categoryName">',
                title: 'Entrer le nom de votre catégorie',
                scope: $scope,
                buttons: [
                { text: 'Retour' },
                {
                    text: '<b>Ajouter</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                    if (!$scope.data.categoryName) {
                        //don't allow the user to close unless he enters wifi password
                        e.preventDefault();
                    } else {
                        return $scope.data.categoryName;
                    }
                    }
                }
                ]
            })
            .then(function(res) {
                window.resolveLocalFileSystemURL(dossierStockage, function (dirEntry) {
                    dirEntry.getDirectory(res, { create: true }, function () {
                        fs.getEntries(dossierStockage).then(function(result) {
                            $scope.files = result;
                        }, function(error) {console.error(error);});
                    },
                    function(err){
                        //ERROR create directory
                        $ionicPopup.alert({
                            title: 'ERREUR',
                            template: 'Impossible de créer la catégorie...'
                        });
                    });
                    },
                    function(err){
                        //ERROR RESOLVE FILE
                        $ionicPopup.alert({
                            title: 'ERREUR',
                            template: 'Impossible de créer la catégorie...'
                        });
                    });
                }); 
            };

            $scope.deleteCategory = function(path){
                window.resolveLocalFileSystemURL(path, function (dirEntry) {
                    dirEntry.removeRecursively(function () {
                        fs.getEntries(dossierStockage).then(function(result) {
                            $scope.files = result;
                        }, function(error) {console.error(error);});
                    },
                    function(err){
                        $ionicPopup.alert({
                            title: 'ERREUR',
                            template: 'Impossible de supprimer la catégorie...'
                        });
                    });
                },
                function(err){
                    $ionicPopup.alert({
                            title: 'ERREUR',
                            template: 'Impossible de supprimer la catégorie...'
                        });
                });
            };

            $scope.deleteFile = function(path,fileName){
                path = path.replace(fileName,"");
                window.resolveLocalFileSystemURL(path, function(dir) {
                    dir.getFile(fileName, {create:false}, function(fileEntry) {
                            fileEntry.remove(function(){
                                fs.getEntries(path).then(function(result) {
                                    $scope.files = result;
                                    $scope.files.unshift({name: "...", nativeURL: dossierStockage, isDirectory:true});
                                }, function(error) {console.error(error);});
                            },function(error){
                                // Error deleting the file
                                $ionicPopup.alert({
                                    title: 'ERREUR',
                                    template: 'Impossible de supprimer le fichier...'
                                });
                            });
                    },
                    function(err){
                        $ionicPopup.alert({
                                    title: 'ERREUR',
                                    template: 'Impossible de supprimer le fichier...'
                                });
                    });
                }, 
                function(err){
                    $ionicPopup.alert({
                                    title: 'ERREUR',
                                    template: 'Impossible de supprimer le fichier...'
                                });
                });
            };

            $scope.readFile = function(path){};
    });

})

;
