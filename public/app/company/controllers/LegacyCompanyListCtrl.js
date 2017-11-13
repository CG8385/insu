'use strict'

angular.module('app.company').controller('LegacyCompanyListController', function (screenSize, $rootScope, $state, $scope, CompanyService, localStorageService) {
    var vm = this;
    vm.companies = [];

    CompanyService.getCompanyCatogories()
        .then(function (companyCatogories) {
            vm.level1Companies = companyCatogories;
        })

    vm.refreshCompanies = function () {
        CompanyService.getCompanies()
          .then(function (companies) {
                vm.companies = companies;
         }, function (err) {

         });

    };

    vm.refreshCompanies();
    vm.view = function (companyId) {
        $state.go("app.company.view", { companyId: companyId });
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete = function (companyId) {
        $.SmartMessageBox({
            title: "删除保险公司",
            content: "确认删除该保险公司？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                CompanyService.deleteCompany(companyId)
                    .then(function () {
                        vm.refreshCompanies();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };


});
