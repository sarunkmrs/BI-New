'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ParentCtrl
 * @description
 * # ParentCtrl
 * Controller of the myBiApp
 * Parent/top Controller for all controllers.
 */
angular.module('myBiApp')
.controller('ParentCtrl', function ($scope, $rootScope, $localStorage, $http, $q, ngProgressFactory, $state, reportsMenu, commonService, userDetailsService, userAlertService, CONFIG) {
    /**
     * @ngdoc property
     * @name biGroup
     * @description Will have object of service reportsMenu which basically have the menu or group levels of users.
     * 
     */
    $scope.noNavBar = true; 
    $scope.biGroup = reportsMenu;
    $scope.chevron = false;
    $scope.searchParent = '#search-parent';//id of div which append typeahead popup 
    $scope.searchin = 'persona';
    $scope.searchText = '';
    $scope.searchId = 0;
    $scope.showList = true;
    $scope.mainState = $state;
    $scope.setLoading(true);
    $scope.scrollVariable = false
    
    $scope.$on('bredCrumbValue', function(event, value){
        $scope.pageBreadCrumb = value
    });
    
    $scope.$on('setNavBar', function(event, value){
        $scope.noNavBar = true;
    });
    
    $scope.hideNavBar = function() {
        ($scope.noNavBar) ? $scope.noNavBar = false: $scope.noNavBar = true;
    };
    
    $scope.$on('myLevelIndication', function(event, value) {
        $localStorage.myLevel = value
        $scope.myLevel = $localStorage.myLevel;
    });
    
    $scope.$on('myThemeSettings', function(event, theme, personalization){
        $localStorage.userTheme = theme;
        $localStorage.personalization = personalization;
        $scope.userTheme = $localStorage.userTheme;
    });
    
    $scope.$on('setSearchDisplayName', function(event, value){
        $scope.searchDisplayName = value;
    });
    
    userDetailsService.userPromise.then(function (userObject) {
        $scope.userObject = userObject[0];
        
        if($localStorage.myLevel) {
            $scope.myLevel = $localStorage.myLevel;
        } else {
            setUserLevel($scope.userObject);
        }
        
        $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
        /**
         * Update my level indication
         */
        var userRoleDetailsUrl = commonService.prepareUserRoleDetailsUrl($scope.userObject.emcLoginName);
        
        $q.all([$http.get(userRoleDetailsUrl), reportsMenu.all()])
            .then(function (/*response*/) {
                $scope.setLoading(false);
            });
    });

    $scope.getSearchSuggest = function (val) {
        var defer = $q.defer();
        var filter = ($scope.searchFilter && $scope.searchFilter.id) ? $scope.searchFilter.id : 'searchText';
        var url = 'BITool/home/getAutoSuggestionList/1/20?searchType=' + $scope.searchin + '&' + filter + '=' + val;
            
        $http.get(url).then(function (response) {
            defer.resolve(_.uniq(response.data.map(function (item) {
                return item;
            })));
        });
        return defer.promise;
    };
    
    $scope.updateSearchIn = function(val) {
        $scope.searchin = (val === 'persona') ? 'persona' : 'catalog';
        $rootScope.searchin = $scope.searchin;
    }

    $scope.searchOnSelect = function ($item/*, $model, $label, $event*/) {
        $scope.searchText = $item;
        $scope.submitSearch();
    };

    $scope.submitSearch = function () {
        if ($scope.searchText) {
            $scope.model.isMinimised = true;
            
            userDetailsService.userPromise.then(function (response) {
                var addSearchTermUrl = commonService.prepareAddSearchTermUrl();
                var postObj = {
                    'searchString': $scope.searchText,
                    'userName': response[0].emcLoginName
                };
                $http.post(addSearchTermUrl, postObj);
            });
                
            $scope.chevron = false;
            
            if($scope.searchFilter) {
                $state.go('search', {'searchText': $scope.searchText, searchfilter:{'filter':$scope.searchFilter.id}, 'persona': ($scope.searchin === 'persona') ? 'Y' : 'N'});
            } else {
                $state.go('search', {'searchText': $scope.searchText, searchfilter:{'filter':null}, 'persona': ($scope.searchin === 'persona') ? 'Y' : 'N'});
            } 
        }
    };

    $scope.updateSearchId = function (id) {
        $scope.searchId = id;
    };

    $scope.$watch('userRole.selected', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.$broadcast('changeRole', newValue);
        }
    });

    //?:embed=yes&:toolbar=no
    $scope.updateShowlist = function (boolValue) {
        $scope.showList = boolValue;
    };

    $scope.showIcons = function () {
        $scope.updateShowlist(true);
    };

    $scope.hideIcons = function () {
        $scope.updateShowlist(false);
    };

    $scope.$on('emptySearchText', function (/*event, next, current, error*/) {
        $scope.searchText = '';
    });
    
    function setUserLevel(usrObj) {
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
    }

}).directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src !== attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    };
});