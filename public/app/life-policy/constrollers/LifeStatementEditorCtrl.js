'use strict'

angular.module('app.life-policy').controller('LifeStatementEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, LifePolicyService) {
    var vm = this;
    vm.statement = {};
    vm.sellerInfo = $rootScope.user;
    LifePolicyService.getCompanies()
        .then(function (companies) {
            vm.companies = companies;
        })
      
    vm.editable = false;
    if ($state.is("app.life-policy.statement.new")) {
        vm.editable = true;
    }



    var statementId = $stateParams.statementId;
    if (statementId) {
        LifePolicyService.getStatement(statementId)
            .then(function (statement) {
                vm.statement = statement;
                vm.sellerInfo = statement.seller;
                statement.seller = statement.seller._id;
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
        LifePolicyService.saveStatement(vm.statement)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "对账单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.statement = {};
                if (vm.back) {
                    $state.go("app.life-policy.statement.list");
                }
            }, function (err) { });
    };
});

