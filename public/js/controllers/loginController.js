/*global contactApp*/

contactApp.controller('loginController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location){
    
    $scope.login = function()
    {
        $http.post('/authenticate', $scope.user).success(function(response){
            
            if(response.token)
            {
                console.log(response.token);
                $window.localStorage.token = response.token;
                $location.path('/contactApp');
                
            }
            
            if(response.message == "username")
            {
                clearInputs();
                $scope.invalidUsername = "Invalid Username";
            }
            
            if(response.message =="password")
            {
                clearInputs();
                $scope.invalidPassword = "Invalid Password";
            }
        });
    }
    
    var clearInputs = function()
    {
        $scope.user.username="";
        $scope.user.password="";    
    }
    
    $scope.clearInvalidWarning = function()
    {
        $scope.invalidUsername="";
        $scope.invalidPassword="";
    }
    
}]);