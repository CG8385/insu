'use strict'

angular.module('app.property-policy').controller('PropertyPolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, PropertyPolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.organizations = [];
    vm.totalIncome = 0;
    vm.totalPayment = 0;
    vm.totalProfit = 0;
    vm.areAllSelected = false;
    vm.summary = { total_income: 0, total_payment: 0, total_profit: 0 };
    vm.pageSize = 15;

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


    PropertyPolicyService.getIndividualClients()
        .then(function (clients) {
            clients.unshift({ _id: -1, name: "全部业务员" });
            vm.clients = clients;
        })
    PropertyPolicyService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })

    PropertyPolicyService.getSellers()
        .then(function (sellers) {
            vm.sellers = sellers;
        })

    vm.loadLevel3Companies = function () {
        if (!vm.filterSettings.level2_company) {
            vm.level3Companies = [];
        } else {
            PropertyPolicyService.getSubCompanies(vm.filterSettings.level2_company)
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
            PropertyPolicyService.getSubCompanies(vm.filterSettings.level3_company)
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
    if ($state.is("app.property-policy.to-be-reviewed")) {
        vm.listType = "to-be-reviewed";
        vm.filterSettings = localStorageService.get("review-filterSettings") ? localStorageService.get("review-filterSettings") : {};
        if (vm.filterSettings.client) {
            PropertyPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("review-fromDate") ? localStorageService.get("review-fromDate") : undefined;
        vm.toDate = localStorageService.get("review-toDate") ? localStorageService.get("review-toDate") : undefined;
        vm.tableHeader = "待审核保单";
    }
    else if ($state.is("app.property-policy.to-be-paid")) {
        vm.listType = "to-be-paid";
        vm.filterSettings = localStorageService.get("filterSettings") ? localStorageService.get("filterSettings") : {};
        if (vm.filterSettings.client) {
            PropertyPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("fromDate") ? localStorageService.get("fromDate") : undefined;
        vm.toDate = localStorageService.get("toDate") ? localStorageService.get("toDate") : undefined;
        vm.tableHeader = "待支付保单";
    } else if ($state.is("app.property-policy.paid")) {
        PropertyPolicyService.getLevel2Companies()
            .then(function (level2Companies) {
                vm.level2Companies = level2Companies;

            })
        vm.listType = "paid";
        vm.filterSettings = localStorageService.get("paid-filterSettings") ? localStorageService.get("paid-filterSettings") : {};
        vm.loadLevel3Companies();
        vm.loadLevel4Companies();
        if (vm.filterSettings.client) {
            PropertyPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("paid-fromDate") ? localStorageService.get("paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("paid-toDate") ? localStorageService.get("paid-toDate") : undefined;
        vm.tableHeader = "已支付保单";
    } else if ($state.is("app.property-policy.rejected")) {
        vm.listType = "rejected";
        vm.filterSettings = localStorageService.get("rejected") ? localStorageService.get("rejected") : {};
        if (vm.filterSettings.client) {
            PropertyPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("rejected-fromDate") ? localStorageService.get("rejected-fromDate") : undefined;
        vm.toDate = localStorageService.get("rejected-toDate") ? localStorageService.get("rejected-toDate") : undefined;
        vm.tableHeader = "被驳回保单";
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        vm.areAllSelected = false;
        vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        PropertyPolicyService.searchPolicies(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.policies = data.policies;
                vm.policyTotalCount = data.totalCount;
                vm.selectionChanged();
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("app.property-policy.to-be-reviewed")) {
            localStorageService.set("review-filterSettings", vm.filterSettings);
            localStorageService.set('review-fromDate', vm.fromDate);
            localStorageService.set('review-toDate', vm.toDate);
        }
        else if ($state.is("app.property-policy.to-be-paid")) {
            localStorageService.set("filterSettings", vm.filterSettings);
            localStorageService.set('fromDate', vm.fromDate);
            localStorageService.set('toDate', vm.toDate);
        }
        else if ($state.is("app.property-policy.paid")) {
            localStorageService.set("paid-filterSettings", vm.filterSettings);
            localStorageService.set('paid-fromDate', vm.fromDate);
            localStorageService.set('paid-toDate', vm.toDate);
        }
        else if ($state.is("app.property-policy.rejected")) {
            localStorageService.set("rejected-filterSettings", vm.filterSettings);
            localStorageService.set('rejected-fromDate', vm.fromDate);
            localStorageService.set('rejected-toDate', vm.toDate);
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

        if ($state.is("app.property-policy.to-be-reviewed")) {
            localStorageService.set("review-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.property-policy.to-be-paid")) {
            localStorageService.set("filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.property-policy.paid")) {
            localStorageService.set("paid-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.property-policy.checked")) {
            localStorageService.set("checked-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.property-policy.rejected")) {
            localStorageService.set("rejected-filterSettings", vm.filterSettings);
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
        PropertyPolicyService.getSummary(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.totalIncome = data.total_income;
                vm.totalPayment = data.total_payment;
                vm.totalProfit = data.total_profit;
            }, function (err) { });
    };

    vm.refreshPolicies();

    vm.refreshClicked = function () {
        vm.refreshPolicies();
    }

    vm.exportFilteredPolicies = function () {
        PropertyPolicyService.getFilteredCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'property_policies.csv'
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
                PropertyPolicyService.bulkPay(data)
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
                PropertyPolicyService.bulkApprove(policyIds)
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

    vm.pay = function (policy) {
            var created = new Date(policy.created_at);
            $state.go("app.property-policy.pay", { policyId: policy._id, ids: ids });            
    };

    vm.reject = function (policy) {
        $.SmartMessageBox({
            title: "驳回保单",
            content: "确认驳回该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                policy.policy_status = "被驳回";
                PropertyPolicyService.savePolicy(policy)
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


    vm.approve = function (policy) {
            var ids = vm.policies.map(function (item) { return item._id });
            var index = ids.indexOf(policy._id);
            ids.splice(index, 1);
            $state.go("app.property-policy.approve", { policyId: policy._id, ids: ids });
    };

    vm.view = function (policy) {
            $state.go("app.property-policy.view", { policyId: policy._id });

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
        if(vm.selectedPolicies.length == 0){
            vm.isShowBulkOperationButton = false;
        }else if ($state.is("app.property-policy.to-be-reviewed")){
            vm.isShowBulkOperationButton = $rootScope.user.userrole.property_policy_to_be_reviewed.aprove;
        }else if ($state.is("app.property-policy.to-be-paid")){
            vm.isShowBulkOperationButton = $rootScope.user.userrole.property_policy_to_be_paid.pay;
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
                PropertyPolicyService.deletePolicy(policyId)
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

angular.module('app.property-policy')
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
    .filter("getCompany", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            return policy.company ? policy.company.name : policy.level4_company ? policy.level4_company.name : policy.level3_company ? policy.level3_company.name : policy.level2_company ? policy.level2_company.name : '';

        }
    });