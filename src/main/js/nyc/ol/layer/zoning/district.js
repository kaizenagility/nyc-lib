var nyc = nyc || {};
nyc.ol = nyc.ol || {};
nyc.ol.layer = nyc.ol.layer || {};
nyc.ol.layer.zoning = nyc.ol.layer.zoning || {};

/**
 * @desc Abstract class for creating layer groups
 * @public
 * @class
 * @extends {nyc.ol.layer.Group}
 * @constructor
 * @param {ol.Map} map The map to which the layers will be added
 */
nyc.ol.layer.zoning.District = function(map){
	nyc.ol.layer.Group.apply(this, [map]);
	this.addTo(map);
};

nyc.ol.layer.zoning.District.prototype = {
	/**
	 * @private
	 * @member {string}
	 */
	url: '/geoserver/gwc/service/tms/1.0.0/zoning%3Azoning@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
	/**
	 * @private
	 * @method
	 * @param {ol.Map} map 
	 */
	addTo: function(map){
		var me = this, added = me.addedLayers;

		var distLyr = new ol.layer.VectorTile({
			source: new ol.source.VectorTile({
		        url: this.url,
				tileGrid: nyc.ol.TILE_GRID,
				format: new ol.format.MVT()
			}),
			style: nyc.ol.style.zoning.district.style,
			extent: nyc.ol.Basemap.EXTENT,
			visible: false,
			zIndex: 1000
		});
		map.addLayer(distLyr);
		added.groupLayers.push(distLyr);
		distLyr.set('name', 'Zoning District');

		added.tips.push(
	        new nyc.ol.FeatureTip(map, [{layer: distLyr, labelFunction: function(){
				me.mixin(this, me.mixins);	        	
	        	return {cssClass: 'tip-zoning', text: this.tip()};
	        }}])
		);

		distLyr.html = function(feature, layer){
			if (layer === this && feature.get('layer') == 'zoning-district'){
				me.mixin(feature, me.mixins);	        	
				return feature.html();
			}
		};
	},
	/**
	 * @private
	 * @member {Array<Object>}
	 */
	mixins: [
         {
        	 baseUrl: 'http://www1.nyc.gov/site/planning/zoning/districts-tools/',
        	 categories: {
        		 MED_HI_RES: {desc: 'Residential (Medium and Higher Density)', url: 'residence-districts-r1-r10.page'},
        		 LOW_RES: {desc: 'Residential (Lower Density)', url: 'residence-districts-r1-r10.page'},
        		 COM: {desc: 'Commercial', url: 'commercial-districts-c1-c8.page'},
        		 MIX: {desc: 'Mixed Use', url: 'glossary.page#paired_districts'},
        		 MAN: {desc: 'Manufacturing', url: 'mfg-districts.page'},
        		 BPC: {desc: 'Battery Park City', url: 'special-purpose-districts-manhattan.page#bpark'},
        		 PARK: {desc: 'Park', url: 'glossary.page#public_park'}
			}
		},
 		new nyc.Content({
 			tip: '<div class="zoning"><b>${ZONEDIST}</b><br>${category}</div>',
 			popup: '<div class="zoning">' +
	 			'<div><b>Zoning designation:</b></div>' +
	 			'<div><a href="${zonedistUrl}" target="_blank" rel="noopener noreferrer">${ZONEDIST}</a></div>' +
	 			'<div><b>Description:</b></div>' +
	 			'<div><a href="${categoryUrl}" target="_blank" rel="noopener noreferrer">${category}</a></div>'
		}),
		{
			/**
			 * @private
			 * @function
			 * @param {string} infoClass A css class for list view or popup view
			 * @return {JQuery}
			 */
			html: function(){
				this.embelish();				
				return this.message('popup', this.getProperties());
			},
			/**
			 * @private
			 * @function
			 * @param {string} infoClass A css class for list view or popup view
			 * @return {JQuery}
			 */
			tip: function(){
				this.embelish();
				return this.message('tip', this.getProperties());
			},
			embelish: function(){
				var props = this.getProperties(), category = this.categories[this.get('CATEGORY')];
				props.category = category.desc;
				props.categoryUrl = this.baseUrl + category.url;
				props.zonedistUrl = this.baseUrl + this.get('URL');
			}
		}
	]
};

nyc.inherits(nyc.ol.layer.zoning.District, nyc.ol.layer.Group);