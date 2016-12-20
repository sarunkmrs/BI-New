'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 * Main module of the applications. {@link
 * myBiApp.controller:MainCtrl MainCtrl}
 */
angular
.module('myBiApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngStorage',
    'ngTouch',
    'nvd3',
    'ui.bootstrap',
    'underscore',
    'ui.grid',
    'ui.router',
    'ngProgress',
    'infinite-scroll',
    'angular-jqcloud',
    'angularTreeview',
    'ncy-angular-breadcrumb',
    'ngScrollbars'
])
.constant('CONFIG', {
    viewDir: 'views/',
    limit: 20,
    tableauImagesPath: '../PreviewImages/',
    API: {
        //Set useMocks to true to simulate/mock actual webservice.
        useMocks: false,
        fakeDelay: 800,
        //baseUrl: 'http://bipdurdev01.corp.emc.com/',
        baseUrl: '/'
    },
    userTheme: {
        '0':'default',  
        '1':'black'
    }
})
.config(["CONFIG", "$provide", function (CONFIG, $provide) {
    //Only load mock data, if config says so
    if (!CONFIG.API.useMocks) {
        return;
    }
    //Decorate backend with awesomesauce
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
}])
.config(["ScrollBarsProvider", function (ScrollBarsProvider) {
    // the following settings are defined for all scrollbars unless the
    // scrollbar has local scope configuration
    ScrollBarsProvider.defaults = {
        scrollButtons: {
            scrollAmount: 'auto', // scroll amount when button pressed
            enable: true // enable scrolling buttons by default
        },
        scrollInertia: 400, // adjust however you want
        axis: 'yx', // enable 2 axis scrollbars by default,
        theme: 'light',
        autoHideScrollbar: false
    };
}])
.config(["CONFIG", "$httpProvider", "$breadcrumbProvider", function (CONFIG, $httpProvider, $breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
        prefixStateName: 'home',
        template: 'bootstrap2'
    });
    
    $httpProvider.interceptors.push(["$q", "$timeout", "CONFIG", "$rootScope", function ($q, $timeout, CONFIG, $rootScope) {
        /**
         * Function which add new params to url 
         * To avoid caching in IE get request.
         */
        function addUrlParam(url, key, value) {
            var newParam = key + '=' + value;
            var result = url.replace(new RegExp('(&|\\?)' + key + '=[^\&|#]*'), '$1' + newParam);
            if (result === url) {
                result = (url.indexOf('?') !== -1 ? url.split('?')[0] + '?' + newParam + '&' + url.split('?')[1]
                        : (url.indexOf('#') !== -1 ? url.split('#')[0] + '?' + newParam + '#' + url.split('#')[1]
                                : url + '?' + newParam));
            }
            return result;
        }
        return {
            'request': function (config) {
                if (config.url.indexOf(CONFIG.viewDir) !== 0 && config.url.indexOf('directives') !== 0 && config.url.indexOf('uib') !== 0 && config.url.indexOf('template') !== 0 && config.url.indexOf('ui-grid') !== 0) {
                    config.url = addUrlParam(CONFIG.API.baseUrl + config.url, '_', Date.now());
                }
                return config;
            },
            'requestError': function (rejection) {
                var modalContent;
                if (rejection.status === 0) {
                    modalContent = {
                        title: 'SSO timed out',
                        message: 'Please log into SSO again before continuing',
                        ok: false,
                        cancel: {text: 'OK', callback: function () {
                        }}
                    };
                    
                    $rootScope.$broadcast('ShowUserAlert', modalContent);
                } else {
                    modalContent = {
                        title: 'Webservice: HTTP error',
                        message: rejection.data,
                        ok: false,
                        cancel: {text: 'OK', callback: function () {
                        }}
                    };
                    
                    $rootScope.$broadcast('ShowUserAlert', modalContent);
                }
                return $q.reject(rejection);
            },
            'responseError': function (rejection) {
                var modalContent;
                if (rejection.status === 0) {
                    modalContent = {
                        title: 'SSO timed out',
                        message: 'Please log into SSO again before continuing',
                        ok: false,
                        cancel: {text: 'OK', callback: function () {
                        }}
                    };
                    
                    $rootScope.$broadcast('ShowUserAlert', modalContent);
                } else {
                    modalContent = {
                        title: 'Webservice: HTTP error',
                        message: rejection.data,
                        ok: false,
                        cancel: {text: 'OK', callback: function () {
                        }}
                    };

                    $rootScope.$broadcast('RefreshSSO', modalContent);
                }
                return $q.reject(rejection);
            }
        };
    }]);
}])
.constant('regexEscape', function regEsc(str) {
    //Escape string to be able to use it in a regular expression
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
})
.config(["$routeProvider", "$stateProvider", "$urlRouterProvider", function ($routeProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'views/main.html',
            controller: 'MainCtrl',
            data: {
                displayName: 'Home',
                subCaption: 'Welcome to Insights',
                classIcon: 'home-header-icon',
                breadcrumName: 'Home'
            },
            ncyBreadcrumb: {
                label: 'Home'
            }
        })
        .state('search', {
            url: '/search/:persona?searchText',
            templateUrl: 'views/search.html',
            controller: 'SearchCtrl',
            data: {
                displayName: 'Search',
                subCaption: '',
                classIcon: 'search-header-icon',
            },
            params: {
                'searchfilter':null
            },
            ncyBreadcrumb: {
                label: 'Search'
            }
        })
        .state('search.details', {
            url: '/:searchId/:sourceReportId/:sourceName',
            abstract: true,
            data: {
                displayName: 'Search',
                subCaption: '',
                classIcon: 'recommended-header-icon',
            }
        })
        .state('search.details.report', {
            url: '/report',
            views: {'@': {
                    templateUrl: 'views/report1.html',
                    controller: 'SearchdetailsCtrl'
                }
            },
            data: {
                displayName: 'Search',
                subCaption: '',
                classIcon: 'recommended-header-icon',
            },
            ncyBreadcrumb: {
                label: 'Search'
            }
        })
        .state('search.details.about', {
            url: '/about',
            views: {'@': {
                    templateUrl: 'views/search.about.html',
                    controller: 'SearchdetailsCtrl'
                }
            },
            data: {
                displayName: 'Search',
                subCaption: '',
                classIcon: 'recommended-header-icon',
            },
            ncyBreadcrumb: {
                label: 'Search'
            }
        })
        .state('search.details.access', {
            url: '/access',
            views: {'@': {
                    templateUrl: 'views/search.access.html',
                    controller: 'SearchdetailsCtrl'
                }
            },
            data: {
                displayName: 'Search',
                subCaption: '',
                classIcon: 'recommended-header-icon',
            },
            ncyBreadcrumb: {
                label: 'Search'
            }
        })
        .state('search.details.feedback', {
            url: '/feedback',
            views: {'@': {
                    templateUrl: 'views/search.feedback.html',
                    controller: 'SearchdetailsCtrl'
                }
            },
            data: {
                displayName: 'Search',
                subCaption: '',
                classIcon: 'recommended-header-icon',
            },
            ncyBreadcrumb: {
                label: 'Search'
            }
        })
        .state('search.details.reportmeta', {
            url: '/reportmeta',
            views: {'@': {
                    templateUrl: 'views/search.reportmeta.html',
                    controller: 'SearchdetailsCtrl'
                }
            },
            data: {
                displayName: 'Search',
                subCaption: '',
                classIcon: 'recommended-header-icon',
            },
            ncyBreadcrumb: {
                label: 'Search'
            }
        })
        .state('reportsDashboard', {
            url: '/reportsDashboard',
            templateUrl: 'views/reportsDashboard.html',
            controller: 'ReportsdashboardCtrl',
            data: {
                displayName: 'Operational Dashboard',
                subCaption: '',
                classIcon: 'operation-header-icon',
                breadcrumName: 'Operational Dashboard'
            },
            ncyBreadcrumb: {
                label: 'Operational Dashboard'
            }
        })
        .state('favorites', {
            url: '/favorites',
            templateUrl: 'views/favorites.html',
            controller: 'favoritesCtrl',
            data: {
                displayName: 'My Favorites',
                subCaption: '',
                classIcon: 'myfavorites-header-icon',
                breadcrumName: 'My Favorites'
            },
            ncyBreadcrumb: {
                label: 'My Favorites'
            }
        })
        .state('profile', {
            url: '/profile',
            templateUrl: 'views/myprofile.html',
            controller: 'ProfileCtrl',
            data: {
                displayName: 'My Profile',
                subCaption: '',
                classIcon: 'myprofile-header-icon',
                breadcrumName: 'My Profile'
            },
            ncyBreadcrumb: {
                label: 'My Profile'
            }
        })
        .state('helpSupport', {
            url: '/helpSupport',
            templateUrl: 'views/helpSupport.html',
            controller: 'HelpSupportCtrl',
            data: {
                displayName: 'Help & Support',
                subCaption: '',
                classIcon: 'myprofile-header-icon',
                breadcrumName: 'Help & Support'
            },
            ncyBreadcrumb: {
                label: 'Help & Support'
            }
        })        
        .state('reports', {
            url: '/reports',
            abstract: true,
            templateUrl: 'views/reports.html',
            controller: 'ReportsCtrl',
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: 'Available Reports'
            }
            /*resolve: {
             reportsMenuResolve: ['reportsMenu',
             function( reportsMenu){
             return reportsMenu.all();
             }]
             },*/

        })
        .state('reports.list', {
            url: '',
            views: {'report': {
                    templateUrl: 'views/reports.list.html',
                    controller: ["$scope", function ($scope) {
                        $scope.access.allReports();
                    }]
                }},
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: 'Available Reports'
            },
            ncyBreadcrumb: {
                label: 'Available Reports'
            }

        })
        .state('reports.details', {
            url: '/{levelId:[0-9]{1,10}}',
            views: {'report': {
                    templateUrl: 'views/reports.list.level.html',
                    controller: ["$scope", "$stateParams", function ($scope, $stateParams) {
                        $scope.access.subGroupItems($stateParams.levelId);
                    }]
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{displayNameb}}'
            },
            ncyBreadcrumb: {
                label: '{{displayNameb}}'
            }
        })
        .state('reports.viewAll', {
            url: '/{levelId:[0-9]{1,10}}/viewAll',
            views: {'report': {
                    templateUrl: 'views/reports.list.level.html',
                    controller: ["$scope", "$stateParams", function ($scope, $stateParams) {
                        $scope.access.subGroupItemsViewAll($stateParams.levelId);
                    }]
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{displayNameb}}'
            },
            ncyBreadcrumb: {
                label: '{{displayNameb}}'
            }
        })
        .state('reports.details.report', {
            url: '/{reportId:[0-9]{1,10}}',
            abstract: true,
            data: {
                displayName: 'Available Reports',
                subCaption: '---',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{reportName}}'
            },
            ncyBreadcrumb: {
                label: '{{reportName}}'
            },
            params: {
                'reportName':null
            },

        })
        .state('reports.details.report.report', {
            url: '/report',
            views: {'report@reports': {
                    templateUrl: 'views/report1.html',
                    controller: 'ReportCtrl'
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{reportName}}'
            },
            ncyBreadcrumb: {
                label: '{{reportName}}'
            }
        })
        .state('reports.details.report.about', {
            url: '/about',
            views: {'report@reports': {
                    templateUrl: 'views/search.about.html',
                    controller: 'ReportCtrl'
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{reportName}}'
            },
            ncyBreadcrumb: {
                label: '{{reportName}}'
            }

        })
        .state('reports.details.report.access', {
            url: '/access',
            views: {'report@reports': {
                    templateUrl: 'views/search.access.html',
                    controller: 'ReportCtrl'
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{reportName}}'
            },
            ncyBreadcrumb: {
                label: '{{reportName}}'
            }

        })
        .state('reports.details.report.feedback', {
            url: '/feedback',
            views: {'report@reports': {
                    templateUrl: 'views/search.feedback.html',
                    controller: 'ReportCtrl'
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{reportName}}'
            },
            ncyBreadcrumb: {
                label: '{{reportName}}'
            }

        })
        .state('reports.details.report.reportmeta', {
            url: '/reportmeta',
            views: {'report@reports': {
                    templateUrl: 'views/search.reportmeta.html',
                    controller: 'ReportCtrl'
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon',
                breadcrumName: '{{reportName}}'
            },
            ncyBreadcrumb: {
                label: '{{reportName}}'
            }

        })
        .state('reports.groupdetails', {
            url: '/v/:groupId',
            views: {'report': {
                    templateUrl: 'views/reports.list.level.html',
                    controller: ["$scope", "$stateParams", function ($scope, $stateParams) {
                        $scope.access.groupItems($stateParams.groupId);
                    }]
                }
            },
            data: {
                displayName: 'Available Reports',
                subCaption: '',
                classIcon: 'recommended-header-icon'
            }
        })
        .state('help', {
            url: '/help',
            templateUrl: 'views/underconstruction.html',
            controller: '',
            data: {
                displayName: 'Under Construction',
                subCaption: '',
                classIcon: 'home-header-icon'
            }
        })
        .state('faq', {
            url: '/faq',
            templateUrl: 'views/underconstruction.html',
            controller: '',
            data: {
                displayName: 'Under Construction',
                subCaption: '',
                classIcon: 'home-header-icon'
            }
        })
        .state('tilesPage', {
            url: '/tilesPage',
            templateUrl: 'views/tilesPage.html',
            controller: 'tilesPageCtrl'
        })
        .state('page404', {
            url: '/404',
            templateUrl: 'views/404.html',
            controller: 'tilesPageCtrl'
        });
}]);
'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 * Run Block of the application.
 */
angular.module('myBiApp')
.run(["CONFIG", "$httpBackend", "$rootScope", "$state", "$stateParams", "$http", "$templateCache", function (CONFIG, $httpBackend, $rootScope, $state, $stateParams, $http, $templateCache/*, regexEscape*/) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.isLoading = true;

    $rootScope.$on('$routeChangeStart', function (/*event, next, current*/) {
        $rootScope.setLoading(true);
    });


    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        //scroll top when navigating from one to another
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        $rootScope.setLoading(false);
        if (toState && toState.name && toState.name.indexOf('search') !== 0) {
            $rootScope.$broadcast('emptySearchText');
        }
    });

    $rootScope.$on('$routeChangeError', function (/*event, next, current, error*/) {
        $rootScope.setLoading(false);
    });

    /**
     *setLoading function is used to show/hide loading on screen.  
     */
    $rootScope.setLoading = function (loading) {

        $rootScope.isLoading = loading;
    };

    $rootScope.$on('$stateChangeStart', function () {

        $rootScope.setLoading(true);
    });

    //loading user alert template to template cache in bootstrap to avoid sso auth for this template.
    $http.get('views/useralert.html', {cache: $templateCache});


    //Only load mock data, if config says so
    if (!CONFIG.API.useMocks) {
        return;
    }

    //Allow templates under views folder to get actual data
    $httpBackend.whenGET(/views\/*/).passThrough();

    $httpBackend.whenGET(/http:\/\/pedappdev01\.isus\.emc\.com\:8080\/*/).passThrough();

    $httpBackend.whenPOST(/http:\/\/pedappdev01\.isus\.emc\.com\:8080\/*/).passThrough();

    //GET tag/
    $httpBackend.whenGET(/getUserDetails/).respond(function (/*method, url, data, headers*/) {
        return [200, '[{"uid":"990865","userFullName":"Sarunkumar Moorthy","emcIdentityType":"V","title":"web developer","mail":"Sarunkumar.Moorthy@emc.com","emcCostCenter":"US1018315","emcGeography":null,"emcOrgCode":null,"emcOrgName":null,"emcEntitlementsCountry":"IN","emcLoginName":"moorts5","emctelephoneextension":"0","telephonenumber":null}]', {/*headers*/}];
    });

    $httpBackend.whenGET(/userinfo\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"group":[{"groupId":37,"groupName":"Admin_Mobile","pageLink":"https://inside.emc.com/community/active/tableau_users_forum","helpLinkLabel":"Click here for help","contactEmail":"insights.portal.help@emc.com"}],"role":"Admin","badge":"Bronze","userId":3034,"fullName":"Sarunkumar Moorthy","userPersonaList":[{"groupId":12,"groupName":"Admin"},{"groupId":24,"groupName":"GBS_Commercial Services"},{"groupId":37,"groupName":"Admin_Mobile"}],"isMultiplePersona":true}'];
    });

    $httpBackend.whenGET(/userExistInBITool\/*/).respond(function (/*method, url, data*/) {
//        return [200, '{"communicationList":[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"communicationId":119,"groupId":0,"link":"https://bipduruat01.corp.emc.com","title":"Welcome to Insights","details":"Click for more info","image":"https://bipduruat01.corp.emc.com/banners/banner1.png","groupIdList":null}],"allGroups":null,"status":"Error","message":"Your account has not been setup in the Insights Portal with an associated Persona. Please contact \'insights.portal.help@emc.com\' for further assistance."}'];
        return [200, '{"communicationList":[],"allGroups":null,"status":"Success","message":"Your account has not been setup in the Insights Portal with an associated Persona. Please contact insights.portal.help@emc.com for further assistance.","isApplicationRunning":true}'];
//        return [200, '{"communicationList":null,"allGroups":null,"status":"Error","isApplicationRunning":false,"message":"EMC Insight portal is under maintenance due to August Release. Sorry for inconvenience. It will be resumed at 7.00AM UST"}'];
    });

    $httpBackend.whenGET(/dashboard\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"userName":"moorts5","reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Biz Ops FPY Dashboard","type":"Tableau","owner":"georgb3","reportDesc":null,"id":137,"reportLink":"https://baaastableau.corp.emc.com/t/GBS_CC/views/GBSBizOpsFPYDashboard/CoverPage","functionalArea":"GBS_CC","functionalAreaLvl1":"Commercial Services","functionalAreaLvl2":"GBS Biz Ops FPY Dashboard","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"173788","additionalInfo":"31274","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1467000000000,"updateDate":1471838400000,"addToGallery":null,"viewCount":null,"lastViewed":1478585156497,"favorite":"Y","levelId":70,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Deal Registration Dashboard","type":"Tableau","owner":"georgb3","reportDesc":null,"id":136,"reportLink":"https://baaastableau.corp.emc.com/t/GBS_CC/views/DealRegistrationDashboard/CoverPage","functionalArea":"GBS_CC","functionalAreaLvl1":"Commercial Services","functionalAreaLvl2":"Deal Registration Dashboard","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"172430","additionalInfo":"31067","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1465963200000,"updateDate":1471838400000,"addToGallery":null,"viewCount":null,"lastViewed":1478098743360,"favorite":"N","levelId":72,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Deal Reg SLA Cases","type":"Webi","owner":"bosew","reportDesc":"","id":64,"reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AUGAgijOettPlk62MiT5deU","functionalArea":"GBS Command Center","functionalAreaLvl1":"Commercial Services","functionalAreaLvl2":"Deal Registration","sourceSystem":"BAAAS BOBJ PRD","sourceReportId":"AUGAgijOettPlk62MiT5deU","additionalInfo":"GBS Command Center/Commercial Services/Deal Registration","systemDescription":"BAAAS BOBJ PRD","createDate":1459770472000,"updateDate":1459957849000,"addToGallery":null,"viewCount":null,"lastViewed":1478595995927,"favorite":"N","levelId":34,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Unresolved Unquoted Oppty","type":"Tableau","owner":"dulons","reportDesc":null,"id":53,"reportLink":"https://baaastableau.corp.emc.com/t/GSMR/views/UnresolvedQuotableOpportunity/WoWSummary","functionalArea":"GSMR","functionalAreaLvl1":"Unresolved Quotable Opportunity","functionalAreaLvl2":"Unresolved Quotable Opportunity","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"158702","additionalInfo":"28498","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1446526800000,"updateDate":1471838400000,"addToGallery":null,"viewCount":null,"lastViewed":1474289509130,"favorite":"N","levelId":41,"refreshStatus":"Y","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"PSS SLA Dashboard","type":"Tableau","owner":"grendm","reportDesc":null,"id":134,"reportLink":"https://baaastableau.corp.emc.com/t/GBS_CC/views/PSSSLADashboard/DeliveryCenterTAT","functionalArea":"GBS_CC","functionalAreaLvl1":"Commercial Services","functionalAreaLvl2":"PSS SLA Dashboard","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"173377","additionalInfo":"31225","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1466654400000,"updateDate":1471492800000,"addToGallery":null,"viewCount":null,"lastViewed":1478157918857,"favorite":"N","levelId":40,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N"}],"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":null,"allReportsForDpt":null,"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null,"sourceReportId":null,"sourceSystem":null,"rowCount":null}'];
    });

    $httpBackend.whenGET(/report\/level\/*/).respond(function (/*method, url, data*/) {
        //return [200, '{"userName":null,"reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":null,"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":null,"allReportsForDpt":[{"id":1,"name":"Main Dashboard","type":"pdf","owner":"ahernp2","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/#/site/GPO_BI/views/InventoryWebsite/MainDashboard","functionalArea":"GPO_BI","functionalAreaLvl1":"Global Inventory Website","functionalAreaLvl2":"Inventory Website","linkTitle":" ","linkHoverInfo":" ","createDate":1424149200000,"updateDate":1424149200000,"favorite":"N","levelId":15},{"id":2,"name":"Issues Timeline","type":"Tableau","owner":"ahernp2","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/site/GPO_BI/views/InventoryControlIssues_0/MainDashboard","functionalArea":"GPO_BI","functionalAreaLvl1":"Global Inventory Website","functionalAreaLvl2":"Inventory Website","linkTitle":" ","linkHoverInfo":" ","createDate":1424149200000,"updateDate":1424149200000,"favorite":"N","levelId":15},{"id":3,"name":"Issues Per Period","type":"eXcel","owner":"ahernp2","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/#/site/GPO_BI/views/InventoryWebsite/IssuesPerPeriod","functionalArea":"GPO_BI","functionalAreaLvl1":"Global Inventory Website","functionalAreaLvl2":"Inventory Website","linkTitle":" ","linkHoverInfo":" ","createDate":1424149200000,"updateDate":1424149200000,"favorite":"N","levelId":15},{"id":4,"name":"Cover","type":"tableau","refreshStatus":"Y","owner":"dexhem","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GPO_BI/views/V3GRDiskinfoAnalysisECPS_0/SSDWritesPerDay","functionalArea":"GPO_BI","functionalAreaLvl1":"GWT Metrics","functionalAreaLvl2":"GWT Metrics","linkTitle":" ","linkHoverInfo":" ","createDate":1425272400000,"updateDate":1425272400000,"favorite":"N","levelId":15}],"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null}'];
        return [200, '{"userName":null,"reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":null,"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":null,"allReportsForDpt":[{"id":74,"name":"New Demand Exec Dashboard","type":"Tableau","owner":"matheb4","reportDesc":"New Demand Exec Dashboard","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/NewDemandExecDashboard","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9677","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null},{"id":75,"name":"Closed Demand Exec Dashboard","type":"Tableau","owner":"matheb4","reportDesc":"Closed Demand Exec Dashboard","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/ClosedDemandExecDashboard","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9678","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null},{"id":76,"name":"Bus Priority","type":"Tableau","owner":"matheb4","reportDesc":"Business Priority","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/BusPriority","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9679","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null},{"id":77,"name":"Service Center Prioritization","type":"Tableau","owner":"matheb4","reportDesc":"Service Center Prioritization","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/ServiceCenterPrioritization","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9680","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null},{"id":74,"name":"New Demand Exec Dashboard","type":"Tableau","owner":"matheb4","reportDesc":"New Demand Exec Dashboard","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/NewDemandExecDashboard","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9677","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null},{"id":75,"name":"Closed Demand Exec Dashboard","type":"Tableau","owner":"matheb4","reportDesc":"Closed Demand Exec Dashboard","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/ClosedDemandExecDashboard","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9678","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null},{"id":76,"name":"Bus Priority","type":"Tableau","owner":"matheb4","reportDesc":"Business Priority","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/BusPriority","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9679","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null},{"id":77,"name":"Service Center Prioritization","type":"Tableau","owner":"matheb4","reportDesc":"Service Center Prioritization","reportLink":"https://entbidashboard.emc.com/t/IT/views/DemandDashboard/ServiceCenterPrioritization","functionalArea":"IT","functionalAreaLvl1":"IT","functionalAreaLvl2":"Demand Dashboard","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9680","additionalInfo":"3104","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1460433600000,"updateDate":1462852800000,"favorite":"N","levelId":113,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null}],"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null,"sourceReportId":null,"sourceSystem":null}'];
//        return [200, '{"userName":null,"reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":null,"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":null,"allReportsForDpt":[],"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null,"sourceReportId":null,"sourceSystem":null,"rowCount":null}'];
    });
    $httpBackend.whenGET(/reportDashboard\/report\/group\/*/).respond(function (/*method, url, data*/) {
//        return [200, '{"userName":null,"reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":null,"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":null,"allReportsForDpt":[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":478,"name":"*Information","type":"Tableau","owner":"broenp","reportDesc":"test sm","reportLink":"https://baaastableau.corp.emc.com/t/CSEMEA_VBOT/views/VBOT106_EASShiftLeadTime/Information","functionalArea":"CSEMEA_VBOT","functionalAreaLvl1":"EMEA Field","functionalAreaLvl2":"VBOT106_EAS Shift LeadTime","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"109433","additionalInfo":"19469","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1472208601640,"updateDate":1479829064243,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"T","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":481,"name":"Division Review","type":"Tableau","owner":"maniva1","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/views/Variety/OilWellManagement","functionalArea":"SO_Analytics","functionalAreaLvl1":"myFI","functionalAreaLvl2":"myFI","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"153819","additionalInfo":"27778","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1472236520347,"updateDate":1472097600000,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":510,"name":"Entitlement Check Status Cover","type":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementCheckStatusCover","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"12770","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1479828523613,"updateDate":1479828523613,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":511,"name":"Entitlement Checks by GEO","type":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementChecksbyGEO","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"12772","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1479829202670,"updateDate":1479829202670,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":482,"name":"expenseExec","type":"Tableau","owner":"kruzem","reportDesc":null,"reportLink":"https://entbitdashboard-dev.emc.com/views/BusinessDashboard/AreaSalesPerformance","functionalArea":"SIP","functionalAreaLvl1":"Travel","functionalAreaLvl2":"te.expense.overview","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9123","additionalInfo":"2855","systemDescription":"Enterprise Taleau Instance-PRD","createDate":1472236550660,"updateDate":1479741883467,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"T","isHeaderFlag":0,"isMobileEnabled":"Y","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":479,"name":"Professional Services - PM Dashboard - Project Data - Production","type":"Webi","owner":"AZAMJ","reportDesc":"","reportLink":"https://SAPBIP-prf.propel.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=ASf6YXJMH7dGlt9PM4JtBJQ","functionalArea":"Professional Services","functionalAreaLvl1":"Global Standard Reports","functionalAreaLvl2":"LightSpeed","linkTitle":"Professional Services - PM Dashboard - Project Data - Production","linkHoverInfo":"Professional Services - PM Dashboard - Project Data - Production","sourceSystem":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","additionalInfo":"Professional Services/Global Standard Reports/LightSpeed","systemDescription":"PROPEL BOBJ PRD","createDate":1472236431747,"updateDate":1456437762000,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"Y","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":270,"name":"Remote CSAT Dashboard","type":"Tableau","owner":"sharmr25","reportDesc":"This is the transactional CSAT dashboard that shows the results for service requests worked by the Remote Reactive","reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB007_E2ECSAT-Remote/RemoteCSATDashboard","functionalArea":"GS_BI","functionalAreaLvl1":"Customer Services","functionalAreaLvl2":"TB007_E2E CSAT - Remote","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"152656","additionalInfo":"27517","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1438574400000,"updateDate":1472236338963,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":490,"name":"SalesQuest QA","type":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Sales Quest QA","reportLink":"https://salesquestqa.corp.emc.com/","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"","linkHoverInfo":"","sourceSystem":"EXTERNAL","sourceReportId":"EXTERNAL143","additionalInfo":"#0000FF","systemDescription":"EXTERNAL_SYSTEM","createDate":1473689398393,"updateDate":1476975298677,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"Y","isHeaderFlag":1,"isMobileEnabled":"Y","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":1,"name":"SAT Performance","type":"Tableau","owner":"Tableau Software","reportDesc":null,"reportLink":"https://entbitdashboard-dev.emc.com/views/Variety/SATPerformance","functionalArea":"Default","functionalAreaLvl1":"Tableau Samples","functionalAreaLvl2":"Variety","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"1","additionalInfo":"1","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1320206400000,"updateDate":1472159796377,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"Y","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":480,"name":"SLA Metrics Raw Data","type":"Webi","owner":"mourat1","reportDesc":"","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaQbsUTFXVFOkXkKFhbAtgM","functionalArea":"CMC Reporting","functionalAreaLvl1":"Custom","functionalAreaLvl2":null,"linkTitle":"SLA Metrics Raw Data","linkHoverInfo":"SLA Metrics Raw Data","sourceSystem":"BAAAS BOBJ PRD","sourceReportId":"AaQbsUTFXVFOkXkKFhbAtgM","additionalInfo":"CMC Reporting/Custom","systemDescription":"BAAAS BOBJ PRD","createDate":1472236482250,"updateDate":1455114384000,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":409,"name":"Tile","type":"Tableau","owner":"dexhem","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GPO_BI/views/ShiptoCommit-Insights/Tile","functionalArea":"GPO_BI","functionalAreaLvl1":"EMC Insights Page","functionalAreaLvl2":"Ship to Commit - Insights","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"177401","additionalInfo":"31886","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1471838400000,"updateDate":1472011200000,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"Y","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":12,"deletedBy":null,"deletedDate":null,"id":487,"name":"Traffic Generation","type":"Tableau","owner":"ipebordt","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/DIGITAL_OPERATIONS/views/MarketingInvestmentsandResults/TrafficGeneration","functionalArea":"DIGITAL_OPERATIONS","functionalAreaLvl1":"METS","functionalAreaLvl2":"Marketing Investments and Results","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"170366","additionalInfo":"30560","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1472714187520,"updateDate":1472097600000,"favorite":"N","levelId":37,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null}],"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null,"sourceReportId":null,"sourceSystem":null,"rowCount":12}'];
        return [200, '{"userName":null,"reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":null,"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":null,"allReportsForDpt":[{"createdBy":null,"createdDate":1472208601640,"updatedBy":null,"updatedDate":1479829064243,"rowCount":12,"deletedBy":null,"deletedDate":null,"userName":null,"name":"*Information","type":"Tableau","owner":"broenp","reportDesc":"test sm","id":478,"reportLink":"https://baaastableau.corp.emc.com/t/CSEMEA_VBOT/views/VBOT106_EASShiftLeadTime/Information","functionalArea":"CSEMEA_VBOT","functionalAreaLvl1":"EMEA Field","functionalAreaLvl2":"VBOT106_EAS Shift LeadTime","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"109433","additionalInfo":"19469","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":19,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"T","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1424926800000,"sysUpdatedDate":1472097600000,"provisionedDate":1479908543760},{"createdBy":null,"createdDate":1472236520347,"updatedBy":null,"updatedDate":1472097600000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Division Review","type":"Tableau","owner":"maniva1","reportDesc":null,"id":481,"reportLink":"https://tabwebsbx01.corp.emc.com/views/Variety/OilWellManagement","functionalArea":"SO_Analytics","functionalAreaLvl1":"myFI","functionalAreaLvl2":"myFI","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"153819","additionalInfo":"27778","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":39,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1440561600000,"sysUpdatedDate":1472097600000,"provisionedDate":1472236525707},{"createdBy":null,"createdDate":1479828523613,"updatedBy":null,"updatedDate":1479828523613,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Entitlement Check Status Cover","type":"Tableau","owner":"mended","reportDesc":null,"id":510,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementCheckStatusCover","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"12770","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":null,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1379563200000,"sysUpdatedDate":1472097600000,"provisionedDate":1479828604647},{"createdBy":null,"createdDate":1479829202670,"updatedBy":null,"updatedDate":1479829202670,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Entitlement Checks by GEO","type":"Tableau","owner":"mended","reportDesc":null,"id":511,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementChecksbyGEO","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"12772","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":null,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1379563200000,"sysUpdatedDate":1472097600000,"provisionedDate":1479829214670},{"createdBy":null,"createdDate":1472236550660,"updatedBy":null,"updatedDate":1479741883467,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"expenseExec","type":"Tableau","owner":"kruzem","reportDesc":null,"id":482,"reportLink":"https://entbitdashboard-dev.emc.com/views/BusinessDashboard/AreaSalesPerformance","functionalArea":"SIP","functionalAreaLvl1":"Travel","functionalAreaLvl2":"te.expense.overview","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9123","additionalInfo":"2855","systemDescription":"Enterprise Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":130,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"T","isHeaderFlag":0,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1438056000000,"sysUpdatedDate":1472097600000,"provisionedDate":1478278092957},{"createdBy":null,"createdDate":1472236431747,"updatedBy":null,"updatedDate":1456437762000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Professional Services - PM Dashboard - Project Data - Production","type":"Webi","owner":"AZAMJ","reportDesc":"","id":479,"reportLink":"https://SAPBIP-prf.propel.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=ASf6YXJMH7dGlt9PM4JtBJQ","functionalArea":"Professional Services","functionalAreaLvl1":"Global Standard Reports","functionalAreaLvl2":"LightSpeed","sourceSystem":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","additionalInfo":"Professional Services/Global Standard Reports/LightSpeed","systemDescription":"PROPEL BOBJ PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":59,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":"Professional Services - PM Dashboard - Project Data - Production","linkHoverInfo":"Professional Services - PM Dashboard - Project Data - Production","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1433525390000,"sysUpdatedDate":1456437762000,"provisionedDate":1472236439093},{"createdBy":null,"createdDate":1438574400000,"updatedBy":null,"updatedDate":1472236338963,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Remote CSAT Dashboard","type":"Tableau","owner":"sharmr25","reportDesc":"This is the transactional CSAT dashboard that shows the results for service requests worked by the Remote Reactive","id":270,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB007_E2ECSAT-Remote/RemoteCSATDashboard","functionalArea":"GS_BI","functionalAreaLvl1":"Customer Services","functionalAreaLvl2":"TB007_E2E CSAT - Remote","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"152656","additionalInfo":"27517","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":23,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1438574400000,"sysUpdatedDate":1472011200000,"provisionedDate":1472236243617},{"createdBy":null,"createdDate":1473689398393,"updatedBy":null,"updatedDate":1476975298677,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"SalesQuest QA","type":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Sales Quest QA","id":490,"reportLink":"https://salesquestqa.corp.emc.com/","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"sourceSystem":"EXTERNAL","sourceReportId":"EXTERNAL143","additionalInfo":"#0000FF","systemDescription":"EXTERNAL_SYSTEM","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":59,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":"","linkHoverInfo":"","displayType":"Y","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1473689363000,"sysUpdatedDate":1474865758000,"provisionedDate":1473689409063},{"createdBy":null,"createdDate":1320206400000,"updatedBy":null,"updatedDate":1472159796377,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"SAT Performance","type":"Tableau","owner":"Tableau Software","reportDesc":null,"id":1,"reportLink":"https://entbitdashboard-dev.emc.com/views/Variety/SATPerformance","functionalArea":"Default","functionalAreaLvl1":"Tableau Samples","functionalAreaLvl2":"Variety","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"1","additionalInfo":"1","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":192,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1320206400000,"sysUpdatedDate":1320206400000,"provisionedDate":1472159696203},{"createdBy":null,"createdDate":1472236482250,"updatedBy":null,"updatedDate":1455114384000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"SLA Metrics Raw Data","type":"Webi","owner":"mourat1","reportDesc":"","id":480,"reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaQbsUTFXVFOkXkKFhbAtgM","functionalArea":"CMC Reporting","functionalAreaLvl1":"Custom","functionalAreaLvl2":null,"sourceSystem":"BAAAS BOBJ PRD","sourceReportId":"AaQbsUTFXVFOkXkKFhbAtgM","additionalInfo":"CMC Reporting/Custom","systemDescription":"BAAAS BOBJ PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":12,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":"SLA Metrics Raw Data","linkHoverInfo":"SLA Metrics Raw Data","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1392344820000,"sysUpdatedDate":1455114384000,"provisionedDate":1472236489423},{"createdBy":null,"createdDate":1471838400000,"updatedBy":null,"updatedDate":1472011200000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Tile","type":"Tableau","owner":"dexhem","reportDesc":null,"id":409,"reportLink":"https://baaastableau.corp.emc.com/t/GPO_BI/views/ShiptoCommit-Insights/Tile","functionalArea":"GPO_BI","functionalAreaLvl1":"EMC Insights Page","functionalAreaLvl2":"Ship to Commit - Insights","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"177401","additionalInfo":"31886","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":20,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N","sysCreatedDate":1471838400000,"sysUpdatedDate":1472011200000,"provisionedDate":1472209497093},{"createdBy":null,"createdDate":1472714187520,"updatedBy":null,"updatedDate":1472097600000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Traffic Generation","type":"Tableau","owner":"ipebordt","reportDesc":null,"id":487,"reportLink":"https://baaastableau.corp.emc.com/t/DIGITAL_OPERATIONS/views/MarketingInvestmentsandResults/TrafficGeneration","functionalArea":"DIGITAL_OPERATIONS","functionalAreaLvl1":"METS","functionalAreaLvl2":"Marketing Investments and Results","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"170366","additionalInfo":"30560","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":5,"lastViewed":null,"favorite":"N","levelId":37,"refreshStatus":"N","recommendedSeq":null,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1463371200000,"sysUpdatedDate":1472097600000,"provisionedDate":1472714196477}],"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null,"sourceReportId":null,"sourceSystem":null,"rowCount":null}'];
    });

    $httpBackend.whenGET(/reportDashboard\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"userName":"moorts5","reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":null,"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":null,"allReportsForDpt":null,"userRoles":null,"message":null,"grpLevelMap":{"3":[{"levelId":78,"levelNumber":3,"levelDesc":"Account Services","parentLevelId":52,"createdBy":null,"createdDate":null,"updatedBy":223,"updatedDate":1475132049520},{"levelId":70,"levelNumber":3,"levelDesc":"Business Operations Specialists","parentLevelId":36,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null},{"levelId":72,"levelNumber":3,"levelDesc":"Deal Registration","parentLevelId":36,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null},{"levelId":73,"levelNumber":3,"levelDesc":"Field Inventory Management","parentLevelId":36,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null}],"2":[{"levelId":52,"levelNumber":2,"levelDesc":"CS Support Services","parentLevelId":45,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null},{"levelId":40,"levelNumber":2,"levelDesc":"Presales","parentLevelId":34,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null},{"levelId":41,"levelNumber":2,"levelDesc":"Recurring Revenue Solutions","parentLevelId":34,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null},{"levelId":36,"levelNumber":2,"levelDesc":"SE&M","parentLevelId":34,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null}],"1":[{"levelId":34,"levelNumber":1,"levelDesc":"Commercial Services","parentLevelId":null,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null},{"levelId":45,"levelNumber":1,"levelDesc":"Customer and Professional Services","parentLevelId":null,"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null}]},"dynamicReports":null,"bigroups":null,"grpLevels":[{"groupId":24,"groupName":"GBS_Commercial Services","numberOfLevels":3,"buGroupName":null}],"grpNLevelMap":{"24":[34,36,40,41,70,72,73,78]},"operationalDashboardPage":"https://bipduruat01.corp.emc.com/admin/#/administration/groups","sourceReportId":null,"sourceSystem":null,"rowCount":null}'];
    });

    $httpBackend.whenGET(/reportSummary\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"userName":"moorts5","reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":[{"createdBy":null,"createdDate":1455549729000,"updatedBy":null,"updatedDate":1455549730000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Backcapture","type":"Webi","owner":"pleaum","reportDesc":"","id":146,"reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa1oa1KYVSNHg9ecfd3z30E","functionalArea":"CMC Reporting","functionalAreaLvl1":"Custom","functionalAreaLvl2":null,"sourceSystem":"BAAAS BOBJ PRD","sourceReportId":"Aa1oa1KYVSNHg9ecfd3z30E","additionalInfo":"CMC Reporting/Custom","systemDescription":"BAAAS BOBJ PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":11,"lastViewed":1477831658610,"favorite":"Y","levelId":25,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1455549729000,"sysUpdatedDate":1455549730000,"provisionedDate":null},{"createdBy":null,"createdDate":1467290450000,"updatedBy":null,"updatedDate":1477831629250,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Google","type":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Google Description","id":145,"reportLink":"https://www.google.com","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"sourceSystem":"EXTERNAL","sourceReportId":"EXTERNAL5","additionalInfo":"#0000ff","systemDescription":"EXTERNAL_SYSTEM","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":5,"lastViewed":1477831640923,"favorite":"Y","levelId":25,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"Y","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1467290450000,"sysUpdatedDate":1467290450000,"provisionedDate":null},{"createdBy":null,"createdDate":1470369600000,"updatedBy":null,"updatedDate":1472011200000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"GBS Collections Analytics","type":"Tableau","owner":"mclelj","reportDesc":null,"id":286,"reportLink":"https://baaastableau.corp.emc.com/t/GBS_CC/views/GBS_Collectionsdemo8-5/GBSCollectionsDashboard","functionalArea":"GBS_CC","functionalAreaLvl1":"GBS Management","functionalAreaLvl2":"GBS_Collections demo 8-5","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"176550","additionalInfo":"31718","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":4,"lastViewed":1474276816790,"favorite":"Y","levelId":188,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N","sysCreatedDate":1470369600000,"sysUpdatedDate":1472011200000,"provisionedDate":1479899283657},{"createdBy":null,"createdDate":1320206400000,"updatedBy":null,"updatedDate":1472159796377,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"SAT Performance","type":"Tableau","owner":"Tableau Software","reportDesc":null,"id":1,"reportLink":"https://entbitdashboard-dev.emc.com/views/Variety/SATPerformance","functionalArea":"Default","functionalAreaLvl1":"Tableau Samples","functionalAreaLvl2":"Variety","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"1","additionalInfo":"1","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":3,"lastViewed":1477831395400,"favorite":"N","levelId":24,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1320206400000,"sysUpdatedDate":1320206400000,"provisionedDate":null}],"recentViewedReports":[{"createdBy":null,"createdDate":1320206400000,"updatedBy":null,"updatedDate":1472159796377,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"SAT Performance","type":"Tableau","owner":"Tableau Software","reportDesc":null,"id":1,"reportLink":"https://entbitdashboard-dev.emc.com/views/Variety/SATPerformance","functionalArea":"Default","functionalAreaLvl1":"Tableau Samples","functionalAreaLvl2":"Variety","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"1","additionalInfo":"1","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":192,"lastViewed":null,"favorite":"N","levelId":12,"refreshStatus":"N","recommendedSeq":1,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1320206400000,"sysUpdatedDate":1320206400000,"provisionedDate":null},{"createdBy":null,"createdDate":1320206400000,"updatedBy":null,"updatedDate":1472159796377,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"SAT Performance","type":"Tableau","owner":"Tableau Software","reportDesc":null,"id":1,"reportLink":"https://entbitdashboard-dev.emc.com/views/Variety/SATPerformance","functionalArea":"Default","functionalAreaLvl1":"Tableau Samples","functionalAreaLvl2":"Variety","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"1","additionalInfo":"1","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":192,"lastViewed":null,"favorite":"N","levelId":12,"refreshStatus":"N","recommendedSeq":2,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1320206400000,"sysUpdatedDate":1320206400000,"provisionedDate":1479205401410},{"createdBy":null,"createdDate":1472714187520,"updatedBy":null,"updatedDate":1472097600000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"Traffic Generation","type":"Tableau","owner":"ipebordt","reportDesc":null,"id":487,"reportLink":"https://baaastableau.corp.emc.com/t/DIGITAL_OPERATIONS/views/MarketingInvestmentsandResults/TrafficGeneration","functionalArea":"DIGITAL_OPERATIONS","functionalAreaLvl1":"METS","functionalAreaLvl2":"Marketing Investments and Results","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"170366","additionalInfo":"30560","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":5,"lastViewed":null,"favorite":"N","levelId":12,"refreshStatus":"N","recommendedSeq":2,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1463371200000,"sysUpdatedDate":1472097600000,"provisionedDate":1478601030833},{"createdBy":null,"createdDate":1478526201057,"updatedBy":null,"updatedDate":1478526287060,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":null,"name":"TB107_Introduction","type":"Tableau","owner":"anbazh","reportDesc":"test sm","id":503,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_Introduction","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"121702","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":3,"lastViewed":null,"favorite":"N","levelId":12,"refreshStatus":"N","recommendedSeq":3,"linkTitle":" ","linkHoverInfo":" ","displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1428465600000,"sysUpdatedDate":1472097600000,"provisionedDate":1478526210727}],"mostpopularReports":null,"galleryReports":null,"favoriteReports":[{"createdBy":null,"createdDate":1455549729000,"updatedBy":null,"updatedDate":1455549730000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Backcapture","type":"Webi","owner":"pleaum","reportDesc":"","id":146,"reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa1oa1KYVSNHg9ecfd3z30E","functionalArea":"CMC Reporting","functionalAreaLvl1":"Custom","functionalAreaLvl2":null,"sourceSystem":"BAAAS BOBJ PRD","sourceReportId":"Aa1oa1KYVSNHg9ecfd3z30E","additionalInfo":"CMC Reporting/Custom","systemDescription":"BAAAS BOBJ PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":26,"lastViewed":1477831658610,"favorite":"Y","levelId":25,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1455549729000,"sysUpdatedDate":1455549730000,"provisionedDate":null},{"createdBy":null,"createdDate":1470369600000,"updatedBy":null,"updatedDate":1472011200000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"GBS Collections Analytics","type":"Tableau","owner":"mclelj","reportDesc":null,"id":286,"reportLink":"https://baaastableau.corp.emc.com/t/GBS_CC/views/GBS_Collectionsdemo8-5/GBSCollectionsDashboard","functionalArea":"GBS_CC","functionalAreaLvl1":"GBS Management","functionalAreaLvl2":"GBS_Collections demo 8-5","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"176550","additionalInfo":"31718","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":19,"lastViewed":1474276816790,"favorite":"Y","levelId":188,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N","sysCreatedDate":1470369600000,"sysUpdatedDate":1472011200000,"provisionedDate":1479899283657},{"createdBy":null,"createdDate":1467290450000,"updatedBy":null,"updatedDate":1477831629250,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Google","type":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Google Description","id":145,"reportLink":"https://www.google.com","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"sourceSystem":"EXTERNAL","sourceReportId":"EXTERNAL5","additionalInfo":"#0000ff","systemDescription":"EXTERNAL_SYSTEM","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":15,"lastViewed":1477831640923,"favorite":"Y","levelId":25,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"Y","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1467290450000,"sysUpdatedDate":1467290450000,"provisionedDate":null}],"allReportsForDpt":null,"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null,"sourceReportId":null,"sourceSystem":null,"rowCount":null}'];
    });

    $httpBackend.whenGET(/report\/id\/Manasa\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"id":8,"name":"Parameter Dashboard","type":"Tableau","owner":"dexhem","reportDesc":"Averagedaysofsupply/ParameterDashboard","reportLink":"https://gsreporting.lss.emc.com/boeftp/documentation/Dashboard-and-Report-Guide.pdf","functionalArea":"Plan","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createDate":null,"updateDate":null,"favorite":"Y"}'];
    });

    $httpBackend.whenGET(/popularSearch/).respond(function (/*method, url, data*/) {
        return [200, '[{"searchString":"Sar","searchCount":29},{"searchString":"Tableau","searchCount":20},{"searchString":"Test","searchCount":17},{"searchString":"Sat","searchCount":13},{"searchString":"Hrs","searchCount":9},{"searchString":"Insight","searchCount":9},{"searchString":"Sample","searchCount":7},{"searchString":"France","searchCount":6},{"searchString":"Performance","searchCount":5},{"searchString":"Tce","searchCount":5},{"searchString":"Report","searchCount":4},{"searchString":"Tableau/insights","searchCount":4},{"searchString":"Tableaus/123","searchCount":3},{"searchString":"Http","searchCount":3},{"searchString":"Tableau%2finsights","searchCount":3},{"searchString":"Onlinelabiv1_test","searchCount":3},{"searchString":"Certtest","searchCount":3},{"searchString":"Enterprise","searchCount":2},{"searchString":"Definitions","searchCount":2},{"searchString":"Pie","searchCount":2},{"searchString":"Slo","searchCount":2},{"searchString":"Tab","searchCount":2},{"searchString":"Task","searchCount":1},{"searchString":"Tableaus123","searchCount":1},{"searchString":"Tableau%2finsight","searchCount":1},{"searchString":"Tableau%252ftableau","searchCount":1},{"searchString":"Tableaus%2f123","searchCount":1},{"searchString":"Tableaus","searchCount":1},{"searchString":"Tableau2f","searchCount":1},{"searchString":"Tableau/insight","searchCount":1},{"searchString":"Tableau/ind","searchCount":1},{"searchString":"Tableau%2ftableau","searchCount":1},{"searchString":"Swf","searchCount":1},{"searchString":"Solve","searchCount":1},{"searchString":"Sate","searchCount":1},{"searchString":"Sasd","searchCount":1},{"searchString":"Sales","searchCount":1},{"searchString":"Sa","searchCount":1},{"searchString":"Rtes","searchCount":1},{"searchString":"Rights","searchCount":1},{"searchString":"Pdf","searchCount":1},{"searchString":"Object","searchCount":1},{"searchString":"Myplay","searchCount":1},{"searchString":"Modifications","searchCount":1},{"searchString":"Insi","searchCount":1},{"searchString":"Gra","searchCount":1},{"searchString":"Force","searchCount":1},{"searchString":"Dashboard","searchCount":1},{"searchString":"By","searchCount":1},{"searchString":"Awsd","searchCount":1}]'];
    });

    $httpBackend.whenGET(/communication\/*/).respond(function (/*method, url, data*/) {
//        return [200, '[{"communicationId":0,"groupId":2,"link":"https://bipdurdev01.corp.emc.com/","title":"Welcome to Insights","details":"Click for more info","image":"file:///D:/Project/BI_Portal/banners/banner1.png","groupIdList":null},{"communicationId":0,"groupId":2,"link":"https://inside.emc.com/groups/sap-business-objects-forum","title":"BOBJ User forum","details":"Click for more info","image":"file:///D:/Project/BI_Portal/banners/banner2.png","groupIdList":null},{"communicationId":0,"groupId":2,"link":"https://inside.emc.com/community/active/tableau_users_forum","title":"Tableau User Forum","details":"Click for more info","image":"file:///D:/Project/BI_Portal/banners/banner3.png","groupIdList":null}]'];
        return [200, '[{"communicationId":0,"groupId":2,"link":"https://bipdurdev01.corp.emc.com/","title":"Welcome to Insights","details":"","image":"file:///D:/Project/BI_Portal/banners/banner1.png","groupIdList":null}]'];
    });

    $httpBackend.whenGET(/getNews\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"id":14,"description":"Insights Portal Scheduled Maintenance for Oct16 release - Friday Oct 21st 2016 12:00 AM - 12:00 PM EST","title":"Insights Portal Scheduled Maintenance for Oct 16 release - Friday Oct 21st 2016 12:00 AM - 12:00 PM EST","url":"https://insights.corp.emc.com/doc/Insights Portal - Oct 2016 Release Notice.pdf","createdBy":null,"createdDate":"Sep 02, 2016 11:48:57 AM","updatedBy":null,"updatedDate":null,"rowCount":null},{"id":13,"description":"Walk through of New Features and Enhancements","title":"What is New - Insights ( August  release)","url":"https://insights.corp.emc.com/doc/Insights%20Portal%20-%20August%202016%20Release.pdf","createdBy":null,"createdDate":"Sep 02, 2016 06:33:23 AM","updatedBy":null,"updatedDate":null,"rowCount":null},{"id":11,"description":"Update on Tableau Desktop Maintenance","title":"Update on Tableau Desktop Maintenance","url":"https://inside.emc.com/docs/DOC-223190","createdBy":null,"createdDate":"Aug 31, 2016 13:47:57 PM","updatedBy":null,"updatedDate":null,"rowCount":null},{"id":6,"description":"BOBJ 4.2 SP2 Upgrade","title":"BOBJ 4.2 SP2 Upgrade","url":"https://inside.emc.com/groups/sap-business-objects-forum","createdBy":null,"createdDate":"Jan 25, 2016 11:03:27 AM","updatedBy":null,"updatedDate":null,"rowCount":null},{"id":1,"description":"Tableau Upgrade to 9.2.x - Schedule/Next Steps","title":"Tableau Upgrade to 9.2.x","url":"https://inside.emc.com/community/active/itatemc/blog/2016/02/24/tableau-upgrade-to-92x-schedulenext-steps","createdBy":null,"createdDate":"Nov 16, 2015 10:58:24 AM","updatedBy":null,"updatedDate":null,"rowCount":null}]'];
    });

    $httpBackend.whenGET(/favoriteReports\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"userName":null,"reportId":null,"deaprtment":null,"reportName":null,"reportData":null,"mostViewedReports":null,"recentViewedReports":null,"mostpopularReports":null,"galleryReports":null,"favoriteReports":[{"createdBy":null,"createdDate":1455549729000,"updatedBy":null,"updatedDate":1455549730000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Backcapture","type":"Webi","owner":"pleaum","reportDesc":"","id":146,"reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa1oa1KYVSNHg9ecfd3z30E","functionalArea":"CMC Reporting","functionalAreaLvl1":"Custom","functionalAreaLvl2":null,"sourceSystem":"BAAAS BOBJ PRD","sourceReportId":"Aa1oa1KYVSNHg9ecfd3z30E","additionalInfo":"CMC Reporting/Custom","systemDescription":"BAAAS BOBJ PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":26,"lastViewed":1477831658610,"favorite":"Y","levelId":25,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"N","sysCreatedDate":1455549729000,"sysUpdatedDate":1455549730000,"provisionedDate":null},{"createdBy":null,"createdDate":1470369600000,"updatedBy":null,"updatedDate":1472011200000,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"GBS Collections Analytics","type":"Tableau","owner":"mclelj","reportDesc":null,"id":286,"reportLink":"https://baaastableau.corp.emc.com/t/GBS_CC/views/GBS_Collectionsdemo8-5/GBSCollectionsDashboard","functionalArea":"GBS_CC","functionalAreaLvl1":"GBS Management","functionalAreaLvl2":"GBS_Collections demo 8-5","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"176550","additionalInfo":"31718","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":19,"lastViewed":1474276816790,"favorite":"Y","levelId":188,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"B","isHeaderFlag":1,"tabbedViews":"Y","isMobileEnabled":"N","sysCreatedDate":1470369600000,"sysUpdatedDate":1472011200000,"provisionedDate":1479899283657},{"createdBy":null,"createdDate":1467290450000,"updatedBy":null,"updatedDate":1477831629250,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","name":"Google","type":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Google Description","id":145,"reportLink":"https://www.google.com","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"sourceSystem":"EXTERNAL","sourceReportId":"EXTERNAL5","additionalInfo":"#0000ff","systemDescription":"EXTERNAL_SYSTEM","createDate":null,"updateDate":null,"addToGallery":null,"viewCount":15,"lastViewed":1477831640923,"favorite":"Y","levelId":25,"refreshStatus":"N","recommendedSeq":null,"linkTitle":null,"linkHoverInfo":null,"displayType":"Y","isHeaderFlag":1,"tabbedViews":"N","isMobileEnabled":"Y","sysCreatedDate":1467290450000,"sysUpdatedDate":1467290450000,"provisionedDate":null}],"allReportsForDpt":null,"userRoles":null,"message":null,"grpLevelMap":null,"dynamicReports":null,"bigroups":null,"grpLevels":null,"grpNLevelMap":null,"operationalDashboardPage":null,"sourceReportId":null,"sourceSystem":null,"rowCount":null}'];
    });

    $httpBackend.whenGET(/userSearch\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"sourceReportId":"AaUb.VZHY9ZOqX_glPEbFwY","reportName":"World Sales Report","reportType":"CrystalReport","owner":"Administrator","reportDesc":"Top 5 Countries Sales with pie chart. Drill down on Country of interest to view Countrys Top 5 Regional Sales with pie chart. Drill down on Region of interest to view Regions City Sales with pie chart. Drill down on City of interest to view Citys Com","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaUb.VZHY9ZOqX_glPEbFwY","functionalArea":"Miscellaneous","functionalAreaLvl1":"Report Samples","functionalAreaLvl2":"Demonstration","linkTitle":"World Sales Report","linkHoverInfo":"World Sales Report","createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ PRD","additionalInfo":"Miscellaneous/Report Samples/Demonstration","systemDescription":"BAAAS BOBJ PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1316759319000,"sysUpdatedDate":1316759319000},{"sourceReportId":"Af0Gk9c5IsZDg6B9H_2Ak5U","reportName":"Sales  Curriculum Accreditation","reportType":"Webi","owner":"Administrator","reportDesc":"","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Af0Gk9c5IsZDg6B9H_2Ak5U","functionalArea":"Miscellaneous","functionalAreaLvl1":"DEMO","functionalAreaLvl2":null,"linkTitle":"Sales  Curriculum Accreditation","linkHoverInfo":"Sales  Curriculum Accreditation","createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ PRD","additionalInfo":"Miscellaneous/DEMO","systemDescription":"BAAAS BOBJ PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1366551235000,"sysUpdatedDate":1366551238000},{"sourceReportId":"AS2qASz6wI5AkCdsv0ZkgK8","reportName":"Curriculum Accreditation History","reportType":"Webi","owner":"ruchl","reportDesc":"This report was developed to manage and track the historical quarterly required Sales training for a specific set of Sales executives and their employees.  This report will display the % of each completed Curriculum learning path by Theater, Division and","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AS2qASz6wI5AkCdsv0ZkgK8","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Curriculum","functionalAreaLvl2":"Ed Services Rpt","linkTitle":"Curriculum Accreditation History","linkHoverInfo":"Curriculum Accreditation History","createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ PRD","additionalInfo":"Education Services and Dev/Curriculum/Ed Services Rpt","systemDescription":"BAAAS BOBJ PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1391634378000,"sysUpdatedDate":1458127261000},{"sourceReportId":"ASwq5lfHztRNo1HRZ4R9xHs","reportName":"Curriculum Accreditation","reportType":"Webi","owner":"ruchl","reportDesc":"This report was developed to manage and track the quarterly required Sales training for a specific set of Sales executives and their employees.  This report will display the % of each completed Curriculum learning path by Theater, Division and employee. ","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=ASwq5lfHztRNo1HRZ4R9xHs","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Curriculum","functionalAreaLvl2":"Ed Services Rpt","linkTitle":"Curriculum Accreditation","linkHoverInfo":"Curriculum Accreditation","createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ PRD","additionalInfo":"Education Services and Dev/Curriculum/Ed Services Rpt","systemDescription":"BAAAS BOBJ PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1458070814000,"sysUpdatedDate":1458126728000},{"sourceReportId":"AT_0VVbcRZVMtvrhbrutWZk","reportName":"Partner_Accreditation_Weekly_Report","reportType":"Webi","owner":"ROSSIE1","reportDesc":"This report include pivot reports for Sales and SE Accreditation and detail reports for Sales, SE and Affiliate.  2 years of data included","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AT_0VVbcRZVMtvrhbrutWZk","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Certification","functionalAreaLvl2":"Accreditations","linkTitle":"Partner_Accreditation_Weekly_Report","linkHoverInfo":"Partner_Accreditation_Weekly_Report","createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ PRD","additionalInfo":"Education Services and Dev/Certification/Accreditations","systemDescription":"BAAAS BOBJ PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1409161820000,"sysUpdatedDate":1420820056000},{"sourceReportId":"AUipev2Bc2VOvlfYftyP40c","reportName":"Accreditation_Weekly_Report_gold","reportType":"Webi","owner":"ROSSIE1","reportDesc":"This report include pivot reports for Sales and SE Accreditation and detail reports for Sales, SE and Affiliate.  2 years of data included","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AUipev2Bc2VOvlfYftyP40c","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Certification","functionalAreaLvl2":"Accreditations","linkTitle":"Accreditation_Weekly_Report_gold","linkHoverInfo":"Accreditation_Weekly_Report_gold","createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ PRD","additionalInfo":"Education Services and Dev/Certification/Accreditations","systemDescription":"BAAAS BOBJ PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1391181935000,"sysUpdatedDate":1420820056000},{"sourceReportId":"AWwrw9IoPBpPjCn5IL2GAms","reportName":"Curriculum New Hires Sales","reportType":"Webi","owner":"ruchl","reportDesc":"Open Class Report by Sunitha Anand","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AWwrw9IoPBpPjCn5IL2GAms","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Curriculum","functionalAreaLvl2":"Ed Services Rpt","linkTitle":"Curriculum New Hires Sales","linkHoverInfo":"Curriculum New Hires Sales","createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ PRD","additionalInfo":"Education Services and Dev/Curriculum/Ed Services Rpt","systemDescription":"BAAAS BOBJ PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1418218383000,"sysUpdatedDate":1420820056000},{"sourceReportId":"104665","reportName":"SALES DETAILS - COPS","reportType":"Tableau","owner":"marulj","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIP/views/ASDProductLinePLs/SALESDETAILS-COPS","functionalArea":"IIP","functionalAreaLvl1":"IIP Finance Dashboards","functionalAreaLvl2":"ASD Product Line P&Ls","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"18568","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1423112400000,"sysUpdatedDate":1455166800000},{"sourceReportId":"104823","reportName":"SALES DETAILS - COPS","reportType":"Tableau","owner":"marulj","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIP/views/RSAProductLinePLs/SALESDETAILS-COPS","functionalArea":"IIP","functionalAreaLvl1":"IIP Finance Dashboards","functionalAreaLvl2":"RSA Product Line P&Ls","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"18583","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1423112400000,"sysUpdatedDate":1455166800000},{"sourceReportId":"105390","reportName":"SALES DETAILS - COPS","reportType":"Tableau","owner":"marulj","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIP/views/ISILONProductLinePLs/SALESDETAILS-COPS","functionalArea":"IIP","functionalAreaLvl1":"IIP Finance Dashboards","functionalAreaLvl2":"ISILON Product Line P&Ls","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"18683","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1423371600000,"sysUpdatedDate":1455166800000},{"sourceReportId":"111641","reportName":"Sales Rep Version of Flash","reportType":"Tableau","owner":"vardhp","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/APJ_CSD_Commissions_Report_TBL025/SalesRepVersionofFlash","functionalArea":"GS_BI","functionalAreaLvl1":"Professional Services","functionalAreaLvl2":"APJ_CSD_Commissions_Report.TBL025","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"19972","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1425873600000,"sysUpdatedDate":1455512400000},{"sourceReportId":"115986","reportName":"Sales TA","reportType":"Tableau","owner":"herrim","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/Marketing/views/EHCQ115/SalesTA","functionalArea":"Marketing","functionalAreaLvl1":"default","functionalAreaLvl2":"EHC Q1 15","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"20916","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1427256000000,"sysUpdatedDate":1427256000000},{"sourceReportId":"141682","reportName":"Sales","reportType":"Tableau","owner":"ipebordt","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/DIGITAL_OPERATIONS/views/ProductPerformanceReportingTest/Sales","functionalArea":"DIGITAL_OPERATIONS","functionalAreaLvl1":"Store - Test","functionalAreaLvl2":"Product Performance Reporting (Test)","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"25545","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1435291200000,"sysUpdatedDate":1470024000000},{"sourceReportId":"143914","reportName":"ISR Metrics","reportType":"Tableau","owner":"weic5","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/Inside_Sales/views/APJISMetricsDashboard/ISRMetrics","functionalArea":"Inside_Sales","functionalAreaLvl1":"APJ Inside Sales","functionalAreaLvl2":"APJ IS Metrics Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"25809","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1435896000000,"sysUpdatedDate":1472011200000},{"sourceReportId":"143918","reportName":"Demand Gen","reportType":"Tableau","owner":"weic5","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/Inside_Sales/views/APJISDemand-GenDashboard/DemandGen","functionalArea":"Inside_Sales","functionalAreaLvl1":"APJ Inside Sales","functionalAreaLvl2":"APJ IS Demand-Gen Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"25812","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1435896000000,"sysUpdatedDate":1472011200000},{"sourceReportId":"14515","reportName":"Sales Lane","reportType":"Tableau","owner":"abukat","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GCM/views/ShippingLanes_v2/SalesLane","functionalArea":"GCM","functionalAreaLvl1":"Global Channel Operations","functionalAreaLvl2":"Shipping Lanes_v2","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"2361","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1381723200000,"sysUpdatedDate":1452142800000},{"sourceReportId":"145361","reportName":"Sheet 1","reportType":"Tableau","owner":"Coblem","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/DPAD_CI_Reporting/views/SoftwarevsHardwaresales/Sheet1","functionalArea":"DPAD_CI_Reporting","functionalAreaLvl1":"Dashboards for Sales","functionalAreaLvl2":"Software vs Hardware sales","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"26029","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1436328000000,"sysUpdatedDate":1436328000000},{"sourceReportId":"146365","reportName":"Customer Detail","reportType":"Tableau","owner":"dexhem","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GPO_BI/views/WWSalesOrderLeadTimebyOEMCustomer_0/CustomerDetail","functionalArea":"GPO_BI","functionalAreaLvl1":"Deliver","functionalAreaLvl2":"WW Sales Order Lead Time by OEM Customer","linkTitle":" ","linkHoverInfo":" ","createdDate":1475126940847,"updatedDate":1478526326340,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"26237","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":7,"id":499,"refreshStatus":"N","tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","sysCreatedDate":1436500800000,"sysUpdatedDate":1472097600000},{"sourceReportId":"146404","reportName":"Sales","reportType":"Tableau","owner":"ipebordt","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/DIGITAL_OPERATIONS/views/ProductPerformanceReporting/Sales","functionalArea":"DIGITAL_OPERATIONS","functionalAreaLvl1":"Store","functionalAreaLvl2":"Product Performance Reporting","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"26243","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1436500800000,"sysUpdatedDate":1472011200000},{"sourceReportId":"146561","reportName":"SA Internal Stats","reportType":"Tableau","owner":"abukat","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GCM/views/SalesAssistanceDashboard/SAInternalStats","functionalArea":"GCM","functionalAreaLvl1":"Global Channel Operations","functionalAreaLvl2":"Sales Assistance Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"26265","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":null,"updatedDateInDate":null,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":null,"isMobileEnabled":null,"sysCreatedDate":1436760000000,"sysUpdatedDate":1447736400000}]'];
    });
    
    $httpBackend.whenGET(/addSearch\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"status":"Success","message":"The search was added successfully."}'];
    });

    $httpBackend.whenGET(/searchReports\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"createdBy":null,"createdDate":1472236520347,"updatedBy":null,"updatedDate":1481123297987,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":481,"name":"Division Review","type":"Tableau","owner":"maniva1","reportDesc":"Here you mr Description","reportLink":"https://tabwebsbx01.corp.emc.com/views/Variety/OilWellManagement","functionalArea":"SO_Analytics","functionalAreaLvl1":"myFI","functionalAreaLvl2":"myFI","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"BAaaS Tableau-PRD","sourceReportId":"153819","additionalInfo":"27778","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"favorite":"N","levelId":null,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"N","groupName":null,"sysCreatedDate":1440561600000,"sysUpdatedDate":1472097600000,"provisionedDate":1472236525707,"viewCount":45},{"createdBy":null,"createdDate":1472236550660,"updatedBy":null,"updatedDate":1479741883467,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":482,"name":"expenseExec","type":"Tableau","owner":"kruzem","reportDesc":null,"reportLink":"https://entbitdashboard-dev.emc.com/views/BusinessDashboard/AreaSalesPerformance","functionalArea":"SIP","functionalAreaLvl1":"Travel","functionalAreaLvl2":"te.expense.overview","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9123","additionalInfo":"2855","systemDescription":"Enterprise Taleau Instance-PRD","createDate":null,"updateDate":null,"favorite":"N","levelId":null,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"T","isHeaderFlag":0,"isMobileEnabled":"Y","groupName":null,"sysCreatedDate":1438056000000,"sysUpdatedDate":1472097600000,"provisionedDate":1478278092957,"viewCount":130},{"createdBy":null,"createdDate":1473689398393,"updatedBy":null,"updatedDate":1476975298677,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":490,"name":"SalesQuest QA","type":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Sales Quest QA","reportLink":"https://salesquestqa.corp.emc.com/","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"","linkHoverInfo":"","sourceSystem":"EXTERNAL","sourceReportId":"EXTERNAL143","additionalInfo":"#0000FF","systemDescription":"EXTERNAL_SYSTEM","createDate":null,"updateDate":null,"favorite":"N","levelId":null,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"Y","isHeaderFlag":1,"isMobileEnabled":"Y","groupName":null,"sysCreatedDate":1473689363000,"sysUpdatedDate":1474865758000,"provisionedDate":1473689409063,"viewCount":59},{"createdBy":null,"createdDate":1320206400000,"updatedBy":null,"updatedDate":1472159796377,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":1,"name":"SAT Performance","type":"Tableau","owner":"Tableau Software","reportDesc":null,"reportLink":"https://entbitdashboard-dev.emc.com/views/Variety/SATPerformance","functionalArea":"Default","functionalAreaLvl1":"Tableau Samples","functionalAreaLvl2":"Variety","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"1","additionalInfo":"1","systemDescription":"BAaaS Taleau Instance-PRD","createDate":null,"updateDate":null,"favorite":"N","levelId":null,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":"Y","groupName":null,"sysCreatedDate":1320206400000,"sysUpdatedDate":1320206400000,"provisionedDate":1472159696203,"viewCount":193},{"createdBy":null,"createdDate":1472236550660,"updatedBy":null,"updatedDate":1479741883467,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":482,"name":"expenseExec","type":"Tableau","owner":"kruzem","reportDesc":null,"reportLink":"https://entbitdashboard-dev.emc.com/views/BusinessDashboard/AreaSalesPerformance","functionalArea":"SIP","functionalAreaLvl1":"Travel","functionalAreaLvl2":"te.expense.overview","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"9123","additionalInfo":"2855","systemDescription":"Enterprise Taleau Instance-PRD","createDate":null,"updateDate":null,"favorite":"N","levelId":null,"reportAccessStatus":null,"refreshStatus":"N","tabbedViews":null,"recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"T","isHeaderFlag":0,"isMobileEnabled":"Y","groupName":null,"sysCreatedDate":1438056000000,"sysUpdatedDate":1472097600000,"provisionedDate":1478278092957,"viewCount":130}]'];
    });

    $httpBackend.whenGET(/reportFeedbacks\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"reportId":8,"feedbackId":null,"userId":null,"feedback":"Important Report","feedbackDate":1447398351619,"userName":"Manasa"},{"reportId":8,"feedbackId":null,"userId":null,"feedback":"very valuable content","feedbackDate":1446614723726,"userName":"Manasa"},{"reportId":8,"feedbackId":null,"userId":null,"feedback":"valuable content","feedbackDate":1446614189428,"userName":"Manasa"},{"reportId":8,"feedbackId":null,"userId":null,"feedback":"Hello","feedbackDate":1446580857839,"userName":"Manasa"}]'];
    });

    $httpBackend.whenGET(/reportAccess\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"requestId":null,"sourceSystem":"BAaaS Tableau-SBX","line2":"ART","line3":"Tableau Reporting","line4":"BIaaS(Business Intelligence As a Service)","line5":"CSEMEA_VBOT","line6":null}'];
    });

    $httpBackend.whenGET(/getTrustedTicket\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"response":"KbNDNBzQkRNj9Bc0I_DgeVlw"}'];
    });

    $httpBackend.whenGET(/report\/id\/*/).respond(function (/*method, url, data*/) {
//        return [200, '{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":1,"name":"SAT Performance","type":"Tableau","owner":"Tableau Software","reportDesc":null,"reportLink":"https://entbitdashboard-dev.emc.com/views/Variety/SATPerformance","functionalArea":"Default","functionalAreaLvl1":"Tableau Samples","functionalAreaLvl2":"Variety","linkTitle":" ","linkHoverInfo":" ","sourceSystem":"Enterprise Tableau-PRD","sourceReportId":"1","additionalInfo":"1","systemDescription":"BAaaS Taleau Instance-PRD","createDate":1320206400000,"updateDate":1320206400000,"favorite":"N","levelId":24,"reportAccessStatus":"False","refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":null}'];
//        return [200, '{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":145,"name":"Google","type":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Google Description","reportLink":"http://www.google.com","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":"EXTERNAL","sourceReportId":"EXTERNAL5","additionalInfo":"#0000ff","systemDescription":"EXTERNAL_SYSTEM","createDate":1467290450000,"updateDate":1467290450000,"favorite":"N","levelId":25,"reportAccessStatus":"True","refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"Y","isHeaderFlag":1,"isMobileEnabled":null}'];
        return [200, '{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"id":146,"name":"Backcapture","type":"Webi","owner":"pleaum","reportDesc":"","reportLink":"https://entbobj.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa1oa1KYVSNHg9ecfd3z30E","functionalArea":"CMC Reporting","functionalAreaLvl1":"Custom","functionalAreaLvl2":null,"linkTitle":"Backcapture","linkHoverInfo":"Backcapture","sourceSystem":"BAAAS BOBJ PRD","sourceReportId":"Aa1oa1KYVSNHg9ecfd3z30E","additionalInfo":"CMC Reporting/Custom","systemDescription":"BAAAS BOBJ PRD","createDate":1455549729000,"updateDate":1455549730000,"favorite":"N","levelId":25,"reportAccessStatus":"True","refreshStatus":"N","tabbedViews":"N","recommended":null,"groupId":null,"recommendedSeq":null,"displayType":"B","isHeaderFlag":1,"isMobileEnabled":null}'];
    });
    
    $httpBackend.whenGET(/home\/getUserPersonalization\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"userId":3034,"recommended":3,"favorite":1,"mostViewed":2,"userTheme":0,"isListViewed":2,"isRecommendedCollapsed":0,"isFavoriteCollapsed":0,"isMostViewedCollapsed":0,"isMenuCollapsed":0}'];
    });
    
    $httpBackend.whenGET(/home\/getBreadCrumbsDetails\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"levelId":14,"levelNumber":1,"levelDesc":"Sales","parentLevelId":0},{"levelId":15,"levelNumber":2,"levelDesc":"Bookings","parentLevelId":14}]'];
    });
    
    $httpBackend.whenGET(/home\/getAutoSuggestionList\/*/).respond(function (/*method, url, data*/) {
        return [200, '["Americas Insight Truncate large text auto suggestions based on the allocated width. Still pending I have fixed (SA DVP PDF) - IP Report thru 08 24 15","Americas Insight Truncate large text auto suggestions based on the allocated width. Still pending I have fixed (SA DVP PDF) 1.1 : Justin 3/16/16","Americas Insight Truncate large text auto suggestions based on the allocated width. Still pending I have fixed (SA DVP PDF)_LATAM","Business Insights","Context: Key Player/Industry Insights/Findings","EMEA Insight Dashboard Analysis[1]","EMEA Insight Detailed_Bookings_Forecast","EMEA MidMarket Insight Detailed_Bookings_Forecast (PS)","Historical Insights.","Insight","SA EMEA Insight Dashboard Analysis","SA EMEA Insight Dashboard Analysis (Region)","SAMPLE - BusinessInsightiPhone","SAMPLE - BusinessInsightiPhone SAP Version","TCE Account Insight","TEST - AppID Correlation with IT Insight"]'];
    }); 
    
    $httpBackend.whenGET(/home\/getBIReportMetadata\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Estimate to Complete(ETC) Cost Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing Comments]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Contract Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Backlog Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Accountant]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"LightSpeed - ID Nodes.XLS","workSheetName":"Excel - PlanNodes","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"LightSpeed - ID Nodes.XLS","workSheetName":"Excel - PlanNodes","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[WBS Element Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[NodeID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"LightSpeed - ID Nodes.XLS","workSheetName":"Excel - PlanNodes","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Booked Amount Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Booked Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Billing Block]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Billing Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Deal Currency]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Profit Center]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Project Manager]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS User Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Install at Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Amount ITD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing Comments]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Calendar Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[CPM Comments Last Update Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Actual Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Backlog Amount Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Booked Cost Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Complete To Date Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Contract Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Booked Cost Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Cost Forecast Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Cost Forecast Amount Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Project Manager]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Forecast Revenue Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Backlog Amount Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Backlog Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Cost Forecast Amount Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Forecast Revenue Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Forecast Revenue Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Project Hours]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Unbilled Revenue Amount Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Unbilled Revenue Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Bill to Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing Comments]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[CPM Comments Last Update Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Invoice Amount ITD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Project Hours]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Actual Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Complete To Date Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Deal Currency]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Planned Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Last Cost Posted]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Cost Forecast Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Planned Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Accountant]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Role Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[CPM Comments Last Update Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Actual Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Accountant]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Finish Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Quote Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[MP Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Contract Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Creation Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Contract Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[MP Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[WBS Element Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Accountant]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Profit Center]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Project Manager]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS User Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Install at Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[MP Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[P.O Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[P.O. Line Unit Quantity]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Complete To Date Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Creation Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Creation Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[WBS Element Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Actual Cost ITD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Actual Cost ITD Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Actual Cost QTD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Actual Cost QTD Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Adjustment Amount QTD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Amount ITD Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Amount ITD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Amount QTD Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Amount QTD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Amount QTD Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Backlog Amount Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Forecast Revenue Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Total Project Hours]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Unbilled Revenue Amount Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Unbilled Revenue Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Contact - Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Contact - First Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Contact - Last Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Contact - Phone]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Contact - PreSales Contact Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Contact - Salutation]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[WBS Element Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Install at Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Budget & Staffing Comments]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[CPM Comments Last Update Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Actual Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Accountant]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Finish Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Pre-Packaged Forecast Quantity]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Finish Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Schedule and Quality Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[WBS Element Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Actual Cost ITD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Actual Cost ITD Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Estimate to Complete(ETC) Cost Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Estimate to Complete(ETC) Cost Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Estimate to Complete(ETC) Hours]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Funding Amount Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Funding Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Hours To Go]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan Hours]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Amount ITD Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Finish Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Planned Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Deal Currency]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Delivery Organization]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Planned Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Contract Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Profit Center]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Role End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Project Manager]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS User Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Install at Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Contract Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Division]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org GEO]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Region]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Theater]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Quarter Forecast Revenue Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Profit Center]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Project Manager]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Planned Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Sales Order Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Sales Order Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Estimate to Complete(ETC) Cost Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Estimate to Complete(ETC) Hours]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Funding Amount Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Funding Amount Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Funding Amount Rev Rate]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Hours To Go]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan Hours]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Pre-Packaged Forecast Quantity]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Survey Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Complete To Date Units]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Role Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Adjustment Amount ITD Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Adjustment Amount ITD Local]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Revenue Adjustment Amount QTD Global]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Full Finance Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Project Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS User Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[ASQ Survey Action Code]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"ASQ Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[MP Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Accountant]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Creation Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Owning Org ID]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[WBS Element Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"PO Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Project Manager Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Business Segment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Element Type]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current PS Org Country_reg]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Invoice Data","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Profit Center]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS Project Manager]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[WBS Element Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Invoice Forecast Amount Doc]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[GDW Database Last Refresh Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Report Info","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Proj Delivery Owner Email]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS System Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS TECO Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current WBS User Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Install at Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Master Project Start Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[MP Customer Name]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Plan & Execute Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Creation Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Purchase Order Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Quote and SO","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Next Invoice Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Project Number]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Billing Plan","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Accountant]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Current Project Financial Plan End Date]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"sourceSystem":"PROPEL BOBJ PRD","systemDesc":"PROPEL BOBJ PRD","sourceReportId":"Aa.49YHKKkNBuh0kJvrfCbI","reportName":"Professional Services - PM Dashboard - Project Data - Production","reportDesc":null,"reportColumnName":"[Overall Status Comment]","fieldType":"Database Field","tableNameSql":null,"sourceColumnName":null,"calculationFormula":null,"connectionUniverse":"Professional Services.unx","workSheetName":"Current Quarter","reportType":null,"dataType":null,"workbookName":null,"workbookId":null}]'];
    });
    
    $httpBackend.whenGET(/activateDefaultPersona\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"status":"Success","message":"The persona is activated as default successfully.","id":null}'];
    });
    
    $httpBackend.whenGET(/getNotificationByUser\/*/).respond(function (/*method, url, data*/) {
//        return [200, '{"userNewAlertList":[],"userNotificationList":[],"newNotificationCount":0}'];
//        return [200, '{"userNewAlertList":[{"notificationId":10,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An11","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","moreInfoUrl":"http://jsoneditoronline.org/","notificationType":"A","readDate":null,"biCreatedDate":1478868509117,"assignId":171},{"notificationId":3,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An12","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"A","readDate":null,"biCreatedDate":1478885045000,"assignId":39}],"userNotificationList":[{"notificationId":13,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An13","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","moreInfoUrl":"http://jsoneditoronline.org/","notificationType":"M","readDate":null,"biCreatedDate":1479105175360,"assignId":201},{"notificationId":12,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An14","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"M","readDate":null,"biCreatedDate":1479105160343,"assignId":191},{"notificationId":11,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An15","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"M","readDate":null,"biCreatedDate":1479105137123,"assignId":181},{"notificationId":10,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An16","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"A","readDate":null,"biCreatedDate":1478868509117,"assignId":171},{"notificationId":9,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An17","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"M","readDate":null,"biCreatedDate":1478864147700,"assignId":161},{"notificationId":8,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An18","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","moreInfoUrl":"http://jsoneditoronline.org/","notificationType":"M","readDate":null,"biCreatedDate":1478898316143,"assignId":151},{"notificationId":7,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An19","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"M","readDate":null,"biCreatedDate":1478897898913,"assignId":141},{"notificationId":6,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An10","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"M","readDate":null,"biCreatedDate":1478897872863,"assignId":131},{"notificationId":4,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An11","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","moreInfoUrl":"http://jsoneditoronline.org/","notificationType":"M","readDate":null,"biCreatedDate":1478885556693,"assignId":121},{"notificationId":3,"header":"GBS_Analytics test 7 GBS_Analytics test 7GBS_An12","messageBody":"Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text Lorem Ipsum is simply dummy text","notificationType":"A","readDate":null,"biCreatedDate":1478885045000,"assignId":39}],"newNotificationCount":10}'];
        return [200, '{"userNewAlertList":[{"notificationId":4,"header":"Dismiss Alert Test","messageBody":"Alert Body","notificationType":"A","readDate":null,"biCreatedDate":1481874254160,"assignId":127,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"}],"userNotificationList":[{"notificationId":5,"header":"Admin Mobile Notification","messageBody":"Admin Mobile Notification Message Body","notificationType":"M","readDate":null,"biCreatedDate":1481881530940,"assignId":120,"moreInfoUrl":"http://google.com","owner":"Sarunkumar Moorthy"},{"notificationId":4,"header":"Dismiss Alert Test","messageBody":"Alert Body","notificationType":"A","readDate":null,"biCreatedDate":1481874254160,"assignId":127,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"},{"notificationId":2,"header":"Test Notifn","messageBody":"SM message","notificationType":"M","readDate":null,"biCreatedDate":1481874079190,"assignId":15,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"}],"newNotificationCount":3}'];
//        return [200, '{"userNewAlertList":[], "userNotificationList":[{"notificationId":13,"header":"Admin Test","messageBody":"Lorem Ipsum is simply dummy text..","moreInfoUrl":"http://jsoneditoronline.org/","notificationType":"T","readDate":1479105175360,"biCreatedDate":1479105175360,"assignId":201}],"newNotificationCount":0}'];
//        return [200, '{"userNewAlertList":[], "userNotificationList":[{"notificationId":1,"header":"eMMG","messageBody":"test","notificationType":"M","readDate":null,"biCreatedDate":1480444421157,"assignId":8,"moreInfoUrl":null}],"newNotificationCount":1}'];
//        return [200, '{"userNewAlertList":[{"notificationId":14,"header":"111","messageBody":"1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111","notificationType":"A","readDate":null,"biCreatedDate":1480519766977,"assignId":555,"moreInfoUrl":"","owner":"Sridharan Narayanan"},{"notificationId":12,"header":"Time Title 1","messageBody":"Time Message","notificationType":"A","readDate":null,"biCreatedDate":1480518594207,"assignId":170,"moreInfoUrl":null,"owner":"Sridharan Narayanan"},{"notificationId":4,"header":"eMMG","messageBody":"test","notificationType":"A","readDate":null,"biCreatedDate":1480457383413,"assignId":181,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"},{"notificationId":3,"header":"eMMG","messageBody":"test","notificationType":"A","readDate":null,"biCreatedDate":1480457368227,"assignId":27,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"}],"userNotificationList":[{"notificationId":38,"header":"ghfghfg","messageBody":"fgf","notificationType":"A","readDate":null,"biCreatedDate":1480690560427,"assignId":819,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"},{"notificationId":35,"header":"Date Test","messageBody":"Date Message Body","notificationType":"M","readDate":null,"biCreatedDate":1480683324777,"assignId":874,"moreInfoUrl":null,"owner":"Sarunkumar Moorthy"},{"notificationId":32,"header":"New 1","messageBody":"New 2 ff","notificationType":"M","readDate":null,"biCreatedDate":1480606064443,"assignId":544,"moreInfoUrl":null,"owner":"Sridharan Narayanan"},{"notificationId":14,"header":"111","messageBody":"1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111","notificationType":"A","readDate":null,"biCreatedDate":1480519766977,"assignId":555,"moreInfoUrl":"","owner":"Sridharan Narayanan"},{"notificationId":12,"header":"Time Title 1","messageBody":"Time Message","notificationType":"A","readDate":null,"biCreatedDate":1480518594207,"assignId":170,"moreInfoUrl":null,"owner":"Sridharan Narayanan"},{"notificationId":4,"header":"eMMG","messageBody":"test","notificationType":"A","readDate":1479105175360,"biCreatedDate":1480457383413,"assignId":181,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"},{"notificationId":3,"header":"eMMG","messageBody":"test","notificationType":"A","readDate":1479105175360,"biCreatedDate":1480457368227,"assignId":27,"moreInfoUrl":null,"owner":"Sk Mahammad Saim"}],"newNotificationCount":7}'];
    });
    
    $httpBackend.whenGET(/dismissNotification\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"status":"Success","message":"Notification - 18 dismissed successfully.","id":null}'];
    });
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myBiApp 
 */
angular.module('myBiApp')
.controller('MainCtrl', ["$scope", "$rootScope", "$localStorage", "newsService", "reportSummaryService", "$q", "carouselService", "popularSearchService", "$http", "commonService", "reportsFactory", "userDetailsService", "$window", "$timeout", "CONFIG", function ($scope, $rootScope, $localStorage, newsService, reportSummaryService, $q, carouselService, popularSearchService, $http, commonService, reportsFactory, userDetailsService, $window, $timeout, CONFIG) {
    $scope.$emit('setNavBar', true);
    $scope.myInterval = 6000;
    $scope.noWrapSlides = false;
    $scope.carouselData = [];
    $scope.activeTab = 0;
    $scope.personaInfo = {};
    $scope.ieFlag = true;
    $scope.winFocus = false;
    $scope.listViewStatus = 'grid';
    $scope.isRecommendedCollapsed = true;
    $scope.isFavoriteCollapsed = true;
    $scope.isMostViewedCollapsed = true;
    $localStorage.treeLevelId = false;
    var newHeight, scrollBar;
    
    if($window.innerWidth < 768) {
        newHeight = 66;
        scrollBar = true;
    } else if ($window.innerWidth < 992) {
        newHeight = 75;
        scrollBar = true;
    } else {
        newHeight = 200;
        scrollBar = false;
    }
    
    $scope.config = {
        autoHideScrollbar: scrollBar,
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: newHeight,
        scrollInertia: 0
    };
    
    $scope.hideNavBar = function() {
        ($scope.noNavBar) ? $scope.noNavBar = false: $scope.noNavBar = true;
    };
    
    $scope.$on('breadCrumbValue', function(event, value){
        $scope.pageBreadCrumb = value
    });
    
    $scope.$on('hideReportTabs', function(event, value){
        $scope.hideTabsFlag = value
    });
    
    $scope.$on('myLevelIndication', function(event, value){
        $scope.myLevel = $localStorage.myLevel;
    });
    
    $scope.$on('myThemeSettings', function(event, theme, personalization, isMenuCollapsed){
        $localStorage.userTheme = theme;
        $localStorage.personalization = personalization;
        $localStorage.isMenuCollapsed = isMenuCollapsed
        $scope.userTheme = $localStorage.userTheme;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    $scope.$on('setSearchDisplayName', function(event, value){
        $scope.searchDisplayName = value;
    });
    
    $scope.$on('addToFavorite', function(event, obj) {
        var panelName = obj.arrayItem.title;
        var favStatus = obj.favorite;
        var  reportIndex = obj.reportIndex;
        
        switch(panelName) {
            case 'Favorite Reports': 
                obj.arrayItem.data.splice(reportIndex, 1);
                changeToFavorite(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id}), $scope.panelMostViewedReports.data, 'N');
                changeToFavorite(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id}), $scope.panelRRReports.data, 'N');
                break;
                
            case 'Most Viewed Reports':
                if(favStatus === 'N') {
//                    ($scope.panelFavoriteReports.data.length < 5) ? $scope.panelFavoriteReports.data.push(obj.report): '';
                    $scope.panelFavoriteReports.data.push(obj.report);
                    changeToFavorite(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id}), $scope.panelRRReports.data, 'Y');
                } else {
                    (_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}) >  -1) ? 
                        $scope.panelFavoriteReports.data.splice(_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}), 1): '';
                    changeToFavorite(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id}), $scope.panelRRReports.data, 'N');
                }    
                break;
                
            case 'Recommended Reports':
                if(favStatus === 'N') {
//                    ($scope.panelFavoriteReports.data.length < 5) ? $scope.panelFavoriteReports.data.push(obj.report): '';
                    $scope.panelFavoriteReports.data.push(obj.report);
                    changeToFavorite(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id}), $scope.panelMostViewedReports.data, 'Y');
                } else {
                    (_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}) >  -1) ? 
                        $scope.panelFavoriteReports.data.splice(_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}), 1): '';          
                    changeToFavorite(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id}), $scope.panelMostViewedReports.data, 'N');
                } 
                break;
        }
    });
    
    function changeToFavorite(itemIndex, itemArray, itemFlag) {
        if(itemIndex && itemArray[itemIndex]) {
            itemArray[itemIndex].favorite = itemFlag;
        }
//        if(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id})) {
//            $scope.panelMostViewedReports.data[_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id})].favorite = 'N';
//        }
//        if(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id})) {
//            $scope.panelRRReports.data[_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id})].favorite = 'N';
//        }
    }
    
    $scope.panelMostViewedReports = {
        'title': 'Most Viewed Reports',
        'open': true,
        'limit': 5,
        'class_names': 'report-block report-tile'
    };

    $scope.panelRRReports = {
        'title': 'Recommended Reports',
        'open': true,
        'limit': 5,
        'class_names': 'report-block report-tile',
        'viewMoreUiLink': 'reports.list',
        'rr': true
    };

    $scope.panelFavoriteReports = {
        'title': 'Favorite Reports',
        'open': true,
        'limit': 5,
        'class_names': 'report-block report-tile',
        'viewMoreUiLink': 'favorites'
    };
    
    setPersonalization();
    
    $scope.onMovePanelTo = function (currPosition, increment) {
        var currItem = $scope.reportPriorityList[currPosition];
        var newPos = currPosition + increment;
        $scope.reportPriorityList.splice(currPosition, 1);
        $scope.reportPriorityList.splice(newPos, 0, currItem);
        $scope.refreshPanelList($scope.reportPriorityList);
        setUserCustomization($scope.reportPriorityList, 'tileSettings');
    };

    $scope.setLoading(true);
    
    $scope.setListView = function (status) {
        $scope.listViewStatus  = status;
        $localStorage.listViewStatus = status;
        $scope.$broadcast('listViewValue', status);
        
        for (var i in $scope.reportPanelList) {
            $scope.reportPanelList[i]['listView'] = status;
        }
        
        var value = (status === 'grid') ? 0 :((status === 'list') ? 1 :  2);
        setUserCustomization(value, 'listView');
    }

    $scope.refreshPanelList = function () {
        $scope.reportPanelList = [];
        var totalPriorities = $scope.reportPriorityList.length;
        
        for (var i = 0; i < totalPriorities; i++) {
            switch ($scope.reportPriorityList[i]) {
                case 'recentViewedReports':
                    $scope.panelRRReports.listView = $scope.listViewStatus;
                    $scope.panelRRReports.open = $scope.isRecommendedCollapsed;
                    $scope.panelRRReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelRRReports);
                    break;
                case 'favoriteReports':
                    $scope.panelFavoriteReports.listView = $scope.listViewStatus;
                    $scope.panelFavoriteReports.open = $scope.isFavoriteCollapsed;
                    $scope.panelFavoriteReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelFavoriteReports);
                    break;
                case 'mostViewedReports':
                    $scope.panelMostViewedReports.listView = $scope.listViewStatus;
                    $scope.panelMostViewedReports.open = $scope.isMostViewedCollapsed;
                    $scope.panelMostViewedReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelMostViewedReports);
                    break;
            }
        }
    };

    $q.all([reportSummaryService.getReportSummary(), newsService, carouselService, popularSearchService, $scope.biGroup.all(), userDetailsService.userPromise]).then(function (response) {
        $timeout(function() {
            $scope.personaInfo = ($rootScope.personaInfo)? $rootScope.personaInfo : response[5][0].personaInfo;
//            $scope.personaInfo = response[5][0].personaInfo;
        }, 2000);
        $scope.setLoading(false);
        $scope.newsData = response[1];
        $scope.panelMostViewedReports.data = response[0].mostViewedReports;
        $scope.panelFavoriteReports.data = response[0].favoriteReports;
        $scope.panelRRReports.data = response[0].recentViewedReports;
        $scope.panelMostViewedReports.listView = 'grid';
        $scope.panelFavoriteReports.listView = 'grid';
        $scope.panelRRReports.listView = 'grid';
        $scope.refreshPanelList();
        $scope.carouselData = response[2];
        $scope.words = response[3];
        var userdetails = response[5][0];
        
        if (userdetails.userinfo.badge === 'Bronze') {
            $scope.myLevel = 'bronze-level';
        } else if (userdetails.userinfo.badge === 'Silver') {
            $scope.myLevel = 'silver-level';
        } else if (userdetails.userinfo.badge === 'Gold') {
            $scope.myLevel = 'gold-level';
        } else if (userdetails.userinfo.badge === 'Platinum') {
            $scope.myLevel = 'platinum-level';
        }
        $localStorage.myLevel = $scope.myLevel;
        $scope.$emit('myLevelIndication', $scope.myLevel);
    });

    $scope.showMyIndication = false;
    $scope.collapseMyIndication = function () {
        $scope.showMyIndication = !$scope.showMyIndication;
    };

    $scope.showMostviewed = true;
    $scope.collapseMostviewed = function () {
        $scope.showMostviewed = !$scope.showMostviewed;
    };

    $scope.showTopSerches = true;
    $scope.collapseTopSerches = function () {
        $scope.showTopSerches = !$scope.showTopSerches;
    };

    $scope.showMyUtilization = true;
    $scope.collapseMyUtilization = function () {
        $scope.showMyUtilization = !$scope.showMyUtilization;
    };

    $scope.showMyActivity = true;
    $scope.collapseMyActivity = function () {
        $scope.showMyActivity = !$scope.showMyActivity;
    };

    $scope.showBadges = true;
    $scope.collapseBadges = function () {
        $scope.showBadges = !$scope.showBadges;
    };

    $window.onfocus = function () {
        $scope.winFocus = true;
    };

    $scope.triggerCarousel = function () {
        //location.reload();
        if ($scope.winFocus) {
            $scope.ieFlag = false;
            $timeout(function () {
                $scope.ieFlag = true;
            }, 1000);
            $scope.winFocus = false;
        }
    };
    
    function setUserCustomization(reportObject, type) {
        switch(type) {
            case 'tileSettings':
                userDetailsService.userPromise.then(function(userObj) {
                    var putObj = {
                        'userId' : userObj[0].uid,
                        'recommended' :reportObject.indexOf('recentViewedReports')+1,
                        'favorite' : reportObject.indexOf('favoriteReports')+1,
                        'mostViewed' : reportObject.indexOf('mostViewedReports')+1,
                        'userTheme' : findThemeKey(CONFIG.userTheme, $localStorage.userTheme)
                    };
                    
                    $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                        .then(function (resp, status, headers) {

                        }, function (resp, status, headers, config) {

                        });
                });
                break;
            case 'listView':
                userDetailsService.userPromise.then(function(userObj) {
                    var putObj = {
                        'userId' : userObj[0].uid,
                        'isListViewed' :reportObject,
                    };
                    
                    $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                        .then(function (resp, status, headers) {

                        }, function (resp, status, headers, config) {

                        });
                });
                break;
        }   
        
    }
    
    function findThemeKey(obj, value) {
        var key;
        
        _.each(_.keys(obj), function(k) {
           if(obj[k] === value) {
               key = k;
           } 
        });
        return parseInt(key);
    }
    
    function setPersonalization() {
        $http.get('BITool/home/getUserPersonalization').then(function (response) {
            if(response.data) {
                if (response.data.isListViewed === null || !response.data.isListViewed) {
                    $localStorage.listViewStatus = 'grid';
                } else {
                    (response.data.isListViewed === 0) ? $localStorage.listViewStatus = 'grid' : ((response.data.isListViewed === 1)? $localStorage.listViewStatus = 'list': $localStorage.listViewStatus = 'detailed');
                }  
                
                (response.data.isRecommendedCollapsed === 1) ? $scope.isRecommendedCollapsed = false : $scope.isRecommendedCollapsed = true;
                (response.data.isFavoriteCollapsed === 1) ? $scope.isFavoriteCollapsed = false : $scope.isFavoriteCollapsed = true;
                (response.data.isMostViewedCollapsed === 1) ? $scope.isMostViewedCollapsed = false : $scope.isMostViewedCollapsed = true;
                (response.data.isMenuCollapsed === 1) ? $scope.isMenuCollapsed = true : $scope.isMenuCollapsed = false;
                var personalization = [];
                
                if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                    personalization[response.data.favorite - 1] = 'favoriteReports'; 
                    personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                    personalization[response.data.recommended - 1] = 'recentViewedReports';
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                }
                
                $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                $scope.listViewStatus = $localStorage.listViewStatus;
                $localStorage.isMenuCollapsed = $scope.isMenuCollapsed;
                $scope.userTheme = $localStorage.userTheme;
                $localStorage.personalization = personalization;
                $scope.reportPriorityList = personalization;
                $scope.reportPanelList = [];
                $scope.refreshPanelList($scope.reportPriorityList);
                $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
            } else {
                $scope.reportPriorityList = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                $scope.reportPanelList = [];
                $scope.userTheme = $localStorage.userTheme = 'default';                    
                $scope.listViewStatus = $localStorage.listViewStatus = 'grid';
                $scope.isMenuCollapsed = $localStorage.isMenuCollapsed = 0;
                $scope.$emit('myThemeSettings', $scope.userTheme, $scope.reportPriorityList, $scope.isMenuCollapsed);
            }
        });
    }
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportCtrl
 * @description
 * # ReportCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportCtrl', ["$scope", "$rootScope", "$localStorage", "$http", "$stateParams", "$state", "$sce", "$filter", "$timeout", "reportsMenu", "userDetailsService", "commonService", "CONFIG", "$window", "searchservice", function ($scope, $rootScope, $localStorage, $http, $stateParams, $state, $sce, $filter, $timeout, reportsMenu, userDetailsService, commonService, CONFIG, $window, searchservice/*, $rootScope*/) {
    /*jshint latedef: false */
    $scope.setLoading(true);
    $scope.isTableu = false;
    $scope.feedbackArray = [];
    $scope.mainState.$current.data.displayName = '';
    $scope.reportAccessData = {};
    $scope.isCollapsed = false;
    $scope.pageBreadCrumb = '';
    $scope.$emit('breadCrumbValue', $scope.pageBreadCrumb);
    ($state.current.name !== 'reports.details.report.report' && $state.current.name !== 'reports.details.report.about') ? getBreadCrumbLevel($stateParams.reportId) : '';
    
    if ($stateParams.levelId && $stateParams.reportId) {
        if ($state.current.name === 'reports.details.report.report') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.reportId);
                $http.get(urlReports).then(function (resp) {
                    //Update user view count
                    var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl(response[0].emcLoginName, resp.data.sourceReportId, resp.data.sourceSystem, 'Persona');
                    $http.get(reportUpdateViewed);
                    $scope.setLoading(false);
                    
                    if (resp.data.name) {
                        $scope.mainState.$current.data.displayName = resp.data.name;
                        (resp.data.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                        $scope.isTableu = (resp.data.type === 'Tableau')? true : false;
                        $scope.reportName = resp.data.name;
                        addToRootScope(resp.data);
                        getBreadCrumbLevel($stateParams.reportId);
                        
                        if($scope.isTableu) {
                            var placeholderDiv = document.getElementById('tableu_report3');
                            var url = resp.data.reportLink ? resp.data.reportLink : '';
                            var headerFlag = (resp.data.isHeaderFlag === 0) ? '?Header Flag=0&' : '?';
                            var reportToolBar = (resp.data.displayType === 'H') ? headerFlag+':toolbar=no' : 
                                    ((resp.data.displayType === 'B')? headerFlag+':toolbar=bottom' : headerFlag+':toolbar=top'); 
                            var options = {
                                hideTabs: (resp.data.tabbedViews && resp.data.tabbedViews === 'Y') ? false : true,
                                width: '100%',
                                height: '800px'
                            };
                            
                            new tableau.Viz(placeholderDiv, url+reportToolBar, options);
                        } else {
                            var url = resp.data.reportLink ? resp.data.reportLink : '';
                            
                            $scope.getOtherReportLink = function () {
                                return $sce.trustAsResourceUrl(url);
                            };
                        }
                    }
                });
            });
        } else if ($state.current.name === 'reports.details.report.about') {
            $scope.reportData = {};
            
            if($rootScope.reportName) {
                $scope.mainState.$current.data.displayName = $rootScope.reportName;
                ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
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
                        (resp.data.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
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
            ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
            var url = commonService.prepareReportAccessUrl($stateParams.reportId);

            $http.get(url).then(function (resp) {
                $scope.reportAccessData = resp.data    
            });
                    
            $scope.setLoading(false);
        } else if ($state.current.name === 'reports.details.report.feedback') {
            $scope.feedbackArray= [];
            ($rootScope.reportName) ? $scope.mainState.$current.data.displayName = $rootScope.reportName : '';
            ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
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
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    $scope.isTableu = ($rootScope.repType === 'Tableau')? true : false;
                    
                    if($scope.isTableu) {
                        if($rootScope.viewTabs === 'N') {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                            var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                        } else {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId+'&sourceReportId='+ $rootScope.sourceReportId;
                            var url = commonService.prepareMetaDataUrlWork((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceSystem, $rootScope.workbookId, $rootScope.sourceReportId);
                        }
                    } else {
                        $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                        var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                    }                 
                    
                    $http.get(url).then(function (resp) {
                        if(resp.data) {
                            if(resp.data.length > 0) {
                                if($scope.isTableu) {
                                    if($rootScope.viewTabs === 'N') {
                                        $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                    } else {
                                        $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId;
                                    }
                                } else {
                                    $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                }
                            } else {
                                $scope.emptyMessage = 'The report does not have metadata to display.';
                                $scope.setLoading(false);
                                return;
                            }
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
                    },function(){
                        $scope.emptyMessage = 'The report does not have metadata to display.';
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
                            ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                            if($scope.isTableu) {
                                if($rootScope.viewTabs === 'N') {
                                    $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                    var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                                } else {
                                    $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId+'&sourceReportId='+ $rootScope.sourceReportId;
                                    var url = commonService.prepareMetaDataUrlWork((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceSystem, $rootScope.workbookId);
                                }
                            } else {
                                $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                            }

                            $http.get(url).then(function (resp) {
                                if(resp.data) {
                                    if(resp.data.length > 0) {
                                        if($scope.isTableu) {
                                            if($rootScope.viewTabs === 'N') {
                                                $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                            } else {
                                                $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId;
                                            }
                                        } else {
                                            $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                        }
                                    } else {
                                        $scope.emptyMessage = 'The report does not have metadata to display.';
                                        $scope.setLoading(false);
                                        return;
                                    }
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
                            },function(){
                                $scope.emptyMessage = 'The report does not have metadata to display.';
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
                
                $scope.$emit('breadCrumbValue', $scope.pageBreadCrumb);
                return;
            }
            
            var lId = ($localStorage.treeLevelId) ? $stateParams.levelId : $rootScope.levelId;
            
            $http.get('BITool/home/getBreadCrumbsDetails?levelId='+lId).then(function (response) {
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
                    $scope.$emit('breadCrumbValue', $scope.pageBreadCrumb);

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
                        
                        $scope.$emit('breadCrumbValue', $scope.pageBreadCrumb);
                        return;
                    }
                    
                    var lId = ($localStorage.treeLevelId) ? $stateParams.levelId : reportLevelId;
                    
                    $http.get('BITool/home/getBreadCrumbsDetails?levelId='+lId).then(function (response) {
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
                            $scope.$emit('breadCrumbValue', $scope.pageBreadCrumb);

                        } else {
                        }
                    });
                });
            });
        }
    }
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportsCtrl
 * @description
 * # ReportsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportsCtrl', ["$scope", "$localStorage", "$state", "$q", "$http", "$sce", "commonService", "reportsFactory", "userDetailsService", "CONFIG", function ($scope, $localStorage, $state, $q, $http, $sce, commonService, reportsFactory, userDetailsService, CONFIG) {
    $scope.setLoading(true);
    $scope.$emit('setNavBar', true);
    $scope.access = {};
    $scope.access.limitTo = 5;
    $scope.access.subGroupItemsId = 0;
    
    $scope.$on('listViewValue', function(event, status) {
        $localStorage.listViewStatus = status;
        $scope.listViewStatus = status = $localStorage.listViewStatus;
    });
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    setUserPreference();
    
    $scope.access.allReports = function () {
        $localStorage.treeLevelId = false;
        $scope.sortOption = 'ascName';
        $scope.filterOption = 'filter';
        $scope.defaultFilter = 'All';
        
        userDetailsService.userPromise.then(function (userObject) {
            if (userObject[0].personaInfo.status === 'Error') {
                $scope.setLoading(false);
                $scope.personaInfo = userObject[0].personaInfo;
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
                //getBreadCrumbLevel(false);
                $scope.$emit('bredCrumbValue', '');
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
                            'rowCount':getCount(groupService.reports),
                            'listView':$scope.listViewStatus,
                            'displayName' : $scope.mainState.$current.data.displayName,
                            'rr': true
                        };
//                        $scope.setListView(false);
                    }, function () {
                        $scope.setLoading(false);
                    });
                });
            }
        }); 
    };

    $scope.access.subGroupItems = function (levelid) {
        $localStorage.treeLevelId = true;
        $scope.sortOption = 'ascName';
        $scope.filterOption = 'filter';
        $scope.defaultFilter = 'All';
        $scope.$emit('setNavBar', true);
        $scope.biGroup.all().then(function () {
            //getBreadCrumbLevel(levelid);
            $scope.$emit('bredCrumbValue', '');
            $scope.setLoading(false);
            $scope.dataObj = [];
            
            function getLevelObj(obj) {
                var filter = _.findWhere(obj, {'levelId': parseInt(levelid)});
                
                if (filter) {
                    $scope.mainState.$current.data.displayName = filter.levelDesc;
                    var groupid = $scope.biGroup.biGroupId;
                    if (filter.children.length !== 0) {
                        var parent = [{'collapsed':filter.collapsed, 'levelDesc':filter.levelDesc, 'levelId':filter.levelId,'levelNumber':filter.levelNumber,'parentLevelId':filter.parentLevelId}];
                        $scope.dataObj1 = _.map(parent, function (eachLevel) {
                            var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, eachLevel.levelId, true);
                            groupService.loadReports();
                            return {
                                'title': eachLevel.levelDesc,
                                'open': true,
                                'limit': $scope.access.limitTo,
                                'class_names': 'report-tile',
                                'service': groupService,
                                'levelLink': eachLevel.levelId,
                                'data': groupService.reports,
                                'listView':$scope.listViewStatus
                            };
                        });
                        
                        $scope.dataObj = _.map(filter.children, function (eachLevel) {
                            var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, eachLevel.levelId, true);
                            groupService.loadReports();
                            return {
                                'title': eachLevel.levelDesc,
                                'open': true,
                                'limit': $scope.access.limitTo,
                                'class_names': 'report-tile',
                                'service': groupService,
                                'levelLink': eachLevel.levelId,
                                'data': groupService.reports,
                                'listView':$scope.listViewStatus
                            };
                        });
                        
                        $scope.dataObj.unshift($scope.dataObj1[0])
                    } else {
                        var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, levelid);
                        groupService.loadReports();
                        $scope.dataObj[0] = {
                            'title': filter.levelDesc,
                            'open': true,
                            'limit': undefined,
                            'class_names': 'report-tile',
                            'service': groupService,
                            'data': groupService.reports,
                            'listView':$scope.listViewStatus
                        };
//                        $scope.setListView(false);
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
    
    $scope.access.subGroupItemsViewAll = function (levelid) {
        $scope.$emit('setNavBar', true);
        $scope.biGroup.all().then(function () {
            //getBreadCrumbLevel(levelid);
            $scope.$emit('bredCrumbValue', '');
            $scope.setLoading(false);
            $scope.dataObj = [];
            
            function getLevelObj(obj) {
                var filter = _.findWhere(obj, {'levelId': parseInt(levelid)});
                
                if (filter) {
                    $scope.mainState.$current.data.displayName = filter.levelDesc;
                    var groupid = $scope.biGroup.biGroupId;
                    var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, levelid);
                    groupService.loadReports();
                    $scope.dataObj[0] = {
                        'title': filter.levelDesc,
                        'open': true,
                        'limit': undefined,
                        'class_names': 'report-tile',
                        'service': groupService,
                        'data': groupService.reports,
                        'listView':$scope.listViewStatus
                    };
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
    
    function getCount(reports) {
        if(reports && reports.length > 0) {
           return reports[0].rowCount;
        } else {
            return 0;
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
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }
                    
                    if (response.data.isListViewed === null || !response.data.isListViewed) {
                        $localStorage.listViewStatus = 'grid';
                    } else {
                        (response.data.isListViewed === 0) ? $localStorage.listViewStatus = 'grid' : ((response.data.isListViewed === 1)? $localStorage.listViewStatus = 'list': $localStorage.listViewStatus = 'detailed');
                    }
                    
                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $localStorage.personalization = personalization;
                    $localStorage.isMenuCollapsed = (response.data.isMenuCollapsed === 1) ? true : false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $scope.userTheme = $localStorage.userTheme = 'default';                    
                    $scope.listViewStatus = $localStorage.listViewStatus = 'grid';
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed = 0;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus
            $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
        }
    }
    
    $scope.setListView = function (status) {
        if ($scope.groupsData) {
            $scope.groupsData.listView = status;
            updateListView(status);
        }
        
        if (!$scope.dataObj) {
            return;
        } else {
            for (var i in $scope.dataObj) {
                $scope.dataObj[i].listView = status;
                updateListView(status);
            }
        }
    }
    
    $scope.sortReports = function() {        
        $scope.$broadcast('sortFilterReportsBroadCast', $scope.sortOption, $scope.filterOption, 'sort');
    }
    
    $scope.filterReports = function() {
//        if($scope.filterOption === 'filter') {
//            $scope.defaultFilter = 'Filter';
//        } else {
//            $scope.defaultFilter = 'Default';
//        }
        
        $scope.defaultFilter = 'All';
        $scope.$broadcast('sortFilterReportsBroadCast', $scope.sortOption, $scope.filterOption, 'filter');
    }
    
    function updateListView(status) {
        $scope.$broadcast('listViewValue', status);
        var value = (status === 'grid') ? 0 :((status === 'list') ? 1 :  2);
        var putObj = {
            'isListViewed' :value,
        };

        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
            .then(function (resp, status, headers) {

            }, function (resp, status, headers, config) {

            });
    }

}])
.filter('filterReports', function () {
    return function (items, levelId) {
        return levelId === 0 ? items : _.filter(items, function (eachitem) {
            return eachitem.levelId === levelId;
        });
    };
});
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
.controller('ParentCtrl', ["$scope", "$rootScope", "$window", "$localStorage", "$http", "$q", "ngProgressFactory", "$state", "reportsMenu", "commonService", "userDetailsService", "userAlertService", "CONFIG", "$uibModal", "$timeout", function ($scope, $rootScope, $window, $localStorage, $http, $q, ngProgressFactory, $state, reportsMenu, commonService, userDetailsService, userAlertService, CONFIG, $uibModal, $timeout) {
    /**
     * @ngdoc property
     * @name biGroup
     * @description Will have object of service reportsMenu which basically have the menu or group levels of users.
     * 
     */
//    redirectToPage();
    checkUserExist();
    getNotification();
    $scope.isMobileDevice = ($window.innerWidth < 768) ? true: false;
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
    $scope.zIndex = '999';
    $localStorage.treeLevelId = false;
    $scope.operationalDashboard = false;
    $scope.toggleNotfy = false;
    var newHeight, scrollBar;
    
    if($window.innerWidth < 768) {
        newHeight = 75;
        scrollBar = true;
    } else if ($window.innerWidth < 992) {
        newHeight = 100;
        scrollBar = true;
    } else {
        newHeight = 250;
        scrollBar = false;
    }
    
    $scope.notfyConfig = {
        autoHideScrollbar: scrollBar,
        theme: 'dark',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: newHeight,
        scrollInertia: 0
    };
    
    $scope.notfyConfigEmpty = {
        autoHideScrollbar: scrollBar,
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 0,
        scrollInertia: 0
    };
    
    $scope.$on('breadCrumbValue', function(event, value){
        $scope.pageBreadCrumb = value
    });
    
    $scope.$on('hideReportTabs', function(event, value){
        $scope.hideTabsFlag = value
    });
    
    $scope.$on('setNavBar', function(event, value){
        $scope.noNavBar = true;
        $scope.toggleNotfy = false;
        $scope.zIndex = '999';
    });
    
    $scope.$on('hideNotfy', function(event, value){
        $scope.toggleNotfy = value;
    });
    
    $scope.toggleLeftMenu = function () {
        $scope.isMenuCollapsed = ($scope.isMenuCollapsed) ? false : true;
        $scope.$broadcast('menuCollapsedStatus', $scope.isMenuCollapsed);
        var value = ($scope.isMenuCollapsed) ? 1 : 0;
        
        userDetailsService.userPromise.then(function(userObj) {
            var putObj = {
                'userId' : userObj[0].uid,
                'isMenuCollapsed' :value,
            };

            $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                .then(function (resp, status, headers) {

                }, function (resp, status, headers, config) {

                });
        });
    };
    
    $scope.showDismissIcon = function(status, id) {
        if(status) {
            $scope.dismissId = id;
        } else {
            $scope.dismissId = status;
        }
    };
    
    $scope.hideNavBar = function() {
        $scope.toggleNotfy = false;
        if($scope.noNavBar) {
            $scope.noNavBar = false;
            $scope.zIndex = '998';
        } else {
            $scope.noNavBar = true;
            $timeout(function(){$scope.zIndex = '999'}, 1000);
            
        }
    };
    
    $scope.openNotfyMobile = function() {
        if($scope.toggleNotfy){
            $scope.toggleNotfy = false;
        }  else {
            $scope.toggleNotfy = true;
        }
    }
    
    $scope.$on('myLevelIndication', function(event, value) {
        $localStorage.myLevel = value
        $scope.myLevel = $localStorage.myLevel;
    });
    
    $scope.$on('myThemeSettings', function(event, theme, personalization, isMenuCollapsed){
        $localStorage.userTheme = theme;
        $localStorage.personalization = personalization;
        $localStorage.isMenuCollapsed = isMenuCollapsed
        $scope.userTheme = $localStorage.userTheme;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    $scope.$on('setSearchDisplayName', function(event, value){
        $scope.searchDisplayName = value;
    });
    
    /**
     * Update my level indication
     */
    userDetailsService.userPromise.then(function (userObject) {
        $scope.userObject = userObject[0];
        
        $timeout(function() {
            if($localStorage.myLevel) {
                $scope.myLevel = $localStorage.myLevel;
            } else {
                setUserLevel($scope.userObject);
            }

            $scope.personaList =  userObject[0].userinfo.userPersonaList;
            $scope.defaultPersona = userObject[0].userinfo.group[0].groupId;
            $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
        },2000);
        
        $q.all([reportsMenu.all()])
            .then(function (/*response*/) {
                $scope.operationalDashboard = reportsMenu.operationalLink;;
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
    
    $scope.readAllNotification = function() {
        $http.put('BITool/home/markAllNotificationAsRead')
            .then(function (resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    $scope.readStatusMessage = resp.data.message;
                    
                    angular.forEach($scope.notficationObj.userNotificationList, function(notification){
                        notification.readDate = new Date().getTime();
                    });
                    
                    angular.forEach($scope.notficationObj.userNewAlertList, function(notification){
                        notification.readDate = new Date().getTime();
                    });
                    
                    $scope.notficationObj.newNotificationCount = 0;
                    $localStorage.notficationObj  = $scope.notficationObj;
                    paginateNotification();
                } else {
                    $scope.readStatusMessage = '';
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = resp.data.message
                    }
                }
            }, function () {
                $scope.readStatusMessage = '';
                $scope.messageAlertError = "Error!!.";
            });
    };
    
    $scope.dismissAllNotification = function() {
        var modalDeleteNotification = $uibModal.open({
            templateUrl:'views/deleteNotificationModal.html',
            controller:'DeleteNotificationModalCtrl',
            windowClass: 'switch-modal',
            resolve: {
                items: function() {
                    return {
                        data: $scope.notficationObj
                    };
                }
            }
        });
        
            
        modalDeleteNotification.result.then(function(Obj){
            $http.put('BITool/home/dismissAllNotification')
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.dismissStatusMessage = resp.data.message;            
                        $localStorage.notficationObj  = $scope.notficationObj = {"userNewAlertList":[],"userNotificationList":[],"newNotificationCount":0};
                        paginateNotification();
                    } else {
                        $scope.dismissStatusMessage = '';
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = resp.data.message
                        }
                    }
                }, function () {
                    $scope.dismissStatusMessage = '';
                    $scope.messageAlertError = "Error!!.";
                }); 
        });
    };
    
    $scope.itemsPerPage = 3;
    $scope.currentPage = 0;
    $scope.notificationItems = [];
    
    $scope.setReadNotification = function(id,readFlag) {
        $http.put('BITool/home/markNotificationAsRead?assignId='+id+'&isRead='+readFlag)
            .then(function (resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    var index = _.findIndex($scope.notficationObj.userNotificationList, function(item) { return item.assignId === id});   
                    $scope.readStatusMessage = resp.data.message;
                    
                    if(!$scope.notficationObj.userNotificationList[index].readDate) {
                        $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount -1;
                        $scope.notficationObj.userNotificationList[index].readDate = new Date().getTime();
                    } else {
                        $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount +1;
                        $scope.notficationObj.userNotificationList[index].readDate = '';
                    }
                    
                    $localStorage.notficationObj  = $scope.notficationObj;
                    paginateNotification();
                } else {
                    $scope.readStatusMessage = '';
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = resp.data.message
                    }
                }
            }, function () {
                $scope.readStatusMessage = '';
                $scope.messageAlertError = "Error!!.";
            });
    };
    
    $scope.dismissNotification = function(id) {
        $http.put('BITool/home/dismissNotification?assignId='+id)
            .then(function (resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    var index = _.findIndex($scope.notficationObj.userNotificationList, function(item) { return item.assignId === id});
                    $scope.dismissStatusMessage = resp.data.message;            
                    
                    if(!$scope.notficationObj.userNotificationList[index].readDate) {
                        $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount -1;
                        ($scope.notficationObj.userNewAlertList).splice(index, 1);
                    }
                    
                    ($scope.notficationObj.userNotificationList).splice(index, 1);
                    $localStorage.notficationObj  = $scope.notficationObj;
                    paginateNotification();
                } else {
                    $scope.dismissStatusMessage = '';
                    if (resp.data && resp.data.message) {
                        $scope.messageAlertError = resp.data.message
                    }
                }
            }, function () {
                $scope.dismissStatusMessage = '';
                $scope.messageAlertError = "Error!!.";
            });
    };
    
    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
            paginateNotification();
        }
    };

    $scope.prevPageDisabled = function() {
        return $scope.currentPage === 0 ? "disabled link-disable" : "";
    };
    
    $scope.nextPage = function() {
        if ($scope.currentPage < getPageCount()) {
            $scope.currentPage++;
            paginateNotification();
        }
    };

    $scope.nextPageDisabled = function() {
        return $scope.currentPage === getPageCount() ? "disabled link-disable" : "";
    };
    
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
    
    function checkUserExist() {
        $http.get('BITool/userExistInBITool').then(function(response) {
            $rootScope.personaInfo = response.data;
            if(response.data && response.data.isApplicationRunning === false) {
                $window.location.href ='/maintenance/index.html';
            }
        });
    }
    
    function getPageCount() {
        if($scope.notficationObj && $scope.notficationObj.userNotificationList) {
            return Math.ceil($scope.notficationObj.userNotificationList.length/$scope.itemsPerPage)-1;
        }
    }
    
    function getNotification() {
        $http.get('BITool/home/getNotificationByUser').then(function(response) {
            $scope.notficationObj = $localStorage.notficationObj = response.data;
            
            if($scope.notficationObj.userNewAlertList.length > 0) {
                $scope.createAlertPopup($scope.notficationObj);
            }
            
            paginateNotification();
        });
    }
    
    function paginateNotification() {
        $scope.notificationItems = [];
        var min = ($scope.currentPage * $scope.itemsPerPage);
        var max  = ($scope.notficationObj.userNotificationList.length < min+3) ? $scope.notficationObj.userNotificationList.length : min+3;
        
        for (var i= min; i<max; i++) {
            ($scope.notficationObj.userNotificationList[i])? $scope.notificationItems.push($scope.notficationObj.userNotificationList[i]):'';
        }
        
        if($scope.notficationObj.userNotificationList.length === min) {
            $scope.currentPage--;
            paginateNotification();
        }
    }
    
    $scope.createAlertPopup = function () {
        if($window.innerWidth < 768) {
            return;
        }
            
        angular.forEach($scope.notficationObj.userNewAlertList, function(notfication) {
            var modalInstance = $uibModal.open({
                templateUrl:'views/notificationModal.html',
                controller:'NotificationModalCtrl',
                windowClass: 'notfy-modal',
                resolve: {
                    items: function() {
                        return{
                            data: notfication
                        };
                    }
                }
            });
            
            modalInstance.result.then(function(Obj){
                var index1 = _.findIndex($scope.notficationObj.userNewAlertList, function(item) { return item.assignId === Obj.assignId});
                var index2 = _.findIndex($scope.notficationObj.userNotificationList, function(item) { return item.assignId === Obj.assignId});
                console.log(index1);
                console.log(index2);
                $http.put('BITool/home/dismissNotification?assignId='+Obj.assignId)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            getNotification();
//                            $timeout(function() {
//                                $scope.dismissAlertMessage = resp.data.message;     
//                                ($scope.notficationObj.userNewAlertList).splice(index1, 1);   
//                                ($scope.notficationObj.userNotificationList).splice(index2, 1);
//                                $scope.notficationObj.newNotificationCount = $scope.notficationObj.newNotificationCount -1;
//                                $localStorage.notficationObj  = $scope.notficationObj;
//                                $scope.$apply();
//                            }, 1000);
                        } else {
                            $scope.dismissAlertMessage = '';
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = resp.data.message
                            }
                        }
                    }, function () {
                        $scope.dismissAlertMessage = '';
                        $scope.messageAlertError = "Error!!.";
                    });
            });
        });
    }
    
//    function redirectToPage(){
//        if($localStorage.urlObj) {
//            console.log($localStorage.urlObj);
//            $state.go($localStorage.urlObj.hash.split('/')[1]);
//        }
//    }
    
    $scope.openModelPersona = function () {
        var modalInstance = $uibModal.open({
           templateUrl:'views/switchPersona.html',
           controller:'SwitchPeronaCtrl',
           windowClass: 'switch-modal',
           resolve: {
                items: function () {
                    return{
                        personaList: $scope.userObject.userinfo.userPersonaList,
                        defaultPersona: $scope.userObject.userinfo.group[0].groupId
                    };
                }
            }
        });
    };
    
    $scope.setNewPersona = function() {
        $scope.setLoading(true);
        
        var obj = {
            'groupId' : $scope.defaultPersona,
            'isActive' : 'Y'
        };
        
        $http.put('BITool/activateDefaultPersona', obj)
            .then(function (data, status, headers, config) {
                $scope.statusMessage = data.message; 
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            }, function (data, status, headers, config) {
                $scope.statusMessage = data.message;
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            });
    };
    
}]).directive('errSrc', function () {
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

angular.module('myBiApp').controller('SwitchPeronaCtrl', ["$scope", "$state", "$uibModalInstance", "items", "$http", "$window", "$rootScope", "$timeout", function ($scope, $state, $uibModalInstance, items, $http, $window, $rootScope, $timeout) {
    $scope.personaList = items.personaList;
    $scope.defaultPersona = items.defaultPersona;
    $scope.currentPersona = items.defaultPersona;
    
    $scope.setDefaultPersona = function () {
        $scope.setLoading(true);
        var obj = {
            'groupId' : $scope.defaultPersona,
            'isActive' : 'Y'
        };
        
        $http.put('BITool/activateDefaultPersona', obj)
            .then(function (data, status, headers, config) {
                $uibModalInstance.dismiss('close');
                $scope.statusMessage = data.message;
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            }, function (data, status, headers, config) {
                $uibModalInstance.dismiss('close');
                $scope.statusMessage = data.message;
                $scope.setLoading(false);
                $state.go('home');
                $window.location.reload();
            });
    }

    $scope.close = function() {
        $uibModalInstance.dismiss('close');
    };
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportslibCtrl
 * @description
 * # ReportsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportslibCtrl', ["$scope", "$uibModalInstance", "items", function ($scope, $uibModalInstance, items) {
    //$scope.setLoading(false);
    $scope.items = items;

    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        angular.forEach($scope.items, function (value) {
            var idx = $scope.selection.indexOf(value.id);
            if (idx > -1) {
                value.publish = true;
                value.lastp = getCurrentTime();
            }
        });
        $uibModalInstance.close($scope.items);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selection = [];

    $scope.toggleSelection = function (reportid) {
        var idx = $scope.selection.indexOf(reportid);

        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.selection.push(reportid);
        }
    };

    $scope.selectAll = function () {
        angular.forEach($scope.items, function (value) {
            $scope.selection.push(value.id);
        });
    };

    $scope.deSelectAll = function () {
        $scope.selection.splice(0, $scope.selection.length);
    };

    function getCurrentTime() {
        return new Date().getTime();
    }

    $scope.totalItems = 64;
    $scope.currentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
    };

    $scope.maxSize = 10;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportsdashboardCtrl
 * @description
 * # ReportsdashboardCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportsdashboardCtrl', ["$scope", "reportsMenu", "$http", "CONFIG", "userDetailsService", "$localStorage", function ($scope, reportsMenu, $http, CONFIG, userDetailsService, $localStorage) {
    reportsMenu.all().then(function () {
        $scope.operationDashboardLink = reportsMenu.operationalLink;
    });
    
    $scope.$emit('bredCrumbValue', '');
    $scope.$emit('setNavBar', true);
    setUserPreference();
    setUserLevel();
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    function setUserLevel() {
        if(!$localStorage.myLevel) {
            userDetailsService.userPromise.then(function (userObject) {
                if (userObject[0].userinfo.badge === 'Bronze') {
                    $scope.myLevel = 'bronze-level';
                } else if (userObject[0].userinfo.badge === 'Silver') {
                    $scope.myLevel = 'silver-level';
                } else if (userObject[0].userinfo.badge === 'Gold') {
                    $scope.myLevel = 'gold-level';
                } else if (userObject[0].userinfo.badge === 'Platinum') {
                    $scope.myLevel = 'platinum-level';
                }

                $localStorage.myLevel = $scope.myLevel
                $scope.$emit('myLevelIndication', $scope.myLevel);
            });    
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
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }
                    
                    if (response.data.isListViewed === null || !response.data.isListViewed) {
                        $localStorage.listViewStatus = 'grid';
                    } else {
                        (response.data.isListViewed === 0) ? $localStorage.listViewStatus = 'grid' : ((response.data.isListViewed === 1)? $localStorage.listViewStatus = 'list': $localStorage.listViewStatus = 'detailed');
                    }
                    
                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $localStorage.personalization = personalization;
                    $localStorage.isMenuCollapsed = (response.data.isMenuCollapsed === 1) ? true : false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $scope.userTheme = $localStorage.userTheme = 'default';                    
                    $scope.listViewStatus = $localStorage.listViewStatus = 'grid';
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed = 0;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus
            $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
        }
    }
}]);

'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myBiApp. Controls the favorite page.
 */
angular.module('myBiApp')
.controller('favoritesCtrl', ["$scope", "$localStorage", "reportsFactory", "userDetailsService", "$http", "CONFIG", function ($scope, $localStorage, reportsFactory, userDetailsService, $http, CONFIG) {
    var favoriteService = new reportsFactory.reportsFactoryFunction('favorite');
    $scope.$emit('bredCrumbValue', '');
    $scope.$emit('setNavBar', true);
    $scope.sortOption = 'ascName';
    $scope.filterOption = 'filter';
    $scope.defaultFilter = 'All';
    
    $scope.$on('listViewValue', function(event, status) {
        $localStorage.listViewStatus = status;
        $scope.listViewStatus = $localStorage.listViewStatus;
    });
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    setUserPreference();
    
    $scope.sortReports = function() {
        $scope.$broadcast('sortFilterReportsBroadCast', $scope.sortOption, $scope.filterOption, 'sort');
    }
    
    $scope.filterReports = function() {
        $scope.defaultFilter = 'All';  
        $scope.$broadcast('sortFilterReportsBroadCast', $scope.sortOption, $scope.filterOption, 'filter');
    }
    
    if(!$localStorage.myLevel) {
        userDetailsService.userPromise.then(function (userObject) {
            if (userObject[0].userinfo.badge === 'Bronze') {
                $scope.myLevel = 'bronze-level';
            } else if (userObject[0].userinfo.badge === 'Silver') {
                $scope.myLevel = 'silver-level';
            } else if (userObject[0].userinfo.badge === 'Gold') {
                $scope.myLevel = 'gold-level';
            } else if (userObject[0].userinfo.badge === 'Platinum') {
                $scope.myLevel = 'platinum-level';
            }

            $localStorage.myLevel = $scope.myLevel
            $scope.$emit('myLevelIndication', $scope.myLevel);
        });    
    } else {
        $scope.myLevel = $localStorage.myLevel;
        $scope.$emit('myLevelIndication', $scope.myLevel);
    }
    
    $scope.setListView = function (status) {
        if ($scope.myfavorites) {
            $scope.myfavorites.listView = status;
            //$scope.groupsData['listView']=status;
            updateListView(status);
        }
        
        if (!$scope.dataObj) {
            return;
        } else {
            for (var i in $scope.dataObj) {
                $scope.dataObj[i].listView = status;
                updateListView(status);
            }
        }
    }
    
    function updateListView(status) {
        $scope.$broadcast('listViewValue', status);
        var value = (status === 'grid') ? 0 :((status === 'list') ? 1 :  2);
        var putObj = {
            'isListViewed' :value,
        };

        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
            .then(function (resp, status, headers) {

            }, function (resp, status, headers, config) {

            });
    }

    $scope.myfavorites = {
        'title': 'My Favorites',
        'open': true,
        'limit': undefined,
        'class_names': 'col-lg-2 col-md-4 col-sm-4 col-xs-6 report-tile',
        'loadmoredisable': favoriteService.loadmoredisable,
        'service': favoriteService,
        'data': favoriteService.reports,
        'listView' : $scope.listViewStatus
    };
    
    function setUserPreference() {
        var personalization = [];
        
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            $scope.setLoading(true);
            $http.get('BITool/home/getUserPersonalization').then(function (response) {
                if(response.data) {
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }
                    
                    if (response.data.isListViewed === null || !response.data.isListViewed) {
                        $localStorage.listViewStatus = 'grid';
                    } else {
                        (response.data.isListViewed === 0) ? $localStorage.listViewStatus = 'grid' : ((response.data.isListViewed === 1)? $localStorage.listViewStatus = 'list': $localStorage.listViewStatus = 'detailed');
                    }
                    
                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $localStorage.personalization = personalization;
                    $localStorage.isMenuCollapsed = (response.data.isMenuCollapsed === 1) ? true : false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $scope.userTheme = $localStorage.userTheme = 'default';                    
                    $scope.listViewStatus = $localStorage.listViewStatus = 'grid';
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed = 0;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus
            $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
        }
    }
    
    function sortList(list, filter) {
        if(filter === 'asc_name') {
            return _.sortBy(list, 'name');
        } else if(filter === 'des_name'){
            return _.sortBy(list, 'name').reverse();
        } else if(filter === 'asc_date'){
            return _.sortBy(list, 'createDate');
        } else {
            return _.sortBy(list, 'createDate').reverse();
        }
    }
    
//    $scope.setListView(false);
}]);
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.reportsMenu
 * @description
 * # reportsMenu
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('reportsMenu', ["$http", "$q", "userDetailsService", "commonService", "$sce", "CONFIG", function reportsMenu($http, $q, userDetailsService, commonService, $sce, CONFIG) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.biGroups = {};
    this.biGroupId = '';
    this.operationalLink = '';
    var groups = [];

    var defer = $q.defer();

    var reports = defer.promise;
    //get user details
    userDetailsService.userPromise.then(function (response) {
        //url to get levels of group user belongs to
        var path = commonService.prepareUserReportDashboardUrl(response[0].emcLoginName);
        $http.get(path).then(function (resp) {
            if ((resp.data.grpLevels === undefined || resp.data.grpLevels === null) || (resp.data.grpLevelMap === undefined || resp.data.grpLevelMap === null)) {
                this.biGroups = [];
                defer.resolve([]);
                return;
            }
            /**
             * @ngdoc property
             * @name myBiApp.reportsMenu.biGroupId
             * @description Group id of user belongs to and will be used in multiple places.
             */
            this.biGroupId = resp.data.grpLevels[0].groupId;
            /**
             * @ngdoc property
             * @name myBiApp.reportsMenu.operationalLink
             * @description operational dashboard Link for user. this link will be used in operational dashboard page.
             */
            this.operationalLink = $sce.trustAsResourceUrl(resp.data.operationalDashboardPage);

            //converts grpLevelMap object values to Array of objects
            var levels = _.map(resp.data.grpLevelMap, function (val) {
                return val;
            });

            //returns all sub array of elements to parent array. ex: [[1,2],[3,4]] converts to [1,2,3,4]
            levels = Array.prototype.concat.apply([], levels);

            /**
             * @ngdoc function
             * @name myBiApp.reportsMenu.formatLevel
             * @description structure array of parent & children to parent -> child -> sub child structure.
             */
            var formatLevel = function (data, levelnumber, parentId) {
                var formateddata = [];
                formateddata = _.chain(data)
                        .filter(function (eachLevelObj) {
                            return eachLevelObj.levelNumber === levelnumber && eachLevelObj.parentLevelId === parentId;
                        })
                        .value();
                if (formateddata.length !== 0) {
                    _.map(formateddata, function (eachItem) {
                        eachItem.collapsed = true;//making each level folder collapse by default
                        eachItem.children = formatLevel(data, levelnumber + 1, eachItem.levelId);
                        return eachItem;
                    });
                }
                else {
                    return [];
                }
                return formateddata;
            };

            var biGroupData = formatLevel(levels, 1, null);
            _.map(biGroupData, function (eachLevel) {
                /*var tileData = pullReportData(eachLevel.children);
                 eachLevel.tiles = Array.prototype.concat.apply([],tileData);*/
                eachLevel.tiles = [];
                eachLevel.loadmoredisable = false;
                return eachLevel;
            });
            if (biGroupData.length > 0) {
                biGroupData[0].collapsed = false;
                if (biGroupData[0].children && biGroupData[0].children.length > 0) {
                    biGroupData[0].children[0].collapsed = false;
                }

            }

            //groups = biGroupData;
            this.biGroups = biGroupData;
            defer.resolve(biGroupData);
        }.bind(this));
    }.bind(this));




    this.all = function () {
        return reports;
    };

    this.getRepots = function () {
        return _.uniq(groups, function (item/*, key, id*/) {
            return item.id;
        });
    };

    this.loadReports = function (groupid, levelid, viewMore) {
        var url = '', enable = true;

        var firstGrp = _.findWhere(this.biGroups, {'levelId': groupid});
        /*_.map(this.biGroups, function(firstLevel){
         _.map(firstLevel.children, function(secondLevel) {
         firstGrp = _.findWhere(secondLevel.children,{'levelId':parseInt(levelid)})
         });
         });*/
        if (viewMore) {
            firstGrp.offset = 1;
        }
        firstGrp.loadmoredisable = true;


        if (!firstGrp.offset) {
            firstGrp.offset = 1;
        }
        userDetailsService.userPromise.then(function (response) {
            if (this.biGroupId === '') {
                return;
            }
            url = commonService.prepareUserReportLevelUrl(response[0].emcLoginName, this.biGroupId,
                    levelid, firstGrp.offset, 10);
            //'BITool/reportDashboard/report/group/'+ groupid +'/'+ firstGrp.offset +'/10 ';

            $http.get(url).then(function (resp) {
                _.map(resp.data.allReportsForDpt, function (report) {
                    report.levelId = levelid;
                    report.reportLinkImg = report.reportLink + '.png';
                    if (report.type) {

                        if (report.type.toLowerCase() === 'pdf') {
                            report.reportLinkImg = 'images/charts/pdf-icon.png';
                            report.iconClass = 'class-pdf';
                        } else if (report.type.toLowerCase() === 'excel') {
                            report.reportLinkImg = 'images/charts/Excel-icon.png';
                            report.iconClass = 'class-excel';
                        } else if (report.type.toLowerCase() === 'webi') {
                            report.reportLinkImg = report.reportLink;
                            report.iconClass = 'class-bobj';
                        } else if (report.type.toLowerCase() === 'tableau') {
                            if (report.refreshStatus === undefined || report.refreshStatus === 'N') {
                                var sourceImg = (report.sourceSystem.toString().indexOf('Enterprise') >= 0) ? report.sourceReportId + "_ent" : report.sourceReportId;
                                report.reportLinkImg = CONFIG.tableauImagesPath + encodeURIComponent(report.functionalArea) + '/' + sourceImg + '.png';
                            }
                        }
                    }
                    return report;
                });
                if (enable && resp.data.allReportsForDpt.length === 10) {
                    firstGrp.loadmoredisable = false;


                }

                if (firstGrp.offset === 1) {
                    firstGrp.tiles = resp.data.allReportsForDpt;
                }
                else {
                    Array.prototype.push.apply(firstGrp.tiles, resp.data.allReportsForDpt);
                }
                firstGrp.offset += 10;

            }.bind(this));

        }.bind(this));
    };
}]);
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.newsService
 * @description
 * # newsService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('newsService', ["$http", "commonService", function newsService($http, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var news = $http.get(commonService.prepareGetNewsUrl(1, 5)).then(function (resp) {
        return resp.data;
    });

    return news;
}]);
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.reportSummaryService
 * @description
 * # reportSummaryService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('reportSummaryService', ["$q", "$http", "commonService", "userDetailsService", "CONFIG", function reportSummaryService($q, $http, commonService, userDetailsService, CONFIG) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.getReportSummary = function () {
        var defer = $q.defer(), reportSummary = defer.promise;
        userDetailsService.userPromise.then(function (response) {
            var url = commonService.prepareUserReportSummaryUrl(response[0].emcLoginName);
            $http.get(url).then(function (resp) {
                var data = _.chain(resp.data)
                        .pick('mostViewedReports', 'favoriteReports', 'recentViewedReports')
                        .mapObject(function (eachGrp) {
                            return _.map(eachGrp, function (eachReport) {
                                eachReport.levelId = 1;
                                eachReport.reportLinkImg = eachReport.reportLink + '.png';
                                eachReport.iconClass = 'class-tableau';
                                if (eachReport.type) {

                                    if (eachReport.type.toLowerCase() === 'pdf') {
                                        eachReport.reportLinkImg = 'images/charts/pdf-icon.png';
                                        eachReport.iconClass = 'class-pdf';
                                    } else if (eachReport.type.toLowerCase() === 'excel') {
                                        eachReport.reportLinkImg = 'images/charts/Excel-icon.png';
                                        eachReport.iconClass = 'class-excel';
                                    } else if (eachReport.type.toLowerCase() === 'webi') {
                                        eachReport.reportLinkImg = eachReport.reportLink;
                                        eachReport.iconClass = 'class-bobj';
                                    } else if (eachReport.type.toLowerCase() === 'tableau') {
                                        if (eachReport.refreshStatus === undefined || eachReport.refreshStatus === 'N') {
                                            var sourceImg = (eachReport.sourceSystem.toString().indexOf('Enterprise') >= 0) ? eachReport.sourceReportId + "_ent" : eachReport.sourceReportId;
                                            eachReport.reportLinkImg = CONFIG.tableauImagesPath + encodeURIComponent(eachReport.functionalArea) + '/' + sourceImg + '.png';
                                        } else if (eachReport.refreshStatus && eachReport.refreshStatus === 'Y') {
                                            eachReport.reportLinkImg = eachReport.reportLinkImg.replace('#/site', 't');
                                        }
                                    }
                                }
                                return eachReport;
                            });
                        })
                        .value();
                defer.resolve(data);
            });
        });

        return reportSummary;
    };
}]);
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.carouselService
 * @description
 * # carouselService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('carouselService', ["$q", "$http", "userDetailsService", "commonService", function carouselService($q, $http, userDetailsService, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var defer = $q.defer(), carousel = defer.promise;
    userDetailsService.userPromise.then(function (response) {
        var url = commonService.prepareUserCommunicationUrl(response[0].emcLoginName);
        $http.get(url).then(function (resp) {
            defer.resolve(resp.data);
        });
    });

    return carousel;
}]);

'use strict';

/**
 * @ngdoc service
 * @name myBiApp.profileService
 * @description
 * # profileService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('profileService', function profileService() {
    // AngularJS will instantiate a singleton by calling "new" on this function
});

'use strict';

/**
 * @ngdoc service
 * @name myBiApp.popularSearchService
 * @description
 * # popularSearchService
 * Execute popular search webservice and return list of popular search's.
 */
angular.module('myBiApp')
.service('popularSearchService', ["$http", "WEBSERVICEURL", "$state", "$rootScope", function popularSearchService($http, WEBSERVICEURL, $state, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return $http.get(WEBSERVICEURL.popularSearch).then(function (resp) {
        _.map(resp.data, function (eachItem) {
            eachItem.text = eachItem.searchString;
            eachItem.weight = eachItem.searchCount;
            eachItem.handlers = {click: function () {
                angular.element('.color-white').triggerHandler('click');    
                if($rootScope.searchin === 'persona' || !$rootScope.searchin) {
                    $state.go('search', {'searchText': eachItem.searchString, 'persona': 'Y'});
                } else {
                    $state.go('search', {'searchText': eachItem.searchString, 'persona': 'N'});
                }
            }};
            return eachItem;
        });
        return resp.data;
    });
}]);

'use strict';

/**
 * @ngdoc service
 * @name myBiApp.WEBSERVICEURL
 * @description List of All webservices listed here
 * # WEBSERVICEURL
 * Constant in the myBiApp.
 */
angular.module('myBiApp')
.constant('WEBSERVICEURL', {
    'getUserDetails'        : 'BITool/getUserDetails',//
    'userInfo'              : 'BITool/userinfo/:username',//
    'userPersona'           : 'BITool/userExistInBITool',//
    'dashboard'             : 'BITool/dashboard/:username',//
    'updateFavorite'        : 'BITool/report/updateFavorite/:username/',//
    'favoriteRepots'        : 'BITool/favoriteReports/:username/:offset/:limit',//
    'reportByID'            : 'BITool/report/id/:username/:reportid',//
    'reportByIDSearch'      : 'BITool/report/id/:username/:sourceReportId/:sourceSystemName',//
    'reportTileBigroup'     : 'BITool/reportTile/tile/MyBIRoleSFDC/biGroup',//
    'reportTileRoles'       : 'BITool/reportTile/tile/MyBIRoleSFDC/roles',//
    'reportTileAdd'         : 'BITool/reportTile/reportDashboard/addMyBIReportLink',//
    'homeBanner'            : 'BITool/communication/:username',//
    'getNews'               : 'BITool/getNews/:offset/:limit',//
    'popularSearch'         : 'BITool/popularSearch',//
    'reportDashboard'       : 'BITool/reportDashboard/:username',//
    'reportDashboardLevel'  : 'BITool/reportDashboard/report/level/:username/:groupid/:levelid/:offset/:limit',
    'reportDashboardGroup'  : 'BITool/reportDashboard/report/group/:username/:groupid/:offset/:limit',
    'reportSummary'         : 'BITool/report/reportSummary/:username',//
    'searchReports'         : 'BITool/userSearch/allReports/:username/:offset/:limit?searchText=:texttobesearched',
    'searchReportsFilter'   : 'BITool/userSearch/allReports/:username/:offset/:limit?:filter=:texttobesearched',
    'searchReportsPersona'  : 'BITool/searchReports/persona/:username/:offset/:limit?searchText=:texttobesearched',
    'searchReportsPersonaFilter'  : 'BITool/searchReports/persona/:username/:offset/:limit?:filter=:texttobesearched',
    'userSearchallReports'  : 'BITool/userSearch/allReports/:username/:offset/:limit?searchText=:texttobesearched',
    'userSearchallReportsFilter'  : 'BITool/userSearch/allReports/:username/:offset/:limit?:filter=:texttobesearched',
    'feedbackPost'          : 'BITool/addFeedback',
    'feedbackList'          : 'BITool/reportFeedbacks/:reportId',
    'metadataWork'          : 'BITool/home/getBIReportMetadata/:offset/:limit?sourceSystem=:sourceSystem&workbookId=:workbookId&sourceReportId=:sourceReportId&isAllRecords=true',
    'metadata'              : 'BITool/home/getBIReportMetadata/:offset/:limit?sourceReportId=:sourceReportId&sourceSystem=:sourceSystem&isAllRecords=true',
    'reportAccess'          : 'BITool/reportAccess/:reportId',
    'reportAccessSearch'    : 'BITool/reportAccess/:sourceReportId/:sourceSystemName',
    /*'userProfilePic'      : 'https://ssgosgdev.isus.emc.com/dev/image-api/v1.0/images/:entityId?apikey=l7xx475c903f220c4aa2a0c1259a89afe4a8'//*/
    //this not an ajax call and '/' is not appended from app.js. So appended '/' to work same in www folder also
    'userProfilePic'        : '/BITool/getEmployeeImage/:entityId',
    'getTableauToken'       : 'BITool/getTrustedTicket/:username/:servername/:siteid',
    'addSearchTerm'         : 'BITool/addSearch',
    'updateReportViewed'    : 'BITool/report/updateReportViewed/:username/:sourceReportId/:sourceSystemName?type=:type'
});
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.commonService
 * @description
 * # commonService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
  .service('commonService', ["WEBSERVICEURL", function commonService(WEBSERVICEURL) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    /**
    *prepare the user profile Url
    */
    this.prepareUserProfilePicUrl = function(entityId)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.userProfilePic, {'entityId':entityId});   
    };
    
    /**
    *prepare the user Info Url
    */
    this.prepareUserInfoUrl = function(username)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.userInfo, {'username':username});   
    };
    
    /**
    *prepare the user communication Url
    */
    this.prepareUserCommunicationUrl = function(username)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.homeBanner, {'username':username});   
    };
    
    /**
    *prepare the user Report Summary Url
    */
    this.prepareUserReportSummaryUrl = function(username)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportSummary, {'username':username});   
    };
    
    /**
    *prepare the user Report by ID Url
    */
    this.prepareUserReportUrl = function(username, reportid)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportByID, {'username':username, 'reportid':reportid});   
    };
    
    /**
    *prepare the user Report by ID Url for search
    */
    this.prepareUserReportUrlSearch = function(username, sourceReportId, sourceSystemName)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportByIDSearch, {'username':username, 'sourceReportId':sourceReportId, 'sourceSystemName':sourceSystemName});   
    };
    
    /**
    *prepare the user reports from Level Url
    */
    this.prepareUserReportLevelUrl = function(username, groupid, levelid, offset, limit)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportDashboardLevel, {'username':username, 'groupid':groupid, 'levelid':levelid, 'offset':offset, 'limit':limit});   
    };
    
    /**
    *prepare the group reports Url
    */
    this.prepareGroupReportUrl = function(username, groupid, offset, limit)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportDashboardGroup, {'username':username, 'groupid':groupid, 'offset':offset, 'limit':limit});   
    };
    
    /**
    *prepare the user Role Details Url
    */
    this.prepareUserRoleDetailsUrl = function(username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.dashboard, {'username':username});
    };
    
    /**
    *prepare the user report Dashboard Url
    */
    this.prepareUserReportDashboardUrl = function(username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportDashboard, {'username':username});
    };
    
    /**
    *prepare the user update Favorite Url
    */
    this.prepareUserUpdateFavoriteUrl = function(username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.updateFavorite, {'username':username});
    };
    
    /**
    *prepare the favorite Reports Url
    */
    this.prepareFavoriteReportUrl = function(username, offset, limit) {
        return  this.replaceStringWithValues(WEBSERVICEURL.favoriteRepots, {'username':username, 'offset':offset, 'limit':limit});
    };
    
    /**
    *prepare the Search Url
    */
    this.prepareSearchUrl = function(username, offset, limit, texttobesearched) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReports, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched});
    };
    
    /**
    *prepare the Search Url with Filter
    */
    this.prepareSearchUrlFilter = function(username, offset, limit, texttobesearched, filter) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReportsFilter, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched, 'filter':filter});
    };
    
    /**
    *prepare the Search Url for persona
    */
    this.prepareSearchUrlPersona = function(username, offset, limit, texttobesearched) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReportsPersona, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched});
    };
    
    /**
    *prepare the Search Url for persona with Filter
    */
    this.prepareSearchUrlPersonaFilter = function(username, offset, limit, texttobesearched, filter) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReportsPersonaFilter, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched, 'filter':filter});
    };
    
    /**
    *prepare the Search Url for persona
    */
    this.prepareUserSearchUrlReports = function(username, offset, limit, texttobesearched) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userSearchallReports, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched});
    };
    
    /**
    *prepare the Search Url for persona with Filter
    */
    this.prepareUserSearchUrlReportsFilter = function(username, offset, limit, texttobesearched, filter) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userSearchallReportsFilter, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched, 'filter':filter});
    };
    
    /**
    *prepare the get News Url
    */
    this.prepareGetNewsUrl = function(offset, limit) {
        return  this.replaceStringWithValues(WEBSERVICEURL.getNews, {'offset':offset, 'limit':limit});
    };
    
    /**
    *prepare the get Feedback Url
    */
    this.prepareFeedbackUrl = function(reportId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.feedbackList, {'reportId':reportId});
    };

    /**
    *prepare the get Metadata Url
    */
    this.prepareMetaDataUrl = function(offset, limit, sourceReportId, sourceSystem) {
        return  this.replaceStringWithValues(WEBSERVICEURL.metadata, {'offset':offset, 'limit':limit, 'sourceReportId':sourceReportId, 'sourceSystem':sourceSystem});
    };
    
    /**
    *prepare the get Metadata Url
    */
    this.prepareMetaDataUrlWork = function(offset, limit, sourceSystem, workbookId, sourceReportId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.metadataWork, {'offset':offset, 'limit':limit, 'sourceSystem':sourceSystem, 'workbookId':workbookId, 'sourceReportId':sourceReportId});
    };
    
    /**
    *prepare the get Report Access Url
    */
    this.prepareReportAccessUrl = function(reportId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportAccess, {'reportId':reportId});
    };
    
    /**
    *prepare the get Report Access Url
    */
    this.prepareReportAccessUrlSearch = function(sourceReportId, sourceSystemName) {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportAccessSearch, {'sourceReportId':sourceReportId, 'sourceSystemName':sourceSystemName});
    };
    
    /**
    *prepare the get Report Access Url
    */
    this.preparegGetTableauTokenUrl = function(username, servername, siteid) {
        return  this.replaceStringWithValues(WEBSERVICEURL.getTableauToken, {'username':username, 'servername':servername,'siteid':siteid});
    };
 
    /**
    *prepare the Add Search Term Url
    */
    this.prepareAddSearchTermUrl = function() {
        return WEBSERVICEURL.addSearchTerm;
    };
  
    /**
    *prepare the Update Report Viewed Url
    */
    this.prepareUpdateReportViewedUrl = function(username, sourceReportId, sourceSystemName, type) {
        return  this.replaceStringWithValues(WEBSERVICEURL.updateReportViewed, {'username':username, 'sourceReportId':sourceReportId, 'sourceSystemName':sourceSystemName, 'type':type});
    };
    
    /**
    *prepare the Get User Persona Info Url
    */
    this.prepareGetUserPersonaInfoUrl = function() {
        return WEBSERVICEURL.userPersona;
    };
    
    /** 
    *Replace matching object keys in string with its values.
    */
    this.replaceStringWithValues = function(rString, replaceObject) {
        _.map(_.keys(replaceObject), function(key){
            rString = rString.replace(new RegExp(':'+key,'g'), replaceObject[key]);
        });
      return rString;  
    };
}]);

'use strict';

/**
 * @ngdoc service
 * @name myBiApp.userDetailsService
 * @description
 * # userDetailsService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('userDetailsService', ["WEBSERVICEURL", "$http", "$q", "commonService", "$rootScope", function userDetailsService(WEBSERVICEURL, $http, $q, commonService, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var userObject, userPromise = $q.defer();
    $http.get(WEBSERVICEURL.getUserDetails).then(function (resp) {
        userObject = resp.data;
        $http.get(commonService.prepareUserInfoUrl(userObject[0].emcLoginName)).then(function (response) {
            userObject[0].userinfo = response.data;
            userPromise.resolve(userObject);
        });
        if(!$rootScope.personaInfo) {
            $http.get(commonService.prepareGetUserPersonaInfoUrl()).then(function (response) {
                userObject[0].personaInfo = response.data;
                userPromise.resolve(userObject);
            }); 
        } else {
            userObject[0].personaInfo = $rootScope.personaInfo;
        }
    });
    return {
        'userObject': userObject,
        'userPromise': userPromise.promise,
    };
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ProfileCtrl', ["$scope", "$localStorage", "userDetailsService", "commonService", "CONFIG", "$http", "$timeout", "reportsMenu", function ($scope, $localStorage, userDetailsService, commonService, CONFIG, $http, $timeout, reportsMenu) {
    $scope.setLoading(true);
    $scope.$emit('setNavBar', true);
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    if(!$scope.userObject) {
        userDetailsService.userPromise.then(function (response) {
            $scope.setLoading(false);
            $scope.userObject = response[0];
            $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
            setUserLevel($scope.userObject);
            setUserPreference();
        });
    } else {
        setUserLevel($scope.userObject);
        setUserPreference();
        $scope.setLoading(false);
    }
    
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

            $scope.userBadgeImage = "images/"+$scope.myLevel+"-badge.png";
            $localStorage.myLevel = $scope.myLevel
            $scope.$emit('myLevelIndication', $scope.myLevel);
        } else {
            $scope.myLevel = $localStorage.myLevel;
            $scope.userBadgeImage = "images/"+$scope.myLevel+"-badge.png";
            $scope.$emit('myLevelIndication', $scope.myLevel);
        }
    }
    
    function setUserPreference() {
        var personalization = [];
        
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            $scope.setLoading(true);
            $http.get('BITool/home/getUserPersonalization').then(function (response) {
                if(response.data) {
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }
                    
                    if (response.data.isListViewed === null || !response.data.isListViewed) {
                        $localStorage.listViewStatus = 'grid';
                    } else {
                        (response.data.isListViewed === 0) ? $localStorage.listViewStatus = 'grid' : ((response.data.isListViewed === 1)? $localStorage.listViewStatus = 'list': $localStorage.listViewStatus = 'detailed');
                    }
                    
                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $localStorage.personalization = personalization;
                    $localStorage.isMenuCollapsed = (response.data.isMenuCollapsed === 1) ? true : false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $scope.userTheme = $localStorage.userTheme = 'default';                    
                    $scope.listViewStatus = $localStorage.listViewStatus = 'grid';
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed = 0;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus
            $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
        }
    }
    
    $scope.setUserTheme = function(theme) {
        if($localStorage.userTheme === theme) {
            return;
        }
        
        $scope.setLoading(true);
        var reportPriorityList = $localStorage.personalization
        var putObj = {
            'userTheme' : findThemeKey(CONFIG.userTheme, theme)
        }
        
        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
            .then(function (resp, status, headers) {
                $localStorage.userTheme = theme;
                $scope.userTheme = $localStorage.userTheme;
                $scope.$emit('myThemeSettings', $localStorage.userTheme, $localStorage.personalization, $localStorage.isMenuCollapsed);
            }, function (resp, status, headers, config) {
            });
        $scope.setLoading(false);    
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
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('HelpSupportCtrl', ["$scope", "$localStorage", "userDetailsService", "commonService", "CONFIG", "$http", function ($scope, $localStorage, userDetailsService, commonService, CONFIG, $http) {
    $scope.setLoading(true);
    $scope.$emit('setNavBar', true);
    
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
            $scope.myLevel = $localStorage.myLevel;
            $scope.userBadgeImage = "images/"+$scope.myLevel+"-badge.png";
            $scope.$emit('myLevelIndication', $scope.myLevel);
        }
    }
    
    function setUserPreference() {
        var personalization = [];
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            $http.get('BITool/home/getUserPersonalization').then(function (response) {
                if(response.data) {
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }

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
            $scope.userTheme = $localStorage.userTheme;
            personalization = $localStorage.personalization;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
    
    $scope.setUserTheme = function(theme) {
        if($localStorage.userTheme === theme) {
            return;
        }
        $scope.setLoading(true);
        var reportPriorityList = $localStorage.personalization
        var putObj = {
            'userId' : $scope.userObject.uid,
            'recommended' :reportPriorityList.indexOf('recentViewedReports')+1,
            'favorite' : reportPriorityList.indexOf('favoriteReports')+1,
            'mostViewed' : reportPriorityList.indexOf('mostViewedReports')+1,
            'userTheme' : findThemeKey(CONFIG.userTheme, theme)
        }
        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
            .then(function (resp, status, headers) {
                $localStorage.userTheme = theme;
                $scope.userTheme = $localStorage.userTheme;
                $scope.$emit('myThemeSettings', $localStorage.userTheme, reportPriorityList);
            }, function (resp, status, headers, config) {
            });
    
        $scope.setLoading(false);    
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
}]);
'use strict';


angular.module('myBiApp').controller('NotificationModalCtrl', ["$scope", "$uibModalInstance", "items", "$http", function ($scope, $uibModalInstance, items, $http) {
    $scope.notificationAlert = items.data;
    
    $scope.dismissAlert = function () {
        $uibModalInstance.close($scope.notificationAlert);
    };
    
    $scope.close = function() {
        $uibModalInstance.dismiss('close');
    };
}]);


angular.module('myBiApp').controller('DeleteNotificationModalCtrl',["$scope", "items", "$uibModalInstance", function($scope,items,$uibModalInstance){
    $scope.items = items;
    $scope.message = '';
    
    $scope.delete = function(){
        $uibModalInstance.close($scope.items);
    };
    
    $scope.cancel = function(){
      $uibModalInstance.dismiss('cancel');  
    };
}]);
'use strict';
/*
 angular.treeview.js
 */
// Code here will be linted with JSHint.
/* jshint ignore:start */

(function (l) {
    l.module('angularTreeview', []).directive('treeModel', ['$compile', function ($compile) {
        return{
            restrict: 'A',
            link: function (a, g, c) {
                var e = c.treeModel,
                    h = c.nodeLabel || 'label',
                    d = c.nodeChildren || 'children',
                    k = '<ul>\n\
                            <li data-ng-repeat="node in ' + e + '" ui-sref-active="active">\n\
                                <div class="parent-div"><span class="first">\n\
                                    <a ui-sref="reports.details({levelId:node.levelId})" ui-sref-active="active" class="collapsed1" data-ng-show="node.' + d + '.length>0 && node.collapsed" data-ng-click="selectNodeHead(node, $event)" >\n\
                                        {{node.' + h + '}}\n\
                                    </a>\n\
                                    <a ui-sref="reports.details({levelId:node.levelId})" ui-sref-active="active" class="expanded1" data-ng-show="node.' + d + '.length>0 && !node.collapsed">\n\
                                        {{node.' + h + '}}\n\
                                    </a>\n\
                                </span>\n\
                                <span class="second">\n\
                                    <i class="collapsed" data-ng-show="node.' + d + '.length>0 && node.collapsed" data-ng-click="selectNodeHead(node, $event)"></i>\n\
                                    <i class="expanded" data-ng-show="node.' + d + '.length>0 && !node.collapsed" data-ng-click="selectNodeHead(node, $event)"></i>\n\
                                </span>\n\
                                </div>\n\
                                <div class="child-div">\n\
                                    <span class="first">\n\
                                        <a ui-sref="reports.details({levelId:node.levelId})" ui-sref-active="active" data-ng-hide="node.' + d + '.length">\n\
                                            <div>\n\
                                                <span class="normal1" data-ng-hide="node.' + d + '.length" >\n\
                                                    {{node.' + h + '}}\n\
                                                </span>\n\
                                            </div>\n\
                                        </a>\n\
                                    </span>\n\
                                    <span class="second" data-ng-show="node.' + d + '.length>0">\n\
                                        <i class="normal" data-ng-hide="node.' + d + '.length>0" value="node.' + d + '.length > 0"></i>\n\
                                    </span>\n\
                                </div>\n\
                                <div class="collapse" uib-collapse="node.collapsed" data-tree-model="node.' + d + '" data-node-id=' + (c.nodeId || 'id') + ' data-node-label=' + h + ' data-node-children=' + d + '></div>\n\
                            </li>\n\
                        </ul>';
                e && e.length && (c.angularTreeview ? (a.$watch(e, function (m, b) {
                    g.empty().html($compile(k)(a));
                }, !1), a.selectNodeHead = a.selectNodeHead || function (a, b) {
//                    b.stopPropagation && b.stopPropagation();
//                    b.preventDefault && b.preventDefault();
                    b.cancelBubble = !0;
                    b.returnValue = !1;
                    a.collapsed = !a.collapsed
                }, a.selectNodeLabel = a.selectNodeLabel || function (c, b) {
                    b.stopPropagation && b.stopPropagation();
                    b.preventDefault && b.preventDefault();
                    b.cancelBubble = !0;
                    b.returnValue = !1;
                    a.currentNode && a.currentNode.selected && (a.currentNode.selected = void 0);
                    c.selected = "selected";
                    a.currentNode = c
                }) : g.html($compile(k)(a)));
            }
        }
    }])
})(angular);

// Code here will be linted with ignored by JSHint.
/* jshint ignore:end */

'use strict';

/**
 * @ngdoc service
 * @name myBiApp.userAlertService
 * @description
 * # userAlertService
 * This service is used to alert any messages in project & modal/popup functionality
 */
angular.module('myBiApp')
.service('userAlertService', ["$rootScope", "$uibModal", "$window", "$localStorage", function userAlertService($rootScope, $uibModal, $window, $localStorage) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var ModalInstanceCtrl = function ($scope, $uibModalInstance, $uibModal, modalContent) {
        $scope.modalContent = modalContent;

        $scope.ok = function () {
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };

    ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', '$uibModal', 'modalContent'];

    function showUserAlert(args) {
        var opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            size: 'sm',
            templateUrl: 'views/useralert.html',
            controller: ModalInstanceCtrl,
            windowClass: 'Css-Center-Modal',
            resolve: {} // empty storage
        };

        opts.resolve.modalContent = function () {
            return angular.copy(args); // pass name to resolve storage
        };
        
        var modalInstance = $uibModal.open(opts);
        modalInstance.result.then(function () {
            args.ok.callback();
        }, function () {       //on cancel button press
            args.cancel.callback();
        });
    }
    
    function RefreshSSO(args) {
        $window.location.reload();
    }

    // This event need not be broadcasted from directuve which aren't in an isolated 
    // scope (UserAlertCtrl is used as a Global Controller like CommonCtrl ).
    // This Event handler is needed for isolated scope directives, if broadcasted from $rootScope.
    $rootScope.$on('ShowUserAlert', function (event, args) {
        showUserAlert(args);
        $rootScope.setLoading(false);
    });
    
    $rootScope.$on('RefreshSSO', function (event, args) {
        RefreshSSO(args);
        $rootScope.setLoading(false);
    });

    return {
        'showUserAlert': showUserAlert,
        'RefreshSSO': RefreshSSO
    };
}]);
'use strict';

/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTiles
 * @description
 * # loadTiles
 * Helps to load tiles in grid layout.
 * Usage: <load-tiles  tilesData="array of tile objects" userLoginName="emcloginname"></load-tiles>
 */

/*jshint sub:true*/
/*Used to avoid jshint warning for "obj['name'] is better written in dot notation" */
angular.module('myBiApp')
.directive('loadTiles', function () {
    return {
        templateUrl: 'views/tilesPage.html',
        restrict: 'E',
        replace: 'false',
        controller: 'tilesController',
        scope: {
            tilesData: '=',
            userLoginName: '@',
            onMovePanelTo: '&',
            listView: '&'
        },
        link: function postLink(scope/*, element, attrs*/) {
            scope.$watch('tilesData', function (value) {
                scope['panel'] = value;
            });
        }
    };
})
/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTilesInfinite
 * @description
 * # loadTilesInfinite
 * Helps to load tiles with infinite scroll flag/directive.
 * Usage: <load-tiles-infinite  tilesData="array of tile objects" userLoginName="emcloginname"></load-tiles-infinite>
 */
.directive('loadTilesInfinite', function () {
    return {
        templateUrl: 'views/tilesPageInfinite.html',
        restrict: 'E',
        controller: 'tilesController',
        scope: {
            tilesData: '=',
            userLoginName: '@',
            onMovePanelTo: '&',
            listView: '&'
        },
        link: function postLink(scope/*, element, attrs*/) {
            scope.$watch('tilesData', function (value) {
                scope['panel'] = value;
            });
            scope.$on('sortFilterReportsBroadCast', function(event, sort, filter, option) {
                sortReportWithOption(sort);
                filterReportsWithOption(filter);
            });
            
            function sortReportWithOption(sort) {
                if(sort === 'ascName') {
                    scope.panel.service.reports = sortList(scope.panel.service.reports, 'name', 'ascName', 1);
//                    scope.panel.service.reports = _.sortBy(scope.panel.service.reports, 'name');
                } else if(sort === 'desName'){
                    scope.panel.service.reports = sortList(scope.panel.service.reports, 'name', 'desName', -1);
//                    scope.panel.service.reports = _.sortBy(scope.panel.service.reports, 'name').reverse();
                } else if(sort === 'ascCDate'){
                    scope.panel.service.reports = _.sortBy(scope.panel.service.reports, 'createdDate');
                } else if(sort === 'desCDate'){
                    scope.panel.service.reports = _.sortBy(scope.panel.service.reports, 'createdDate').reverse();
                } else if(sort === 'mostViewed'){
                    scope.panel.service.reports = _.sortBy(scope.panel.service.reports, 'viewCount').reverse();
                } else if(sort === 'recenltyAdded'){
                    scope.panel.service.reports = _.sortBy(scope.panel.service.reports, 'provisionedDate').reverse();
                }
            }
            
            function sortList(list, sortBy, order, Num) {
                list.sort(function(a, b){
                    var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                    if (nameA < nameB) //sort string ascending
                        return -Num;
                    if (nameA > nameB)
                        return Num;
                    return 0; //default return value (no sorting)
                });
                return list;
            }
            
            function filterReportsWithOption(filter) {
                if(filter === 'bobjReports'){
                    scope.reportFlagType = 'Webi';
                    scope.sortReportCounts = getReportCount('Webi', scope.panel.service.reports);
                } else if(filter === 'tableauReports'){
                    scope.reportFlagType = 'Tableau';
                    scope.sortReportCounts = getReportCount('Tableau', scope.panel.service.reports);
                } else if(filter === 'externalReports'){
                    scope.reportFlagType = 'HTTP';
                    scope.sortReportCounts = getReportCount('HTTP', scope.panel.service.reports);
                } else {
                    scope.panel.service.reports = scope.panel.service.reports;
                    scope.reportFlagType = '';
                    scope.sortReportCounts = '';
                }
            }
            
            function getReportCount(reportType, report) {
                var sortReport = [];
                _.each(report, function(row){
                    if(row.type === reportType) {
                        sortReport.push(row);
                    }
                });
                return sortReport.length;
            }
        }
    };
})

/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTilesInfiniteSearch
 * @description
 * # loadTilesInfiniteSearch
 * Helps to load tiles with infinite scroll flag/directive in search page.
 * Usage: <load-tiles-infinite-search  tilesData="array of tile objects" userLoginName="emcloginname"></load-tiles-infinite-search>
 */
.directive('loadTilesInfiniteSearch', function () {
    return {
        templateUrl: 'views/tilesPageInfinite.search.html',
        restrict: 'E',
        controller: 'tilesController',
        scope: {
            tilesData: '=',
            userLoginName: '@',
            keyword: '@',
            listView: '&'
        },
        link: function postLink(scope/*, element, attrs*/) {
            scope.$watch('tilesData', function (value) {
                scope['panel'] = value;

            });
        }
    };
})

/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTileImage
 * @description
 * # loadTileImage
 * Helps to load tile image/iframe for a tile based on report type.
 * Usage: <load-tile-image></load-tile-image>
 */
.directive('loadTileImage', ["$compile", "$sce", "$timeout", function ($compile, $sce, $timeout/*, $http, commonService, userDetailsService*/) {
    return {
        template: '<div></div>',
        replace: true,
        link: function (scope, element/*, attrs*/) {
            var template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}}), url(images/charts/not-found.png)\'}"></div>';
            var ele;
            scope.iconClass = 'icon-default';
            scope.externalReport = false;
            scope.externalUrl = false;
            scope.toolbarPos = 'H';
            scope.openNewTabUrl = '';
            if (scope.report.type.toLowerCase() === 'tableau') {
                if (scope.report.isHeaderFlag === 0) {
                    scope.openNewTabUrl = scope.report.reportLink+'?Header Flag=0&';
                } else {
                    scope.openNewTabUrl = scope.report.reportLink+ '?';
                }
                if (scope.report.displayType === 'B') {
                    scope.openNewTabUrl = scope.openNewTabUrl+":embed=y&:showVizHome=n&:apiID=handler0&:toolbar=bottom";
                } else if (scope.report.displayType === 'T') {
                    scope.openNewTabUrl = scope.openNewTabUrl+":embed=y&:showVizHome=n&:apiID=handler0&:toolbar=top";
                } else if(scope.report.displayType && scope.report.displayType === 'H') {
                    scope.openNewTabUrl = scope.openNewTabUrl+":embed=y&:showVizHome=n&:apiID=handler0&:toolbar=no";
                } else {
                    scope.openNewTabUrl = scope.openNewTabUrl+":embed=y&:showVizHome=n&:apiID=handler0&:toolbar=no";
                }
                if(scope.report.tabbedViews === 'Y') {
                    scope.openNewTabUrl = scope.openNewTabUrl+'&:tabs=y';
                } else {
                    scope.openNewTabUrl = scope.openNewTabUrl+'&:tabs=n';
                }
            } else { 
                scope.openNewTabUrl = scope.report.reportLink;
            }
            if (scope.report.sourceSystem === 'EXTERNAL') {
                scope.externalReport = true;
                (scope.report.displayType == 'N') ? scope.externalUrl = true : scope.externalUrl = false;
                var bg = (scope.report.additionalInfo && scope.report.additionalInfo.indexOf('#') > -1) ? 'style = background-color:' + scope.report.additionalInfo : '';
                var Desc = (scope.report.reportDesc) ? scope.report.reportDesc : '';
                template = '<div class="panel-heading" ng-class="report.externalClass" ' + bg + '>' +
                        '<p class="external-reportName">' + scope.report.name + '</p>' +
                        '<p class="external-reportDesc">' + Desc + '</p>' +
                        '</div>';
                ele = $compile(template)(scope);
                element.replaceWith(ele);
                element = ele;
            } else {
                (scope.report.displayType == 'T') ? scope.toolbarPos = 'T' : ((scope.report.displayType == 'B')? scope.toolbarPos = 'B' : scope.toolbarPos = 'H');
                /* report type 'webi' & RefreshStatus is Y tile should be loaded with bobj report in iframe*/
                if (scope.report.type && scope.report.type.toLowerCase() === 'webi' && scope.report.refreshStatus === 'Y') {
                    scope.report.iframeUrl = $sce.trustAsResourceUrl(scope.report.reportLinkImg);
                    scope.iconClass = 'icon-webi';    
                    $timeout(function () {
                        //sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                        var sandbox = '';
                        var templateIframe = '<iframe width="1000" height="1224" ng-src="{{report.iframeUrl}}"  style="';
                        var style = '-webkit-transform: scale({}); -webkit-transform-origin: 0 0; -ms-transform: scale({}); -ms-transform-origin: 0 0; -webkit-transform: scale({}); -webkit-transform-origin: 0 0; -moz-transform: scale({}); -moz-transform-origin: 0 0; transform: scale({});transform-origin: 0 0;width:1000px;height:1224px;';
                        var scaleVal = parseInt(element.parent()[0].offsetWidth) / 1000;
                        var find = '{}';
                        var re = new RegExp(find, 'g');
                        style = style.replace(re, scaleVal);

                        //Based sri request adding sandbox / iframe breakout flag based on sourcesystem of bobj
                        if (scope.report.sourceSystem && scope.report.sourceSystem.toLowerCase() === 'baaas prd') {
                            sandbox = 'sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"';
                        }

                        templateIframe = templateIframe + style + '" ' + sandbox + '></iframe>';
                        ele = $compile(templateIframe)(scope);
                        element.replaceWith(ele);

                    }, 500);

                } else if (scope.report.type && (scope.report.type.toLowerCase() === 'pdf' || scope.report.type.toLowerCase() === 'excel' || scope.report.type.toLowerCase() === 'webi')) {
                    if (scope.report.type.toLowerCase() === 'webi') {
                        scope.iconClass = 'icon-webi';
                        scope.report.reportLinkImg = 'images/charts/bobj-icon.png';
                    }
                    template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}})\'}"></div>';
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                    element = ele;

                } else if (scope.report.type && (scope.report.type.toLowerCase() === 'visilums')) {
                    if (scope.report.type.toLowerCase() === 'visilums') {
                        scope.iconClass = 'icon-visilums';
                        scope.report.reportLinkImg = 'images/charts/Lumira.png';
                    }
                    template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}})\'}"></div>';
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                    element = ele;

                } else if (scope.report.type && (scope.report.type.toLowerCase() === 'tableau') /*&& scope.report.refreshStatus === 'Y'*/) {
                    scope.iconClass = 'icon-tableau';
                    template = '<div class="panel-heading class-pdf"  ng-style="{\'background-image\':\'url(images/charts/loading-icon.gif)\', \'background-size\':\'auto\'}"></div>';
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                    element = ele;
                    var img = new Image();
                    img.src = scope.report.reportLinkImg;
                    img.onload = function () {
                        template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}})\'}"></div>';
                        ele = $compile(template)(scope);
                        element.replaceWith(ele);
                        element = ele;
                    };
                    img.onerror = function () {
                        template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url(images/charts/not-found.png)\'}"></div>';
                        ele = $compile(template)(scope);
                        element.replaceWith(ele);
                        element = ele;
                    };
                } else {
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                }
            }
        }
    };
}])

/**
 * @ngdoc function
 * @name myBiApp.controller:tilesController
 * @description
 * # tilesController
 * Controller of the tiles. 
 */
.controller('tilesController', ["$scope", "commonService", "$http", "userDetailsService", "CONFIG", "$sce", "$window", function ($scope, commonService, $http, userDetailsService, CONFIG, $sce, $window) {
    $scope.mobileDevice = ($window.innerWidth < 768) ? true: false;
    $scope.panel = $scope.tilesData;
    $scope.$watch('panel.data', function (value) {
        _.map(value, function (report) {
            report.reportLinkImg = report.reportLink + '.png';
            report.iconClass = 'class-tableau';
            if (report.type === undefined && report.reportType !== undefined) {
                report.type = report.reportType;
            }
            if (report.type) {
                if (report.type.toLowerCase() === 'pdf') {
                    report.reportLinkImg = 'images/charts/pdf-icon.png';
                    report.iconClass = 'class-pdf';
                } else if (report.type.toLowerCase() === 'excel') {
                    report.reportLinkImg = 'images/charts/Excel-icon.png';
                    report.iconClass = 'class-excel';
                } else if (report.type.toLowerCase() === 'webi') {
                    report.reportLinkImg = report.reportLink;
                    report.iconClass = 'class-bobj';
                } else if (report.type.toLowerCase() === 'tableau') {
                    if (report.refreshStatus === undefined || report.refreshStatus === 'N') {
                        var sourceImg = (report.sourceSystem.toString().indexOf('Enterprise')>= 0) ? report.sourceReportId + "_ent" : report.sourceReportId;
                        report.reportLinkImg = CONFIG.tableauImagesPath + encodeURIComponent(report.functionalArea) + '/' + sourceImg + '.png';
                        //report.reportLinkImg = CONFIG.tableauImagesPath+encodeURIComponent(report.functionalArea)+'/'+report.sourceReportId+'.png';
                    } else if (report.refreshStatus && report.refreshStatus === 'Y') {
                        report.reportLinkImg = report.reportLinkImg.replace('#/site', 't');
                        if($scope.mobileDevice && report.isMobileEnabled === 'N') {
                            report.reportLinkImg ='';
                        }
                    }
                }
            }
        });

        $scope.isLastItem = true;
        $scope.isFirstItem = true;

        if ($scope.panel) {
            if (typeof ($scope.panel.indexData) != 'undefined') {
                $scope.isLastItem = eval($scope.panel.indexData.curr + 1 === $scope.panel.indexData.total);
                $scope.isFirstItem = eval($scope.panel.indexData.curr === 0);
                $scope.$watch('panel.indexData.curr', function () {
                    $scope.isLastItem = eval($scope.panel.indexData.curr + 1 === $scope.panel.indexData.total);
                    $scope.isFirstItem = eval($scope.panel.indexData.curr === 0);
                });
            }
            if ($scope.panel.viewMoreUiLink && $scope.panel.viewMoreUiLink !== undefined) {
                $scope.viewMoreLink = ($scope.panel.viewMoreUiLink === 'reports.list') ? 'View more available reports' : 'View more';
            }
        }
    });

    $scope.collapseOpen = function (tileName) {
        $scope.panel.open = !$scope.panel.open;
        
        if(tileName) {            
            userDetailsService.userPromise.then(function(userObj) {
                var putObj = '';
                
                if(tileName === 'Recommended Reports') {
                    putObj = {
                        'userId' : userObj[0].uid,
                        'isRecommendedCollapsed' : ($scope.panel.open === false) ? 1 : 0
                    };
                } else if(tileName === 'Favorite Reports') {
                    putObj = {
                        'userId' : userObj[0].uid,
                        'isFavoriteCollapsed' : ($scope.panel.open === false) ? 1 : 0
                    };
                } else if(tileName === 'Most Viewed Reports') {
                    putObj = {
                        'userId' : userObj[0].uid,
                        'isMostViewedCollapsed' : ($scope.panel.open === false) ? 1 : 0
                    };
                }
                
                $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                    .then(function (resp, status, headers) {

                    }, function (resp, status, headers, config) {

                    });
            });
        }
    };
    
    $scope.highlight = function(text, search) {
        if (!search) {
            return $sce.trustAsHtml(text);
        }
        var lowerText = (text) ? text.toLowerCase(): '';
        var lowerSearch =(search) ? search.toLowerCase(): '';
        if(lowerText.search(lowerSearch) >= 0 ) {
            return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>'));
        } else {
            return $sce.trustAsHtml(text);
        }
    };
    
    $scope.showIcons = false;
    
    $scope.showHideIcon = function(status, id) {
        if (id) {
            if(status === true) {
                $scope.showIcons = status+id;
            } else {
                $scope.showIcons = false;
            }
        }
    };
    
    $scope.loadReport = function(report) {
        var url;
        
        if(report.type === 'HTTP') {
            url = report.reportLink;
            var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl($scope.userLoginName, report.sourceReportId, report.sourceSystem, 'Persona');
            $http.get(reportUpdateViewed);
        } else {
            url = 'BITool/admin/externalrepo/downloadreport/'+report.sourceReportId;
        }
        
        $window.open(url, '_blank');
    };
    
    $scope.changeFavorite = function (report, index, items) {
//        $scope.favoriteTooltip = (report.favorite === 'Y')? 'Remove favorite': 'Mark as favorite';
        
        var url = commonService.prepareUserUpdateFavoriteUrl($scope.userLoginName);
        var obj = {
            report : report,
            reportIndex : index,
            arrayItem : items,
        };
        
        if (report.favorite === 'N') {
            obj.favorite = 'N';
            $scope.$emit('addToFavorite', obj);
            $http.get(url + report.id + '/Y').then(function () {
                report.favorite = 'Y';
            });
        } else {
            obj.favorite = 'Y';
            if(items.title === 'My Favorites') {
                items.service.reports.splice(index,1);
            } else {
                $scope.$emit('addToFavorite', obj);
            }    
            $http.get(url + report.id + '/N').then(function () {
                report.favorite = 'N';
            });
        }
    };

    /**
     *To create date object from string
     *@param dateString
     *@return dateObject
     */
    $scope.convertStringDate = function (date) {
        return new Date(date);
    };
}]);
'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive("searchReport", function () {
    return {
        templateUrl: "views/searchReport.html",
        restrict: "E",
        controller: "searchReportController"
    }
});
'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive("scroll", ["$window", function($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
            if (this.pageYOffset >=40) {
                scope.scrollVariable = true;
            } else {
                scope.scrollVariable = false;
            }
            scope.$apply();
        });
    }
}]);
'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show').click( function () {
                    $this.attr('title', '');
                });
                var $this = $(this);
                $this.data('title', $this.attr('title'));
                // Using null here wouldn't work in IE, but empty string will work just fine.
                $this.attr('title', '');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
                var $this = $(this);
                $this.attr('title', $this.data('title'));
            });
            
            $(element).on('click', function () {
                var title = $(element).attr('data-original-title'),
                    newTitle = '';
                
                if(title === 'Mark as favorite') {
                    newTitle = 'Remove favorite';
                } else if(title === 'Remove favorite') {
                    newTitle = 'Mark as favorite';
                }
                
                if(newTitle) {
                    $(element).removeAttr('data-original-title');
                    $(element).attr('title', newTitle)
                        .attr('data-original-title', newTitle)
                        .tooltip('fixTitle')
                        .data('bs.tooltip')
                        .$tip.find('.tooltip-inner')
                        .text(newTitle)
                        .tooltip('show')
                        .attr('title', '');
                }
            });
        }
    };
});
'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive("resize", ["$window", function($window) {
    return {
        restrict: "A",
        link: function (scope, element) {
            scope.getHeight = function () {
                return $(element).height();
            };
            scope.$watch(scope.getHeight, function (height) {
                $(element).find('#main-div').removeAttr("style");
                var navHeight = $(element).find('#nav-menu').height();
                var divHeight = $(element).find('#page-wrapper').height();
                if(parseInt(navHeight, 10) > parseInt(divHeight,  10)) {
                    $(element).find('#main-div').height(navHeight);
                } else {
                }
            });
            
            scope.getHeightNav = function () {
                return $(element).find('#nav-menu').height();
            };
            scope.$watch(scope.getHeightNav, function (height) {
                $(element).find('#main-div').removeAttr("style");
                var navHeight = $(element).find('#nav-menu').height();
                var divHeight = $(element).find('#page-wrapper').height();
                if(parseInt(navHeight, 10) > parseInt(divHeight,  10)) {
                    $(element).find('#main-div').height(navHeight);
                } else {
                }
            });
        }
   }
}]);
'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */

angular.module("myBiApp")
.directive("dendroGram", ["$window", function ($window) {
    return {
        restrict: "E",
        templateUrl: 'views/dendroGram.html',
        link: function(scope, elem, attrs){
            var data =  scope[attrs.data];
            var url = scope[attrs.url];
            var toggle = elem.find("#toggle");    
            var d3 = $window.d3;
            var rawSvg = elem.find("#d3d svg")[0];
            var initWidth = (scope.isTableu) ? 1250: 960; 
            //http://eyeseast.github.io/visible-data/2013/08/28/responsive-charts-with-d3/
            //https://chartio.com/resources/tutorials/how-to-resize-an-svg-when-the-window-is-resized-in-d3-js
            var margin = {top: 20, right: 120, bottom: 20, left: 190},
                width = initWidth  - margin.right - margin.left,
                height = 800 - margin.top - margin.bottom;
            var i = 0,
                duration = 750,
                root;
            var tree = d3.layout.tree()
                .size([height, width]);
            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.y, d.x]; });
            var svg = d3.select(rawSvg);
            var svg = d3.select("svg")    
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class",  'dendrogram')
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            function generateTree(){
//                d3.json("/scripts/data/data.json", function(error, json) {
                d3.json(url, function(error, json) {
                    if (error) throw error;
                    root = json;
                    root.x0 = height / 2;
                    root.y0 = 0;

                    function collapse(d) {
                        if (d.children) {
                            d._children = d.children;
                            d._children.forEach(collapse);
                            d.children = null;
                        }
                    }
                    
                    root.children.forEach(collapse);
                    update(root);
                });
            }
            
            generateTree();
            
            d3.select(self.frameElement).style("height", "800px");
            
            function update(source) {
                // Compute the new tree layout. -- Sent by Viswa
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);
            
                // add the tool tip
                var div = d3.select("body").append("div")
                    .attr("class", "tooltip tooltip-box");

                // Normalize for fixed-depth.
                nodes.forEach(function(d) { d.y = d.depth * 180; });
                
                // Update the nodes…
                var node = svg.selectAll("g.node")
                    .data(nodes, function(d) { return d.id || (d.id = ++i); });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) { 
                        return "translate(" + source.y0 + "," + source.x0 + ")"; 
                    })
                    .on("click", click)
                    // add tool tip for ps -eo pid,ppid,pcpu,size,comm,ruser,s
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html('<b>'+d.className+'</b>'+ ' <hr class="border-line" /> ' +d.name)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 30) + "px");
//                            .style("left", (d3.event.pageX) + "px")
//                            .style("top", (d3.event.pageY - 70) + "px");  
                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .style("fill", function(d) { 
                        return d._children ? "lightsteelblue" : "#fff"; 
                    });
                    
                var status = 'start';
                
                nodeEnter.append("text")
                    .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function(d) {
                        status = d.children || d._children ? "end" : "start"; 
                        return d.children || d._children ? "end" : "start"; 
                    })
                    .text(function(d) { return d.name; })
                    .call(wrap, 25, status)
                    .style("fill-opacity", 1e-6);

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) { 
                        return "translate(" + d.y + "," + d.x + ")"; 
                    });

                nodeUpdate.select("circle")
                    .attr("r", 7)
                    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = svg.selectAll("path.link")
                    .data(links, function(d) { return d.target.id; });

                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                });

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }
            
            function wrap(text, width, status) {
                text.each(function() {
                    var nodeText = d3.select(this).text(),
                        nodeTextlength = nodeText.length,
                        nWords = (nodeTextlength > width) ? nodeText.substring(0,width-1)+'...' :nodeText,
                        text = d3.select(this),
                        x = text.attr("x"),
                        y = text.attr("y"),
                        dy = (status ===  'start') ? parseFloat(text.attr("dy")) : "-.35em",
//                        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy",dy);
                        tspan.text(nWords);
                });
            }
            
            toggle.on("click", function() {
                var toggleText = toggle.text();
                if(toggleText === "Expand All") {
                    toggle.text('Collapse All');
                    toggleAll(root); 
                    update(root);
                } else {
                    toggle.text('Expand All');
                    root.children.forEach(collapseAll);
                    collapseAll(root);
                    update(root);
                }
            });
            
            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }
            
            function collapseAll(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapseAll);
                    d.children = null;
                }
            }
            
            function toggleAll(d){   
                var children = (d.children)?d.children:d._children;
                if (d._children) {        
                    d.children = d._children;
                    d._children = null;       
                }
                if(children)
                    children.forEach(toggleAll);
            }
        }
    };
}]);
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.reportsFactory
 * @description
 * # reportsFactory
 * Factory in the myBiApp.
 */
angular.module('myBiApp')
.factory('reportsFactory', ["commonService", "userDetailsService", "$http", "$q", "CONFIG", function (commonService, userDetailsService, $http, $q, CONFIG) {
    // Service logic
    // ...
    var reportsFactoryFunction = function (type, groupid, levelid, searchfilter, stopInfinite) {
        this.reports = [];
        this.loadmoredisable = false;
        this.loadReports = function () {
            this.loadmoredisable = true;
            var defer = $q.defer();
            
            userDetailsService.userPromise.then(function (response) {
                var url = '',
                /**
                 * Filter variable is the flag/key of response object which has the reports arraylist.
                 */
                filter;
                
                if (type === 'favorite') {
                    url = commonService.prepareFavoriteReportUrl(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit);
                    filter = 'favoriteReports';
                } else if (type === 'group') {
                    if (groupid === '') {
                        return;
                    }
                    url = commonService.prepareGroupReportUrl(response[0].emcLoginName, groupid, this.reports.length + 1, CONFIG.limit);
                    filter = 'allReportsForDpt';
                } else if (type === 'level') {
                    if (this.biGroupId === '') {
                        return;
                    }
                    url = commonService.prepareUserReportLevelUrl(response[0].emcLoginName, groupid, levelid, this.reports.length + 1, CONFIG.limit);
                    filter = 'allReportsForDpt';
                } else if (type === 'search') {
                    //while search groupid is searchtext & level id is persona y or n
                    groupid = decodeURIComponent(groupid);
                    if (levelid === 'Y') {
                        if(searchfilter) { 
                            url = commonService.prepareSearchUrlPersonaFilter(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid, searchfilter);
                        } else { 
                            url = commonService.prepareSearchUrlPersona(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid);
                        }
                    } else {
                        if(searchfilter) { 
                            url = commonService.prepareSearchUrlFilter(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid, searchfilter);
                        } else { 
                            url = commonService.prepareSearchUrl(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid);
                        }
                    }

                    filter = '';
                }
                
                $http.get(url).then(function (resp) {
                    /**
                     * arrayReports is an array with all reports list from response with filter or without filter based on webservice
                     */
                    var arrayReports = resp.data ? resp.data : [];

                    /**
                     * if filter is empty, expecting resp.data is an array of reports otherwise resp.data[filter] is an array of reports.
                     */
                    if (filter !== '') {
                        arrayReports = resp.data[filter] ? resp.data[filter] : [];
                    }
                    
                    _.map(arrayReports, function (report) {
                        if (type === 'search') {
                            if (levelid === 'Y') {
                                report.reportName = report.name;
                                report.reportType = report.type;
//                                report.createdDate = report.createDate;
//                                report.updatedDate = report.updateDate;
                            }
                        } else if (levelid) {
                            report.levelId = levelid;
                        }

                        report.reportLinkImg = report.reportLink + '.png';
                        report.iconClass = 'class-tableau';
                        
                        if (report.type === undefined && report.reportType !== undefined) {
                            report.type = report.reportType;
                        }
                        
                        if (report.type) {
                            if (report.type.toLowerCase() === 'pdf') {
                                report.reportLinkImg = 'images/charts/pdf-icon.png';
                                report.iconClass = 'class-pdf';
                            } else if (report.type.toLowerCase() === 'excel') {
                                report.reportLinkImg = 'images/charts/Excel-icon.png';
                                report.iconClass = 'class-excel';
                            } else if (report.type.toLowerCase() === 'webi') {
                                report.reportLinkImg = report.reportLink;
                                report.iconClass = 'class-bobj';
                            } else if (report.type.toLowerCase() === 'tableau') {
                                if (report.refreshStatus === undefined || report.refreshStatus === 'N') {
                                    var sourceImg = (report.sourceSystem.toString().indexOf('Enterprise') >= 0) ? report.sourceReportId + "_ent" : report.sourceReportId;
                                    report.reportLinkImg = CONFIG.tableauImagesPath + encodeURIComponent(report.functionalArea) + '/' + sourceImg + '.png';
                                } else if (report.refreshStatus && report.refreshStatus === 'Y') {
                                    report.reportLinkImg = report.reportLinkImg.replace('#/site', 't');
                                }
                            }
                        }
                        
                        return report;
                    });

                    if (arrayReports && arrayReports.length === CONFIG.limit) {
                        this.loadmoredisable = false;
                    }
                    
                    if (stopInfinite) {
                        this.loadmoredisable = true;
                    }
                    
                    if (this.reports.length === 0) {
                        this.reports = arrayReports;
                    } else {
                        Array.prototype.push.apply(this.reports, arrayReports);
                    }
                    
                    defer.resolve({});
                    
                }.bind(this));
            }.bind(this));
            return defer.promise;
        };
    };

    // Public API here
    return {
        reportsFactoryFunction: reportsFactoryFunction
    };
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('SearchCtrl', ["$scope", "$stateParams", "reportsFactory", "CONFIG", "userDetailsService", "$localStorage", function ($scope, $stateParams, reportsFactory, CONFIG, userDetailsService, $localStorage) {
    //subcaption for subheader
    $scope.mainState.$current.data.subCaption = $stateParams.searchText;
    $scope.groupsData = {};
//    $scope.setListView = function (status) {
//        if ($scope.groupsData) {
//            $scope.groupsData.service['listView'] = status;
//        }
//    }
    
    function doSearch(text) {
        var searchfilter = ($stateParams.searchfilter && $stateParams.searchfilter.filter)? $stateParams.searchfilter.filter : '';
        var groupService = new reportsFactory.reportsFactoryFunction('search', text, $stateParams.persona, searchfilter);
        $scope.setLoading(false);
        /*groupService.loadReports().then(function(){
         });
         groupService.loadmoredisable = true;*/
        $scope.groupsData = {
            'title': 'Search',
            'open': true,
            'limit': undefined,
            'class_names': 'col-xs-12',
            'loadmoredisable': groupService.loadmoredisable,
            'service': groupService,
            'data': groupService.reports/*,
             'searchTypePersona' : $stateParams.persona*/
        };
    }
    
    function setUserLevel() {
        if(!$localStorage.myLevel) {
            userDetailsService.userPromise.then(function (userObject) {
                if (userObject[0].userinfo.badge === 'Bronze') {
                    $scope.myLevel = 'bronze-level';
                } else if (userObject[0].userinfo.badge === 'Silver') {
                    $scope.myLevel = 'silver-level';
                } else if (userObject[0].userinfo.badge === 'Gold') {
                    $scope.myLevel = 'gold-level';
                } else if (userObject[0].userinfo.badge === 'Platinum') {
                    $scope.myLevel = 'platinum-level';
                }

                $localStorage.myLevel = $scope.myLevel
                $scope.$emit('myLevelIndication', $scope.myLevel);
            });    
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
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }
                    
                    if (response.data.isListViewed === null || !response.data.isListViewed) {
                        $localStorage.listViewStatus = 'grid';
                    } else {
                        (response.data.isListViewed === 0) ? $localStorage.listViewStatus = 'grid' : ((response.data.isListViewed === 1)? $localStorage.listViewStatus = 'list': $localStorage.listViewStatus = 'detailed');
                    }
                    
                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $localStorage.personalization = personalization;
                    $localStorage.isMenuCollapsed = (response.data.isMenuCollapsed === 1) ? true : false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $scope.userTheme = $localStorage.userTheme = 'default';                    
                    $scope.listViewStatus = $localStorage.listViewStatus = 'grid';
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed = 0;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus
            $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
        }
    }
    
    $scope.setLoading(true);
    doSearch($stateParams.searchText);
    setUserPreference();
    setUserLevel();
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:tilesPageCtrl
 * @description
 * # tilesPageCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('searchReportController', ['$scope', 'popularSearchService', '$timeout', '$window', function ($scope, popularSearchService, $timeout, $window) {
        
    $scope.model = {
        isMinimised: true,
        searchCloud: '',
        searchFilterOptions: [{name: 'Report Name', id: 'searchTextReportName'}, {name: 'Report Description', id: 'searchTextReportDesc'}, {name: 'Functional Area', id: 'searchTextFunctionalArea'}, {name: 'Owner', id: 'searchTextOwner'}]
    };
//    $scope.noNavBar = true;
    $scope.searchFilter = '';
    $scope.isCloudVisible = false;
    $scope.showIcon = false;
    
    $scope.showIconFlag = function() {
        ($scope.searchText) ? $scope.showIcon = true : $scope.showIcon = false; 
    };
    
    $scope.openSearch = function() {
        $scope.$emit('hideNotfy', false);
        if($scope.model.isMinimised) {
            $scope.model.isMinimised = false;
        } else {
            $scope.model.isMinimised = true;
        }
    };
    
    $scope.GetDataWithHtml = function () {
        console.log('hi');
    };
    
    $scope.clearText = function() {
        $scope.showIcon = false;
        $scope.searchText = "";
        angular.element('.globle-search-input').focus();
    };
    
    popularSearchService.then(function (r) {
        $scope.model.searchCloud = r;
        $scope.isCloudVisible = true;
        $timeout(function () {
            $scope.isCloudVisible = false;
        }, 1);
    });

    $scope.$watch('model.isMinimised', function (o, n) {
        if (n) {
            $timeout(function () {
                angular.element('.globle-search-input').focus();
                $scope.isCloudVisible = true;
            }, 1);
        } else {
            $scope.isCloudVisible = false;
        }
    });
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:SearchdetailsCtrl
 * @description
 * # SearchdetailsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('SearchdetailsCtrl', ["$scope", "$rootScope", "$sce", "$stateParams", "$state", "$window", "$filter", "searchservice", "CONFIG", "userDetailsService", "$localStorage", "commonService", "$http", function ($scope, $rootScope, $sce, $stateParams, $state, $window, $filter, searchservice, CONFIG, userDetailsService, $localStorage, commonService, $http) {
    $scope.feedbackArray = [];
    $scope.reportAccessData = {};
    $scope.isCollapsed = false;
    $scope.isTableu = false;
    setUserPreference();
    setUserLevel();
    $scope.$emit('setNavBar', true);
    
    if ($stateParams.sourceReportId) {

        //$scope.mainState.$current.data.displayName = $rootScope.searchObject.reportName;
        //Update search Id in headerCrtl
        /**
         * To update the tab urls with report id.
         * TODO: without passing searchid also.. this functionality would work as expected.
         */
        $scope.updateSearchId($stateParams.searchId);
        if ($state.current.name === 'search.details.report') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }

                $http.get(urlReports).then(function (resp) {
                    //Update user view count
                    var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl(response[0].emcLoginName, resp.data.sourceReportId, resp.data.sourceSystem, 'Search');
                    $http.get(reportUpdateViewed);
                    $rootScope.sourceSystem = resp.data.sourceSystem;
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader(resp.data.name);
                    $scope.isTableu = (resp.data.type === 'Tableau')? true : false;
                    
                    if($scope.isTableu) {
                        var placeholderDiv = document.getElementById('tableu_report3');
                        var url = resp.data.reportLink ? resp.data.reportLink : '';
                        var headerFlag = (resp.data.isHeaderFlag === 0) ? '?Header Flag=0&' : '?';
                        var reportToolBar = (resp.data.displayType === 'H') ? headerFlag+':toolbar=no' : 
                                ((resp.data.displayType === 'B')? headerFlag+':toolbar=bottom' : headerFlag+':toolbar=top'); 
                        var options = {
                            hideTabs: (resp.data.tabbedViews && resp.data.tabbedViews === 'Y') ? false : true,
                            width: '100%',
                            height: '800px'
                        };

                        new tableau.Viz(placeholderDiv, url+reportToolBar, options);
                    } else {
                        var url = resp.data.reportLink ? resp.data.reportLink : '';

                        $scope.getOtherReportLink = function () {
                            return $sce.trustAsResourceUrl(url);
                        };
                    }
                });
            });
            //TODO Remove isTableu from template for showing iframe or grid or d3 reports.

        } else if ($state.current.name === 'search.details.about') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }
                
                $http.get(urlReports).then(function (resp) {
                    $scope.reportData = resp.data;
                    $rootScope.sourceSystem = resp.data.sourceSystem;
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader(resp.data.name)
                });
            });
        } else if ($state.current.name === 'search.details.access') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }
                if(!$rootScope.searchReportName) {
                    $http.get(urlReports).then(function (resp) {
                        $rootScope.sourceSystem = resp.data.sourceSystem;
                        ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                        emitSearchHeader(resp.data.name);
                    });
                } else {
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader($rootScope.searchReportName);
                }
                
                searchservice.loadReportAccess($stateParams.sourceReportId, $stateParams.sourceName, $stateParams.searchId, $stateParams.persona).then(function (resp) {
                    $scope.reportAccessData = resp;
                });
            });    
        } else if ($state.current.name === 'search.details.feedback') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }

                if(!$rootScope.searchReportName) {
                    $http.get(urlReports).then(function (resp) {
                        $rootScope.sourceSystem = resp.data.sourceSystem;
                        ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                        emitSearchHeader(resp.data.name);
                    });
                } else {
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader($rootScope.searchReportName);
                }
                
                $scope.feedbackArray = [];
                searchservice.loadFeedbacks($stateParams.searchId).then(function (resp) {
                    $scope.feedbackArray = resp;
                });
            });    
        } else if ($state.current.name === 'search.details.reportmeta') {
            $scope.isTable = true;
            $scope.reportMetaData = [];
            $scope.metaDataCopy = [];
            $scope.reportFilterMetaData = [];        
            $scope.currentPage = 1;
            $scope.numPerPage = 20;
            $scope.maxSize = 5;
            $scope.totalItem ='';
            $scope.showIcon = false;
            $scope.setLoading(true);
            
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }
                $http.get(urlReports).then(function (resp) {
                    emitSearchHeader(resp.data.name);
                    $rootScope.reportName = $scope.mainState.$current.data.displayName = resp.data.name;  
                    $rootScope.sourceSystem = resp.data.sourceSystem;
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    $rootScope.sourceReportId = resp.data.sourceReportId;
                    $rootScope.repType = resp.data.type;
                    $rootScope.workbookId = resp.data.additionalInfo;
                    $scope.isTableu = ($rootScope.repType === 'Tableau')? true : false;

                    if($scope.isTableu) {
                        if($rootScope.viewTabs === 'N') {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                            var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                        } else {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId+'&sourceReportId='+ $rootScope.sourceReportId;
                            var url = commonService.prepareMetaDataUrlWork((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceSystem, $rootScope.workbookId);
                        }
                    } else {
                        $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                        var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                    }

                    $http.get(url).then(function (resp) {
                        if(resp.data) {
                            if(resp.data.length > 0) {
                                if($scope.isTableu) {
                                    if($rootScope.viewTabs === 'N') {
                                        $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                    } else {
                                        $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId;
                                    }
                                } else {
                                    $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                }
                            } else {
                                $scope.emptyMessage = 'The report does not have metadata to display.';
                                $scope.setLoading(false);
                                return;
                            }
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
                    },function(){
                        $scope.emptyMessage = 'The report does not have metadata to display.';
                    });
                });
            });
            
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

    $scope.feedback = '';
    
    $scope.postFeedback = function () {
        if ($scope.feedback.trim() !== '') {
            $scope.setLoading(true);
            searchservice.postFeedback($stateParams.searchId, $scope.feedback).then(function (/*feedObj*/) {
                $scope.feedback = '';
                searchservice.loadFeedbacks($stateParams.searchId).then(function (resp) {
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
    
    function emitSearchHeader(reportName) {
        $scope.mainState.$current.data.displayName = reportName;
        $rootScope.searchReportName = reportName;
        
        if($window.innerWidth < 768) {
            if(reportName.length > 45) {
                reportName = reportName.substr(0, 44)+'...';
            }
        }
        
        $scope.$emit('setSearchDisplayName', reportName);
    }
    
    function setUserLevel() {
        if(!$localStorage.myLevel) {
            userDetailsService.userPromise.then(function (userObject) {
                if (userObject[0].userinfo.badge === 'Bronze') {
                    $scope.myLevel = 'bronze-level';
                } else if (userObject[0].userinfo.badge === 'Silver') {
                    $scope.myLevel = 'silver-level';
                } else if (userObject[0].userinfo.badge === 'Gold') {
                    $scope.myLevel = 'gold-level';
                } else if (userObject[0].userinfo.badge === 'Platinum') {
                    $scope.myLevel = 'platinum-level';
                }

                $localStorage.myLevel = $scope.myLevel
                $scope.$emit('myLevelIndication', $scope.myLevel);
            });    
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
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }

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
}]);
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.searchservice
 * @description
 * # searchservice
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('searchservice', ["$http", "WEBSERVICEURL", "userDetailsService", "$q", "commonService", function searchservice($http, WEBSERVICEURL, userDetailsService, $q, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.feedbackArray = [];

    /**
     * @ngdoc function
     * @name myBiApp.searchservice.postFeedback
     * @description
     * helps to post the feedbacks to a report.  
     */
    this.postFeedback = function (reportId, feedback) {
        var defer = $q.defer();
        userDetailsService.userPromise.then(function (userArray) {
            var postObj = {
                'userName': userArray[0].emcLoginName,
                'reportId': reportId,
                'feedback': feedback
            };
            $http.post(WEBSERVICEURL.feedbackPost, postObj).then(function (/*response*/) {
                defer.resolve(postObj);
            });
        });
        return defer.promise;
    };

    /**
     * @ngdoc function
     * @name myBiApp.searchservice.loadFeedbacks
     * @description
     * helps to get the list of all feedbacks to a report.  
     */
    this.loadFeedbacks = function (reportId) {
        var defer = $q.defer();
        $http.get(commonService.prepareFeedbackUrl(reportId)).then(function (resp) {
            this.feedbackArray = resp.data;
            defer.resolve(resp.data);
        }.bind(this));
        return defer.promise;
    };

    /**
     * @ngdoc function
     * @name myBiApp.searchservice.loadReportAccess
     * @description
     * helps to get the items which tells about how to request access for a report.  
     */
    this.loadReportAccess = function (sourceReportId, sourceSystemName, searchid, persona) {
        var defer = $q.defer(), url;
        if (persona === 'Y') {
            url = commonService.prepareReportAccessUrl(searchid);
        } else {
            url = commonService.prepareReportAccessUrlSearch(sourceReportId, sourceSystemName);
        }
        $http.get(url).then(function (resp) {
            defer.resolve(resp.data);
        }.bind(this));
        return defer.promise;
    };
}]);

//'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
//angular.module("myBiApp")
//.filter('highlight', function($sce) {
//    return function(text, phrase) {
//        console.log(text);
//        console.log(phrase);
//        if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
//        '<span class="highlighted">$1</span>')
//
//        return $sce.trustAsHtml(text)
//    }
//});

//.filter('highlight', function($sce) {
//    return function(str, termsToHighlight) {
//    // Sort terms by length
//        termsToHighlight.sort(function(a, b) {
//            return b.length - a.length;
//        });
//        // Regex to simultaneously replace terms
//        var regex = new RegExp('(' + termsToHighlight.join('|') + ')', 'g');
//        return $sce.trustAsHtml(str.replace(regex, '<span class="match">$&</span>'));
//    };
//});
// tableau-2.0.0.min.js
(function(){var ss={version:'0.7.4.0',isUndefined:function(o){return(o===undefined);},isNull:function(o){return(o===null);},isNullOrUndefined:function(o){return(o===null)||(o===undefined);},isValue:function(o){return(o!==null)&&(o!==undefined);}};if(!Object.keys){Object.keys=function Object$keys(d){var keys=[];for(var key in d){keys.push(key);} return keys;}}
var Type=Function;var originalRegistrationFunctions={registerNamespace:{isPrototype:false,func:Type.registerNamespace},registerInterface:{isPrototype:true,func:Type.prototype.registerInterface},registerClass:{isPrototype:true,func:Type.prototype.registerClass},registerEnum:{isPrototype:true,func:Type.prototype.registerEnum}};var tab={};var tabBootstrap={};Type.registerNamespace=function(name){if(name==="tableauSoftware"){window.tableauSoftware=window.tableau=window.tableauSoftware||{};}};Type.prototype.registerInterface=function(name){};Type.prototype.registerEnum=function(name,flags){for(var field in this.prototype){this[field]=this.prototype[field];}};Type.prototype.registerClass=function(name,baseType,interfaceType){var that=this;this.prototype.constructor=this;this.__baseType=baseType||Object;if(baseType){this.__basePrototypePending=true;this.__setupBase=function(){Type$setupBase(that);};this.initializeBase=function(instance,args){Type$initializeBase(that,instance,args);};this.callBaseMethod=function(instance,name,args){Type$callBaseMethod(that,instance,name,args);};}};function Type$setupBase(that){if(that.__basePrototypePending){var baseType=that.__baseType;if(baseType.__basePrototypePending){baseType.__setupBase();} for(var memberName in baseType.prototype){var memberValue=baseType.prototype[memberName];if(!that.prototype[memberName]){that.prototype[memberName]=memberValue;}} delete that.__basePrototypePending;delete that.__setupBase;}}
function Type$initializeBase(that,instance,args){if(that.__basePrototypePending){that.__setupBase();} if(!args){that.__baseType.apply(instance);} else{that.__baseType.apply(instance,args);}}
function Type$callBaseMethod(that,instance,name,args){var baseMethod=that.__baseType.prototype[name];if(!args){return baseMethod.apply(instance);} else{return baseMethod.apply(instance,args);}}function restoreTypeSystem(){for(var regFuncName in originalRegistrationFunctions){if(!originalRegistrationFunctions.hasOwnProperty(regFuncName)){continue;} var original=originalRegistrationFunctions[regFuncName];var typeOrPrototype=original.isPrototype?Type.prototype:Type;if(original.func){typeOrPrototype[regFuncName]=original.func;} else{delete typeOrPrototype[regFuncName];}}}
ss.Delegate=function Delegate$(){};ss.Delegate.registerClass('Delegate');ss.Delegate.empty=function(){};ss.Delegate._contains=function Delegate$_contains(targets,object,method){for(var i=0;i<targets.length;i+=2){if(targets[i]===object&&targets[i+1]===method){return true;}} return false;};ss.Delegate._create=function Delegate$_create(targets){var delegate=function(){if(targets.length==2){return targets[1].apply(targets[0],arguments);} else{var clone=targets.concat();for(var i=0;i<clone.length;i+=2){if(ss.Delegate._contains(targets,clone[i],clone[i+1])){clone[i+1].apply(clone[i],arguments);}} return null;}};delegate._targets=targets;return delegate;};ss.Delegate.create=function Delegate$create(object,method){if(!object){return method;} return ss.Delegate._create([object,method]);};ss.Delegate.combine=function Delegate$combine(delegate1,delegate2){if(!delegate1){if(!delegate2._targets){return ss.Delegate.create(null,delegate2);} return delegate2;} if(!delegate2){if(!delegate1._targets){return ss.Delegate.create(null,delegate1);} return delegate1;} var targets1=delegate1._targets?delegate1._targets:[null,delegate1];var targets2=delegate2._targets?delegate2._targets:[null,delegate2];return ss.Delegate._create(targets1.concat(targets2));};ss.Delegate.remove=function Delegate$remove(delegate1,delegate2){if(!delegate1||(delegate1===delegate2)){return null;} if(!delegate2){return delegate1;} var targets=delegate1._targets;var object=null;var method;if(delegate2._targets){object=delegate2._targets[0];method=delegate2._targets[1];} else{method=delegate2;} for(var i=0;i<targets.length;i+=2){if((targets[i]===object)&&(targets[i+1]===method)){if(targets.length==2){return null;} targets.splice(i,2);return ss.Delegate._create(targets);}} return delegate1;};ss.IEnumerator=function IEnumerator$(){};ss.IEnumerator.prototype={get_current:null,moveNext:null,reset:null};ss.IEnumerator.getEnumerator=function ss_IEnumerator$getEnumerator(enumerable){if(enumerable){return enumerable.getEnumerator?enumerable.getEnumerator():new ss.ArrayEnumerator(enumerable);} return null;}
ss.IEnumerable=function IEnumerable$(){};ss.IEnumerable.prototype={getEnumerator:null};ss.ArrayEnumerator=function ArrayEnumerator$(array){this._array=array;this._index=-1;this.current=null;}
ss.ArrayEnumerator.prototype={moveNext:function ArrayEnumerator$moveNext(){this._index++;this.current=this._array[this._index];return(this._index<this._array.length);},reset:function ArrayEnumerator$reset(){this._index=-1;this.current=null;}};ss.IDisposable=function IDisposable$(){};ss.IDisposable.prototype={dispose:null};ss.StringBuilder=function StringBuilder$(s){this._parts=!ss.isNullOrUndefined(s)?[s]:[];this.isEmpty=this._parts.length==0;}
ss.StringBuilder.prototype={append:function StringBuilder$append(s){if(!ss.isNullOrUndefined(s)){this._parts.push(s);this.isEmpty=false;} return this;},appendLine:function StringBuilder$appendLine(s){this.append(s);this.append('\r\n');this.isEmpty=false;return this;},clear:function StringBuilder$clear(){this._parts=[];this.isEmpty=true;},toString:function StringBuilder$toString(s){return this._parts.join(s||'');}};ss.StringBuilder.registerClass('StringBuilder');ss.EventArgs=function EventArgs$(){}
ss.EventArgs.registerClass('EventArgs');ss.EventArgs.Empty=new ss.EventArgs();ss.CancelEventArgs=function CancelEventArgs$(){ss.CancelEventArgs.initializeBase(this);this.cancel=false;}
ss.CancelEventArgs.registerClass('CancelEventArgs',ss.EventArgs);ss.Tuple=function(first,second,third){this.first=first;this.second=second;if(arguments.length==3){this.third=third;}}
ss.Tuple.registerClass('Tuple');Type.registerNamespace('tab');tab.EscapingUtil=function(){}
tab.EscapingUtil.escapeHtml=function(html){var $0=(html||'');$0=$0.replace(new RegExp('&','g'),'&amp;');$0=$0.replace(new RegExp('<','g'),'&lt;');$0=$0.replace(new RegExp('>','g'),'&gt;');$0=$0.replace(new RegExp('"','g'),'&quot;');$0=$0.replace(new RegExp("'",'g'),'&#39;');$0=$0.replace(new RegExp('/','g'),'&#47;');return $0;}
tab.WindowHelper=function(window){this.$C=window;}
tab.WindowHelper.get_windowSelf=function(){return window.self;}
tab.WindowHelper.close=function(window){window.close();}
tab.WindowHelper.getOpener=function(window){return window.opener;}
tab.WindowHelper.getLocation=function(window){return window.location;}
tab.WindowHelper.getPathAndSearch=function(window){return window.location.pathname+window.location.search;}
tab.WindowHelper.setLocationHref=function(window,href){window.location.href=href;}
tab.WindowHelper.locationReplace=function(window,url){window.location.replace(url);}
tab.WindowHelper.open=function(href,target,options){return window.open(href,target,options);}
tab.WindowHelper.reload=function(w,foreGet){w.location.reload(foreGet);}
tab.WindowHelper.requestAnimationFrame=function(action){return tab.WindowHelper.$A(action);}
tab.WindowHelper.cancelAnimationFrame=function(animationId){if(ss.isValue(animationId)){tab.WindowHelper.$B(animationId);}}
tab.WindowHelper.$D=function(){var $0=0;tab.WindowHelper.$A=function($p1_0){var $1_0=new Date().getTime();var $1_1=Math.max(0,16-($1_0-$0));$0=$1_0+$1_1;var $1_2=window.setTimeout(function(){$p1_0();},$1_1);return $1_2;};}
tab.WindowHelper.prototype={$C:null,get_pageXOffset:function(){return tab.WindowHelper.$4(this.$C);},get_pageYOffset:function(){return tab.WindowHelper.$5(this.$C);},get_clientWidth:function(){return tab.WindowHelper.$2(this.$C);},get_clientHeight:function(){return tab.WindowHelper.$3(this.$C);},get_innerWidth:function(){return tab.WindowHelper.$0(this.$C);},get_outerWidth:function(){return tab.WindowHelper.$8(this.$C);},get_innerHeight:function(){return tab.WindowHelper.$1(this.$C);},get_outerHeight:function(){return tab.WindowHelper.$9(this.$C);},get_screenLeft:function(){return tab.WindowHelper.$6(this.$C);},get_screenTop:function(){return tab.WindowHelper.$7(this.$C);}}
tab.EscapingUtil.registerClass('tab.EscapingUtil');tab.WindowHelper.registerClass('tab.WindowHelper');tab.WindowHelper.$0=null;tab.WindowHelper.$1=null;tab.WindowHelper.$2=null;tab.WindowHelper.$3=null;tab.WindowHelper.$4=null;tab.WindowHelper.$5=null;tab.WindowHelper.$6=null;tab.WindowHelper.$7=null;tab.WindowHelper.$8=null;tab.WindowHelper.$9=null;tab.WindowHelper.$A=null;tab.WindowHelper.$B=null;(function(){if(('innerWidth'in window)){tab.WindowHelper.$0=function($p1_0){return $p1_0.innerWidth;};}else{tab.WindowHelper.$0=function($p1_0){return $p1_0.document.documentElement.offsetWidth;};}if(('outerWidth'in window)){tab.WindowHelper.$8=function($p1_0){return $p1_0.outerWidth;};}else{tab.WindowHelper.$8=tab.WindowHelper.$0;}if(('innerHeight'in window)){tab.WindowHelper.$1=function($p1_0){return $p1_0.innerHeight;};}else{tab.WindowHelper.$1=function($p1_0){return $p1_0.document.documentElement.offsetHeight;};}if(('outerHeight'in window)){tab.WindowHelper.$9=function($p1_0){return $p1_0.outerHeight;};}else{tab.WindowHelper.$9=tab.WindowHelper.$1;}if(('clientWidth'in window)){tab.WindowHelper.$2=function($p1_0){return $p1_0.clientWidth;};}else{tab.WindowHelper.$2=function($p1_0){return $p1_0.document.documentElement.clientWidth;};}if(('clientHeight'in window)){tab.WindowHelper.$3=function($p1_0){return $p1_0.clientHeight;};}else{tab.WindowHelper.$3=function($p1_0){return $p1_0.document.documentElement.clientHeight;};}if(ss.isValue(window.self.pageXOffset)){tab.WindowHelper.$4=function($p1_0){return $p1_0.pageXOffset;};}else{tab.WindowHelper.$4=function($p1_0){return $p1_0.document.documentElement.scrollLeft;};}if(ss.isValue(window.self.pageYOffset)){tab.WindowHelper.$5=function($p1_0){return $p1_0.pageYOffset;};}else{tab.WindowHelper.$5=function($p1_0){return $p1_0.document.documentElement.scrollTop;};}if(('screenLeft'in window)){tab.WindowHelper.$6=function($p1_0){return $p1_0.screenLeft;};}else{tab.WindowHelper.$6=function($p1_0){return $p1_0.screenX;};}if(('screenTop'in window)){tab.WindowHelper.$7=function($p1_0){return $p1_0.screenTop;};}else{tab.WindowHelper.$7=function($p1_0){return $p1_0.screenY;};}var $0='requestAnimationFrame';var $1='cancelAnimationFrame';var $2=['ms','moz','webkit','o'];var $3=null;var $4=null;if(($0 in window)){$3=$0;}if(($1 in window)){$4=$1;}for(var $5=0;$5<$2.length&&($3==null||$4==null);++$5){var $6=$2[$5];var $7=$6+'RequestAnimationFrame';if($3==null&&($7 in window)){$3=$7;}if($4==null){$7=$6+'CancelAnimationFrame';if(($7 in window)){$4=$7;}$7=$6+'CancelRequestAnimationFrame';if(($7 in window)){$4=$7;}}}if($3!=null){tab.WindowHelper.$A=function($p1_0){return window[$3]($p1_0);};}else{tab.WindowHelper.$D();}if($4!=null){tab.WindowHelper.$B=function($p1_0){window[$4]($p1_0);};}else{tab.WindowHelper.$B=function($p1_0){window.clearTimeout($p1_0);};}})();
Type.registerNamespace('tab');tab.$create__SheetInfoImpl=function(name,sheetType,index,size,workbook,url,isActive,isHidden,zoneId){var $o={};$o.name=name;$o.sheetType=sheetType;$o.index=index;$o.size=size;$o.workbook=workbook;$o.url=url;$o.isActive=isActive;$o.isHidden=isHidden;$o.zoneId=zoneId;return $o;}
tab.$create_JavaScriptApi$0=function(name,objectType,position,size,zoneId){var $o={};$o.$1=name;$o.$0=objectType;$o.$2=position;$o.$3=size;$o.$4=zoneId;return $o;}
tab.$create__StoryPointInfoImpl=function(caption,index,storyPointId,isActive,isUpdated,parentStoryImpl){var $o={};$o.caption=caption;$o.index=index;$o.storyPointId=storyPointId;$o.isActive=isActive;$o.isUpdated=isUpdated;$o.parentStoryImpl=parentStoryImpl;return $o;}
tab._ApiCommand=function(name,sourceId,handlerId,parameters){this.$0=name;this.$2=sourceId;this.$1=handlerId;this.$3=parameters;}
tab._ApiCommand.parse=function(serialized){var $0;var $1=serialized.indexOf(',');if($1<0){$0=serialized;return new tab._ApiCommand($0,null,null,null);}$0=serialized.substr(0,$1);var $2;var $3=serialized.substr($1+1);$1=$3.indexOf(',');if($1<0){$2=$3;return new tab._ApiCommand($0,$2,null,null);}$2=$3.substr(0,$1);var $4;var $5=$3.substr($1+1);$1=$5.indexOf(',');if($1<0){$4=$5;return new tab._ApiCommand($0,$2,$4,null);}$4=$5.substr(0,$1);var $6=$5.substr($1+1);return new tab._ApiCommand($0,$2,$4,$6);}
tab._ApiCommand.prototype={$0:null,$1:null,$2:null,$3:null,get_name:function(){return this.$0;},get_handlerId:function(){return this.$1;},get_sourceId:function(){return this.$2;},get_parameters:function(){return this.$3;},get_isApiCommandName:function(){return !this.get_rawName().indexOf('api.',0);},get_rawName:function(){return this.$0;},serialize:function(){var $0=[];$0.push(this.$0);$0.push(this.$2);$0.push(this.$1);if(ss.isValue(this.$3)){$0.push(this.$3);}var $1=$0.join(',');return $1;}}
tab._ApiServerResultParser=function(serverResult){var $0=JSON.parse(serverResult);this.$0=$0['api.commandResult'];this.$1=$0['api.commandData'];}
tab._ApiServerResultParser.prototype={$0:null,$1:null,get_result:function(){return this.$0;},get_data:function(){return this.$1;}}
tab._ApiServerNotification=function(workbookName,worksheetName,data){this.$0=workbookName;this.$1=worksheetName;this.$2=data;}
tab._ApiServerNotification.deserialize=function(json){var $0=JSON.parse(json);var $1=$0['api.workbookName'];var $2=$0['api.worksheetName'];var $3=$0['api.commandData'];return new tab._ApiServerNotification($1,$2,$3);}
tab._ApiServerNotification.prototype={$0:null,$1:null,$2:null,get_workbookName:function(){return this.$0;},get_worksheetName:function(){return this.$1;},get_data:function(){return this.$2;},serialize:function(){var $0={};$0['api.workbookName']=this.$0;$0['api.worksheetName']=this.$1;$0['api.commandData']=this.$2;return JSON.stringify($0);}}
tab._CommandReturnHandler=function(commandName,successCallbackTiming,successCallback,errorCallback){this.$0=commandName;this.$2=successCallback;this.$1=successCallbackTiming;this.$3=errorCallback;}
tab._CommandReturnHandler.prototype={$0:null,$1:0,$2:null,$3:null,get_commandName:function(){return this.$0;},get_successCallback:function(){return this.$2;},get_successCallbackTiming:function(){return this.$1;},get_errorCallback:function(){return this.$3;}}
tab.JavaScriptApi$1=function(){this.$2={};this.$3={};this.$4={};this.$5={};if(tab._Utility.hasWindowAddEventListener()){window.addEventListener('message', this.$8(), false);}else if(tab._Utility.hasDocumentAttachEvent()){document.attachEvent('onmessage', this.$8());window.attachEvent('onmessage', this.$8());}else{window.onmessage = this.$8();}this.$0=this.$1=0;}
tab.JavaScriptApi$1.prototype={$0:0,$1:0,registerHandler:function($p0){var $0='handler'+this.$0;if(ss.isValue($p0.get_handlerId())||ss.isValue(this.$2[$p0.get_handlerId()])){throw tab._TableauException.createInternalError("Handler '"+$p0.get_handlerId()+"' is already registered.");}this.$0++;$p0.set_handlerId($0);this.$2[$0]=$p0;$p0.add_customViewsListLoad(ss.Delegate.create(this,this.$6));$p0.add_stateReadyForQuery(ss.Delegate.create(this,this.$7));},unregisterHandler:function($p0){if(ss.isValue($p0.get_handlerId())||ss.isValue(this.$2[$p0.get_handlerId()])){delete this.$2[$p0.get_handlerId()];$p0.remove_customViewsListLoad(ss.Delegate.create(this,this.$6));$p0.remove_stateReadyForQuery(ss.Delegate.create(this,this.$7));}},sendCommand:function($p0,$p1,$p2){var $0=$p0.get_iframe();var $1=$p0.get_handlerId();if(!tab._Utility.hasWindowPostMessage()||ss.isNullOrUndefined($0)||ss.isNullOrUndefined($0.contentWindow)){return;}var $2='cmd'+this.$1;this.$1++;var $3=this.$3[$1];if(ss.isNullOrUndefined($3)){$3={};this.$3[$1]=$3;}$3[$2]=$p2;var $4=$p2.get_commandName();if($4==='api.ShowCustomViewCommand'){var $8=this.$4[$1];if(ss.isNullOrUndefined($8)){$8={};this.$4[$1]=$8;}$8[$2]=$p2;}var $5=null;if(ss.isValue($p1)){$5=tab.JsonUtil.toJson($p1,false,'');}var $6=new tab._ApiCommand($4,$2,$1,$5);var $7=$6.serialize();if(tab._Utility.isPostMessageSynchronous()){window.setTimeout(function(){
$0.contentWindow.postMessage($7,$p0.get_serverRoot());},0);}else{$0.contentWindow.postMessage($7,$p0.get_serverRoot());}},$6:function($p0){var $0=$p0.get_handlerId();var $1=this.$4[$0];if(ss.isNullOrUndefined($1)){return;}var $dict1=$1;for(var $key2 in $dict1){var $2={key:$key2,value:$dict1[$key2]};var $3=$2.value;if(ss.isValue($3.get_successCallback())){$3.get_successCallback()(null);}}delete this.$4[$0];},$7:function($p0){var $0=this.$5[$p0.get_handlerId()];if(tab._Utility.isNullOrEmpty($0)){return;}while($0.length>0){var $1=$0.pop();if(ss.isValue($1)){$1();}}},$8:function(){return ss.Delegate.create(this,function($p1_0){
this.$9($p1_0);});},$9:function($p0){if(ss.isNullOrUndefined($p0.data)){return;}var $0=tab._ApiCommand.parse($p0.data);var $1=$0.get_rawName();var $2=$0.get_handlerId();var $3=this.$2[$2];if(ss.isNullOrUndefined($3)||$3.get_handlerId()!==$0.get_handlerId()){$3=new tab.JavaScriptApi$2();}if($0.get_isApiCommandName()){if($0.get_sourceId()==='xdomainSourceId'){$3.handleEventNotification($0.get_name(),$0.get_parameters());if($0.get_name()==='api.FirstVizSizeKnownEvent'){$p0.source.postMessage('tableau.bootstrap','*');}}else{this.$A($0);}}else{this.$B($1,$p0,$3);}},$A:function($p0){var $0=this.$3[$p0.get_handlerId()];var $1=(ss.isValue($0))?$0[$p0.get_sourceId()]:null;if(ss.isNullOrUndefined($1)){return;}delete $0[$p0.get_sourceId()];if($p0.get_name()!==$1.get_commandName()){return;}var $2=new tab._ApiServerResultParser($p0.get_parameters());var $3=$2.get_data();if($2.get_result()==='api.success'){switch($1.get_successCallbackTiming()){case 0:if(ss.isValue($1.get_successCallback())){$1.get_successCallback()($3);}break;case 1:var $4=function(){
if(ss.isValue($1.get_successCallback())){$1.get_successCallback()($3);}};var $5=this.$5[$p0.get_handlerId()];if(ss.isNullOrUndefined($5)){$5=[];this.$5[$p0.get_handlerId()]=$5;}$5.push($4);break;default:throw tab._TableauException.createInternalError('Unknown timing value: '+$1.get_successCallbackTiming());}}else if(ss.isValue($1.get_errorCallback())){var $6=$2.get_result()==='api.remotefailed';$1.get_errorCallback()($6,$3);}},$B:function($p0,$p1,$p2){if($p0==='layoutInfoReq'){tab._VizManagerImpl.$4();this.$C($p1.source);}else if($p0==='tableau.completed'||$p0==='completed'){$p2.handleVizLoad();}},$C:function($p0){if(!tab._Utility.hasWindowPostMessage()){return;}var $0=new tab.WindowHelper(window.self);var $1=(ss.isValue($0.get_innerWidth()))?$0.get_innerWidth():document.documentElement.offsetWidth;var $2=(ss.isValue($0.get_innerHeight()))?$0.get_innerHeight():document.documentElement.offsetHeight;var $3=(ss.isValue($0.get_pageXOffset()))?$0.get_pageXOffset():document.documentElement.scrollLeft;var $4=(ss.isValue($0.get_pageYOffset()))?$0.get_pageYOffset():document.documentElement.scrollTop;var $5=[];$5.push('layoutInfoResp');$5.push($3);$5.push($4);$5.push($1);$5.push($2);$p0.postMessage($5.join(','),'*');}}
tab.JavaScriptApi$2=function(){}
tab.JavaScriptApi$2.prototype={$0:null,add_customViewsListLoad:function($p0){this.$1=ss.Delegate.combine(this.$1,$p0);},remove_customViewsListLoad:function($p0){this.$1=ss.Delegate.remove(this.$1,$p0);},$1:null,add_stateReadyForQuery:function($p0){this.$2=ss.Delegate.combine(this.$2,$p0);},remove_stateReadyForQuery:function($p0){this.$2=ss.Delegate.remove(this.$2,$p0);},$2:null,get_iframe:function(){return null;},get_handlerId:function(){return this.$0;},set_handlerId:function($p0){this.$0=$p0;return $p0;},get_serverRoot:function(){return '*';},handleVizLoad:function(){},handleEventNotification:function($p0,$p1){},$3:function(){this.$1(null);this.$2(null);}}
tab.CrossDomainMessagingOptions=function(router,handler){tab._Param.verifyValue(router,'router');tab._Param.verifyValue(handler,'handler');this.$0=router;this.$1=handler;}
tab.CrossDomainMessagingOptions.prototype={$0:null,$1:null,get_router:function(){return this.$0;},get_handler:function(){return this.$1;},sendCommand:function(commandParameters,returnHandler){this.$0.sendCommand(this.$1,commandParameters,returnHandler);}}
tab._Enums=function(){}
tab._Enums.$0=function($p0,$p1){var $0=(ss.isValue($p0))?$p0:'';return tab._Enums.$8($0,$p1,tableauSoftware.PeriodType,true);}
tab._Enums.$1=function($p0,$p1){var $0=(ss.isValue($p0))?$p0:'';return tab._Enums.$8($0,$p1,tableauSoftware.DateRangeType,true);}
tab._Enums.$2=function($p0,$p1){var $0=(ss.isValue($p0))?$p0:'';return tab._Enums.$8($0,$p1,tableauSoftware.FilterUpdateType,true);}
tab._Enums.$3=function($p0,$p1){var $0=(ss.isValue($p0))?$p0:'';return tab._Enums.$8($0,$p1,tableauSoftware.SelectionUpdateType,true);}
tab._Enums.$4=function($p0){var $0=(ss.isValue($p0))?$p0.toString():'';return tab._Enums.$8($0,'',tableauSoftware.SelectionUpdateType,false)!=null;}
tab._Enums.$5=function($p0,$p1){var $0=(ss.isValue($p0))?$p0:'';return tab._Enums.$8($0,$p1,tableauSoftware.NullOption,true);}
tab._Enums.$6=function($p0,$p1){var $0=(ss.isValue($p0))?$p0:'';return tab._Enums.$8($0,$p1,tableauSoftware.SheetSizeBehavior,true);}
tab._Enums.$7=function($p0){var $0=(ss.isValue($p0))?$p0:'';return tab._Enums.$8($0,'',tableauSoftware.TableauEventName,false);}
tab._Enums.$8=function($p0,$p1,$p2,$p3){if(ss.isValue($p0)){var $0=$p0.toString().toUpperCase();var $dict1=$p2;for(var $key2 in $dict1){var $1={key:$key2,value:$dict1[$key2]};var $2=$1.value.toString().toUpperCase();if($0===$2){return $1.value;}}}if($p3){throw tab._TableauException.createInvalidParameter($p1);}return null;}
tab._ApiBootstrap=function(){}
tab._ApiBootstrap.initialize=function(){tab._ApiObjectRegistry.registerCrossDomainMessageRouter(function(){
return new tab.JavaScriptApi$1();});}
tab._ApiObjectRegistry=function(){}
tab._ApiObjectRegistry.registerCrossDomainMessageRouter=function(objectCreationFunc){return tab._ApiObjectRegistry.$3('ICrossDomainMessageRouter',objectCreationFunc);}
tab._ApiObjectRegistry.getCrossDomainMessageRouter=function(){return tab._ApiObjectRegistry.$5('ICrossDomainMessageRouter');}
tab._ApiObjectRegistry.disposeCrossDomainMessageRouter=function(){tab._ApiObjectRegistry.$6('ICrossDomainMessageRouter');}
tab._ApiObjectRegistry.$3=function($p0,$p1){if(ss.isNullOrUndefined(tab._ApiObjectRegistry.$1)){tab._ApiObjectRegistry.$1={};}var $0=tab._ApiObjectRegistry.$1[$p0];tab._ApiObjectRegistry.$1[$p0]=$p1;return $0;}
tab._ApiObjectRegistry.$4=function($p0){if(ss.isNullOrUndefined(tab._ApiObjectRegistry.$1)){throw tab._TableauException.createInternalError('No types registered');}var $0=tab._ApiObjectRegistry.$1[$p0];if(ss.isNullOrUndefined($0)){throw tab._TableauException.createInternalError("No creation function has been registered for interface type '"+$p0+"'.");}var $1=$0();return $1;}
tab._ApiObjectRegistry.$5=function($p0){if(ss.isNullOrUndefined(tab._ApiObjectRegistry.$2)){tab._ApiObjectRegistry.$2={};}var $0=tab._ApiObjectRegistry.$2[$p0];if(ss.isNullOrUndefined($0)){$0=tab._ApiObjectRegistry.$4($p0);tab._ApiObjectRegistry.$2[$p0]=$0;}return $0;}
tab._ApiObjectRegistry.$6=function($p0){if(ss.isNullOrUndefined(tab._ApiObjectRegistry.$2)){return null;}var $0=tab._ApiObjectRegistry.$2[$p0];delete tab._ApiObjectRegistry.$2[$p0];return $0;}
tab._CustomViewImpl=function(workbookImpl,name,messagingOptions){this.$2=workbookImpl;this.$4=name;this.$3=messagingOptions;this.$7=false;this.$8=false;this.$9=false;}
tab._CustomViewImpl._getAsync=function($p0){var $0=new tab._Deferred();$0.resolve($p0.get__customViewImpl().get_$A());return $0.get_promise();}
tab._CustomViewImpl._createNew=function($p0,$p1,$p2,$p3){var $0=new tab._CustomViewImpl($p0,$p2.name,$p1);$0.$7=$p2.isPublic;$0.$6=$p2.url;$0.$5=$p2.owner.friendlyName;$0.$8=ss.isValue($p3)&&$p3===$p2.id;$0.$1=$p2;return $0;}
tab._CustomViewImpl._saveNewAsync=function($p0,$p1,$p2){var $0=new tab._Deferred();var $1={};$1['api.customViewName']=$p2;var $2=tab._CustomViewImpl.$13('api.SaveNewCustomViewCommand',$0,function($p1_0){
tab._CustomViewImpl._processCustomViewUpdate($p0,$p1,$p1_0,true);var $1_0=null;if(ss.isValue($p0.get_$18())){$1_0=$p0.get_$18().get_item(0);}$0.resolve($1_0);});$p1.sendCommand($1,$2);return $0.get_promise();}
tab._CustomViewImpl._showCustomViewAsync=function($p0,$p1,$p2){var $0=new tab._Deferred();var $1={};if(ss.isValue($p2)){$1['api.customViewParam']=$p2;}var $2=tab._CustomViewImpl.$13('api.ShowCustomViewCommand',$0,function($p1_0){
var $1_0=$p0.get_activeCustomView();$0.resolve($1_0);});$p1.sendCommand($1,$2);return $0.get_promise();}
tab._CustomViewImpl._makeCurrentCustomViewDefaultAsync=function($p0,$p1){var $0=new tab._Deferred();var $1={};var $2=tab._CustomViewImpl.$13('api.MakeCurrentCustomViewDefaultCommand',$0,function($p1_0){
var $1_0=$p0.get_activeCustomView();$0.resolve($1_0);});$p1.sendCommand($1,$2);return $0.get_promise();}
tab._CustomViewImpl._getCustomViewsAsync=function($p0,$p1){var $0=new tab._Deferred();var $1=new tab._CommandReturnHandler('api.FetchCustomViewsCommand',0,function($p1_0){
tab._CustomViewImpl._processCustomViews($p0,$p1,$p1_0);$0.resolve($p0.get_$17()._toApiCollection());},function($p1_0,$p1_1){
$0.reject(tab._TableauException.create('serverError',$p1_1));});$p1.sendCommand(null,$1);return $0.get_promise();}
tab._CustomViewImpl._processCustomViews=function($p0,$p1,$p2){tab._CustomViewImpl._processCustomViewUpdate($p0,$p1,$p2,false);}
tab._CustomViewImpl._processCustomViewUpdate=function($p0,$p1,$p2,$p3){if($p3){$p0.set_$18(new tab._Collection());}$p0.set_$1A(null);var $0=null;if(ss.isValue($p2.currentView)){$0=$p2.currentView.name;}var $1=$p2.defaultCustomViewId;if($p3&&ss.isValue($p2.newView)){var $2=tab._CustomViewImpl._createNew($p0,$p1,$p2.newView,$1);$p0.get_$18()._add($2.get_$D(),$2.get_$A());}$p0.set_$19($p0.get_$17());$p0.set_$17(new tab._Collection());if(ss.isValue($p2.customViews)){var $3=$p2.customViews;if($3.length>0){for(var $4=0;$4<$3.length;$4++){var $5=tab._CustomViewImpl._createNew($p0,$p1,$3[$4],$1);$p0.get_$17()._add($5.get_$D(),$5.get_$A());if($p0.get_$19()._has($5.get_$D())){$p0.get_$19()._remove($5.get_$D());}else if($p3){if(!$p0.get_$18()._has($5.get_$D())){$p0.get_$18()._add($5.get_$D(),$5.get_$A());}}if(ss.isValue($0)&&$5.get_$D()===$0){$p0.set_$1A($5.get_$A());}}}}}
tab._CustomViewImpl.$13=function($p0,$p1,$p2){var $0=function($p1_0,$p1_1){
$p1.reject(tab._TableauException.create('serverError',$p1_1));};return new tab._CommandReturnHandler($p0,0,$p2,$0);}
tab._CustomViewImpl.prototype={$0:null,$1:null,$2:null,$3:null,$4:null,$5:null,$6:null,$7:false,$8:false,$9:false,get_$A:function(){if(this.$0==null){this.$0=new tableauSoftware.CustomView(this);}return this.$0;},get_$B:function(){return this.$2.get_workbook();},get_$C:function(){return this.$6;},get_$D:function(){return this.$4;},set_$D:function($p0){if(this.$9){throw tab._TableauException.create('staleDataReference','Stale data');}this.$4=$p0;return $p0;},get_$E:function(){return this.$5;},get_$F:function(){return this.$7;},set_$F:function($p0){if(this.$9){throw tab._TableauException.create('staleDataReference','Stale data');}this.$7=$p0;return $p0;},get_$10:function(){return this.$8;},$11:function(){if(this.$9||ss.isNullOrUndefined(this.$1)){throw tab._TableauException.create('staleDataReference','Stale data');}this.$1.isPublic=this.$7;this.$1.name=this.$4;var $0=new tab._Deferred();var $1={};$1['api.customViewParam']=this.$1;var $2=tab._CustomViewImpl.$13('api.UpdateCustomViewCommand',$0,ss.Delegate.create(this,function($p1_0){
tab._CustomViewImpl._processCustomViewUpdate(this.$2,this.$3,$p1_0,true);$0.resolve(this.get_$A());}));this.$3.sendCommand($1,$2);return $0.get_promise();},$12:function(){var $0=new tab._Deferred();var $1={};$1['api.customViewParam']=this.$1;var $2=tab._CustomViewImpl.$13('api.RemoveCustomViewCommand',$0,ss.Delegate.create(this,function($p1_0){
this.$9=true;tab._CustomViewImpl._processCustomViews(this.$2,this.$3,$p1_0);$0.resolve(this.get_$A());}));this.$3.sendCommand($1,$2);return $0.get_promise();},_showAsync:function(){if(this.$9||ss.isNullOrUndefined(this.$1)){throw tab._TableauException.create('staleDataReference','Stale data');}return tab._CustomViewImpl._showCustomViewAsync(this.$2,this.$3,this.$1);},$14:function($p0){return (this.$5!==$p0.$5||this.$6!==$p0.$6||this.$7!==$p0.$7||this.$8!==$p0.$8);}}
tab._DashboardImpl=function(sheetInfoImpl,workbookImpl,messagingOptions){this.$F=new tab._Collection();this.$10=new tab._Collection();tab._DashboardImpl.initializeBase(this,[sheetInfoImpl,workbookImpl,messagingOptions]);}
tab._DashboardImpl.prototype={$E:null,get_sheet:function(){return this.get_dashboard();},get_dashboard:function(){if(this.$E==null){this.$E=new tableauSoftware.Dashboard(this);}return this.$E;},get_worksheets:function(){return this.$F;},get_objects:function(){return this.$10;},$11:function($p0,$p1){this.$10=new tab._Collection();this.$F=new tab._Collection();for(var $0=0;$0<$p0.length;$0++){var $1=$p0[$0];var $2=null;if($p0[$0].$0==='worksheet'){var $4=$1.$1;if(ss.isNullOrUndefined($4)){continue;}var $5=this.$F.get__length();var $6=tab.SheetSizeFactory.createAutomatic();var $7=false;var $8=$p1($4);var $9=ss.isNullOrUndefined($8);var $A=($9)?'':$8.getUrl();var $B=tab.$create__SheetInfoImpl($4,'worksheet',$5,$6,this.get_workbook(),$A,$7,$9,$1.$4);var $C=new tab._WorksheetImpl($B,this.get_workbookImpl(),this.get_messagingOptions(),this);$2=$C.get_worksheet();this.$F._add($4,$C.get_worksheet());}var $3=new tableauSoftware.DashboardObject($1,this.get_dashboard(),$2);this.$10._add($0.toString(),$3);}}}
tab._DataSourceImpl=function(name,isPrimary){this.$1=new tab._Collection();tab._Param.verifyString(name,'name');this.$0=name;this.$2=isPrimary;}
tab._DataSourceImpl.processDataSource=function(dataSourcePm){var $0=new tab._DataSourceImpl(dataSourcePm.name,dataSourcePm.isPrimary);var $1=(dataSourcePm.fields||new Array(0));var $enum1=ss.IEnumerator.getEnumerator($1);while($enum1.moveNext()){var $2=$enum1.current;var $3=new tableauSoftware.Field($0.get_dataSource(),$2.name,$2.role,$2.aggregation);$0.addField($3);}return $0;}
tab._DataSourceImpl.processDataSourcesForWorksheet=function(pm){var $0=new tab._Collection();var $1=null;var $enum1=ss.IEnumerator.getEnumerator(pm.dataSources);while($enum1.moveNext()){var $2=$enum1.current;var $3=tab._DataSourceImpl.processDataSource($2);if($2.isPrimary){$1=$3;}else{$0._add($2.name,$3.get_dataSource());}}if(ss.isValue($1)){$0._addToFirst($1.get_name(),$1.get_dataSource());}return $0;}
tab._DataSourceImpl.prototype={$0:null,$2:false,$3:null,get_dataSource:function(){if(this.$3==null){this.$3=new tableauSoftware.DataSource(this);}return this.$3;},get_name:function(){return this.$0;},get_fields:function(){return this.$1;},get_isPrimary:function(){return this.$2;},addField:function(field){this.$1._add(field.getName(),field);}}
tab._DeferredUtil=function(){}
tab._DeferredUtil.$0=function($p0){var $0;if($p0 instanceof tableauSoftware.Promise){$0=$p0;}else{if(ss.isValue($p0)&&typeof($p0.valueOf)==='function'){$p0=$p0.valueOf();}if(tab._DeferredUtil.$4($p0)){var $1=new tab._DeferredImpl();($p0).then(ss.Delegate.create($1,$1.resolve),ss.Delegate.create($1,$1.reject));$0=$1.get_promise();}else{$0=tab._DeferredUtil.$2($p0);}}return $0;}
tab._DeferredUtil.$1=function($p0){return tab._DeferredUtil.$0($p0).then(function($p1_0){
return tab._DeferredUtil.$3($p1_0);},null);}
tab._DeferredUtil.$2=function($p0){var $0=new tab._PromiseImpl(function($p1_0,$p1_1){
try{return tab._DeferredUtil.$0((ss.isValue($p1_0))?$p1_0($p0):$p0);}catch($1_0){return tab._DeferredUtil.$3($1_0);}});return $0;}
tab._DeferredUtil.$3=function($p0){var $0=new tab._PromiseImpl(function($p1_0,$p1_1){
try{return (ss.isValue($p1_1))?tab._DeferredUtil.$0($p1_1($p0)):tab._DeferredUtil.$3($p0);}catch($1_0){return tab._DeferredUtil.$3($1_0);}});return $0;}
tab._DeferredUtil.$4=function($p0){return ss.isValue($p0)&&typeof($p0.then)==='function';}
tab._CollectionImpl=function(){this.$0=[];this.$1={};}
tab._CollectionImpl.prototype={get__length:function(){return this.$0.length;},get__rawArray:function(){return this.$0;},_get:function($p0){var $0=this.$4($p0);if(ss.isValue(this.$1[$0])){return this.$1[$0];}return undefined;},_has:function($p0){return ss.isValue(this._get($p0));},_add:function($p0,$p1){this.$3($p0,$p1);var $0=this.$4($p0);this.$0.push($p1);this.$1[$0]=$p1;},_addToFirst:function($p0,$p1){this.$3($p0,$p1);var $0=this.$4($p0);this.$0.unshift($p1);this.$1[$0]=$p1;},_remove:function($p0){var $0=this.$4($p0);if(ss.isValue(this.$1[$0])){var $1=this.$1[$0];delete this.$1[$0];for(var $2=0;$2<this.$0.length;$2++){if(this.$0[$2]===$1){this.$0.splice($2,1);break;}}}},_toApiCollection:function(){var $0=this.$0.concat();$0.get=ss.Delegate.create(this,function($p1_0){
return this._get($p1_0);});$0.has=ss.Delegate.create(this,function($p1_0){
return this._has($p1_0);});return $0;},$2:function($p0){if(tab._Utility.isNullOrEmpty($p0)){throw new Error('Null key');}if(this._has($p0)){throw new Error("Duplicate key '"+$p0+"'");}},$3:function($p0,$p1){this.$2($p0);if(ss.isNullOrUndefined($p1)){throw new Error('Null item');}},$4:function($p0){return '_'+$p0;},get_item:function($p0){return this.$0[$p0];}}
tab._DeferredImpl=function(){this.$2=[];this.$0=new tab._PromiseImpl(ss.Delegate.create(this,this.then));this.$1=ss.Delegate.create(this,this.$5);this.$3=ss.Delegate.create(this,this.$6);}
tab._DeferredImpl.prototype={$0:null,$1:null,$3:null,get_promise:function(){return this.$0;},$4:function($p0){var $0=new tab._DeferredImpl();var $1=$p0.length;var $2=$1;var $3=[];if(!$1){$0.resolve($3);return $0.get_promise();}var $4=function($p1_0,$p1_1){
var $1_0=tab._DeferredUtil.$0($p1_0);$1_0.then(function($p2_0){
$3[$p1_1]=$p2_0;$2--;if(!$2){$0.resolve($3);}return null;},function($p2_0){
$0.reject($p2_0);return null;});};for(var $5=0;$5<$1;$5++){$4($p0[$5],$5);}return $0.get_promise();},then:function($p0,$p1){return this.$1($p0,$p1);},resolve:function($p0){return this.$3($p0);},reject:function($p0){return this.$3(tab._DeferredUtil.$3($p0));},$5:function($p0,$p1){var $0=new tab._DeferredImpl();this.$2.push(function($p1_0){
$p1_0.then($p0,$p1).then(ss.Delegate.create($0,$0.resolve),ss.Delegate.create($0,$0.reject));});return $0.get_promise();},$6:function($p0){var $0=tab._DeferredUtil.$0($p0);this.$1=$0.then;this.$3=tab._DeferredUtil.$0;for(var $1=0;$1<this.$2.length;$1++){var $2=this.$2[$1];$2($0);}this.$2=null;return $0;}}
tab._PromiseImpl=function(thenFunc){this.then=thenFunc;}
tab._PromiseImpl.prototype={then:null,always:function($p0){return this.then($p0,$p0);},otherwise:function($p0){return this.then(null,$p0);}}
tab._MarkImpl=function(tupleIdOrPairs){this.$1=new tab._Collection();if(tab._jQueryShim.$12(tupleIdOrPairs)){var $0=tupleIdOrPairs;for(var $1=0;$1<$0.length;$1++){var $2=$0[$1];if(!ss.isValue($2.fieldName)){throw tab._TableauException.createInvalidParameter('pair.fieldName');}if(!ss.isValue($2.value)){throw tab._TableauException.createInvalidParameter('pair.value');}var $3=new tableauSoftware.Pair($2.fieldName,$2.value);this.$1._add($3.fieldName,$3);}}else{this.$2=tupleIdOrPairs;}}
tab._MarkImpl.$6=function($p0){var $0=new tab._Collection();if(ss.isNullOrUndefined($p0)||tab._Utility.isNullOrEmpty($p0.marks)){return $0;}var $enum1=ss.IEnumerator.getEnumerator($p0.marks);while($enum1.moveNext()){var $1=$enum1.current;var $2=$1.tupleId;var $3=new tableauSoftware.Mark($2);$0._add($2.toString(),$3);var $enum2=ss.IEnumerator.getEnumerator($1.pairs);while($enum2.moveNext()){var $4=$enum2.current;var $5=tab._Utility.convertRawValue($4.value,$4.valueDataType);var $6=new tableauSoftware.Pair($4.fieldName,$5);$6.formattedValue=$4.formattedValue;if(!$3.$0.get_$3()._has($6.fieldName)){$3.$0.$7($6);}}}return $0;}
tab._MarkImpl.prototype={$0:null,$2:0,get_$3:function(){return this.$1;},get_$4:function(){return this.$2;},get_$5:function(){if(this.$0==null){this.$0=this.$1._toApiCollection();}return this.$0;},$7:function($p0){this.$1._add($p0.fieldName,$p0);}}
tab._Param=function(){}
tab._Param.verifyString=function(argumentValue,argumentName){if(ss.isNullOrUndefined(argumentValue)||!argumentValue.length){throw tab._TableauException.createInternalStringArgumentException(argumentName);}}
tab._Param.verifyValue=function(argumentValue,argumentName){if(ss.isNullOrUndefined(argumentValue)){throw tab._TableauException.createInternalNullArgumentException(argumentName);}}
tab._ParameterImpl=function(pm){this.$1=pm.name;this.$2=tab._Utility.getDataValue(pm.currentValue);this.$3=pm.dataType;this.$4=pm.allowableValuesType;if(ss.isValue(pm.allowableValues)&&this.$4==='list'){this.$5=[];var $enum1=ss.IEnumerator.getEnumerator(pm.allowableValues);while($enum1.moveNext()){var $0=$enum1.current;this.$5.push(tab._Utility.getDataValue($0));}}if(this.$4==='range'){this.$6=tab._Utility.getDataValue(pm.minValue);this.$7=tab._Utility.getDataValue(pm.maxValue);this.$8=pm.stepSize;if((this.$3==='date'||this.$3==='datetime')&&ss.isValue(this.$8)&&ss.isValue(pm.dateStepPeriod)){this.$9=pm.dateStepPeriod;}}}
tab._ParameterImpl.prototype={$0:null,$1:null,$2:null,$3:null,$4:null,$5:null,$6:null,$7:null,$8:null,$9:null,get_$A:function(){if(this.$0==null){this.$0=new tableauSoftware.Parameter(this);}return this.$0;},get_$B:function(){return this.$1;},get_$C:function(){return this.$2;},get_$D:function(){return this.$3;},get_$E:function(){return this.$4;},get_$F:function(){return this.$5;},get_$10:function(){return this.$6;},get_$11:function(){return this.$7;},get_$12:function(){return this.$8;},get_$13:function(){return this.$9;}}
tab._SheetImpl=function(sheetInfoImpl,workbookImpl,messagingOptions){tab._Param.verifyValue(sheetInfoImpl,'sheetInfoImpl');tab._Param.verifyValue(workbookImpl,'workbookImpl');tab._Param.verifyValue(messagingOptions,'messagingOptions');this.$0=sheetInfoImpl.name;this.$1=sheetInfoImpl.index;this.$2=sheetInfoImpl.isActive;this.$3=sheetInfoImpl.isHidden;this.$4=sheetInfoImpl.sheetType;this.$5=sheetInfoImpl.size;this.$6=sheetInfoImpl.url;this.$7=workbookImpl;this.$8=messagingOptions;this.$A=sheetInfoImpl.zoneId;}
tab._SheetImpl.$B=function($p0){if(ss.isValue($p0)){return tab._Utility.toInt($p0);}return $p0;}
tab._SheetImpl.$C=function($p0){var $0=tab._Enums.$6($p0.behavior,'size.behavior');var $1=$p0.minSize;if(ss.isValue($1)){$1=tab.$create_Size(tab._SheetImpl.$B($p0.minSize.width),tab._SheetImpl.$B($p0.minSize.height));}var $2=$p0.maxSize;if(ss.isValue($2)){$2=tab.$create_Size(tab._SheetImpl.$B($p0.maxSize.width),tab._SheetImpl.$B($p0.maxSize.height));}return tab.$create_SheetSize($0,$1,$2);}
tab._SheetImpl.prototype={$0:null,$1:0,$2:false,$3:false,$4:null,$5:null,$6:null,$7:null,$8:null,$9:null,$A:0,get_name:function(){return this.$0;},get_index:function(){return this.$1;},get_workbookImpl:function(){return this.$7;},get_workbook:function(){return this.$7.get_workbook();},get_url:function(){if(this.$3){throw tab._TableauException.createNoUrlForHiddenWorksheet();}return this.$6;},get_size:function(){return this.$5;},get_isHidden:function(){return this.$3;},get_isActive:function(){return this.$2;},set_isActive:function(value){this.$2=value;return value;},get_isDashboard:function(){return this.$4==='dashboard';},get_sheetType:function(){return this.$4;},get_parentStoryPoint:function(){if(ss.isValue(this.$9)){return this.$9.get_storyPoint();}return null;},get_parentStoryPointImpl:function(){return this.$9;},set_parentStoryPointImpl:function(value){if(this.$4==='story'){throw tab._TableauException.createInternalError('A story cannot be a child of another story.');}this.$9=value;return value;},get_zoneId:function(){return this.$A;},get_messagingOptions:function(){return this.$8;},changeSizeAsync:function(newSize){newSize=tab._SheetImpl.$C(newSize);if(this.$4==='worksheet'&&newSize.behavior!=='automatic'){throw tab._TableauException.createInvalidSizeBehaviorOnWorksheet();}var $0=new tab._Deferred();if(this.$5.behavior===newSize.behavior&&newSize.behavior==='automatic'){$0.resolve(newSize);return $0.get_promise();}var $1=this.$D(newSize);var $2={};$2['api.setSheetSizeName']=this.$0;$2['api.minWidth']=$1['api.minWidth'];$2['api.minHeight']=$1['api.minHeight'];$2['api.maxWidth']=$1['api.maxWidth'];$2['api.maxHeight']=$1['api.maxHeight'];var $3=new tab._CommandReturnHandler('api.SetSheetSizeCommand',1,ss.Delegate.create(this,function($p1_0){
this.get_workbookImpl()._update(ss.Delegate.create(this,function(){
var $2_0=this.get_workbookImpl().get_publishedSheets()._get(this.get_name()).getSize();$0.resolve($2_0);}));}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($2,$3);return $0.get_promise();},sendCommand:function(commandParameters,returnHandler){this.$8.sendCommand(commandParameters,returnHandler);},$D:function($p0){var $0=null;if(ss.isNullOrUndefined($p0)||ss.isNullOrUndefined($p0.behavior)||($p0.behavior!=='automatic'&&ss.isNullOrUndefined($p0.minSize)&&ss.isNullOrUndefined($p0.maxSize))){throw tab._TableauException.createInvalidSheetSizeParam();}var $1=0;var $2=0;var $3=0;var $4=0;var $5={};$5['api.minWidth']=0;$5['api.minHeight']=0;$5['api.maxWidth']=0;$5['api.maxHeight']=0;if($p0.behavior==='automatic'){$0=tab.$create_SheetSize('automatic',undefined,undefined);}else if($p0.behavior==='atmost'){if(ss.isNullOrUndefined($p0.maxSize)||ss.isNullOrUndefined($p0.maxSize.width)||ss.isNullOrUndefined($p0.maxSize.height)){throw tab._TableauException.createMissingMaxSize();}if($p0.maxSize.width<0||$p0.maxSize.height<0){throw tab._TableauException.createInvalidSizeValue();}$5['api.maxWidth']=$p0.maxSize.width;$5['api.maxHeight']=$p0.maxSize.height;$0=tab.$create_SheetSize('atmost',undefined,$p0.maxSize);}else if($p0.behavior==='atleast'){if(ss.isNullOrUndefined($p0.minSize)||ss.isNullOrUndefined($p0.minSize.width)||ss.isNullOrUndefined($p0.minSize.height)){throw tab._TableauException.createMissingMinSize();}if($p0.minSize.width<0||$p0.minSize.height<0){throw tab._TableauException.createInvalidSizeValue();}$5['api.minWidth']=$p0.minSize.width;$5['api.minHeight']=$p0.minSize.height;$0=tab.$create_SheetSize('atleast',$p0.minSize,undefined);}else if($p0.behavior==='range'){if(ss.isNullOrUndefined($p0.minSize)||ss.isNullOrUndefined($p0.maxSize)||ss.isNullOrUndefined($p0.minSize.width)||ss.isNullOrUndefined($p0.maxSize.width)||ss.isNullOrUndefined($p0.minSize.height)||ss.isNullOrUndefined($p0.maxSize.height)){throw tab._TableauException.createMissingMinMaxSize();}if($p0.minSize.width<0||$p0.minSize.height<0||$p0.maxSize.width<0||$p0.maxSize.height<0||$p0.minSize.width>$p0.maxSize.width||$p0.minSize.height>$p0.maxSize.height){throw tab._TableauException.createInvalidRangeSize();}$5['api.minWidth']=$p0.minSize.width;$5['api.minHeight']=$p0.minSize.height;$5['api.maxWidth']=$p0.maxSize.width;$5['api.maxHeight']=$p0.maxSize.height;$0=tab.$create_SheetSize('range',$p0.minSize,$p0.maxSize);}else if($p0.behavior==='exactly'){if(ss.isValue($p0.minSize)&&ss.isValue($p0.maxSize)&&ss.isValue($p0.minSize.width)&&ss.isValue($p0.maxSize.width)&&ss.isValue($p0.minSize.height)&&ss.isValue($p0.maxSize.height)){$1=$p0.minSize.width;$2=$p0.minSize.height;$3=$p0.maxSize.width;$4=$p0.maxSize.height;if($1!==$3||$2!==$4){throw tab._TableauException.createSizeConflictForExactly();}}else if(ss.isValue($p0.minSize)&&ss.isValue($p0.minSize.width)&&ss.isValue($p0.minSize.height)){$1=$p0.minSize.width;$2=$p0.minSize.height;$3=$1;$4=$2;}else if(ss.isValue($p0.maxSize)&&ss.isValue($p0.maxSize.width)&&ss.isValue($p0.maxSize.height)){$3=$p0.maxSize.width;$4=$p0.maxSize.height;$1=$3;$2=$4;}$5['api.minWidth']=$1;$5['api.minHeight']=$2;$5['api.maxWidth']=$3;$5['api.maxHeight']=$4;$0=tab.$create_SheetSize('exactly',tab.$create_Size($1,$2),tab.$create_Size($3,$4));}this.$5=$0;return $5;}}
tab._StoryImpl=function(sheetInfoImpl,workbookImpl,messagingOptions,storyPm,findSheetFunc){tab._StoryImpl.initializeBase(this,[sheetInfoImpl,workbookImpl,messagingOptions]);tab._Param.verifyValue(storyPm,'storyPm');tab._Param.verifyValue(findSheetFunc,'findSheetFunc');this.$F=findSheetFunc;this.update(storyPm);}
tab._StoryImpl.prototype={$E:null,$F:null,$10:null,$11:null,add_activeStoryPointChange:function(value){this.$12=ss.Delegate.combine(this.$12,value);},remove_activeStoryPointChange:function(value){this.$12=ss.Delegate.remove(this.$12,value);},$12:null,get_activeStoryPointImpl:function(){return this.$E;},get_sheet:function(){return this.get_story();},get_story:function(){if(this.$10==null){this.$10=new tableauSoftware.Story(this);}return this.$10;},get_storyPointsInfo:function(){return this.$11;},update:function(storyPm){var $0=null;var $1=null;this.$11=(this.$11||new Array(storyPm.storyPoints.length));for(var $5=0;$5<storyPm.storyPoints.length;$5++){var $6=storyPm.storyPoints[$5];var $7=$6.caption;var $8=$5===storyPm.activeStoryPointIndex;var $9=tab.$create__StoryPointInfoImpl($7,$5,$6.storyPointId,$8,$6.isUpdated,this);if(ss.isNullOrUndefined(this.$11[$5])){this.$11[$5]=new tableauSoftware.StoryPointInfo($9);}else if(this.$11[$5]._impl.storyPointId===$9.storyPointId){var $A=this.$11[$5]._impl;$A.caption=$9.caption;$A.index=$9.index;$A.isActive=$8;$A.isUpdated=$9.isUpdated;}else{this.$11[$5]=new tableauSoftware.StoryPointInfo($9);}if($8){$0=$6.containedSheetInfo;$1=$9;}}var $2=this.$11.length-storyPm.storyPoints.length;this.$11.splice(storyPm.storyPoints.length,$2);var $3=ss.isNullOrUndefined(this.$E)||this.$E.get_storyPointId()!==$1.storyPointId;if(ss.isValue(this.$E)&&$3){this.$E.set_isActive(false);}var $4=this.$E;if($3){var $B=tab._StoryPointImpl.createContainedSheet($0,this.get_workbookImpl(),this.get_messagingOptions(),this.$F);this.$E=new tab._StoryPointImpl($1,$B);}else{this.$E.set_isActive($1.isActive);this.$E.set_isUpdated($1.isUpdated);}if($3&&ss.isValue($4)){this.$16(this.$11[$4.get_index()],this.$E.get_storyPoint());}},activatePreviousStoryPointAsync:function(){return this.$13('api.ActivatePreviousStoryPoint');},activateNextStoryPointAsync:function(){return this.$13('api.ActivateNextStoryPoint');},activateStoryPointAsync:function(index){var $0=new tab._Deferred();if(index<0||index>=this.$11.length){throw tab._TableauException.createIndexOutOfRange(index);}var $1=this.get_activeStoryPointImpl();var $2={};$2['api.storyPointIndex']=index;var $3=new tab._CommandReturnHandler('api.ActivateStoryPoint',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;this.$15($1,$1_0);$0.resolve(this.$E.get_storyPoint());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($2,$3);return $0.get_promise();},revertStoryPointAsync:function(index){index=(index||this.$E.get_index());if(index<0||index>=this.$11.length){throw tab._TableauException.createIndexOutOfRange(index);}var $0=new tab._Deferred();var $1={};$1['api.storyPointIndex']=index;var $2=new tab._CommandReturnHandler('api.RevertStoryPoint',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;this.$14(index,$1_0);$0.resolve(this.$11[index]);}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($1,$2);return $0.get_promise();},$13:function($p0){if($p0!=='api.ActivatePreviousStoryPoint'&&$p0!=='api.ActivateNextStoryPoint'){throw tab._TableauException.createInternalError("commandName '"+$p0+"' is invalid.");}var $0=new tab._Deferred();var $1=this.get_activeStoryPointImpl();var $2={};var $3=new tab._CommandReturnHandler($p0,0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;this.$15($1,$1_0);$0.resolve(this.$E.get_storyPoint());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($2,$3);return $0.get_promise();},$14:function($p0,$p1){var $0=this.$11[$p0]._impl;if($0.storyPointId!==$p1.storyPointId){throw tab._TableauException.createInternalError("We should not be updating a story point where the IDs don't match. Existing storyPointID="+$0.storyPointId+', newStoryPointID='+$p1.storyPointId);}$0.caption=$p1.caption;$0.isUpdated=$p1.isUpdated;if($p1.storyPointId===this.$E.get_storyPointId()){this.$E.set_isUpdated($p1.isUpdated);}},$15:function($p0,$p1){var $0=$p1.index;if($p0.get_index()===$0){return;}var $1=this.$11[$p0.get_index()];var $2=this.$11[$0]._impl;var $3=tab._StoryPointImpl.createContainedSheet($p1.containedSheetInfo,this.get_workbookImpl(),this.get_messagingOptions(),this.$F);$2.isActive=true;this.$E=new tab._StoryPointImpl($2,$3);$p0.set_isActive(false);$1._impl.isActive=false;this.$16($1,this.$E.get_storyPoint());},$16:function($p0,$p1){if(this.$12!=null){this.$12($p0,$p1);}}}
tab._StoryPointImpl=function(storyPointInfoImpl,containedSheetImpl){this.$2=storyPointInfoImpl.isActive;this.$3=storyPointInfoImpl.isUpdated;this.$0=storyPointInfoImpl.caption;this.$1=storyPointInfoImpl.index;this.$5=storyPointInfoImpl.parentStoryImpl;this.$7=storyPointInfoImpl.storyPointId;this.$4=containedSheetImpl;if(ss.isValue(containedSheetImpl)){this.$4.set_parentStoryPointImpl(this);if(containedSheetImpl.get_sheetType()==='dashboard'){var $0=this.$4;for(var $1=0;$1<$0.get_worksheets().get__length();$1++){var $2=$0.get_worksheets().get_item($1);$2._impl.set_parentStoryPointImpl(this);}}}}
tab._StoryPointImpl.createContainedSheet=function(containedSheetInfo,workbookImpl,messagingOptions,findSheetFunc){var $0=containedSheetInfo.sheetType;var $1=-1;var $2=tab.SheetSizeFactory.createAutomatic();var $3=false;var $4=findSheetFunc(containedSheetInfo.name);var $5=ss.isNullOrUndefined($4);var $6=($5)?'':$4.getUrl();var $7=tab.$create__SheetInfoImpl(containedSheetInfo.name,$0,$1,$2,workbookImpl.get_workbook(),$6,$3,$5,containedSheetInfo.zoneId);if(containedSheetInfo.sheetType==='worksheet'){var $8=null;var $9=new tab._WorksheetImpl($7,workbookImpl,messagingOptions,$8);return $9;}else if(containedSheetInfo.sheetType==='dashboard'){var $A=new tab._DashboardImpl($7,workbookImpl,messagingOptions);var $B=tab._WorkbookImpl.$8(containedSheetInfo.dashboardZones);$A.$11($B,findSheetFunc);return $A;}else if(containedSheetInfo.sheetType==='story'){throw tab._TableauException.createInternalError('Cannot have a story embedded within another story.');}else{throw tab._TableauException.createInternalError("Unknown sheet type '"+containedSheetInfo.sheetType+"'");}}
tab._StoryPointImpl.prototype={$0:null,$1:0,$2:false,$3:false,$4:null,$5:null,$6:null,$7:0,get_caption:function(){return this.$0;},get_containedSheetImpl:function(){return this.$4;},get_index:function(){return this.$1;},get_isActive:function(){return this.$2;},set_isActive:function(value){this.$2=value;return value;},get_isUpdated:function(){return this.$3;},set_isUpdated:function(value){this.$3=value;return value;},get_parentStoryImpl:function(){return this.$5;},get_storyPoint:function(){if(this.$6==null){this.$6=new tableauSoftware.StoryPoint(this);}return this.$6;},get_storyPointId:function(){return this.$7;},$8:function(){return tab.$create__StoryPointInfoImpl(this.$0,this.$1,this.$7,this.$2,this.$3,this.$5);}}
tab.StoryPointInfoImplUtil=function(){}
tab.StoryPointInfoImplUtil.clone=function(impl){return tab.$create__StoryPointInfoImpl(impl.caption,impl.index,impl.storyPointId,impl.isActive,impl.isUpdated,impl.parentStoryImpl);}
tab._TableauException=function(){}
tab._TableauException.create=function(id,message){var $0=new Error(message);$0.tableauSoftwareErrorCode=id;return $0;}
tab._TableauException.createInternalError=function(details){if(ss.isValue(details)){return tab._TableauException.create('internalError','Internal error. Please contact Tableau support with the following information: '+details);}else{return tab._TableauException.create('internalError','Internal error. Please contact Tableau support');}}
tab._TableauException.createInternalNullArgumentException=function(argumentName){return tab._TableauException.createInternalError("Null/undefined argument '"+argumentName+"'.");}
tab._TableauException.createInternalStringArgumentException=function(argumentName){return tab._TableauException.createInternalError("Invalid string argument '"+argumentName+"'.");}
tab._TableauException.createServerError=function(message){return tab._TableauException.create('serverError',message);}
tab._TableauException.createNotActiveSheet=function(){return tab._TableauException.create('notActiveSheet','Operation not allowed on non-active sheet');}
tab._TableauException.createInvalidCustomViewName=function(customViewName){return tab._TableauException.create('invalidCustomViewName','Invalid custom view name: '+customViewName);}
tab._TableauException.createInvalidParameter=function(paramName){return tab._TableauException.create('invalidParameter','Invalid parameter: '+paramName);}
tab._TableauException.createInvalidFilterFieldNameOrValue=function(fieldName){return tab._TableauException.create('invalidFilterFieldNameOrValue','Invalid filter field name or value: '+fieldName);}
tab._TableauException.createInvalidDateParameter=function(paramName){return tab._TableauException.create('invalidDateParameter','Invalid date parameter: '+paramName);}
tab._TableauException.createNullOrEmptyParameter=function(paramName){return tab._TableauException.create('nullOrEmptyParameter','Parameter cannot be null or empty: '+paramName);}
tab._TableauException.createMissingMaxSize=function(){return tab._TableauException.create('missingMaxSize','Missing maxSize for SheetSizeBehavior.ATMOST');}
tab._TableauException.createMissingMinSize=function(){return tab._TableauException.create('missingMinSize','Missing minSize for SheetSizeBehavior.ATLEAST');}
tab._TableauException.createMissingMinMaxSize=function(){return tab._TableauException.create('missingMinMaxSize','Missing minSize or maxSize for SheetSizeBehavior.RANGE');}
tab._TableauException.createInvalidRangeSize=function(){return tab._TableauException.create('invalidSize','Missing minSize or maxSize for SheetSizeBehavior.RANGE');}
tab._TableauException.createInvalidSizeValue=function(){return tab._TableauException.create('invalidSize','Size value cannot be less than zero');}
tab._TableauException.createInvalidSheetSizeParam=function(){return tab._TableauException.create('invalidSize','Invalid sheet size parameter');}
tab._TableauException.createSizeConflictForExactly=function(){return tab._TableauException.create('invalidSize','Conflicting size values for SheetSizeBehavior.EXACTLY');}
tab._TableauException.createInvalidSizeBehaviorOnWorksheet=function(){return tab._TableauException.create('invalidSizeBehaviorOnWorksheet','Only SheetSizeBehavior.AUTOMATIC is allowed on Worksheets');}
tab._TableauException.createNoUrlForHiddenWorksheet=function(){return tab._TableauException.create('noUrlForHiddenWorksheet','Hidden worksheets do not have a URL.');}
tab._TableauException.$0=function($p0){return tab._TableauException.create('invalidAggregationFieldName',"Invalid aggregation type for field '"+$p0+"'");}
tab._TableauException.createIndexOutOfRange=function(index){return tab._TableauException.create('indexOutOfRange',"Index '"+index+"' is out of range.");}
tab._TableauException.createUnsupportedEventName=function(eventName){return tab._TableauException.create('unsupportedEventName',"Unsupported event '"+eventName+"'.");}
tab._TableauException.createBrowserNotCapable=function(){return tab._TableauException.create('browserNotCapable','This browser is incapable of supporting the Tableau JavaScript API.');}
tab._Utility=function(){}
tab._Utility.hasOwnProperty=function(value,field){return value.hasOwnProperty(field);}
tab._Utility.isNullOrEmpty=function(value){return ss.isNullOrUndefined(value)||(value['length']||0)<=0;}
tab._Utility.isString=function(value){return typeof(value)==='string';}
tab._Utility.isNumber=function(value){return typeof(value)==='number';}
tab._Utility.isDate=function(value){if(typeof(value) === 'object' && (value instanceof Date)){return true;}else if(Object.prototype.toString.call(value) !== '[object Date]'){return false;}return !isNaN((value).getTime());}
tab._Utility.isDateValid=function(dt){return !isNaN(dt.getTime());}
tab._Utility.indexOf=function(array,searchElement,fromIndex){if(ss.isValue((Array).prototype['indexOf'])){return array.indexOf(searchElement,fromIndex);}fromIndex=(fromIndex||0);var $0=array.length;if($0>0){for(var $1=fromIndex;$1<$0;$1++){if(array[$1]===searchElement){return $1;}}}return -1;}
tab._Utility.contains=function(array,searchElement,fromIndex){var $0=tab._Utility.indexOf(array,searchElement,fromIndex);return $0>=0;}
tab._Utility.getTopmostWindow=function(){var $0=window.self;while(ss.isValue($0.parent)&&$0.parent!==$0){$0=$0.parent;}return $0;}
tab._Utility.toInt=function(value){if(tab._Utility.isNumber(value)){return value;}return parseInt(value.toString(),10);}
tab._Utility.hasClass=function(element,className){var $0=new RegExp('[\\n\\t\\r]','g');return ss.isValue(element)&&(' '+element.className+' ').replace($0,' ').indexOf(' '+className+' ')>-1;}
tab._Utility.findParentWithClassName=function(element,className,stopAtElement){var $0=(ss.isValue(element))?element.parentNode:null;stopAtElement=(stopAtElement||document.body);while($0!=null){if(tab._Utility.hasClass($0,className)){return $0;}if($0===stopAtElement){$0=null;}else{$0=$0.parentNode;}}return $0;}
tab._Utility.hasJsonParse=function(){return ss.isValue(window.JSON)&&ss.isValue(window.JSON.parse);}
tab._Utility.hasWindowPostMessage=function(){return ss.isValue(window.postMessage);}
tab._Utility.isPostMessageSynchronous=function(){if(tab._Utility.isIE()){var $0=new RegExp('(msie) ([\\w.]+)');var $1=$0.exec(window.navigator.userAgent.toLowerCase());var $2=($1[2]||'0');var $3=parseInt($2,10);return $3<=8;}return false;}
tab._Utility.hasDocumentAttachEvent=function(){return ss.isValue(document.attachEvent);}
tab._Utility.hasWindowAddEventListener=function(){return ss.isValue(window.addEventListener);}
tab._Utility.isElementOfTag=function(element,tagName){return ss.isValue(element)&&element.nodeType===1&&element.tagName.toLowerCase()===tagName.toLowerCase();}
tab._Utility.elementToString=function(element){var $0=new ss.StringBuilder();$0.append(element.tagName.toLowerCase());if(!tab._Utility.isNullOrEmpty(element.id)){$0.append('#').append(element.id);}if(!tab._Utility.isNullOrEmpty(element.className)){var $1=element.className.split(' ');$0.append('.').append($1.join('.'));}return $0.toString();}
tab._Utility.tableauGCS=function(e){if(ss.isValue(window.getComputedStyle)){return window.getComputedStyle(e);}else{return e.currentStyle;}}
tab._Utility.isIE=function(){return window.navigator.userAgent.indexOf('MSIE')>-1&&ss.isNullOrUndefined(window.opera);}
tab._Utility.isSafari=function(){var $0=window.navigator.userAgent;var $1=$0.indexOf('Chrome')>=0;return $0.indexOf('Safari')>=0&&!$1;}
tab._Utility.mobileDetect=function(){var $0=window.navigator.userAgent;if($0.indexOf('iPad')!==-1){return true;}if($0.indexOf('Android')!==-1){return true;}if(($0.indexOf('AppleWebKit')!==-1)&&($0.indexOf('Mobile')!==-1)){return true;}return false;}
tab._Utility.elementOffset=function(element){var $0=null;$0 = element.getBoundingClientRect();var $1=$0.top;var $2=$0.left;var $3=new tab.WindowHelper(window.self);var $4=window.document.documentElement;var $5=$2+$3.get_pageXOffset()-$4.clientLeft;var $6=$1+$3.get_pageYOffset()-$4.clientTop;return tab.$create_Point($5,$6);}
tab._Utility.convertRawValue=function(rawValue,dataType){if(ss.isNullOrUndefined(rawValue)){return null;}switch(dataType){case 'bool':return rawValue;case 'date':return new Date(rawValue);case 'number':if(rawValue==null){return Number.NaN;}return rawValue;case 'string':default:return rawValue;}}
tab._Utility.getDataValue=function(dv){if(ss.isNullOrUndefined(dv)){return tab.$create_DataValue(null,null,null);}return tab.$create_DataValue(tab._Utility.convertRawValue(dv.value,dv.type),dv.formattedValue,dv.aliasedValue);}
tab._Utility.serializeDateForServer=function(date){var $0='';if(ss.isValue(date)&&tab._Utility.isDate(date)){var $1=date.getUTCFullYear();var $2=date.getUTCMonth()+1;var $3=date.getUTCDate();var $4=date.getUTCHours();var $5=date.getUTCMinutes();var $6=date.getUTCSeconds();$0=$1+'-'+$2+'-'+$3+' '+$4+':'+$5+':'+$6;}return $0;}
tab._Utility.computeContentSize=function(element){var $0=tab._Utility.$0(element);var $1=parseFloat($0.paddingLeft);var $2=parseFloat($0.paddingTop);var $3=parseFloat($0.paddingRight);var $4=parseFloat($0.paddingBottom);var $5=element.clientWidth-Math.round($1+$3);var $6=element.clientHeight-Math.round($2+$4);return tab.$create_Size($5,$6);}
tab._Utility.$0=function($p0){if(ss.isValue(window.getComputedStyle)){if(ss.isValue($p0.ownerDocument.defaultView.opener)){return $p0.ownerDocument.defaultView.getComputedStyle($p0,null);}return window.getComputedStyle($p0,null);}else if(ss.isValue($p0.currentStyle)){return $p0.currentStyle;}return $p0.style;}
tab.VizImpl=function(messageRouter,viz,parentElement,url,options){if(!tab._Utility.hasWindowPostMessage()||!tab._Utility.hasJsonParse()){throw tab._TableauException.createBrowserNotCapable();}this.$D=new tab.CrossDomainMessagingOptions(messageRouter,this);this.$1=viz;if(ss.isNullOrUndefined(parentElement)||parentElement.nodeType!==1){parentElement=document.body;}this.$3=new tab._VizParameters(parentElement,url,options);if(ss.isValue(options)){this.$7=options.onFirstInteractive;this.$8=options.onFirstVizSizeKnown;}}
tab.VizImpl.prototype={$0:null,$1:null,$2:null,$3:null,$4:null,$5:null,$6:null,$7:null,$8:null,$9:false,$A:false,$B:false,$C:false,$D:null,$E:null,$F:null,$10:false,add_customViewsListLoad:function(value){this.$11=ss.Delegate.combine(this.$11,value);},remove_customViewsListLoad:function(value){this.$11=ss.Delegate.remove(this.$11,value);},$11:null,add_stateReadyForQuery:function(value){this.$12=ss.Delegate.combine(this.$12,value);},remove_stateReadyForQuery:function(value){this.$12=ss.Delegate.remove(this.$12,value);},$12:null,add_$13:function($p0){this.$14=ss.Delegate.combine(this.$14,$p0);},remove_$13:function($p0){this.$14=ss.Delegate.remove(this.$14,$p0);},$14:null,add_$15:function($p0){this.$16=ss.Delegate.combine(this.$16,$p0);},remove_$15:function($p0){this.$16=ss.Delegate.remove(this.$16,$p0);},$16:null,add_$17:function($p0){this.$18=ss.Delegate.combine(this.$18,$p0);},remove_$17:function($p0){this.$18=ss.Delegate.remove(this.$18,$p0);},$18:null,add_$19:function($p0){this.$1A=ss.Delegate.combine(this.$1A,$p0);},remove_$19:function($p0){this.$1A=ss.Delegate.remove(this.$1A,$p0);},$1A:null,add_$1B:function($p0){this.$1C=ss.Delegate.combine(this.$1C,$p0);},remove_$1B:function($p0){this.$1C=ss.Delegate.remove(this.$1C,$p0);},$1C:null,add_$1D:function($p0){this.$1E=ss.Delegate.combine(this.$1E,$p0);},remove_$1D:function($p0){this.$1E=ss.Delegate.remove(this.$1E,$p0);},$1E:null,add_$1F:function($p0){this.$20=ss.Delegate.combine(this.$20,$p0);},remove_$1F:function($p0){this.$20=ss.Delegate.remove(this.$20,$p0);},$20:null,add_$21:function($p0){this.$22=ss.Delegate.combine(this.$22,$p0);},remove_$21:function($p0){this.$22=ss.Delegate.remove(this.$22,$p0);},$22:null,add_$23:function($p0){this.$24=ss.Delegate.combine(this.$24,$p0);},remove_$23:function($p0){this.$24=ss.Delegate.remove(this.$24,$p0);},$24:null,add_$25:function($p0){this.$26=ss.Delegate.combine(this.$26,$p0);},remove_$25:function($p0){this.$26=ss.Delegate.remove(this.$26,$p0);},$26:null,get_handlerId:function(){return this.$3.handlerId;},set_handlerId:function(value){this.$3.handlerId=value;return value;},get_iframe:function(){return this.$2;},get_instanceId:function(){return this.$5;},get_serverRoot:function(){return this.$3.serverRoot;},get_$27:function(){return this.$1;},get_$28:function(){return this.$A;},get_$29:function(){return this.$B;},get_$2A:function(){return this.$2.style.display==='none';},get_$2B:function(){return this.$3.parentElement;},get_$2C:function(){return this.$3.get_baseUrl();},get_$2D:function(){return this.$6.get_workbook();},get__workbookImpl:function(){return this.$6;},get_$2E:function(){return this.$C;},get_$2F:function(){return this.$E;},getCurrentUrlAsync:function(){var $0=new tab._Deferred();var $1=new tab._CommandReturnHandler('api.GetCurrentUrlCommand',0,function($p1_0){
$0.resolve($p1_0);},function($p1_0,$p1_1){
$0.reject(tab._TableauException.createInternalError($p1_1));});this._sendCommand(null,$1);return $0.get_promise();},handleVizLoad:function(){this.$47();if(ss.isNullOrUndefined(this.$6)){this.$6=new tab._WorkbookImpl(this,this.$D,ss.Delegate.create(this,function(){
this.$54();}));}else if(!this.$10){this.$6._update(ss.Delegate.create(this,function(){
this.$54();}));}},$30:function($p0){var $0=this.$E.chromeHeight;var $1=this.$E.sheetSize;var $2=0;var $3=0;if($1.behavior==='exactly'){$2=$1.maxSize.width;$3=$1.maxSize.height+$0;}else{var $4;var $5;var $6;var $7;switch($1.behavior){case 'range':$4=$1.minSize.width;$5=$1.maxSize.width;$6=$1.minSize.height+$0;$7=$1.maxSize.height+$0;$2=Math.max($4,Math.min($5,$p0.width));$3=Math.max($6,Math.min($7,$p0.height));break;case 'atleast':$4=$1.minSize.width;$6=$1.minSize.height+$0;$2=Math.max($4,$p0.width);$3=Math.max($6,$p0.height);break;case 'atmost':$5=$1.maxSize.width;$7=$1.maxSize.height+$0;$2=Math.min($5,$p0.width);$3=Math.min($7,$p0.height);break;case 'automatic':$2=$p0.width;$3=Math.max($p0.height,$0);break;default:throw tab._TableauException.createInternalError('Unknown SheetSizeBehavior for viz: '+$1.behavior);}}return tab.$create_Size($2,$3);},$31:function(){var $0;if(ss.isValue(this.$4)){$0=this.$4;this.$4=null;}else{$0=tab._Utility.computeContentSize(this.get_$2B());}this.$50($0);return this.$30($0);},$32:function(){var $0=this.$31();this.$42($0.width+'px',$0.height+'px');var $1=10;for(var $2=0;$2<$1;$2++){var $3=this.$31();if(JSON.stringify($0)===JSON.stringify($3)){return;}$0=$3;this.$42($0.width+'px',$0.height+'px');}throw tab._TableauException.create('maxVizResizeAttempts','Viz resize limit hit. The calculated iframe size did not stabilize after '+$1+' resizes.');},handleEventNotification:function(eventName,eventParameters){var $0=tab._ApiServerNotification.deserialize(eventParameters);if(eventName==='api.FirstVizSizeKnownEvent'){var $1=JSON.parse($0.get_data());this.$5B($1);}else if(eventName==='api.VizInteractiveEvent'){this.$5=$0.get_data();if(ss.isValue(this.$6)&&this.$6.get_name()===$0.get_workbookName()){this.$54();}this.$4E();}else if(eventName==='api.MarksSelectionChangedEvent'){if(this.$14!=null){if(this.$6.get_name()===$0.get_workbookName()){var $2=null;var $3=this.$6.get_activeSheetImpl();if($3.get_name()===$0.get_worksheetName()){$2=$3;}else if($3.get_isDashboard()){var $4=$3;$2=$4.get_worksheets()._get($0.get_worksheetName())._impl;}if(ss.isValue($2)){$2.set_selectedMarks(null);this.$14(new tab.MarksEvent('marksselection',this.$1,$2));}}}}else if(eventName==='api.FilterChangedEvent'){if(this.$16!=null){if(this.$6.get_name()===$0.get_workbookName()){var $5=null;var $6=this.$6.get_activeSheetImpl();if($6.get_name()===$0.get_worksheetName()){$5=$6;}else if($6.get_isDashboard()){var $7=$6;$5=$7.get_worksheets()._get($0.get_worksheetName())._impl;}if(ss.isValue($5)){var $8=JSON.parse($0.get_data());var $9=$8[0];var $A=$8[1];this.$16(new tab.FilterEvent('filterchange',this.$1,$5,$9,$A));}}}}else if(eventName==='api.ParameterChangedEvent'){if(this.$18!=null){if(this.$6.get_name()===$0.get_workbookName()){this.$6.set_$22(null);var $B=$0.get_data();this.$48($B);}}}else if(eventName==='api.CustomViewsListLoadedEvent'){var $C=JSON.parse($0.get_data());var $D=ss.Delegate.create(this,function(){
tab._CustomViewImpl._processCustomViews(this.$6,this.$D,$C);});var $E=ss.Delegate.create(this,function(){
this.$4F();if(this.$1A!=null&&!$C.customViewLoaded){this.$49(this.$6.get_activeCustomView());}});if(ss.isNullOrUndefined(this.$6)){this.$10=true;this.$6=new tab._WorkbookImpl(this,this.$D,ss.Delegate.create(this,function(){
$D();this.$54($E);this.$10=false;}));}else{$D();this.$55($E);}}else if(eventName==='api.CustomViewUpdatedEvent'){var $F=JSON.parse($0.get_data());if(ss.isNullOrUndefined(this.$6)){this.$6=new tab._WorkbookImpl(this,this.$D,ss.Delegate.create(this,function(){
this.$54();}));}if(ss.isValue(this.$6)){tab._CustomViewImpl._processCustomViewUpdate(this.$6,this.$D,$F,true);}if(this.$1C!=null){var $10=this.$6.get_$18()._toApiCollection();for(var $11=0,$12=$10.length;$11<$12;$11++){this.$4A($10[$11]);}}}else if(eventName==='api.CustomViewRemovedEvent'){if(this.$1E!=null){var $13=this.$6.get_$19()._toApiCollection();for(var $14=0,$15=$13.length;$14<$15;$14++){this.$4B($13[$14]);}}}else if(eventName==='api.CustomViewSetDefaultEvent'){var $16=JSON.parse($0.get_data());if(ss.isValue(this.$6)){tab._CustomViewImpl._processCustomViews(this.$6,this.$D,$16);}if(this.$20!=null){var $17=this.$6.get_$18()._toApiCollection();for(var $18=0,$19=$17.length;$18<$19;$18++){this.$4C($17[$18]);}}}else if(eventName==='api.TabSwitchEvent'){this.$6._update(ss.Delegate.create(this,function(){
if(ss.isValue(this.$0)){this.$0();}if(this.$6.get_name()===$0.get_workbookName()){var $1_0=$0.get_worksheetName();var $1_1=$0.get_data();this.$4D($1_0,$1_1);}this.$54();}));}else if(eventName==='api.StorytellingStateChangedEvent'){var $1A=this.$6.get_activeSheetImpl();if($1A.get_sheetType()==='story'){$1A.update(JSON.parse($0.get_data()));}}},addEventListener:function(eventName,handler){var $0=tab._Enums.$7(eventName);if($0==='marksselection'){this.add_$13(handler);}else if($0==='parametervaluechange'){this.add_$17(handler);}else if($0==='filterchange'){this.add_$15(handler);}else if($0==='customviewload'){this.add_$19(handler);}else if($0==='customviewsave'){this.add_$1B(handler);}else if($0==='customviewremove'){this.add_$1D(handler);}else if($0==='customviewsetdefault'){this.add_$1F(handler);}else if($0==='tabswitch'){this.add_$21(handler);}else if($0==='storypointswitch'){this.add_$23(handler);}else if($0==='vizresize'){this.add_$25(handler);}else{throw tab._TableauException.createUnsupportedEventName(eventName);}},removeEventListener:function(eventName,handler){var $0=tab._Enums.$7(eventName);if($0==='marksselection'){this.remove_$13(handler);}else if($0==='parametervaluechange'){this.remove_$17(handler);}else if($0==='filterchange'){this.remove_$15(handler);}else if($0==='customviewload'){this.remove_$19(handler);}else if($0==='customviewsave'){this.remove_$1B(handler);}else if($0==='customviewremove'){this.remove_$1D(handler);}else if($0==='customviewsetdefault'){this.remove_$1F(handler);}else if($0==='tabswitch'){this.remove_$21(handler);}else if($0==='storypointswitch'){this.remove_$23(handler);}else if($0==='vizresize'){this.remove_$25(handler);}else{throw tab._TableauException.createUnsupportedEventName(eventName);}},$33:function(){if(ss.isValue(this.$2)){this.$2.parentNode.removeChild(this.$2);this.$2=null;}tab._VizManagerImpl.$3(this.$1);this.$D.get_router().unregisterHandler(this);this.$5C();},$34:function(){this.$2.style.display='block';this.$2.style.visibility='visible';},$35:function(){this.$2.style.display='none';},$36:function(){this.$2.style.visibility='hidden';},$37:function(){this.$53('showExportImageDialog');},$38:function($p0){var $0=this.$51($p0);this.$53('showExportDataDialog',$0);},$39:function($p0){var $0=this.$51($p0);this.$53('showExportCrosstabDialog',$0);},$3A:function(){this.$53('showExportPDFDialog');},$3B:function(){var $0=new tab._Deferred();var $1=new tab._CommandReturnHandler('api.RevertAllCommand',1,function($p1_0){
$0.resolve();},function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this._sendCommand(null,$1);return $0.get_promise();},$3C:function(){var $0=new tab._Deferred();var $1=new tab._CommandReturnHandler('api.RefreshDataCommand',1,function($p1_0){
$0.resolve();},function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this._sendCommand(null,$1);return $0.get_promise();},$3D:function(){this.$53('showShareDialog');},$3E:function(){if(this.get__workbookImpl().get_isDownloadAllowed()){this.$53('showDownloadWorkbookDialog');}else{throw tab._TableauException.create('downloadWorkbookNotAllowed','Download workbook is not allowed');}},$3F:function(){return this.$52('pauseAutomaticUpdates');},$40:function(){return this.$52('resumeAutomaticUpdates');},$41:function(){return this.$52('toggleAutomaticUpdates');},$42:function($p0,$p1){this.$3.width=$p0;this.$3.height=$p1;this.$2.style.width=this.$3.width;this.$2.style.height=this.$3.height;},$43:function($p0,$p1){this.$50(tab.$create_Size(-1,-1));this.$42($p0,$p1);this.$6._updateActiveSheetAsync();},$44:function($p0){this.$C=$p0;},$45:function(){return this.$3.parentElement;},$46:function(){try{tab._VizManagerImpl.$2(this.$1);}catch($0){this.$33();throw $0;}if(!this.$3.fixedSize){this.$4=tab._Utility.computeContentSize(this.get_$2B());if(!this.$4.width||!this.$4.height){this.$4=tab.$create_Size(800,600);}this.$2=this.$58();this.$36();}else{this.$2=this.$58();this.$34();}if(!tab._Utility.hasWindowPostMessage()){if(tab._Utility.isIE()){this.$2.onreadystatechange=this.$5A();}else{this.$2.onload=this.$5A();}}this.$B=!this.$3.toolbar;this.$A=!this.$3.tabs;this.$D.get_router().registerHandler(this);this.$2.src=this.$3.get_url();},$47:function(){if(!tab._Utility.hasWindowPostMessage()||ss.isNullOrUndefined(this.$2)||!ss.isValue(this.$2.contentWindow)){return;}var $0=tab._Utility.elementOffset(this.$2);var $1=[];$1.push('vizOffsetResp');$1.push($0.x);$1.push($0.y);this.$2.contentWindow.postMessage($1.join(','),'*');},_sendCommand:function($p0,$p1){this.$D.sendCommand($p0,$p1);},$48:function($p0){if(this.$18!=null){this.$18(new tab.ParameterEvent('parametervaluechange',this.$1,$p0));}},$49:function($p0){if(this.$1A!=null){this.$1A(new tab.CustomViewEvent('customviewload',this.$1,(ss.isValue($p0))?$p0._impl:null));}},$4A:function($p0){if(this.$1C!=null){this.$1C(new tab.CustomViewEvent('customviewsave',this.$1,$p0._impl));}},$4B:function($p0){if(this.$1E!=null){this.$1E(new tab.CustomViewEvent('customviewremove',this.$1,$p0._impl));}},$4C:function($p0){if(this.$20!=null){this.$20(new tab.CustomViewEvent('customviewsetdefault',this.$1,$p0._impl));}},$4D:function($p0,$p1){if(this.$22!=null){this.$22(new tab.TabSwitchEvent('tabswitch',this.$1,$p0,$p1));}},raiseStoryPointSwitch:function(oldStoryPointInfo,newStoryPoint){if(this.$24!=null){this.$24(new tab.StoryPointSwitchEvent('storypointswitch',this.$1,oldStoryPointInfo,newStoryPoint));}},$4E:function(){if(this.$12!=null){this.$12(this);}},$4F:function(){if(this.$11!=null){this.$11(this);}},$50:function($p0){if(this.$26!=null){this.$26(new tab.VizResizeEvent('vizresize',this.$1,$p0));}},$51:function($p0){if(ss.isNullOrUndefined($p0)){return null;}var $0=this.$6.$A($p0);if(ss.isNullOrUndefined($0)){throw tab._TableauException.createNotActiveSheet();}return $0.get_name();},$52:function($p0){if($p0!=='pauseAutomaticUpdates'&&$p0!=='resumeAutomaticUpdates'&&$p0!=='toggleAutomaticUpdates'){throw tab._TableauException.createInternalError(null);}var $0={};$0['api.invokeCommandName']=$p0;var $1=new tab._Deferred();var $2=new tab._CommandReturnHandler('api.InvokeCommandCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;if(ss.isValue($1_0)&&ss.isValue($1_0.isAutoUpdate)){this.$C=!$1_0.isAutoUpdate;}$1.resolve(this.$C);}),function($p1_0,$p1_1){
$1.reject(tab._TableauException.createServerError($p1_1));});this._sendCommand($0,$2);return $1.get_promise();},$53:function($p0,$p1){if($p0!=='showExportImageDialog'&&$p0!=='showExportDataDialog'&&$p0!=='showExportCrosstabDialog'&&$p0!=='showExportPDFDialog'&&$p0!=='showShareDialog'&&$p0!=='showDownloadWorkbookDialog'){throw tab._TableauException.createInternalError(null);}var $0={};$0['api.invokeCommandName']=$p0;if(ss.isValue($p1)){$0['api.invokeCommandParam']=$p1;}var $1=new tab._CommandReturnHandler('api.InvokeCommandCommand',0,null,null);this._sendCommand($0,$1);},$54:function($p0){if(!this.$9){var $0=this.$7;window.setTimeout(ss.Delegate.create(this,function(){
if(ss.isValue($0)){$0(new tab.TableauEvent('firstinteractive',this.$1));}if(ss.isValue($p0)){$p0();}}),0);this.$9=true;}this.$4E();},$55:function($p0){var $0=new Date();var $1=null;$1=ss.Delegate.create(this,function(){
var $1_0=new Date();if(this.$9){$p0();}else if($1_0-$0>5*60*1000){throw tab._TableauException.createInternalError('Timed out while waiting for the viz to become interactive');}else{window.setTimeout($1,10);}});$1();},$56:function(){if(tab._Utility.isIE()){if(this.$2.readyState==='complete'){this.handleVizLoad();}}else{this.handleVizLoad();}},$57:function(){window.setTimeout(ss.Delegate.create(this,this.$56),3000);},$58:function(){if(ss.isNullOrUndefined(this.$45())){return null;}var $0=document.createElement('IFrame');$0.frameBorder='0';$0.setAttribute('allowTransparency','true');$0.marginHeight='0';$0.marginWidth='0';$0.style.display='block';if(this.$3.fixedSize){$0.style.width=this.$3.width;$0.style.height=this.$3.height;}else{$0.style.width='1px';$0.style.height='1px';$0.setAttribute('scrolling','no');}if(tab._Utility.isSafari()){$0.addEventListener('mousewheel',ss.Delegate.create(this,this.$59),false);}this.$45().appendChild($0);return $0;},$59:function($p0){},$5A:function(){return ss.Delegate.create(this,function($p1_0){
this.$57();});},$5B:function($p0){var $0=tab.SheetSizeFactory.fromSizeConstraints($p0.sizeConstraints);this.$E=tab.$create_VizSize($0,$p0.chromeHeight);if(ss.isValue(this.$8)){this.$8(new tab.FirstVizSizeKnownEvent('firstvizsizeknown',this.$1,this.$E));}if(this.$3.fixedSize){return;}this.$32();this.$5D();this.$34();},$5C:function(){if(ss.isNullOrUndefined(this.$F)){return;}if(tab._Utility.hasWindowAddEventListener()){window.removeEventListener('resize',this.$F,false);}else{window.self.detachEvent('onresize', this.$F);}this.$F=null;},$5D:function(){if(ss.isValue(this.$F)){return;}this.$F=ss.Delegate.create(this,function(){
this.$32();});if(tab._Utility.hasWindowAddEventListener()){window.addEventListener('resize',this.$F,false);}else{window.self.attachEvent('onresize', this.$F);}}}
tab._VizManagerImpl=function(){}
tab._VizManagerImpl.get_$1=function(){return tab._VizManagerImpl.$0.concat();}
tab._VizManagerImpl.$2=function($p0){tab._VizManagerImpl.$5($p0);tab._VizManagerImpl.$0.push($p0);}
tab._VizManagerImpl.$3=function($p0){for(var $0=0,$1=tab._VizManagerImpl.$0.length;$0<$1;$0++){if(tab._VizManagerImpl.$0[$0]===$p0){tab._VizManagerImpl.$0.splice($0,1);break;}}}
tab._VizManagerImpl.$4=function(){for(var $0=0,$1=tab._VizManagerImpl.$0.length;$0<$1;$0++){tab._VizManagerImpl.$0[$0]._impl.$47();}}
tab._VizManagerImpl.$5=function($p0){var $0=$p0.getParentElement();for(var $1=0,$2=tab._VizManagerImpl.$0.length;$1<$2;$1++){if(tab._VizManagerImpl.$0[$1].getParentElement()===$0){var $3="Another viz is already present in element '"+tab._Utility.elementToString($0)+"'.";throw tab._TableauException.create('vizAlreadyInManager',$3);}}}
tab._VizParameters=function(element,url,options){if(ss.isNullOrUndefined(element)||ss.isNullOrUndefined(url)){throw tab._TableauException.create('noUrlOrParentElementNotFound','URL is empty or Parent element not found');}if(ss.isNullOrUndefined(options)){options={};options.hideTabs=false;options.hideToolbar=false;options.onFirstInteractive=null;}if(ss.isValue(options.height)||ss.isValue(options.width)){this.fixedSize=true;if(tab._Utility.isNumber(options.height)){options.height=options.height.toString()+'px';}if(tab._Utility.isNumber(options.width)){options.width=options.width.toString()+'px';}this.height=(ss.isValue(options.height))?options.height.toString():null;this.width=(ss.isValue(options.width))?options.width.toString():null;}else{this.fixedSize=false;}this.tabs=!(options.hideTabs||false);this.toolbar=!(options.hideToolbar||false);this.parentElement=element;this.$1=options;this.toolBarPosition=options.toolbarPosition;var $0=url.split('?');this.$0=$0[0];if($0.length===2){this.userSuppliedParameters=$0[1];}else{this.userSuppliedParameters='';}var $1=new RegExp('.*?[^/:]/','').exec(this.$0);if(ss.isNullOrUndefined($1)||($1[0].toLowerCase().indexOf('http://')===-1&&$1[0].toLowerCase().indexOf('https://')===-1)){throw tab._TableauException.create('invalidUrl','Invalid url');}this.host_url=$1[0].toLowerCase();this.name=this.$0.replace($1[0],'');this.name=this.name.replace('views/','');this.serverRoot=decodeURIComponent(this.host_url);}
tab._VizParameters.prototype={name:'',host_url:null,tabs:false,toolbar:false,toolBarPosition:null,handlerId:null,width:null,height:null,serverRoot:null,parentElement:null,userSuppliedParameters:null,fixedSize:false,$0:null,$1:null,get_url:function(){return this.$2();},get_baseUrl:function(){return this.$0;},$2:function(){var $0=[];$0.push(this.get_baseUrl());$0.push('?');if(this.userSuppliedParameters.length>0){$0.push(this.userSuppliedParameters);$0.push('&');}$0.push(':embed=y');$0.push('&:showVizHome=n');if(!this.fixedSize){$0.push('&:bootstrapWhenNotified=y');}if(!this.tabs){$0.push('&:tabs=n');}if(!this.toolbar){$0.push('&:toolbar=n');}else if(!ss.isNullOrUndefined(this.toolBarPosition)){$0.push('&:toolbar=');$0.push(this.toolBarPosition);}var $1=this.$1;var $dict1=$1;for(var $key2 in $dict1){var $2={key:$key2,value:$dict1[$key2]};if($2.key!=='embed'&&$2.key!=='height'&&$2.key!=='width'&&$2.key!=='autoSize'&&$2.key!=='hideTabs'&&$2.key!=='hideToolbar'&&$2.key!=='onFirstInteractive'&&$2.key!=='onFirstVizSizeKnown'&&$2.key!=='toolbarPosition'&&$2.key!=='instanceIdToClone'){$0.push('&');$0.push(encodeURIComponent($2.key));$0.push('=');$0.push(encodeURIComponent($2.value.toString()));}}$0.push('&:apiID='+this.handlerId);if(ss.isValue(this.$1.instanceIdToClone)){$0.push('#'+this.$1.instanceIdToClone);}return $0.join('');}}
tab._WorkbookImpl=function(vizImpl,messagingOptions,callback){this.$5=new tab._Collection();this.$14=new tab._Collection();this.$15=new tab._Collection();this.$16=new tab._Collection();this.$1=vizImpl;this.$7=messagingOptions;this.$F(callback);}
tab._WorkbookImpl.$8=function($p0){$p0=($p0||[]);var $0=[];for(var $1=0;$1<$p0.length;$1++){var $2=$p0[$1];var $3=$2.zoneType;var $4=tab.$create_Size($2.width,$2.height);var $5=tab.$create_Point($2.x,$2.y);var $6=$2.name;var $7=tab.$create_JavaScriptApi$0($6,$3,$5,$4,$2.zoneId);$0.push($7);}return $0;}
tab._WorkbookImpl.$9=function($p0){if(ss.isNullOrUndefined($p0)){return null;}if(tab._Utility.isString($p0)){return $p0;}var $0=$p0;var $1=ss.Delegate.create($0,$0.getName);if(ss.isValue($1)){return $1();}return null;}
tab._WorkbookImpl.$D=function($p0){if(ss.isNullOrUndefined($p0)){return tab.SheetSizeFactory.createAutomatic();}return tab.SheetSizeFactory.fromSizeConstraints($p0.sizeConstraints);}
tab._WorkbookImpl.$27=function($p0){var $0=new tab._Collection();var $enum1=ss.IEnumerator.getEnumerator($p0.parameters);while($enum1.moveNext()){var $1=$enum1.current;var $2=new tab._ParameterImpl($1);$0._add($2.get_$B(),$2.get_$A());}return $0;}
tab._WorkbookImpl.$28=function($p0,$p1){var $enum1=ss.IEnumerator.getEnumerator($p1.parameters);while($enum1.moveNext()){var $0=$enum1.current;if($0.name===$p0){return new tab._ParameterImpl($0);}}return null;}
tab._WorkbookImpl.prototype={$0:null,$1:null,$2:null,$3:null,$4:null,$6:false,$7:null,get_workbook:function(){if(ss.isNullOrUndefined(this.$0)){this.$0=new tableauSoftware.Workbook(this);}return this.$0;},get_viz:function(){return this.$1.get_$27();},get_publishedSheets:function(){return this.$5;},get_name:function(){return this.$2;},get_activeSheetImpl:function(){return this.$3;},get_activeCustomView:function(){return this.$13;},get_isDownloadAllowed:function(){return this.$6;},$A:function($p0){if(ss.isNullOrUndefined(this.$3)){return null;}var $0=tab._WorkbookImpl.$9($p0);if(ss.isNullOrUndefined($0)){return null;}if($0===this.$3.get_name()){return this.$3;}if(this.$3.get_isDashboard()){var $1=this.$3;var $2=$1.get_worksheets()._get($0);if(ss.isValue($2)){return $2._impl;}}return null;},_setActiveSheetAsync:function($p0){if(tab._Utility.isNumber($p0)){var $2=$p0;if($2<this.$5.get__length()&&$2>=0){return this.$B(this.$5.get_item($2).$0);}else{throw tab._TableauException.createIndexOutOfRange($2);}}var $0=tab._WorkbookImpl.$9($p0);var $1=this.$5._get($0);if(ss.isValue($1)){return this.$B($1.$0);}else if(this.$3.get_isDashboard()){var $3=this.$3;var $4=$3.get_worksheets()._get($0);if(ss.isValue($4)){this.$4=null;var $5='';if($4.getIsHidden()){this.$4=$4._impl;}else{$5=$4._impl.get_url();}return this.$C($4._impl.get_name(),$5);}}throw tab._TableauException.create('sheetNotInWorkbook','Sheet is not found in Workbook');},_revertAllAsync:function(){var $0=new tab._Deferred();var $1=new tab._CommandReturnHandler('api.RevertAllCommand',1,function($p1_0){
$0.resolve();},function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.$E(null,$1);return $0.get_promise();},_update:function($p0){this.$F($p0);},$B:function($p0){return this.$C($p0.name,$p0.url);},$C:function($p0,$p1){var $0=new tab._Deferred();if(ss.isValue(this.$3)&&$p0===this.$3.get_name()){$0.resolve(this.$3.get_sheet());return $0.get_promise();}var $1={};$1['api.switchToSheetName']=$p0;$1['api.switchToRepositoryUrl']=$p1;$1['api.oldRepositoryUrl']=this.$3.get_url();var $2=new tab._CommandReturnHandler('api.SwitchActiveSheetCommand',0,ss.Delegate.create(this,function($p1_0){
this.$1.$0=ss.Delegate.create(this,function(){
this.$1.$0=null;$0.resolve(this.$3.get_sheet());});}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.$E($1,$2);return $0.get_promise();},_updateActiveSheetAsync:function(){var $0=new tab._Deferred();var $1={};$1['api.switchToSheetName']=this.$3.get_name();$1['api.switchToRepositoryUrl']=this.$3.get_url();$1['api.oldRepositoryUrl']=this.$3.get_url();var $2=new tab._CommandReturnHandler('api.UpdateActiveSheetCommand',0,ss.Delegate.create(this,function($p1_0){
$0.resolve(this.$3.get_sheet());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.$E($1,$2);return $0.get_promise();},$E:function($p0,$p1){this.$7.sendCommand($p0,$p1);},$F:function($p0){var $0=new tab._CommandReturnHandler('api.GetClientInfoCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;this.$10($1_0);if(ss.isValue($p0)){$p0();}}),null);this.$E(null,$0);},$10:function($p0){this.$2=$p0.workbookName;this.$6=$p0.isDownloadAllowed;this.$1.$44(!$p0.isAutoUpdate);this.$12($p0);this.$11($p0);},$11:function($p0){var $0=$p0.currentSheetName;var $1=this.$5._get($0);if(ss.isNullOrUndefined($1)&&ss.isNullOrUndefined(this.$4)){throw tab._TableauException.createInternalError('The active sheet was not specified in baseSheets');}if(ss.isValue(this.$3)&&this.$3.get_name()===$0){return;}if(ss.isValue(this.$3)){this.$3.set_isActive(false);var $2=this.$5._get(this.$3.get_name());if(ss.isValue($2)){$2.$0.isActive=false;}if(this.$3.get_sheetType()==='story'){var $3=this.$3;$3.remove_activeStoryPointChange(ss.Delegate.create(this.$1,this.$1.raiseStoryPointSwitch));}}if(ss.isValue(this.$4)){var $4=tab.$create__SheetInfoImpl(this.$4.get_name(),'worksheet',-1,this.$4.get_size(),this.get_workbook(),'',true,true,4294967295);this.$4=null;this.$3=new tab._WorksheetImpl($4,this,this.$7,null);}else{var $5=null;for(var $7=0,$8=$p0.publishedSheets.length;$7<$8;$7++){if($p0.publishedSheets[$7].name===$0){$5=$p0.publishedSheets[$7];break;}}if(ss.isNullOrUndefined($5)){throw tab._TableauException.createInternalError('No base sheet was found corresponding to the active sheet.');}var $6=ss.Delegate.create(this,function($p1_0){
return this.$5._get($p1_0);});if($5.sheetType==='dashboard'){var $9=new tab._DashboardImpl($1.$0,this,this.$7);this.$3=$9;var $A=tab._WorkbookImpl.$8($p0.dashboardZones);$9.$11($A,$6);}else if($5.sheetType==='story'){var $B=new tab._StoryImpl($1.$0,this,this.$7,$p0.story,$6);this.$3=$B;$B.add_activeStoryPointChange(ss.Delegate.create(this.$1,this.$1.raiseStoryPointSwitch));}else{this.$3=new tab._WorksheetImpl($1.$0,this,this.$7,null);}$1.$0.isActive=true;}this.$3.set_isActive(true);},$12:function($p0){var $0=$p0.publishedSheets;if(ss.isNullOrUndefined($0)){return;}for(var $1=0;$1<$0.length;$1++){var $2=$0[$1];var $3=$2.name;var $4=this.$5._get($3);var $5=tab._WorkbookImpl.$D($2);if(ss.isNullOrUndefined($4)){var $6=$3===$p0.currentSheetName;var $7=$2.sheetType;var $8=tab.$create__SheetInfoImpl($3,$7,$1,$5,this.get_workbook(),$2.repositoryUrl,$6,false,4294967295);$4=new tableauSoftware.SheetInfo($8);this.$5._add($3,$4);}else{$4.$0.size=$5;}}},$13:null,get_$17:function(){return this.$14;},set_$17:function($p0){this.$14=$p0;return $p0;},get_$18:function(){return this.$15;},set_$18:function($p0){this.$15=$p0;return $p0;},get_$19:function(){return this.$16;},set_$19:function($p0){this.$16=$p0;return $p0;},get_$1A:function(){return this.$13;},set_$1A:function($p0){this.$13=$p0;return $p0;},$1B:function(){return tab._CustomViewImpl._getCustomViewsAsync(this,this.$7);},$1C:function($p0){if(ss.isNullOrUndefined($p0)||tab._Utility.isNullOrEmpty($p0)){return tab._CustomViewImpl._showCustomViewAsync(this,this.$7,null);}else{var $0=this.$14._get($p0);if(ss.isNullOrUndefined($0)){var $1=new tab._Deferred();$1.reject(tab._TableauException.createInvalidCustomViewName($p0));return $1.get_promise();}return $0._impl._showAsync();}},$1D:function($p0){if(tab._Utility.isNullOrEmpty($p0)){throw tab._TableauException.createNullOrEmptyParameter('customViewName');}var $0=this.$14._get($p0);if(ss.isNullOrUndefined($0)){var $1=new tab._Deferred();$1.reject(tab._TableauException.createInvalidCustomViewName($p0));return $1.get_promise();}return $0._impl.$12();},$1E:function($p0){if(tab._Utility.isNullOrEmpty($p0)){throw tab._TableauException.createInvalidParameter('customViewName');}return tab._CustomViewImpl._saveNewAsync(this,this.$7,$p0);},$1F:function(){return tab._CustomViewImpl._makeCurrentCustomViewDefaultAsync(this,this.$7);},$20:null,$21:null,get_$22:function(){return this.$21;},set_$22:function($p0){this.$21=$p0;return $p0;},get_$23:function(){return this.$20;},$24:function($p0){var $0=new tab._Deferred();if(ss.isValue(this.$21)){$0.resolve(this.$21.get_$A());return $0.get_promise();}var $1={};var $2=new tab._CommandReturnHandler('api.FetchParametersCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;var $1_1=tab._WorkbookImpl.$28($p0,$1_0);this.$21=$1_1;$0.resolve($1_1.get_$A());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.$E($1,$2);return $0.get_promise();},$25:function(){var $0=new tab._Deferred();var $1={};var $2=new tab._CommandReturnHandler('api.FetchParametersCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;this.$20=tab._WorkbookImpl.$27($1_0);$0.resolve(this.get_$23()._toApiCollection());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.$E($1,$2);return $0.get_promise();},$26:function($p0,$p1){var $0=new tab._Deferred();var $1=null;if(ss.isValue(this.$20)){if(ss.isNullOrUndefined(this.$20._get($p0))){$0.reject(tab._TableauException.createInvalidParameter($p0));return $0.get_promise();}$1=this.$20._get($p0)._impl;if(ss.isNullOrUndefined($1)){$0.reject(tab._TableauException.createInvalidParameter($p0));return $0.get_promise();}}var $2={};$2['api.setParameterName']=(ss.isValue(this.$20))?$1.get_$B():$p0;if(ss.isValue($p1)&&tab._Utility.isDate($p1)){var $4=$p1;var $5=tab._Utility.serializeDateForServer($4);$2['api.setParameterValue']=$5;}else{$2['api.setParameterValue']=(ss.isValue($p1))?$p1.toString():null;}this.$21=null;var $3=new tab._CommandReturnHandler('api.SetParameterValueCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;if(ss.isNullOrUndefined($1_0)){$0.reject(tab._TableauException.create('serverError','server error'));return;}if(!$1_0.isValidPresModel){$0.reject(tab._TableauException.createInvalidParameter($p0));return;}var $1_1=new tab._ParameterImpl($1_0);this.$21=$1_1;$0.resolve($1_1.get_$A());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createInvalidParameter($p0));});this.$E($2,$3);return $0.get_promise();}}
tab._WorksheetImpl=function(sheetInfoImpl,workbookImpl,messagingOptions,parentDashboardImpl){this.$14=new tab._Collection();this.$26=new tab._Collection();tab._WorksheetImpl.initializeBase(this,[sheetInfoImpl,workbookImpl,messagingOptions]);this.$F=parentDashboardImpl;}
tab._WorksheetImpl.$15=function($p0){var $0=$p0;if(ss.isValue($0)&&ss.isValue($0.errorCode)){var $1=$0.additionalInformation;switch($0.errorCode){case 'invalidFilterFieldName':case 'invalidFilterFieldValue':return tab._TableauException.create($0.errorCode,$1);case 'invalidAggregationFieldName':return tab._TableauException.$0($1);default:return tab._TableauException.createServerError($1);}}return null;}
tab._WorksheetImpl.$1D=function($p0){if(ss.isNullOrUndefined($p0)){throw tab._TableauException.createNullOrEmptyParameter('filterOptions');}if(ss.isNullOrUndefined($p0.min)&&ss.isNullOrUndefined($p0.max)){throw tab._TableauException.create('invalidParameter','At least one of filterOptions.min or filterOptions.max must be specified.');}var $0={};if(ss.isValue($p0.min)){$0.min=$p0.min;}if(ss.isValue($p0.max)){$0.max=$p0.max;}if(ss.isValue($p0.nullOption)){$0.nullOption=tab._Enums.$5($p0.nullOption,'filterOptions.nullOption');}return $0;}
tab._WorksheetImpl.$1E=function($p0){if(ss.isNullOrUndefined($p0)){throw tab._TableauException.createNullOrEmptyParameter('filterOptions');}var $0={};$0.rangeType=tab._Enums.$1($p0.rangeType,'filterOptions.rangeType');$0.periodType=tab._Enums.$0($p0.periodType,'filterOptions.periodType');if($0.rangeType==='lastn'||$0.rangeType==='nextn'){if(ss.isNullOrUndefined($p0.rangeN)){throw tab._TableauException.create('missingRangeNForRelativeDateFilters','Missing rangeN field for a relative date filter of LASTN or NEXTN.');}$0.rangeN=tab._Utility.toInt($p0.rangeN);}if(ss.isValue($p0.anchorDate)){if(!tab._Utility.isDate($p0.anchorDate)||!tab._Utility.isDateValid($p0.anchorDate)){throw tab._TableauException.createInvalidDateParameter('filterOptions.anchorDate');}$0.anchorDate=$p0.anchorDate;}return $0;}
tab._WorksheetImpl.$1F=function($p0,$p1,$p2){return new tab._CommandReturnHandler($p0,1,function($p1_0){
var $1_0=tab._WorksheetImpl.$15($p1_0);if($1_0==null){$p2.resolve($p1);}else{$p2.reject($1_0);}},function($p1_0,$p1_1){
if($p1_0){$p2.reject(tab._TableauException.createInvalidFilterFieldNameOrValue($p1));}else{var $1_0=tab._TableauException.create('filterCannotBePerformed',$p1_1);$p2.reject($1_0);}});}
tab._WorksheetImpl.$2A=function($p0){var $0=$p0;if(ss.isValue($0)&&ss.isValue($0.errorCode)){var $1=$0.additionalInformation;switch($0.errorCode){case 'invalidSelectionFieldName':case 'invalidSelectionValue':case 'invalidSelectionDate':return tab._TableauException.create($0.errorCode,$1);}}return null;}
tab._WorksheetImpl.prototype={$E:null,$F:null,get_sheet:function(){return this.get_worksheet();},get_worksheet:function(){if(this.$E==null){this.$E=new tableauSoftware.Worksheet(this);}return this.$E;},get_parentDashboardImpl:function(){return this.$F;},get_parentDashboard:function(){if(ss.isValue(this.$F)){return this.$F.get_dashboard();}return null;},$10:function(){this.$12();var $0=new tab._Deferred();var $1={};$1['api.worksheetName']=this.get_name();var $2=new tab._CommandReturnHandler('api.GetDataSourcesCommand',0,function($p1_0){
var $1_0=$p1_0;var $1_1=tab._DataSourceImpl.processDataSourcesForWorksheet($1_0);$0.resolve($1_1._toApiCollection());},function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($1,$2);return $0.get_promise();},$11:function($p0){this.$12();var $0=new tab._Deferred();var $1={};$1['api.dataSourceName']=$p0;$1['api.worksheetName']=this.get_name();var $2=new tab._CommandReturnHandler('api.GetDataSourceCommand',0,function($p1_0){
var $1_0=$p1_0;var $1_1=tab._DataSourceImpl.processDataSource($1_0);if(ss.isValue($1_1)){$0.resolve($1_1.get_dataSource());}else{$0.reject(tab._TableauException.createServerError("Data source '"+$p0+"' not found"));}},function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($1,$2);return $0.get_promise();},$12:function(){var $0=this.get_isActive();var $1=ss.isValue(this.$F)&&this.$F.get_isActive();var $2=ss.isValue(this.get_parentStoryPointImpl())&&this.get_parentStoryPointImpl().get_parentStoryImpl().get_isActive();if(!$0&&!$1&&!$2){throw tab._TableauException.createNotActiveSheet();}},$13:function($p0){if(ss.isValue(this.get_parentStoryPointImpl())){var $0={};$0.sv=this.get_name();if(ss.isValue(this.get_parentDashboardImpl())){$0.sw=this.get_parentDashboardImpl().get_name();}$0.abc=this.get_parentStoryPointImpl().get_containedSheetImpl().get_zoneId();$0.ll=this.get_parentStoryPointImpl().get_parentStoryImpl().get_name();$0.abt=this.get_parentStoryPointImpl().get_storyPointId();$p0['api.visualId']=$0;}else{$p0['api.worksheetName']=this.get_name();if(ss.isValue(this.get_parentDashboardImpl())){$p0['api.dashboardName']=this.get_parentDashboardImpl().get_name();}}},get__filters:function(){return this.$14;},set__filters:function(value){this.$14=value;return value;},$16:function($p0,$p1,$p2){if(!tab._Utility.isNullOrEmpty($p0)&&!tab._Utility.isNullOrEmpty($p1)){throw tab._TableauException.createInternalError('Only fieldName OR fieldCaption is allowed, not both.');}$p2=($p2||{});var $0=new tab._Deferred();var $1={};this.$13($1);if(!tab._Utility.isNullOrEmpty($p1)&&tab._Utility.isNullOrEmpty($p0)){$1['api.fieldCaption']=$p1;}if(!tab._Utility.isNullOrEmpty($p0)){$1['api.fieldName']=$p0;}$1['api.filterHierarchicalLevels']=0;$1['api.ignoreDomain']=($p2.ignoreDomain||false);var $2=new tab._CommandReturnHandler('api.GetOneFilterInfoCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=tab._WorksheetImpl.$15($p1_0);if($1_0==null){var $1_1=$p1_0;var $1_2=tableauSoftware.Filter.$7(this,$1_1);$0.resolve($1_2);}else{$0.reject($1_0);}}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($1,$2);return $0.get_promise();},$17:function($p0){this.$12();$p0=($p0||{});var $0=new tab._Deferred();var $1={};this.$13($1);$1['api.ignoreDomain']=($p0.ignoreDomain||false);var $2=new tab._CommandReturnHandler('api.GetFiltersListCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;this.set__filters(tableauSoftware.Filter.$8(this,$1_0));$0.resolve(this.get__filters()._toApiCollection());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($1,$2);return $0.get_promise();},$18:function($p0,$p1,$p2,$p3){return this.$21($p0,$p1,$p2,$p3);},$19:function($p0){return this.$20($p0);},$1A:function($p0,$p1){var $0=tab._WorksheetImpl.$1D($p1);return this.$22($p0,$0);},$1B:function($p0,$p1){var $0=tab._WorksheetImpl.$1E($p1);return this.$23($p0,$0);},$1C:function($p0,$p1,$p2,$p3){if(ss.isNullOrUndefined($p1)&&$p2!=='all'){throw tab._TableauException.createInvalidParameter('values');}return this.$24($p0,$p1,$p2,$p3);},$20:function($p0){this.$12();if(tab._Utility.isNullOrEmpty($p0)){throw tab._TableauException.createNullOrEmptyParameter('fieldName');}var $0=new tab._Deferred();var $1={};$1['api.fieldCaption']=$p0;this.$13($1);var $2=tab._WorksheetImpl.$1F('api.ClearFilterCommand',$p0,$0);this.sendCommand($1,$2);return $0.get_promise();},$21:function($p0,$p1,$p2,$p3){this.$12();if(tab._Utility.isNullOrEmpty($p0)){throw tab._TableauException.createNullOrEmptyParameter('fieldName');}$p2=tab._Enums.$2($p2,'updateType');var $0=[];if(tab._jQueryShim.$12($p1)){for(var $4=0;$4<$p1.length;$4++){$0.push($p1[$4].toString());}}else if(ss.isValue($p1)){$0.push($p1.toString());}var $1=new tab._Deferred();var $2={};$2['api.fieldCaption']=$p0;$2['api.filterUpdateType']=$p2;$2['api.exclude']=(ss.isValue($p3)&&$p3.isExcludeMode)?true:false;if($p2!=='all'){$2['api.filterCategoricalValues']=$0;}this.$13($2);var $3=tab._WorksheetImpl.$1F('api.ApplyCategoricalFilterCommand',$p0,$1);this.sendCommand($2,$3);return $1.get_promise();},$22:function($p0,$p1){this.$12();if(tab._Utility.isNullOrEmpty($p0)){throw tab._TableauException.createNullOrEmptyParameter('fieldName');}if(ss.isNullOrUndefined($p1)){throw tab._TableauException.createNullOrEmptyParameter('filterOptions');}var $0={};$0['api.fieldCaption']=$p0;if(ss.isValue($p1.min)){if(tab._Utility.isDate($p1.min)){var $3=$p1.min;if(tab._Utility.isDateValid($3)){$0['api.filterRangeMin']=tab._Utility.serializeDateForServer($3);}else{throw tab._TableauException.createInvalidDateParameter('filterOptions.min');}}else{$0['api.filterRangeMin']=$p1.min;}}if(ss.isValue($p1.max)){if(tab._Utility.isDate($p1.max)){var $4=$p1.max;if(tab._Utility.isDateValid($4)){$0['api.filterRangeMax']=tab._Utility.serializeDateForServer($4);}else{throw tab._TableauException.createInvalidDateParameter('filterOptions.max');}}else{$0['api.filterRangeMax']=$p1.max;}}if(ss.isValue($p1.nullOption)){$0['api.filterRangeNullOption']=$p1.nullOption;}this.$13($0);var $1=new tab._Deferred();var $2=tab._WorksheetImpl.$1F('api.ApplyRangeFilterCommand',$p0,$1);this.sendCommand($0,$2);return $1.get_promise();},$23:function($p0,$p1){this.$12();if(tab._Utility.isNullOrEmpty($p0)){throw tab._TableauException.createInvalidParameter('fieldName');}else if(ss.isNullOrUndefined($p1)){throw tab._TableauException.createInvalidParameter('filterOptions');}var $0={};$0['api.fieldCaption']=$p0;if(ss.isValue($p1)){$0['api.filterPeriodType']=$p1.periodType;$0['api.filterDateRangeType']=$p1.rangeType;if($p1.rangeType==='lastn'||$p1.rangeType==='nextn'){if(ss.isNullOrUndefined($p1.rangeN)){throw tab._TableauException.create('missingRangeNForRelativeDateFilters','Missing rangeN field for a relative date filter of LASTN or NEXTN.');}$0['api.filterDateRange']=$p1.rangeN;}if(ss.isValue($p1.anchorDate)){$0['api.filterDateArchorValue']=tab._Utility.serializeDateForServer($p1.anchorDate);}}this.$13($0);var $1=new tab._Deferred();var $2=tab._WorksheetImpl.$1F('api.ApplyRelativeDateFilterCommand',$p0,$1);this.sendCommand($0,$2);return $1.get_promise();},$24:function($p0,$p1,$p2,$p3){this.$12();if(tab._Utility.isNullOrEmpty($p0)){throw tab._TableauException.createNullOrEmptyParameter('fieldName');}$p2=tab._Enums.$2($p2,'updateType');var $0=null;var $1=null;if(tab._jQueryShim.$12($p1)){$0=[];var $5=$p1;for(var $6=0;$6<$5.length;$6++){$0.push($5[$6].toString());}}else if(tab._Utility.isString($p1)){$0=[];$0.push($p1.toString());}else if(ss.isValue($p1)&&ss.isValue($p1.levels)){var $7=$p1.levels;$1=[];if(tab._jQueryShim.$12($7)){var $8=$7;for(var $9=0;$9<$8.length;$9++){$1.push($8[$9].toString());}}else{$1.push($7.toString());}}else if(ss.isValue($p1)){throw tab._TableauException.createInvalidParameter('values');}var $2={};$2['api.fieldCaption']=$p0;$2['api.filterUpdateType']=$p2;$2['api.exclude']=(ss.isValue($p3)&&$p3.isExcludeMode)?true:false;if($0!=null){$2['api.filterHierarchicalValues']=tab.JsonUtil.toJson($0,false,'');}if($1!=null){$2['api.filterHierarchicalLevels']=tab.JsonUtil.toJson($1,false,'');}this.$13($2);var $3=new tab._Deferred();var $4=tab._WorksheetImpl.$1F('api.ApplyHierarchicalFilterCommand',$p0,$3);this.sendCommand($2,$4);return $3.get_promise();},get_selectedMarks:function(){return this.$26;},set_selectedMarks:function(value){this.$26=value;return value;},$27:function(){this.$12();var $0=new tab._Deferred();var $1={};this.$13($1);$1['api.filterUpdateType']='replace';var $2=new tab._CommandReturnHandler('api.SelectMarksCommand',1,function($p1_0){
$0.resolve();},function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($1,$2);return $0.get_promise();},$28:function($p0,$p1,$p2){this.$12();if($p0==null&&$p1==null){return this.$27();}if(tab._Utility.isString($p0)&&(tab._jQueryShim.$12($p1)||tab._Utility.isString($p1)||!tab._Enums.$4($p1))){return this.$2B($p0,$p1,$p2);}else if(tab._jQueryShim.$12($p0)){return this.$2D($p0,$p1);}else{return this.$2C($p0,$p1);}},$29:function(){this.$12();var $0=new tab._Deferred();var $1={};this.$13($1);var $2=new tab._CommandReturnHandler('api.FetchSelectedMarksCommand',0,ss.Delegate.create(this,function($p1_0){
var $1_0=$p1_0;this.$26=tab._MarkImpl.$6($1_0);$0.resolve(this.$26._toApiCollection());}),function($p1_0,$p1_1){
$0.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($1,$2);return $0.get_promise();},$2B:function($p0,$p1,$p2){var $0=[];var $1=[];var $2=[];var $3=[];var $4=[];var $5=[];this.$2E($0,$1,$2,$3,$4,$5,$p0,$p1);return this.$30(null,$0,$1,$2,$3,$4,$5,$p2);},$2C:function($p0,$p1){var $0=$p0;var $1=[];var $2=[];var $3=[];var $4=[];var $5=[];var $6=[];var $dict1=$0;for(var $key2 in $dict1){var $7={key:$key2,value:$dict1[$key2]};if($p0.hasOwnProperty($7.key)){if(!tab._jQueryShim.$11($0[$7.key])){this.$2E($1,$2,$3,$4,$5,$6,$7.key,$7.value);}}}return this.$30(null,$1,$2,$3,$4,$5,$6,$p1);},$2D:function($p0,$p1){var $0=[];var $1=[];var $2=[];var $3=[];var $4=[];var $5=[];var $6=[];for(var $7=0;$7<$p0.length;$7++){var $8=$p0[$7];if(ss.isValue($8.$0.get_$4())&&$8.$0.get_$4()>0){$6.push($8.$0.get_$4());}else{var $9=$8.$0.get_$3();for(var $A=0;$A<$9.get__length();$A++){var $B=$9.get_item($A);if($B.hasOwnProperty('fieldName')&&$B.hasOwnProperty('value')&&!tab._jQueryShim.$11($B.fieldName)&&!tab._jQueryShim.$11($B.value)){this.$2E($0,$1,$2,$3,$4,$5,$B.fieldName,$B.value);}}}}return this.$30($6,$0,$1,$2,$3,$4,$5,$p1);},$2E:function($p0,$p1,$p2,$p3,$p4,$p5,$p6,$p7){var $0=$p7;if(tab._WorksheetImpl.$25.test($p6)){this.$2F($p2,$p3,$p6,$p7);}else if(ss.isValue($0.min)||ss.isValue($0.max)){var $1={};if(ss.isValue($0.min)){if(tab._Utility.isDate($0.min)){var $3=$0.min;if(tab._Utility.isDateValid($3)){$1.min=tab._Utility.serializeDateForServer($3);}else{throw tab._TableauException.createInvalidDateParameter('options.min');}}else{$1.min=$0.min;}}if(ss.isValue($0.max)){if(tab._Utility.isDate($0.max)){var $4=$0.max;if(tab._Utility.isDateValid($4)){$1.max=tab._Utility.serializeDateForServer($4);}else{throw tab._TableauException.createInvalidDateParameter('options.max');}}else{$1.max=$0.max;}}if(ss.isValue($0.nullOption)){var $5=tab._Enums.$5($0.nullOption,'options.nullOption');$1.nullOption=$5;}else{$1.nullOption='allValues';}var $2=tab.JsonUtil.toJson($1,false,'');this.$2F($p4,$p5,$p6,$2);}else{this.$2F($p0,$p1,$p6,$p7);}},$2F:function($p0,$p1,$p2,$p3){var $0=[];if(tab._jQueryShim.$12($p3)){var $1=$p3;for(var $2=0;$2<$1.length;$2++){$0.push($1[$2]);}}else{$0.push($p3);}$p1.push($0);$p0.push($p2);},$30:function($p0,$p1,$p2,$p3,$p4,$p5,$p6,$p7){var $0={};this.$13($0);$p7=tab._Enums.$3($p7,'updateType');$0['api.filterUpdateType']=$p7;if(!tab._Utility.isNullOrEmpty($p0)){$0['api.tupleIds']=tab.JsonUtil.toJson($p0,false,'');}if(!tab._Utility.isNullOrEmpty($p1)&&!tab._Utility.isNullOrEmpty($p2)){$0['api.categoricalFieldCaption']=tab.JsonUtil.toJson($p1,false,'');var $3=[];for(var $4=0;$4<$p2.length;$4++){var $5=tab.JsonUtil.toJson($p2[$4],false,'');$3.push($5);}$0['api.categoricalMarkValues']=tab.JsonUtil.toJson($3,false,'');}if(!tab._Utility.isNullOrEmpty($p3)&&!tab._Utility.isNullOrEmpty($p4)){$0['api.hierarchicalFieldCaption']=tab.JsonUtil.toJson($p3,false,'');var $6=[];for(var $7=0;$7<$p4.length;$7++){var $8=tab.JsonUtil.toJson($p4[$7],false,'');$6.push($8);}$0['api.hierarchicalMarkValues']=tab.JsonUtil.toJson($6,false,'');}if(!tab._Utility.isNullOrEmpty($p5)&&!tab._Utility.isNullOrEmpty($p6)){$0['api.rangeFieldCaption']=tab.JsonUtil.toJson($p5,false,'');var $9=[];for(var $A=0;$A<$p6.length;$A++){var $B=tab.JsonUtil.toJson($p6[$A],false,'');$9.push($B);}$0['api.rangeMarkValues']=tab.JsonUtil.toJson($9,false,'');}if(tab._Utility.isNullOrEmpty($0['api.tupleIds'])&&tab._Utility.isNullOrEmpty($0['api.categoricalFieldCaption'])&&tab._Utility.isNullOrEmpty($0['api.hierarchicalFieldCaption'])&&tab._Utility.isNullOrEmpty($0['api.rangeFieldCaption'])){throw tab._TableauException.createInvalidParameter('fieldNameOrFieldValuesMap');}var $1=new tab._Deferred();var $2=new tab._CommandReturnHandler('api.SelectMarksCommand',1,function($p1_0){
var $1_0=tab._WorksheetImpl.$2A($p1_0);if($1_0==null){$1.resolve();}else{$1.reject($1_0);}},function($p1_0,$p1_1){
$1.reject(tab._TableauException.createServerError($p1_1));});this.sendCommand($0,$2);return $1.get_promise();}}
tab.JsonUtil=function(){}
tab.JsonUtil.parseJson=function(jsonValue){return tab._jQueryShim.parseJSON(jsonValue);}
tab.JsonUtil.toJson=function(it,pretty,indentStr){pretty=(pretty||false);indentStr=(indentStr||'');var $0=[];return tab.JsonUtil.$3(it,pretty,indentStr,$0);}
tab.JsonUtil.$1=function($p0,$p1,$p2){if(ss.isValue((Array).prototype['indexOf'])){return $p0.indexOf($p1,$p2);}$p2=($p2||0);var $0=$p0.length;if($0>0){for(var $1=$p2;$1<$0;$1++){if($p0[$1]===$p1){return $1;}}}return -1;}
tab.JsonUtil.$2=function($p0,$p1,$p2){var $0=tab.JsonUtil.$1($p0,$p1,$p2);return $0>=0;}
tab.JsonUtil.$3=function($p0,$p1,$p2,$p3){if(tab.JsonUtil.$2($p3,$p0)){throw Error.createError('The object contains recursive reference of sub-objects',null);}if(ss.isUndefined($p0)){return 'undefined';}if($p0==null){return 'null';}var $0=tab._jQueryShim.$13($p0);if($0==='number'||$0==='boolean'){return $p0.toString();}if($0==='string'){return tab.JsonUtil.$6($p0);}$p3.push($p0);var $1;$p2=($p2||'');var $2=($p1)?$p2+'\t':'';var $3=($p0.__json__||$p0.json);if(tab._jQueryShim.$11($3)){var $6=$3;$1=$6($p0);if($p0!==$1){var $7=tab.JsonUtil.$3($1,$p1,$2,$p3);$p3.pop();return $7;}}if(ss.isValue($p0.nodeType)&&ss.isValue($p0.cloneNode)){throw Error.createError("Can't serialize DOM nodes",null);}var $4=($p1)?' ':'';var $5=($p1)?'\n':'';if(tab._jQueryShim.$12($p0)){return tab.JsonUtil.$5($p0,$p1,$p2,$p3,$2,$5);}if($0==='function'){$p3.pop();return null;}return tab.JsonUtil.$4($p0,$p1,$p2,$p3,$2,$5,$4);}
tab.JsonUtil.$4=function($p0,$p1,$p2,$p3,$p4,$p5,$p6){var $0=$p0;var $1=new ss.StringBuilder('{');var $2=false;var $dict1=$0;for(var $key2 in $dict1){var $3={key:$key2,value:$dict1[$key2]};var $4;var $5;if(typeof($3.key)==='number'){$4='"'+$3.key+'"';}else if(typeof($3.key)==='string'){$4=tab.JsonUtil.$6($3.key);}else{continue;}$5=tab.JsonUtil.$3($3.value,$p1,$p4,$p3);if($5==null){continue;}if($2){$1.append(',');}$1.append($p5+$p4+$4+':'+$p6+$5);$2=true;}$1.append($p5+$p2+'}');$p3.pop();return $1.toString();}
tab.JsonUtil.$5=function($p0,$p1,$p2,$p3,$p4,$p5){var $0=false;var $1=new ss.StringBuilder('[');var $2=$p0;for(var $3=0;$3<$2.length;$3++){var $4=$2[$3];var $5=tab.JsonUtil.$3($4,$p1,$p4,$p3);if($5==null){$5='undefined';}if($0){$1.append(',');}$1.append($p5+$p4+$5);$0=true;}$1.append($p5+$p2+']');$p3.pop();return $1.toString();}
tab.JsonUtil.$6=function($p0){$p0 = ('"' + $p0.replace(/(["\\])/g, '\\$1') + '"');$p0=$p0.replace(new RegExp('[\u000c]','g'),'\\f');$p0=$p0.replace(new RegExp('[\u0008]','g'),'\\b');$p0=$p0.replace(new RegExp('[\n]','g'),'\\n');$p0=$p0.replace(new RegExp('[\t]','g'),'\\t');$p0=$p0.replace(new RegExp('[\r]','g'),'\\r');return $p0;}
Type.registerNamespace('tableauSoftware');tab.$create_DataValue=function(value,formattedValue,aliasedValue){var $o={};$o.value=value;if(tab._Utility.isNullOrEmpty(aliasedValue)){$o.formattedValue=formattedValue;}else{$o.formattedValue=aliasedValue;}return $o;}
tab.$create_VizSize=function(sheetSize,chromeHeight){var $o={};$o.sheetSize=sheetSize;$o.chromeHeight=chromeHeight;return $o;}
tab.$create_Point=function(x,y){var $o={};$o.x=x;$o.y=y;return $o;}
tab.$create_Size=function(width,height){var $o={};$o.width=width;$o.height=height;return $o;}
tab.$create_SheetSize=function(behavior,minSize,maxSize){var $o={};$o.behavior=(behavior||'automatic');if(ss.isValue(minSize)){$o.minSize=minSize;}if(ss.isValue(maxSize)){$o.maxSize=maxSize;}return $o;}
tableauSoftware.CustomView=function(customViewImpl){this._impl=customViewImpl;}
tableauSoftware.CustomView.prototype={_impl:null,getWorkbook:function(){return this._impl.get_$B();},getUrl:function(){return this._impl.get_$C();},getName:function(){return this._impl.get_$D();},setName:function(value){this._impl.set_$D(value);},getOwnerName:function(){return this._impl.get_$E();},getAdvertised:function(){return this._impl.get_$F();},setAdvertised:function(value){this._impl.set_$F(value);},getDefault:function(){return this._impl.get_$10();},saveAsync:function(){return this._impl.$11();}}
tab.CustomViewEvent=function(eventName,viz,customViewImpl){tab.CustomViewEvent.initializeBase(this,[eventName,viz]);this.$2=new tab.JavaScriptApi$3(viz._impl.get__workbookImpl(),customViewImpl);}
tab.CustomViewEvent.prototype={$2:null,getCustomViewAsync:function(){var $0=new tab._Deferred();var $1=null;if(ss.isValue(this.$2.get__customViewImpl())){$1=this.$2.get__customViewImpl().get_$A();}$0.resolve($1);return $0.get_promise();}}
tab.JavaScriptApi$3=function(workbook,customViewImpl){tab.JavaScriptApi$3.initializeBase(this,[workbook,null]);this.$2=customViewImpl;}
tab.JavaScriptApi$3.prototype={$2:null,get__customViewImpl:function(){return this.$2;}}
tableauSoftware.Dashboard=function(dashboardImpl){tableauSoftware.Dashboard.initializeBase(this,[dashboardImpl]);}
tableauSoftware.Dashboard.prototype={_impl:null,getParentStoryPoint:function(){return this._impl.get_parentStoryPoint();},getObjects:function(){return this._impl.get_objects()._toApiCollection();},getWorksheets:function(){return this._impl.get_worksheets()._toApiCollection();}}
tableauSoftware.DashboardObject=function(frameInfo,dashboard,worksheet){if(frameInfo.$0==='worksheet'&&ss.isNullOrUndefined(worksheet)){throw tab._TableauException.createInternalError('worksheet parameter is required for WORKSHEET objects');}else if(frameInfo.$0!=='worksheet'&&ss.isValue(worksheet)){throw tab._TableauException.createInternalError('worksheet parameter should be undefined for non-WORKSHEET objects');}this.$0=frameInfo;this.$1=dashboard;this.$2=worksheet;}
tableauSoftware.DashboardObject.prototype={$0:null,$1:null,$2:null,getObjectType:function(){return this.$0.$0;},getDashboard:function(){return this.$1;},getWorksheet:function(){return this.$2;},getPosition:function(){return this.$0.$2;},getSize:function(){return this.$0.$3;}}
tableauSoftware.DataSource=function(impl){this.$0=impl;}
tableauSoftware.DataSource.prototype={$0:null,getName:function(){return this.$0.get_name();},getFields:function(){return this.$0.get_fields()._toApiCollection();},getIsPrimary:function(){return this.$0.get_isPrimary();}}
tableauSoftware.Field=function(dataSource,name,fieldRoleType,fieldAggrType){this.$0=dataSource;this.$1=name;this.$2=fieldRoleType;this.$3=fieldAggrType;}
tableauSoftware.Field.prototype={$0:null,$1:null,$2:null,$3:null,getDataSource:function(){return this.$0;},getName:function(){return this.$1;},getRole:function(){return this.$2;},getAggregation:function(){return this.$3;}}
tableauSoftware.CategoricalFilter=function(worksheetImpl,pm){tableauSoftware.CategoricalFilter.initializeBase(this,[worksheetImpl,pm]);this.$C(pm);}
tableauSoftware.CategoricalFilter.prototype={$A:false,$B:null,getIsExcludeMode:function(){return this.$A;},getAppliedValues:function(){return this.$B;},_updateFromJson:function(pm){this.$C(pm);},$C:function($p0){this.$A=$p0.isExclude;if(ss.isValue($p0.appliedValues)){this.$B=[];var $enum1=ss.IEnumerator.getEnumerator($p0.appliedValues);while($enum1.moveNext()){var $0=$enum1.current;this.$B.push(tab._Utility.getDataValue($0));}}}}
tableauSoftware.Filter=function(worksheetImpl,pm){this.$0=worksheetImpl;this.$9(pm);}
tableauSoftware.Filter.$7=function($p0,$p1){switch($p1.filterType){case 'categorical':return new tableauSoftware.CategoricalFilter($p0,$p1);case 'relativedate':return new tableauSoftware.RelativeDateFilter($p0,$p1);case 'hierarchical':return new tableauSoftware.HierarchicalFilter($p0,$p1);case 'quantitative':return new tableauSoftware.QuantitativeFilter($p0,$p1);}return null;}
tableauSoftware.Filter.$8=function($p0,$p1){var $0=new tab._Collection();var $enum1=ss.IEnumerator.getEnumerator($p1.filters);while($enum1.moveNext()){var $1=$enum1.current;var $2=tableauSoftware.Filter.$7($p0,$1);$0._add($1.caption,$2);}return $0;}
tableauSoftware.Filter.prototype={$0:null,$1:null,$2:null,$3:null,$4:null,$5:null,$6:null,getFilterType:function(){return this.$1;},getFieldName:function(){return this.$2;},getWorksheet:function(){return this.$0.get_worksheet();},getFieldAsync:function(){var $0=new tab._Deferred();if(this.$3==null){var $1=function($p1_0){
$0.reject($p1_0);return null;};var $2=ss.Delegate.create(this,function($p1_0){
this.$3=new tableauSoftware.Field($p1_0,this.$2,this.$5,this.$6);$0.resolve(this.$3);return null;});this.$0.$11(this.$4).then($2,$1);}else{window.setTimeout(ss.Delegate.create(this,function(){
$0.resolve(this.$3);}),0);}return $0.get_promise();},_update:function($p0){this.$9($p0);this._updateFromJson($p0);},_addFieldParams:function($p0){},$9:function($p0){this.$2=$p0.caption;this.$1=$p0.filterType;this.$3=null;this.$4=$p0.dataSourceName;this.$5=($p0.fieldRole||0);this.$6=($p0.fieldAggregation||0);}}
tab.FilterEvent=function(eventName,viz,worksheetImpl,fieldName,filterCaption){tab.FilterEvent.initializeBase(this,[eventName,viz,worksheetImpl]);this.$3=filterCaption;this.$4=new tab.JavaScriptApi$6(viz._impl.get__workbookImpl(),worksheetImpl,fieldName,filterCaption);}
tab.FilterEvent.prototype={$3:null,$4:null,getFieldName:function(){return this.$3;},getFilterAsync:function(){return this.$4.get__worksheetImpl().$16(this.$4.get__filterFieldName(),null,null);}}
tab.JavaScriptApi$6=function(workbookImpl,worksheetImpl,fieldFieldName,filterCaption){tab.JavaScriptApi$6.initializeBase(this,[workbookImpl,worksheetImpl]);this.$2=fieldFieldName;this.$3=filterCaption;}
tab.JavaScriptApi$6.prototype={$2:null,$3:null,get__filterFieldName:function(){return this.$2;},get_$4:function(){return this.$3;}}
tableauSoftware.HierarchicalFilter=function(worksheetImpl,pm){tableauSoftware.HierarchicalFilter.initializeBase(this,[worksheetImpl,pm]);this.$B(pm);}
tableauSoftware.HierarchicalFilter.prototype={$A:0,_addFieldParams:function($p0){$p0['api.filterHierarchicalLevels']=this.$A;},_updateFromJson:function(pm){this.$B(pm);},$B:function($p0){this.$A=$p0.levels;}}
tableauSoftware.QuantitativeFilter=function(worksheetImpl,pm){tableauSoftware.QuantitativeFilter.initializeBase(this,[worksheetImpl,pm]);this.$F(pm);}
tableauSoftware.QuantitativeFilter.prototype={$A:null,$B:null,$C:null,$D:null,$E:false,getMin:function(){return this.$C;},getMax:function(){return this.$D;},getIncludeNullValues:function(){return this.$E;},getDomainMin:function(){return this.$A;},getDomainMax:function(){return this.$B;},_updateFromJson:function(pm){this.$F(pm);},$F:function($p0){this.$A=tab._Utility.getDataValue($p0.domainMinValue);this.$B=tab._Utility.getDataValue($p0.domainMaxValue);this.$C=tab._Utility.getDataValue($p0.minValue);this.$D=tab._Utility.getDataValue($p0.maxValue);this.$E=$p0.includeNullValues;}}
tableauSoftware.RelativeDateFilter=function(worksheetImpl,pm){tableauSoftware.RelativeDateFilter.initializeBase(this,[worksheetImpl,pm]);this.$D(pm);}
tableauSoftware.RelativeDateFilter.prototype={$A:null,$B:null,$C:0,getPeriod:function(){return this.$A;},getRange:function(){return this.$B;},getRangeN:function(){return this.$C;},_updateFromJson:function(pm){this.$D(pm);},$D:function($p0){if(ss.isValue($p0.periodType)){this.$A=tab._Enums.$0($p0.periodType,'periodType');}if(ss.isValue($p0.rangeType)){this.$B=tab._Enums.$1($p0.rangeType,'rangeType');}if(ss.isValue($p0.rangeN)){this.$C=$p0.rangeN;}}}
tab.FirstVizSizeKnownEvent=function(eventName,viz,vizSize){tab.FirstVizSizeKnownEvent.initializeBase(this,[eventName,viz]);this.$2=vizSize;}
tab.FirstVizSizeKnownEvent.prototype={$2:null,getVizSize:function(){return this.$2;}}
tableauSoftware.Version=function(major,minor,patch,metadata){this.$1=major;this.$2=minor;this.$3=patch;this.$4=metadata||null;}
tableauSoftware.Version.getCurrent=function(){return tableauSoftware.Version.$0;}
tableauSoftware.Version.prototype={$1:0,$2:0,$3:0,$4:null,getMajor:function(){return this.$1;},getMinor:function(){return this.$2;},getPatch:function(){return this.$3;},getMetadata:function(){return this.$4;},toString:function(){var $0=this.$1+'.'+this.$2+'.'+this.$3;if(ss.isValue(this.$4)&&this.$4.length>0){$0+='-'+this.$4;}return $0;}}
tab.VizResizeEvent=function(eventName,viz,availableSize){tab.VizResizeEvent.initializeBase(this,[eventName,viz]);this.$2=availableSize;}
tab.VizResizeEvent.prototype={$2:null,getAvailableSize:function(){return this.$2;}}
tableauSoftware.Mark=function(tupleId){this.$0=new tab._MarkImpl(tupleId);}
tableauSoftware.Mark.prototype={$0:null,getPairs:function(){return this.$0.get_$5();}}
tab.MarksEvent=function(eventName,viz,worksheetImpl){tab.MarksEvent.initializeBase(this,[eventName,viz,worksheetImpl]);this.$3=new tab.JavaScriptApi$5(viz._impl.get__workbookImpl(),worksheetImpl);}
tab.MarksEvent.prototype={$3:null,getMarksAsync:function(){var $0=this.$3.get__worksheetImpl();if(ss.isValue($0.get_selectedMarks())){var $1=new tab._Deferred();return $1.resolve($0.get_selectedMarks()._toApiCollection());}return $0.$29();}}
tab.JavaScriptApi$5=function(workbookImpl,worksheetImpl){tab.JavaScriptApi$5.initializeBase(this,[workbookImpl,worksheetImpl]);}
tableauSoftware.Pair=function(fieldName,value){this.fieldName=fieldName;this.value=value;this.formattedValue=(ss.isValue(value))?value.toString():'';}
tableauSoftware.Pair.prototype={fieldName:null,value:null,formattedValue:null}
tableauSoftware.Parameter=function(impl){this._impl=impl;}
tableauSoftware.Parameter.prototype={_impl:null,getName:function(){return this._impl.get_$B();},getCurrentValue:function(){return this._impl.get_$C();},getDataType:function(){return this._impl.get_$D();},getAllowableValuesType:function(){return this._impl.get_$E();},getAllowableValues:function(){return this._impl.get_$F();},getMinValue:function(){return this._impl.get_$10();},getMaxValue:function(){return this._impl.get_$11();},getStepSize:function(){return this._impl.get_$12();},getDateStepPeriod:function(){return this._impl.get_$13();}}
tab.ParameterEvent=function(eventName,viz,parameterName){tab.ParameterEvent.initializeBase(this,[eventName,viz]);this.$2=new tab.JavaScriptApi$4(viz._impl.get__workbookImpl(),parameterName);}
tab.ParameterEvent.prototype={$2:null,getParameterName:function(){return this.$2.get__parameterName();},getParameterAsync:function(){return this.$2.get__workbookImpl().$24(this.$2.get__parameterName());}}
tab.JavaScriptApi$4=function(workbookImpl,parameterName){tab.JavaScriptApi$4.initializeBase(this,[workbookImpl,null]);this.$2=parameterName;}
tab.JavaScriptApi$4.prototype={$2:null,get__parameterName:function(){return this.$2;}}
tableauSoftware.Sheet=function(sheetImpl){tab._Param.verifyValue(sheetImpl,'sheetImpl');this._impl=sheetImpl;}
tableauSoftware.Sheet.prototype={_impl:null,getName:function(){return this._impl.get_name();},getIndex:function(){return this._impl.get_index();},getWorkbook:function(){return this._impl.get_workbookImpl().get_workbook();},getSize:function(){return this._impl.get_size();},getIsHidden:function(){return this._impl.get_isHidden();},getIsActive:function(){return this._impl.get_isActive();},getSheetType:function(){return this._impl.get_sheetType();},getUrl:function(){return this._impl.get_url();},changeSizeAsync:function(size){return this._impl.changeSizeAsync(size);}}
tableauSoftware.SheetInfo=function(impl){this.$0=impl;}
tableauSoftware.SheetInfo.prototype={$0:null,getName:function(){return this.$0.name;},getSheetType:function(){return this.$0.sheetType;},getSize:function(){return this.$0.size;},getIndex:function(){return this.$0.index;},getUrl:function(){return this.$0.url;},getIsActive:function(){return this.$0.isActive;},getIsHidden:function(){return this.$0.isHidden;},getWorkbook:function(){return this.$0.workbook;}}
tab.SheetSizeFactory=function(){}
tab.SheetSizeFactory.createAutomatic=function(){var $0=tab.$create_SheetSize('automatic',null,null);return $0;}
tab.SheetSizeFactory.fromSizeConstraints=function(vizSizePresModel){var $0=vizSizePresModel.minHeight;var $1=vizSizePresModel.minWidth;var $2=vizSizePresModel.maxHeight;var $3=vizSizePresModel.maxWidth;var $4='automatic';var $5=null;var $6=null;if(!$0&&!$1){if(!$2&&!$3){}else{$4='atmost';$6=tab.$create_Size($3,$2);}}else if(!$2&&!$3){$4='atleast';$5=tab.$create_Size($1,$0);}else if($2===$0&&$3===$1){$4='exactly';$5=tab.$create_Size($1,$0);$6=tab.$create_Size($1,$0);}else{$4='range';$5=tab.$create_Size($1,$0);$6=tab.$create_Size($3,$2);}return tab.$create_SheetSize($4,$5,$6);}
tableauSoftware.Story=function(storyImpl){tableauSoftware.Story.initializeBase(this,[storyImpl]);}
tableauSoftware.Story.prototype={_impl:null,getActiveStoryPoint:function(){return this._impl.get_activeStoryPointImpl().get_storyPoint();},getStoryPointsInfo:function(){return this._impl.get_storyPointsInfo();},activatePreviousStoryPointAsync:function(){return this._impl.activatePreviousStoryPointAsync();},activateNextStoryPointAsync:function(){return this._impl.activateNextStoryPointAsync();},activateStoryPointAsync:function(index){return this._impl.activateStoryPointAsync(index);},revertStoryPointAsync:function(index){return this._impl.revertStoryPointAsync(index);}}
tableauSoftware.StoryPoint=function(impl){this.$0=impl;}
tableauSoftware.StoryPoint.prototype={$0:null,getCaption:function(){return this.$0.get_caption();},getContainedSheet:function(){return (ss.isValue(this.$0.get_containedSheetImpl()))?this.$0.get_containedSheetImpl().get_sheet():null;},getIndex:function(){return this.$0.get_index();},getIsActive:function(){return this.$0.get_isActive();},getIsUpdated:function(){return this.$0.get_isUpdated();},getParentStory:function(){return this.$0.get_parentStoryImpl().get_story();}}
tableauSoftware.StoryPointInfo=function(impl){this._impl=impl;}
tableauSoftware.StoryPointInfo.prototype={_impl:null,getCaption:function(){return this._impl.caption;},getIndex:function(){return this._impl.index;},getIsActive:function(){return this._impl.isActive;},getIsUpdated:function(){return this._impl.isUpdated;},getParentStory:function(){return this._impl.parentStoryImpl.get_story();}}
tab.StoryPointSwitchEvent=function(eventName,viz,oldStoryPointInfo,newStoryPoint){tab.StoryPointSwitchEvent.initializeBase(this,[eventName,viz]);this.$2=oldStoryPointInfo;this.$3=newStoryPoint;}
tab.StoryPointSwitchEvent.prototype={$2:null,$3:null,getOldStoryPointInfo:function(){return this.$2;},getNewStoryPoint:function(){return this.$3;}}
tab.TableauEvent=function(eventName,viz){this.$0=viz;this.$1=eventName;}
tab.TableauEvent.prototype={$0:null,$1:null,getViz:function(){return this.$0;},getEventName:function(){return this.$1;}}
tab.EventContext=function(workbookImpl,worksheetImpl){this.$0=workbookImpl;this.$1=worksheetImpl;}
tab.EventContext.prototype={$0:null,$1:null,get__workbookImpl:function(){return this.$0;},get__worksheetImpl:function(){return this.$1;}}
tab.TabSwitchEvent=function(eventName,viz,oldName,newName){tab.TabSwitchEvent.initializeBase(this,[eventName,viz]);this.$2=oldName;this.$3=newName;}
tab.TabSwitchEvent.prototype={$2:null,$3:null,getOldSheetName:function(){return this.$2;},getNewSheetName:function(){return this.$3;}}
tableauSoftware.Viz=function(parentElement,url,options){var $0=tab._ApiObjectRegistry.getCrossDomainMessageRouter();this._impl=new tab.VizImpl($0,this,parentElement,url,options);this._impl.$46();}
tableauSoftware.Viz.prototype={_impl:null,getAreTabsHidden:function(){return this._impl.get_$28();},getIsToolbarHidden:function(){return this._impl.get_$29();},getIsHidden:function(){return this._impl.get_$2A();},getInstanceId:function(){return this._impl.get_instanceId();},getParentElement:function(){return this._impl.get_$2B();},getUrl:function(){return this._impl.get_$2C();},getVizSize:function(){return this._impl.get_$2F();},getWorkbook:function(){return this._impl.get_$2D();},getAreAutomaticUpdatesPaused:function(){return this._impl.get_$2E();},getCurrentUrlAsync:function(){return this._impl.getCurrentUrlAsync();},addEventListener:function(eventName,handler){this._impl.addEventListener(eventName,handler);},removeEventListener:function(eventName,handler){this._impl.removeEventListener(eventName,handler);},dispose:function(){this._impl.$33();},show:function(){this._impl.$34();},hide:function(){this._impl.$35();},showExportDataDialog:function(worksheetWithinDashboard){this._impl.$38(worksheetWithinDashboard);},showExportCrossTabDialog:function(worksheetWithinDashboard){this._impl.$39(worksheetWithinDashboard);},showExportImageDialog:function(){this._impl.$37();},showExportPDFDialog:function(){this._impl.$3A();},revertAllAsync:function(){return this._impl.$3B();},refreshDataAsync:function(){return this._impl.$3C();},showShareDialog:function(){this._impl.$3D();},showDownloadWorkbookDialog:function(){this._impl.$3E();},pauseAutomaticUpdatesAsync:function(){return this._impl.$3F();},resumeAutomaticUpdatesAsync:function(){return this._impl.$40();},toggleAutomaticUpdatesAsync:function(){return this._impl.$41();},refreshSize:function(){this._impl.$32();},setFrameSize:function(width,height){var $0=width;var $1=height;if(tab._Utility.isNumber(width)){$0=width+'px';}if(tab._Utility.isNumber(height)){$1=height+'px';}this._impl.$43($0,$1);}}
tableauSoftware.VizManager=function(){}
tableauSoftware.VizManager.getVizs=function(){return tab._VizManagerImpl.get_$1();}
tableauSoftware.Workbook=function(workbookImpl){this.$0=workbookImpl;}
tableauSoftware.Workbook.prototype={$0:null,getViz:function(){return this.$0.get_viz();},getPublishedSheetsInfo:function(){return this.$0.get_publishedSheets()._toApiCollection();},getName:function(){return this.$0.get_name();},getActiveSheet:function(){return this.$0.get_activeSheetImpl().get_sheet();},getActiveCustomView:function(){return this.$0.get_activeCustomView();},activateSheetAsync:function(sheetNameOrIndex){return this.$0._setActiveSheetAsync(sheetNameOrIndex);},revertAllAsync:function(){return this.$0._revertAllAsync();},getCustomViewsAsync:function(){return this.$0.$1B();},showCustomViewAsync:function(customViewName){return this.$0.$1C(customViewName);},removeCustomViewAsync:function(customViewName){return this.$0.$1D(customViewName);},rememberCustomViewAsync:function(customViewName){return this.$0.$1E(customViewName);},setActiveCustomViewAsDefaultAsync:function(){return this.$0.$1F();},getParametersAsync:function(){return this.$0.$25();},changeParameterValueAsync:function(parameterName,value){return this.$0.$26(parameterName,value);}}
tableauSoftware.Worksheet=function(impl){tableauSoftware.Worksheet.initializeBase(this,[impl]);}
tableauSoftware.Worksheet.prototype={_impl:null,getParentDashboard:function(){return this._impl.get_parentDashboard();},getParentStoryPoint:function(){return this._impl.get_parentStoryPoint();},getDataSourcesAsync:function(){return this._impl.$10();},getFilterAsync:function(fieldName,options){return this._impl.$16(null,fieldName,options);},getFiltersAsync:function(options){return this._impl.$17(options);},applyFilterAsync:function(fieldName,values,updateType,options){return this._impl.$18(fieldName,values,updateType,options);},clearFilterAsync:function(fieldName){return this._impl.$19(fieldName);},applyRangeFilterAsync:function(fieldName,options){return this._impl.$1A(fieldName,options);},applyRelativeDateFilterAsync:function(fieldName,options){return this._impl.$1B(fieldName,options);},applyHierarchicalFilterAsync:function(fieldName,values,updateType,options){return this._impl.$1C(fieldName,values,updateType,options);},clearSelectedMarksAsync:function(){return this._impl.$27();},selectMarksAsync:function(fieldNameOrFieldValuesMap,valueOrUpdateType,updateType){return this._impl.$28(fieldNameOrFieldValuesMap,valueOrUpdateType,updateType);},getSelectedMarksAsync:function(){return this._impl.$29();}}
tab.WorksheetEvent=function(eventName,viz,worksheetImpl){tab.WorksheetEvent.initializeBase(this,[eventName,viz]);this.$2=worksheetImpl;}
tab.WorksheetEvent.prototype={$2:null,getWorksheet:function(){return this.$2.get_worksheet();}}
tab._jQueryShim=function(){}
tab._jQueryShim.$11=function($p0){return tab._jQueryShim.$13($p0)==='function';}
tab._jQueryShim.$12=function($p0){if(ss.isValue(Array.isArray)){return Array.isArray($p0);}return tab._jQueryShim.$13($p0)==='array';}
tab._jQueryShim.$13=function($p0){return ($p0==null)?String($p0):(tab._jQueryShim.$8[tab._jQueryShim.$A.call($p0)]||'object');}
tab._jQueryShim.$14=function($p0){if(ss.isValue(tab._jQueryShim.$9)){return ($p0==null)?'':tab._jQueryShim.$9.call($p0);}return ($p0==null)?'':$p0.replace(tab._jQueryShim.$B,'').replace(tab._jQueryShim.$C,'');}
tab._jQueryShim.parseJSON=function($p0){if(typeof($p0)!=='string'||ss.isNullOrUndefined($p0)){return null;}$p0=tab._jQueryShim.$14($p0);if(window.JSON && window.JSON.parse){return window.JSON.parse($p0);}if(tab._jQueryShim.$D.test($p0.replace(tab._jQueryShim.$E,'@').replace(tab._jQueryShim.$F,']').replace(tab._jQueryShim.$10,''))){return (new Function("return " + $p0))();}throw new Error('Invalid JSON: '+$p0);}
tab._ApiCommand.registerClass('tab._ApiCommand');tab._ApiServerResultParser.registerClass('tab._ApiServerResultParser');tab._ApiServerNotification.registerClass('tab._ApiServerNotification');tab._CommandReturnHandler.registerClass('tab._CommandReturnHandler');tab.JavaScriptApi$1.registerClass('tab.JavaScriptApi$1',null,tab.ICrossDomainMessageRouter);tab.JavaScriptApi$2.registerClass('tab.JavaScriptApi$2',null,tab.ICrossDomainMessageHandler);tab.CrossDomainMessagingOptions.registerClass('tab.CrossDomainMessagingOptions');tab._Enums.registerClass('tab._Enums');tab._ApiBootstrap.registerClass('tab._ApiBootstrap');tab._ApiObjectRegistry.registerClass('tab._ApiObjectRegistry');tab._CustomViewImpl.registerClass('tab._CustomViewImpl');tab._SheetImpl.registerClass('tab._SheetImpl');tab._DashboardImpl.registerClass('tab._DashboardImpl',tab._SheetImpl);tab._DataSourceImpl.registerClass('tab._DataSourceImpl');tab._DeferredUtil.registerClass('tab._DeferredUtil');tab._CollectionImpl.registerClass('tab._CollectionImpl');tab._DeferredImpl.registerClass('tab._DeferredImpl');tab._PromiseImpl.registerClass('tab._PromiseImpl');tab._MarkImpl.registerClass('tab._MarkImpl');tab._Param.registerClass('tab._Param');tab._ParameterImpl.registerClass('tab._ParameterImpl');tab._StoryImpl.registerClass('tab._StoryImpl',tab._SheetImpl);tab._StoryPointImpl.registerClass('tab._StoryPointImpl');tab.StoryPointInfoImplUtil.registerClass('tab.StoryPointInfoImplUtil');tab._TableauException.registerClass('tab._TableauException');tab._Utility.registerClass('tab._Utility');tab.VizImpl.registerClass('tab.VizImpl',null,tab.ICrossDomainMessageHandler);tab._VizManagerImpl.registerClass('tab._VizManagerImpl');tab._VizParameters.registerClass('tab._VizParameters');tab._WorkbookImpl.registerClass('tab._WorkbookImpl');tab._WorksheetImpl.registerClass('tab._WorksheetImpl',tab._SheetImpl);tab.JsonUtil.registerClass('tab.JsonUtil');tableauSoftware.CustomView.registerClass('tableauSoftware.CustomView');tab.TableauEvent.registerClass('tab.TableauEvent');tab.CustomViewEvent.registerClass('tab.CustomViewEvent',tab.TableauEvent);tab.EventContext.registerClass('tab.EventContext');tab.JavaScriptApi$3.registerClass('tab.JavaScriptApi$3',tab.EventContext);tableauSoftware.Sheet.registerClass('tableauSoftware.Sheet');tableauSoftware.Dashboard.registerClass('tableauSoftware.Dashboard',tableauSoftware.Sheet);tableauSoftware.DashboardObject.registerClass('tableauSoftware.DashboardObject');tableauSoftware.DataSource.registerClass('tableauSoftware.DataSource');tableauSoftware.Field.registerClass('tableauSoftware.Field');tableauSoftware.Filter.registerClass('tableauSoftware.Filter');tableauSoftware.CategoricalFilter.registerClass('tableauSoftware.CategoricalFilter',tableauSoftware.Filter);tab.WorksheetEvent.registerClass('tab.WorksheetEvent',tab.TableauEvent);tab.FilterEvent.registerClass('tab.FilterEvent',tab.WorksheetEvent);tab.JavaScriptApi$6.registerClass('tab.JavaScriptApi$6',tab.EventContext);tableauSoftware.HierarchicalFilter.registerClass('tableauSoftware.HierarchicalFilter',tableauSoftware.Filter);tableauSoftware.QuantitativeFilter.registerClass('tableauSoftware.QuantitativeFilter',tableauSoftware.Filter);tableauSoftware.RelativeDateFilter.registerClass('tableauSoftware.RelativeDateFilter',tableauSoftware.Filter);tab.FirstVizSizeKnownEvent.registerClass('tab.FirstVizSizeKnownEvent',tab.TableauEvent);tableauSoftware.Version.registerClass('tableauSoftware.Version');tab.VizResizeEvent.registerClass('tab.VizResizeEvent',tab.TableauEvent);tableauSoftware.Mark.registerClass('tableauSoftware.Mark');tab.MarksEvent.registerClass('tab.MarksEvent',tab.WorksheetEvent);tab.JavaScriptApi$5.registerClass('tab.JavaScriptApi$5',tab.EventContext);tableauSoftware.Pair.registerClass('tableauSoftware.Pair');tableauSoftware.Parameter.registerClass('tableauSoftware.Parameter');tab.ParameterEvent.registerClass('tab.ParameterEvent',tab.TableauEvent);tab.JavaScriptApi$4.registerClass('tab.JavaScriptApi$4',tab.EventContext);tableauSoftware.SheetInfo.registerClass('tableauSoftware.SheetInfo');tab.SheetSizeFactory.registerClass('tab.SheetSizeFactory');tableauSoftware.Story.registerClass('tableauSoftware.Story',tableauSoftware.Sheet);tableauSoftware.StoryPoint.registerClass('tableauSoftware.StoryPoint');tableauSoftware.StoryPointInfo.registerClass('tableauSoftware.StoryPointInfo');tab.StoryPointSwitchEvent.registerClass('tab.StoryPointSwitchEvent',tab.TableauEvent);tab.TabSwitchEvent.registerClass('tab.TabSwitchEvent',tab.TableauEvent);tableauSoftware.Viz.registerClass('tableauSoftware.Viz');tableauSoftware.VizManager.registerClass('tableauSoftware.VizManager');tableauSoftware.Workbook.registerClass('tableauSoftware.Workbook');tableauSoftware.Worksheet.registerClass('tableauSoftware.Worksheet',tableauSoftware.Sheet);tab._jQueryShim.registerClass('tab._jQueryShim');tab._ApiCommand.crossDomainEventNotificationId='xdomainSourceId';tab._ApiObjectRegistry.$1=null;tab._ApiObjectRegistry.$2=null;tab._SheetImpl.noZoneId=4294967295;tab._VizManagerImpl.$0=[];tab._WorksheetImpl.$25=new RegExp('\\[[^\\]]+\\]\\.','g');tableauSoftware.Version.$0=new tableauSoftware.Version(2,0,0,null);tab._jQueryShim.$8={'[object Boolean]':'boolean','[object Number]':'number','[object String]':'string','[object Function]':'function','[object Array]':'array','[object Date]':'date','[object RegExp]':'regexp','[object Object]':'object'};tab._jQueryShim.$9=String.prototype.trim;tab._jQueryShim.$A=Object.prototype.toString;tab._jQueryShim.$B=new RegExp('^[\\s\\xA0]+');tab._jQueryShim.$C=new RegExp('[\\s\\xA0]+$');tab._jQueryShim.$D=new RegExp('^[\\],:{}\\s]*$');tab._jQueryShim.$E=new RegExp('\\\\(?:["\\\\\\/bfnrt]|u[0-9a-fA-F]{4})','g');tab._jQueryShim.$F=new RegExp('"[^"\\\\\\n\\r]*"|true|false|null|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?','g');tab._jQueryShim.$10=new RegExp('(?:^|:|,)(?:\\s*\\[)+','g');tableauSoftware.Promise=tab._PromiseImpl;tab._Deferred=tab._DeferredImpl;tab._Collection=tab._CollectionImpl;tableauSoftware.DashboardObjectType={BLANK:'blank',WORKSHEET:'worksheet',QUICK_FILTER:'quickFilter',PARAMETER_CONTROL:'parameterControl',PAGE_FILTER:'pageFilter',LEGEND:'legend',TITLE:'title',TEXT:'text',IMAGE:'image',WEB_PAGE:'webPage'};tableauSoftware.FilterType={CATEGORICAL:'categorical',QUANTITATIVE:'quantitative',HIERARCHICAL:'hierarchical',RELATIVEDATE:'relativedate'};tableauSoftware.ParameterDataType={FLOAT:'float',INTEGER:'integer',STRING:'string',BOOLEAN:'boolean',DATE:'date',DATETIME:'datetime'};tableauSoftware.ParameterAllowableValuesType={ALL:'all',LIST:'list',RANGE:'range'};tableauSoftware.PeriodType={YEAR:'year',QUARTER:'quarter',MONTH:'month',WEEK:'week',DAY:'day',HOUR:'hour',MINUTE:'minute',SECOND:'second'};tableauSoftware.DateRangeType={LAST:'last',LASTN:'lastn',NEXT:'next',NEXTN:'nextn',CURR:'curr',TODATE:'todate'};tableauSoftware.SheetSizeBehavior={AUTOMATIC:'automatic',EXACTLY:'exactly',RANGE:'range',ATLEAST:'atleast',ATMOST:'atmost'};tableauSoftware.SheetType={WORKSHEET:'worksheet',DASHBOARD:'dashboard',STORY:'story'};tableauSoftware.FilterUpdateType={ALL:'all',REPLACE:'replace',ADD:'add',REMOVE:'remove'};tableauSoftware.SelectionUpdateType={REPLACE:'replace',ADD:'add',REMOVE:'remove'};tableauSoftware.NullOption={NULL_VALUES:'nullValues',NON_NULL_VALUES:'nonNullValues',ALL_VALUES:'allValues'};tableauSoftware.ErrorCode={INTERNAL_ERROR:'internalError',SERVER_ERROR:'serverError',INVALID_AGGREGATION_FIELD_NAME:'invalidAggregationFieldName',INVALID_PARAMETER:'invalidParameter',INVALID_URL:'invalidUrl',STALE_DATA_REFERENCE:'staleDataReference',VIZ_ALREADY_IN_MANAGER:'vizAlreadyInManager',NO_URL_OR_PARENT_ELEMENT_NOT_FOUND:'noUrlOrParentElementNotFound',INVALID_FILTER_FIELDNAME:'invalidFilterFieldName',INVALID_FILTER_FIELDVALUE:'invalidFilterFieldValue',INVALID_FILTER_FIELDNAME_OR_VALUE:'invalidFilterFieldNameOrValue',FILTER_CANNOT_BE_PERFORMED:'filterCannotBePerformed',NOT_ACTIVE_SHEET:'notActiveSheet',INVALID_CUSTOM_VIEW_NAME:'invalidCustomViewName',MISSING_RANGEN_FOR_RELATIVE_DATE_FILTERS:'missingRangeNForRelativeDateFilters',MISSING_MAX_SIZE:'missingMaxSize',MISSING_MIN_SIZE:'missingMinSize',MISSING_MINMAX_SIZE:'missingMinMaxSize',INVALID_SIZE:'invalidSize',INVALID_SIZE_BEHAVIOR_ON_WORKSHEET:'invalidSizeBehaviorOnWorksheet',SHEET_NOT_IN_WORKBOOK:'sheetNotInWorkbook',INDEX_OUT_OF_RANGE:'indexOutOfRange',DOWNLOAD_WORKBOOK_NOT_ALLOWED:'downloadWorkbookNotAllowed',NULL_OR_EMPTY_PARAMETER:'nullOrEmptyParameter',BROWSER_NOT_CAPABLE:'browserNotCapable',UNSUPPORTED_EVENT_NAME:'unsupportedEventName',INVALID_DATE_PARAMETER:'invalidDateParameter',INVALID_SELECTION_FIELDNAME:'invalidSelectionFieldName',INVALID_SELECTION_VALUE:'invalidSelectionValue',INVALID_SELECTION_DATE:'invalidSelectionDate',NO_URL_FOR_HIDDEN_WORKSHEET:'noUrlForHiddenWorksheet',MAX_VIZ_RESIZE_ATTEMPTS:'maxVizResizeAttempts'};tableauSoftware.TableauEventName={CUSTOM_VIEW_LOAD:'customviewload',CUSTOM_VIEW_REMOVE:'customviewremove',CUSTOM_VIEW_SAVE:'customviewsave',CUSTOM_VIEW_SET_DEFAULT:'customviewsetdefault',FILTER_CHANGE:'filterchange',FIRST_INTERACTIVE:'firstinteractive',FIRST_VIZ_SIZE_KNOWN:'firstvizsizeknown',MARKS_SELECTION:'marksselection',PARAMETER_VALUE_CHANGE:'parametervaluechange',STORY_POINT_SWITCH:'storypointswitch',TAB_SWITCH:'tabswitch',VIZ_RESIZE:'vizresize'};tableauSoftware.FieldRoleType={DIMENSION:'dimension',MEASURE:'measure',UNKNOWN:'unknown'};tableauSoftware.FieldAggregationType={SUM:'SUM',AVG:'AVG',MIN:'MIN',MAX:'MAX',STDEV:'STDEV',STDEVP:'STDEVP',VAR:'VAR',VARP:'VARP',COUNT:'COUNT',COUNTD:'COUNTD',MEDIAN:'MEDIAN',ATTR:'ATTR',NONE:'NONE',PERCENTILE:'PERCENTILE',YEAR:'YEAR',QTR:'QTR',MONTH:'MONTH',DAY:'DAY',HOUR:'HOUR',MINUTE:'MINUTE',SECOND:'SECOND',WEEK:'WEEK',WEEKDAY:'WEEKDAY',MONTHYEAR:'MONTHYEAR',MDY:'MDY',END:'END',TRUNC_YEAR:'TRUNC_YEAR',TRUNC_QTR:'TRUNC_QTR',TRUNC_MONTH:'TRUNC_MONTH',TRUNC_WEEK:'TRUNC_WEEK',TRUNC_DAY:'TRUNC_DAY',TRUNC_HOUR:'TRUNC_HOUR',TRUNC_MINUTE:'TRUNC_MINUTE',TRUNC_SECOND:'TRUNC_SECOND',QUART1:'QUART1',QUART3:'QUART3',SKEWNESS:'SKEWNESS',KURTOSIS:'KURTOSIS',INOUT:'INOUT',SUM_XSQR:'SUM_XSQR',USER:'USER'};tableauSoftware.ToolbarPosition={TOP:'top',BOTTOM:'bottom'};restoreTypeSystem();tab._ApiBootstrap.initialize();})();