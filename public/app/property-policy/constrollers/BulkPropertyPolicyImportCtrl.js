'use strict'

angular.module('app.property-policy').controller('BulkPropertyPolicyImportController', function ($scope, $filter, $rootScope, $state, $stateParams, PropertyPolicyService, BulkPropertyPolicyService) {
    var vm = this;
    vm.clientInfo = null;
    vm.sellerInfo = $rootScope.user;
    vm.level2Companies = [];
    vm.level3Companies = [];
    vm.level4Companies = [];

    vm.level2Orgs = [];
    vm.level3Orgs = [];
    vm.level4Orgs = [];
    vm.level5Orgs = [];

    PropertyPolicyService.getLevel2Companies()
        .then(function (level2Companies) {
            vm.level2Companies = level2Companies;
        })


    vm.loadLevel3Companies = function () {
        if (!vm.level2_company) {
            vm.level3Companies = [];
        } else {
            PropertyPolicyService.getSubCompanies(vm.level2_company)
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
            PropertyPolicyService.getSubCompanies(vm.level3_company)
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

    // vm.loadLevel2Orgs = function () {
    //     PropertyPolicyService.getLevel2Orgs()
    //         .then(function (level2Orgs) {
    //             vm.level2Orgs = level2Orgs;
    //         }, function (err) {
    //         });
    // }

    // vm.loadLevel3Orgs = function () {
    //     if (!vm.user.level2_org) {
    //         vm.level3Orgs = [];
    //     } else {
    //         PropertyPolicyService.getSubOrgs(vm.user.level2_org)
    //             .then(function (level3Orgs) {
    //                 vm.level3Orgs = level3Orgs;
    //             }, function (err) {

    //             });
    //     }
    // }

    // vm.loadLevel4Orgs = function () {
    //     if (!vm.user.level3_org) {
    //         vm.level4Orgs = [];
    //     } else {
    //         PropertyPolicyService.getSubOrgs(vm.user.level3_org)
    //             .then(function (level4Orgs) {
    //                 vm.level4Orgs = level4Orgs;
    //             }, function (err) {

    //             });
    //     }
    // }

    // vm.loadLevel5Orgs = function () {
    //     if (!vm.user.level4_org) {
    //         vm.level5Orgs = [];
    //     } else {
    //         PropertyPolicyService.getSubOrgs(vm.user.level4_org)
    //             .then(function (level5Orgs) {
    //                 vm.level5Orgs = level5Orgs;
    //             }, function (err) {

    //             });
    //     }
    // }

    // vm.loadLevel2Orgs();

    // ///
    // vm.level2OrgChanged = function () {
    //     delete vm.level3_org;
    //     delete vm.level4_org;
    //     delete vm.level5_org;
    //     if(vm.level2_org){
    //         vm.org = vm.level2_org;
    //     }else{
    //         vm.org = vm.level2Orgs[0].parent;
    //     }
        
    //     vm.loadLevel3Orgs();
    // }

    // vm.level3OrgChanged = function () {
    //     delete vm.level4_org;
    //     delete vm.level5_org;
    //     if(vm.level3_org){
    //         vm.org = vm.level3_org;
    //     }else{
    //         vm.org = vm.level2_org;
    //     }
    //     vm.loadLevel4Orgs();
    // }

    // vm.level4OrgChanged = function () {
    //     delete vm.level5_org;
    //     if(vm.level4_org){
    //         vm.org = vm.level4_org;
    //     }else{
    //         vm.org = vm.level3_org;
    //     }
    //     vm.loadLevel5Orgs();
    // }

    // vm.level5OrgChanged = function () {
    //     if(vm.level5_org){
    //         vm.org = vm.level5_org;
    //     }else{
    //         vm.org = vm.level4_org;
    //     }
    // }

    ///

    PropertyPolicyService.getIndividualClients()
        .then(function (clients) {
            vm.clients = clients;
        })

    vm.fileChanged = function(files) {
        vm.file = files[0];
    };

    vm.isDisableParseButton = function(){
        return (!vm.level2_company || !vm.clientInfo || !vm.file || !vm.policy_photo);
    }

    vm.parseFile = function(){
        BulkPropertyPolicyService.readExcel(
            vm.file, 
            vm.level1_company, 
            vm.level2_company, 
            vm.level3_company, 
            vm.level4_company, 
            vm.clientInfo,
            vm.policy_photo
        ).then(function(policies){
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
        BulkPropertyPolicyService.savePolicies(vm.policies)
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
                    $state.go("app.property-policy.bulk-property-policy.to-be-paid");
                }
            }, function (err) { });              
    }

    vm.policyPhotoChanged = function (files) {
        vm.uploadPolicyPhoto(files[0]);
    };

    vm.uploadPolicyPhoto = function (file) {
        PropertyPolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy_photo = fileName;
            })
    }

    vm.deletePolicyPhoto = function () {
        delete vm.policy_photo;
    };

});
