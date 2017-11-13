'use strict'

angular.module('app.company').controller('LegacyCompanyEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, CompanyService) {
    var vm = this;
    vm.company = {};
    vm.companyCatogories = [];
    vm.editable = false;


    CompanyService.getCompanyCatogories()
        .then(function (companyCatogories) {
            vm.companyCatogories = companyCatogories;
        })



    if ($state.is("app.company.new")) {
        vm.editable = true;
    }



    var companyId = $stateParams.companyId;
    if (companyId) {
        CompanyService.getCompany(companyId)
            .then(function (company) {
                vm.company = company;
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
        CompanyService.saveCompany(vm.company)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "保险公司已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.company = {};
                if (vm.back) {
                   $state.go("app.company.all");  
                }
            }, function (err) { });
    };



});

