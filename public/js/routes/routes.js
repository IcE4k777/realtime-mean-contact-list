/*global contactApp*/
contactApp.config(function($routeProvider){
   $routeProvider
    .when('/', {
        templateUrl: '../views/index.html'
    })
    //Protected
    .when('/contactApp', {
        resolve:{
          "check": function($location, $window){
              if(!$window.localStorage.token){
                  $location.path('/');
              }
          }  
        },
        templateUrl: '../views/contactApp.html' 
    })
    .when('/register',{
        templateUrl: '../views/registerForm.html'
    })
    .otherwise({
        redirectTo: '/'
    })
});