/**
 * Created by CWang11 on 3/29/2016.
 */
'use strict';
/**
 * @ngdoc function
 * @name myApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myApp
 */
angular.module('app.auth').controller('ChangePasswordCtrl',
    ['$rootScope','$scope', '$state', 'AuthService',
        function ($rootScope,$scope, $state, AuthService) {

            var vm = this;
            vm.password= "";
            vm.newPassword="";
            vm.confirmPassword="";
            vm.submit = function () {
                // initial values
                $scope.error = false;

                if(vm.newPassword != vm.confirmPassword){
                    $.bigBox({
                        title: "修改密码",
                        content: "两次密码输入不一致",
                        color: "#C46A69",
                        icon: "fa fa-warning shake animated",
                        timeout: 6000
                    });
                    return;
                }
                // call login from service
                AuthService.changePassword(vm.password, vm.newPassword)
                    // handle success
                    .then(function(data) {
                        if(data.status == "success"){
                            $.smallBox({
                                title: "服务器确认信息",
                                content: "密码已成功修改",
                                color: "#739E73",
                                iconSmall: "fa fa-check",
                                timeout: 5000
                            });
                            vm.password= "";
                            vm.newPassword="";
                            vm.confirmPassword="";
                            $state.go('app.policy.to-be-paid');
                        }
                    },
                    function(err){
                        $scope.error = true;
                        $scope.errorMessage = err;
                    }
                )
                    // handle error
                    .catch(function () {
                        $scope.error = true;
                        $scope.errorMessage = "更新密码失败";
                        $scope.disabled = false;
                        //vm.username= "";
                        // vm.password= "";
                    });

            };
        }]);
