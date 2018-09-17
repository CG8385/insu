'use strict'

angular.module('app.antiml').controller('SuspTransactionListController', function(screenSize, $rootScope, $state, $scope, AntiMLService){
    var vm = this;
    vm.transactions = [];

    vm.refreshTransactions = function(){
        AntiMLService.getSuspTransactions()
       .then(function(transactions){
           vm.transactions = transactions;
       }, function(err){

       });
    };

    vm.refreshTransactions();

    vm.view = function(transId){
        $state.go("app.antiml.susp-transaction.view", {transId: transId});
    };

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

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (transId) {
        $.SmartMessageBox({
            title: "取消可疑交易",
            content: "确认删除此可疑交易？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                AntiMLService.deleteSuspTransaction(transId)
                    .then(function(){
                        vm.refreshTransactions();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
});
