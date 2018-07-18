"use strict";


angular.module('app.company', ['ui.router','validation'])


angular.module('app.company').config(function ($stateProvider, localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('company');

    $stateProvider
       .state('app.company', {
            abstract: true,
            data: {
                title: '保险公司管理'
            }
        })
        .state('app.company.all', {
            url: '/companies',
            data: {
                title: '保险公司'
            },
            views: {
                "content@app": {
                    controller: 'LegacyCompanyListController as vm',
                    templateUrl: 'app/company/views/legacy-company-list.html'
                }
            }
        })
        .state('app.company.view', {
            url: '/companies/view/:companyId',
            data: {
                title: '保险公司查看'
            },
            views: {
                "content@app": {
                    controller: 'LegacyCompanyEditorController as vm',
                    templateUrl: 'app/company/views/legacy-company.html'
                }
            }
        })
        .state('app.company.new', {
            url: '/companies/new',
            data: {
                title: '添加保险公司'
            },
            views: {
                "content@app": {
                    controller: 'LegacyCompanyEditorController as vm',
                    templateUrl: 'app/company/views/legacy-company.html'
                }
            }
        })
        .state('app.company.companycatogory', {
            abstract: true,
            data: {
                title: '一级保险公司管理'
            }
        })
        .state('app.company.companycatogory.all', {
            url: '/companies/companycatogories',
            data: {
                title: '一级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyCatogoryListController as vm',
                    templateUrl: 'app/company/views/company-catogory-list.html'
                }
            }
        })
        .state('app.company.companycatogory.view', {
            url: '/companies/compnaycatogories/view/:companyCatogoryId',
            data: {
                title: '一级保险公司查看'
            },
            views: {
                "content@app": {
                    controller: 'CompanyCatogoryEditorController as vm',
                    templateUrl: 'app/company/views/company-catogory.html'
                }
            }
        })
        .state('app.company.companycatogory.new', {
            url: '/companies/companycatogories/new',
            data: {
                title: '添加一级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyCatogoryEditorController as vm',
                    templateUrl: 'app/company/views/company-catogory.html'
                }
            }
        })
        .state('app.company.company2', {
            abstract: true,
            data: {
                title: '二级保险公司管理'
            }
        })
        .state('app.company.company2.all', {
            url: '/companies/company2',
            data: {
                title: '二级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyListController as vm',
                    templateUrl: 'app/company/views/company-list.html'
                }
            }
        })
        .state('app.company.company2.view', {
            url: '/companies/company2/view/:companyId',
            data: {
                title: '二级保险公司查看'
            },
            views: {
                "content@app": {
                    controller: 'CompanyEditorController as vm',
                    templateUrl: 'app/company/views/company.html'
                }
            }
        })
        .state('app.company.company2.new', {
            url: '/companies/company2/new/:parentId',
            data: {
                title: '添加二级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyEditorController as vm',
                    templateUrl: 'app/company/views/company.html'
                }
            }
        })
        .state('app.company.company3', {
            abstract: true,
            data: {
                title: '三级保险公司管理'
            }
        })
        .state('app.company.company3.all', {
            url: '/companies/company3',
            data: {
                title: '三级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyListController as vm',
                    templateUrl: 'app/company/views/company-list.html'
                }
            }
        })
        .state('app.company.company3.view', {
            url: '/companies/company3/view/:companyId',
            data: {
                title: '三级保险公司查看'
            },
            views: {
                "content@app": {
                    controller: 'CompanyEditorController as vm',
                    templateUrl: 'app/company/views/company.html'
                }
            }
        })
        .state('app.company.company3.new', {
            url: '/companies/company3/new/:parentId',
            data: {
                title: '添加三级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyEditorController as vm',
                    templateUrl: 'app/company/views/company.html'
                }
            }
        })
        .state('app.company.company4', {
            abstract: true,
            data: {
                title: '四级保险公司管理'
            }
        })
        .state('app.company.company4.all', {
            url: '/companies/company4',
            data: {
                title: '四级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyListController as vm',
                    templateUrl: 'app/company/views/company-list.html'
                }
            }
        })
        .state('app.company.company4.view', {
            url: '/companies/company4/view/:companyId',
            data: {
                title: '四级保险公司查看'
            },
            views: {
                "content@app": {
                    controller: 'CompanyEditorController as vm',
                    templateUrl: 'app/company/views/company.html'
                }
            }
        })
        .state('app.company.company4.new', {
            url: '/companies/company4/new/:parentId',
            data: {
                title: '添加四级保险公司'
            },
            views: {
                "content@app": {
                    controller: 'CompanyEditorController as vm',
                    templateUrl: 'app/company/views/company.html'
                }
            }
        })
        .state('app.company.rule', {
            abstract: true,
            data: {
                title: '费率政策管理'
            }
        })
        .state('app.company.rule.view', {
            url: '/companies/rule/:ruleId',
            data: {
                title: '费率政策'
            },
            params:{
                previousState: null
            },
            views: {
                "content@app": {
                    controller: 'RuleEditorController as vm',
                    templateUrl: 'app/company/views/rule.html'
                }
            }
        })
        .state('app.company.rule.new', {
            url: '/companies/rule/new/:companyId',
            data: {
                title: '添加费率政策'
            },
            params:{
                previousState: null
            },
            views: {
                "content@app": {
                    controller: 'RuleEditorController as vm',
                    templateUrl: 'app/company/views/rule.html'
                }
            }
        }).state('app.company.life-product', {
            abstract: true,
            data: {
                title: '寿险险种管理'
            }
        })
        .state('app.company.life-product.view', {
            url: '/companies/life-product/:productId',
            data: {
                title: '寿险险种'
            },
            params:{
                previousState: null
            },
            views: {
                "content@app": {
                    controller: 'LifeProductEditorController as vm',
                    templateUrl: 'app/company/views/life-product.html'
                }
            }
        })
        .state('app.company.life-product.new', {
            url: '/companies/life-product/new/:companyId',
            data: {
                title: '添加寿险险种'
            },
            params:{
                previousState: null
            },
            views: {
                "content@app": {
                    controller: 'LifeProductEditorController as vm',
                    templateUrl: 'app/company/views/life-product.html'
                }
            }
        })
        .state('app.company.property-product', {
            abstract: true,
            data: {
                title: '财险险种管理'
            }
        })
        .state('app.company.property-product.view', {
            url: '/companies/property-product/:productId',
            data: {
                title: '财险险种'
            },
            params:{
                previousState: null
            },
            views: {
                "content@app": {
                    controller: 'PropertyProductEditorController as vm',
                    templateUrl: 'app/company/views/property-product.html'
                }
            }
        })
        .state('app.company.property-product.new', {
            url: '/companies/property-product/new/:companyId',
            data: {
                title: '添加财险险种'
            },
            params:{
                previousState: null
            },
            views: {
                "content@app": {
                    controller: 'PropertyProductEditorController as vm',
                    templateUrl: 'app/company/views/property-product.html'
                }
            }
        })
        .state('app.company.policyname', {
            abstract: true,
            data: {
                title: '险种名称管理'
            }
        })
        .state('app.company.policyname.all', {
            url: '/companies/policynames',
            data: {
                title: '险种名称'
            },
            views: {
                "content@app": {
                    controller: 'PolicyNameListController as vm',
                    templateUrl: 'app/company/views/policy-name-list.html'
                }
            }
        })
        .state('app.company.policyname.view', {
            url: '/companies/policynames/view/:policyNameId',
            data: {
                title: '险种名称查看'
            },
            views: {
                "content@app": {
                    controller: 'PolicyNameEditorController as vm',
                    templateUrl: 'app/company/views/policy-name.html'
                }
            }
        })
        .state('app.company.policyname.new', {
            url: '/companies/policynames/new',
            data: {
                title: '添加险种名称'
            },
            views: {
                "content@app": {
                    controller: 'PolicyNameEditorController as vm',
                    templateUrl: 'app/company/views/policy-name.html'
                }
            }
        })
});