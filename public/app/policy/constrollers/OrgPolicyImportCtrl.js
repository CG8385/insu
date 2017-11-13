'use strict'

angular.module('app.policy').controller('OrgPolicyImportController', function ($scope, $filter, $rootScope, $state, $stateParams, PolicyService, OrgPolicyService) {
    var vm = this;
    vm.clientInfo = null;
    vm.sellerInfo = $rootScope.user;
    vm.level2Companies = [];
    vm.level3Companies = [];
    vm.level4Companies = [];

    PolicyService.getLevel2Companies()
        .then(function (level2Companies) {
            vm.level2Companies = level2Companies;
        })


    vm.loadLevel3Companies = function () {
        if (!vm.level2_company) {
            vm.level3Companies = [];
        } else {
            PolicyService.getSubCompanies(vm.level2_company)
                .then(function (level3Companies) {
                    vm.level3Companies = level3Companies;
                }, function (err) {

                });
        }
    }

    vm.loadLevel4Companies = function () {
        if (!vm.level3_company) {
            vm.level4Companies = [];
        } else {
            PolicyService.getSubCompanies(vm.level3_company)
                .then(function (level4Companies) {
                    vm.level4Companies = level4Companies;
                }, function (err) {

                });
        }
    }

    

    vm.level2Changed = function () {
        if (!vm.level2_company) {
            vm.level1_company = undefined;
        } else {
            var company = vm.level2Companies.find(c => c._id === vm.level2_company);
            vm.level1_company = company.catogory._id;
        }
        vm.loadLevel3Companies();
    }

    vm.level3Changed = function () {
        if (!vm.level3_company) {
            var company = vm.level2Companies.find(c => c._id === vm.level2_company);
        } else {
            var company = vm.level3Companies.find(c => c._id === vm.level3_company);
        }
        vm.loadLevel4Companies();
    }

    vm.level4Changed = function () {

    }

    PolicyService.getOrgClients()
        .then(function (clients) {
            vm.clients = clients;
        })

    vm.fileChanged = function(files) {
        vm.file = files[0];
    };

    vm.isDisableParseButton = function(){
        return (!vm.level2_company || !vm.clientInfo || !vm.file );
    }

    vm.parseFile = function(){
        OrgPolicyService.readExcel(vm.file, vm.level1_company, vm.level2_company, vm.level3_company, vm.level4_company, vm.clientInfo)
            .then(function(policies){
                vm.policies = policies;
        },function(err){
            $.bigBox({
                    title: "文件解析失败",
                    content: err,
                    color: "#C46A69",
                    icon: "fa fa-warning shake animated",
                    timeout: 6000
                });
        })
    }

    vm.submitPolicies = function(){
        OrgPolicyService.savePolicies(vm.policies)
            .then(function(data){
                $.smallBox({
                    title: "服务器确认信息",
                    content: "保单已成功批量保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.policies = [];
                vm.clientInfo = null;
                vm.level1_company = vm.level2_company = vm.level3_company = vm.level4_company = null;
                if (vm.back) {
                    $state.go("app.policy.org-policy.to-be-paid");
                }
            }, function (err) { });              
    }

});
