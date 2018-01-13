'use strict'

angular.module('app.client').controller('IndClientEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, ClientService) {
    var vm = this;
    vm.client = {};
    vm.wechats = [];
    vm.bindedWechats = [];
    vm.editable = false;
    vm.client.other_accounts = [];
    vm.isInReviewMode = false;
    vm.dealers = [];

    if ($state.is("app.client.individual.new")) {
        vm.editable = true;
    }else if ($state.is("app.client.pending.review")) {
        vm.editable = true;
        vm.isInReviewMode = true;
    }

    ClientService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })
    
    ClientService.getOrgClients()
        .then(function (dealers) {
            vm.dealers = dealers;
        })




    var clientId = $stateParams.clientId;
    if (clientId) {
        ClientService.getClient(clientId)
            .then(function (client) {
                vm.client = client;
                // LoadWechats();
            });
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

    vm.approve = function(){
        vm.client.client_type = "个人";
        ClientService.saveClient(vm.client)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "业务员通过审核",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                $state.go("app.client.pending");
                
            }, function (err) { });
    }


    vm.submit = function () {
        vm.client.client_type = "个人";
        ClientService.saveClient(vm.client)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "业务员已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.client = {};
                vm.client.other_accounts = [];
                if (vm.back) {
                    $state.go("app.client.individual");
                }
            }, function (err) { });
    };

    vm.uploadLicensePhoto = function (files) {
        ClientService.uploadFile(files[0], vm.client.license_photo)
            .then(function (fileName) {
                vm.client.license_photo = fileName;
                ClientService.saveClient(vm.client);
            })
    }

    vm.uploadIDPhoto1 = function (files) {
        ClientService.uploadFile(files[0], vm.client.identity1_filename)
            .then(function (fileName) {
                vm.client.identity1_filename = fileName;
                ClientService.saveClient(vm.client);
            })
    }

    vm.uploadIDPhoto2 = function (files) {
        ClientService.uploadFile(files[0], vm.client.identity2_filename)
            .then(function (fileName) {
                vm.client.identity2_filename = fileName;
                ClientService.saveClient(vm.client);
            })
    }

    vm.getPhotoUrl = function () {
        return "http://hy-policy.oss-cn-shanghai.aliyuncs.com/" + vm.client.license_photo + "?x-oss-process=style/resize";
        // return "http://cwang1.oss-cn-shanghai.aliyuncs.com/" + vm.client.license_photo + "?x-oss-process=style/resize";
    }

    vm.getImageUrl = function (fileName) {
        return "http://hy-policy.oss-cn-shanghai.aliyuncs.com/" + fileName + "?x-oss-process=style/resize";
    }


}); 

