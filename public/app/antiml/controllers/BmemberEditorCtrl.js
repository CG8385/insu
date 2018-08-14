'use strict'

angular.module('app.antiml').controller('BMemberEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, AntiMLService) {
    var vm = this;
    vm.bmember = {};
    vm.test_identity = "320821198711083615";
    vm.test_date="2017-04-28";
    vm.editable = false;


    if ($state.is("app.antiml.blacklist.new")) {
        vm.editable = true;
    }

    var bmemberId = $stateParams.bmemberId;
    if (bmemberId) {
        AntiMLService.getBMember(bmemberId)
            .then(function (bmember) {
                vm.bmember = bmember;
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
        AntiMLService.saveBMember(vm.bmember)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "该黑名单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.bmember = {};
                if (vm.back) {
                    $state.go("app.antiml.blacklist");
                }
            }, function (err) { });
    };

    vm.check = function () {
        AntiMLService.checkLargeAmountFee(vm.test_identity,vm.test_date)
        //AntiMLService.checkLargeAmountFee(vm.test_identity)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    //content: "确认没有可疑交易",
                    content:data.message,
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
            }, function (err) { });
    };


});

