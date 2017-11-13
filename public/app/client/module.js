"use strict";


angular.module('app.client', ['ui.router','validation'])


angular.module('app.client').config(function ($stateProvider) {

    $stateProvider
        .state('app.client', {
            abstract: true,
            data: {
                title: '业务员信息管理'
            }
        })
        .state('app.client.organization', {
            url: '/clients/organization',
            data: {
                title: '机构客户'
            },
            views: {
                "content@app": {
                    controller: 'OrgClientListController as vm',
                    templateUrl: 'app/client/views/org-client-list.html'
                }
            }
        })
        .state('app.client.individual', {
            url: '/clients/individual',
            data: {
                title: '个人业务员'
            },
            views: {
                "content@app": {
                    controller: 'IndClientListController as vm',
                    templateUrl: 'app/client/views/ind-client-list.html'
                }
            }
        })
        .state('app.client.manager', {
            url: '/clients/manager',
            data: {
                title: '主管'
            },
            views: {
                "content@app": {
                    controller: 'ManagerClientListController as vm',
                    templateUrl: 'app/client/views/manager-client-list.html'
                }
            }
        })
        .state('app.client.organization.view', {
            url: '/clients/view/:clientId',
            data: {
                title: '机构信息查看'
            },
            views: {
                "content@app": {
                    controller: 'OrgClientEditorController as vm',
                    templateUrl: 'app/client/views/org-client.html'
                }
            }
        })
        .state('app.client.organization.new', {
            url: '/new',
            data: {
                title: '添加机构客户'
            },
            views: {
                "content@app": {
                    controller: 'OrgClientEditorController as vm',
                    templateUrl: 'app/client/views/org-client.html'
                }
            }
        })
        .state('app.client.individual.view', {
            url: '/view/:clientId',
            data: {
                title: '业务员信息查看'
            },
            views: {
                "content@app": {
                    controller: 'IndClientEditorController as vm',
                    templateUrl: 'app/client/views/Ind-client.html'
                }
            }
        })
        .state('app.client.individual.new', {
            url: '/new',
            data: {
                title: '添加业务员'
            },
            views: {
                "content@app": {
                    controller: 'IndClientEditorController as vm',
                    templateUrl: 'app/client/views/Ind-client.html'
                }
            }
        })
        .state('app.client.manager.view', {
            url: '/view/:clientId',
            data: {
                title: '主管信息查看'
            },
            views: {
                "content@app": {
                    controller: 'ManagerClientEditorController as vm',
                    templateUrl: 'app/client/views/manager-client.html'
                }
            }
        })
        .state('app.client.manager.new', {
            url: '/new',
            data: {
                title: '添加主管'
            },
            views: {
                "content@app": {
                    controller: 'ManagerClientEditorController as vm',
                    templateUrl: 'app/client/views/manager-client.html'
                }
            }
        })
});