'use strict'

angular.module('app.company').controller('PolicyNameEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, CompanyService) {
    var vm = this;
    vm.policyName = {};
    
    
    vm.editable = false;

    if ($state.is("app.company.policyname.new")) {
        vm.editable = true;
    }



    var policyNameId = $stateParams.policyNameId;
    if (policyNameId) {
        CompanyService.getPolicyName(policyNameId)
            .then(function (policyName) {
                vm.policyName = policyName;
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
        CompanyService.savePolicyName(vm.policyName)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "险种名称已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.companyCatogory = {};
                if (vm.back) {
                    $state.go("app.company.policyname.all");
                }
            }, function (err) { });
    };



}); 

