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
                        if(user.userrole.policy_reminder.view){
                            $state.go('app.policy.reminder');
                        } if(user.userrole.policy_to_be_reviewed.append){
                            $state.go('app.policy.new1');
                        } else if(user.userrole.dealerPolicy_to_be_reviewed.append){
                            $state.go('app.policy.dealer.new');
                        } else if(user.userrole.lifePolicy_to_be_reviewed.append){
                            $state.go('app.life-policy.new');
                        }else if(user.userrole.property_policy_to_be_reviewed.append){
                            $state.go('app.property-policy.new');
                        }else if(user.userrole.policy_to_be_reviewed.view){
                            $state.go('app.policy.to-be-reviewed');
                        }else if(user.userrole.lifePolicy_to_be_reviewed.view){
                            $state.go('app.life-policy.to-be-reviewed');
                        }else if(user.userrole.dealerPolicy_to_be_reviewed.view){
                            $state.go('app.policy.dealer.to-be-reviewed');
                        }else if(user.userrole.property_policy_to_be_reviewed.view){
                            $state.go('app.property-policy.to-be-reviewed');
                        }
                        else
                        {
                            $state.go('app.policy.to-be-reviewed');
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
