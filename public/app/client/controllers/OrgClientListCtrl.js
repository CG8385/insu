'use strict'

angular.module('app.client').controller('OrgClientListController', function(screenSize, $rootScope, $state, $scope, ClientService){
    var vm = this;
    vm.clients = [];



    vm.refreshClients = function(){
       ClientService.getOrgClients()
       .then(function(clients){
           vm.clients = clients;
       }, function(err){
           
       });
    };
    
    vm.refreshClients();
	
    vm.view = function(clientId){
        $state.go("app.client.organization.view", {clientId: clientId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (clientId) {
        $.SmartMessageBox({
            title: "删除客户",
            content: "确认删除该客户？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                ClientService.deleteClient(clientId)
                    .then(function(){
                        vm.refreshClients();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
    

});
