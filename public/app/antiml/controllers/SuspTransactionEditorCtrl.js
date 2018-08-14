'use strict'

angular.module('app.antiml').controller('SuspTransactionEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, AntiMLService) {
    var vm = this;
    vm.transaction = {};
    vm.editable = false;

    var transId = $stateParams.transId;
    if (transId) {
        AntiMLService.getSuspTransaction(transId)
            .then(function (transaction) {
                vm.transaction = transaction;
            });
    }

    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.getPolicyUrl = function(trans){
        var policy_view_url="";
        if(trans.policy_type =="policies"){
            policy_view_url = "#\/"+trans.policy_type+"\/view1\/"+trans.policy_id;
        }else if(trans.policy_type =="life-policies"){
            policy_view_url = "#\/"+trans.policy_type+"\/view\/"+trans.policy_id;
        }
        return policy_view_url;
    }

    vm.getPolicyViewString = function(trans){
        var policy_string="";
        if(trans.policy_type =="policies"){
            policy_string = "车险: "+trans.policy_no;
        }else if(trans.policy_type =="life-policies"){
            policy_string = "寿险: "+trans.policy_no;
        }
        return policy_string;
    }

    vm.submit = function () {
        AntiMLService.saveSuspTransaction(vm.transaction)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "该可疑交易已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.transaction = {};
                if (vm.back) {
                    $state.go("app.antiml.susp-transaction");
                }
            }, function (err) { });
    };
    vm.submitBmember = function () {
        AntiMLService.convertSuspTransactionToBMember(vm.transaction)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "转入黑名单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                $state.go("app.antiml.blacklist");
            }, function (err) { });
    };


});

