'use strict'

angular.module('app.client').controller('IndClientListController', function(screenSize, $rootScope, $state, $scope, ClientService){
    var vm = this;
    vm.clients = [];



    vm.refreshClients = function(){
       ClientService.getIndClients()
       .then(function(clients){
           vm.clients = clients;
       }, function(err){
           
       });
    };
    
    vm.refreshClients();
	
    vm.view = function(clientId){
        $state.go("app.client.individual.view", {clientId: clientId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (clientId) {
        $.SmartMessageBox({
            title: "删除业务员",
            content: "确认删除该业务员？",
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
