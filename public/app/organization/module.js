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
                title: '二级机构管理'
            }
        })
        .state('app.organization.org2.all', {
            url: '/organizations/org2',
            data: {
                title: '二级机构'
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
                title: '二级机构查看'
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
                title: '添加二级机构'
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
                title: '三级机构管理'
            }
        })
        .state('app.organization.org3.all', {
            url: '/organizations/org3',
            data: {
                title: '三级机构'
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
                title: '三级机构查看'
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
                title: '添加三级机构'
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
                title: '四级机构管理'
            }
        })
        .state('app.organization.org4.all', {
            url: '/organizations/org4',
            data: {
                title: '四级机构'
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
                title: '四级机构查看'
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
                title: '添加四级机构'
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
                title: '五级机构管理'
            }
        })
        .state('app.organization.org5.all', {
            url: '/organizations/org5',
            data: {
                title: '五级机构'
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
                title: '五级机构查看'
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
                title: '添加五级机构'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
});