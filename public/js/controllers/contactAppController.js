/*global angular*/
/*global io*/
/*global contactApp*/
 
contactApp.controller('contactAppController', [ '$scope', '$http', 'socket', function($scope, $http, socket) {
    
    socket.on("get:return:contactList",function(data){
        $scope.contactList = data;
        $scope.contact = "";
    });
    
    socket.on("edit:return:contact", function(data){
        $scope.contact = data;
    });
    
    socket.on("put:updated:contactList", function(data){
        refresh();
    });
    
    var refresh = function()
    {
        // $http.get('/contactList').success(function(response){
        //   console.log("Received the data from node" + response);
        //   $scope.contactList = response;
        //   $scope.contact = "";
        // });
        
        socket.emit("get:request:contactList");
    }
    
    refresh();
    
     $scope.addContact = function()
     {
        socket.emit("post:contactList", $scope.contact);
        // $http.post('/contactList', $scope.contact).success(function(response){
        //   console.log(response);
        //   refresh();
        // });
        refresh();
     }
     
     $scope.remove = function(id)
     {
        // console.log(id);
        // $http.delete('/contactList/' + id).success(function(response){
        //     refresh();
        // });
        
        socket.emit("delete:contact", id);
        refresh();
     }
     
     $scope.edit = function(id)
     {
        //  console.log(id);
        //  $http.get('/contactList/' + id).success(function(response){
        //     $scope.contact = response; 
        //  });
         
         socket.emit("edit:getContact", id);
     }
     
     $scope.update = function()
     {
        //  console.log($scope.contact._id);
        //  $http.put('/contactList/' + $scope.contact._id, $scope.contact).success(function(response){
        //     refresh(); 
        //  });
         
         socket.emit("put:contactList", $scope.contact);
         //refresh();
     }
     
     $scope.deselect = function()
     {
         $scope.contact = "";
     }

}]);