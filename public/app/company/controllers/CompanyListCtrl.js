'use strict'

angular.module('app.company').controller('CompanyListController', function (screenSize, $rootScope, $state, $scope, CompanyService, localStorageService) {
    var vm = this;
    vm.companies = [];
    vm.level1Companies = [];
    vm.level2Companies = [];
    vm.setting = {};
    vm.settingString = "";



    if ($state.is("app.company.company2.all")) {
        vm.level = "二级";
        vm.settingString = "level2Settings";
    }
    else if ($state.is("app.company.company3.all")) {
        vm.level = "三级";
        vm.settingString = "level3Settings";
    } else if ($state.is("app.company.company4.all")) {
        vm.level = "四级";
        vm.settingString = "level4Settings";
    }
    vm.setting = localStorageService.get(vm.settingString) ? localStorageService.get(vm.settingString) : {};

    CompanyService.getCompanyCatogories()
        .then(function (companyCatogories) {
            vm.level1Companies = companyCatogories;
        })


    vm.loadLevel2Companies = function () {
        if (!vm.setting.level1Company) {
            vm.level2Companies = [];
        } else {
            CompanyService.getSubCompanies(vm.setting.level1Company)
                .then(function (level2Companies) {
                    vm.level2Companies = level2Companies;
                }, function (err) {

                });
        }
    }

    vm.loadLevel3Companies = function () {
        if (!vm.setting.level2Company) {
            vm.level3Companies = [];
        } else {
            CompanyService.getSubCompanies(vm.setting.level2Company)
                .then(function (level3Companies) {
                    vm.level3Companies = level3Companies;
                }, function (err) {

                });
        }
    }

    vm.refreshCompanies = function () {

        if (!vm.setting.parentId) {
            vm.companies = [];
        } else {
            CompanyService.getSubCompanies(vm.setting.parentId)
                .then(function (companies) {
                    vm.companies = companies;
                }, function (err) {

                });
        }
    };

    vm.loadLevel2Companies();
    vm.loadLevel3Companies();
    vm.refreshCompanies();

    vm.view = function (companyId) {
        if (vm.level == "二级") {
            $state.go("app.company.company2.view", { companyId: companyId });
        } else if (vm.level == "三级") {
            $state.go("app.company.company3.view", { companyId: companyId });
        } else if (vm.level == "四级") {
            $state.go("app.company.company4.view", { companyId: companyId });
        }
        // $state.go("app.company.view", { companyId: companyId });
    };

    vm.level1Changed = function () {
        if (vm.level == "二级") {
            vm.setting.parentId = vm.setting.level1Company;
        } else if (vm.level == "三级") {
            vm.setting.parentId = null;
            vm.setting.level2Company = null;
            vm.loadLevel2Companies();
        } else if (vm.level == "四级") {
            vm.setting.parentId = null;
            vm.setting.level2Company = null;
            vm.setting.level3Company = null;
            vm.loadLevel2Companies();
        }

        localStorageService.set(vm.settingString, vm.setting);
        vm.refreshCompanies();
    }

    vm.level2Changed = function () {
        if (vm.level == "三级") {
            vm.setting.parentId = vm.setting.level2Company;
        } else if (vm.level == "四级") {
            vm.setting.parentId = null;
            vm.setting.level3Company = null;
            vm.loadLevel3Companies();
        }

        localStorageService.set(vm.settingString, vm.setting);
        vm.refreshCompanies();
    }

    vm.level3Changed = function () {

        vm.setting.parentId = vm.setting.level3Company;
        localStorageService.set(vm.settingString, vm.setting);
        vm.refreshCompanies();
    }

    vm.addSubCompany = function () {
        if (vm.level == "二级") {
            $state.go("app.company.company2.new", { parentId: vm.setting.level1Company });
        } else if (vm.level == "三级") {
            $state.go("app.company.company3.new", { parentId: vm.setting.level2Company });
        } else if (vm.level == "四级") {
            $state.go("app.company.company4.new", { parentId: vm.setting.level3Company });
        }
    }

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

angular.module('app.company')
.filter("getIncomeRatesString", function () {
    return function (fieldValueUnused, item) {
        if(!item.rates){
            return "";
        }
        var str = "交强险:" + item.rates[0].mandatory_income + "%, " + "商业险:" + item.rates[0].commercial_income + "%, "
                + "车船税:" + item.rates[0].tax_income + "%, " + "其他险:" + item.rates[0].other_income + "%";
        return str;  
    };
})
.filter("getPaymentRatesString", function () {
    return function (fieldValueUnused, item) {
        if(!item.rates){
            return "";
        }
        var str = "交强险:" + item.rates[0].mandatory_payment + "%, " + "商业险:" + item.rates[0].commercial_payment + "%, "
                + "车船税:" + item.rates[0].tax_payment + "%, " + "其他险:" + item.rates[0].other_payment + "%";
        return str;  
    };
});