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
        .state('app.employee.role', {
            url: '/employees/role',
            data: {
                title: '角色'
            },
            views: {
                "content@app": {
                    controller: 'RoleListController as vm',
                    templateUrl: 'app/employee/views/role-list.html'
                }
            }
        })
        .state('app.employee.user', {
            url: '/employees/user',
            data: {
                title: '员工账号'
            },
            views: {
                "content@app": {
                    controller: 'UserListController as vm',
                    templateUrl: 'app/employee/views/user-list.html'
                }
            }
        })
        .state('app.employee.role.view', {
            url: '／employees/role/view/:roleId',
            data: {
                title: '角色权限查看'
            },
            views: {
                "content@app": {
                    controller: 'RoleEditorController as vm',
                    templateUrl: 'app/employee/views/role.html'
                }
            }
        })
        .state('app.employee.role.new', {
            url: '/new',
            data: {
                title: '添加角色'
            },
            views: {
                "content@app": {
                    controller: 'RoleEditorController as vm',
                    templateUrl: 'app/employee/views/role.html'
                }
            }
        })
        .state('app.employee.user.view', {
            url: '/view/:userId',
            data: {
                title: '员工账号查看'
            },
            views: {
                "content@app": {
                    controller: 'UserEditorController as vm',
                    templateUrl: 'app/employee/views/user.html'
                }
            }
        })
        .state('app.employee.user.new', {
            url: '/new',
            data: {
                title: '添加员工账号'
            },
            views: {
                "content@app": {
                    controller: 'UserEditorController as vm',
                    templateUrl: 'app/employee/views/user.html'
                }
            }
        })

});