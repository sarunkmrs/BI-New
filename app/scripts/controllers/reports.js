'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportsCtrl
 * @description
 * # ReportsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportsCtrl', function ($scope, $localStorage, $state, $q, $http, $sce, commonService, reportsFactory, userDetailsService, CONFIG) {
    $scope.setLoading(true);
    $scope.access = {};
    $scope.access.limitTo = 6;
    $scope.access.subGroupItemsId = 0;
    setUserPreference();
    
    $scope.setListView = function (status) {
        if ($scope.groupsData) {
            $scope.groupsData.service['listView'] = status;
            //$scope.groupsData['listView']=status;

        }
        if (!$scope.dataObj) {
            return;
        }
        else {
            for (var i in $scope.dataObj) {
                $scope.dataObj[i].service.listView = status;
            }
        }
    }

    $scope.access.allReports = function () {
        userDetailsService.userPromise.then(function (userObject) {
            if (userObject[0].personaInfo.status === 'Error') {
                $scope.setLoading(false);
                $scope.groupsData = {
                    'title': '',
                    'open': 'true',
                    'limit': undefined,
                    'class_names': 'report-tile',
                    'loadmoredisable': '',
                    'service': '',
                    'data': '',
                    'pesonaError': userObject[0].personaInfo.message,
                    'rr': true
                };
            } else {  
                setUserLevel(userObject[0]);
                getBreadCrumLevel(false);
                
                $scope.biGroup.all().then(function () {
                    var groupid = $scope.biGroup.biGroupId;
                    var groupService = new reportsFactory.reportsFactoryFunction('group', groupid);
                    groupService.loadReports().then(function () {
                        $scope.setLoading(false);
                        var title = ($scope.biGroup && $scope.biGroup.biGroups &&
                                $scope.biGroup.biGroups[0] && $scope.biGroup.biGroups[0].levelDesc) ? $scope.biGroup.biGroups[0].levelDesc : (($state && $state.$current && $state.$current.data && $state.$current.data.displayName) ? $state.$current.data.displayName : 'Reports');
                        $scope.groupsData = {
                            'title': title,
                            'open': true,
                            'limit': undefined,
                            'class_names': 'report-tile',
                            'loadmoredisable': groupService.loadmoredisable,
                            'service': groupService,
                            'data': groupService.reports,
                            'rr': true
                        };

                        $scope.setListView(false);

                    }, function () {
                        $scope.setLoading(false);
                    });

                });
            }
        });
    };

    $scope.access.subGroupItems = function (levelid) {
        $scope.biGroup.all().then(function () {
            getBreadCrumLevel(levelid);
            $scope.setLoading(false);
            $scope.dataObj = [];
            
            function getLevelObj(obj) {
                var filter = _.findWhere(obj, {'levelId': parseInt(levelid)});
                if (filter) {
                    $scope.mainState.$current.data.displayName = filter.levelDesc;
                    var groupid = $scope.biGroup.biGroupId;
                    if (filter.children.length !== 0) {
                        $scope.dataObj = _.map(filter.children, function (eachLevel) {
                            var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, eachLevel.levelId, true);
                            groupService.loadReports();
                            return {
                                'title': eachLevel.levelDesc,
                                'open': true,
                                'limit': 6,
                                'class_names': 'report-tile',
                                'service': groupService,
                                'levelLink': eachLevel.levelId,
                                'data': groupService.reports
                            };
                        });
                    } else {
                        var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, levelid);
                        groupService.loadReports();
                        $scope.dataObj[0] = {
                            'title': filter.levelDesc,
                            'open': true,
                            'limit': undefined,
                            'class_names': 'report-tile',
                            'service': groupService,
                            'data': groupService.reports
                        };

                        $scope.setListView(false);
                    }
                } else {
                    _.map(obj, function (eachObj) {
                        if (eachObj.children.length !== 0) {
                            getLevelObj(eachObj.children);
                        }
                        return eachObj;
                    });
                }
            }
            getLevelObj($scope.biGroup.biGroups);
        });

        $scope.access.subGroupItemsId = levelid;
    };

    $scope.access.groupItems = function (groupid) {
        $scope.biGroup.all().then(function () {
            _.map($scope.biGroup.biGroups, function (firstLevel) {
                if (firstLevel.levelId.toString() === groupid) {
                    firstLevel.loadmoredisable = false;
                }
                return firstLevel;
            });
        });
        $scope.access.subGroupItemsId = undefined;
    };

    $scope.access.checkState = function (group) {
        if ($scope.access.catGroups === group.levelId) {
            return true;
        } else if ($state.current.name === 'reports.list') {
            return true;
        } else {
            return false;
        }
    };
    
    function setUserLevel(usrObj) {
        if(!$localStorage.myLevel) {
            if (usrObj.userinfo.badge === 'Bronze') {
                $scope.myLevel = 'bronze-level';
            } else if (usrObj.userinfo.badge === 'Silver') {
                $scope.myLevel = 'silver-level';
            } else if (usrObj.userinfo.badge === 'Gold') {
                $scope.myLevel = 'gold-level';
            } else if (usrObj.userinfo.badge === 'Platinum') {
                $scope.myLevel = 'platinum-level';
            }

            $localStorage.myLevel = $scope.myLevel
            $scope.$emit('myLevelIndication', $scope.myLevel);
        } else {
            $scope.myLevel = $localStorage.myLevel;
            $scope.$emit('myLevelIndication', $scope.myLevel);
        }
    }
    
    function setUserPreference() {
        var personalization = [];
        
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            $scope.setLoading(true);
            $http.get('BITool/home/getUserPersonalization').then(function (response) {
                if(response.data) {
                    personalization[response.data.favorite - 1] = 'favoriteReports'; 
                    personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                    personalization[response.data.recommended - 1] = 'recentViewedReports';

                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $scope.userTheme = $localStorage.userTheme;
                    $localStorage.personalization = personalization;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                } else {
                    $localStorage.userTheme = 'default';
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $scope.userTheme = $localStorage.userTheme;
                    $localStorage.personalization = personalization;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                }
            });
            $scope.setLoading(false);
        } else {
            $scope.userTheme = $localStorage.userTheme;
            personalization = $localStorage.personalization;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    } 
    
    function getBreadCrumLevel(levelid) {
        if(levelid) {
            $http.get('BITool/home/getBreadCrumbsDetails?levelId='+levelid).then(function (response) {
                if(response.data) {
                    $scope.pageBreadCrum = '';
                    var pageBreadCrum = '<a href="#/">Home</a>  -> <a href="#/reports">Available Reports</a>';
                    var data = response.data;

                    for(var i = 0; i<data.length; i++) {
                        var url = '#/reports/'+data[i].levelId;
                        pageBreadCrum +=' -><a href="'+url+'">'+data[i].levelDesc+'</a>';
                    }

                    $scope.pageBreadCrum = pageBreadCrum;
                    $scope.$emit('bredCrumValue', $scope.pageBreadCrum);

                } else {
                    console.log('else');
                }
            });
        } else {
            $scope.pageBreadCrum ='';
            var pageBreadCrum = '<a href="#/">Home</a>  -> Available Reports';
            $scope.pageBreadCrum = pageBreadCrum;
            $scope.$emit('bredCrumValue', $scope.pageBreadCrum);
        }
    }
})
.filter('filterReports', function () {
    return function (items, levelId) {
        return levelId === 0 ? items : _.filter(items, function (eachitem) {
            return eachitem.levelId === levelId;
        });
    };
});