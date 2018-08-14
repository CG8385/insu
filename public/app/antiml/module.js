"use strict";


angular.module('app.antiml', ['ui.router','validation','ui.select'])


angular.module('app.antiml').config(function ($stateProvider, localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('antiml');

    $stateProvider
        .state('app.antiml', {
            abstract: true,
            data: {
                title: '反洗钱'
            }
        })
        .state('app.antiml.blacklist', {
            url: '/antiml/blacklist',
            data: {
                title: '黑名单'
            },
            views: {
                "content@app": {
                    controller: 'BMemberListController as vm',
                    templateUrl: 'app/antiml/views/bmember-list.html'
                }
            }
        })
        .state('app.antiml.blacklist.new', {
            url: '/new',
            data: {
                title: '添加黑名单'
            },
            views: {
                "content@app": {
                    controller: 'BMemberEditorController as vm',
                    templateUrl: 'app/antiml/views/bmember.html'
                }
            }
        })
        .state('app.antiml.blacklist.view', {
            //url: '/antiml/blacklist/view/:bmemberId',
            url: '/view/:bmemberId',
            data: {
                title: '黑名单用户详情'
            },
            views: {
                "content@app": {
                    controller: 'BMemberEditorController as vm',
                    templateUrl: 'app/antiml/views/bmember.html'
                }
            }
        })
        .state('app.antiml.susp-transaction', {
            url: '/antiml/transactions',
            data: {
                title: '可疑交易'
            },
            views: {
                "content@app": {
                    controller: 'SuspTransactionListController as vm',
                    templateUrl: 'app/antiml/views/transaction-list.html'
                }
            }
        })
        .state('app.antiml.susp-transaction.view', {
            //url: '/antiml/transactions/view/:transId',
            url: '/view/:transId',
            data: {
                title: '可疑交易详情'
            },
            views: {
                "content@app": {
                    controller: 'SuspTransactionEditorController as vm',
                    templateUrl: 'app/antiml/views/transaction.html'
                }
            }
        })
});