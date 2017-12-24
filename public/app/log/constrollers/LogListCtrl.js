'use strict'

angular.module('app.log').controller('LogListController', function (screenSize, $timeout, $rootScope, $state, $scope, LogService, localStorageService) {
    var vm = this;
    vm.logs = [];
    vm.operations = [
        "全部操作",
        "微信登录",
        "查询保单",
        "上传照片",
        "web登录",
        "微信端web登录",
        "获取验证码",
        "注册新用户",
        "申请认证",
        "老代理人注册",
        "老代理人绑定",
    ]

    vm.infiniteScroll = {};
    vm.infiniteScroll.numToAdd = 20;
    vm.infiniteScroll.currentItems = 20;

    vm.resetInfScroll = function () {
        vm.infiniteScroll.currentItems = vm.infiniteScroll.numToAdd;
    };
    vm.addMoreItems = function () {
        vm.infiniteScroll.currentItems += vm.infiniteScroll.numToAdd;
    };

    LogService.getClients()
        .then(function (clients) {
            clients.unshift({ _id: -1, name: "全部代理人" });
            vm.clients = clients;
        })

    vm.filterSettings = localStorageService.get("log-filterSettings") ? localStorageService.get("log-filterSettings") : {};
    if (vm.filterSettings.client) {
        LogService.getClient(vm.filterSettings.client)
            .then(function (clientInfo) {
                vm.clientInfo = clientInfo;
            })
    }
    vm.fromDate = localStorageService.get("log-fromDate") ? localStorageService.get("log-fromDate") : undefined;
    vm.toDate = localStorageService.get("log-toDate") ? localStorageService.get("log-toDate") : undefined;
    vm.tableHeader = "代理人系统日志记录";

    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        LogService.searchLogs(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.logs = data.logs;
                vm.logTotalCount = data.totalCount;
            }, function (err) { });
    };

    vm.filterChanged = function () {
        localStorageService.set("log-filterSettings", vm.filterSettings);
        localStorageService.set('log-fromDate', vm.fromDate);
        localStorageService.set('log-toDate', vm.toDate);
        vm.refreshLogs();
    };

    vm.clientFilterChanged = function () {
        if (vm.clientInfo._id != -1) {
            vm.filterSettings.client = vm.clientInfo._id;
        }
        else {
            vm.filterSettings.client = undefined;
        }
        localStorageService.set("log-filterSettings", vm.filterSettings);
        vm.refreshLogs();
    }

    vm.refreshLogs = function () {
        if (typeof (vm.currentPage) == 'undefined' || typeof (vm.pageItems) == 'undefined') {
            return;
        }
        vm.onServerSideItemsRequested(vm.currentPage, vm.pageItems);
    };


    // var poller = function () {
    //     vm.refreshLogs();
    //     $timeout(poller, 1000 * 60);
    // };

    // poller();

});
