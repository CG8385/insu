'use strict'

angular.module('app.company').controller('PolicyNameListController', function(screenSize, $rootScope, $state, $scope, CompanyService){
    var vm = this;
    vm.policyNames = [];



    vm.refreshPolicyNames = function(){
       CompanyService.getPolicyNames()
       .then(function(policyNames){
           vm.policyNames = policyNames;
       }, function(err){
           
       });
    };
    
    vm.refreshPolicyNames();
	
    vm.view = function(policyNameId){
        $state.go("app.company.policyname.view", {policyNameId: policyNameId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (policyNameId) {
        $.SmartMessageBox({
            title: "删除险种名称",
            content: "确认删除该险种名称？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                CompanyService.deletePolicyName(policyNameId)
                    .then(function(){
                        vm.refreshpolicyNames();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
    

});
