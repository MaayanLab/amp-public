var services = angular.module('services', [])

services.factory('transform',[function(){
	// transform results from Miami API to groups structure.
	return function(inputGroups,map,countNameMap,groupNameFun){
		// groupNameFun applies some transformation on groupName
		var nameKey = map.nameKey;
		var groups = _.map(inputGroups,function(inputGroup){
			var group = {};
			var groupName = inputGroup[nameKey]
			group.name = groupNameFun(groupName);
			group.color = groupName in map.meta?
			map.meta[groupName].color:map.meta['default'].color;
			group.counts = [];
			for(var key in inputGroup){
				if(key!=nameKey){
					var count = {};
					count.name = key in countNameMap?countNameMap[key]:keys;
					count.count = inputGroup[key];
					group.counts.push(count);
				}
			}
			return group;
		});
		return groups;
	}
}])
.factory('assayMap',['mapProvider',function(mapProvider){
	// modify assay map so that transform function could be applied to it.

	// sinai cyan, OHSU green, sinai magenta, columbia, irvine yellow
	// yale blue, ASU red, Broad blue, Harvard red
	var colorLibrary = ['#00AEEF','#66cc33','#D80B8C', "#c4d8e2", "#ffd200",
		"#0F4D92", "#990033", "#0B609A", "#C90016"];
	var centerMap = mapProvider.centers;
	var assayMap = mapProvider.assays;

	var colorCursor = 0;
	for(var assayName in assayMap.meta){
		if("center" in assayMap.meta[assayName]){
			var assayCenter = assayMap.meta[assayName].center;
			assayMap.meta[assayName].color = assayCenter in centerMap.meta?
			centerMap.meta[assayCenter].color:centerMap.meta['default'].color;
		}else{
			assayMap.meta[assayName].color = colorLibrary[colorCursor%colorLibrary.length];
			colorCursor = colorCursor + 1;
		}
	}
	return assayMap;
}])
.factory('initialize',['transform','$q','$http','mapProvider','assayMap',
	function(transform,$q,$http,mapProvider,assayMap){
	// To cache initialize results? or delay animation ?

		var centerDeferred = $q.defer();
		var url = "http://life.ccs.miami.edu/life/api/centerview?searchTerm=*:*&minCount=1"
		$http.get(url)
			.success(function(inputGroups){
			var key = 'centers';
			var groups = transform(inputGroups[key],mapProvider[key],
				mapProvider.countName, _.identity);
			centerDeferred.resolve(groups);
		});

		var assayDeferred = $q.defer(); 
		var url = "http://life.ccs.miami.edu/life/api/assayview?searchTerm=*:*&minCount=1"
		var capitalize = function(str){
			return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		}
		$http.get(url)
			.success(function(inputGroups){
			var key = 'assays';
			var groups = transform(inputGroups[key],assayMap,
				mapProvider.countName, capitalize);
			assayDeferred.resolve(groups);
			console.log('assayDeferred.resolve');
		});

		var res = {centers:centerDeferred.promise,
			assays:assayDeferred.promise};
		return res;
}]);
