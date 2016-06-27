'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ProfileCtrl', function ($scope, $localStorage, userDetailsService, commonService, CONFIG, $http) {
    $scope.setLoading(true);
    
    if(!$scope.userObject) {
        userDetailsService.userPromise.then(function (response) {
            $scope.setLoading(false);
            $scope.userObject = response[0];
            $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
            var userdetails = $scope.userObject;
            setUserLevel($scope.userObject);
            setUserPreference();
        });
    } else {
        var userdetails = $scope.userObject;
        setUserLevel(userdetails);
        setUserPreference();
        $scope.setLoading(false);
    }
    
    function setUserLevel(usrObj) {
        if(!$localStorage.myLevel) {
            console.log('Profile IF - No Localstorage level');
            if (usrObj.userinfo.badge === 'Bronze') {
                $scope.myLevel = 'bronze-level';
            } else if (usrObj.userinfo.badge === 'Silver') {
                $scope.myLevel = 'silver-level';
            } else if (usrObj.userinfo.badge === 'Gold') {
                $scope.myLevel = 'gold-level';
            } else if (usrObj.userinfo.badge === 'Platinum') {
                $scope.myLevel = 'platinum-level';
            }

            $scope.userBadgeImage = "images/"+$scope.myLevel+"-badge.png";
            $localStorage.myLevel = $scope.myLevel
            $scope.$emit('myLevelIndication', $scope.myLevel);
        } else {
            console.log('Profile ELSE - Yes Localstorage level');
            $scope.myLevel = $localStorage.myLevel;
            $scope.userBadgeImage = "images/"+$scope.myLevel+"-badge.png";
            $scope.$emit('myLevelIndication', $scope.myLevel);
        }
    }
    
    function setUserPreference() {
        var personalization = [];
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            console.log('Profile IF - No Localstorage theme');
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
        } else {
            console.log('Profile ELSE - Yes Localstorage theme');
            $scope.userTheme = $localStorage.userTheme;
            personalization = $localStorage.personalization;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
    
    $scope.setUserTheme = function(theme) {
//        if($localStorage.userTheme === theme) {
//            return;
//        }
//        console.log($scope.userObject);
//        console.log($localStorage.personalization);
//        $scope.setLoading(true);
//        var reportPriorityList = $localStorage.personalization
//        var putObj = {
//            'userId' : $scope.userObject.uid,
//            'recommended' :reportPriorityList.indexOf('recentViewedReports')+1,
//            'favorite' : reportPriorityList.indexOf('favoriteReports')+1,
//            'mostViewed' : reportPriorityList.indexOf('mostViewedReports')+1,
//            'userTheme' : findThemeKey(CONFIG.userTheme, theme)
//        }
//        console.log(putObj);
//        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
//            .then(function (resp, status, headers) {
//                $localStorage.userTheme = theme;
//                $scope.$emit('myThemeSettings', $localStorage.userTheme, reportPriorityList);
//                console.log(resp);
//            }, function (resp, status, headers, config) {
//                console.log(resp);
//            });
//    
//        $scope.setLoading(false);    
    };
    
    function findThemeKey(obj, value) {
        var key;
        
        _.each(_.keys(obj), function(k) {
           if(obj[k] === value) {
               key = k;
           } 
        });
        return parseInt(key);
    }
});