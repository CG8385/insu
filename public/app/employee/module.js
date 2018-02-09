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
        .state('app.employee.recorder', {
            url: '/employees/recorder',
            data: {
                title: '后台录单员'
            },
            views: {
                "content@app": {
                    controller: 'RecorderListController as vm',
                    templateUrl: 'app/employee/views/recorder-list.html'
                }
            }
        })
        .state('app.employee.dealer', {
            url: '/employees/dealer',
            data: {
                title: '渠道录单员'
            },
            views: {
                "content@app": {
                    controller: 'DealerListController as vm',
                    templateUrl: 'app/employee/views/dealer-list.html'
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
                    controller: ' UserEditorController as vm',
                    templateUrl: 'app/employee/views/user.html'
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
            url: '/employees/finance/view/:userId',
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
            url: '/employees/finance/new',
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
        .state('app.employee.recorder.view', {
            url: '/employees/recorder/view/:userId',
            data: {
                title: '后台录单员账号查看'
            },
            views: {
                "content@app": {
                    controller: 'RecorderEditorController as vm',
                    templateUrl: 'app/employee/views/recorder.html'
                }
            }
        })
        .state('app.employee.recorder.new', {
            url: '/employees/recorder/new',
            data: {
                title: '添加后台录单员账号'
            },
            views: {
                "content@app": {
                    controller: 'RecorderEditorController as vm',
                    templateUrl: 'app/employee/views/recorder.html'
                }
            }
        })
        .state('app.employee.dealer.view', {
            url: '/employees/dealer/view/:userId',
            data: {
                title: '渠道录单员账号查看'
            },
            views: {
                "content@app": {
                    controller: 'DealerEditorController as vm',
                    templateUrl: 'app/employee/views/dealer.html'
                }
            }
        })
        .state('app.employee.dealer.new', {
            url: '/employees/dealer/new',
            data: {
                title: '添加渠道录单员账号'
            },
            views: {
                "content@app": {
                    controller: 'DealerEditorController as vm',
                    templateUrl: 'app/employee/views/dealer.html'
                }
            }
        })
});