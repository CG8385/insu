'use strict'

angular.module('app.policy').controller('PolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, PolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.organizations = [];
    vm.totalIncome = 0;
    vm.totalPayment = 0;
    vm.totalProfit = 0;
    vm.areAllSelected = false;
    vm.summary = { total_income: 0, total_payment: 0, total_profit: 0 };
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


    PolicyService.getIndividualClients()
        .then(function (clients) {
            clients.unshift({ _id: -1, name: "全部业务员" });
            vm.clients = clients;
        })
    PolicyService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })

    PolicyService.getSellers()
        .then(function (sellers) {
            vm.sellers = sellers;
        })

    vm.loadLevel3Companies = function () {
        if (!vm.filterSettings.level2_company) {
            vm.level3Companies = [];
        } else {
            PolicyService.getSubCompanies(vm.filterSettings.level2_company)
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
            PolicyService.getSubCompanies(vm.filterSettings.level3_company)
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
            PolicyService.getSubOrgs(vm.filterSettings.level2_org)
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
            PolicyService.getSubOrgs(vm.filterSettings.level3_org)
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
            PolicyService.getSubOrgs(vm.filterSettings.level4_org)
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
    if ($state.is("app.policy.to-be-reviewed")) {
        PolicyService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;

            })
        vm.listType = "to-be-reviewed";
        vm.filterSettings = localStorageService.get("review-filterSettings") ? localStorageService.get("review-filterSettings") : {};
        vm.loadLevel3Orgs();
        vm.loadLevel4Orgs();
        vm.loadLevel5Orgs();
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.policyNoSearch = localStorageService.get("review-policyNoSearch") ? localStorageService.get("review-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("review-fromDate") ? localStorageService.get("review-fromDate") : undefined;
        vm.toDate = localStorageService.get("review-toDate") ? localStorageService.get("review-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("review-approvedFromDate") ? localStorageService.get("review-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("review-approvedToDate") ? localStorageService.get("review-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("review-paidFromDate") ? localStorageService.get("review-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("review-paidToDate") ? localStorageService.get("review-paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("review-swipedFromDate") ? localStorageService.get("review-swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("review-swipedToDate") ? localStorageService.get("review-swipedToDate") : undefined;
        vm.tableHeader = "待审核保单";
        if (screenSize.is('xs, sm')) {
            vm.displayFields = ["client.name", "plate"];
        }
    }
    else if ($state.is("app.policy.to-be-paid")) {
        PolicyService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;

            })
        vm.listType = "to-be-paid";
        vm.filterSettings = localStorageService.get("filterSettings") ? localStorageService.get("filterSettings") : {};
        vm.loadLevel3Orgs();
        vm.loadLevel4Orgs();
        vm.loadLevel5Orgs();
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.policyNoSearch = localStorageService.get("policyNoSearch") ? localStorageService.get("policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("fromDate") ? localStorageService.get("fromDate") : undefined;
        vm.toDate = localStorageService.get("toDate") ? localStorageService.get("toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("approvedFromDate") ? localStorageService.get("approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("approvedToDate") ? localStorageService.get("approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("paidFromDate") ? localStorageService.get("paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("paidToDate") ? localStorageService.get("paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("swipedFromDate") ? localStorageService.get("swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("swipedToDate") ? localStorageService.get("swipedToDate") : undefined;
        vm.tableHeader = "待支付保单";
        if (screenSize.is('xs, sm')) {
            vm.displayFields = ["client.name", "plate"];
        }
    } else if ($state.is("app.policy.paid")) {
        PolicyService.getLevel2Companies()
            .then(function (level2Companies) {
                vm.level2Companies = level2Companies;

            })
        vm.listType = "paid";
        vm.filterSettings = localStorageService.get("paid-filterSettings") ? localStorageService.get("paid-filterSettings") : {};
        vm.loadLevel3Companies();
        vm.loadLevel4Companies();
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.policyNoSearch = localStorageService.get("paid-policyNoSearch") ? localStorageService.get("paid-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("paid-fromDate") ? localStorageService.get("paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("paid-toDate") ? localStorageService.get("paid-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("paid-approvedFromDate") ? localStorageService.get("paid-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("paid-approvedToDate") ? localStorageService.get("paid-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("paid-paidFromDate") ? localStorageService.get("paid-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("paid-paidToDate") ? localStorageService.get("paid-paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("paid-swipedFromDate") ? localStorageService.get("paid-swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("paid-swipedToDate") ? localStorageService.get("paid-swipedToDate") : undefined;
        vm.tableHeader = "已支付保单";
        if (screenSize.is('xs, sm')) {
            vm.displayFields = ["client.name", "plate", "paid_at"];
        }
    } else if ($state.is("app.policy.reminder")) {
        PolicyService.getLevel2Companies()
            .then(function (level2Companies) {
                vm.level2Companies = level2Companies;

            })
        PolicyService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;

            })
        vm.listType = "reminder";
        vm.filterSettings = localStorageService.get("reminder-filterSettings") ? localStorageService.get("reminder-filterSettings") : {};
        vm.loadLevel3Orgs();
        vm.loadLevel4Orgs();
        vm.loadLevel5Orgs();
        vm.loadLevel3Companies();
        vm.loadLevel4Companies();
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.policyNoSearch = localStorageService.get("reminder-policyNoSearch") ? localStorageService.get("reminder-policyNoSearch") : undefined;
        vm.expireFromDate = localStorageService.get("reminder-expireFromDate") ? localStorageService.get("reminder-expireFromDate") : undefined;
        vm.expireToDate = localStorageService.get("reminder-expireToDate") ? localStorageService.get("reminder-expireToDate") : undefined;
        var today = new Date();
        today.setHours(0, 0, 0, 1);

        if (vm.expireFromDate && vm.expireFromDate < today) {
            vm.expireFromDate = today;
        }
        var fourtyDaysLater = today;
        fourtyDaysLater.setDate(today.getDate() + 40);
        fourtyDaysLater.setHours(23, 59, 59, 0);
        if (vm.expireToDate && vm.expireToDate > fourtyDaysLater) {
            vm.expireToDate = fourtyDaysLater;
        }
        vm.tableHeader = "待续期保单";
    }
    else if ($state.is("app.policy.all")) {
        PolicyService.getLevel2Companies()
            .then(function (level2Companies) {
                vm.level2Companies = level2Companies;

            })
        PolicyService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;

            })
        vm.listType = "all";
        vm.filterSettings = localStorageService.get("all-filterSettings") ? localStorageService.get("all-filterSettings") : {};

        vm.loadLevel3Orgs();
        vm.loadLevel4Orgs();
        vm.loadLevel5Orgs();
        vm.loadLevel3Companies();
        vm.loadLevel4Companies();
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.policyNoSearch = localStorageService.get("all-policyNoSearch") ? localStorageService.get("all-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("all-fromDate") ? localStorageService.get("all-fromDate") : undefined;
        vm.toDate = localStorageService.get("all-toDate") ? localStorageService.get("all-toDate") : undefined;
        vm.tableHeader = "综合查看";
    }
    else if ($state.is("app.policy.rejected")) {
        vm.listType = "rejected";
        vm.filterSettings = localStorageService.get("rejected") ? localStorageService.get("rejected") : {};
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.policyNoSearch = localStorageService.get("rejected-policyNoSearch") ? localStorageService.get("rejected-policyNoSearch") : undefined;
        vm.fromDate = localStorageService.get("rejected-fromDate") ? localStorageService.get("rejected-fromDate") : undefined;
        vm.toDate = localStorageService.get("rejected-toDate") ? localStorageService.get("rejected-toDate") : undefined;
        vm.approvedFromDate = localStorageService.get("rejected-approvedFromDate") ? localStorageService.get("rejected-approvedFromDate") : undefined;
        vm.approvedToDate = localStorageService.get("rejected-approvedToDate") ? localStorageService.get("rejected-approvedToDate") : undefined;
        vm.paidFromDate = localStorageService.get("rejected-paidFromDate") ? localStorageService.get("rejected-paidFromDate") : undefined;
        vm.paidToDate = localStorageService.get("rejected-paidToDate") ? localStorageService.get("rejected-paidToDate") : undefined;
        vm.swipedFromDate = localStorageService.get("rejected-swipedFromDate") ? localStorageService.get("rejected-swipedFromDate") : undefined;
        vm.swipedToDate = localStorageService.get("rejected-swipedToDate") ? localStorageService.get("rejected-swipedToDate") : undefined;
        vm.tableHeader = "被驳回保单";
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {

        if (vm.entries < 2 && currentPage == 0) {
            if ($state.is("app.policy.to-be-reviewed")) {
                vm.currentPage = localStorageService.get("review-currentPage");
            }
            else if ($state.is("app.policy.to-be-paid")) {
                vm.currentPage = localStorageService.get("currentPage");
            }
            else if ($state.is("app.policy.paid")) {
                vm.currentPage = localStorageService.get("paid-currentPage");
            }
            else if ($state.is("app.policy.rejected")) {
                vm.currentPage = localStorageService.get("rejected-currentPage");
            }
            else if ($state.is("app.policy.reminder")) {
                vm.currentPage = localStorageService.get("reminder-currentPage");
            }
            else if ($state.is("app.policy.all")) {
                vm.currentPage = localStorageService.get("all-currentPage");
            }
            vm.entries = vm.entries + 1;
        } else {
            if ($state.is("app.policy.to-be-reviewed")) {
                localStorageService.set("review-currentPage", vm.currentPage);
            }
            else if ($state.is("app.policy.to-be-paid")) {
                localStorageService.set("currentPage", vm.currentPage);
            }
            else if ($state.is("app.policy.paid")) {
                localStorageService.set("paid-currentPage", vm.currentPage);
            }
            else if ($state.is("app.policy.rejected")) {
                localStorageService.set("rejected-currentPage", vm.currentPage);
            }
            else if ($state.is("app.policy.reminder")) {
                localStorageService.set("rejected-reminder", vm.currentPage);
            }
            else if ($state.is("app.policy.all")) {
                localStorageService.set("rejected-all", vm.currentPage);
            }
        }
        vm.pageItems = pageItems;
        vm.areAllSelected = false;
        PolicyService.searchPolicies(vm.currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate, vm.approvedFromDate, vm.approvedToDate, vm.paidFromDate, vm.paidToDate, vm.expireFromDate, vm.expireToDate, vm.swipedFromDate, vm.swipedToDate, vm.policyNoSearch)
            .then(function (data) {
                vm.policies = data.policies;
                vm.policyTotalCount = data.totalCount;
                vm.selectionChanged();
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("app.policy.to-be-reviewed")) {
            localStorageService.set("review-filterSettings", vm.filterSettings);
            localStorageService.set('review-fromDate', vm.fromDate);
            localStorageService.set('review-toDate', vm.toDate);
            localStorageService.set('review-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('review-approvedToDate', vm.approvedToDate);
            localStorageService.set('review-paidFromDate', vm.paidFromDate);
            localStorageService.set('review-paidToDate', vm.paidToDate);
            localStorageService.set('review-swipedFromDate', vm.paidFromDate);
            localStorageService.set('review-swipedToDate', vm.paidToDate);
            localStorageService.set('review-policyNoSearch', vm.policyNoSearch);
        }
        else if ($state.is("app.policy.to-be-paid")) {
            localStorageService.set("filterSettings", vm.filterSettings);
            localStorageService.set('fromDate', vm.fromDate);
            localStorageService.set('toDate', vm.toDate);
            localStorageService.set('approvedFromDate', vm.approvedFromDate);
            localStorageService.set('approvedToDate', vm.approvedToDate);
            localStorageService.set('paidFromDate', vm.paidFromDate);
            localStorageService.set('paidToDate', vm.paidToDate);
            localStorageService.set('swipedFromDate', vm.paidFromDate);
            localStorageService.set('swipedToDate', vm.paidToDate);
            localStorageService.set('policyNoSearch', vm.policyNoSearch);
        }
        else if ($state.is("app.policy.paid")) {
            localStorageService.set("paid-filterSettings", vm.filterSettings);
            localStorageService.set('paid-fromDate', vm.fromDate);
            localStorageService.set('paid-toDate', vm.toDate);
            localStorageService.set('paid-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('paid-approvedToDate', vm.approvedToDate);
            localStorageService.set('paid-paidFromDate', vm.paidFromDate);
            localStorageService.set('paid-paidToDate', vm.paidToDate);
            localStorageService.set('paid-swipedFromDate', vm.paidFromDate);
            localStorageService.set('paid-swipedToDate', vm.paidToDate);
            localStorageService.set('paid-policyNoSearch', vm.policyNoSearch);
        }
        else if ($state.is("app.policy.reminder")) {
            localStorageService.set("reminder-filterSettings", vm.filterSettings);
            localStorageService.set('reminder-expireFromDate', vm.　expireFromDate);
            localStorageService.set('reminder-expireToDate', vm.expireToDate);
            localStorageService.set('reminder-policyNoSearch', vm.policyNoSearch);
        }
        else if ($state.is("app.policy.rejected")) {
            localStorageService.set("rejected-filterSettings", vm.filterSettings);
            localStorageService.set('rejected-fromDate', vm.fromDate);
            localStorageService.set('rejected-toDate', vm.toDate);
            localStorageService.set('rejected-approvedFromDate', vm.approvedFromDate);
            localStorageService.set('rejected-approvedToDate', vm.approvedToDate);
            localStorageService.set('rejected-paidFromDate', vm.paidFromDate);
            localStorageService.set('rejected-paidToDate', vm.paidToDate);
            localStorageService.set('rejected-swipedFromDate', vm.paidFromDate);
            localStorageService.set('rejected-swipedToDate', vm.paidToDate);
            localStorageService.set('rejected-policyNoSearch', vm.policyNoSearch);
        }
        else if ($state.is("app.policy.all")) {
            localStorageService.set("all-filterSettings", vm.filterSettings);
            localStorageService.set('all-fromDate', vm.　fromDate);
            localStorageService.set('all-toDate', vm.toDate);
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

        if ($state.is("app.policy.to-be-reviewed")) {
            localStorageService.set("review-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.to-be-paid")) {
            localStorageService.set("filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.paid")) {
            localStorageService.set("paid-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.checked")) {
            localStorageService.set("checked-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.rejected")) {
            localStorageService.set("rejected-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.all")) {
            localStorageService.set("all-filterSettings", vm.filterSettings);
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

    vm.refreshSummary = function () {
        PolicyService.getSummary(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.totalIncome = data.total_income;
                vm.totalPayment = data.total_payment;
                vm.totalProfit = data.total_profit;
            }, function (err) { });
    };

    // vm.refreshPolicies();

    vm.refreshClicked = function () {
        vm.refreshPolicies();
    }

    vm.exportFilteredPolicies = function () {
        PolicyService.getFilteredCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate, vm.approvedFromDate, vm.approvedToDate, vm.paidFromDate, vm.paidToDate, vm.expireFromDate, vm.expireToDate, vm.swipedFromDate, vm.swipedToDate, vm.policyNoSearch)
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'statistics.csv'
                })[0].click();
            })
    };

    vm.bulkPay = function () {
        var policyIds = vm.getSelectedPolicyIds();
        $.SmartMessageBox({
            title: "批量修改保单状态",
            content: "确认支付选中的" + vm.selectedPolicies.length + "条保单? 结算费共计:" + vm.summary.total_payment.toFixed(2),
            buttons: '[取消][确认]',
            input: "text",
            placeholder: "可填写转账银行与日期备注"
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                var data = {};
                data.policyIds = policyIds;
                data.remarks = value;
                PolicyService.bulkPay(data)
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
                PolicyService.bulkCheck(policyIds)
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
                PolicyService.bulkApprove(policyIds)
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

    vm.pay = function (policy) {
        if ($state.is("app.policy.to-be-reviewed")) {
            localStorageService.set("review-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.to-be-paid")) {
            localStorageService.set("currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.paid")) {
            localStorageService.set("paid-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.rejected")) {
            localStorageService.set("rejected-currentPage", vm.currentPage);
        }
        if (!policy.level2_company) {
            var created = new Date(policy.created_at);
            if (created.getFullYear() < 2017) {
                $state.go("app.policy.pay", { policyId: policy._id }); //this is from old version
            } else {
                $state.go("app.policy.pay1", { policyId: policy._id, ids: ids });
            }
        } else {
            $state.go("app.policy.pay1", { policyId: policy._id });
        }
    };

    vm.reject = function (policy) {
        $.SmartMessageBox({
            title: "驳回保单",
            content: "确认驳回该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                policy.policy_status = "被驳回";
                PolicyService.savePolicy(policy)
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



    vm.ignore = function (policy) {
        $.SmartMessageBox({
            title: "忽略续期提醒",
            content: "确认忽略该续期提醒？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                policy.stop_reminder = true;
                PolicyService.savePolicy(policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "该保单不会再提醒续期",
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


    vm.approve = function (policy) {
        if ($state.is("app.policy.to-be-reviewed")) {
            localStorageService.set("review-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.to-be-paid")) {
            localStorageService.set("currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.paid")) {
            localStorageService.set("paid-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.rejected")) {
            localStorageService.set("rejected-currentPage", vm.currentPage);
        }
        if (!policy.level2_company) {
            var created = new Date(policy.created_at);
            if (created.getFullYear() < 2017) {
                $state.go("app.policy.approve", { policyId: policy._id }); //this is from old version
            } else {
                var ids = vm.policies.map(function (item) { return item._id });
                var index = ids.indexOf(policy._id);
                ids.splice(index, 1);
                $state.go("app.policy.approve1", { policyId: policy._id, ids: ids });
            }

        } else {
            var ids = vm.policies.map(function (item) { return item._id });
            var index = ids.indexOf(policy._id);
            ids.splice(index, 1);
            $state.go("app.policy.approve1", { policyId: policy._id, ids: ids });
        }
    };

    vm.view = function (policy, readonly=false) {
        if ($state.is("app.policy.to-be-reviewed")) {
            localStorageService.set("review-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.to-be-paid")) {
            localStorageService.set("currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.paid")) {
            localStorageService.set("paid-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.rejected")) {
            localStorageService.set("rejected-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.reminder")) {
            localStorageService.set("reminder-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.all")) {
            localStorageService.set("all-currentPage", vm.currentPage);
        }
        if (!policy.level2_company) {
            var created = new Date(policy.created_at);
            if (created.getFullYear() < 2017) {
                $state.go("app.policy.view", { policyId: policy._id }); //this is from old version
            } else {
                $state.go("app.policy.view1", { policyId: policy._id, ids: ids, readonly: readonly });
            }
        } else {
            $state.go("app.policy.view1", { policyId: policy._id, readonly: readonly });
        }

    };

    vm.clone = function (policy) {
        if ($state.is("app.policy.to-be-reviewed")) {
            localStorageService.set("review-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.to-be-paid")) {
            localStorageService.set("currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.paid")) {
            localStorageService.set("paid-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.rejected")) {
            localStorageService.set("rejected-currentPage", vm.currentPage);
        }
        else if ($state.is("app.policy.reminder")) {
            localStorageService.set("reminder-currentPage", vm.currentPage);
        }
        $state.go("app.policy.new1", { parentPolicy: policy });
    };

    vm.selectionChanged = function () {
        if (!vm.policies) {
            vm.summary = { income: 0, payment: 0, profit: 0 };
            vm.selectedPolicies = [];
            vm.isShowBulkOperationButton = false;
        }
        vm.selectedPolicies = vm.policies.filter(function (item) {
            return item.isSelected
        });

        vm.summary = vm.selectedPolicies.reduce(function (a, b) {
            return { total_income: a.total_income + b.total_income, total_payment: a.total_payment + b.total_payment, total_profit: a.total_income + b.total_income - a.total_payment - b.total_payment }
        }, { total_income: 0, total_payment: 0, total_profit: 0 });
        if (vm.selectedPolicies.length == 0) {
            vm.isShowBulkOperationButton = false;
        } else if ($state.is("app.policy.to-be-reviewed")) {
            vm.isShowBulkOperationButton = $rootScope.user.userrole.policy_to_be_reviewed.aprove;
        } else if ($state.is("app.policy.to-be-paid")) {
            vm.isShowBulkOperationButton = $rootScope.user.userrole.policy_to_be_paid.pay;
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
                PolicyService.deletePolicy(policyId)
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

angular.module('app.policy')
    .filter("computeTotal", function () {
        return function (fieldValueUnused, item) {
            return (item.mandatory_fee + item.commercial_fee + item.tax_fee);
        }
    })
    .filter("combinePlate", function () {
        return function (fieldValueUnused, item) {
            return (item.plate_no);
        }
    })
    .filter("getContact", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            return policy.company ? policy.company.contact : policy.level4_company ? policy.level4_company.contact : policy.level3_company ? policy.level3_company.contact : policy.level2_company ? policy.level2_company.contact : '';

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
    .filter("getExpireDate", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            if (!policy.effective_date) {
                return '';
            }
            var expireDate = new Date(policy.effective_date);
            expireDate.setFullYear(expireDate.getFullYear() + 1);
            var month = '' + (expireDate.getMonth() + 1),
                day = '' + expireDate.getDate(),
                year = expireDate.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return [year, month, day].join('-');
        }
    })
    .filter("getCompany", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            return policy.company ? policy.company.name : policy.level4_company ? policy.level4_company.name : policy.level3_company ? policy.level3_company.name : policy.level2_company ? policy.level2_company.name : '';

        }
    });