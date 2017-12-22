"use strict";


angular.module('app.log', ['ui.router','validation','ui.select'])


angular.module('app.log').config(function ($stateProvider, localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('insu');
    
    $stateProvider
        .state('app.log', {
            url: '/logs',
            data: {
                title: '日志信息'
            },
            views: {
                "content@app": {
                    controller: 'LogListController as vm',
                    templateUrl: 'app/log/views/log-list.html'
                }
            },
            resolve: {
                srcipts: function(lazyScript){
                    return lazyScript.register([
                        'datatables',
                        'datatables-bootstrap',
                        'datatables-colvis',
                        'datatables-tools',
                        'datatables-responsive'
                    ])

                }
            }
        })
});