/*global angular*/
/*global contactApp*/
 
contactApp.controller('contactAppController', [ '$scope', '$http', '$window', 'socket', function($scope, $http, $window, socket) {
    
    //We must authenticate to the server within 5 seconds or the socket connection will close.
    socket.emit('authenticate', $window.localStorage.token);
    
    socket.on("get:return:contactList",function(data){
        $scope.contactList = data;
        console.log("CONTACT DATA: " + data);
        $scope.contact = "";
    });
    
    socket.on("edit:return:contact", function(data){
        $scope.contact = data;
    });
    
    socket.on("put:updated:contactList", function(data){
        refresh();
    });
    
    socket.on("connectedClientsUpdate", function(data){
       console.log(JSON.stringify(data)); 
       $scope.connectedUsers = data;
    });
    
    socket.on('connect', function(data){
       console.log("connected"); 
    });
    
    socket.emit("testMessage");
    
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