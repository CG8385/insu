'use strict'

angular.module('app.company').controller('RuleEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, CompanyService) {
    var vm = this;
    vm.rule = {};



    var ruleId = $stateParams.ruleId;
    var companyId = $stateParams.companyId;
    if (ruleId) {
        CompanyService.getRule(ruleId)
            .then(function (rule) {
                vm.rule = rule;
            });
    }else if(companyId) {
        CompanyService.getCompany(companyId)
            .then(function(company){
                vm.rule.company = company;
            });
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.submit = function () {
        CompanyService.saveRule(vm.rule)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "费率政策已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                if (vm.back) {
                    $state.go($stateParams.previousState, { companyId: vm.rule.company._id });
                }
            }, function (err) { });
    };



}); 

