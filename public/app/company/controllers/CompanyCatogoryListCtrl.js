'use strict'

angular.module('app.company').controller('CompanyCatogoryListController', function(screenSize, $rootScope, $state, $scope, CompanyService){
    var vm = this;
    vm.companyCatogories = [];



    vm.refreshCompanyCatogories = function(){
       CompanyService.getCompanyCatogories()
       .then(function(companyCatogories){
           vm.companyCatogories = companyCatogories;
       }, function(err){
           
       });
    };
    
    vm.refreshCompanyCatogories();
	
    vm.view = function(companyCatogoryId){
        $state.go("app.company.companycatogory.view", {companyCatogoryId: companyCatogoryId});
    };

    vm.addLevel1 = function(){
        $state.go("app.company.companycatogory.new");
    }

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (companyCatogoryId) {
        $.SmartMessageBox({
            title: "删除一级保险公司",
            content: "确认删除该一级保险公司？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                CompanyService.deleteCompanyCatogory(companyCatogoryId)
                    .then(function(){
                        vm.refreshCompanyCatogories();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
    

});
