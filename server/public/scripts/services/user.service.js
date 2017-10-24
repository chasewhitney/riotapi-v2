myApp.factory('UserService', function($http, $location){
  console.log('UserService Loaded');

  var uv = {};

  uv.extractPlayerData = function(arr){
    console.log('in extractPlayerData with:', arr);
    

  };


  return uv;

});
