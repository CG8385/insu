'use strict'

angular.module('app.organization').controller('OrganizationListController', function (screenSize, $rootScope, $state, $scope, OrganizationService, localStorageService) {
    var vm = this;
    vm.organizations = [];

    vm.level2Orgs = [];
    vm.level3Orgs = [];
    vm.level4Orgs = [];



    if ($state.is("app.organization.org2.all")) {
        vm.level = "二级机构";
        vm.settingString = "org2Settings";
    }
    else if ($state.is("app.organization.org3.all")) {
        vm.level = "三级机构";
        vm.settingString = "org3Settings";
    } else if ($state.is("app.organization.org4.all")) {
        vm.level = "四级机构";
        vm.settingString = "org4Settings";
    } else if ($state.is("app.organization.org5.all")) {
        vm.level = "五级机构";
        vm.settingString = "org5Settings";
    }
    vm.setting = localStorageService.get(vm.settingString) ? localStorageService.get(vm.settingString) : {};


    if (vm.level == "二级机构") {
        OrganizationService.getLevel1Orgs()
            .then(function (level1Orgs) {
                vm.setting.parentId = level1Orgs[0]._id;
                vm.setting.level1Org = level1Orgs[0]._id;
            }, function (err) {
            });
    }



    vm.loadLevel2Orgs = function () {
        OrganizationService.getLevel2Orgs()
            .then(function (level2Orgs) {
                vm.level2Orgs = level2Orgs;
                if (vm.level == "二级机构") {
                    vm.organizations = level2Orgs;
                }
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
        if (!vm.setting.parentId && vm.level != "二级机构") {
            vm.organizations = [];
        } else if (vm.setting.parentId) {
            OrganizationService.getSubOrgs(vm.setting.parentId)
                .then(function (orgs) {
                    vm.organizations = orgs;
                }, function (err) {

                });
        }
    };

    vm.loadLevel2Orgs();
    vm.loadLevel3Orgs();
    vm.loadLevel4Orgs();
    vm.refreshOrganizations();

    vm.view = function (orgId) {
        if (vm.level == "二级机构") {
            $state.go("app.organization.org2.view", { orgId: orgId });
        } else if (vm.level == "三级机构") {
            $state.go("app.organization.org3.view", { orgId: orgId });
        } else if (vm.level == "四级机构") {
            $state.go("app.organization.org4.view", { orgId: orgId });
        } else if (vm.level == "五级机构") {
            $state.go("app.organization.org5.view", { orgId: orgId });
        }
    };

    vm.level2Changed = function () {
        if (vm.level == "三级机构") {
            vm.setting.parentId = vm.setting.level2Org;
        } else if (vm.level == "四级机构") {
            vm.setting.parentId = null;
            vm.setting.level3Org = null;
            vm.loadLevel3Orgs();
        }else if (vm.level == "五级机构") {
            vm.setting.parentId = null;
            vm.setting.level3Org = null;
            vm.setting.level4Org = null;
            vm.loadLevel3Orgs();
        }
        localStorageService.set(vm.settingString, vm.setting);
        vm.refreshOrganizations();
    }

    vm.level3Changed = function () {
        if (vm.level == "四级机构") {
            vm.setting.parentId = vm.setting.level3Org;
        } else if (vm.level == "五级机构") {
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
        if (vm.level == "二级机构") {
            $state.go("app.organization.org2.new", { parentId: vm.setting.level1Org });
        } else if (vm.level == "三级机构") {
            $state.go("app.organization.org3.new", { parentId: vm.setting.level2Org });
        } else if (vm.level == "四级机构") {
            $state.go("app.organization.org4.new", { parentId: vm.setting.level3Org });
        } else if (vm.level == "五级机构") {
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
