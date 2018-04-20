'use strict'

angular.module('app.life-policy').controller('LifePolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, LifePolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.organizations = [];
    vm.clientInfo = {};

    // vm.totalIncome = 0;
    // vm.totalPayment = 0;
    // vm.totalProfit = 0;


    LifePolicyService.getClients()
        .then(function (clients) {
            // clients.unshift({_id:undefined, name:"所有业务员"});
            vm.clients = clients;
        })
    LifePolicyService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })

    LifePolicyService.getSellers()
        .then(function (sellers) {
            vm.sellers = sellers;
        })


    vm.listType = "all";
    if ($state.is("app.life-policy.to-be-reviewed")) {
        vm.listType = "to-be-reviewed";
        vm.filterSettings = localStorageService.get("life-review-filterSettings") ? localStorageService.get("life-review-filterSettings") : {};
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("life-review-fromDate") ? localStorageService.get("life-review-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-review-toDate") ? localStorageService.get("life-review-toDate") : undefined;
        vm.tableHeader = "待审核保单";
        if (screenSize.is('xs, sm')) {
            vm.displayFields = ["client.name", "plate"];
        }
    }else if ($state.is("app.life-policy.rejected")) {
        vm.listType = "rejected";
        vm.filterSettings = localStorageService.get("life-rejected-filterSettings") ? localStorageService.get("life-rejected-filterSettings") : {};
        // if(vm.filterSettings.client){
        //     LifePolicyService.getClient(vm.filterSettings.client)
        //         .then(function (clientInfo) {
        //             vm.clientInfo = clientInfo;
        //         })
        // }
        vm.fromDate = localStorageService.get("life-rejected-fromDate") ? localStorageService.get("life-rejected-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-rejected-toDate") ? localStorageService.get("life-rejected-toDate") : undefined;
        vm.tableHeader = "被驳回保单";
    } else if ($state.is("app.life-policy.to-be-paid")) {
        vm.listType = "to-be-paid";
        vm.filterSettings = localStorageService.get("life-filterSettings1") ? localStorageService.get("life-filterSettings1") : {};
        // if(vm.filterSettings.client){
        //     LifePolicyService.getClient(vm.filterSettings.client)
        //         .then(function (clientInfo) {
        //             vm.clientInfo = clientInfo;
        //         })
        // }
        vm.fromDate = localStorageService.get("life-fromDate") ? localStorageService.get("life-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-toDate") ? localStorageService.get("life-toDate") : undefined;
        vm.tableHeader = "待支付保单";
    } else if ($state.is("app.life-policy.paid")) {
        vm.listType = "paid";
        vm.filterSettings = localStorageService.get("life-paid-filterSettings") ? localStorageService.get("life-paid-filterSettings") : {};
        vm.fromDate = localStorageService.get("life-paid-fromDate") ? localStorageService.get("life-paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-paid-toDate") ? localStorageService.get("life-paid-toDate") : undefined;
        vm.tableHeader = "已支付保单";
        if (screenSize.is('xs, sm')) {
            vm.displayFields = ["client.name", "applicant.name", "paid_at"];
        }
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        LifePolicyService.searchPolicies(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.policies = data.policies;
                vm.policyTotalCount = data.totalCount;
                //构建多个增员人显示
                for(var j=0;j<vm.policies.length;j++){
                    var policy = vm.policies[j];
                    policy.zy_client={};
                    for (var i = 0; i < policy.zy_infos.length; i++){
                        if(policy.zy_infos[i].zy_client!=undefined){
                            if(policy.zy_client.name==undefined){
                                policy.zy_client.name = policy.zy_infos[i].zy_client.name;
                            }else{
                                policy.zy_client.name += policy.zy_infos[i].zy_client.name;
                            }
                            policy.zy_client.name +=" "
                        }
                    }
                }
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("app.life-policy.to-be-reviewed")){
            localStorageService.set("life-review-filterSettings", vm.filterSettings);
            localStorageService.set('life-review-fromDate', vm.fromDate);
            localStorageService.set('life-review-toDate', vm.toDate);
        }else if ($state.is("app.life-policy.to-be-paid")) {
            localStorageService.set("life-filterSettings1", vm.filterSettings);
            localStorageService.set('life-fromDate', vm.fromDate);
            localStorageService.set('life-toDate', vm.toDate);
        }
        else if ($state.is("app.life-policy.paid")) {
            localStorageService.set("life-paid-filterSettings", vm.filterSettings);
            localStorageService.set('life-paid-fromDate', vm.fromDate);
            localStorageService.set('life-paid-toDate', vm.toDate);
        }else if($state.is("app.life-policy.rejected")){
            localStorageService.set("life-rejected-filterSettings", vm.filterSettings);
            localStorageService.set('life-rejected-fromDate', vm.fromDate);
            localStorageService.set('life-rejected-toDate', vm.toDate);
        }
        
        vm.refreshPolicies();
    };

    // vm.clientFilterChanged = function (){
    //     vm.filterSettings.client = vm.clientInfo._id;
    //     localStorageService.set("life-filterSettings1", vm.filterSettings);
    //     vm.refreshPolicies();
    // }

    vm.refreshPolicies = function () {
        if (typeof (vm.currentPage) == 'undefined' || typeof (vm.pageItems) == 'undefined') {
            return;
        }
        vm.onServerSideItemsRequested(vm.currentPage, vm.pageItems);
    };






    var poller = function () {
        vm.refreshPolicies();
        $timeout(poller, 1000 * 120);
    };

    poller();

    vm.exportFilteredPolicies = function () {
        LifePolicyService.getFilteredCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'life.csv'
                })[0].click();
            })
    };

    // vm.bulkPay = function () {
    //     $.SmartMessageBox({
    //         title: "批量修改保单状态",
    //         content: "确认已支付筛选出的所有保单？结算费共计:" + vm.totalPayment.toFixed(2),
    //         buttons: '[取消][确认]'
    //     }, function (ButtonPressed) {
    //         if (ButtonPressed === "确认") {
    //             LifePolicyService.bulkPay(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
    //                 .then(function (data) {
    //                     $.smallBox({
    //                         title: "服务器确认信息",
    //                         content: "保单状态已批量更改为已支付",
    //                         color: "#739E73",
    //                         iconSmall: "fa fa-check",
    //                         timeout: 5000
    //                     });
    //                     vm.refreshPolicies();
    //                     vm.refreshSummary();
    //                 }, function (err) {

    //                 });
    //         }
    //         if (ButtonPressed === "取消") {

    //         }

    //     });
    // };


    vm.pay = function (life_policy) {
        life_policy.client = life_policy.client._id;
        if (life_policy.manager){
            life_policy.manager = life_policy.manager._id;
        }
        if (life_policy.director){
            life_policy.director = life_policy.director._id;
        }
        $state.go("app.life-policy.pay", { policyId: life_policy._id });
    };

    vm.view = function (life_policy) {
        life_policy.client = life_policy.client._id;
        if (life_policy.manager){
            life_policy.manager = life_policy.manager._id;
        }
        if (life_policy.director){
            life_policy.director = life_policy.director._id;
        }
        $state.go("app.life-policy.view", { policyId: life_policy._id });
    };

    vm.reject = function (life_policy) {
        $.SmartMessageBox({
            title: "驳回保单",
            content: "确认驳回该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                life_policy.policy_status = "被驳回";
                LifePolicyService.savePolicy(life_policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为被驳回",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        vm.refreshPolicies();
                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }

        });
    };

    vm.approve = function (life_policy) {
        life_policy.client = life_policy.client._id;
        if (life_policy.manager){
            life_policy.manager = life_policy.manager._id;
        }
        if (life_policy.director){
            life_policy.director = life_policy.director._id;
        }
        $state.go("app.life-policy.approve", { policyId: life_policy._id });
    };


    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete = function (policyId) {
        $.SmartMessageBox({
            title: "删除保单",
            content: "确认删除该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                LifePolicyService.deletePolicy(policyId)
                    .then(function () {
                        vm.refreshPolicies();
                        // vm.refreshSummary();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };


});

angular.module('app.life-policy')
    .filter("computeTotal", function () {
        return function (fieldValueUnused, item) {
            return (item.mandatory_fee + item.commercial_fee + item.tax_fee);
        }
    });