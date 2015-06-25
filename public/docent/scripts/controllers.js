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
	$scope.getDetailFactory = function(group,item){
		var initialize = function(scope){
			if(scope.data[0]){
				var keys = Object.keys(scope.data[0]);
				var pattern = /name/i;
				scope.nameKey = _.find(keys,function(key){
					return pattern.test(key);
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
				scope.data.forEach(function(e){
					e.show = false;
				});
			}
		};
		var template = "http://life.ccs.miami.edu/life/api/constituentinfo?searchTerm={{groupAPIName}}&constituentType={{itemAPIName}}&limit=100";
		if(item.data)
			return {data:item.data,initialize:initialize};
		else{
			return function(cb){
				$http.get(S(template).template({groupAPIName:group.apiName,
					itemAPIName:item.apiName}).s)
				.success(function(data){
					item.data = data.results;
					cb({data:data.results,
						initialize:initialize});
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
