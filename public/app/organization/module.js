"use strict";


angular.module('app.organization', ['ui.router','validation'])


angular.module('app.organization').config(function ($stateProvider) {

    $stateProvider
       .state('app.organization', {
            abstract: true,
            data: {
                title: '分支机构管理'
            }
        })
        .state('app.organization.org2', {
            abstract: true,
            data: {
                title: '省公司管理'
            }
        })
        .state('app.organization.org2.all', {
            url: '/organizations/org2',
            data: {
                title: '省公司'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationListController as vm',
                    templateUrl: 'app/organization/views/organization-list.html'
                }
            }
        })
        .state('app.organization.org2.view', {
            url: '/organizations/org2/view/:orgId',
            data: {
                title: '省公司查看'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.org2.new', {
            url: '/organizations/org2/new/:parentId',
            data: {
                title: '添加省公司'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.org3', {
            abstract: true,
            data: {
                title: '市公司管理'
            }
        })
        .state('app.organization.org3.all', {
            url: '/organizations/org3',
            data: {
                title: '市公司'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationListController as vm',
                    templateUrl: 'app/organization/views/organization-list.html'
                }
            }
        })
        .state('app.organization.org3.view', {
            url: '/organizations/org3/view/:orgId',
            data: {
                title: '市公司查看'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.org3.new', {
            url: '/organizations/org3/new/:parentId',
            data: {
                title: '添加市公司'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.org4', {
            abstract: true,
            data: {
                title: '区县公司管理'
            }
        })
        .state('app.organization.org4.all', {
            url: '/organizations/org4',
            data: {
                title: '区县公司'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationListController as vm',
                    templateUrl: 'app/organization/views/organization-list.html'
                }
            }
        })
        .state('app.organization.org4.view', {
            url: '/organizations/org4/view/:orgId',
            data: {
                title: '区县公司查看'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.org4.new', {
            url: '/organizations/org4/new/:parentId',
            data: {
                title: '添加区县公司'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.org5', {
            abstract: true,
            data: {
                title: '营业部管理'
            }
        })
        .state('app.organization.org5.all', {
            url: '/organizations/org5',
            data: {
                title: '营业部'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationListController as vm',
                    templateUrl: 'app/organization/views/organization-list.html'
                }
            }
        })
        .state('app.organization.org5.view', {
            url: '/organizations/org5/view/:orgId',
            data: {
                title: '营业部查看'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.org5.new', {
            url: '/organizations/org5/new/:parentId',
            data: {
                title: '添加营业部'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
});