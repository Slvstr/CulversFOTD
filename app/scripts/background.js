'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'FOTD'});

var showFlavor = function (response) {
  var flavor = $(response).find('.restaraunt-fotd-title-text').first().text();
  $('.flavor').text(flavor);
};
var store = 'middleton';
$.get('http://www.culvers.com/restaurants/' + store + '/', showFlavor);



/******************************************************************************
 * TODO: 
 * Move scraping logic to client side
 * Loading animation
 * Escape html
 * Background image or middle div with ice cream logo
 * Options page to select location.  
 * Compile list of locations and allow search/filtering
 * Caching/ Date checking
 *****************************************************************************/

// var request = require('request');
// var trumpet = require('trumpet');
// var tr = trumpet();

// var testURL = 'http://www.culvers.com/restaurants/middleton/';

// tr.select('.restaraunt-fotd-title-text', function(flavor) {
//   flavor.createReadStream().pipe(process.stdout);
// });

// var page = request.get(testURL);

 