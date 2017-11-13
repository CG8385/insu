angular.module('app.wechat')
  .controller('WechatController', function ($scope, dataAPI) {
    var vm = this;
    vm.policies = [];
    dataAPI.getPolicies()
      .then(function (policies) {
        vm.policies = policies;
      });
  });


angular.module('app.wechat')
.filter("formatPayment", function () {
    return function (fieldValue) {
        if(!fieldValue){
          return '待核算';
        }
        return fieldValue;
    }
 })
.filter("formatPaidDate", function () {
    return function (fieldValue) {
        if(!fieldValue){
          return '待支付';
        }
        return fieldValue;
    }
 })