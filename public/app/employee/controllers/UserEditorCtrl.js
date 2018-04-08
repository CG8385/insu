'use strict'

angular.module('app.employee').controller('UserEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, EmployeeService) {
    var vm = this;
    vm.user = {};
    vm.editable = false;
    vm.organizations=[];
    vm.roles=[];

    vm.level2Orgs = [];
    vm.level3Orgs = [];
    vm.level4Orgs = [];
    vm.level5Orgs = [];

    vm.loadLevel2Orgs = function () {
        EmployeeService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;
            }, function (err) {
            });
    }

    vm.loadLevel3Orgs = function () {
        if (!vm.user.level2_org) {
            vm.level3Orgs = [];
        } else {
            EmployeeService.getSubOrgs(vm.user.level2_org)
                .then(function (level3Orgs) {
                    vm.level3Orgs = level3Orgs;
                }, function (err) {

                });
        }
    }

    vm.loadLevel4Orgs = function () {
        if (!vm.user.level3_org) {
            vm.level4Orgs = [];
        } else {
            EmployeeService.getSubOrgs(vm.user.level3_org)
                .then(function (level4Orgs) {
                    vm.level4Orgs = level4Orgs;
                }, function (err) {

                });
        }
    }

    vm.loadLevel5Orgs = function () {
        if (!vm.user.level4_org) {
            vm.level5Orgs = [];
        } else {
            EmployeeService.getSubOrgs(vm.user.level4_org)
                .then(function (level5Orgs) {
                    vm.level5Orgs = level5Orgs;
                }, function (err) {

                });
        }
    }

    vm.loadLevel2Orgs();


    vm.level2Changed = function () {
        delete vm.user.level3_org;
        delete vm.user.level4_org;
        delete vm.user.level5_org;
        if(vm.user.level2_org){
            vm.user.org = vm.user.level2_org;
        }else{
            vm.user.org = vm.level2Orgs[0].parent;
        }
        
        vm.loadLevel3Orgs();
    }

    vm.level3Changed = function () {
        delete vm.user.level4_org;
        delete vm.user.level5_org;
        if(vm.user.level3_org){
            vm.user.org = vm.user.level3_org;
        }else{
            vm.user.org = vm.user.level2_org;
        }
        vm.loadLevel4Orgs();
    }

    vm.level4Changed = function () {
        delete vm.user.level5_org;
        if(vm.user.level4_org){
            vm.user.org = vm.user.level4_org;
        }else{
            vm.user.org = vm.user.level3_org;
        }
        vm.loadLevel5Orgs();
    }

    vm.level5Changed = function () {
        if(vm.user.level5_org){
            vm.user.org = vm.user.level5_org;
        }else{
            vm.user.org = vm.user.level4_org;
        }
    }


    EmployeeService.getRoles()
        .then(function (roles) {
            vm.roles = roles;
        })

    if ($state.is("app.employee.user.new")) {
        vm.editable = true;
    }



    var userId = $stateParams.userId;
    if (userId) {
        EmployeeService.getUser(userId)
            .then(function (user) {
                vm.user = user;
                vm.loadLevel3Orgs();
                vm.loadLevel4Orgs();
                vm.loadLevel5Orgs();
            });
    }
    
    


    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.submit = function () {
        if (!vm.user.level1_org){
            vm.user.level1_org = vm.level2Orgs[0].parent;
        }
        if (!vm.user.level2_org){
            vm.user.org = vm.level2Orgs[0].parent;
        }
        EmployeeService.saveUser(vm.user)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "用户已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.user = {};
                if (vm.back) {
                    $state.go("app.employee.user");
                }
            }, function (err) { console.log(err)});
    };



}); 

