angular.module('conFusion.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo', '{}');

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      $localStorage.storeObject('userinfo', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };

    // Registration Modal
    $scope.registration = {};

    $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.registerform = modal;
    });

    $scope.register = function () {
      $scope.registerform.show();
    };
    $scope.closeRegister = function () {
      $scope.registerform.hide();
    };
    $scope.doRegister = function () {
      console.log('Doing Registration', $scope.registration);

      $timeout(function () {
        $scope.closeRegister();
      }, 1000);
    };

    $ionicPlatform.ready(function () {
      var optionsTakePic = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $scope.takePicture = function () {
        $cordovaCamera.getPicture(optionsTakePic).then(function (imageData) {
          $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
          $scope.registerform.show();
        }, function (err) {
          console.log(err);
        });
      };

      var optionsselectPic = {
        maximumImagesCount: 1,
        width: 100,
        height: 100,
        quality: 50
      };

      $scope.selectPicture = function () {
        $cordovaImagePicker.getPictures(optionsselectPic)
          .then(function (results) {
            for (var i = 0; i < results.length; i++) {
              $scope.registration.imgSrc = results[i];
            }
            $timeout(function () {
              $scope.registerform.show();
            }, 500);
          }, function (err) {
            console.log(err);
          });
      };

    });

    // Form data for reservation
    $scope.reservation = {};

    $ionicModal.fromTemplateUrl('templates/reserve.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.reserveForm = modal;
    });

    $scope.closeReserve = function () {
      $scope.reserveForm.hide();
    };

    $scope.reserve = function () {
      $scope.reserveForm.show();
    };

    $scope.doReserve = function () {

      console.log("Do Reserve ", $scope.reservation);

      $timeout(function () {
        $scope.closeReserve();
      }, 1000);
    };

  })
  .controller('MenuController', ['$scope', 'dishes', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function($scope, dishes, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';

    $scope.dishes = dishes;


    $scope.select = function(setTab) {
      $scope.tab = setTab;

      if (setTab === 2) {
        $scope.filtText = "appetizer";
      }
      else if (setTab === 3) {
        $scope.filtText = "mains";
      }
      else if (setTab === 4) {
        $scope.filtText = "dessert";
      }
      else {
        $scope.filtText = "";
      }
    };

    $scope.isSelected = function (checkTab) {
      return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function() {
      $scope.showDetails = !$scope.showDetails;
    };

    $scope.addFavorite = function (index) {
      console.log("Index is " + index);

      favoriteFactory.addToFavorites(index);
      $ionicListDelegate.closeOptionButtons();

      $ionicPlatform.ready(function () {

        $cordovaLocalNotification.schedule({
          id: 1,
          title: "Added Favorite",
          text: $scope.dishes[index].name
        }).then(function () {
          console.log("Added Favorite" + $scope.dishes[index].name);
        }, function () {
          console.log("Failed to add Favorite");
        });

        $cordovaToast
          .show('Added Favorite ' + $scope.dishes[index].name, 'long', 'center')
          .then(function (success) {
            // Success
          }, function (error) {
            // Error
          });

      });
    };

  }])

  .controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', '$cordovaVibration', '$ionicPlatform', function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $cordovaVibration, $ionicPlatform) {

    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    $scope.favorites = favorites;

    /*$ionicLoading.show({
      template: '<ion-spinner></ion-spinner>Loading...'
    });*/

    $scope.dishes = dishes;

    console.log($scope.dishes, $scope.favorites);

    $scope.toggleDelete = function () {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
      console.log($scope.shouldShowDelete);
    };

    $scope.deleteFavorite = function (index) {

      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm Delete',
        template: 'Are you sure you want to delete this item?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log('Ok to delete');
          favoriteFactory.deleteFromFavorites(index);
          $ionicPlatform.ready(function () {
            $cordovaVibration.vibrate(100);
          });
        } else {
          console.log("Delete Cancelled");
        }
      });

      $scope.shouldShowDelete = false;
    };

  }])

  .controller('ContactController', ['$scope', function($scope) {

    $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };

    var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {

    $scope.sendFeedback = function() {

      console.log($scope.feedback);

      if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
        $scope.invalidChannelSelection = true;
        console.log('incorrect');
      }
      else {
        $scope.invalidChannelSelection = false;
        feedbackFactory.save($scope.feedback);
        $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
        $scope.feedback.mychannel="";
        $scope.feedbackForm.$setPristine();
        console.log($scope.feedback);
      }
    };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory', 'favoriteFactory', 'baseURL', '$ionicPopover', '$ionicModal', '$cordovaToast', '$cordovaLocalNotification', '$ionicPlatform', '$cordovaSocialSharing', function($scope, $stateParams, dish, menuFactory, favoriteFactory, baseURL, $ionicPopover, $ionicModal, $cordovaToast,$cordovaLocalNotification, $ionicPlatform, $cordovaSocialSharing) {

    $scope.baseURL = baseURL;
    $scope.dish = {};

    $scope.dish = dish;

    $scope.popover = $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
    });

    $scope.showPopover = function ($event) {
      $scope.popover.show($event);
    };

    $scope.addFavorite = function (index) {
      console.log("Index is " + index);

      favoriteFactory.addToFavorites(index);
      $scope.popover.hide();

      $ionicPlatform.ready(function () {
        $cordovaToast.showLongCenter(dish.name + ' Added to Favorites');

        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Added Favorite',
          text: dish.name
        }).then(function (success) {
          // Success
        }, function (err) {
          // Error
        });
      });

    };

    $scope.shareDish = function () {
      $ionicPlatform.ready(function () {
        var opt = {
          msg: 'Checkout this yummy dish',
          subject: dish.name,
          //file: baseURL + dish.image,
          link: baseURL + 'dishes/' + dish.id
        };
        $cordovaSocialSharing.share(opt.msg, opt.subject, null, opt.link);
      });
    };

    // Dish Comment data and modal
    $scope.comment = {};

    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.commentForm = modal;
    });

    $scope.addComment = function () {
      $scope.commentForm.show();
      $scope.popover.hide();
    };

    $scope.closeComment = function () {
      $scope.commentForm.hide();
    };

    $scope.submitComment = function () {
      $scope.comment.date = new Date().toISOString();
      console.log($scope.comment);
      $scope.dish.comments.push($scope.comment);
      menuFactory.update({id:$scope.dish.id}, $scope.dish);

      $scope.commentForm.hide();

    };

  }])

  .controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {

    $scope.mycomment = {rating:5, comment:"", author:"", date:""};

    $scope.submitComment = function () {

      $scope.mycomment.date = new Date().toISOString();
      console.log($scope.mycomment);

      $scope.dish.comments.push($scope.mycomment);
      menuFactory.update({id:$scope.dish.id},$scope.dish);

      $scope.commentForm.$setPristine();

      $scope.mycomment = {rating:5, comment:"", author:"", date:""};
    }
  }])

  // implement the IndexController and About Controller here

  .controller('IndexController', ['$scope', 'dish', 'leader', 'promotion', 'baseURL', function($scope, dish, leader, promotion, baseURL) {

    $scope.baseURL = baseURL;
    $scope.leader = leader;
    $scope.dish = dish;
    $scope.promotion = promotion;

  }])

  .controller('AboutController', ['$scope', 'leaders', 'baseURL', function($scope, leaders, baseURL) {

    $scope.baseURL = baseURL;
    $scope.leaders = leaders
    console.log($scope.leaders);

  }])
  .filter('favoriteFilter', function () {

    return function (dishes, favorites) {
      var out = [];

      for (var i = 0; i < favorites.length; i++) {
        for (var j = 0; j < dishes.length; j++) {
          if (dishes[j].id == favorites[i].id)
            out.push(dishes[j]);
        }
      }

      return out;
    };

  })

;
