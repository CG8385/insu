'use strict'

angular.module('app.life-policy').controller('LifeSalaryEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, LifePolicyService) {
    var vm = this;
    vm.salary = {};
    vm.managerInfo = {};
    vm.sellerInfo = $rootScope.user;
    LifePolicyService.getManagers()
        .then(function (managers) {
            vm.managers = managers;
        })
    LifePolicyService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })

    vm.editable = false;
    if ($state.is("app.life-policy.salary.new")) {
        vm.editable = true;
        var today = new Date();
        vm.salary.year = today.getFullYear().toString();
        vm.salary.month = (today.getMonth()+1).toString();
    }



    var salaryId = $stateParams.salaryId;
    if (salaryId) {
        LifePolicyService.getSalary(salaryId)
            .then(function (salary) {
                vm.salary = salary;
                vm.managerInfo = salary.manager;
                vm.sellerInfo = salary.seller;
                salary.manager = salary.manager._id;
                salary.seller = salary.seller._id;
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
        vm.salary.manager = vm.managerInfo._id;
        LifePolicyService.saveSalary(vm.salary)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "薪酬结算单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.salary = {};
                if (vm.back) {
                    $state.go("app.life-policy.salary.list");
                }
            }, function (err) { });
    };

    vm.updateFee = function () {
        
        if(vm.salary.branch_salary && vm.salary.area_salary){
            vm.salary.salary_total = parseFloat(vm.salary.branch_salary) + parseFloat(vm.salary.area_salary);
            vm.salary.taxed_salary_total = (vm.salary.salary_total * 0.95).toFixed(2);
        }
    }
});

