'use strict'

angular.module('app.life-policy').controller('LifePolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, LifePolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.organizations = [];
    vm.clientInfo = {};
    vm.areAllSelected = false;
    vm.summary = { total_income:0, payment_total: 0, zy_payment: 0,profit:0};
    vm.pageSize = 15;
    vm.entries = 0;

    // vm.totalIncome = 0;
    // vm.totalPayment = 0;
    // vm.totalProfit = 0;


    LifePolicyService.getClients()
        .then(function (clients) {
            clients.unshift({_id:undefined, name:"全部业务员"});
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
    vm.loadLevel3Companies = function () {
        if (!vm.filterSettings.level2_company) {
            vm.level3Companies = [];
        } else {
            LifePolicyService.getSubCompanies(vm.filterSettings.level2_company)
                .then(function (level3Companies) {
                    vm.level3Companies = level3Companies;
                }, function (err) {

                });
        }
    }

    vm.loadLevel4Companies = function () {
        if (!vm.filterSettings.level3_company) {
            vm.level4Companies = [];
        } else {
            LifePolicyService.getSubCompanies(vm.filterSettings.level3_company)
                .then(function (level4Companies) {
                    vm.level4Companies = level4Companies;
                }, function (err) {

                });
        }
    }

    vm.level2Changed = function () {
        if (!vm.filterSettings.level2_company) {
            delete vm.filterSettings.level2_company;
        }
        delete vm.filterSettings.level3_company;
        delete vm.filterSettings.level4_company;
        vm.loadLevel3Companies();
        vm.filterChanged();
    }

    vm.level3Changed = function () {
        if (!vm.filterSettings.level3_company) {
            delete vm.filterSettings.level3_company;
        }
        delete vm.filterSettings.level4_company;
        vm.loadLevel4Companies();
        vm.filterChanged();
    }

    vm.level4Changed = function () {
        if (!vm.filterSettings.level4_company) {
            delete vm.filterSettings.level4_company;
        }
        vm.filterChanged();
    }
    //////////
    vm.loadLevel3Orgs = function () {
        if (!vm.filterSettings.level2_org) {
            vm.level3Orgs = [];
        } else {
            LifePolicyService.getSubOrgs(vm.filterSettings.level2_org)
                .then(function (level3Orgs) {
                    vm.level3Orgs = level3Orgs;
                }, function (err) {

                });
        }
    }

    vm.loadLevel4Orgs = function () {
        if (!vm.filterSettings.level3_org) {
            vm.level4Orgs = [];
        } else {
            LifePolicyService.getSubOrgs(vm.filterSettings.level3_org)
                .then(function (level4Orgs) {
                    vm.level4Orgs = level4Orgs;
                }, function (err) {

                });
        }
    }

    vm.loadLevel5Orgs = function () {
        if (!vm.filterSettings.level4_org) {
            vm.level5Orgs = [];
        } else {
            LifePolicyService.getSubOrgs(vm.filterSettings.level4_org)
                .then(function (level5Orgs) {
                    vm.level5Orgs = level5Orgs;
                }, function (err) {

                });
        }
    }

    vm.level2OrgChanged = function () {
        if (!vm.filterSettings.level2_org) {
            delete vm.filterSettings.level2_org;
        }
        delete vm.filterSettings.level3_org;
        delete vm.filterSettings.level4_org;
        delete vm.filterSettings.level5_org;
        vm.loadLevel3Orgs();
        vm.filterChanged();
    }

    vm.level3OrgChanged = function () {
        if (!vm.filterSettings.level3_org) {
            delete vm.filterSettings.level3_org;
        }
        delete vm.filterSettings.level4_org;
        delete vm.filterSettings.level5_org;
        vm.loadLevel4Orgs();
        vm.filterChanged();
    }

    vm.level4OrgChanged = function () {
        if (!vm.filterSettings.level4_org) {
            delete vm.filterSettings.level4_org;
        }
        delete vm.filterSettings.level5_org;
        vm.loadLevel5Orgs();
        vm.filterChanged();
    }

    vm.level5OrgChanged = function () {
        if (!vm.filterSettings.level5_org) {
            delete vm.filterSettings.level5_org;
        }
        vm.filterChanged();
    }

    //////////

    vm.listType = "all";
    if ($state.is("app.life-policy.to-be-reviewed")) {
        vm.listType = "to-be-reviewed";
        LifePolicyService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;

            })
        vm.filterSettings = localStorageService.get("life-review-filterSettings") ? localStorageService.get("life-review-filterSettings") : {};
        vm.loadLevel3Orgs();
        vm.loadLevel4Orgs();
        vm.loadLevel5Orgs();
        if (vm.filterSettings.client) {
            LifePolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.policyNoSearch = localStorageService.get("life-review-policyNoSearch") ? localStorageService.get("life-review-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("life-review-fromDate") ? localStorageService.get("life-review-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-review-toDate") ? localStorageService.get("life-review-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("life-review-approvedFromDate") ? localStorageService.get("life-review-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("life-review-approvedToDate") ? localStorageService.get("life-review-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("life-review-paidFromDate") ? localStorageService.get("life-eview-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("life-review-paidToDate") ? localStorageService.get("life-eview-paidToDate") : undefined;
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
        vm.policyNoSearch = localStorageService.get("life-rejected-policyNoSearch") ? localStorageService.get("life-rejected-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("life-rejected-fromDate") ? localStorageService.get("life-rejected-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-rejected-toDate") ? localStorageService.get("life-rejected-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("life-rejected-approvedFromDate") ? localStorageService.get("life-rejected-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("life-rejected-approvedToDate") ? localStorageService.get("life-rejected-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("life-rejected-paidFromDate") ? localStorageService.get("life-rejected-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("life-rejected-paidToDate") ? localStorageService.get("life-rejected-paidToDate") : undefined;
        vm.tableHeader = "被驳回保单";
    } else if ($state.is("app.life-policy.to-be-paid")) {
        vm.listType = "to-be-paid";
        LifePolicyService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;

            })
        vm.filterSettings = localStorageService.get("life-filterSettings") ? localStorageService.get("life-filterSettings") : {};
        vm.loadLevel3Orgs();
        vm.loadLevel4Orgs();
        vm.loadLevel5Orgs();
        // if(vm.filterSettings.client){
        //     LifePolicyService.getClient(vm.filterSettings.client)
        //         .then(function (clientInfo) {
        //             vm.clientInfo = clientInfo;
        //         })
        // }
        vm.policyNoSearch = localStorageService.get("life-policyNoSearch") ? localStorageService.get("life-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("life-fromDate") ? localStorageService.get("life-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-toDate") ? localStorageService.get("life-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("life-approvedFromDate") ? localStorageService.get("life-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("life-approvedToDate") ? localStorageService.get("life-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("life-paidFromDate") ? localStorageService.get("life-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("life-paidToDate") ? localStorageService.get("life-paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("life-swipedFromDate") ? localStorageService.get("life-swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("life-swipedToDate") ? localStorageService.get("life-swipedToDate") : undefined;
        vm.tableHeader = "待支付保单";
    } else if ($state.is("app.life-policy.paid")) {
        vm.listType = "paid";
        LifePolicyService.getLevel2Companies()
            .then(function (level2Companies) {
                vm.level2Companies = level2Companies;

            })
        vm.filterSettings = localStorageService.get("life-paid-filterSettings") ? localStorageService.get("life-paid-filterSettings") : {};
        vm.loadLevel3Companies();
        vm.loadLevel4Companies();
        vm.policyNoSearch = localStorageService.get("life-paid-policyNoSearch") ? localStorageService.get("life-paid-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("life-paid-fromDate") ? localStorageService.get("life-paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("life-paid-toDate") ? localStorageService.get("life-paid-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("life-paid-approvedFromDate") ? localStorageService.get("life-paid-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("life-paid-approvedToDate") ? localStorageService.get("life-paid-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("life-paid-paidFromDate") ? localStorageService.get("life-paid-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("life-paid-paidToDate") ? localStorageService.get("life-paid-paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("life-paid-swipedFromDate") ? localStorageService.get("life-paid-swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("life-paid-swipedToDate") ? localStorageService.get("life-paid-swipedToDate") : undefined;
        vm.tableHeader = "已支付保单";
        if (screenSize.is('xs, sm')) {
            vm.displayFields = ["client.name", "applicant.name", "paid_at"];
        }
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        if(vm.entries < 2 && currentPage == 0){
            if ($state.is("app.life-policy.to-be-reviewed")) {
                vm.currentPage = localStorageService.get("review-currentPage");
            }
            else if ($state.is("app.life-policy.to-be-paid")) {
                vm.currentPage = localStorageService.get("currentPage");
            }
            else if ($state.is("app.life-policy.paid")) {
                vm.currentPage = localStorageService.get("paid-currentPage");
            }
            else if ($state.is("app.life-policy.rejected")) {
                vm.currentPage = localStorageService.get("rejected-currentPage");
            }
            vm.entries = vm.entries + 1;
        }else{
            if ($state.is("app.life-policy.to-be-reviewed")) {
                localStorageService.set("review-currentPage", vm.currentPage);
            }
            else if ($state.is("app.life-policy.to-be-paid")) {
                localStorageService.set("currentPage", vm.currentPage);
            }
            else if ($state.is("app.life-policy.paid")) {
                localStorageService.set("paid-currentPage", vm.currentPage);
            }
            else if ($state.is("app.life-policy.rejected")) {
                localStorageService.set("rejected-currentPage", vm.currentPage);
            }
        }
        vm.areAllSelected = false;
        //vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        LifePolicyService.searchPolicies(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate,vm.approvedFromDate, vm.approvedToDate, vm.paidFromDate, vm.paidToDate,vm.swipedFromDate, vm.swipedToDate, vm.policyNoSearch)
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
                vm.selectionChanged();
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("app.life-policy.to-be-reviewed")){
            localStorageService.set("life-review-filterSettings", vm.filterSettings);
            localStorageService.set('life-review-fromDate', vm.fromDate);
            localStorageService.set('life-review-toDate', vm.toDate);
            localStorageService.set('life-review-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('life-review-approvedToDate', vm.approvedToDate);
            localStorageService.set('life-review-paidFromDate', vm.paidFromDate);
            localStorageService.set('life-review-paidToDate', vm.paidToDate);
            localStorageService.set('life-review-policyNoSearch', vm.policyNoSearch);
        }else if ($state.is("app.life-policy.to-be-paid")) {
            localStorageService.set("life-filterSettings", vm.filterSettings);
            localStorageService.set('life-fromDate', vm.fromDate);
            localStorageService.set('life-toDate', vm.toDate);
            localStorageService.set('life-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('life-approvedToDate', vm.approvedToDate);
            localStorageService.set('life-paidFromDate', vm.paidFromDate);
            localStorageService.set('life-paidToDate', vm.paidToDate);
            localStorageService.set('life-swipedFromDate', vm.swipedFromDate);
            localStorageService.set('life-swipedToDate', vm.swipedToDate);
            localStorageService.set('life-policyNoSearch', vm.policyNoSearch);
        }
        else if ($state.is("app.life-policy.paid")) {
            localStorageService.set("life-paid-filterSettings", vm.filterSettings);
            localStorageService.set('life-paid-fromDate', vm.fromDate);
            localStorageService.set('life-paid-toDate', vm.toDate);
            localStorageService.set('life-paid-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('life-paid-approvedToDate', vm.approvedToDate);
            localStorageService.set('life-paid-paidFromDate', vm.paidFromDate);
            localStorageService.set('life-paid-paidToDate', vm.paidToDate);
            localStorageService.set('life-paid-swipedFromDate', vm.swipedFromDate);
            localStorageService.set('life-paid-swipedToDate', vm.swipedToDate);
            localStorageService.set('life-paid-policyNoSearch', vm.policyNoSearch);
        }else if($state.is("app.life-policy.rejected")){
            localStorageService.set("life-rejected-filterSettings", vm.filterSettings);
            localStorageService.set('life-rejected-fromDate', vm.fromDate);
            localStorageService.set('life-rejected-toDate', vm.toDate);
            localStorageService.set('life-rejected-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('life-rejected-approvedToDate', vm.approvedToDate);
            localStorageService.set('life-rejected-paidFromDate', vm.paidFromDate);
            localStorageService.set('life-rejected-paidToDate', vm.paidToDate);
            localStorageService.set('life-rejected-policyNoSearch', vm.policyNoSearch);
        }
        
        vm.refreshPolicies();
    };

    vm.sellerFilterChanged = function () {
        if (vm.sellerInfo._id != -1) {
            vm.filterSettings.seller = vm.sellerInfo._id;
        }
        else {
            vm.filterSettings.seller = undefined;
        }

        if ($state.is("app.life-policy.to-be-reviewed")) {
            localStorageService.set("life-review-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.life-policy.to-be-paid")) {
            localStorageService.set("life-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.life-policy.paid")) {
            localStorageService.set("life-paid-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.life-policy.rejected")) {
            localStorageService.set("life-rejected-filterSettings", vm.filterSettings);
        }
        vm.refreshPolicies();
    }

    vm.clientFilterChanged = function () {
        if (vm.clientInfo._id != -1) {
            vm.filterSettings.client = vm.clientInfo._id;
        }
        else {
            vm.filterSettings.client = undefined;
        }

        if ($state.is("app.life-policy.to-be-reviewed")) {
            localStorageService.set("life-review-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.life-policy.to-be-paid")) {
            localStorageService.set("life-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.life-policy.paid")) {
            localStorageService.set("life-paid-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.life-policy.rejected")) {
            localStorageService.set("life-rejected-filterSettings", vm.filterSettings);
        }
        vm.refreshPolicies();
    }

    vm.refreshPolicies = function () {
        if (typeof (vm.currentPage) == 'undefined' || typeof (vm.pageItems) == 'undefined') {
            return;
        }
        vm.pageSize = 15;
        vm.onServerSideItemsRequested(vm.currentPage, vm.pageItems);
    };






    var poller = function () {
        vm.refreshPolicies();
        $timeout(poller, 1000 * 120);
    };

    poller();

    vm.exportFilteredPolicies = function () {
        LifePolicyService.getFilteredCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate,vm.approvedFromDate, vm.approvedToDate, vm.paidFromDate, vm.paidToDate, vm.swipedFromDate, vm.swipedToDate, vm.policyNoSearch)
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

    vm.bulkPay = function () {
        var policyIds = vm.getSelectedPolicyIds();
        $.SmartMessageBox({
            title: "批量修改保单状态",
            content: "确认支付选中的" + vm.selectedPolicies.length + "条保单? 跟单费共计:"+vm.summary.total_income
                    +"结算费共计:" + vm.summary.payment_total + "增员奖共计:"+vm.summary.zy_payment+"毛利润共计:"+vm.summary.profit,
            buttons: '[取消][确认]',
            input: "text",
            placeholder: "可填写转账银行与日期备注"
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                var data = {};
                data.policyIds = policyIds;
                data.remarks = value;
                LifePolicyService.bulkPay(data)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已批量更改为已支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        vm.refreshPolicies();
                    }, function (err) {

                    });
            }
            if (ButtonPressed === "取消") {

            }

        });
    };

    vm.getSelectedPolicyIds = function () {
        var ids = [];
        if (vm.policies) {
            for (var i = 0; i < vm.policies.length; i++) {
                if (vm.policies[i].isSelected) {
                    ids.push(vm.policies[i]._id);
                }
            }
        }
        return ids;
    }

    vm.bulkApprove = function () {
        var policyIds = vm.getSelectedPolicyIds();
        $.SmartMessageBox({
            title: "批量修改保单状态",
            content: "确认批准选中的" + policyIds.length + "条保单?",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                LifePolicyService.bulkApprove(policyIds)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已批量更改为待支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        vm.refreshPolicies();
                        // vm.refreshSummary();
                    }, function (err) {

                    });
            }
            if (ButtonPressed === "取消") {

            }

        });
    };

    vm.pay = function (life_policy) {
        if ($state.is("app.life-policy.to-be-reviewed")) {
            localStorageService.set("review-currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.to-be-paid")) {
            localStorageService.set("currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.paid")) {
            localStorageService.set("paid-currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.rejected")) {
            localStorageService.set("rejected-currentPage", vm.currentPage);
        }
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
        if ($state.is("app.life-policy.to-be-reviewed")) {
            localStorageService.set("review-currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.to-be-paid")) {
            localStorageService.set("currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.paid")) {
            localStorageService.set("paid-currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.rejected")) {
            localStorageService.set("rejected-currentPage", vm.currentPage);
        }
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
        if ($state.is("app.life-policy.to-be-reviewed")) {
            localStorageService.set("review-currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.to-be-paid")) {
            localStorageService.set("currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.paid")) {
            localStorageService.set("paid-currentPage", vm.currentPage);
        }
        else if ($state.is("app.life-policy.rejected")) {
            localStorageService.set("rejected-currentPage", vm.currentPage);
        }
        life_policy.client = life_policy.client._id;
        if (life_policy.manager){
            life_policy.manager = life_policy.manager._id;
        }
        if (life_policy.director){
            life_policy.director = life_policy.director._id;
        }
        $state.go("app.life-policy.approve", { policyId: life_policy._id });
    };

    vm.selectionChanged = function () {
        if (!vm.policies) {
            vm.summary = { total_income:0,payment_total: 0, zy_payment: 0,profit:0};
            vm.selectedPolicies = [];
            vm.isShowBulkOperationButton = false;
        }
        vm.selectedPolicies = vm.policies.filter(function (item) {
            return item.isSelected
        });
        vm.summary = vm.selectedPolicies.reduce(function (a, b) {
            return {total_income: parseFloat(a.total_income?a.total_income:0) + parseFloat(b.total_income?b.total_income:0),
                payment_total: parseFloat(a.payment_total?a.payment_total:0) + parseFloat(b.payment_total?b.payment_total:0),
                zy_payment: parseFloat(a.zy_payment?a.zy_payment:0) + parseFloat(b.zy_payment?b.zy_payment:0),
                profit:parseFloat(a.profit?a.profit:0) + parseFloat(b.profit?b.profit:0)}
        }, { total_income:0,payment_total: 0, zy_payment: 0,profit:0});
        vm.summary.total_income = vm.summary.total_income.toFixed(2);
        vm.summary.payment_total = vm.summary.payment_total.toFixed(2);
        vm.summary.zy_payment = vm.summary.zy_payment.toFixed(2);
        vm.summary.profit = vm.summary.profit.toFixed(2);
        if(vm.selectedPolicies.length == 0){
            vm.isShowBulkOperationButton = false;
        }else if ($state.is("app.life-policy.to-be-reviewed")){
            vm.isShowBulkOperationButton = $rootScope.user.userrole.lifePolicy_to_be_reviewed.aprove;
        }else if ($state.is("app.life-policy.to-be-paid")){
            vm.isShowBulkOperationButton = $rootScope.user.userrole.lifePolicy_to_be_paid.pay;
        }
    }

    vm.selectAll = function () {
        if (vm.policies && vm.policies.length > 0) {
            for (var i = 0; i < vm.policies.length; i++) {
                vm.policies[i].isSelected = true;
            }
        }
        vm.selectionChanged();
    }

    vm.clearSelection = function () {
        if (vm.policies && vm.policies.length > 0) {
            for (var i = 0; i < vm.policies.length; i++) {
                vm.policies[i].isSelected = false;
            }
        }
        vm.selectionChanged();
    }

    vm.showAll = function () {
        vm.pageSize = vm.policyTotalCount < 300 ? vm.policyTotalCount : 300;
    }

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
    })
    .filter("getApprovedTime", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            var approved_at = policy.approved_at ? policy.approved_at : policy.updated_at;
            var d = new Date(approved_at),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return [year, month, day].join('-');
        }
    });