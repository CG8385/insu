'use strict'

angular.module('app.employee').controller('RoleListController', function(screenSize, $rootScope, $state, $scope, EmployeeService){
    var vm = this;
    vm.roles = [];



    vm.refreshRoles = function(){
       EmployeeService.getRoles()
       .then(function(roles){
           vm.roles = roles;
       }, function(err){
           
       });
    };
    
    vm.refreshRoles();
	
    vm.view = function(roleId){
        $state.go("app.employee.role.view", {roleId: roleId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (roleId) {
        $.SmartMessageBox({
            title: "删除角色",
            content: "确认删除该角色？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                EmployeeService.deleteRole(roleId)
                    .then(function(){
                        vm.refreshRoles();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
    

});
