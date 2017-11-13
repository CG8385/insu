"use strict";


angular.module('app.life-policy', ['ui.router','validation','ui.select'])


angular.module('app.life-policy').config(function ($stateProvider, localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('insu');
    
    $stateProvider
        .state('app.life-policy', {
            abstract: true,
            data: {
                title: '寿险'
            }
        })
        .state('app.life-policy.new', {
            url: '/life-policies/new',
            data: {
                title: '保单录入'
            },
            views: {
                "content@app": {
                    controller: 'LifePolicyEditorController as vm',
                    templateUrl: 'app/life-policy/views/life-policy.html'
                }
            }
        })
        .state('app.life-policy.pay', {
            url: '/life-policies/pay/:policyId',
            data: {
                title: '保单支付'
            },
            views: {
                "content@app": {
                    controller: 'LifePolicyEditorController as vm',
                    templateUrl: 'app/life-policy/views/life-policy.html'
                }
            }
        })
        .state('app.life-policy.view', {
            url: '/life-policies/view/:policyId',
            data: {
                title: '保单查看'
            },
            views: {
                "content@app": {
                    controller: 'LifePolicyEditorController as vm',
                    templateUrl: 'app/life-policy/views/life-policy.html'
                }
            }
        })
        .state('app.life-policy.to-be-paid', {
            url: '/life-policies/to-be-paid',
            data: {
                title: '待支付保单'
            },
            views: {
                "content@app": {
                    controller: 'LifePolicyListController as vm',
                    templateUrl: 'app/life-policy/views/life-policy-list.html'
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
        .state('app.life-policy.paid', {
            url: '/life-policies/paid',
            data: {
                title: '已支付保单'
            },
            views: {
                "content@app": {
                    controller: 'LifePolicyListController as vm',
                    templateUrl: 'app/life-policy/views/life-policy-list-paid.html'
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
        .state('app.life-policy.salary', {
            abstract: true,
            data: {
                title: '寿险'
            }
        })
        .state('app.life-policy.salary.new', {
            url: '/life-salaries/new',
            data: {
                title: '月度主管薪酬结算单录入'
            },
            views: {
                "content@app": {
                    controller: 'LifeSalaryEditorController as vm',
                    templateUrl: 'app/life-policy/views/life-salary.html'
                }
            }
        })
        .state('app.life-policy.salary.list', {
            url: '/life-salaries/list',
            data: {
                title: '月度主管薪酬结算单列表'
            },
            views: {
                "content@app": {
                    controller: 'LifeSalaryListController as vm',
                    templateUrl: 'app/life-policy/views/life-salary-list.html'
                }
            }
        })
        .state('app.life-policy.salary.view', {
            url: '/life-salaries/view/:salaryId',
            data: {
                title: '薪酬结算单查看'
            },
            views: {
                "content@app": {
                    controller: 'LifeSalaryEditorController as vm',
                    templateUrl: 'app/life-policy/views/life-salary.html'
                }
            }
        })
        .state('app.life-policy.statement', {
            abstract: true,
            data: {
                title: '寿险'
            }
        })
        .state('app.life-policy.statement.new', {
            url: '/life-statements/new',
            data: {
                title: '保险公司对账单录入'
            },
            views: {
                "content@app": {
                    controller: 'LifeStatementEditorController as vm',
                    templateUrl: 'app/life-policy/views/life-statement.html'
                }
            }
        })
        .state('app.life-policy.statement.list', {
            url: '/life-statements/list',
            data: {
                title: '保险公司对账单列表'
            },
            views: {
                "content@app": {
                    controller: 'LifeStatementListController as vm',
                    templateUrl: 'app/life-policy/views/life-statement-list.html'
                }
            }
        })
        .state('app.life-policy.statement.view', {
            url: '/life-statements/view/:statementId',
            data: {
                title: '对账单查看'
            },
            views: {
                "content@app": {
                    controller: 'LifeStatementEditorController as vm',
                    templateUrl: 'app/life-policy/views/life-statement.html'
                }
            }
        })
});