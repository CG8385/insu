"use strict";


angular.module('app.employee', ['ui.router','validation'])


angular.module('app.employee').config(function ($stateProvider) {

    $stateProvider
        .state('app.employee', {
            abstract: true,
            data: {
                title: '员工账号管理'
            }
        })
        .state('app.employee.seller', {
            url: '/employees/seller',
            data: {
                title: '出单员'
            },
            views: {
                "content@app": {
                    controller: 'SellerListController as vm',
                    templateUrl: 'app/employee/views/seller-list.html'
                }
            }
        })
        .state('app.employee.finance', {
            url: '/employees/finance',
            data: {
                title: '财务'
            },
            views: {
                "content@app": {
                    controller: 'FinanceListController as vm',
                    templateUrl: 'app/employee/views/finance-list.html'
                }
            }
        })
        .state('app.employee.seller.view', {
            url: '/view/:userId',
            data: {
                title: '出单员账号查看'
            },
            views: {
                "content@app": {
                    controller: 'SellerEditorController as vm',
                    templateUrl: 'app/employee/views/seller.html'
                }
            }
        })
        .state('app.employee.seller.new', {
            url: '/new',
            data: {
                title: '添加出单员'
            },
            views: {
                "content@app": {
                    controller: 'SellerEditorController as vm',
                    templateUrl: 'app/employee/views/seller.html'
                }
            }
        })
        .state('app.employee.finance.view', {
            url: '/view/:userId',
            data: {
                title: '财务账号查看'
            },
            views: {
                "content@app": {
                    controller: 'FinanceEditorController as vm',
                    templateUrl: 'app/employee/views/finance.html'
                }
            }
        })
        .state('app.employee.finance.new', {
            url: '/new',
            data: {
                title: '添加财务账号'
            },
            views: {
                "content@app": {
                    controller: 'FinanceEditorController as vm',
                    templateUrl: 'app/employee/views/finance.html'
                }
            }
        })
});