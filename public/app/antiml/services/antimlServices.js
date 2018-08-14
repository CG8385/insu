"use strict";

angular.module('app.antiml').factory('AntiMLService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                getBMember: getBMember,
                saveBMember: saveBMember,
                deleteBMember: deleteBMember,
                getBlacklist: getBlacklist,
                getSuspTransaction: getSuspTransaction,
                saveSuspTransaction: saveSuspTransaction,
                deleteSuspTransaction: deleteSuspTransaction,
                getSuspTransactions: getSuspTransactions,
                checkML: checkML,
                convertSuspTransactionToBMember: convertSuspTransactionToBMember,
            });

            function getBlacklist() {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/blacklist')
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
            function getBMember(id) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/blacklist/' + id)
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
            function saveBMember(bmember) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (bmember._id) {
                    bmember.updated_at = Date.now();
                    $http.put('/api/blacklist/' + bmember._id, bmember)
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
                    bmember.created_at = Date.now();
                    bmember.updated_at = bmember.created_at;
                    $http.post('/api/blacklist', bmember)
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
            function deleteBMember(id) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/blacklist/' + id)
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
            function getSuspTransactions() {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/susptransaction')
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
            function getSuspTransaction(id) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.get('/api/susptransaction/' + id)
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
            function saveSuspTransaction(transaction) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (transaction._id) {
                    transaction.updated_at = Date.now();
                    $http.put('/api/susptransaction/' + transaction._id, transaction)
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
                    transaction.created_at = Date.now();
                    transaction.updated_at = transaction.created_at;
                    $http.post('/api/susptransaction', transaction)
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
            function deleteSuspTransaction(id) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/susptransaction/' + id)
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
            function checkML(identity,date = undefined) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if(date == undefined){
                    var checkDate = new Date();
                }else{
                    var checkDate = new Date(date);
                }
                var config = {
                    identity:identity,
                    checkDate:checkDate
                };
                console.log(config);
                $http.post('/api/susptransaction/check',config)
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
            function convertSuspTransactionToBMember(transaction) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var bmember = {};
                bmember.created_at = Date.now();
                bmember.updated_at = bmember.created_at;
                bmember.name = transaction.name;
                bmember.sex = transaction.sex;
                bmember.identity = transaction.identity;
                bmember.birthday = transaction.birthday;
                bmember.phone = transaction.phone;
                bmember.address = transaction.address;
                $http.post('/api/blacklist', bmember)
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