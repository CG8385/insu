"use strict";

angular.module('app.property-policy').factory('BulkPropertyPolicyService',
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
                getFilteredCSV: getFilteredCSV,
                deletePolicy: deletePolicy
            });

            function deletePolicy(policyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/bulk-property-policies/' + policyId)
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
                var start = new Date(fromDate);
                start.setHours(0, 0, 0, 1);
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: start,
                    toDate: end
                };


                $http.post("/api/bulk-property-policies/search", config)
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
                $http.post("/api/bulk-property-policies/bulk-pay", policyIds)
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
                $http.post("/api/bulk-property-policies/bulk-delete", policyIds)
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


            function readExcel(
                file, 
                level1_company, 
                level2_company, 
                level3_company, 
                level4_company, 
                clientInfo,
                policy_photo
            ) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var reader = new FileReader();
                var name = file.name;
                reader.onload = function (e) {
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
                                if(column == 0){ //special handling for date
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
                            if (k<=10 && (!row[k] || row[k] == "")) {
                                // if(k == 0){ // default date is today
                                //     row[k] = new Date();
                                // }
                                // else{
                                    deferred.reject("导入失败，第"+k+"行保单信息不全，请检查导入文件！");
                                // }
                                
                            }
                        }
                        var policy = {};
                        policy.created_at = new Date(row[0]);
                        policy.payer_name = row[1];
                        policy.insured_name = row[2];
                        policy.policy_no = row[3];
                        policy.bulk_no = row[4];
                        policy.product_name = row[5];
                        policy.fee = row[6];
                        policy.income_rate = row[7] > 1 ? row[7] : row[7] * 100;
                        policy.income = row[8];
                        policy.payment_rate = row[9] > 1 ? row[9] : row[9] * 100;
                        policy.payment = row[10];
                        policy.level1_company = level1_company;
                        policy.level2_company = level2_company;
                        policy.level3_company = level3_company;
                        policy.level4_company = level4_company;
                        policy.level1_org = clientInfo.level1_org;
                        policy.level2_org = clientInfo.level2_org;
                        policy.level3_org = clientInfo.level3_org;
                        policy.level4_org = clientInfo.level4_org;
                        policy.level5_org = clientInfo.level5_org;
                        policy.organization = clientInfo.level5_org;
                        policy.client = clientInfo._id;
                        policy.profit = policy.income - policy.payment;
                        policy.policy_status = "待支付";
                        policy.policy_photo = policy_photo;
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
                end.setHours(23,59,59,0);
                var config = {
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };

                $http.post("/api/bulk-property-policies/summary", config)
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
                $http.post('/api/bulk-property-policies', policies)
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
                var start = new Date(fromDate);
                start.setHours(0, 0, 0, 1);
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
                var config = {
                    filterByFields: filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: start,
                    toDate: end
                };
                $http.post("/api/bulk-property-policies/excel", config)
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