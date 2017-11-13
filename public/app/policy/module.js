"use strict";


angular.module('app.policy', ['ui.router','validation','ui.select'])


angular.module('app.policy').config(function ($stateProvider, localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('insu');
    
    $stateProvider
        .state('app.policy', {
            abstract: true,
            data: {
                title: '车险'
            }
        })
        .state('app.policy.new', {
            url: '/policies/new',
            data: {
                title: '保单录入'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController as vm',
                    templateUrl: 'app/policy/views/policy.html'
                }
            }
        })
        .state('app.policy.new1', {
            url: '/policies/new1',
            data: {
                title: '保单录入(新版测试)'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController1 as vm',
                    templateUrl: 'app/policy/views/policy1.html'
                }
            }
        })
        .state('app.policy.pay', {
            url: '/policies/pay/:policyId',
            data: {
                title: '保单支付'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController as vm',
                    templateUrl: 'app/policy/views/policy.html'
                }
            }
        })
        .state('app.policy.pay1', {
            url: '/policies/pay1/:policyId',
            data: {
                title: '保单支付'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController1 as vm',
                    templateUrl: 'app/policy/views/policy1.html'
                }
            }
        })
        .state('app.policy.approve', {
            url: '/policies/approve/:policyId',
            data: {
                title: '保单审核'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController as vm',
                    templateUrl: 'app/policy/views/policy.html'
                }
            }
        })
        .state('app.policy.approve1', {
            url: '/policies/approve1/:policyId',
            params: {policyId: null, ids: null},
            data: {
                title: '保单审核'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController1 as vm',
                    templateUrl: 'app/policy/views/policy1.html'
                }
            }
        })
        .state('app.policy.view', {
            url: '/policies/view/:policyId',
            data: {
                title: '保单查看'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController as vm',
                    templateUrl: 'app/policy/views/policy.html'
                }
            }
        })
        .state('app.policy.view1', {
            url: '/policies/view1/:policyId',
            data: {
                title: '保单查看'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController1 as vm',
                    templateUrl: 'app/policy/views/policy1.html'
                }
            }
        })
        .state('app.policy.check1', {
            url: '/policies/check1/:policyId',
            params: {policyId: null, ids: null},
            data: {
                title: '保单核对'
            },
            views: {
                "content@app": {
                    controller: 'PolicyEditorController1 as vm',
                    templateUrl: 'app/policy/views/policy1.html'
                }
            }
        })
        .state('app.policy.to-be-reviewed', {
            url: '/policies/to-be-reviewed',
            data: {
                title: '待审核保单'
            },
            views: {
                "content@app": {
                    controller: 'PolicyListController as vm',
                    templateUrl: 'app/policy/views/policy-review-list.html'
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
        .state('app.policy.rejected', {
            url: '/policies/rejected',
            data: {
                title: '被驳回保单'
            },
            views: {
                "content@app": {
                    controller: 'PolicyListController as vm',
                    templateUrl: 'app/policy/views/policy-rejected-list.html'
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
        .state('app.policy.to-be-paid', {
            url: '/policies/to-be-paid',
            data: {
                title: '待支付保单'
            },
            views: {
                "content@app": {
                    controller: 'PolicyListController as vm',
                    templateUrl: 'app/policy/views/policy-list.html'
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
        .state('app.policy.paid', {
            url: '/policies/paid',
            data: {
                title: '已支付保单'
            },
            views: {
                "content@app": {
                    controller: 'PolicyListController as vm',
                    templateUrl: 'app/policy/views/policy-list-paid.html'
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
        .state('app.policy.checked', {
            url: '/policies/checked',
            data: {
                title: '已核对'
            },
            views: {
                "content@app": {
                    controller: 'PolicyListController as vm',
                    templateUrl: 'app/policy/views/policy-list-checked.html'
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
        .state('app.policy.org-policy', {
            abstract: true,
            data: {
                title: '车商车险'
            }
        })        
        .state('app.policy.org-policy.import', {
            url: '/policies/org-policies/import',
            data: {
                title: '车商保单批量导入'
            },
            views: {
                "content@app": {
                    controller: 'OrgPolicyImportController as vm',
                    templateUrl: 'app/policy/views/org-policy-importer.html'
                }
            }
        })
        .state('app.policy.org-policy.to-be-paid', {
            url: '/policies/org-policies/to-be-paid',
            data: {
                title: '待支付车商保单'
            },
            views: {
                "content@app": {
                    controller: 'OrgPolicyListController as vm',
                    templateUrl: 'app/policy/views/org-policy-list.html'
                }
            }
        })
        .state('app.policy.org-policy.paid', {
            url: '/policies/org-policies/paid',
            data: {
                title: '已支付车商保单'
            },
            views: {
                "content@app": {
                    controller: 'OrgPolicyListController as vm',
                    templateUrl: 'app/policy/views/org-policy-list-paid.html'
                }
            }
        })
});