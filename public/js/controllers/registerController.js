/*global contactApp*/
contactApp.controller('registerController', ['$scope', '$http', '$location', '$timeout', function($scope, $http, $location, $timeout){
    
    $scope.registerUser = function()
    {
        $http.post('/createUser', $scope.user).success(function(res){
           if(res.status == "200")
           {
             $scope.regInfo = "Registration Success!. Redirecting to login...";
             
             $timeout(function() {
                $location.path('/');
                }, 3000);
           }
           
           else
           {
               alert("Registration error. Please try again or contact the site administrator.");
           }
        });
    }
}]);

