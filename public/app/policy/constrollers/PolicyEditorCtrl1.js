'use strict'

angular.module('app.policy').controller('PolicyEditorController1', function ($scope, $filter, $rootScope, $state, $stateParams, PolicyService, ngDialog) {
    var vm = this;
    var defaultPolicy = {
        tax_fee: 0,
        tax_fee_income_rate: 0,
        tax_fee_payment_rate: 0,
        tax_fee_income:0,
        tax_fee_payment: 0,
        other_fee: 0,
        other_fee_taxed: 0,
        other_fee_income_rate: 0,
        other_fee_income: 0,
        other_fee_payment_rate: 0,
        other_fee_payment: 0,
        payment_addition: 0,
        payment_substraction_rate: 0,
        payment_substraction: 0
    }
    vm.policy = defaultPolicy;
    vm.clientInfo = {};
    vm.sellerInfo = $rootScope.user;
    vm.level2Companies = [];
    vm.level3Companies = [];
    vm.level4Companies = [];
    vm.rules = [];
    vm.ratesBasedString = "";
    vm.company = {};

    //Infinite Scroll Magic
    vm.infiniteScroll = {};
    vm.infiniteScroll.numToAdd = 20;
    vm.infiniteScroll.currentItems = 20;

    vm.resetInfScroll = function () {
        vm.infiniteScroll.currentItems = vm.infiniteScroll.numToAdd;
    };
    vm.addMoreItems = function () {
        vm.infiniteScroll.currentItems += vm.infiniteScroll.numToAdd;
    };


    PolicyService.getLevel2Companies()
        .then(function (level2Companies) {
            vm.level2Companies = level2Companies;
        })


    vm.loadLevel3Companies = function () {
        if (!vm.policy.level2_company) {
            vm.level3Companies = [];
        } else {
            PolicyService.getSubCompanies(vm.policy.level2_company)
                .then(function (level3Companies) {
                    vm.level3Companies = level3Companies;
                }, function (err) {

                });
        }
    }

    vm.loadLevel4Companies = function () {
        if (!vm.policy.level3_company) {
            vm.level4Companies = [];
        } else {
            PolicyService.getSubCompanies(vm.policy.level3_company)
                .then(function (level4Companies) {
                    vm.level4Companies = level4Companies;
                }, function (err) {

                });
        }
    }

    vm.resetRule = function () {
        vm.policy.rule = undefined;
        vm.policy.mandatory_fee_income_rate = null;
        vm.policy.mandatory_fee_payment_rate = null;
        vm.policy.commercial_fee_income_rate = null;
        vm.policy.commercial_fee_payment_rate = null;
        vm.policy.tax_fee_income_rate = null;
        vm.policy.tax_fee_payment_rate = null;
        vm.policy.other_fee_income_rate = null;
        vm.policy.other_fee_payment_rate = null;
        vm.policy.rule_rates = null;
        vm.updateFee();
    }

    vm.applyRule = function (rule) {
        vm.policy.mandatory_fee_income_rate = rule.mandatory_income ? rule.mandatory_income : 0;
        vm.policy.mandatory_fee_payment_rate = rule.mandatory_payment ? rule.mandatory_payment : 0;
        vm.policy.commercial_fee_income_rate = rule.commercial_income ? rule.commercial_income : 0;
        vm.policy.commercial_fee_payment_rate = rule.commercial_payment ? rule.commercial_payment : 0;
        vm.policy.tax_fee_income_rate = rule.tax_income ? rule.tax_income : 0;
        vm.policy.tax_fee_payment_rate = rule.tax_payment ? rule.tax_payment : 0;
        vm.policy.other_fee_income_rate = rule.other_income ? ule.other_income : 0;
        vm.policy.other_fee_payment_rate = rule.other_payment ? rule.other_payment : 0;
        vm.policy.rule_rates = rule;
        vm.updateFee();
    }

    vm.loadRules = function () {
        var companyId = vm.policy.level4_company ? vm.policy.level4_company : vm.policy.level3_company ? vm.policy.level3_company : vm.policy.level2_company;
        if (companyId) {
            PolicyService.getRules(companyId)
                .then(function (rules) {
                    vm.rules = rules;
                })
        } else {
            vm.rules = [];
        }

    }

    vm.ruleChanged = function () {
        if (!vm.policy.rule) {
            vm.resetRule();
        } else {
            var rule = vm.rules.filter(r => r._id == vm.policy.rule)[0];
            vm.applyRule(rule);
        }
    }

    vm.level2Changed = function () {
        vm.resetRule();
        if (!vm.policy.level2_company) {
            vm.policy.level1_company = undefined;
            vm.company = {};
        } else {
            vm.company = vm.level2Companies.find(c => c._id === vm.policy.level2_company);
            vm.policy.level1_company = vm.company.catogory._id;
        }
        vm.loadLevel3Companies();
        vm.loadRules();
    }

    vm.level3Changed = function () {
        vm.resetRule();
        if (!vm.policy.level3_company) {
            vm.company = vm.level2Companies.find(c => c._id === vm.policy.level2_company);

        } else {
            vm.company = vm.level3Companies.find(c => c._id === vm.policy.level3_company);
        }
        vm.loadLevel4Companies();
        vm.loadRules();
    }

    vm.level4Changed = function () {
        vm.resetRule();
        if (!vm.policy.level4_company) {
            vm.company = vm.level3Companies.find(c => c._id === vm.policy.level3_company);
        } else {
            vm.company = vm.level4Companies.find(c => c._id === vm.policy.level4_company);
        }
        vm.loadRules();
    }


    vm.shouldShowEditButton = function (){
        if(vm.editable) return false;
        if(vm.policy.policy_status == "待审核"){
            return $rootScope.user.userrole.policy_to_be_reviewed.edit;
        }else if(vm.policy.policy_status == "待支付"){
            return $rootScope.user.userrole.policy_to_be_paid.edit;
        }else if(vm.policy.policy_status == "已支付"){
            return $rootScope.user.userrole.policy_paid.edit;
        }else if(vm.policy.policy_status == "已核对"){
            return $rootScope.user.userrole.policy_paid.edit;
        }else if(vm.policy.policy_status == "被驳回"){
            return $rootScope.user.userrole.policy_rejected.edit;
        }
    }

    vm.shouldShowFinanceSection = function () {
        var ret = false;
        if(vm.policy.policy_status == "待审核"){
            ret = $rootScope.user.userrole.policy_to_be_reviewed.aprove;
        }else if(["待支付","已支付"].indexOf(vm.policy.policy_status) != -1){
            ret = $rootScope.user.userrole.policy_to_be_paid.pay;
        }
        return ret;
    }

    PolicyService.getIndividualClients()
        .then(function (clients) {
            vm.clients = clients;
        })


    vm.editable = false;
    if ($state.is("app.policy.new1")) {
        vm.editable = true;
    }

    vm.getRatesBasedString = function () {
        if (vm.policy.rates_based_on_taxed) {
            return "基于不含税保费";
        } else {
            return "基于含税保费";
        }
    }



    var policyId = $stateParams.policyId;
    if (policyId) {
        PolicyService.getPolicy(policyId)
            .then(function (policy) {
                vm.policy = policy;
                vm.clientInfo = policy.client;
                vm.sellerInfo = policy.seller;
                if (policy.client) {
                    policy.client = policy.client._id;
                }
                policy.seller = policy.seller._id;
                vm.loadLevel3Companies();
                vm.loadLevel4Companies();
                vm.loadRules();
            });
    }

    vm.toggleEdit = function () {
        vm.editable = !vm.editable;
    }

    vm.submitAndBack = function () {
        vm.back = true;
        vm.submit();
    }

    vm.checkRuleRates = function () {
        if (!vm.policy.rule_rates) {
            return;
        }
        var rates = vm.policy.rule_rates;
        var policy = vm.policy;
        policy.has_warning = false;
        if (policy.mandatory_fee > 0) {
            if (rates.mandatory_income < policy.mandatory_fee_income_rate) {
                policy.has_warning = true;
                return;
            }
            if (rates.mandatory_payment > policy.mandatory_fee_payment_rate) {
                policy.has_warning = true;
                return;
            }
        }
        if (policy.commercial_fee > 0) {
            if (rates.commercial_income < policy.commercial_fee_income_rate) {
                policy.has_warning = true;
                return;
            }
            if (rates.commercial_payment > policy.commercial_fee_payment_rate) {
                policy.has_warning = true;
                return;
            }
        }

        if (policy.tax_fee > 0) {
            if (rates.tax_income < policy.tax_fee_income_rate) {
                policy.has_warning = true;
                return;
            }
            if (rates.tax_payment > policy.tax_fee_payment_rate) {
                policy.has_warning = true;
                return;
            }
        }

        if (policy.other_fee > 0) {
            if (rates.other_income < policy.other_fee_income_rate) {
                policy.has_warning = true;
                return;
            }
            if (rates.other_payment > policy.other_fee_payment_rate) {
                policy.has_warning = true;
                return;
            }
        }
    }

    vm.submit = function () {
        vm.checkRuleRates();
        if (vm.clientInfo) {
            vm.policy.client = vm.clientInfo._id;
        }
        if (vm.policy.policy_status == "被驳回") {
            vm.policy.policy_status = "待审核";
        }
        PolicyService.savePolicy(vm.policy)
            .then(function (data) {
                if (data.duplicate) {
                    $.SmartMessageBox({
                        title: "发现单号重复保单",
                        content: "系统中已有相同保单号，重复提交？",
                        buttons: '[取消][确认]'
                    }, function (ButtonPressed) {
                        if (ButtonPressed === "确认") {
                            vm.policy.ignore_duplicate = true;
                            PolicyService.savePolicy(vm.policy)
                                .then(function () {
                                    $.smallBox({
                                        title: "服务器确认信息",
                                        content: "保单已成功保存",
                                        color: "#739E73",
                                        iconSmall: "fa fa-check",
                                        timeout: 5000
                                    });
                                    var old = vm.policy;

                                    vm.policy = {
                                        company: old.company,
                                        level1_company: old.level1_company,
                                        level2_company: old.level2_company,
                                        level3_company: old.level3_company,
                                        level4_company: old.level4_company
                                    };
                                    if (vm.back) {
                                        // if ($rootScope.user.userrole == "后台录单员") {
                                        //     $state.go("app.policy.to-be-paid");
                                        // } else {
                                            $state.go("app.policy.to-be-reviewed");
                                        // }
                                    }
                                })
                        }
                        if (ButtonPressed === "取消") {

                        }

                    });
                } else {
                    $.smallBox({
                        title: "服务器确认信息",
                        content: "保单已成功保存",
                        color: "#739E73",
                        iconSmall: "fa fa-check",
                        timeout: 5000
                    });
                    var old = vm.policy;
                    vm.policy = {
                        company: old.company,
                        level1_company: old.level1_company,
                        level2_company: old.level2_company,
                        level3_company: old.level3_company,
                        level4_company: old.level4_company,
                        tax_fee: 0,
                        tax_fee_income_rate: 0,
                        tax_fee_payment_rate: 0,
                        tax_fee_income:0,
                        tax_fee_payment: 0,
                        other_fee: 0,
                        other_fee_taxed: 0,
                        other_fee_income_rate: 0,
                        other_fee_income: 0,
                        other_fee_payment_rate: 0,
                        other_fee_payment: 0,
                        payment_addition: 0,
                        payment_substraction_rate: 0,
                        payment_substraction: 0
                    };
                    if (vm.back) {
                        // if ($rootScope.user.role == "后台录单员") {
                        //     $state.go("app.policy.to-be-paid");
                        // } else {
                            $state.go("app.policy.to-be-reviewed");
                        // }
                    }
                }
            }, function (err) { });
    };

    vm.pay = function () {
        vm.checkRuleRates();
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
                PolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为待支付",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        var ids = $stateParams.ids;
                        if (ids && ids.length > 0) {
                            var id = ids.shift();
                            $state.go("app.policy.approve1", { policyId: id, ids: ids });
                        } else {
                            $state.go("app.policy.to-be-reviewed");
                        }

                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }
        });
    };

    vm.reject = function () {
        $.SmartMessageBox({
            title: "驳回保单",
            content: "确认要驳回该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "被驳回";
                PolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为被驳回",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        var ids = $stateParams.ids;
                        if (ids && ids.length > 0) {
                            var id = ids.shift();
                            $state.go("app.policy.approve1", { policyId: id, ids: ids });
                        } else {
                            $state.go("app.policy.to-be-reviewed");
                        }

                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }
        });
    };

    vm.check = function () {
        $.SmartMessageBox({
            title: "修改保单状态",
            content: "确认要已核对该保单？",
            buttons: '[取消][确认]'
        }, function (ButtonPressed) {
            if (ButtonPressed === "确认") {
                vm.policy.policy_status = "已核对";
                PolicyService.savePolicy(vm.policy)
                    .then(function (data) {
                        $.smallBox({
                            title: "服务器确认信息",
                            content: "保单状态已成功更改为已核对",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                        var ids = $stateParams.ids;
                        if (ids && ids.length > 0) {
                            var id = ids.shift();
                            $state.go("app.policy.check1", { policyId: id, ids: ids });
                        } else {
                            $state.go("app.policy.paid");
                        }

                    }, function (err) { });
            }
            if (ButtonPressed === "取消") {

            }
        });

    };

    function RoundNum(num, length) { 
        var number = Math.round(num * Math.pow(10, length)) / Math.pow(10, length);
        return number;
    }

    vm.updateFee = function () {
        vm.policy.mandatory_fee_taxed = vm.policy.mandatory_fee / 1.06;
        if (vm.policy.mandatory_fee_taxed) {
            vm.policy.mandatory_fee_taxed = RoundNum(vm.policy.mandatory_fee_taxed, 2);
        }
        vm.policy.commercial_fee_taxed = vm.policy.commercial_fee / 1.06;
        if (vm.policy.commercial_fee_taxed) {
            vm.policy.commercial_fee_taxed = RoundNum(vm.policy.commercial_fee_taxed, 2);
        }
        vm.policy.other_fee_taxed = vm.policy.other_fee / 1.06;
        if (vm.policy.other_fee_taxed) {
            vm.policy.other_fee_taxed = RoundNum(vm.policy.other_fee_taxed, 2);
        }

        var divideBy = vm.policy.rates_based_on_taxed ? 106 : 100;

        vm.policy.mandatory_fee_income = vm.policy.mandatory_fee * vm.policy.mandatory_fee_income_rate / divideBy;
        if (vm.policy.mandatory_fee_income) {
            vm.policy.mandatory_fee_income = RoundNum(vm.policy.mandatory_fee_income, 2);
        }
        vm.policy.commercial_fee_income = vm.policy.commercial_fee * vm.policy.commercial_fee_income_rate / divideBy;
        if (vm.policy.commercial_fee_income) {
            vm.policy.commercial_fee_income = RoundNum(vm.policy.commercial_fee_income, 2);
        }
        vm.policy.tax_fee_income = vm.policy.tax_fee * vm.policy.tax_fee_income_rate / 100;
        if (vm.policy.tax_fee_income) {
            vm.policy.tax_fee_income = RoundNum(vm.policy.tax_fee_income, 2);
        }
        vm.policy.other_fee_income = vm.policy.other_fee * vm.policy.other_fee_income_rate / divideBy;
        if (vm.policy.other_fee_income) {
            vm.policy.other_fee_income = RoundNum(vm.policy.other_fee_income, 2);
        }

        if (!isNaN(vm.policy.mandatory_fee_income) && !isNaN(vm.policy.commercial_fee_income) && !isNaN(vm.policy.tax_fee_income) && !isNaN(vm.policy.other_fee_income)) {
            vm.policy.total_income = parseFloat(vm.policy.mandatory_fee_income) + parseFloat(vm.policy.commercial_fee_income) + parseFloat(vm.policy.tax_fee_income) + parseFloat(vm.policy.other_fee_income);
            vm.policy.total_income = RoundNum(vm.policy.total_income, 2);
        }

        vm.policy.mandatory_fee_payment = vm.policy.mandatory_fee * vm.policy.mandatory_fee_payment_rate / divideBy;

        if (vm.policy.mandatory_fee_payment) {
            vm.policy.mandatory_fee_payment = RoundNum(vm.policy.mandatory_fee_payment, 2);
        }
        vm.policy.commercial_fee_payment = vm.policy.commercial_fee * vm.policy.commercial_fee_payment_rate / divideBy;
        if (vm.policy.commercial_fee_payment) {
            vm.policy.commercial_fee_payment = RoundNum(vm.policy.commercial_fee_payment, 2);
        }
        vm.policy.tax_fee_payment = vm.policy.tax_fee * vm.policy.tax_fee_payment_rate / 100;
        if (vm.policy.tax_fee_payment) {
            vm.policy.tax_fee_payment = RoundNum(vm.policy.tax_fee_payment, 2);
        }
        vm.policy.other_fee_payment = vm.policy.other_fee * vm.policy.other_fee_payment_rate / divideBy;
        if (vm.policy.other_fee_payment) {
            vm.policy.other_fee_payment = RoundNum(vm.policy.other_fee_payment, 2);
        }
        if (!isNaN(vm.policy.mandatory_fee_payment) && !isNaN(vm.policy.commercial_fee_payment) && !isNaN(vm.policy.tax_fee_payment) && !isNaN(vm.policy.other_fee_payment)) {
            vm.policy.total_payment = parseFloat(vm.policy.mandatory_fee_payment) + parseFloat(vm.policy.commercial_fee_payment) + parseFloat(vm.policy.tax_fee_payment) + parseFloat(vm.policy.other_fee_payment);
            vm.policy.total_payment = RoundNum(vm.policy.total_payment, 2);
        }
        if (vm.policy.payment_addition) {
            vm.policy.total_payment = parseFloat(vm.policy.total_payment) + parseFloat(vm.policy.payment_addition);
            vm.policy.total_payment = RoundNum(vm.policy.total_payment, 2);
            vm.policy.total_income = parseFloat(vm.policy.total_income) + parseFloat(vm.policy.payment_addition);
            vm.policy.total_income = RoundNum(vm.policy.total_income, 2);
        }
        if (vm.policy.payment_substraction) {
            vm.policy.total_payment = parseFloat(vm.policy.total_payment) - parseFloat(vm.policy.payment_substraction);
            vm.policy.total_payment = RoundNum(vm.policy.total_payment, 2);
            vm.policy.total_income = parseFloat(vm.policy.total_income) -  parseFloat(vm.policy.payment_substraction);
            vm.policy.total_income = RoundNum(vm.policy.total_income, 2);
        }

    }

    vm.signPhotoChanged = function (files) {
        vm.uploadSignPhoto(files[0]);
    };

    vm.uploadSignPhoto = function (file) {
        PolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.sign_photo = fileName;
                if (vm.policy._id) {
                    PolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.otherPhotoChanged = function (files) {
        vm.uploadOtherPhoto(files[0]);
    };

    vm.uploadOtherPhoto = function (file) {
        PolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.other_photo = fileName;
                if (vm.policy._id) {
                    PolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.agreementPhotoChanged = function (files) {
        vm.uploadAgreementPhoto(files[0]);
    };

    vm.uploadAgreementPhoto = function (file) {
        PolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.agreement_photo = fileName;
                if (vm.policy._id) {
                    PolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.commercialPhotoChanged = function (files) {
        vm.uploadCommercialPhoto(files[0]);
    };

    vm.uploadCommercialPhoto = function (file) {
        PolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.commercial_policy_photo = fileName;
                if (vm.policy._id) {
                    PolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.commercialPhotoChanged = function (files) {
        vm.uploadCommercialPhoto(files[0]);
    };

    vm.mandatoryPhotoChanged = function (files) {
        vm.uploadMandatoryPhoto(files[0]);
    };

    vm.uploadMandatoryPhoto = function (file) {
        PolicyService.uploadFile(file)
            .then(function (fileName) {
                vm.policy.mandatory_policy_photo = fileName;
                if (vm.policy._id) {
                    PolicyService.updatePhoto(vm.policy)
                }
            })
    }

    vm.reviewPhoto = function (fileName) {
        ngDialog.open({
            template: 'app/policy/views/photo-review.html',
            className: 'ngdialog-theme-default',
            controller: 'PhotoReviewController as vm',
            resolve: {
                data: function () {
                    var val = {};
                    val.fileName = fileName;
                    val.policy = vm.policy;
                    return val;
                }
            }
        });
    }

    vm.getAttachmentUrl = function (fileName) {
        return "http://hy-policy.oss-cn-shanghai.aliyuncs.com/" + fileName;
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


angular.module('app.policy').directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
    return {
        link: function (scope, elem, attrs) {
            var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
            $window = angular.element($window);
            elem.css('overflow-y', 'auto');
            elem.css('overflow-x', 'hidden');
            elem.css('height', 'inherit');
            scrollDistance = 0;
            if (attrs.infiniteScrollDistance != null) {
                scope.$watch(attrs.infiniteScrollDistance, function (value) {
                    return (scrollDistance = parseInt(value, 10));
                });
            }
            scrollEnabled = true;
            checkWhenEnabled = false;
            if (attrs.infiniteScrollDisabled != null) {
                scope.$watch(attrs.infiniteScrollDisabled, function (value) {
                    scrollEnabled = !value;
                    if (scrollEnabled && checkWhenEnabled) {
                        checkWhenEnabled = false;
                        return handler();
                    }
                });
            }
            $rootScope.$on('refreshStart', function () {
                elem.animate({ scrollTop: "0" });
            });
            handler = function () {
                var container, elementBottom, remaining, shouldScroll, containerBottom;
                container = $(elem.children()[0]);
                elementBottom = elem.offset().top + elem.height();
                containerBottom = container.offset().top + container.height();
                remaining = containerBottom - elementBottom;
                shouldScroll = remaining <= elem.height() * scrollDistance;
                if (shouldScroll && scrollEnabled) {
                    if ($rootScope.$$phase) {
                        return scope.$eval(attrs.infiniteScroll);
                    } else {
                        return scope.$apply(attrs.infiniteScroll);
                    }
                } else if (shouldScroll) {
                    return (checkWhenEnabled = true);
                }
            };
            elem.on('scroll', handler);
            scope.$on('$destroy', function () {
                return $window.off('scroll', handler);
            });
            return $timeout((function () {
                if (attrs.infiniteScrollImmediateCheck) {
                    if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                        return handler();
                    }
                } else {
                    return handler();
                }
            }), 0);
        }
    };
}
]);