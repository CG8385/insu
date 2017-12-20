'use strict'

angular.module('app.employee').controller('DealerEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, EmployeeService) {
    var vm = this;
    vm.user = {};
    vm.editable = false;
    vm.organizations=[];

    EmployeeService.getClients()
        .then(function (clients) {
            vm.clients = clients;
        })


    if ($state.is("app.employee.dealer.new")) {
        vm.editable = true;
    }



    var userId = $stateParams.userId;
    if (userId) {
        EmployeeService.getUser(userId)
            .then(function (user) {
                vm.user = user;
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
        vm.user.role="渠道录单员";
        vm.user.name = vm.clients.filter(c=>c._id==vm.user.client)[0].name;
        EmployeeService.saveUser(vm.user)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "用户已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.user = {};
                if (vm.back) {
                    $state.go("app.employee.dealer");
                }
            }, function (err) { });
    };



}); 

