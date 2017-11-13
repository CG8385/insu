'use strict'

angular.module('app.employee').controller('SellerListController', function(screenSize, $rootScope, $state, $scope, EmployeeService){
    var vm = this;
    vm.users = [];



    vm.refreshUsers = function(){
       EmployeeService.getSellers()
       .then(function(users){
           vm.users = users;
       }, function(err){
           
       });
    };
    
    vm.refreshUsers();
	
    vm.view = function(userId){
        $state.go("app.employee.seller.view", {userId: userId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (userId) {
        $.SmartMessageBox({
            title: "删除账号",
            content: "确认删除该用户？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                EmployeeService.deleteUser(userId)
                    .then(function(){
                        vm.refreshUsers();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
    

});
