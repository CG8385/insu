'use strict'

angular.module('app.client').controller('IndClientListController', function(screenSize, $rootScope, $state, $scope, ClientService, localStorageService){
    var vm = this;
    vm.clients = [];
    vm.setting = localStorageService.get('ind-client-list') ? localStorageService.get('ind-client-list') : {currentPage: 0};
    console.log(vm.setting);

    vm.refreshClients = function(){
       ClientService.getIndClients()
       .then(function(clients){
           vm.clients = clients;
       }, function(err){
           
       });
    };
    
    vm.refreshClients();
	
    vm.view = function(clientId){
        localStorageService.set('ind-client-list', vm.setting);
        $state.go("app.client.individual.view", {clientId: clientId});
    };


    vm.exportClients = function () {
        ClientService.getCSV()
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'clients.csv'
                })[0].click();
            })
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
