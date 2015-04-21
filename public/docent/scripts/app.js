'use strict';

/* App Module */

var app = angular.module('docent', ['idxCtrls','ngRoute','ngAnimate'])

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/centerView', {
        templateUrl: 'view.html',
        controller: 'centerView'
      }).
      when('/assayView', {
        templateUrl: 'view.html',
        controller: 'assayView'
      }).
      otherwise({
        redirectTo: '/centerView'
      });
}]);


app.factory('countUtil',function(){
  var util = {}
  // Backbone's logic
  util.CountModel = Backbone.Model.extend({
    defaults:{
      count:0,
    }
  });
  util.validateCount = function(count){
    count = parseInt(count)
    if(isNaN(count)) return 0;
    else return count;
  }
  return util;
});

app.directive('genericCount',['countUtil',function(util){
  return {
    restrict: 'A',
    link: function (scope, element) {
      var initCount = util.validateCount(scope.item.count);
      var countModel = new util.CountModel();
      var view = new Barista.Views.GenericCountView({
        el: element,
        label: scope.item.name,
        model: countModel,
        fg_color: scope.$parent.group.color,
        top_bar_color: 'white',
        plot_height: 70,
        duration: 800,
        png: false,
        span_class: ""
      });
      countModel.set('count',initCount)
      scope.$watch('item.count',function(newVal){
        countModel.set('count',util.validateCount(newVal));
      });
    }
  };
}])
.directive('packery',['$timeout',function($timeout){
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last) {
        // dynamic containerId is necessary for animation because
        // during animation there is time when both the container for
        // the center view and the container for the assay view exists
          var containerId = scope.$parent.$parent.containerId;
          $timeout(function () {
            var pckry = new Packery( '#'+containerId, {
              // options
              itemSelector: '.group',
              gutter: 20
            });
          });
        }
      }
    }
}]);
