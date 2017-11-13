"use strict";

angular.module('app.auth').directive('loginInfo', function(AuthService){

    return {
        restrict: 'A',
        templateUrl: 'app/auth/directives/login-info.tpl.html',
        link: function(scope, element){
            AuthService.getUser()
            .then(function(user){
                scope.user = user;
            },
            function(err){
            }
            );
        }
    }
})
