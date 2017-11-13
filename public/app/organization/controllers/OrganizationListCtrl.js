'use strict'

angular.module('app.organization').controller('OrganizationListController', function(screenSize, $rootScope, $state, $scope, OrganizationService){
    var vm = this;
    vm.organizations = [];



    vm.refreshOrganizations = function(){
       OrganizationService.getOrganizations()
       .then(function(organizations){
           vm.organizations = organizations;
       }, function(err){
           
       });
    };
    
    vm.refreshOrganizations();
	
    vm.view = function(organizationId){
        $state.go("app.organization.view", {organizationId: organizationId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (organizationId) {
        $.SmartMessageBox({
            title: "删除分支机构",
            content: "确认删除该分支机构？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                OrganizationService.deleteOrganization(organizationId)
                    .then(function(){
                        vm.refreshOrganizations();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
    

});
