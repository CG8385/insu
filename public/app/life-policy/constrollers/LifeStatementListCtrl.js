'use strict'

angular.module('app.life-policy').controller('LifeStatementListController', function (screenSize, $timeout, $rootScope, $state, $scope, LifePolicyService, localStorageService) {
    var vm = this;
    vm.statements = [];
    vm.companies = [];

    LifePolicyService.getSellers()
        .then(function (sellers) {
            vm.sellers = sellers;
        })
    LifePolicyService.getCompanies()
        .then(function (companies) {
            vm.companies = companies;
        })


    vm.filterSettings = localStorageService.get("life－statement-filterSettings") ? localStorageService.get("life-statement-filterSettings") : {};
    vm.fromDate = localStorageService.get("statement-fromDate") ? localStorageService.get("statement-fromDate") : undefined;
    vm.toDate = localStorageService.get("statement-toDate") ? localStorageService.get("statement-toDate") : undefined;
    vm.tableHeader = "保险公司对账单列表";


    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        LifePolicyService.searchStatements(currentPage, pageItems, vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (data) {
                vm.statements = data.statements;
                vm.statementTotalCount = data.totalCount;
            }, function (err) { });
    };

    vm.filterChanged = function () {
        localStorageService.set("life-statement-filterSettings", vm.filterSettings);
        localStorageService.set('statement-fromDate', vm.fromDate);
        localStorageService.set('statement-toDate', vm.toDate);
        vm.refreshStatements();
        // vm.refreshSummary();
    };

    vm.refreshStatements = function () {
        if (typeof (vm.currentPage) == 'undefined' || typeof (vm.pageItems) == 'undefined') {
            return;
        }
        vm.onServerSideItemsRequested(vm.currentPage, vm.pageItems);
    };

    var poller = function () {
        if ($rootScope.user.role == "出单员") {
            return;
        }
        vm.refreshStatements();
        $timeout(poller, 1000 * 60 * 5);
    };

    poller();

    vm.exportFilteredStatements = function () {
        LifePolicyService.getFilteredStatementCSV(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'statement.csv'
                })[0].click();
            })
    };


    vm.isShowDeleteButton = function (statement) {
        if ($rootScope.user.role == "管理员") return true;
        return $rootScope.user.role == "出单员";
    };

    vm.isShowViewButton = function (salary) {
        return true;
    };

    vm.view = function (statementId) {
        $state.go("app.life-policy.statement.view", { statementId: statementId });
    };


    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete = function (statementId) {
        $.SmartMessageBox({
            title: "删除保险公司对账单",
            content: "确认删除该对账单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                LifePolicyService.deleteStatement(statementId)
                    .then(function () {
                        vm.refreshStatements();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };


});

