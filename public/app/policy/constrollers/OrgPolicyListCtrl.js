'use strict'

angular.module('app.policy').controller('OrgPolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, PolicyService, OrgPolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.areAllSelected = false;
    vm.summary = {income:0, payment:0, profit:0};
    vm.pageSize = 15;

    vm.totalIncome = 0;
    vm.totalPayment = 0;
    vm.totalProfit = 0;


    PolicyService.getOrgClients()
        .then(function (clients) {
            clients.unshift({ _id: -1, name: "全部车商" });
            vm.clients = clients;
        })

    vm.listType = "all";
    if ($state.is("app.policy.org-policy.to-be-paid")) {
        vm.listType = "to-be-paid";
        vm.filterSettings = localStorageService.get("org-to-be-paid-filterSettings") ? localStorageService.get("org-to-be-paid-filterSettings") : {};
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("org-to-be-paid-fromDate") ? localStorageService.get("org-to-be-paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("org-to-be-paid-toDate") ? localStorageService.get("org-to-be-paid-toDate") : undefined;
        vm.tableHeader = "待支付车商保单";
    } else if ($state.is("app.policy.org-policy.paid")) {
        vm.listType = "paid";
        vm.filterSettings = localStorageService.get("org-paid-filterSettings") ? localStorageService.get("org-paid-filterSettings") : {};
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("org-paid-fromDate") ? localStorageService.get("org-paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("org-paid-toDate") ? localStorageService.get("org-paid-toDate") : undefined;
        vm.tableHeader = "已支付车商保单";
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        vm.areAllSelected = false;
        vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        OrgPolicyService.searchPolicies(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.policies = data.policies;
                vm.policyTotalCount = data.totalCount;
                vm.selectionChanged();
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("app.policy.org-policy.to-be-paid")) {
            localStorageService.set("org-to-be-paid-filterSettings", vm.filterSettings);
            localStorageService.set('org-to-be-paid-fromDate', vm.fromDate);
            localStorageService.set('org-to-be-paid-toDate', vm.toDate);
        }
        else if ($state.is("app.policy.org-policy.paid")) {
            localStorageService.set("org-paid-filterSettings", vm.filterSettings);
            localStorageService.set('org-paid-fromDate', vm.fromDate);
            localStorageService.set('org-paid-toDate', vm.toDate);
        }
        vm.refreshPolicies();
        vm.refreshSummary();
    };

    vm.clientFilterChanged = function () {
        if (vm.clientInfo._id != -1) {
            vm.filterSettings.client = vm.clientInfo._id;
        }
        else {
            vm.filterSettings.client = undefined;
        }

        if ($state.is("app.policy.org-policy.to-be-paid")) {
            localStorageService.set("org-to-be-paid-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.org-policy.paid")) {
            localStorageService.set("org-paid-filterSettings", vm.filterSettings);
        }
        vm.refreshPolicies();
        vm.refreshSummary();
    }
    vm.refreshPolicies = function () {
        if (typeof (vm.currentPage) == 'undefined' || typeof (vm.pageItems) == 'undefined') {
            return;
        }
        vm.pageSize = 15;
        vm.onServerSideItemsRequested(vm.currentPage, vm.pageItems);
        vm.refreshSummary();
    };

    vm.refreshSummary = function () {
        OrgPolicyService.getSummary(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.totalIncome = data.total_income;
                vm.totalPayment = data.total_payment;
                vm.totalProfit = data.total_profit;
            }, function (err) { });
    };

    

    vm.refreshPolicies();
    vm.refreshSummary();

    vm.refreshClicked = function(){
        vm.refreshPolicies();
        vm.refreshSummary();
    }

    vm.exportFilteredPolicies = function () {
        OrgPolicyService.getFilteredCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'org-statistics.csv'
                })[0].click();
            })
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

    vm.bulkPay = function () {
        var policyIds = vm.getSelectedPolicyIds();
        $.SmartMessageBox({
            title: "批量修改保单状态",
            content: "确认支付选中的" + vm.selectedPolicies.length + "条保单? 结算费共计:" + vm.summary.payment.toFixed(2),
            buttons: '[取消][确认]',
            input: "text",
            placeholder: "可填写转账银行与日期备注"
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                var data = {};
                data.policyIds = policyIds;
                data.remarks = value;
                OrgPolicyService.bulkPay(data)
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

    vm.bulkDelete = function () {
        var policyIds = vm.getSelectedPolicyIds();
        $.SmartMessageBox({
            title: "批量删除保单",
            content: "确认删除选中的" + vm.selectedPolicies.length + "条保单?",
            buttons: '[取消][确认]'
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                OrgPolicyService.bulkDelete(policyIds)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单已成功删除",
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

    vm.selectionChanged = function(){
        if (!vm.policies){
            vm.summary = {income:0, payment:0, profit:0};
            vm.selectedPolicies = [];
            vm.isShowBulkPayButton = false;
        }
        vm.selectedPolicies = vm.policies.filter(function (item) {
            return item.isSelected
        });

        vm.summary = vm.selectedPolicies.reduce(function(a,b){
            return {income: a.income + b.income, payment: a.payment + b.payment, profit: a.income + b.income - a.payment - b.payment}
        }, {income:0, payment:0, profit:0});
        vm.isShowBulkPayButton = vm.selectedPolicies.length > 0;
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

    vm.showAll = function(){
        vm.pageSize = vm.policyTotalCount < 300 ? vm.policyTotalCount : 300;
    }


});

angular.module('app.policy')
    .filter("getCompanyName", function () {
        return function (fieldValueUnused, item) {
            if (item.level4_company) {
                return item.level4_company.name;
            }
            else if (item.level3_company) {
                return item.level3_company.name;
            }
            else {
                return item.level2_company.name;
            }
        }
    })
    .filter("combinePlate", function () {
        return function (fieldValueUnused, item) {
            return (item.plate_no);
        }
    });
