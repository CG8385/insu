'use strict'

angular.module('app.antiml').controller('BMemberListController', function(screenSize, $rootScope, $state, $scope, AntiMLService){
    var vm = this;
    vm.bmembers = [];

    vm.refreshBlacklist = function(){
        AntiMLService.getBlacklist()
       .then(function(bmembers){
           vm.bmembers = bmembers;
       }, function(err){

       });
    };

    vm.refreshBlacklist();

    vm.view = function(bmemberId){
        $state.go("app.antiml.blacklist.view", {bmemberId: bmemberId});
    };

    /*
     * SmartAlerts
     */
    // With Callback
    vm.delete =  function (bmemberId) {
        $.SmartMessageBox({
            title: "取消黑名单",
            content: "确认取消此黑名单用户？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                AntiMLService.deleteBMember(bmemberId)
                    .then(function(){
                        vm.refreshBlacklist();
                    })
            }
            if (ButtonPressed === "取消") {

            }

        });
    };
});
