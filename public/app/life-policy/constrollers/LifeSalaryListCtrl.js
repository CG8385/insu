'use strict'

angular.module('app.life-policy').controller('LifeSalaryListController', function (screenSize, $timeout, $rootScope, $state, $scope, LifePolicyService, localStorageService) {
    var vm = this;
    vm.salaries = [];
    vm.organizations = [];
    
    LifePolicyService.getManagers()
        .then(function (managers) {
            vm.managers = managers;
        })
    LifePolicyService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })

    LifePolicyService.getSellers()
        .then(function (sellers) {
            vm.sellers = sellers;
        })


    vm.filterSettings = localStorageService.get("life－salary-filterSettings") ? localStorageService.get("life-salary-filterSettings") : {};
    vm.tableHeader = "薪酬结算单列表";
    if (screenSize.is('xs, sm')) {
        vm.displayFields = ["manager.name", "taxed_salary_total"];
    }


    vm.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
        vm.currentPage = currentPage;
        vm.pageItems = pageItems;
        LifePolicyService.searchSalaries(currentPage, pageItems, vm.listType, vm.filterSettings)
            .then(function (data) {
                vm.salaries = data.salaries;
                vm.salaryTotalCount = data.totalCount;
            }, function (err) { });
    };

    vm.filterChanged = function () {
        localStorageService.set("life-salary-filterSettings", vm.filterSettings);
        vm.refreshSalaries();
    };

    vm.refreshSalaries = function () {
        if (typeof (vm.currentPage) == 'undefined' || typeof (vm.pageItems) == 'undefined') {
            return;
        }
        vm.onServerSideItemsRequested(vm.currentPage, vm.pageItems);
    };

    var poller = function () {
        vm.refreshSalaries();
        $timeout(poller, 1000 * 60);
    };

    poller();

    vm.exportFilteredSalaries = function () {
        LifePolicyService.getFilteredSalaryCSV(vm.listType, vm.filterSettings)
            .then(function (csv) {
                var file = new Blob(['\ufeff', csv], {
                    type: 'application/csv'
                });
                var fileURL = window.URL.createObjectURL(file);
                var anchor = angular.element('<a/>');
                anchor.attr({
                    href: fileURL,
                    target: '_blank',
                    download: 'salary.csv'
                })[0].click();
            })
    };

    vm.view = function (salaryId) {
        $state.go("app.life-policy.salary.view", { salaryId: salaryId });
    };


    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete = function (salaryId) {
        $.SmartMessageBox({
            title: "删除薪酬结算单",
            content: "确认删除该结算单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                LifePolicyService.deleteSalary(salaryId)
                    .then(function () {
                        vm.refreshSalaries();
                        // vm.refreshSummary();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };


});

