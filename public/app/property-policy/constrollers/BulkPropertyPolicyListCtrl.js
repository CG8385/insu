'use strict'

angular.module('app.property-policy').controller('BulkPropertyPolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, PropertyPolicyService, BulkPropertyPolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.areAllSelected = false;
    vm.summary = { income: 0, payment: 0, profit: 0 };
    vm.pageSize = 15;
    vm.entries = 0;

    vm.totalIncome = 0;
    vm.totalPayment = 0;
    vm.totalProfit = 0;

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
    //////////


    vm.loadLevel3Orgs = function () {
        if (!vm.filterSettings.level2_org) {
            vm.level3Orgs = [];
        } else {
            PropertyPolicyService.getSubOrgs(vm.filterSettings.level2_org)
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
            PropertyPolicyService.getSubOrgs(vm.filterSettings.level3_org)
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
            PropertyPolicyService.getSubOrgs(vm.filterSettings.level4_org)
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

    PropertyPolicyService.getIndividualClients()
        .then(function (clients) {
            clients.unshift({ _id: -1, name: "全部代理人" });
            vm.clients = clients;
        })

    PropertyPolicyService.getLevel2Companies()
        .then(function (level2Companies) {
            vm.level2Companies = level2Companies;

        })

    PropertyPolicyService.getLevel2Orgs()
        .then(function (level2Orgs) {
            vm.level2Orgs = level2Orgs;

        })

    vm.listType = "all";
    if ($state.is("app.property-policy.bulk-property-policy.to-be-paid")) {
        vm.listType = "to-be-paid";
        vm.filterSettings = localStorageService.get("bulk-property-to-be-paid-filterSettings") ? localStorageService.get("bulk-property-to-be-paid-filterSettings") : {};
        if (vm.filterSettings.client) {
            PropertyPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("bulk-property-to-be-paid-fromDate") ? localStorageService.get("bulk-property-to-be-paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("bulk-property-to-be-paid-toDate") ? localStorageService.get("bulk-property-to-be-paid-toDate") : undefined;
        vm.tableHeader = "待支付批量车险保单";
    } else if ($state.is("app.property-policy.bulk-property-policy.paid")) {
        vm.listType = "paid";
        vm.filterSettings = localStorageService.get("bulk-property-paid-filterSettings") ? localStorageService.get("bulk-property-paid-filterSettings") : {};
        if (vm.filterSettings.client) {
            PropertyPolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("bulk-property-paid-fromDate") ? localStorageService.get("bulk-property-paid-fromDate") : undefined;
        vm.toDate = localStorageService.get("bulk-property-paid-toDate") ? localStorageService.get("bulk-property-paid-toDate") : undefined;
        vm.tableHeader = "已支付批量车险保单";
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        if (vm.entries < 3 && currentPage == 0) {
            if ($state.is("property-policy.bulk-property-policy.to-be-paid")) {
                vm.currentPage = localStorageService.get("bulk-property-currentPage");
            }
            else if ($state.is("property-policy.bulk-property-policy.paid")) {
                vm.currentPage = localStorageService.get("bulk-property-paid-currentPage");
            }
            vm.entries = vm.entries + 1;
        } else {
            if ($state.is("property-policy.bulk-property-policy.to-be-paid")) {
                localStorageService.set("bulk-property-currentPage", vm.currentPage);
            }
            else if ($state.is("property-policy.bulk-property-policy.paid")) {
                localStorageService.set("bulk-property-paid-currentPage", vm.currentPage);
            }
        }

        vm.areAllSelected = false;
        vm.pageItems = pageItems;
        BulkPropertyPolicyService.searchPolicies(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.policies = data.policies;
                vm.policyTotalCount = data.totalCount;
                vm.selectionChanged();
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("property-policy.bulk-property-policy.to-be-paid")) {
            localStorageService.set("bulk-property-to-be-paid-filterSettings", vm.filterSettings);
            localStorageService.set('bulk-property-to-be-paid-fromDate', vm.fromDate);
            localStorageService.set('bulk-property-to-be-paid-toDate', vm.toDate);
        }
        else if ($state.is("property-policy.bulk-property-policy.paid")) {
            localStorageService.set("bulk-property-paid-filterSettings", vm.filterSettings);
            localStorageService.set('bulk-property-paid-fromDate', vm.fromDate);
            localStorageService.set('bulk-property-paid-toDate', vm.toDate);
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

        if ($state.is("property-policy.bulk-property-policy.to-be-paid")) {
            localStorageService.set("bulk-property-to-be-paid-filterSettings", vm.filterSettings);
        }
        else if ($state.is("property-policy.bulk-property-policy.paid")) {
            localStorageService.set("bulk-property-paid-filterSettings", vm.filterSettings);
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
        BulkPropertyPolicyService.getFilteredCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
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

    vm.delete = function (policyId) {
        $.SmartMessageBox({
            title: "删除保单",
            content: "确认删除该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                BulkPropertyPolicyService.deletePolicy(policyId)
                    .then(function () {
                        vm.refreshPolicies();
                    })
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
                BulkPropertyPolicyService.bulkPay(data)
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
                BulkPropertyPolicyService.bulkDelete(policyIds)
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

    vm.selectionChanged = function () {
        if (!vm.policies) {
            vm.summary = { income: 0, payment: 0, profit: 0 };
            vm.selectedPolicies = [];
            vm.isShowBulkPayButton = false;
        }
        vm.selectedPolicies = vm.policies.filter(function (item) {
            return item.isSelected
        });

        vm.summary = vm.selectedPolicies.reduce(function (a, b) {
            return { income: a.income + b.income, payment: a.payment + b.payment, profit: a.income + b.income - a.payment - b.payment }
        }, { income: 0, payment: 0, profit: 0 });
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

    vm.showAll = function () {
        vm.pageSize = vm.policyTotalCount < 300 ? vm.policyTotalCount : 300;
    }

    vm.getPhotoUrl = function (policy) {
        return appConfig.policyOssUrl + policy.policy_photo + "?x-oss-process=style/resize";

        // return "http://hy-policy.oss-cn-shanghai.aliyuncs.com/" + policy.policy_photo;
    }


});

angular.module('app.property-policy')
    .filter("getCompany", function () {
        return function (fieldValueUnused, item) {
            var policy = item
            return policy.level4_company ? policy.level4_company.name : policy.level3_company ? policy.level3_company.name : policy.level2_company ? policy.level2_company.name : '';

        }
    });
