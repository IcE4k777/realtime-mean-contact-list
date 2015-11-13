/*global contactApp*/

//Extremely simple directive with no data being passed in via scope.
contactApp.directive('contactAppTable', function() {
  return {
    restrict: 'E',
    templateUrl: 'js/directives/contactAppTable.html'
  };
});