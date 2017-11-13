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

    // vm.refreshSummary = function () {

    //     LifePolicyService.getSummary(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
    //         .then(function (data) {
    //             vm.totalIncome = data.total_income;
    //             vm.totalPayment = data.total_payment;
    //             vm.totalProfit = data.total_profit;
    //         }, function (err) { });
    // };




    var poller = function () {
        if ($rootScope.user.role == "出单员") {
            return;
        }
        vm.refreshSalaries();
        // vm.refreshSummary();
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

    // vm.bulkPay = function () {
    //     $.SmartMessageBox({
    //         title: "批量修改保单状态",
    //         content: "确认已支付筛选出的所有保单？结算费共计:" + vm.totalPayment.toFixed(2),
    //         buttons: '[取消][确认]'
    //     }, function (ButtonPressed) {
    //         if (ButtonPressed === "确认") {
    //             LifePolicyService.bulkPay(vm.listType, vm.filterSettings, vm.fromDate, vm.toDate)
    //                 .then(function (data) {
    //                     $.smallBox({
    //                         title: "服务器确认信息",
    //                         content: "保单状态已批量更改为已支付",
    //                         color: "#739E73",
    //                         iconSmall: "fa fa-check",
    //                         timeout: 5000
    //                     });
    //                     vm.refreshPolicies();
    //                     vm.refreshSummary();
    //                 }, function (err) {

    //                 });
    //         }
    //         if (ButtonPressed === "取消") {

    //         }

    //     });



    // };

    // vm.isShowPayButton = function (policy) {
    //     return $rootScope.user.role == "财务" && policy.policy_status == "待支付";
    // };

    vm.isShowDeleteButton = function (salary) {
        if ($rootScope.user.role == "管理员") return true;
        return $rootScope.user.role == "出单员";
    };

    vm.isShowViewButton = function (salary) {
        return true;
    };

    // vm.pay = function (policyId) {
    //     $state.go("app.life-policy.pay", { policyId: policyId });
    // };

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

