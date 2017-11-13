'use strict'

angular.module('app.organization').controller('OrganizationEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, OrganizationService) {
    var vm = this;
    vm.organization = {};
    vm.subClients = [];
    vm.wildClients = [];

    vm.editable = false;

    if ($state.is("app.organization.new")) {
        vm.editable = true;
    }


    vm.refreshClients = function () {
        var orgId = vm.organization._id;
        OrganizationService.getSubClients(orgId)
            .then(function (subClients) {
                vm.subClients = subClients;
            })
        OrganizationService.getSubClients(-1)
            .then(function (wildClients) {
                vm.wildClients = wildClients;
            })
    }


    var organizationId = $stateParams.organizationId;
    if (organizationId) {
        OrganizationService.getOrganization(organizationId)
            .then(function (organization) {
                vm.organization = organization;
                vm.refreshClients();
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
            title: "批量设置归属部门",
            content: "确认将选中的业务员归属到该部门?",
            buttons: '[取消][确认]',
        }, function (ButtonPressed, value) {
            if (ButtonPressed === "确认") {
                var data = {};
                data.clientIds = clientIds;
                data.organization = vm.organization._id;
                OrganizationService.bulkAssign(data)
                    .then(function (result) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "业务员归属部门已设置",
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
                vm.organization = {};
                if (vm.back) {
                    $state.go("app.organization.all");
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

