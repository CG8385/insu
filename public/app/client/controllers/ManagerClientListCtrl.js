'use strict'

angular.module('app.client').controller('ManagerClientListController', function(screenSize, $rootScope, $state, $scope, ClientService){
    var vm = this;
    vm.clients = [];



    vm.refreshClients = function(){
       ClientService.getManagerClients()
       .then(function(clients){
           vm.clients = clients;
       }, function(err){
           
       });
    };
    
    vm.refreshClients();
	
    vm.view = function(clientId){
        $state.go("app.client.manager.view", {clientId: clientId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (clientId) {
        $.SmartMessageBox({
            title: "删除主管",
            content: "确认删除该主管？",
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
