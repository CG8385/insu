'use strict'

angular.module('app.client').controller('ManagerClientEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, ClientService) {
    var vm = this;
    vm.client = {};
    vm.wechats = [];
    vm.bindedWechats = [];
    vm.editable = false;
    vm.client.other_accounts = [];

    if ($state.is("app.client.manager.new")) {
        vm.editable = true;
    }



    var clientId = $stateParams.clientId;
    if (clientId) {
        ClientService.getClient(clientId)
            .then(function (client) {
                vm.client = client;
                // LoadWechats();
            });
    }else{
        // ClientService.getFollowers()
        //             .then(function (followers) {
        //                 vm.wechats = followers;
        //             });
    }
    

    function LoadWechats() {
        var openIds = vm.client.wechats;
        ClientService.getWechatsByIds(openIds)
            .then(function (wechats) {
                if (wechats && wechats.length > 0) {
                    vm.bindedWechats = wechats;
                }
            })
            .then(function () {
                ClientService.getFollowers()
                    .then(function (followers) {
                        vm.wechats = followers;
                        removeBindedWechatsFromFollowers();
                    });
            })
    }


    function removeBindedWechatsFromFollowers() {
        vm.wechats = vm.wechats.filter(function (current) {
            return vm.bindedWechats.filter(function (current_b) {
                return current_b.openid == current.openid
            }).length == 0
        });
    }

    vm.addAccount = function() {
        var newItemNo = vm.client.other_accounts.length+1;
        vm.client.other_accounts.push({'bank':'','account':''});
    };

    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.bindWechat = function (wechat) {
        vm.bindedWechats.push(wechat);
        removeBindedWechatsFromFollowers();
    }

    vm.unbindWechat = function (i) {
        vm.wechats.push(vm.bindedWechats[i]);
        vm.bindedWechats.splice(i, 1);
    }


    vm.submit = function () {
        vm.client.client_type = "主管";
        vm.client.wechats = vm.bindedWechats.map(function(wechat){
            return wechat.openid;
        })
        ClientService.saveClient(vm.client)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "客户已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.client = {};
                vm.client.other_accounts = [];
                if (vm.back) {
                    $state.go("app.client.manager");
                }
            }, function (err) { });
    };



}); 

