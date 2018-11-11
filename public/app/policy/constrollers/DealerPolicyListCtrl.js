'use strict'

angular.module('app.policy').controller('DealerPolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, DealerPolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.totalIncome = 0;
    vm.areAllSelected = false;
    vm.summary = { total_income: 0};
    vm.pageSize = 15;
    vm.entries = 0;

    //Infinite Scroll Magic
    vm.infiniteScroll = {};
    vm.infiniteScroll.numToAdd = 20;
    vm.infiniteScroll.currentItems = 20;

    vm.resetInfScroll = function () {
        vm.infiniteScroll.currentItems = vm.infiniteScroll.numToAdd;
    };
    vm.addMoreItems = function () {
        vm.infiniteScroll.currentItems += vm.infiniteScroll.numToAdd;
    };


    DealerPolicyService.getDealerClients(null)
        .then(function (clients) {
            clients.unshift({ _id: -1, name: "全部机构代理人" });
            vm.clients = clients;
        })

    vm.loadLevel3Companies = function () {
        if (!vm.filterSettings.level2_company) {
            vm.level3Companies = [];
        } else {
            DealerPolicyService.getSubCompanies(vm.filterSettings.level2_company)
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
            DealerPolicyService.getSubCompanies(vm.filterSettings.level3_company)
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

    vm.listType = "all";
    if ($state.is("app.policy.dealer.to-be-reviewed")) {
        vm.listType = "to-be-reviewed";
        vm.filterSettings = localStorageService.get("dealer-review-filterSettings") ? localStorageService.get("dealer-review-filterSettings") : {};
        if (vm.filterSettings.client) {
            DealerPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("dealer-review-fromDate") ? localStorageService.get("dealer-review-fromDate") : undefined;
        vm.toDate = localStorageService.get("dealer-review-toDate") ? localStorageService.get("dealer-review-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("dealer-review-approvedFromDate") ? localStorageService.get("dealer-review-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("dealer-review-approvedToDate") ? localStorageService.get("dealer-review-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("dealer-review-paidFromDate") ? localStorageService.get("dealer-review-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("dealer-review-paidToDate") ? localStorageService.get("dealer-review-paidToDate") : undefined;
        vm.tableHeader = "待审核保单";
    }
    else if ($state.is("app.policy.dealer.to-be-paid")) {
        vm.listType = "to-be-paid";
        vm.filterSettings = localStorageService.get("dealer-filterSettings") ? localStorageService.get("dealer-filterSettings") : {};
        if (vm.filterSettings.client) {
            DealerPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("dealer-fromDate") ? localStorageService.get("dealer-fromDate") : undefined;
        vm.toDate = localStorageService.get("dealer-toDate") ? localStorageService.get("dealer-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("dealer-approvedFromDate") ? localStorageService.get("dealer-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("dealer-approvedToDate") ? localStorageService.get("dealer-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("dealer-paidFromDate") ? localStorageService.get("dealer-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("dealer-paidToDate") ? localStorageService.get("dealer-paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("dealer-swipedFromDate") ? localStorageService.get("dealer-swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("dealer-swipedToDate") ? localStorageService.get("dealer-swipedToDate") : undefined;
        vm.tableHeader = "待支付保单";
    } else if ($state.is("app.policy.dealer.paid")) {
        DealerPolicyService.getLevel2Companies()
            .then(function (level2Companies) {
                vm.level2Companies = level2Companies;

            })
        vm.listType = "paid";
        vm.filterSettings = localStorageService.get("dealer-paid-filterSettings") ? localStorageService.get("dealer-paid-filterSettings") : {};
        vm.loadLevel3Companies();
        vm.loadLevel4Companies();
        if (vm.filterSettings.client) {
            DealerPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("dealer-paid-fromDate") ? localStorageService.get("dealer-paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("dealer-paid-toDate") ? localStorageService.get("dealer-paid-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("dealer-paid-approvedFromDate") ? localStorageService.get("dealer-paid-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("dealer-paid-approvedToDate") ? localStorageService.get("dealer-paid-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("dealer-paid-paidFromDate") ? localStorageService.get("dealer-paid-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("dealer-paid-paidToDate") ? localStorageService.get("dealer-paid-paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("dealer-paid-swipedFromDate") ? localStorageService.get("dealer-paid-swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("dealer-paid-swipedToDate") ? localStorageService.get("dealer-paid-swipedToDate") : undefined;
        vm.tableHeader = "已支付保单";
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        if(vm.entries < 2 && currentPage == 0){
            if ($state.is("app.policy.dealer.to-be-reviewed")) {
                vm.currentPage = localStorageService.get("dealer-review-currentPage");
            }
            else if ($state.is("app.policy.dealer.to-be-paid")) {
                vm.currentPage = localStorageService.get("dealer-currentPage");
            }
            else if ($state.is("app.policy.dealer.paid")) {
                vm.currentPage = localStorageService.get("dealer-paid-currentPage");
            }
            else if ($state.is("app.policy.dealer.rejected")) {
                vm.currentPage = localStorageService.get("dealer-rejected-currentPage");
            }
            vm.entries = vm.entries + 1;
        }else{
            if ($state.is("app.policy.dealer.to-be-reviewed")) {
                localStorageService.set("dealer-review-currentPage", vm.currentPage);
            }
            else if ($state.is("app.policy.dealer.to-be-paid")) {
                localStorageService.set("dealer-currentPage", vm.currentPage);
            }
            else if ($state.is("app.policy.dealer.paid")) {
                localStorageService.set("dealer-paid-currentPage", vm.currentPage);
            }
            else if ($state.is("app.policy.dealer.rejected")) {
                localStorageService.set("dealer-rejected-currentPage", vm.currentPage);
            }
        }
        vm.areAllSelected = false;
        vm.pageItems = pageItems;
        DealerPolicyService.searchPolicies(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate, vm.approvedFromDate, vm.approvedToDate, vm.paidFromDate, vm.paidToDate, vm.swipedFromDate, vm.swipedToDate)
            .then(function (data) {
                vm.policies = data.policies;
                vm.policyTotalCount = data.totalCount;
                vm.selectionChanged();
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("app.policy.dealer.to-be-reviewed")) {
            localStorageService.set("dealer-review-filterSettings", vm.filterSettings);
            localStorageService.set('dealer-review-fromDate', vm.fromDate);
            localStorageService.set('dealer-review-toDate', vm.toDate);
            localStorageService.set('dealer-review-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('dealer-review-approvedToDate', vm.approvedToDate);
            localStorageService.set('dealer-review-paidFromDate', vm.paidFromDate);
            localStorageService.set('dealer-review-paidToDate', vm.paidToDate);
        }
        else if ($state.is("app.policy.dealer.to-be-paid")) {
            localStorageService.set("dealer-filterSettings", vm.filterSettings);
            localStorageService.set('dealer-fromDate', vm.fromDate);
            localStorageService.set('dealer-toDate', vm.toDate);
            localStorageService.set('dealer-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('dealer-approvedToDate', vm.approvedToDate);
            localStorageService.set('dealer-paidFromDate', vm.paidFromDate);
            localStorageService.set('dealer-paidToDate', vm.paidToDate);
            localStorageService.set('dealer-swipedFromDate', vm.swipedFromDate);
            localStorageService.set('dealer-swipedToDate', vm.swipedToDate);
        }
        else if ($state.is("app.policy.dealer.paid")) {
            localStorageService.set("dealer-paid-filterSettings", vm.filterSettings);
            localStorageService.set('dealer-paid-fromDate', vm.fromDate);
            localStorageService.set('dealer-paid-toDate', vm.toDate);
            localStorageService.set('dealer-paid-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('dealer-paid-approvedToDate', vm.approvedToDate);
            localStorageService.set('dealer-paid-paidFromDate', vm.paidFromDate);
            localStorageService.set('dealer-paid-paidToDate', vm.paidToDate);
            localStorageService.set('dealer-paid-swipedFromDate', vm.swipedFromDate);
            localStorageService.set('dealer-paid-swipedToDate', vm.swipedToDate);
        }
        vm.refreshPolicies();
    };

    vm.clientFilterChanged = function () {
        if (vm.clientInfo._id != -1) {
            vm.filterSettings.client = vm.clientInfo._id;
        }
        else {
            vm.filterSettings.client = undefined;
        }

        if ($state.is("app.policy.dealer.to-be-reviewed")) {
            localStorageService.set("dealer-review-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.dealer.to-be-paid")) {
            localStorageService.set("dealer-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.dealer.paid")) {
            localStorageService.set("dealer-paid-filterSettings", vm.filterSettings);
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

    vm.refreshPolicies();

    vm.refreshClicked = function () {
        vm.refreshPolicies();
    }

    vm.exportFilteredPolicies = function () {
        DealerPolicyService.getFilteredCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate, vm.approvedFromDate, vm.approvedToDate, vm.paidFromDate, vm.paidToDate, vm.swipedFromDate, vm.swipedToDate)
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'dealer-statistics.csv'
                })[0].click();
            })
    };

    vm.bulkPay = function () {
        var policyIds = vm.getSelectedPolicyIds();
        $.SmartMessageBox({
            title: "批量修改保单状态",
            content: "确认支付选中的" + vm.selectedPolicies.length + "条保单? 结算共计:" + vm.summary.total_payment.toFixed(2),
            buttons: '[取消][确认]',
            input: "text",
            placeholder: "可填写转账银行与日期备注"
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                var data = {};
                data.policyIds = policyIds;
                data.remarks = value;
                DealerPolicyService.bulkPay(data)
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

    vm.bulkCheck = function () {
        var policyIds = vm.getSelectedPolicyIds();
        $.SmartMessageBox({
            title: "批量修改保单状态",
            content: "确认已核对选中的" + vm.selectedPolicies.length + "条保单?",
            buttons: '[取消][确认]',
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                DealerPolicyService.bulkCheck(policyIds)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已批量更改为已核对",
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
                DealerPolicyService.bulkApprove(policyIds)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已批量更改为待支付",
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


    vm.approve = function (policy) {
        var ids = vm.policies.map(function (item) { return item._id });
        var index = ids.indexOf(policy._id);
        ids.splice(index, 1);
        $state.go("app.policy.dealer.approve", { policyId: policy._id, ids: ids });
    };

    vm.view = function (policy) {
        $state.go("app.policy.dealer.view", { policyId: policy._id });
    };

    vm.selectionChanged = function () {
        if (!vm.policies) {
            vm.summary = { total_income: 0, total_payment: 0 };
            vm.selectedPolicies = [];
            vm.isShowBulkOperationButton = false;
        }
        vm.selectedPolicies = vm.policies.filter(function (item) {
            return item.isSelected
        });

        vm.summary = vm.selectedPolicies.reduce(function (a, b) {
            return { total_income: a.total_income + b.total_income, total_payment: a.total_payment + b.total_payment }
        }, { total_income: 0, total_payment: 0 });
        vm.isShowBulkOperationButton = vm.selectedPolicies.length > 0 && $rootScope.user.userrole.dealerPolicy_to_be_paid.pay;
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
        vm.pageSize = vm.policyTotalCount < 500 ? vm.policyTotalCount : 500;
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
                DealerPolicyService.deletePolicy(policyId)
                    .then(function () {
                        vm.refreshPolicies();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };


});

angular.module('app.policy')
    .filter("computeTotal", function () {
        return function (fieldValueUnused, item) {
            return (item.mandatory_fee + item.commercial_fee);
        }
    })
    .filter("getContact", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            return policy.level4_company ? policy.level4_company.contact : policy.level3_company ? policy.level3_company.contact : policy.level2_company ? policy.level2_company.contact : '';

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
    })
    .filter("getCompany", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            return policy.level4_company ? policy.level4_company.name : policy.level3_company ? policy.level3_company.name : policy.level2_company ? policy.level2_company.name : '';

        }
    });