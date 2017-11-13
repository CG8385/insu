'use strict'

angular.module('app.life-policy').controller('LifePolicyEditorController', function ($scope, $filter, $rootScope, $state, $stateParams, LifePolicyService) {
    var vm = this;
    vm.policy = {};
    vm.applicant = {};
    vm.clientInfo = {};
    vm.zy_clientInfo = {};
    vm.managerInfo = {};
    vm.directorInfo = {};
    vm.sellerInfo = $rootScope.user;
    LifePolicyService.getClients()
        .then(function (clients) {
            vm.clients = clients;
        })
    LifePolicyService.getManagers()
        .then(function (managers) {
            vm.managers = managers;
        })
    LifePolicyService.getCompanies()
        .then(function (companies) {
            vm.companies = companies;
        })
    LifePolicyService.getPolicyNames()
        .then(function (policyNames) {
            vm.policyNames = policyNames;
        })
    LifePolicyService.getOrganizations()
        .then(function (organizations) {
            vm.organizations = organizations;
        })

    vm.editable = false;

    vm.addSubPolicy = function () {
        vm.policy.sub_policies.push({ 'insurant': '', 'policy_name': '', 'year': '', 'fee': undefined, 'payment_rate': undefined, 'payment': undefined });
    };

    vm.addInsurant = function () {
        vm.policy.insurants.push({ 'name': '', 'address': '', 'phone': '', 'identity': '', 'sex': '', 'birthday': undefined });
    };

    if ($state.is("app.life-policy.new")) {
        vm.policy.sub_policies = [];
        vm.policy.insurants = [];
        vm.addSubPolicy();
        vm.addInsurant();
        vm.editable = true;
    }



    var policyId = $stateParams.policyId;
    if (policyId) {
        LifePolicyService.getPolicy(policyId)
            .then(function (policy) {
                vm.policy = policy;
                vm.clientInfo = policy.client;
                vm.sellerInfo = policy.seller;
                vm.zy_clientInfo = policy.zy_client;
                vm.managerInfo = policy.manager;
                vm.directorInfo = policy.director;

                policy.client = policy.client._id;
                policy.seller = policy.seller._id;
                policy.zy_client = policy.zy_client._id;
                policy.manager = policy.manager._id;
                policy.director = policy.director._id;
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
        vm.policy.client = vm.clientInfo._id;
        vm.policy.zy_client = vm.zy_clientInfo._id;
        vm.policy.manager = vm.managerInfo._id;
        vm.policy.director = vm.directorInfo._id;
        LifePolicyService.savePolicy(vm.policy)
            .then(function (data) {
                $.smallBox({
                    title: "服务器确认信息",
                    content: "保单已成功保存",
                    color: "#739E73",
                    iconSmall: "fa fa-check",
                    timeout: 5000
                });
                vm.policy = {};
                vm.applicant = {};
                vm.clientInfo = {};
                vm.zy_clientInfo = {};
                vm.managerInfo = {};
                vm.directorInfo = {};
                vm.policy.sub_policies = [];
                vm.policy.insurants = [];
                vm.addSubPolicy();
                vm.addInsurant();
                if (vm.back) {
                    $state.go("app.life-policy.to-be-paid");
                }
            }, function (err) { });
    };

    // vm.pay = function () {
    //     $.SmartMessageBox({
    //         title: "修改保单状态",
    //         content: "确认已支付该保单？",
    //         buttons: '[取消][确认]'
    //     }, function (ButtonPressed) {
    //         if (ButtonPressed === "确认") {
    //             vm.policy.policy_status = "已支付";
    //             vm.policy.paid_at = Date.now();
    //             LifePolicyService.savePolicy(vm.policy)
    //                 .then(function (data) {
    //                     $.smallBox({
    //                         title: "服务器确认信息",
    //                         content: "保单状态已成功更改为已支付",
    //                         color: "#739E73",
    //                         iconSmall: "fa fa-check",
    //                         timeout: 5000
    //                     });
    //                 }, function (err) { });
    //         }
    //         if (ButtonPressed === "取消") {

    //         }

    //     });

    // };

    vm.updateFee = function (subPolicy) {
        if(subPolicy.fee == undefined) return;
        subPolicy.payment = subPolicy.fee * subPolicy.payment_rate / 100;
        vm.policy.payment_total = 0;
        for (var i = 0; i < vm.policy.sub_policies.length; i++) {
            vm.policy.payment_total += vm.policy.sub_policies[i].payment;
        }
        vm.policy.taxed_payment_total = vm.policy.payment_total * 0.95;
        if (vm.policy.zy_rate && vm.policy.taxed_payment_total) {
            vm.policy.zy_payment = vm.policy.taxed_payment_total * vm.policy.zy_rate / 100;
            vm.policy.zy_payment = vm.policy.zy_payment.toFixed(2);
        }    
        vm.policy.taxed_payment_total = vm.policy.taxed_payment_total.toFixed(2);      
    }

    vm.updateZYPayment = function () {
        if (vm.policy.zy_rate && vm.policy.taxed_payment_total) {
            vm.policy.zy_payment = parseFloat(vm.policy.taxed_payment_total) * vm.policy.zy_rate / 100;
            vm.policy.zy_payment = vm.policy.zy_payment.toFixed(2);
        }
    }
});

angular.module('app.life-policy').directive('upper', function () {
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

angular.module('app.life-policy').directive('price', function () {
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

angular.module('app.life-policy').directive('dateFormat', ['$filter',function($filter) {
    var dateFilter = $filter('date');
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            function formatter(value) {
                return dateFilter(value, 'yyyy-MM-dd'); //format
            }

            function parser() {
                return ctrl.$modelValue;
            }

            ctrl.$formatters.push(formatter);
            ctrl.$parsers.unshift(parser);

        }
    };
}]);

angular.module('app.life-policy').filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    if (/^[\u4e00-\u9fa5]+$/.test(text)) {
                        if (item['name'].indexOf(text) == 0) {
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
                        if (itemMatches) {
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