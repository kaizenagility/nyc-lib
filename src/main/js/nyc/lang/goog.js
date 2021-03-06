var nyc = nyc || {};
nyc.lang = nyc.lang || {};

/**
 * @external google.translate.TranslateElement
 */

/**
 * @desc Class for language translation using the Google Translate Gadget
 * @public
 * @class
 * @extends {nyc.lang.Translate}
 * @constructor
 * @param {nyc.lang.Goog.Options} options Constructor options
 */
nyc.lang.Goog = function(options){
	nyc.lang.Translate.call(this, options);
	$.getScript('https://translate.google.com/translate_a/element.js?cb=nyc.lang.translate.init');
};

nyc.lang.Goog.prototype = {
	/**
	 * @private
	 * @member {google.translate.TranslateElement}
	 */
	goog: null,
	/**
	 * @desc Callback to set up Google Translate
	 * @public
	 * @method
	 */
	init: function(){
		nyc.lang.goog = new google.translate.TranslateElement({
			pageLanguage: 'en',
			includedLanguages: nyc.lang.translate.codes,
			layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
			autoDisplay: false
		}, 'lang-trans');
		nyc.lang.translate.hack();
		nyc.lang.translate.trigger(nyc.lang.Translate.EventType.READY, true);
	},
	/**
	 * @private
	 * @method
	 */
	showOriginalText: function(){
		var googBar = $('iframe.goog-te-banner-frame:first');
		$(googBar.contents().find('.goog-te-button button')).each(function(){
			if ($(this).text() == 'Show original'){
				$(this).trigger('click');
				if ($('#lang-choice').val() != 'English'){
					$('#lang-choice').val('English');
				}
				return false;
			}
		});
	},
	/**
	 * @desc Sets the chosen language and initiates Google Translation
	 * @public
	 * @method
	 */
   translate: function(event){
		var choices = $('iframe.goog-te-menu-frame:first').contents().find('.goog-te-menu2-item span.text');
		if (event && choices.length){
			var lang =  $(event.target).val();
			if (lang == 'English'){
				this.showOriginalText();
			}else{
				$(choices).each(function(){
					if ($(this).text() == lang){
						$(this).click();
						return false;
					}
				});
			}
			if (!this.isButton){
				$('#lang-choice-button span').show();
			}
			this.code = this.namedCodes[lang] || 'en';
			this.css('goog-tranlated');
			this.trigger(nyc.lang.Translate.EventType.CHANGE, this.code);
		}else{
			var me = this;
			setTimeout(function(){me.translate(event);}, 200);
		}
	},
	/**
	 * @private
	 * @method
	 */
	hack: function(){
		/*
		 * google translate doesn't translate placeholder attributes
		 * so we'll add a hidden span after input elements that have placeholders
		 * then use the placeholder text for the span
		 * then apply the translation of the span back to the placeholder
		 */
		$('input[placeholder]').each(function(){
			var next = $(this).next();
			if (!next.hasClass('lang-placeholder')){
				$(this).after('<span class="lang-placeholder">' + $(this).attr('placeholder') + '</span>');
			}else{
				var fonts = next.find('font');
				var text = next.html();
				$.each(next.find('font'), function(){
					text = $(this).html();
				});
				$(this).attr('placeholder', text);
			}
		});
		/*
		 * fix jquerymobile buttons crippled by font tags added by google translate
		 */
		$('font').each(function(){
			if ($(this).data('lang-hack') != 'hacked'){
				var btn = $(this).parent();
				$(this).data('lang-hack', 'hacked');
				while (btn.length && !btn.hasClass('ui-btn')) {
					btn = $(btn).parent();
				}
				if (btn.hasClass('ui-btn')) {
					$(this).click(function(event){
						btn.trigger('click');
					});
				}
			}
		});
		$('body').css('top', 'auto');
		$('#goog-gt-tt').remove();
		setTimeout($.proxy(this.hack, this), 200);
	},
	/**
	 * @private
	 * @method
	 * @return {string}
	 */
	getCookie: function(){
	    var cookies = document.cookie.split(';');
	    for (var i = 0; i < cookies.length; i++){
	        var cookie = cookies[i];
	        while (cookie.charAt(0) == ' ') cookie = cookie.substring(1, cookie.length);
	        if ( cookie.indexOf('googtrans=') == 0 ){
	            return cookie.substring(10, cookie.length);
	        }
	    }
	},
	/**
	 * @desc Gets the google translate cookie value
	 * @public
	 * @override
	 * @method
	 * @return {string}
	 */
	getCookieValue: function(){
		var cookie = this.getCookie();
		if (cookie){
			cookie = cookie.split('/');
			cookie = cookie[2];
			return cookie;
		}
	}
};

nyc.inherits(nyc.lang.Goog, nyc.lang.Translate);

/**
 * @desc Constructor for {@link nyc.lang.Translate}
 * @public
 * @typedef {Object}
 * @property {(String|Element|JQuery)} target The HTML DOM element that will provide language choices
 * @property {nyc.lang.Translate.Choices} languages The languages to provide
 * @property {boolean} [isButton=false] Show as a button
 * @property {boolean} [showArrow=false] Show the hint arrow if displaying as a button
 */
nyc.lang.Goog.Options;
