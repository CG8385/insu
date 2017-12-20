'use strict'

angular.module('app.policy').controller('ImagePolicyListController', function (screenSize, $timeout, $rootScope, $state, $scope, PolicyService, localStorageService) {
    var vm = this;
    vm.policies = [];
    vm.areAllSelected = false;
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


    PolicyService.getClients()
        .then(function (clients) {
            clients.unshift({ _id: -1, name: "全部业务员" });
            vm.clients = clients;
        })

    vm.listType = "all";
    if ($state.is("app.policy.image-policy.to-be-processed")) {
        vm.listType = "to-be-processed";
        vm.filterSettings = localStorageService.get("image-policy-filterSettings") ? localStorageService.get("image-policy-filterSettings") : {};
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("image-policy-fromDate") ? localStorageService.get("image-policy-fromDate") : undefined;
        vm.toDate = localStorageService.get("image-policy-toDate") ? localStorageService.get("image-policy-toDate") : undefined;
        vm.tableHeader = "待录入保单照片";
    }
    else if ($state.is("app.policy.image-policy.processed")) {
        vm.listType = "processed";
        vm.filterSettings = localStorageService.get("image-policy-processed") ? localStorageService.get("image-policy-processed") : {};
        if (vm.filterSettings.client) {
            PolicyService.getClient(vm.filterSettings.client)
                .then(function (clientInfo) {
                    vm.clientInfo = clientInfo;
                })
        }
        vm.fromDate = localStorageService.get("image-policy-processed-fromDate") ? localStorageService.get("image-policy-processed-fromDate") : undefined;
        vm.toDate = localStorageService.get("image-policy-processed-toDate") ? localStorageService.get("image-policy-processed-toDate") : undefined;
        vm.tableHeader = "已录入保单照片";
    }

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        vm.areAllSelected = false;
        vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        PolicyService.searchImagePolicies(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.policies = data.imagePolicies;
                vm.policyTotalCount = data.totalCount;
                vm.selectionChanged();
            }, function (err) { });
    };

    vm.filterChanged = function () {
        if ($state.is("app.policy.image-policy.to-be-processed")) {
            localStorageService.set("image-policy-filterSettings", vm.filterSettings);
            localStorageService.set('image-policy-fromDate', vm.fromDate);
            localStorageService.set('image-policy-toDate', vm.toDate);
        }
        else if ($state.is("app.policy.image-policy.processed")) {
            localStorageService.set("image-policy-processed", vm.filterSettings);
            localStorageService.set('image-policy-processed-fromDate', vm.fromDate);
            localStorageService.set('image-policy-processed-toDate', vm.toDate);
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

        if ($state.is("app.policy.image-policy.to-be-processed")) {
            localStorageService.set("image-policy-filterSettings", vm.filterSettings);
        }
        else if ($state.is("app.policy.image-policy.processed")) {
            localStorageService.set("image-policy-processed", vm.filterSettings);
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

    vm.bulkProcess = function () {
        var ids = vm.getSelectedIds();
        $.SmartMessageBox({
            title: "批量修改保单照片状态",
            content: "确认已录入选中的" + vm.selectedPolicies.length + "条保单照片?",
            buttons: '[取消][确认]',
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                PolicyService.bulkProcessImagePolicies(ids)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单照片状态已批量更改为已录入",
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

    vm.getSelectedIds = function () {
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

    vm.isShowProcessButton = function (imagePolicy) {
        return imagePolicy.status == "待录入";
    };

    vm.selectionChanged = function () {
        if (!vm.policies) {
            vm.selectedPolicies = [];
            vm.isShowBulkOperationButton = false;
        }
        vm.selectedPolicies = vm.policies.filter(function (item) {
            return item.isSelected
        });
        vm.isShowBulkOperationButton = vm.selectedPolicies.length > 0;
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

    vm.str2bytes = function (str) {
        var bytes = new Uint8Array(str.length);
        for (var i=0; i<str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes;
    }

    vm.downloadToBeProcessedImages = function () {
        PolicyService.downloadToBeProcessedImages()
            .then(function (zip) {
                var file = new Blob([zip], {
                    type: 'application/zip'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'images.zip'
                })[0].click();
            })
    };


    vm.process = function (imagePolicy) {
        $.SmartMessageBox({
            title: "修改保单照片状态",
            content: "确认已录入该保单？",
            buttons: '[取消][确认]',
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                PolicyService.processImagePolicy(imagePolicy._id)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单照片状态已更改为已录入",
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
    }

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete = function (id) {
        $.SmartMessageBox({
            title: "删除保单",
            content: "确认删除该保单照片？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                PolicyService.deleteImagePolicy(id)
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