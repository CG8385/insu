'use strict'

angular.module('app.employee').controller('RoleEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, EmployeeService) {
    var vm = this;
    vm.role = {};
    vm.editable = false;
    vm.scopes = ["本人","全公司"];
    vm.organization_scopes = ["无","一级","二级","三级","四级","五级"];
    vm.company_scope = ["全国","本区域"];

    if ($state.is("app.employee.role.new")) {
        vm.editable = true;
    }



    var roleId = $stateParams.roleId;
    if (roleId) {
        EmployeeService.getRole(roleId)
            .then(function (role) {
                vm.role = role;
            });
    }
    
    


    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.submit = function () {
        EmployeeService.saveRole(vm.role)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "角色已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.role = {};
                if (vm.back) {
                    $state.go("app.employee.role");
                }
            }, function (err) { });
    };



}); 

