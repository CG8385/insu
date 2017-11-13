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
        .state('app.organization.all', {
            url: '/organizations',
            data: {
                title: '分支机构'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationListController as vm',
                    templateUrl: 'app/organization/views/organization-list.html'
                }
            }
        })
        .state('app.organization.view', {
            url: '/organizations/view/:organizationId',
            data: {
                title: '分支机构查看'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
        .state('app.organization.new', {
            url: '/organizations/new',
            data: {
                title: '添加分支机构'
            },
            views: {
                "content@app": {
                    controller: 'OrganizationEditorController as vm',
                    templateUrl: 'app/organization/views/organization.html'
                }
            }
        })
});