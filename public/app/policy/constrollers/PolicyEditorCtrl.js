'use strict'

angular.module('app.policy').controller('PolicyEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, PolicyService) {
    var vm = this;
    vm.policy = {};
    vm.policy.plate_province = "苏";
    vm.clientInfo = {};
    vm.sellerInfo = $rootScope.user;
    PolicyService.getClients()
        .then(function (clients) {
            vm.clients = clients;
        })
    PolicyService.getCompanies()
        .then(function (companies) {
            vm.companies = companies;
        })

    vm.editable = false;
    if ($state.is("app.policy.new")) {
        vm.editable = true;
    }



    var policyId = $stateParams.policyId;
    if (policyId) {
        PolicyService.getPolicy(policyId)
            .then(function (policy) {
                vm.policy = policy;
                vm.clientInfo = policy.client;
                vm.sellerInfo = policy.seller;
                if(policy.client){
                    policy.client = policy.client._id;
                }
                policy.seller = policy.seller._id;
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
        if(vm.clientInfo){
            vm.policy.client = vm.clientInfo._id;
        }       
        PolicyService.savePolicy(vm.policy)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "保单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.policy = {};
                if (vm.back) {
                     $state.go("app.policy.to-be-paid");
                }
            }, function (err) { });
    };

    vm.pay = function () {
        console.log("I have entered");
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认已支付该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "已支付";
                vm.policy.paid_at = Date.now();
                PolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为已支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }

        });

    };

    vm.approve = function () {
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认要批准该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "待支付";
                vm.policy.paid_at = Date.now();
                PolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为待支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        $state.go("app.policy.to-be-reviewed");
                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }

        });

    };

    vm.updateFee = function () {
        vm.policy.mandatory_fee_income = vm.policy.mandatory_fee * vm.policy.mandatory_fee_income_rate / 100;
        if (vm.policy.mandatory_fee_income) {
            vm.policy.mandatory_fee_income = vm.policy.mandatory_fee_income.toFixed(2);
        }
        vm.policy.commercial_fee_income = vm.policy.commercial_fee * vm.policy.commercial_fee_income_rate / 100;
        if (vm.policy.commercial_fee_income) {
            vm.policy.commercial_fee_income = vm.policy.commercial_fee_income.toFixed(2);
        }
        vm.policy.tax_fee_income = vm.policy.tax_fee * vm.policy.tax_fee_income_rate / 100;
        if (vm.policy.tax_fee_income) {
            vm.policy.tax_fee_income = vm.policy.tax_fee_income.toFixed(2);
        }
        vm.policy.other_fee_income = vm.policy.other_fee * vm.policy.other_fee_income_rate / 100;
        if (vm.policy.other_fee_income) {
            vm.policy.other_fee_income = vm.policy.other_fee_income.toFixed(2);
        }
        if (!isNaN(vm.policy.mandatory_fee_income) && !isNaN(vm.policy.commercial_fee_income) && !isNaN(vm.policy.tax_fee_income)&& !isNaN(vm.policy.other_fee_income)) {
            vm.policy.total_income = parseFloat(vm.policy.mandatory_fee_income) + parseFloat(vm.policy.commercial_fee_income) + parseFloat(vm.policy.tax_fee_income) + parseFloat(vm.policy.other_fee_income);
            vm.policy.total_income = vm.policy.total_income.toFixed(2);
        }

        vm.policy.mandatory_fee_payment = vm.policy.mandatory_fee * vm.policy.mandatory_fee_payment_rate / 100;

        if (vm.policy.mandatory_fee_payment) {
            vm.policy.mandatory_fee_payment = vm.policy.mandatory_fee_payment.toFixed(2);
        }
        vm.policy.commercial_fee_payment = vm.policy.commercial_fee * vm.policy.commercial_fee_payment_rate / 100;
        if (vm.policy.commercial_fee_payment) {
            vm.policy.commercial_fee_payment = vm.policy.commercial_fee_payment.toFixed(2);
        }
        vm.policy.tax_fee_payment = vm.policy.tax_fee * vm.policy.tax_fee_payment_rate / 100;
        if (vm.policy.tax_fee_payment) {
            vm.policy.tax_fee_payment = vm.policy.tax_fee_payment.toFixed(2);
        }
        vm.policy.other_fee_payment = vm.policy.other_fee * vm.policy.other_fee_payment_rate / 100;
        if (vm.policy.other_fee_payment) {
            vm.policy.other_fee_payment = vm.policy.other_fee_payment.toFixed(2);
        }
        if (!isNaN(vm.policy.mandatory_fee_payment) && !isNaN(vm.policy.commercial_fee_payment) && !isNaN(vm.policy.tax_fee_payment)&& !isNaN(vm.policy.other_fee_payment)) {
            vm.policy.total_payment = parseFloat(vm.policy.mandatory_fee_payment) + parseFloat(vm.policy.commercial_fee_payment) + parseFloat(vm.policy.tax_fee_payment) + parseFloat(vm.policy.other_fee_payment);
            vm.policy.total_payment = vm.policy.total_payment.toFixed(2);
        }
        if (vm.policy.payment_addition) {
            vm.policy.total_payment = parseFloat(vm.policy.total_payment) + parseFloat(vm.policy.payment_addition);
            vm.policy.total_payment = vm.policy.total_payment.toFixed(2);
        }
        if (vm.policy.payment_substraction_rate) {
            vm.policy.payment_substraction = (parseFloat(vm.policy.total_payment)- parseFloat(vm.policy.tax_fee_payment)) * vm.policy.payment_substraction_rate / 100;
            vm.policy.total_payment = vm.policy.total_payment - vm.policy.payment_substraction;
            vm.policy.total_payment = vm.policy.total_payment.toFixed(2);
            vm.policy.payment_substraction = vm.policy.payment_substraction.toFixed(2);
        }

    }
});

angular.module('app.policy').directive('upper', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var capitalize = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                var capitalized = inputValue.toUpperCase();
                var re = /[^/u4e00-/u9fa5]/;
                if (re.test(inputValue) && capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            }
            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);  // capitalize initial value
        }
    };
});

angular.module('app.policy').directive('price', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var removeIllegalInput = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                //    var output = inputValue.replace(/[^(\d|\\.)]/g,'') 
           
                //先把非数字的都替换掉，除了数字和.
                var output = inputValue.replace(/[^\d.]/g, "");
                //必须保证第一个为数字而不是.
                output = output.replace(/^\./g, "");
                //保证只有出现一个.而没有多个.
                output = output.replace(/\.{2,}/g, ".");
                //保证.只出现一次，而不能出现两次以上
                output = output.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                //只允许输入两位小数
                output = output.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');

                if (output !== inputValue) {
                    modelCtrl.$setViewValue(output);
                    modelCtrl.$render();
                }
                return output;
            }
            modelCtrl.$parsers.push(removeIllegalInput);
            removeIllegalInput(scope[attrs.ngModel]);
        }
    };
});

angular.module('app.policy').filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    if (/^[\u4e00-\u9fa5]+$/.test(text)) {
                        if(item['name'].indexOf(text) == 0){
                            itemMatches = true;
                                break;
                        }
                    } else {
                        var text = props[prop].toUpperCase();
                        var pylist = item['py'];
                      
                        for (var j = 0; j < pylist.length; j++) {
                            if (pylist[j].indexOf(text) == 0) {
                                itemMatches = true;
                                break;
                            }
                        }
                        if(itemMatches){
                            break;
                        }
                    }


                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});