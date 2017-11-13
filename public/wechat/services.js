angular.module('app.wechat').
  factory('dataAPI', function ($http, $q) {

    var dataAPI = {};

    dataAPI.getPolicies = function () {
      var deferred = $q.defer();
      $http.get("../api/policies")
      // handle success
        .success(function (data, status) {
          if (status === 200) {
            deferred.resolve(data);
          } else {
            deferred.reject(status);
          }
        })
      // handle error
        .error(function (err) {
          deferred.reject(status);
        });

      // return promise object
      return deferred.promise;
    };

    return dataAPI;
  });