"use strict";

angular.module('app.log').factory('LogService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                getClients: getClients,
                searchLogs: searchLogs,
                getClient: getClient,
                // getFilteredCSV: getFilteredCSV,
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

            function getClients() {
                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=binded')
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
            
            
            

            function searchLogs(currentPage, pageSize, type, filterSettings, fromDate, toDate) {
                // create a new instance of deferred
                var deferred = $q.defer();
                var orderBy = "logAt";
                var orderByReverse = true;
                
                var end = new Date(toDate);
                end.setHours(23,59,59,0);
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

                
                $http.post("/api/logs/search", config)
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
            
           
            
            
            // function getFilteredCSV(type, filterSettings, fromDate, toDate) {
            //     // create a new instance of deferred
            //     var deferred = $q.defer();
            //     var orderBy = "submit_date";
            //     var orderByReverse = true;
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
            //     $http.post("/api/life-policies/excel", config)
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
        }]);