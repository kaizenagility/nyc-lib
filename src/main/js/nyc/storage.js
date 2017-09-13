var nyc = nyc || {};

nyc.storage = {
	/**
	 * @private
	 * @member {string}
	 */
	EPSG_SERVICE_URL: 'http://prj2epsg.org/search.json?mode=wkt&terms=',
	/**
	 * @desc Check if download is available
	 * @public
	 * @function
	 * @return {boolean}
	 */
	canDownload: function(name, data){
		return 'download' in $('<a></a>').get(0);
	},
	/**
	 * @desc Save data to a file prompting the user with a file dialog
	 * @public
	 * @function
	 * @param {string} name File name
	 * @param {string} data JSON data to write to file
	 */
	saveToFile: function(name, data){
		var href = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
		var a = $('<a><img></a>');
		$('body').append(a);
		a.attr('href', href).attr('download', name).find('img').trigger('click');
		a.remove();
	},
	/**
	 * @desc Set data in localStorage if available
	 * @public
	 * @function
	 * @param {string} key Storage key
	 * @param {string} data Data to store
	 */
	setItem: function(key, data){
		if ('localStorage' in window){
			localStorage.setItem(key, data);
		}
	},
	/**
	 * @desc Get data from localStorage if available
	 * @public
	 * @function
	 * @param {string} key Storage key
	 * @return {string}
	 */
	getItem: function(key){
		if ('localStorage' in window){
			return localStorage.getItem(key);
		}
	},
	/**
	 * @desc Remove data from localStorage if available
	 * @public
	 * @function
	 * @param {string} key Storage key
	 * @return {string}
	 */
	removeItem: function(key){
		if ('localStorage' in window){
			return localStorage.removeItem(key);
		}
	},
	/**
	 * @desc Open a text file from local disk
	 * @public
	 * @function
	 * @param {function} callback The callback function to receive file content
	 * @param {string=} file File name
	 */
	openTextFile: function(callback, file){
		var reader = new FileReader();
		reader.onload = function(){
			callback(reader.result);
		};
		if (!file){
			var input = $('<input type="file">');
			input.change(function(event){
				reader.readAsText(event.target.files[0]);
			});
			input.click();
		}else{
			reader.readAsText(file);
		}
	},
	/**
	 * @desc Open a GeoJSON file from local disk
	 * @public
	 * @function
	 * @param {ol.Map} map The map in which the data will be displayed
	 * @param {function=} callback The callback function to receive the added ol.vector.Layer
	 * @param {string=} file File name
	 */
	openGeoJsonFile: function(map, callback, file){
		nyc.storage.openTextFile(function(geoJson){
			var layer = nyc.storage.addToMap(map, geoJson);
			if (callback) callback(layer);
		}, file);
	},
	/**
	 * @desc Open a shapefile from local disk
	 * @public
	 * @function
	 * @param {ol.Map} map The map in which the data will be displayed
	 * @param {function=} callback The callback function to receive the added ol.vector.Layer
	 * @see https://github.com/mbostock/shapefile
	 */
	openShapeFile: function(map, callback){
		var input = $('<input type="file" multiple>'), shp, dbf, prj;
		input.change(function(event){
			var files = event.target.files;
			$.each(files, function(){
				var ext = this.name.substr(name.length - 4);
				if (ext == '.shp') shp = this;
				else if (ext == '.dbf') dbf = this;
				else if (ext == '.prj') prj = this;
			});
			console.info(shp,dbf,prj);
			nyc.storage.readPrj(prj, function(epsg){
				nyc.storage.readShpDbf(shp, dbf, callback);
			});
		});
		input.click();
	},
	/**
	 * @private
	 * @method
	 * @param {File} prj
	 * @param {function} callback
	*/
	readPrj: function(prj, callback){
		if (prj){
			callback();
		}else{
			callback();
		}
	},
	/**
	 * @private
	 * @method
	 * @param {File} shp
	 * @param {File} dbf
	 * @param {function} callback
	*/
	readShpDbf: function(shp, dbf, callback){
		var shpBuffer, dbfBuffer;

		var shpReader = new FileReader();
		shpReader.onload = function(event){
			shpBuffer = event.target.result;
			if (dbfBuffer || files.length == 1){
				nyc.storage.openShp(shp, dbfBuffer, callback);
			}
		};

		var dbfReader = new FileReader();
		dbfReader.onload = function(event){
			dbfBuffer = event.target.result;
			if (shpBuffer){
				nyc.storage.openShp(shpBuffer, dbfBuffer, callback);
			}
		};
		
		shpReader.readAsArrayBuffer(shp);
		if (dbf) dbfReader.readAsArrayBuffer(dbf);
	},
	/**
	 * @private
	 * @method
	 * @param {string|ArrayBuffer} shp
	 * @param {string|ArrayBuffer} dbf
	 * @param {function} callback
	*/
	openShp: function(shp, dbf, callback){
		var features = [];
		shapefile.open(shp, dbf)
		  .then(source => source.read()
		  .then(function collect(result){
				if (result.done){
					var layer = nyc.storage.addToMap(map, features);
					if (callback) callback(layer);
					return;
				}else{
					features.push(result.value);
				}
				return source.read().then(collect);
			}))
		  .catch(error => console.error(error.stack));
	},
	/**
	 * @private
	 * @method
	 * @param {ol.Map} map
	 * @param {string|Array<Object>} features
	  * @return {ol.layer.Vector}
	*/
	addToMap: function(map, features){
		var proj = map.getView().getProjection();
		if (typeof features == 'object'){
			features = {type: 'FeatureCollection', features: features};
		}
		features = new ol.format.GeoJSON({featureProjection: proj}).readFeatures(features);
		var source = new ol.source.Vector();
		var layer = new ol.layer.Vector({source: source});
		source.addFeatures(features);
		map.addLayer(layer);
		return layer;
	}
};
