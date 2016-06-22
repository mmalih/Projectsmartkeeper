angular.module('starter.controllers', ['ngSanitize'])

.controller('scanCtrl', function($scope,$rootScope,Camera,$ionicPopup,$fileFactory,$ionicPlatform,$document) {
    //TODO voir comment cette merde de ionic plateform ready fonctionne
    $ionicPlatform.ready(function(){
        var fs = new $fileFactory();
        var dossierStockageParent = cordova.file.dataDirectory;
        var nomDossierStockage = "Scanned";
        var dossierStockage = dossierStockageParent+nomDossierStockage;

        //Création du dossier s'il n'existe pas...
        window.resolveLocalFileSystemURL(dossierStockageParent, function (dirEntry) {
            dirEntry.getDirectory(nomDossierStockage, { create: true }, function () {});
        });

        $scope.getPhoto = function() {
            console.log('Getting camera');
            Camera.getPicture({
                quality: 100,
                targetWidth: 320,
                targetHeight: 320,
                saveToPhotoAlbum: false
                })
            .then(function(imageURI) {
                
                console.log(imageURI);
                fs.getEntries(dossierStockage).then(function(result) { 
                    $scope.data = {};
                    var templatePopup = '<span>Nom : </span><input id="documentName" type="text" ng-model="data.documentName"/></br><span>Catégorie : </span></br><button id="button" ng-click="showInput()" style="padding:0px" class="button button-icon icon ion-ios-plus-outline"/></button><select id="select" style="display:block;padding:8px;width:100%;border:none;background:none" ng-model=data.category><option value=""></option>';
                    for(var i = 0; i < result.length; i++) {
                        templatePopup += '<option value="'+result[i].nativeURL+'">'+result[i].name+'</option>';
                    }
                    templatePopup += '</select><input style="display:none" id="text" type="text" ng-model="data.newCategory"/>';

                    $ionicPopup.show({
                        template: templatePopup,
                        title: 'Entrer les informations votre document',
                        scope: $scope,
                        buttons: [
                            { text: 'Annuler' },
                            {
                                text: '<b>OK</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    var documentName = document.getElementById('documentName').value;
                                    var newCategory = document.getElementById('text').value;
                                    var category = document.getElementById('select').options[document.getElementById('select').selectedIndex].value;
                                    if (documentName =="" || (newCategory=="" && category=="")) {
                                        //don't allow the user to close unless he enters wifi password
                                        e.preventDefault();
                                    } 
                                    else {

                                        $scope.data.documentName = documentName;
                                        $scope.data.newCategory = newCategory;
                                        $scope.data.category = category;

                                        if($scope.data.newCategory != "")
                                        {
                                            var alreadyExist = false;
                                            for (var i = 0; i < result.length; i++) {
                                                if(result[i].name.toLowerCase() == $scope.data.newCategory.toLowerCase())
                                                {
                                                    alreadyExist = true;
                                                    break;
                                                }
                                            }

                                            if(alreadyExist == false)
                                            {
                                                window.resolveLocalFileSystemURL(dossierStockage, function (dirEntry) {
                                                    dirEntry.getDirectory($scope.data.newCategory, { create: true }, function () {
                                                        fs.getEntries(dossierStockage).then(function(result) {
                                                            $rootScope.files = result;
                                                        }, function(error) {
                                                            console.error(error);
                                                        });
                                                        //On bouge le fichier dans la bonne catégorie
                                                        var nameImg = imageURI.split("/")[imageURI.split("/").length - 1];
                                                        var folderImg = imageURI.replace(nameImg,"");
                                                        var formatEnregistrement = ".jpg";
                                                         window.resolveLocalFileSystemURL(folderImg, function(dir) {
                                                            dir.getFile(nameImg, {create:false}, function(fileEntry) {
                                                                window.resolveLocalFileSystemURL(dossierStockage+'/'+$scope.data.newCategory, function(dirEnregistrement) {
                                                                    fileEntry.moveTo(dirEnregistrement,$scope.data.documentName+formatEnregistrement,function(){
                                                                        $ionicPopup.alert({
                                                                            title: 'Enregistré',
                                                                            template: 'Votre document a été enregistré avec succès !'
                                                                        });
                                                                    },
                                                                    function(err){
                                                                        $ionicPopup.alert({
                                                                            title: 'ERREUR',
                                                                            template: 'Impossible d\'enregistrer le fichier...'
                                                                        });
                                                                    });
                                                                },
                                                                function(err){
                                                                    $ionicPopup.alert({
                                                                            title: 'ERREUR',
                                                                            template: 'Impossible d\'enregistrer le fichier...'
                                                                        });
                                                                });
                                                            },
                                                            function(err){
                                                                $ionicPopup.alert({
                                                                        title: 'ERREUR',
                                                                        template: 'Impossible d\'enregistrer le fichier...'
                                                                    });
                                                            })
                                                         },
                                                         function(err){
                                                             $ionicPopup.alert({
                                                                        title: 'ERREUR',
                                                                        template: 'Impossible d\'enregistrer le fichier...'
                                                                    });
                                                         });
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
                                            }
                                            else{
                                                    e.preventDefault();
                                                    $ionicPopup.alert({
                                                            title: 'ERREUR',
                                                            template: 'Cette catégorie existe déjà...'
                                                        });
                                            }
                                        }
                                        else
                                        {
                                            return $scope.data;
                                        }
                                        
                                    }
                                }
                            }
                        ]
                    })
                    .then(function(res) {
                        var documentName = res.documentName;
                        var category = res.category;

                        //On bouge le fichier dans la bonne catégorie
                        var nameImg = imageURI.split("/")[imageURI.split("/").length - 1];
                        var folderImg = imageURI.replace(nameImg,"");   
                        var formatEnregistrement = ".jpg";
                        window.resolveLocalFileSystemURL(folderImg, function(dir) {
                             dir.getFile(nameImg, {create:false}, function(fileEntry) {
                                window.resolveLocalFileSystemURL(category, function(dirEnregistrement) {
                                    fileEntry.moveTo(dirEnregistrement,documentName+formatEnregistrement,function(){
                                        $ionicPopup.alert({
                                            title: 'Enregistré',
                                            template: 'Votre document a été enregistré avec succès !'
                                         });
                                     },
                                     function(err){
                                          $ionicPopup.alert({
                                             title: 'ERREUR',
                                            template: 'Impossible d\'enregistrer le fichier...'
                                            });
                                      });
                                },
                                 function(err){
                                    $ionicPopup.alert({
                                         title: 'ERREUR',
                                        template: 'Impossible d\'enregistrer le fichier...'
                                     });
                                });
                            },
                           function(err){
                                $ionicPopup.alert({
                                        title: 'ERREUR',
                                        template: 'Impossible d\'enregistrer le fichier...'
                                    });
                            })
                        },
                         function(err){
                            $ionicPopup.alert({
                                title: 'ERREUR',
                                template: 'Impossible d\'enregistrer le fichier...'
                            });
                        });
                    });
                },function(err){

                });
                
            }, function(err) {
                    console.err(err);
            });
        };
        $scope.showInput = function(){
            var inputText = document.getElementById('text');
            var inputSelect = document.getElementById('select');
            var inputButton = document.getElementById('button');
            if(inputText.style.display=="none")
            {
                inputButton.classList.remove("ion-ios-plus-outline");
                inputButton.classList.add("ion-ios-minus-outline");
                inputText.style.display="block";
                inputSelect.style.display="none";
                inputSelect.options[inputSelect.selectedIndex].selected="";
            }
            else
            {
                inputButton.classList.remove("ion-ios-minus-outline");
                inputButton.classList.add("ion-ios-plus-outline");
                inputText.style.display="none";
                inputText.value="";
                inputSelect.style.display="block";
            }
        };
    });

})
  
.controller("categoriesCtrl", function($scope, $rootScope, $ionicPlatform, $fileFactory, $sce, $ionicPopup) {

    $ionicPlatform.ready(function() {
        var fs = new $fileFactory();
        var dossierStockageParent = cordova.file.dataDirectory;
        var nomDossierStockage = "Scanned";
        var dossierStockage = dossierStockageParent+nomDossierStockage;

        //Création du dossier s'il n'existe pas...
        window.resolveLocalFileSystemURL(dossierStockageParent, function (dirEntry) {
            dirEntry.getDirectory(nomDossierStockage, { create: true }, function () {});
        });

        fs.getEntries(dossierStockage).then(function(result) {
            $rootScope.files = result;
        }, function(error) {
            console.error(error);
        });

        $scope.getFilesOfACategory = function(path) {

            fs.getEntries(path).then(function(result) {
                $rootScope.files = result;
                if(path !== dossierStockage)
                    $rootScope.files.unshift({name: "...", nativeURL: dossierStockage, isDirectory:true});
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
                var alreadyExist = false;
                for (var i = 0; i < $rootScope.files.length; i++) {
                    if($rootScope.files[i].name.toLowerCase() == res.toLowerCase())
                    {
                        alreadyExist = true;
                        break;
                    }
                }

                if(alreadyExist == false)
                {
                    window.resolveLocalFileSystemURL(dossierStockage, function (dirEntry) {
                        dirEntry.getDirectory(res, { create: true }, function () {
                            fs.getEntries(dossierStockage).then(function(result) {
                                $rootScope.files = result;
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
                    }
                    else{
                        $ionicPopup.alert({
                                title: 'ERREUR',
                                template: 'Cette catégorie existe déjà...'
                            });
                    }
                }); 
            };

            $scope.deleteCategory = function(path){
                window.resolveLocalFileSystemURL(path, function (dirEntry) {
                    dirEntry.removeRecursively(function () {
                        fs.getEntries(dossierStockage).then(function(result) {
                            $rootScope.files = result;
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
                                    $rootScope.files = result;
                                    $rootScope.files.unshift({name: "...", nativeURL: dossierStockage, isDirectory:true});
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

            $scope.readFile = function(path){
                //TODO
                var open = cordova.plugins.disusered.open;

                function success() {
                }

                function error(code) {
                    $ionicPopup.alert({
                                    title: 'ERREUR',
                                    template: 'Impossible d\'ouvrir le fichier...'
                                });
                }

                open(path, success, error);
            };
    });

})

;
