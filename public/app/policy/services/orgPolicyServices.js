"use strict";

angular.module('app.policy').factory('OrgPolicyService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                readExcel: readExcel,
                savePolicies: savePolicies,
                searchPolicies: searchPolicies,
                bulkPay: bulkPay,
                bulkDelete: bulkDelete,
                getSummary: getSummary,
                getFilteredCSV: getFilteredCSV
            });

            function searchPolicies(currentPage, pageSize, type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                if (type == "to-be-paid") {
                    filterSettings.policy_status = "待支付";
                    orderByReverse = false;
                } else if (type == "paid") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                }

                var end = new Date(toDate);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };


                $http.post("/api/org-policies/search", config)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function bulkPay(policyIds) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/org-policies/bulk-pay", policyIds)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function bulkDelete(policyIds) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post("/api/org-policies/bulk-delete", policyIds)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }


            function readExcel(file, level1_company, level2_company, level3_company, level4_company, clientInfo) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var reader = new FileReader();
                var name = file.name;
                reader.onload = function (e) {
                    //first check if payment_substract_rate is set for this client
                    if(!clientInfo.payment_substract_rate){
                        deferred.reject("导入失败，请联系业务管理员先设置该车商的结算费扣除比例！");
                    }

                    var data = e.target.result;
                    var workbook = XLSX.read(data, { type: 'binary' });

                    var first_sheet_name = workbook.SheetNames[0];
                    var sheet = workbook.Sheets[first_sheet_name];
                    //
                    var range = XLSX.utils.decode_range(sheet['!ref']);
                    var sheetData = [];

                    _.forEachRight(_.range(range.s.r, range.e.r + 1), function (row) {
                        var rowData = [];
                        var hasValidData = false;
                        _.forEachRight(_.range(range.s.c, range.e.c + 1), function (column) {
                            var cellIndex = XLSX.utils.encode_cell({
                                'c': column,
                                'r': row
                            });
                            var cell = sheet[cellIndex];
                            
                            if(cell){
                                hasValidData = true;
                                if(column == 7){ //special handling for date
                                    rowData[column] = cell.w;
                                }
                                else{
                                    rowData[column] = cell.v;
                                }
                                
                            }
                            else{
                                rowData[column] = undefined;
                            }
                            
                        });
                        if(hasValidData){
                            sheetData.unshift(rowData);
                        }
                        
                    });
                    var policies = [];
                    for (var i = 1; i < sheetData.length; i++) {
                        var row = sheetData[i];
                        for (var k = 0; k < row.length; k++) {
                            if (k<=7 && (!row[k] || row[k] == "")) {
                                if(k == 7){ // default date is today
                                    row[k] = new Date();
                                }
                                else{
                                    deferred.reject("导入失败，第"+k+"行保单信息不全，请检查导入文件！");
                                }
                                
                            }
                        }
                        var policy = {};
                        policy.policy_no = row[0];
                        policy.plate = row[1];
                        policy.applicant = row[2];
                        policy.policy_name = row[3];
                        policy.fee = row[4];
                        policy.income_rate = row[5] > 1 ? row[5] : row[5] * 100;
                        policy.income = row[6];
                        policy.created_at = new Date(row[7]);
                        policy.level1_company = level1_company;
                        policy.level2_company = level2_company;
                        policy.level3_company = level3_company;
                        policy.level4_company = level4_company;
                        policy.client = clientInfo._id;
                        policy.payment_substract_rate = clientInfo.payment_substract_rate > 1 ? clientInfo.payment_substract_rate :clientInfo.payment_substract_rate * 100;
                        policy.payment = policy.income * (1 - policy.payment_substract_rate / 100);
                        policy.profit = policy.income - policy.payment;
                        policy.policy_status = "待支付";
                        policies.push(policy);
                    }
                    deferred.resolve(policies);
                }

                reader.readAsBinaryString(file);

                return deferred.promise;

            }

            function getSummary(type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                if (type == "to-be-paid") {
                    filterSettings.policy_status = "待支付";
                    orderByReverse = false;
                } else if (type == "paid") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                }
                var end = new Date(toDate);
                var config = {
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };

                $http.post("/api/org-policies/summary", config)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function savePolicies(policies) {
                // create a new instance of deferred
                var deferred = $q.defer();
                $http.post('/api/org-policies', policies)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });
                // return promise object
                return deferred.promise;
            }

            function getFilteredCSV(type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                if (type == "to-be-paid") {
                    filterSettings.policy_status = "待支付";
                    orderByReverse = false;
                } else if (type == "paid") {
                    filterSettings.policy_status = "已支付";
                    orderByReverse = true;
                }
                var end = new Date(toDate);
                var config = {
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };
                $http.post("/api/org-policies/excel", config)
                    // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                    // handle error
                    .error(function (err) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }


        }]);