'use strict'

angular.module('app.company').controller('CompanyCatogoryEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, CompanyService) {
    var vm = this;
    vm.companyCatogory = {};
    
    
    vm.editable = false;

    if ($state.is("app.company.companycatogory.new")) {
        vm.editable = true;
    }



    var companyCatogoryId = $stateParams.companyCatogoryId;
    if (companyCatogoryId) {
        CompanyService.getCompanyCatogory(companyCatogoryId)
            .then(function (companyCatogory) {
                console.log(companyCatogory);
                vm.companyCatogory = companyCatogory;
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
        CompanyService.saveCompanyCatogory(vm.companyCatogory)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "一级保险公司已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.companyCatogory = {};
                if (vm.back) {
                    $state.go("app.company.companycatogory.all");
                }
            }, function (err) { });
    };



}); 

