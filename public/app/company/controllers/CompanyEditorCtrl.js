'use strict'

angular.module('app.company').controller('CompanyEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, CompanyService) {
    var vm = this;
    vm.company = {};
    vm.companyCatogories = [];
    vm.rules = [];
    vm.editable = false;
    vm.currentLevel = "";
    vm.parentName = "";
    vm.showRateEditor = false;

    if ($state.is('app.company.company2.new')) {
        vm.company.level = "二级";
        vm.editable = true;
        vm.company.catogory = $stateParams.parentId;
    } else if ($state.is('app.company.company3.new')) {
        vm.company.level = "三级";
        vm.editable = true;
        vm.company.parent = $stateParams.parentId;
    } else if ($state.is('app.company.company4.new')) {
        vm.company.level = "四级";
        vm.editable = true;
        vm.company.parent = $stateParams.parentId;
    }

    vm.setParentName = function () {
        if (vm.company.catogory) {
            CompanyService.getCompanyCatogory(vm.company.catogory)
                .then(function (companyCatogory) {
                    vm.parentName = companyCatogory.name;
                })
        } else if (vm.company.parent) {
            CompanyService.getCompany(vm.company.parent)
                .then(function (parentCompany) {
                    vm.parentName = parentCompany.name;
                })
        }
    }

    vm.setParentName();




    if ($state.is("app.company.new")) {
        vm.editable = true;
    }



    var companyId = $stateParams.companyId;
    if (companyId) {
        CompanyService.getCompany(companyId)
            .then(function (company) {
                vm.company = company;
                vm.setParentName();
            });
        CompanyService.getRules(companyId)
            .then(function (rules) {
                vm.rules = rules;
            });
    }


    vm.toggleSetRate = function () {
        vm.showRateEditor = !vm.showRateEditor;
        if (vm.showRateEditor) {
            vm.current_rate = {};
            vm.current_rate.set_at = Date.now();
        } else {
            vm.current_rate = undefined;
        }
    }


    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.submit = function () {
        if (vm.current_rate) {
            if (!vm.company.rates) {
                vm.company.rates = [];
            }
            vm.company.rates.unshift(vm.current_rate);
        }
        CompanyService.saveCompany(vm.company)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "保险公司已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.currentLevel = vm.company.level;
                var temp = vm.company;
                vm.company = {};
                vm.company.level = temp.level;
                vm.company.parent = temp.parent;
                vm.company.catogory = temp.catogory;


                if (vm.back) {
                    if (vm.currentLevel == "二级") {
                        $state.go("app.company.company2.all");
                    } else if (vm.currentLevel == "三级") {
                        $state.go("app.company.company3.all");
                    } else if (vm.currentLevel == "四级") {
                        $state.go("app.company.company4.all");
                    } else {
                        $state.go("app.company.all");
                    }
                }
            }, function (err) { });
    };

    vm.refreshRules = function () {
        CompanyService.getRules(vm.company._id)
        .then(function (rules) {
            vm.rules = rules;
        });
    };

    vm.editRule = function (ruleId) {
        $state.go("app.company.rule.view", { ruleId: ruleId, previousState: $state.current.name });
    }

    vm.deleteRule = function (ruleId) {
        $.SmartMessageBox({
            title: "删除费率政策",
            content: "确认删除该费率政策？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                CompanyService.deleteRule(ruleId)
                    .then(function () {
                        vm.refreshRules();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    }

    vm.addRule = function () {
        $state.go("app.company.rule.new", { companyId: vm.company._id, previousState: $state.current.name });
       
    }


});

