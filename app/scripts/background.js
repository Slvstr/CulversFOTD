'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});
var app = angular.module('culversApp', ['ui.router', 'ngAnimate']);

app.config(function($stateProvider, $urlRouterProvider, $logProvider) {
  $urlRouterProvider.otherwise('/home');

  $logProvider.debugEnabled(true);

  $stateProvider.state('home', {
    url: '/home',
    templateUrl: 'home.html',
    controller: 'homeCtrl'
  })
  .state('options', {
    url: '/options',
    templateUrl: 'options.html',
    controller: 'optionsCtrl'
  });
});

app.run(function(Flavor, Stores) {
  // Maybe a try/catch block here if this doesn't work
  chrome.storage.local.get('selectedStore', function(items) {
    var defaultStore = items.selectedStore.url || 'middleton';
    Stores.setSelectedStore(defaultStore);
  });

  chrome.storage.local.get('flavorCache', function(items) {
    Flavor.flavorCache = items.flavorCache || Flavor.flavorCache;
  });

});


app.factory('Stores', function storesService() {
  var _selectedStore;
  var _list = [
    {url: 'middleton', name: 'Middleton', city: 'Middleton', state: 'Wisconsin' },
    {url: 'madison-todd-drive', name: 'Madison (Todd Dr.)', city: 'Madison', state: 'Wisconsin' },
    {url: 'madison-northport', name: 'Madison (Northport)', city: 'Madison', state: 'Wisconsin' },
    {url: 'madison-east-towne', name: 'Madison (East Towne)', city: 'Madison', state: 'Wisconsin' },
    {url: 'madison-cottage-grove', name: 'Madison (Cottage Grove)', city: 'Madison', state: 'Wisconsin' },
    {url: 'mcfarland', name: 'McFarland', city: 'McFarland', state: 'Wisconsin' },
    {url: 'verona', name: 'Verona', city: 'Verona', state: 'Wisconsin' },
    {url: 'cross-plains', name: 'Cross Plains', city: 'Cross Plains', state: 'Wisconsin' },
    {url: 'waunakee', name: 'Waunakee', city: 'Waunakee', state: 'Wisconsin' },
    {url: 'sauk-city', name: 'Sauk City', city: 'Sauk City', state: 'Wisconsin' }
  ];
  return {
    getSelectedStore: function() {
      return _selectedStore;
    },
    setSelectedStore: function(storeUrl) {
      _selectedStore = storeUrl;
      chrome.storage.local.set({'selectedStore': {'url': storeUrl}});
    },
    list: _list
  };
});



app.factory('Flavor', function flavorService(Stores, $http, $q, $filter) {
  var baseUrl = 'http://www.culvers.com/restaurants/';

  var isSameDay = function(date1, date2) {

    var day1 = $filter('date')(date1, 'fullDate');
    var day2 = $filter('date')(date2, 'fullDate');
    console.log(day1);
    console.log(day2);

    return day1 === day2;
  };

  return {

    flavorCache: {},

    getFlavor : function() {
      var deffered = $q.defer();
      var storePath = Stores.getSelectedStore();
      var today = Date.now();


      // If we already got a flavor for that store today, serve it from the cache
      if (this.flavorCache[storePath] && isSameDay(this.flavorCache[storePath].lastUpdated, today)) {
        console.log('Returning cached flavor'+ this.flavorCache[storePath].flavor);
        deffered.resolve(this.flavorCache[storePath].flavor);
      }

      // Otherwise go scrape the page to get today's flavor
      else {
        var self = this;
        $http.get(baseUrl + storePath + '/')
          .success(function(response) {
            var newFlavor = $(response).find('.ModuleRestaurantDetail-fotd').find('h2').text();
            self.flavorCache[storePath] = {
              flavor: newFlavor,
              lastUpdated: Date.now()
            };

            chrome.storage.local.set({'flavorCache': self.flavorCache});

            console.log('Got new flavor' + newFlavor);
            deffered.resolve(newFlavor);
          });        
      }

      return deffered.promise;

    }
  };

});



app.controller('homeCtrl', function($scope, Flavor) {
  console.log('About to retrieve flavor');
  Flavor.getFlavor().then(function(flavor) {
    $scope.flavor = flavor;
  });
});



app.controller('optionsCtrl', function($scope, Stores, $state) {
  $scope.stores = Stores;
  $scope.selectedStore = Stores.getSelectedStore();
  $scope.selectStore = function(url) {
    $scope.selectedStore = url;
    Stores.setSelectedStore(url);
    $state.go('home');
  };


});



app.directive('flavorDisplay', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'flavor-display.html',
    link: function(scope, element, attrs) {

    }
  };
});

app.directive('focus', function() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.focus();
    }
  };
});




/******************************************************************************
 * TODO: 
 * Loading animation
 * Escape html (angular might have taken care of this for me)
 * Background image or middle div with ice cream logo (partially done)
 * Options page to select location.  (started)
 * Compile list of locations and allow search/filtering (got madison directions)
 *****************************************************************************/

// var request = require('request');
// var trumpet = require('trumpet');
// var tr = trumpet();

// var testURL = 'http://www.culvers.com/restaurants/middleton/';

// tr.select('.restaraunt-fotd-title-text', function(flavor) {
//   flavor.createReadStream().pipe(process.stdout);
// });

// var page = request.get(testURL);

 