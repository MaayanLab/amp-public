angular.module('idxCtrls', ["services"])
.controller('main',['$scope','$location', '$http', 'Pagination',
	function($scope,$location,$http,Pagination){
	// in case user refreshes page at assay route.
	if($location.path()=="/assayView")
		$scope.view = "assay";
	else
		$scope.view = "center";
	$scope.setView = function(view){
		$scope.view = view;
	}
	var initializeFactory = function(group,item){
	return function(scope){
		if(scope.data[0]){
			var keys = Object.keys(scope.data[0]);
			var hasName = /name/i;
			var hasAlter = /alter/i;
			var hasProvider = /provider/i;
			var hasCenter = /center/i;
			scope.nameKey = _.find(keys,function(key){
				return hasName.test(key) && !hasAlter.test(key) && !hasProvider.test(key) && !hasCenter.test(key);
			});
			scope.pagination = new Pagination(10);
			scope.targetGroup =  group;
			scope.targetItem = item;
			scope.validateKey = function(item){
				//Angular filters can only be applied to arrays, not objects.
				var res = {};
				for(var key in item){
					if(item[key]&&key!=scope.nameKey&&key!='show'){
						res[key] = item[key];
					}
				}
				return res;
			}
			scope.formatVal = function(val){
				return val.constructor == Array ? val.join(', '):val;
			}
			scope.data.forEach(function(e){
				e.show = false;
			});
		}
	}};
	$scope.getDetailFactory = function(group,item){
		var initialize = initializeFactory(group,item);
		var template = "http://life.ccs.miami.edu/life/api/drilldown?searchTerm={{groupAPIName}}&constituentType={{itemAPIName}}&limit=100";
		var url = S(template).template({groupAPIName:group.apiName,itemAPIName:item.apiName}).s;
		if(item.data)
			return {data:item.data,initialize:initialize};
		else{
			return function(cb){
				$http.get(url)
				.success(function(data){
					var tData; // transformed data;
					for(var key in data){
						tData = data[key];
					}
					item.data = tData;
					cb({data:tData,
						initialize:initialize});
				});
			}
		}
	}
	$scope.getDetailFactoryS = function(group,item){
		// for popoverServer.html
		var initialize = initializeFactory(group,item);
		var limit = 10;
		var template = "http://life.ccs.miami.edu/life/api/drilldown?searchTerm={{groupAPIName}}&constituentType={{itemAPIName}}&limit={{limit}}";
		var url = S(template).template({groupAPIName:group.apiName,
			itemAPIName:item.apiName,limit:limit}).s;

		var skip = 0;
		var skipTemplate = url+'&skip={{skip}}'
		var skipUrl = S(skipTemplate).template({skip:skip});

		var initializeS = function(scope){
			initialize(scope);
			var updateView = function(){
				var skipUrl = S(skipTemplate).template({skip:scope.skip});
				$http.get(skipUrl)
				.success(function(data){
					var tData; // transformed data;
					for(var key in data){
						tData = data[key];
					}
					scope.data = tData;
				});
			}
			var searchTemplate = "http://life.ccs.miami.edu/life/api/drilldown?searchTerm={{groupAPIName}}, {{key}}:{{searchStr}}&constituentType={{itemAPIName}}&limit={{limit}}";
			var fill = {groupAPIName:group.apiName,
			itemAPIName:item.apiName,limit:limit,key:scope.nameKey};
			scope.$watch('search[nameKey]',function(newStr,oldStr){
				if(newStr==''){
					scope.data = item.data;
					return;
				}
				if(newStr!==oldStr){
					fill.searchStr = newStr;
					var searchUrl = S(searchTemplate).template(fill).s;
					$http.get(searchUrl)
						.success(function(data){
						var tData,key; // transformed data;
						for(key in data){
							tData = data[key];
						}
						if(key=="error")
							scope.data = [];
						else
							scope.data = tData;
					});
				}
			});
			scope.previous = function(){
				if(scope.skip>0){
					scope.skip -=limit;
					updateView();
				}
			}
			scope.next = function(){
				if(scope.skip+scope.limit<scope.max){
					scope.skip=scope.skip+scope.limit;
					updateView();
				}
			}	
		}
		if(item.data)
			return {data:item.data,initialize:initializeS,
				skip:skip,limit:limit,max:item.count};
		else{
			return function(cb){
				$http.get(skipUrl)
				.success(function(data){
					var tData; // transformed data;
					for(var key in data){
						tData = data[key];
					}
					item.data = tData;
					cb({data:tData,initialize:initializeS,
						skip:skip,limit:limit,max:item.count});
				});
			}
		}
	}

}])
.controller('centerView',['$scope','initialize',function($scope,initialize) {
	// var altData =  [
	// 	{name:"Oregon Health and Science University",
	// 		counts:[{name:'a',count:98998},{name:'b',count:6665}]},
	// 	{name:"Broad Institute Transcriptomics",
	// 		counts:[{name:'de',count:77},{name:'ff',count:17}]}
	// 	];
	initialize.centers.then(function(groups){
		$scope.groups = groups;
		$scope.containerId = 'centerContainer';
	});
	// $scope.groups = [
	// 	{name:"Oregon Health and Science University",
	// 		counts:[{name:'a',count:98997},{name:'b',count:6}]},
	// 	{name:"Broad Institute Transcriptomics",
	// 		counts:[{name:'de',count:5},{name:'ff',count:7}]}
	// 	];
	// $scope.switchData = function(){
	// 	$scope.groups = altData;
	// }
	// $scope.updateData = function(){
	// 	for(i in _.range($scope.groups.length)){
	// 		for(j in _.range($scope.groups[i].counts.length)){
	// 			$scope.groups[i].counts[j].count = altData[i].counts[j].count;
	// 		}
	// 	}
	// }
	// $scope.removeItem = function(){
	// 	$scope.groups[0].counts.shift();
	// }
}])
.controller('assayView',['$scope','initialize',function($scope,initialize) {
	initialize.assays.then(function(groups){
		$scope.groups = groups;
		$scope.containerId = 'assayContainer';
	});
}]);
