/*global contactApp*/

contactApp.directive('recordAvailabilityValidator', ['$http', function($http) {

  return {
    require : 'ngModel',
    link : function(scope, element, attrs, ngModel) {
      var apiUrl = attrs.recordAvailabilityValidator;

      function setAsLoading(bool) {
        ngModel.$setValidity('recordLoading', !bool); 
      }

      function setAsAvailable(bool) {
        ngModel.$setValidity('recordAvailable', bool); 
      }

      ngModel.$parsers.push(function(value) {
        if(!value || value.length == 0) return;

        setAsLoading(true);
        setAsAvailable(true);

        $http.post(apiUrl, {inputValue : value})
          .success(function(data) 
          {
            console.log("status: " + data.status);
            
            if(data.status == "200")
            {
              console.log("user found");
              setAsLoading(false);
              setAsAvailable(false);
            }
            
            if(data.status == "204")
            {
              console.log("user not found");
              setAsLoading(false);
              setAsAvailable(true);
            }
            
          });

        return value;
      })
    }
  }
}]);