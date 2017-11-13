'use strict';
/**
 * @ngdoc function
 * @name myApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myApp
 */
angular.module('app.auth').controller('AuthCtrl',
    ['$rootScope','$scope', '$state', 'AuthService',
        function ($rootScope,$scope, $state, AuthService) {

            var vm = this;
            vm.username= "";
            vm.password= "";
            vm.login = function () {
                // initial values
                $scope.error = false;
                $scope.disabled = true;
                // call login from service
                AuthService.login(vm.username, vm.password)
                    // handle success
                    .then(function(user) {
                        $rootScope.user = user;
                        if(user.role == "出单员"){
                            $state.go('app.policy.new1');
                        }else
                        {
                            $state.go('app.policy.to-be-reviewed');
                            // $state.go('app.policy.to-be-paid');
                        }
                        
                        $scope.disabled = false;
                        vm.username= "";
                        vm.password= "";
                    },
                    function(err){
                        $scope.error = true;
                        $scope.errorMessage = "账号或密码错误";
                    }
                    )
                    // handle error
                    .catch(function () {
                        $scope.error = true;
                        $scope.errorMessage = "账号或密码错误";
                        $scope.disabled = false;
                        //vm.username= "";
                        // vm.password= "";
                    });

            };
        }]);
