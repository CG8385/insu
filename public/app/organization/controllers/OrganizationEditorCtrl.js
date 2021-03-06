'use strict'

angular.module('app.organization').controller('OrganizationEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, OrganizationService) {
    var vm = this;
    vm.locations = []
    vm.provinces = [];
    vm.cities = [];
    vm.districts = [];
    vm.organization = {};
    vm.subClients = [];
    vm.wildClients = [];

    vm.parentName = "";

    vm.editable = false;

    OrganizationService.getLocations()
    .then(function(locations){
        vm.locations = locations;
        vm.provinces = locations;
        if(vm.organization.province){
            vm.provinceChanged();
            vm.cityChanged();
        }
    })

    if ($state.is('app.organization.org2.new')) {
        vm.organization.level = "二级机构";
        vm.editable = true;
        vm.organization.parent = $stateParams.parentId;
    } else if ($state.is('app.organization.org3.new')) {
        vm.organization.level = "三级机构";
        vm.editable = true;
        vm.organization.parent = $stateParams.parentId;
    } else if ($state.is('app.organization.org4.new')) {
        vm.organization.level = "四级机构";
        vm.editable = true;
        vm.organization.parent = $stateParams.parentId;
    }else if ($state.is('app.organization.org5.new')) {
        vm.organization.level = "五级机构";
        vm.editable = true;
        vm.organization.parent = $stateParams.parentId;
    }

    if(vm.organization.parent){
        OrganizationService.getOrganization($stateParams.parentId)
        .then(function(parentOrg){
            vm.organization.province = parentOrg.province;
            vm.organization.city = parentOrg.city;
            vm.organization.district = parentOrg.district;
            vm.organization.area_code = parentOrg.area_code;
        })
    }


    vm.provinceChanged = function() {
        var province = vm.provinces.filter(p=>p.name == vm.organization.province)[0];
        vm.organization.area_code = "0" + province.code;
        vm.cities = province.children;
        vm.disctricts = [];
    }

    vm.cityChanged = function() {
        var city = vm.cities.filter(c=>c.name == vm.organization.city)[0];
        if(city){
            vm.organization.area_code = "0" + city.code;
            vm.districts = city.children;
        }else{
            vm.disctricts = [];
        }

    }

    vm.districtChanged = function() {
        var district = vm.districts.filter(d=>d.name == vm.organization.district)[0];
        if(district){
            vm.organization.area_code = "0" + district.code;
        }
    }

    vm.setParentName = function () {
        if (vm.organization.parent) {
            OrganizationService.getOrganization(vm.organization.parent)
                .then(function (parentOrg) {
                    vm.parentName = parentOrg.name;
                })
        }
    }

    vm.setParentName();


    vm.refreshClients = function () {
        var orgId = vm.organization._id;
        if (orgId){
            OrganizationService.getSubClients(orgId)
            .then(function (subClients) {
                vm.subClients = subClients;
            })
            OrganizationService.getSubClients(-1)
            .then(function (wildClients) {
                vm.wildClients = wildClients;
            })
        }

    }


    var orgId = $stateParams.orgId;
    if (orgId) {
        OrganizationService.getOrganization(orgId)
            .then(function (organization) {
                vm.organization = organization;
                vm.setParentName();
                vm.refreshClients();
                if(vm.provinces.length > 0 && vm.organization.province){
                    vm.provinceChanged();
                    vm.cityChanged();
                }
            });
    }




    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.getSelectedClientIds = function () {
        var ids = [];
        if (vm.wildClients) {
            for (var i = 0; i < vm.wildClients.length; i++) {
                if (vm.wildClients[i].isSelected) {
                    ids.push(vm.wildClients[i]._id);
                }
            }
        }
        return ids;
    }

    vm.bulkAssign = function () {
        var clientIds = vm.getSelectedClientIds();
        $.SmartMessageBox({
            title: "批量设置归属分支结构",
            content: "确认将选中的业务员归属到该分支结构?",
            buttons: '[取消][确认]',
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                var data = {};
                data.clientIds = clientIds;
                data.level5_id = vm.organization._id;
                OrganizationService.bulkAssign(data)
                    .then(function (result) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "业务员归属分支结构已设置",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        vm.refreshClients();
                    }, function (err) {

                    });
            }
            if (ButtonPressed === "取消") {

            }

        });
    };

    vm.submit = function () {
        OrganizationService.saveOrganization(vm.organization)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "分支机构已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                var level = vm.organization.level;
                var temp = vm.organization;
                vm.organization = {};
                vm.organization.level = temp.level;
                vm.organization.parent = temp.parent;
                if (vm.back) {
                    if (temp.level == "二级机构") {
                        $state.go("app.organization.org2.all");
                    } else if (temp.level == "三级机构") {
                        vm.organization.province = temp.province;
                        $state.go("app.organization.org3.all");
                    } else if (temp.level == "四级机构") {
                        vm.organization.province = temp.province;
                        vm.organization.city = temp.city;
                        $state.go("app.organization.org4.all");
                    } else if (temp.level == "五级机构") {
                        vm.organization.province = temp.province;
                        vm.organization.city = temp.city;
                        vm.organization.district = temp.district;
                        vm.organization.area_code = temp.area_code;
                        $state.go("app.organization.org5.all");
                    }
                }
            }, function (err) { });
    };

    vm.selectionChanged = function () {
        if (!vm.wildClients) {
            vm.isShowBulkOperationButton = false;
        }

        vm.isShowBulkOperationButton = vm.getSelectedClientIds().length > 0;
    }

    // vm.selectAll = function () {
    //     if (vm.wildClients && vm.wildClients.length > 0) {
    //         for (var i = 0; i < vm.wildClients.length; i++) {
    //             vm.wildClients[i].isSelected = true;
    //         }
    //     }
    //     vm.selectionChanged();
    // }

    // vm.clearSelection = function () {
    //     if (vm.wildClients && vm.wildClients.length > 0) {
    //         for (var i = 0; i < vm.policies.length; i++) {
    //             vm.policies[i].isSelected = false;
    //         }
    //     }
    //     vm.selectionChanged();
    // }


});

