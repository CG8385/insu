"use strict";

angular.module('app.life-policy').factory('LifePolicyService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                savePolicy: savePolicy,
                getPolicies: getPolicies,
                getClients: getClients,
                getCompanies: getCompanies,
                getPolicy: getPolicy,
                deletePolicy: deletePolicy,
                searchPolicies: searchPolicies,
                getOrganizations: getOrganizations,
                getSellers: getSellers,
                getFilteredCSV: getFilteredCSV,
                // getSummary: getSummary,
                // bulkPay: bulkPay,
                saveSalary: saveSalary,
                getSalary: getSalary,
                searchSalaries: searchSalaries,
                getFilteredSalaryCSV: getFilteredSalaryCSV,
                deleteSalary: deleteSalary,
                saveStatement: saveStatement,
                getStatement: getStatement,
                searchStatements: searchStatements,
                getFilteredStatementCSV: getFilteredStatementCSV,
                deleteStatement: deleteStatement,
                getManagers: getManagers,
                getPolicyNames: getPolicyNames,
                getClient: getClient
            });

            function getClient(clientId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/clients/' + clientId)
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

            function savePolicy(policy) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (policy._id) {
                    policy.updated_at = Date.now();
                    $http.put('/api/life-policies/' + policy._id, policy)
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        .error(function (err) {
                            deferred.reject(status);
                        });
                } else {
                    policy.created_at = Date.now();
                    policy.updated_at = policy.created_at;
                    $http.post('/api/life-policies', policy)
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
                }
                
                // return promise object
                return deferred.promise;
            }
            
            function saveSalary(salary) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (salary._id) {
                    salary.updated_at = Date.now();
                    $http.put('/api/life-salaries/' + salary._id, salary)
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        .error(function (err) {
                            deferred.reject(status);
                        });
                } else {
                    salary.created_at = Date.now();
                    salary.updated_at = salary.created_at;
                    $http.post('/api/life-salaries', salary)
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
                }
                
                // return promise object
                return deferred.promise;
            }
            
            function saveStatement(statement) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (statement._id) {
                    statement.updated_at = Date.now();
                    $http.put('/api/life-statements/' + statement._id, statement)
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        .error(function (err) {
                            deferred.reject(status);
                        });
                } else {
                    statement.created_at = Date.now();
                    statement.updated_at = statement.created_at;
                    $http.post('/api/life-statements', statement)
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
                }
                
                // return promise object
                return deferred.promise;
            }
            
            function getSalary(salaryId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/life-salaries/' + salaryId)
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
            
            function getStatement(statementId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/life-statements/' + statementId)
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

            function getPolicies(type) {
                // create a new instance of deferred
                var deferred = $q.defer();

                var url = "/api/life-policies"
                // if (type == "to-be-paid") {
                //     url = "/api/life-policies/to-be-paid";
                // } else if (type == "paid") {
                //     url = "/api/life-policies/paid";
                // }
                $http.get(url)
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

            function getPolicy(policyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/life-policies/' + policyId)
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

            function deletePolicy(policyId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/life-policies/' + policyId)
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
            
            function deleteSalary(salaryId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/life-salaries/' + salaryId)
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
            
            function deleteStatement(statementId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/life-statements/' + statementId)
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

            function getClients() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=individual')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getManagers() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=manager')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getCompanies() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/companies')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getPolicyNames() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/policy-names')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }

            function searchPolicies(currentPage, pageSize, type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "submit_date";
                var orderByReverse = true;
                
                var end = new Date(toDate);
                end.setDate(end.getDate()+1);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    // filterBy: filterBy,
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };

                
                $http.post("/api/life-policies/search", config)
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
            
            function searchSalaries(currentPage, pageSize, type, filterSettings) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = true;
                
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    // filterBy: filterBy,
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                };

                
                $http.post("/api/life-salaries/search", config)
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
            
            function searchStatements(currentPage, pageSize, type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = true;
                
                var end = new Date(toDate);
                end.setDate(end.getDate()+1);
                var config = {
                    pageSize: pageSize,
                    currentPage: currentPage,
                    // filterBy: filterBy,
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };

                
                $http.post("/api/life-statements/search", config)
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
            
            // function getSummary(type, filterSettings, fromDate, toDate) {
            //     // create a new instance of deferred
            //     var deferred = $q.defer();
            //     var orderBy = "created_at";
            //     var orderByReverse = false;
            //     if (type == "to-be-paid") {
            //         filterSettings.policy_status = "待支付";
            //         orderByReverse = false;
            //     } else if (type == "paid") {
            //         filterSettings.policy_status = "已支付";
            //         orderByReverse = true;
            //     }
            //     var end = new Date(toDate);
            //     end.setDate(end.getDate()+1);
            //     var config = {
            //         filterByFields:filterSettings,
            //         orderBy: orderBy,
            //         orderByReverse: orderByReverse,
            //         requestTrapped: true,
            //         fromDate: fromDate,
            //         toDate: end
            //     };

            //     $http.post("/api/life-policies/summary", config)
            //     // handle success
            //         .success(function (data, status) {
            //             if (status === 200) {
            //                 deferred.resolve(data);
            //             } else {
            //                 deferred.reject(status);
            //             }
            //         })
            //     // handle error
            //         .error(function (err) {
            //             deferred.reject(status);
            //         });

            //     // return promise object
            //     return deferred.promise;
            // }
            
            // function bulkPay(type, filterSettings, fromDate, toDate) {
            //     // create a new instance of deferred
            //     var deferred = $q.defer();
            //     var orderBy = "created_at";
            //     var orderByReverse = false;
            //     if (type == "to-be-paid") {
            //         filterSettings.policy_status = "待支付";
            //         orderByReverse = false;
            //     } else if (type == "paid") {
            //         filterSettings.policy_status = "已支付";
            //         orderByReverse = true;
            //     }
            //     var end = new Date(toDate);
            //     end.setDate(end.getDate()+1);
            //     var config = {
            //         filterByFields:filterSettings,
            //         orderBy: orderBy,
            //         orderByReverse: orderByReverse,
            //         requestTrapped: true,
            //         fromDate: fromDate,
            //         toDate: end
            //     };

            //     $http.post("/api/life-policies/bulk-pay", config)
            //     // handle success
            //         .success(function (data, status) {
            //             if (status === 200) {
            //                 deferred.resolve(data);
            //             } else {
            //                 deferred.reject(status);
            //             }
            //         })
            //     // handle error
            //         .error(function (err) {
            //             deferred.reject(status);
            //         });

            //     // return promise object
            //     return deferred.promise;
            // }
            
            function getFilteredCSV(type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "submit_date";
                var orderByReverse = true;
                // if (type == "to-be-paid") {
                //     filterSettings.policy_status = "待支付";
                //     orderByReverse = false;
                // } else if (type == "paid") {
                //     filterSettings.policy_status = "已支付";
                //     orderByReverse = true;
                // }
                var end = new Date(toDate);
                end.setDate(end.getDate()+1);
                var config = {
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };
                $http.post("/api/life-policies/excel", config)
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
            
            function getFilteredSalaryCSV(type, filterSettings) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                var config = {
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                };
                $http.post("/api/life-salaries/excel", config)
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
            
            function getFilteredStatementCSV(type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "created_at";
                var orderByReverse = false;
                var end = new Date(toDate);
                end.setDate(end.getDate()+1);
                var config = {
                    filterByFields:filterSettings,
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true,
                    fromDate: fromDate,
                    toDate: end
                };
                $http.post("/api/life-statements/excel", config)
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
            
            function getOrganizations() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/organizations')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
            
            function getSellers() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/users?role=seller')
                // handle success
                    .success(function (data, status) {
                        if (status === 200) {
                            deferred.resolve(data);
                        } else {
                            deferred.reject(status);
                        }
                    })
                // handle error
                    .error(function (data) {
                        deferred.reject(status);
                    });

                // return promise object
                return deferred.promise;
            }
        }]);