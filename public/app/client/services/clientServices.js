"use strict";

angular.module('app.client').factory('ClientService',
    ['$q', '$http',
        function ($q, $http) {
            // return available functions for use in controllers
            return ({
                saveClient: saveClient,
                getOrgClients: getOrgClients,
                getIndClients: getIndClients,
                getManagerClients: getManagerClients,
                getClient: getClient,
                deleteClient: deleteClient,
                getFollowers: getFollowers,
                getWechatsByIds: getWechatsByIds,
                getOrganizations: getOrganizations,
                uploadFile: uploadFile,
            });

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

            function saveClient(client) {
                // create a new instance of deferred
                var deferred = $q.defer();

                if (client._id) {
                    client.updated_at = Date.now();
                    $http.put('/api/clients/' + client._id, client)
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
                    client.created_at = Date.now();
                    client.updated_at = client.created_at;
                    $http.post('/api/clients', client)
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

            function deleteClient(clientId) {
                // create a new instance of deferred
                var deferred = $q.defer();

                $http.delete('/api/clients/' + clientId)
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

            function getOrgClients() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/api/clients?type=organization')
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

            function getIndClients() {

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
            
            function getManagerClients() {

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
            
            function getFollowers() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.get('/wechat/followers')
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
            
            function getWechatsByIds(openIds) {

                // create a new instance of deferred
                var deferred = $q.defer();

                $http.post('/wechat/byids', openIds)
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
            
            function getStsCredential() {
                // create a new instance of deferred
                var deferred = $q.defer();
                if (false){
                }
                else {
                    // send a post request to the server
                    $http.get('api/sts')
                        // handle success
                        .success(function (data, status) {
                            if (status === 200) {
                                deferred.resolve(data.Credentials);
                            } else {
                                deferred.reject(status);
                            }
                        })
                        // handle error
                        .error(function (data) {
                            deferred.reject(status);
                        });
                }
                // return promise object
                return deferred.promise;
            }

            function uploadFile(file, fileName) {
                document.body.style.cursor='wait';
                var deferred = $q.defer();
                getStsCredential()
                .then(function(credentials){
                    var client = new OSS.Wrapper({
                    region: 'oss-cn-shanghai',
                    accessKeyId: credentials.AccessKeyId,
                    accessKeySecret: credentials.AccessKeySecret,
                    stsToken: credentials.SecurityToken,
                    // bucket: 'cwang1'
                    bucket: 'hy-policy'
                }, function(err){
                    document.body.style.cursor='default';   
                    $.bigBox({
                        title: "上传文件",
                        content: "上传失败，请检查网络",
                        color: "#C46A69",
                        icon: "fa fa-warning shake animated",
                        timeout: 6000
                    });
                    return;
                });
                if(!fileName){
                    var ext = /\.[^\.]+$/.exec(file.name); 
                    fileName = uuid.v1() + ext;
                }
                client.multipartUpload(fileName, file).then(function (result) {
                    var url = "http://hy-policy.oss-cn-shanghai.aliyuncs.com/" + fileName;
                    // var url = "http://cwang1.oss-cn-shanghai.aliyuncs.com/" + fileName;
                    $.smallBox({
                            title: "服务器确认信息",
                            content: "扫描件已成功上传",
                            color: "#739E73",
                            iconSmall: "fa fa-check",
                            timeout: 5000
                        });
                    document.body.style.cursor='default';    
                    deferred.resolve(fileName);
                    }).catch(function (err) {
                    deferred.reject(err);
                    });
                });
                return deferred.promise;
                
            }
            
           
        }]);