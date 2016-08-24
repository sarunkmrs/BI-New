'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportCtrl
 * @description
 * # ReportCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportCtrl', function ($scope, $rootScope, $http, $stateParams, $state, $sce, $filter, $timeout, reportsMenu, userDetailsService, commonService, CONFIG, $window, searchservice/*, $rootScope*/) {
    /*jshint latedef: false */
    $scope.setLoading(true);
    $scope.isTableu = false;
    $scope.tableuLink = '';
    $scope.feedbackArray = [];
    $scope.mainState.$current.data.displayName = '';
    $scope.reportAccessData = {};
    $scope.isCollapsed = false;    
    ($state.current.name !== 'reports.details.report.report' && $state.current.name !== 'reports.details.report.about') ? getBreadCrumbLevel($stateParams.reportId) : '';
    
    $scope.getTableuLink = function () {
        return $sce.trustAsResourceUrl($scope.tableuLink);
    };

    if ($stateParams.levelId && $stateParams.reportId) {
        if ($state.current.name === 'reports.details.report.report') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.reportId);
                $http.get(urlReports).then(function (resp) {
                    //Update user view count
                    var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl(response[0].emcLoginName, resp.data.sourceReportId, resp.data.sourceSystem, 'Persona');
                    $http.get(reportUpdateViewed);

                    if (resp.data.name) {
                        $scope.mainState.$current.data.displayName = resp.data.name;
                        $scope.reportName = resp.data.name;
                        addToRootScope(resp.data);
                        getBreadCrumbLevel($stateParams.reportId);
                        $scope.setLoading(false);
                        $scope.isTableu = true;
                        //$scope.tableuLink = value.tableuLink ? value.tableuLink:''; 
                        var placeholderDiv = document.getElementById('tableu_report3');
                        //placeholderDiv.setAttribute('fixT',Math.random());
                        var url = resp.data.reportLink ? resp.data.reportLink : '';
                        var options = {
                            hideTabs: (resp.data.tabbedViews && resp.data.tabbedViews === 'Y') ? false : true,
                            width: '100%',
                            height: '800px'
                        };
                        
                        new tableau.Viz(placeholderDiv, url, options);
                    }
                });
            });
        } else if ($state.current.name === 'reports.details.report.about') {
            $scope.reportData = {};
            
            if($rootScope.reportName) {
                $scope.mainState.$current.data.displayName = $rootScope.reportName;
                getBreadCrumbLevel($stateParams.reportId);
            }
            
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.reportId);
                
                $http.get(urlReports).then(function (resp) {
                    if($rootScope.reportName && $rootScope.reportName === resp.data.name) {
                        //
                    } else {
                        $scope.mainState.$current.data.displayName = resp.data.name;
                        addToRootScope(resp.data); 
                        getBreadCrumbLevel($stateParams.reportId);
                    }

                    $scope.reportData = resp.data;
                });
            });
            
            $scope.setLoading(false);
        } else if ($state.current.name === 'reports.details.report.access') {
            $scope.reportAccessData = {};
            ($rootScope.reportName) ? $scope.mainState.$current.data.displayName = $rootScope.reportName : '';
            var url = commonService.prepareReportAccessUrl($stateParams.reportId);

            $http.get(url).then(function (resp) {
                $scope.reportAccessData = resp.data    
            });
                    
            $scope.setLoading(false);
        } else if ($state.current.name === 'reports.details.report.feedback') {
            $scope.feedbackArray= [];
            ($rootScope.reportName) ? $scope.mainState.$current.data.displayName = $rootScope.reportName : '';
            $scope.feedbackArray = [];
            
            searchservice.loadFeedbacks($stateParams.reportId).then(function (resp) {
                $scope.feedbackArray = resp;
            });

            $scope.setLoading(false);
        } else if ($state.current.name === 'reports.details.report.reportmeta') {
            //for pagination http://stackoverflow.com/questions/10816073/how-to-do-paging-in-angularjs
            $scope.isTable = true;
            ($rootScope.reportName) ? $scope.mainState.$current.data.displayName = $rootScope.reportName : '';
            $scope.reportMetaData = [];
            $scope.metaDataCopy = [];
            $scope.reportFilterMetaData = [];        
            $scope.currentPage = 1;
            $scope.numPerPage = 20;
            $scope.maxSize = 5;
            $scope.totalItem ='';
            $scope.showIcon = false;
            $scope.setLoading(true);
            
            $scope.metaData = function () {
                if($rootScope.reportName && $rootScope.sourceSystem && $rootScope.sourceReportId) { 
                    $scope.isTableu = ($rootScope.repType === 'Tableau')? true : false
                    
                    if($scope.isTableu) {
                        if($rootScope.viewTabs === 'N') {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                            $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                            var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                        } else {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId+'&sourceReportId='+ $rootScope.sourceReportId;
                            $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId;
                            var url = commonService.prepareMetaDataUrlWork((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceSystem, $rootScope.workbookId);
                        }
                    } else {
                        $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                        $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                        var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                    }                 
                    
                    console.log(url);
                    
                    $http.get(url).then(function (resp) {
                        if(!resp.data) {
                            $scope.setLoading(false);
                            return;
                        }

                        $scope.reportMetaData = resp.data;
                        $scope.metaDataCopy = angular.copy($scope.reportMetaData);
                        $scope.totalItem = $scope.reportMetaData.length;
                        $scope.$watch("currentPage + numPerPage ", function() {
                            $scope.setLoading(true);
                            var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                            end = begin + $scope.numPerPage;
                            $scope.reportFilterMetaData = $scope.reportMetaData.slice(begin, end);
                            $scope.metaDataMessage = showMessage($scope.currentPage, $scope.totalItem, begin, end);
                            $scope.setLoading(false);
                        });
                        $scope.setLoading(false);
                    });
                } else {
                    userDetailsService.userPromise.then(function (response) { 
                        var urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.reportId);

                        $http.get(urlReports).then(function (resp) {
                            $rootScope.reportName = $scope.mainState.$current.data.displayName = resp.data.name;  
                            $rootScope.sourceSystem = resp.data.sourceSystem;
                            $rootScope.sourceReportId = resp.data.sourceReportId;
                            $rootScope.repType = resp.data.type;
                            $rootScope.workbookId = resp.data.additionalInfo;
                            $scope.isTableu = ($rootScope.repType === 'Tableau')? true : false;
                            
                            if($scope.isTableu) {
                                if($rootScope.viewTabs === 'N') {
                                    $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                    $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                    var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                                } else {
                                    $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId+'&sourceReportId='+ $rootScope.sourceReportId;
                                    $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId;
                                    var url = commonService.prepareMetaDataUrlWork((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceSystem, $rootScope.workbookId);
                                }
                            } else {
                                $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                            }
                            
                            console.log(url);
                            
                            $http.get(url).then(function (resp) {
                                if(!resp.data) {
                                    $scope.setLoading(false);
                                    return;
                                }

                                $scope.reportMetaData = resp.data;
                                $scope.metaDataCopy = angular.copy($scope.reportMetaData);
                                $scope.totalItem = $scope.reportMetaData.length;
                   
                                $scope.$watch("currentPage + numPerPage", function() {
                                    $scope.setLoading(true);
                                    var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                                    end = begin + $scope.numPerPage;
                                    $scope.reportFilterMetaData = $scope.reportMetaData.slice(begin, end);
                                    $scope.metaDataMessage = showMessage($scope.currentPage, $scope.totalItem, begin, end);
                                    $scope.setLoading(false);
                                });
                                $scope.setLoading(false);
                            });    
                        });
                    });
                }
            }
            
            $scope.metaData();
            
            $scope.resetFilterText = function() {
                $scope.showIcon = false;
                $scope.search.reportColumnName = '';
            }
            
            $scope.filterMetaData = function() {
                (!$scope.search.reportColumnName) ? $scope.showIcon = false : $scope.showIcon = true;
                
                $scope.$watch('search.reportColumnName', function(val) { 
                    $scope.currentPage = 1;
                    $scope.reportMetaData = $filter('filter')($scope.metaDataCopy, val);
                    $scope.totalItem = $scope.reportMetaData.length;
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                    end = begin + $scope.numPerPage;
                    $scope.reportFilterMetaData = $scope.reportMetaData.slice(begin, end);
                    $scope.metaDataMessage = showMessage($scope.currentPage, $scope.totalItem, begin, end);
                });
            };  
        }
    }
    
    function showMessage(currentPage, totalItem, begin, end) {
        //($scope.currentPage === 1) ? $scope.metaDataMessage = 'Showing 20 out of '+ $scope.totalItem + ' records.' : $scope.metaDataMessage = 'Showing ' + begin +' - '+ end + ' out of ' + $scope.totalItem +' records. ';
        var message ='';
        
        if(totalItem === 0) {
            message = '';
        } else {
            if(currentPage   === 1) {
                if(totalItem > 20) {
                    message = '1 - 20 of ' + totalItem;
                } else {
                    message = totalItem + ' of ' + totalItem;
                }
            } else {
                if(totalItem > end) {
                    message = begin + ' - ' + end + ' of ' + totalItem;
                } else {
                    message = begin + ' - ' + totalItem + ' of ' + totalItem;
                }  
            }
        }

        return message;
    }
    
    function addToRootScope(data) {
        $scope.mainState.$current.data.displayName = data.name;
        $rootScope.reportName = data.name;
        $rootScope.sourceReportId = data.sourceReportId; 
        $rootScope.sourceSystem = data.sourceSystem;
        $rootScope.levelId = data.levelId;
        $rootScope.repType = data.type;
        $rootScope.viewTabs = data.tabbedViews;
        $rootScope.workbookId = data.additionalInfo;
    }
    
    $scope.feedback = '';
    $scope.postFeedback = function () {
        if ($scope.feedback.trim() !== '') {
            $scope.setLoading(true);
            searchservice.postFeedback($stateParams.reportId, $scope.feedback).then(function (/*feedObj*/) {
                $scope.feedback = '';
                searchservice.loadFeedbacks($stateParams.reportId).then(function (resp) {
                    $scope.setLoading(false);
                    $scope.feedbackArray = resp;
                }, function () {
                    $scope.setLoading(false);
                });
            }, function () {
                $scope.setLoading(false);
            });
        }
    };
    
    function getBreadCrumbLevel(reportId) {
        if($rootScope.reportName && $rootScope.levelId) { 
            
            if($window.innerWidth < 768) {
                if($rootScope.reportName.length > 45) {
                    $scope.pageBreadCrumb = $rootScope.reportName.substr(0, 44)+'...';
                } else {
                    $scope.pageBreadCrumb = $rootScope.reportName;
                }
                
                $scope.$emit('bredCrumbValue', $scope.pageBreadCrumb);
                return;
            }

            $http.get('BITool/home/getBreadCrumbsDetails?levelId='+$rootScope.levelId).then(function (response) {
                if(response.data) {
                    $scope.pageBreadCrumb = '';
                    var pageBreadCrumb = '<a href="#/">Home</a>&nbsp;&nbsp;>&nbsp;&nbsp;<a href="#/reports">Available Reports</a>';
                    var data = response.data;

                    for(var i = 0; i<data.length; i++) {
                        var url = '#/reports/'+data[i].levelId;
                        pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<a href="'+url+'">'+data[i].levelDesc+'</a>';
                    }
                    
                    if($window.innerWidth > 768 && $window.innerWidth < 992) {
                        if($rootScope.reportName.length > 25) {
                            $rootScope.reportName = $rootScope.reportName.substr(0, 24)+'...';
                            pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<span class="reportName">'+$rootScope.reportName+'</span>'; 
                        } else {
                            pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<span class="reportName">'+$rootScope.reportName+'</span>'; 
                        }
                    } else { 
                        pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<span class="reportName">'+$rootScope.reportName+'</span>'; 
                    }
                    
                    $scope.pageBreadCrumb = pageBreadCrumb;
                    $scope.$emit('bredCrumbValue', $scope.pageBreadCrumb);

                } else {
                }
            });
        } else {
            userDetailsService.userPromise.then(function (response) {
                var urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, reportId);
                $http.get(urlReports).then(function (resp) {
                    addToRootScope(resp.data);
                    var reportName = resp.data.name;
                    var reportLevelId = resp.data.levelId;

                    if($window.innerWidth < 768) {
                        if(reportName.length > 45) {
                            $scope.pageBreadCrumb = reportName.substr(0, 44)+'...';
                        } else {
                            $scope.pageBreadCrumb = reportName;
                        }
                        
                        $scope.$emit('bredCrumbValue', $scope.pageBreadCrumb);
                        return;
                    }

                    $http.get('BITool/home/getBreadCrumbsDetails?levelId='+reportLevelId).then(function (response) {
                        if(response.data) {
                            $scope.pageBreadCrumb = '';
                            var pageBreadCrumb = '<a href="#/">Home</a>&nbsp;&nbsp;>&nbsp;&nbsp;<a href="#/reports">Available Reports</a>';
                            var data = response.data;

                            for(var i = 0; i<data.length; i++) {
                                var url = '#/reports/'+data[i].levelId;
                                pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<a href="'+url+'">'+data[i].levelDesc+'</a>';
                            }
                            
                            if($window.innerWidth > 768 && $window.innerWidth < 992) {
                                if(reportName.length > 25) {
                                    reportName = reportName.substr(0, 24)+'...';
                                    pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<span class="reportName">'+reportName+'</span>'; 
                                } else {
                                    pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<span class="reportName">'+reportName+'</span>'; 
                                }
                            } else { 
                                pageBreadCrumb +='&nbsp;&nbsp;>&nbsp;&nbsp;<span class="reportName">'+reportName+'</span>'; 
                            }
                            
                            $scope.pageBreadCrumb = pageBreadCrumb;
                            $scope.$emit('bredCrumbValue', $scope.pageBreadCrumb);

                        } else {
                        }
                    });
                });
            });
        }
    }
});