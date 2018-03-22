'use strict'

angular.module('app.organization').controller('OrganizationListController', function (screenSize, $rootScope, $state, $scope, OrganizationService, localStorageService) {
    var vm = this;
    vm.organizations = [];

    vm.leve1Org = null;
    vm.level2Orgs = [];
    vm.level3Orgs = [];
    vm.level4Orgs = [];



    if ($state.is("app.organization.org2.all")) {
        vm.level = "省公司";
        vm.settingString = "org2Settings";
    }
    else if ($state.is("app.organization.org3.all")) {
        vm.level = "市公司";
        vm.settingString = "org3Settings";
    } else if ($state.is("app.organization.Org4.all")) {
        vm.level = "区县公司";
        vm.settingString = "org4Settings";
    } else if ($state.is("app.organization.Org5.all")) {
        vm.level = "营业部";
        vm.settingString = "org5Settings";
    }
    vm.setting = localStorageService.get(vm.settingString) ? localStorageService.get(vm.settingString) : {};


    if (vm.level == "省公司") {
        OrganizationService.getLevel1Orgs()
            .then(function (level1Orgs) {
                vm.level1Org = level1Orgs[0];
                vm.setting.parentId = vm.leve1Org;
                console.log(vm.setting);
            }, function (err) {
            });
    }



    vm.loadLevel2Orgs = function () {
        OrganizationService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;
            }, function (err) {
            });
    }

    vm.loadLevel3Orgs = function () {
        if (!vm.setting.level2Org) {
            vm.level3Orgs = [];
        } else {
            OrganizationService.getSubOrgs(vm.setting.level2Org)
                .then(function (level3Orgs) {
                    vm.level3Orgs = level3Orgs;
                }, function (err) {

                });
        }
    }

    vm.loadLevel4Orgs = function () {
        if (!vm.setting.level3Org) {
            vm.level4Orgs = [];
        } else {
            OrganizationService.getSubOrgs(vm.setting.level3Org)
                .then(function (level4Orgs) {
                    vm.level4Orgs = level4Orgs;
                }, function (err) {

                });
        }
    }

    vm.refreshOrganizations = function () {
        if (!vm.setting.parentId) {
            vm.organizations = [];
        } else {
            OrganizationService.getSubOrgs(vm.setting.parentId)
                .then(function (orgs) {
                    vm.organizations = organizations;
                }, function (err) {

                });
        }
    };

    vm.loadLevel2Orgs();
    vm.loadLevel3Orgs();
    vm.loadLevel4Orgs();
    vm.refreshOrganizations();

    vm.view = function (orgId) {
        if (vm.level == "省公司") {
            $state.go("app.organization.org2.view", { orgId: orgId });
        } else if (vm.level == "市公司") {
            $state.go("app.organization.org3.view", { orgId: orgId });
        } else if (vm.level == "区县公司") {
            $state.go("app.organization.org4.view", { orgId: orgId });
        } else if (vm.level == "营业部") {
            $state.go("app.organization.org5.view", { orgId: orgId });
        }
    };

    vm.level2Changed = function () {
        if (vm.level == "市公司") {
            vm.setting.parentId = vm.setting.level2Org;
        } else if (vm.level == "区县公司") {
            vm.setting.parentId = null;
            vm.setting.level3Org = null;
            vm.loadLevel3Orgs();
        }
        localStorageService.set(vm.settingString, vm.setting);
        vm.refreshOrganizations();
    }

    vm.level3Changed = function () {
        if (vm.level == "区县公司") {
            vm.setting.parentId = vm.setting.level3Org;
        } else if (vm.level == "营业部") {
            vm.setting.parentId = null;
            vm.setting.level4Org = null;
            vm.loadLevel4Orgs();
        }
        localStorageService.set(vm.settingString, vm.setting);
        vm.refreshOrganizations();
    }

    vm.level4Changed = function () {
        vm.setting.parentId = vm.setting.level4Org;
        localStorageService.set(vm.settingString, vm.setting);
        vm.refreshOrganizations();
    }

    vm.addSubOrg = function () {
        if (vm.level == "省公司") {
            $state.go("app.organization.org2.new", { parentId: vm.setting.level1Org });
        } else if (vm.level == "市公司") {
            $state.go("app.organization.org3.new", { parentId: vm.setting.level2Org });
        } else if (vm.level == "区县公司") {
            $state.go("app.organization.org4.new", { parentId: vm.setting.level3Org });
        } else if (vm.level == "营业部") {
            $state.go("app.organization.org5.new", { parentId: vm.setting.level4Org });
        }
    }

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete = function (orgId) {
        $.SmartMessageBox({
            title: "删除分支机构",
            content: "确认删除该分支机构？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                OrganizationService.deleteOrganization(orgId)
                    .then(function () {
                        vm.refreshOrganizations();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };


});
