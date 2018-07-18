"use strict";


angular.module('app.property-policy', ['ui.router','validation','ui.select'])


angular.module('app.property-policy').config(function ($stateProvider, localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('property-policy');
    
    $stateProvider
        .state('app.property-policy', {
            abstract: true,
            data: {
                title: '财险'
            }
        })
        .state('app.property-policy.new', {
            url: '/property-policies/new',
            data: {
                title: '保单录入'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyEditorController as vm',
                    templateUrl: 'app/property-policy/views/property-policy.html'
                }
            }
        })
        .state('app.property-policy.pay', {
            url: '/property-policies/pay/:policyId',
            data: {
                title: '保单支付'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyEditorController as vm',
                    templateUrl: 'app/property-policy/views/property-policy.html'
                }
            }
        })
        .state('app.property-policy.approve', {
            url: '/property-policies/approve/:policyId',
            data: {
                title: '保单审核'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyEditorController as vm',
                    templateUrl: 'app/property-policy/views/property-policy.html'
                }
            }
        })
        .state('app.property-policy.view', {
            url: '/property-policies/view/:policyId',
            data: {
                title: '保单查看'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyEditorController as vm',
                    templateUrl: 'app/property-policy/views/property-policy.html'
                }
            }
        })
        .state('app.property-policy.to-be-reviewed', {
            url: '/property-policies/to-be-reviewed',
            data: {
                title: '待审核保单'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyListController as vm',
                    templateUrl: 'app/property-policy/views/property-policy-review-list.html'
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
        .state('app.property-policy.rejected', {
            url: '/property-policies/rejected',
            data: {
                title: '被驳回保单'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyListController as vm',
                    templateUrl: 'app/property-policy/views/property-policy-rejected-list.html'
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
        .state('app.property-policy.to-be-paid', {
            url: '/property-policies/to-be-paid',
            data: {
                title: '待支付保单'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyListController as vm',
                    templateUrl: 'app/property-policy/views/property-policy-list-to-be-paid.html'
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
        .state('app.property-policy.paid', {
            url: '/property-policies/paid',
            data: {
                title: '已支付保单'
            },
            views: {
                "content@app": {
                    controller: 'PropertyPolicyListController as vm',
                    templateUrl: 'app/property-policy/views/property-policy-list-paid.html'
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
        .state('app.property-policy.bulk-property-policy', {
            abstract: true,
            data: {
                title: '批量财险'
            }
        })        
        .state('app.property-policy.bulk-property-policy.import', {
            url: '/property-policies/bulk-property-policies/import',
            data: {
                title: '财险批量导入'
            },
            views: {
                "content@app": {
                    controller: 'BulkPropertyPolicyImportController as vm',
                    templateUrl: 'app/property-policy/views/bulk-property-policy-importer.html'
                }
            }
        })
        .state('app.property-policy.bulk-property-policy.to-be-paid', {
            url: '/policies/bulk-property-policies/to-be-paid',
            data: {
                title: '待支付批量财险'
            },
            views: {
                "content@app": {
                    controller: 'BulkPropertyPolicyListController as vm',
                    templateUrl: 'app/property-policy/views/bulk-property-policy-list.html'
                }
            }
        })
        .state('app.property-policy.bulk-property-policy.paid', {
            url: '/policies/bulk-property-policies/paid',
            data: {
                title: '已支付批量财险'
            },
            views: {
                "content@app": {
                    controller: 'BulkPropertyPolicyListController as vm',
                    templateUrl: 'app/property-policy/views/bulk-property-policy-list-paid.html'
                }
            }
        })
});