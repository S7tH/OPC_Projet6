/*! Magnific Popup - v1.1.0 - 2016-02-20
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2016 Dmitry Semenov; */
;(function (factory) { 
if (typeof define === 'function' && define.amd) { 
 // AMD. Register as an anonymous module. 
 define(['jquery'], factory); 
 } else if (typeof exports === 'object') { 
 // Node/CommonJS 
 factory(require('jquery')); 
 } else { 
 // Browser globals 
 factory(window.jQuery || window.Zepto); 
 } 
 }(function($) { 

/*>>core*/
/**
 * 
 * Magnific Popup Core JS file
 * 
 */


/**
 * Private static constants
 */
var CLOSE_EVENT = 'Close',
	BEFORE_CLOSE_EVENT = 'BeforeClose',
	AFTER_CLOSE_EVENT = 'AfterClose',
	BEFORE_APPEND_EVENT = 'BeforeAppend',
	MARKUP_PARSE_EVENT = 'MarkupParse',
	OPEN_EVENT = 'Open',
	CHANGE_EVENT = 'Change',
	NS = 'mfp',
	EVENT_NS = '.' + NS,
	READY_CLASS = 'mfp-ready',
	REMOVING_CLASS = 'mfp-removing',
	PREVENT_CLOSE_CLASS = 'mfp-prevent-close';


/**
 * Private vars 
 */
/*jshint -W079 */
var mfp, // As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
	MagnificPopup = function(){},
	_isJQ = !!(window.jQuery),
	_prevStatus,
	_window = $(window),
	_document,
	_prevContentType,
	_wrapClasses,
	_currPopupType;


/**
 * Private functions
 */
var _mfpOn = function(name, f) {
		mfp.ev.on(NS + name + EVENT_NS, f);
	},
	_getEl = function(className, appendTo, html, raw) {
		var el = document.createElement('div');
		el.className = 'mfp-'+className;
		if(html) {
			el.innerHTML = html;
		}
		if(!raw) {
			el = $(el);
			if(appendTo) {
				el.appendTo(appendTo);
			}
		} else if(appendTo) {
			appendTo.appendChild(el);
		}
		return el;
	},
	_mfpTrigger = function(e, data) {
		mfp.ev.triggerHandler(NS + e, data);

		if(mfp.st.callbacks) {
			// converts "mfpEventName" to "eventName" callback and triggers it if it's present
			e = e.charAt(0).toLowerCase() + e.slice(1);
			if(mfp.st.callbacks[e]) {
				mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
			}
		}
	},
	_getCloseBtn = function(type) {
		if(type !== _currPopupType || !mfp.currTemplate.closeBtn) {
			mfp.currTemplate.closeBtn = $( mfp.st.closeMarkup.replace('%title%', mfp.st.tClose ) );
			_currPopupType = type;
		}
		return mfp.currTemplate.closeBtn;
	},
	// Initialize Magnific Popup only when called at least once
	_checkInstance = function() {
		if(!$.magnificPopup.instance) {
			/*jshint -W020 */
			mfp = new MagnificPopup();
			mfp.init();
			$.magnificPopup.instance = mfp;
		}
	},
	// CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
	supportsTransitions = function() {
		var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
			v = ['ms','O','Moz','Webkit']; // 'v' for vendor

		if( s['transition'] !== undefined ) {
			return true; 
		}
			
		while( v.length ) {
			if( v.pop() + 'Transition' in s ) {
				return true;
			}
		}
				
		return false;
	};



/**
 * Public functions
 */
MagnificPopup.prototype = {

	constructor: MagnificPopup,

	/**
	 * Initializes Magnific Popup plugin. 
	 * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
	 */
	init: function() {
		var appVersion = navigator.appVersion;
		mfp.isLowIE = mfp.isIE8 = document.all && !document.addEventListener;
		mfp.isAndroid = (/android/gi).test(appVersion);
		mfp.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);
		mfp.supportsTransition = supportsTransitions();

		// We disable fixed positioned lightbox on devices that don't handle it nicely.
		// If you know a better way of detecting this - let me know.
		mfp.probablyMobile = (mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent) );
		_document = $(document);

		mfp.popupsCache = {};
	},

	/**
	 * Opens popup
	 * @param  data [description]
	 */
	open: function(data) {

		var i;

		if(data.isObj === false) { 
			// convert jQuery collection to array to avoid conflicts later
			mfp.items = data.items.toArray();

			mfp.index = 0;
			var items = data.items,
				item;
			for(i = 0; i < items.length; i++) {
				item = items[i];
				if(item.parsed) {
					item = item.el[0];
				}
				if(item === data.el[0]) {
					mfp.index = i;
					break;
				}
			}
		} else {
			mfp.items = $.isArray(data.items) ? data.items : [data.items];
			mfp.index = data.index || 0;
		}

		// if popup is already opened - we just update the content
		if(mfp.isOpen) {
			mfp.updateItemHTML();
			return;
		}
		
		mfp.types = []; 
		_wrapClasses = '';
		if(data.mainEl && data.mainEl.length) {
			mfp.ev = data.mainEl.eq(0);
		} else {
			mfp.ev = _document;
		}

		if(data.key) {
			if(!mfp.popupsCache[data.key]) {
				mfp.popupsCache[data.key] = {};
			}
			mfp.currTemplate = mfp.popupsCache[data.key];
		} else {
			mfp.currTemplate = {};
		}



		mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data ); 
		mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

		if(mfp.st.modal) {
			mfp.st.closeOnContentClick = false;
			mfp.st.closeOnBgClick = false;
			mfp.st.showCloseBtn = false;
			mfp.st.enableEscapeKey = false;
		}
		

		// Building markup
		// main containers are created only once
		if(!mfp.bgOverlay) {

			// Dark overlay
			mfp.bgOverlay = _getEl('bg').on('click'+EVENT_NS, function() {
				mfp.close();
			});

			mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click'+EVENT_NS, function(e) {
				if(mfp._checkIfClose(e.target)) {
					mfp.close();
				}
			});

			mfp.container = _getEl('container', mfp.wrap);
		}

		mfp.contentContainer = _getEl('content');
		if(mfp.st.preloader) {
			mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
		}


		// Initializing modules
		var modules = $.magnificPopup.modules;
		for(i = 0; i < modules.length; i++) {
			var n = modules[i];
			n = n.charAt(0).toUpperCase() + n.slice(1);
			mfp['init'+n].call(mfp);
		}
		_mfpTrigger('BeforeOpen');


		if(mfp.st.showCloseBtn) {
			// Close button
			if(!mfp.st.closeBtnInside) {
				mfp.wrap.append( _getCloseBtn() );
			} else {
				_mfpOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
					values.close_replaceWith = _getCloseBtn(item.type);
				});
				_wrapClasses += ' mfp-close-btn-in';
			}
		}

		if(mfp.st.alignTop) {
			_wrapClasses += ' mfp-align-top';
		}

	

		if(mfp.fixedContentPos) {
			mfp.wrap.css({
				overflow: mfp.st.overflowY,
				overflowX: 'hidden',
				overflowY: mfp.st.overflowY
			});
		} else {
			mfp.wrap.css({ 
				top: _window.scrollTop(),
				position: 'absolute'
			});
		}
		if( mfp.st.fixedBgPos === false || (mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos) ) {
			mfp.bgOverlay.css({
				height: _document.height(),
				position: 'absolute'
			});
		}

		

		if(mfp.st.enableEscapeKey) {
			// Close on ESC key
			_document.on('keyup' + EVENT_NS, function(e) {
				if(e.keyCode === 27) {
					mfp.close();
				}
			});
		}

		_window.on('resize' + EVENT_NS, function() {
			mfp.updateSize();
		});


		if(!mfp.st.closeOnContentClick) {
			_wrapClasses += ' mfp-auto-cursor';
		}
		
		if(_wrapClasses)
			mfp.wrap.addClass(_wrapClasses);


		// this triggers recalculation of layout, so we get it once to not to trigger twice
		var windowHeight = mfp.wH = _window.height();

		
		var windowStyles = {};

		if( mfp.fixedContentPos ) {
            if(mfp._hasScrollBar(windowHeight)){
                var s = mfp._getScrollbarSize();
                if(s) {
                    windowStyles.marginRight = s;
                }
            }
        }

		if(mfp.fixedContentPos) {
			if(!mfp.isIE7) {
				windowStyles.overflow = 'hidden';
			} else {
				// ie7 double-scroll bug
				$('body, html').css('overflow', 'hidden');
			}
		}

		
		
		var classesToadd = mfp.st.mainClass;
		if(mfp.isIE7) {
			classesToadd += ' mfp-ie7';
		}
		if(classesToadd) {
			mfp._addClassToMFP( classesToadd );
		}

		// add content
		mfp.updateItemHTML();

		_mfpTrigger('BuildControls');

		// remove scrollbar, add margin e.t.c
		$('html').css(windowStyles);
		
		// add everything to DOM
		mfp.bgOverlay.add(mfp.wrap).prependTo( mfp.st.prependTo || $(document.body) );

		// Save last focused element
		mfp._lastFocusedEl = document.activeElement;
		
		// Wait for next cycle to allow CSS transition
		setTimeout(function() {
			
			if(mfp.content) {
				mfp._addClassToMFP(READY_CLASS);
				mfp._setFocus();
			} else {
				// if content is not defined (not loaded e.t.c) we add class only for BG
				mfp.bgOverlay.addClass(READY_CLASS);
			}
			
			// Trap the focus in popup
			_document.on('focusin' + EVENT_NS, mfp._onFocusIn);

		}, 16);

		mfp.isOpen = true;
		mfp.updateSize(windowHeight);
		_mfpTrigger(OPEN_EVENT);

		return data;
	},

	/**
	 * Closes the popup
	 */
	close: function() {
		if(!mfp.isOpen) return;
		_mfpTrigger(BEFORE_CLOSE_EVENT);

		mfp.isOpen = false;
		// for CSS3 animation
		if(mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition )  {
			mfp._addClassToMFP(REMOVING_CLASS);
			setTimeout(function() {
				mfp._close();
			}, mfp.st.removalDelay);
		} else {
			mfp._close();
		}
	},

	/**
	 * Helper for close() function
	 */
	_close: function() {
		_mfpTrigger(CLOSE_EVENT);

		var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

		mfp.bgOverlay.detach();
		mfp.wrap.detach();
		mfp.container.empty();

		if(mfp.st.mainClass) {
			classesToRemove += mfp.st.mainClass + ' ';
		}

		mfp._removeClassFromMFP(classesToRemove);

		if(mfp.fixedContentPos) {
			var windowStyles = {marginRight: ''};
			if(mfp.isIE7) {
				$('body, html').css('overflow', '');
			} else {
				windowStyles.overflow = '';
			}
			$('html').css(windowStyles);
		}
		
		_document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
		mfp.ev.off(EVENT_NS);

		// clean up DOM elements that aren't removed
		mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
		mfp.bgOverlay.attr('class', 'mfp-bg');
		mfp.container.attr('class', 'mfp-container');

		// remove close button from target element
		if(mfp.st.showCloseBtn &&
		(!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
			if(mfp.currTemplate.closeBtn)
				mfp.currTemplate.closeBtn.detach();
		}


		if(mfp.st.autoFocusLast && mfp._lastFocusedEl) {
			$(mfp._lastFocusedEl).focus(); // put tab focus back
		}
		mfp.currItem = null;	
		mfp.content = null;
		mfp.currTemplate = null;
		mfp.prevHeight = 0;

		_mfpTrigger(AFTER_CLOSE_EVENT);
	},
	
	updateSize: function(winHeight) {

		if(mfp.isIOS) {
			// fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
			var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
			var height = window.innerHeight * zoomLevel;
			mfp.wrap.css('height', height);
			mfp.wH = height;
		} else {
			mfp.wH = winHeight || _window.height();
		}
		// Fixes #84: popup incorrectly positioned with position:relative on body
		if(!mfp.fixedContentPos) {
			mfp.wrap.css('height', mfp.wH);
		}

		_mfpTrigger('Resize');

	},

	/**
	 * Set content of popup based on current index
	 */
	updateItemHTML: function() {
		var item = mfp.items[mfp.index];

		// Detach and perform modifications
		mfp.contentContainer.detach();

		if(mfp.content)
			mfp.content.detach();

		if(!item.parsed) {
			item = mfp.parseEl( mfp.index );
		}

		var type = item.type;

		_mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
		// BeforeChange event works like so:
		// _mfpOn('BeforeChange', function(e, prevType, newType) { });

		mfp.currItem = item;

		if(!mfp.currTemplate[type]) {
			var markup = mfp.st[type] ? mfp.st[type].markup : false;

			// allows to modify markup
			_mfpTrigger('FirstMarkupParse', markup);

			if(markup) {
				mfp.currTemplate[type] = $(markup);
			} else {
				// if there is no markup found we just define that template is parsed
				mfp.currTemplate[type] = true;
			}
		}

		if(_prevContentType && _prevContentType !== item.type) {
			mfp.container.removeClass('mfp-'+_prevContentType+'-holder');
		}

		var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
		mfp.appendContent(newContent, type);

		item.preloaded = true;

		_mfpTrigger(CHANGE_EVENT, item);
		_prevContentType = item.type;

		// Append container back after its content changed
		mfp.container.prepend(mfp.contentContainer);

		_mfpTrigger('AfterChange');
	},


	/**
	 * Set HTML content of popup
	 */
	appendContent: function(newContent, type) {
		mfp.content = newContent;

		if(newContent) {
			if(mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
				mfp.currTemplate[type] === true) {
				// if there is no markup, we just append close button element inside
				if(!mfp.content.find('.mfp-close').length) {
					mfp.content.append(_getCloseBtn());
				}
			} else {
				mfp.content = newContent;
			}
		} else {
			mfp.content = '';
		}

		_mfpTrigger(BEFORE_APPEND_EVENT);
		mfp.container.addClass('mfp-'+type+'-holder');

		mfp.contentContainer.append(mfp.content);
	},


	/**
	 * Creates Magnific Popup data object based on given data
	 * @param  {int} index Index of item to parse
	 */
	parseEl: function(index) {
		var item = mfp.items[index],
			type;

		if(item.tagName) {
			item = { el: $(item) };
		} else {
			type = item.type;
			item = { data: item, src: item.src };
		}

		if(item.el) {
			var types = mfp.types;

			// check for 'mfp-TYPE' class
			for(var i = 0; i < types.length; i++) {
				if( item.el.hasClass('mfp-'+types[i]) ) {
					type = types[i];
					break;
				}
			}

			item.src = item.el.attr('data-mfp-src');
			if(!item.src) {
				item.src = item.el.attr('href');
			}
		}

		item.type = type || mfp.st.type || 'inline';
		item.index = index;
		item.parsed = true;
		mfp.items[index] = item;
		_mfpTrigger('ElementParse', item);

		return mfp.items[index];
	},


	/**
	 * Initializes single popup or a group of popups
	 */
	addGroup: function(el, options) {
		var eHandler = function(e) {
			e.mfpEl = this;
			mfp._openClick(e, el, options);
		};

		if(!options) {
			options = {};
		}

		var eName = 'click.magnificPopup';
		options.mainEl = el;

		if(options.items) {
			options.isObj = true;
			el.off(eName).on(eName, eHandler);
		} else {
			options.isObj = false;
			if(options.delegate) {
				el.off(eName).on(eName, options.delegate , eHandler);
			} else {
				options.items = el;
				el.off(eName).on(eName, eHandler);
			}
		}
	},
	_openClick: function(e, el, options) {
		var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


		if(!midClick && ( e.which === 2 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey ) ) {
			return;
		}

		var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

		if(disableOn) {
			if($.isFunction(disableOn)) {
				if( !disableOn.call(mfp) ) {
					return true;
				}
			} else { // else it's number
				if( _window.width() < disableOn ) {
					return true;
				}
			}
		}

		if(e.type) {
			e.preventDefault();

			// This will prevent popup from closing if element is inside and popup is already opened
			if(mfp.isOpen) {
				e.stopPropagation();
			}
		}

		options.el = $(e.mfpEl);
		if(options.delegate) {
			options.items = el.find(options.delegate);
		}
		mfp.open(options);
	},


	/**
	 * Updates text on preloader
	 */
	updateStatus: function(status, text) {

		if(mfp.preloader) {
			if(_prevStatus !== status) {
				mfp.container.removeClass('mfp-s-'+_prevStatus);
			}

			if(!text && status === 'loading') {
				text = mfp.st.tLoading;
			}

			var data = {
				status: status,
				text: text
			};
			// allows to modify status
			_mfpTrigger('UpdateStatus', data);

			status = data.status;
			text = data.text;

			mfp.preloader.html(text);

			mfp.preloader.find('a').on('click', function(e) {
				e.stopImmediatePropagation();
			});

			mfp.container.addClass('mfp-s-'+status);
			_prevStatus = status;
		}
	},


	/*
		"Private" helpers that aren't private at all
	 */
	// Check to close popup or not
	// "target" is an element that was clicked
	_checkIfClose: function(target) {

		if($(target).hasClass(PREVENT_CLOSE_CLASS)) {
			return;
		}

		var closeOnContent = mfp.st.closeOnContentClick;
		var closeOnBg = mfp.st.closeOnBgClick;

		if(closeOnContent && closeOnBg) {
			return true;
		} else {

			// We close the popup if click is on close button or on preloader. Or if there is no content.
			if(!mfp.content || $(target).hasClass('mfp-close') || (mfp.preloader && target === mfp.preloader[0]) ) {
				return true;
			}

			// if click is outside the content
			if(  (target !== mfp.content[0] && !$.contains(mfp.content[0], target))  ) {
				if(closeOnBg) {
					// last check, if the clicked element is in DOM, (in case it's removed onclick)
					if( $.contains(document, target) ) {
						return true;
					}
				}
			} else if(closeOnContent) {
				return true;
			}

		}
		return false;
	},
	_addClassToMFP: function(cName) {
		mfp.bgOverlay.addClass(cName);
		mfp.wrap.addClass(cName);
	},
	_removeClassFromMFP: function(cName) {
		this.bgOverlay.removeClass(cName);
		mfp.wrap.removeClass(cName);
	},
	_hasScrollBar: function(winHeight) {
		return (  (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height()) );
	},
	_setFocus: function() {
		(mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
	},
	_onFocusIn: function(e) {
		if( e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target) ) {
			mfp._setFocus();
			return false;
		}
	},
	_parseMarkup: function(template, values, item) {
		var arr;
		if(item.data) {
			values = $.extend(item.data, values);
		}
		_mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item] );

		$.each(values, function(key, value) {
			if(value === undefined || value === false) {
				return true;
			}
			arr = key.split('_');
			if(arr.length > 1) {
				var el = template.find(EVENT_NS + '-'+arr[0]);

				if(el.length > 0) {
					var attr = arr[1];
					if(attr === 'replaceWith') {
						if(el[0] !== value[0]) {
							el.replaceWith(value);
						}
					} else if(attr === 'img') {
						if(el.is('img')) {
							el.attr('src', value);
						} else {
							el.replaceWith( $('<img>').attr('src', value).attr('class', el.attr('class')) );
						}
					} else {
						el.attr(arr[1], value);
					}
				}

			} else {
				template.find(EVENT_NS + '-'+key).html(value);
			}
		});
	},

	_getScrollbarSize: function() {
		// thx David
		if(mfp.scrollbarSize === undefined) {
			var scrollDiv = document.createElement("div");
			scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
			document.body.appendChild(scrollDiv);
			mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			document.body.removeChild(scrollDiv);
		}
		return mfp.scrollbarSize;
	}

}; /* MagnificPopup core prototype end */




/**
 * Public static functions
 */
$.magnificPopup = {
	instance: null,
	proto: MagnificPopup.prototype,
	modules: [],

	open: function(options, index) {
		_checkInstance();

		if(!options) {
			options = {};
		} else {
			options = $.extend(true, {}, options);
		}

		options.isObj = true;
		options.index = index || 0;
		return this.instance.open(options);
	},

	close: function() {
		return $.magnificPopup.instance && $.magnificPopup.instance.close();
	},

	registerModule: function(name, module) {
		if(module.options) {
			$.magnificPopup.defaults[name] = module.options;
		}
		$.extend(this.proto, module.proto);
		this.modules.push(name);
	},

	defaults: {

		// Info about options is in docs:
		// http://dimsemenov.com/plugins/magnific-popup/documentation.html#options

		disableOn: 0,

		key: null,

		midClick: false,

		mainClass: '',

		preloader: true,

		focus: '', // CSS selector of input to focus after popup is opened

		closeOnContentClick: false,

		closeOnBgClick: true,

		closeBtnInside: true,

		showCloseBtn: true,

		enableEscapeKey: true,

		modal: false,

		alignTop: false,

		removalDelay: 0,

		prependTo: null,

		fixedContentPos: 'auto',

		fixedBgPos: 'auto',

		overflowY: 'auto',

		closeMarkup: '<button title="%title%" type="button" class="mfp-close">&#215;</button>',

		tClose: 'Close (Esc)',

		tLoading: 'Loading...',

		autoFocusLast: true

	}
};



$.fn.magnificPopup = function(options) {
	_checkInstance();

	var jqEl = $(this);

	// We call some API method of first param is a string
	if (typeof options === "string" ) {

		if(options === 'open') {
			var items,
				itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
				index = parseInt(arguments[1], 10) || 0;

			if(itemOpts.items) {
				items = itemOpts.items[index];
			} else {
				items = jqEl;
				if(itemOpts.delegate) {
					items = items.find(itemOpts.delegate);
				}
				items = items.eq( index );
			}
			mfp._openClick({mfpEl:items}, jqEl, itemOpts);
		} else {
			if(mfp.isOpen)
				mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
		}

	} else {
		// clone options obj
		options = $.extend(true, {}, options);

		/*
		 * As Zepto doesn't support .data() method for objects
		 * and it works only in normal browsers
		 * we assign "options" object directly to the DOM element. FTW!
		 */
		if(_isJQ) {
			jqEl.data('magnificPopup', options);
		} else {
			jqEl[0].magnificPopup = options;
		}

		mfp.addGroup(jqEl, options);

	}
	return jqEl;
};

/*>>core*/

/*>>inline*/

var INLINE_NS = 'inline',
	_hiddenClass,
	_inlinePlaceholder,
	_lastInlineElement,
	_putInlineElementsBack = function() {
		if(_lastInlineElement) {
			_inlinePlaceholder.after( _lastInlineElement.addClass(_hiddenClass) ).detach();
			_lastInlineElement = null;
		}
	};

$.magnificPopup.registerModule(INLINE_NS, {
	options: {
		hiddenClass: 'hide', // will be appended with `mfp-` prefix
		markup: '',
		tNotFound: 'Content not found'
	},
	proto: {

		initInline: function() {
			mfp.types.push(INLINE_NS);

			_mfpOn(CLOSE_EVENT+'.'+INLINE_NS, function() {
				_putInlineElementsBack();
			});
		},

		getInline: function(item, template) {

			_putInlineElementsBack();

			if(item.src) {
				var inlineSt = mfp.st.inline,
					el = $(item.src);

				if(el.length) {

					// If target element has parent - we replace it with placeholder and put it back after popup is closed
					var parent = el[0].parentNode;
					if(parent && parent.tagName) {
						if(!_inlinePlaceholder) {
							_hiddenClass = inlineSt.hiddenClass;
							_inlinePlaceholder = _getEl(_hiddenClass);
							_hiddenClass = 'mfp-'+_hiddenClass;
						}
						// replace target inline element with placeholder
						_lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
					}

					mfp.updateStatus('ready');
				} else {
					mfp.updateStatus('error', inlineSt.tNotFound);
					el = $('<div>');
				}

				item.inlineElement = el;
				return el;
			}

			mfp.updateStatus('ready');
			mfp._parseMarkup(template, {}, item);
			return template;
		}
	}
});

/*>>inline*/

/*>>ajax*/
var AJAX_NS = 'ajax',
	_ajaxCur,
	_removeAjaxCursor = function() {
		if(_ajaxCur) {
			$(document.body).removeClass(_ajaxCur);
		}
	},
	_destroyAjaxRequest = function() {
		_removeAjaxCursor();
		if(mfp.req) {
			mfp.req.abort();
		}
	};

$.magnificPopup.registerModule(AJAX_NS, {

	options: {
		settings: null,
		cursor: 'mfp-ajax-cur',
		tError: '<a href="%url%">The content</a> could not be loaded.'
	},

	proto: {
		initAjax: function() {
			mfp.types.push(AJAX_NS);
			_ajaxCur = mfp.st.ajax.cursor;

			_mfpOn(CLOSE_EVENT+'.'+AJAX_NS, _destroyAjaxRequest);
			_mfpOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
		},
		getAjax: function(item) {

			if(_ajaxCur) {
				$(document.body).addClass(_ajaxCur);
			}

			mfp.updateStatus('loading');

			var opts = $.extend({
				url: item.src,
				success: function(data, textStatus, jqXHR) {
					var temp = {
						data:data,
						xhr:jqXHR
					};

					_mfpTrigger('ParseAjax', temp);

					mfp.appendContent( $(temp.data), AJAX_NS );

					item.finished = true;

					_removeAjaxCursor();

					mfp._setFocus();

					setTimeout(function() {
						mfp.wrap.addClass(READY_CLASS);
					}, 16);

					mfp.updateStatus('ready');

					_mfpTrigger('AjaxContentAdded');
				},
				error: function() {
					_removeAjaxCursor();
					item.finished = item.loadError = true;
					mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
				}
			}, mfp.st.ajax.settings);

			mfp.req = $.ajax(opts);

			return '';
		}
	}
});

/*>>ajax*/

/*>>image*/
var _imgInterval,
	_getTitle = function(item) {
		if(item.data && item.data.title !== undefined)
			return item.data.title;

		var src = mfp.st.image.titleSrc;

		if(src) {
			if($.isFunction(src)) {
				return src.call(mfp, item);
			} else if(item.el) {
				return item.el.attr(src) || '';
			}
		}
		return '';
	};

$.magnificPopup.registerModule('image', {

	options: {
		markup: '<div class="mfp-figure">'+
					'<div class="mfp-close"></div>'+
					'<figure>'+
						'<div class="mfp-img"></div>'+
						'<figcaption>'+
							'<div class="mfp-bottom-bar">'+
								'<div class="mfp-title"></div>'+
								'<div class="mfp-counter"></div>'+
							'</div>'+
						'</figcaption>'+
					'</figure>'+
				'</div>',
		cursor: 'mfp-zoom-out-cur',
		titleSrc: 'title',
		verticalFit: true,
		tError: '<a href="%url%">The image</a> could not be loaded.'
	},

	proto: {
		initImage: function() {
			var imgSt = mfp.st.image,
				ns = '.image';

			mfp.types.push('image');

			_mfpOn(OPEN_EVENT+ns, function() {
				if(mfp.currItem.type === 'image' && imgSt.cursor) {
					$(document.body).addClass(imgSt.cursor);
				}
			});

			_mfpOn(CLOSE_EVENT+ns, function() {
				if(imgSt.cursor) {
					$(document.body).removeClass(imgSt.cursor);
				}
				_window.off('resize' + EVENT_NS);
			});

			_mfpOn('Resize'+ns, mfp.resizeImage);
			if(mfp.isLowIE) {
				_mfpOn('AfterChange', mfp.resizeImage);
			}
		},
		resizeImage: function() {
			var item = mfp.currItem;
			if(!item || !item.img) return;

			if(mfp.st.image.verticalFit) {
				var decr = 0;
				// fix box-sizing in ie7/8
				if(mfp.isLowIE) {
					decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'),10);
				}
				item.img.css('max-height', mfp.wH-decr);
			}
		},
		_onImageHasSize: function(item) {
			if(item.img) {

				item.hasSize = true;

				if(_imgInterval) {
					clearInterval(_imgInterval);
				}

				item.isCheckingImgSize = false;

				_mfpTrigger('ImageHasSize', item);

				if(item.imgHidden) {
					if(mfp.content)
						mfp.content.removeClass('mfp-loading');

					item.imgHidden = false;
				}

			}
		},

		/**
		 * Function that loops until the image has size to display elements that rely on it asap
		 */
		findImageSize: function(item) {

			var counter = 0,
				img = item.img[0],
				mfpSetInterval = function(delay) {

					if(_imgInterval) {
						clearInterval(_imgInterval);
					}
					// decelerating interval that checks for size of an image
					_imgInterval = setInterval(function() {
						if(img.naturalWidth > 0) {
							mfp._onImageHasSize(item);
							return;
						}

						if(counter > 200) {
							clearInterval(_imgInterval);
						}

						counter++;
						if(counter === 3) {
							mfpSetInterval(10);
						} else if(counter === 40) {
							mfpSetInterval(50);
						} else if(counter === 100) {
							mfpSetInterval(500);
						}
					}, delay);
				};

			mfpSetInterval(1);
		},

		getImage: function(item, template) {

			var guard = 0,

				// image load complete handler
				onLoadComplete = function() {
					if(item) {
						if (item.img[0].complete) {
							item.img.off('.mfploader');

							if(item === mfp.currItem){
								mfp._onImageHasSize(item);

								mfp.updateStatus('ready');
							}

							item.hasSize = true;
							item.loaded = true;

							_mfpTrigger('ImageLoadComplete');

						}
						else {
							// if image complete check fails 200 times (20 sec), we assume that there was an error.
							guard++;
							if(guard < 200) {
								setTimeout(onLoadComplete,100);
							} else {
								onLoadError();
							}
						}
					}
				},

				// image error handler
				onLoadError = function() {
					if(item) {
						item.img.off('.mfploader');
						if(item === mfp.currItem){
							mfp._onImageHasSize(item);
							mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
						}

						item.hasSize = true;
						item.loaded = true;
						item.loadError = true;
					}
				},
				imgSt = mfp.st.image;


			var el = template.find('.mfp-img');
			if(el.length) {
				var img = document.createElement('img');
				img.className = 'mfp-img';
				if(item.el && item.el.find('img').length) {
					img.alt = item.el.find('img').attr('alt');
				}
				item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
				img.src = item.src;

				// without clone() "error" event is not firing when IMG is replaced by new IMG
				// TODO: find a way to avoid such cloning
				if(el.is('img')) {
					item.img = item.img.clone();
				}

				img = item.img[0];
				if(img.naturalWidth > 0) {
					item.hasSize = true;
				} else if(!img.width) {
					item.hasSize = false;
				}
			}

			mfp._parseMarkup(template, {
				title: _getTitle(item),
				img_replaceWith: item.img
			}, item);

			mfp.resizeImage();

			if(item.hasSize) {
				if(_imgInterval) clearInterval(_imgInterval);

				if(item.loadError) {
					template.addClass('mfp-loading');
					mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
				} else {
					template.removeClass('mfp-loading');
					mfp.updateStatus('ready');
				}
				return template;
			}

			mfp.updateStatus('loading');
			item.loading = true;

			if(!item.hasSize) {
				item.imgHidden = true;
				template.addClass('mfp-loading');
				mfp.findImageSize(item);
			}

			return template;
		}
	}
});

/*>>image*/

/*>>zoom*/
var hasMozTransform,
	getHasMozTransform = function() {
		if(hasMozTransform === undefined) {
			hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
		}
		return hasMozTransform;
	};

$.magnificPopup.registerModule('zoom', {

	options: {
		enabled: false,
		easing: 'ease-in-out',
		duration: 300,
		opener: function(element) {
			return element.is('img') ? element : element.find('img');
		}
	},

	proto: {

		initZoom: function() {
			var zoomSt = mfp.st.zoom,
				ns = '.zoom',
				image;

			if(!zoomSt.enabled || !mfp.supportsTransition) {
				return;
			}

			var duration = zoomSt.duration,
				getElToAnimate = function(image) {
					var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
						transition = 'all '+(zoomSt.duration/1000)+'s ' + zoomSt.easing,
						cssObj = {
							position: 'fixed',
							zIndex: 9999,
							left: 0,
							top: 0,
							'-webkit-backface-visibility': 'hidden'
						},
						t = 'transition';

					cssObj['-webkit-'+t] = cssObj['-moz-'+t] = cssObj['-o-'+t] = cssObj[t] = transition;

					newImg.css(cssObj);
					return newImg;
				},
				showMainContent = function() {
					mfp.content.css('visibility', 'visible');
				},
				openTimeout,
				animatedImg;

			_mfpOn('BuildControls'+ns, function() {
				if(mfp._allowZoom()) {

					clearTimeout(openTimeout);
					mfp.content.css('visibility', 'hidden');

					// Basically, all code below does is clones existing image, puts in on top of the current one and animated it

					image = mfp._getItemToZoom();

					if(!image) {
						showMainContent();
						return;
					}

					animatedImg = getElToAnimate(image);

					animatedImg.css( mfp._getOffset() );

					mfp.wrap.append(animatedImg);

					openTimeout = setTimeout(function() {
						animatedImg.css( mfp._getOffset( true ) );
						openTimeout = setTimeout(function() {

							showMainContent();

							setTimeout(function() {
								animatedImg.remove();
								image = animatedImg = null;
								_mfpTrigger('ZoomAnimationEnded');
							}, 16); // avoid blink when switching images

						}, duration); // this timeout equals animation duration

					}, 16); // by adding this timeout we avoid short glitch at the beginning of animation


					// Lots of timeouts...
				}
			});
			_mfpOn(BEFORE_CLOSE_EVENT+ns, function() {
				if(mfp._allowZoom()) {

					clearTimeout(openTimeout);

					mfp.st.removalDelay = duration;

					if(!image) {
						image = mfp._getItemToZoom();
						if(!image) {
							return;
						}
						animatedImg = getElToAnimate(image);
					}

					animatedImg.css( mfp._getOffset(true) );
					mfp.wrap.append(animatedImg);
					mfp.content.css('visibility', 'hidden');

					setTimeout(function() {
						animatedImg.css( mfp._getOffset() );
					}, 16);
				}

			});

			_mfpOn(CLOSE_EVENT+ns, function() {
				if(mfp._allowZoom()) {
					showMainContent();
					if(animatedImg) {
						animatedImg.remove();
					}
					image = null;
				}
			});
		},

		_allowZoom: function() {
			return mfp.currItem.type === 'image';
		},

		_getItemToZoom: function() {
			if(mfp.currItem.hasSize) {
				return mfp.currItem.img;
			} else {
				return false;
			}
		},

		// Get element postion relative to viewport
		_getOffset: function(isLarge) {
			var el;
			if(isLarge) {
				el = mfp.currItem.img;
			} else {
				el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
			}

			var offset = el.offset();
			var paddingTop = parseInt(el.css('padding-top'),10);
			var paddingBottom = parseInt(el.css('padding-bottom'),10);
			offset.top -= ( $(window).scrollTop() - paddingTop );


			/*

			Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

			 */
			var obj = {
				width: el.width(),
				// fix Zepto height+padding issue
				height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
			};

			// I hate to do this, but there is no another option
			if( getHasMozTransform() ) {
				obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
			} else {
				obj.left = offset.left;
				obj.top = offset.top;
			}
			return obj;
		}

	}
});



/*>>zoom*/

/*>>iframe*/

var IFRAME_NS = 'iframe',
	_emptyPage = '//about:blank',

	_fixIframeBugs = function(isShowing) {
		if(mfp.currTemplate[IFRAME_NS]) {
			var el = mfp.currTemplate[IFRAME_NS].find('iframe');
			if(el.length) {
				// reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
				if(!isShowing) {
					el[0].src = _emptyPage;
				}

				// IE8 black screen bug fix
				if(mfp.isIE8) {
					el.css('display', isShowing ? 'block' : 'none');
				}
			}
		}
	};

$.magnificPopup.registerModule(IFRAME_NS, {

	options: {
		markup: '<div class="mfp-iframe-scaler">'+
					'<div class="mfp-close"></div>'+
					'<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>'+
				'</div>',

		srcAction: 'iframe_src',

		// we don't care and support only one default type of URL by default
		patterns: {
			youtube: {
				index: 'youtube.com',
				id: 'v=',
				src: '//www.youtube.com/embed/%id%?autoplay=1'
			},
			vimeo: {
				index: 'vimeo.com/',
				id: '/',
				src: '//player.vimeo.com/video/%id%?autoplay=1'
			},
			gmaps: {
				index: '//maps.google.',
				src: '%id%&output=embed'
			}
		}
	},

	proto: {
		initIframe: function() {
			mfp.types.push(IFRAME_NS);

			_mfpOn('BeforeChange', function(e, prevType, newType) {
				if(prevType !== newType) {
					if(prevType === IFRAME_NS) {
						_fixIframeBugs(); // iframe if removed
					} else if(newType === IFRAME_NS) {
						_fixIframeBugs(true); // iframe is showing
					}
				}// else {
					// iframe source is switched, don't do anything
				//}
			});

			_mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function() {
				_fixIframeBugs();
			});
		},

		getIframe: function(item, template) {
			var embedSrc = item.src;
			var iframeSt = mfp.st.iframe;

			$.each(iframeSt.patterns, function() {
				if(embedSrc.indexOf( this.index ) > -1) {
					if(this.id) {
						if(typeof this.id === 'string') {
							embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id)+this.id.length, embedSrc.length);
						} else {
							embedSrc = this.id.call( this, embedSrc );
						}
					}
					embedSrc = this.src.replace('%id%', embedSrc );
					return false; // break;
				}
			});

			var dataObj = {};
			if(iframeSt.srcAction) {
				dataObj[iframeSt.srcAction] = embedSrc;
			}
			mfp._parseMarkup(template, dataObj, item);

			mfp.updateStatus('ready');

			return template;
		}
	}
});



/*>>iframe*/

/*>>gallery*/
/**
 * Get looped index depending on number of slides
 */
var _getLoopedId = function(index) {
		var numSlides = mfp.items.length;
		if(index > numSlides - 1) {
			return index - numSlides;
		} else  if(index < 0) {
			return numSlides + index;
		}
		return index;
	},
	_replaceCurrTotal = function(text, curr, total) {
		return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
	};

$.magnificPopup.registerModule('gallery', {

	options: {
		enabled: false,
		arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
		preload: [0,2],
		navigateByImgClick: true,
		arrows: true,

		tPrev: 'Previous (Left arrow key)',
		tNext: 'Next (Right arrow key)',
		tCounter: '%curr% of %total%'
	},

	proto: {
		initGallery: function() {

			var gSt = mfp.st.gallery,
				ns = '.mfp-gallery';

			mfp.direction = true; // true - next, false - prev

			if(!gSt || !gSt.enabled ) return false;

			_wrapClasses += ' mfp-gallery';

			_mfpOn(OPEN_EVENT+ns, function() {

				if(gSt.navigateByImgClick) {
					mfp.wrap.on('click'+ns, '.mfp-img', function() {
						if(mfp.items.length > 1) {
							mfp.next();
							return false;
						}
					});
				}

				_document.on('keydown'+ns, function(e) {
					if (e.keyCode === 37) {
						mfp.prev();
					} else if (e.keyCode === 39) {
						mfp.next();
					}
				});
			});

			_mfpOn('UpdateStatus'+ns, function(e, data) {
				if(data.text) {
					data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
				}
			});

			_mfpOn(MARKUP_PARSE_EVENT+ns, function(e, element, values, item) {
				var l = mfp.items.length;
				values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
			});

			_mfpOn('BuildControls' + ns, function() {
				if(mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
					var markup = gSt.arrowMarkup,
						arrowLeft = mfp.arrowLeft = $( markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left') ).addClass(PREVENT_CLOSE_CLASS),
						arrowRight = mfp.arrowRight = $( markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right') ).addClass(PREVENT_CLOSE_CLASS);

					arrowLeft.click(function() {
						mfp.prev();
					});
					arrowRight.click(function() {
						mfp.next();
					});

					mfp.container.append(arrowLeft.add(arrowRight));
				}
			});

			_mfpOn(CHANGE_EVENT+ns, function() {
				if(mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

				mfp._preloadTimeout = setTimeout(function() {
					mfp.preloadNearbyImages();
					mfp._preloadTimeout = null;
				}, 16);
			});


			_mfpOn(CLOSE_EVENT+ns, function() {
				_document.off(ns);
				mfp.wrap.off('click'+ns);
				mfp.arrowRight = mfp.arrowLeft = null;
			});

		},
		next: function() {
			mfp.direction = true;
			mfp.index = _getLoopedId(mfp.index + 1);
			mfp.updateItemHTML();
		},
		prev: function() {
			mfp.direction = false;
			mfp.index = _getLoopedId(mfp.index - 1);
			mfp.updateItemHTML();
		},
		goTo: function(newIndex) {
			mfp.direction = (newIndex >= mfp.index);
			mfp.index = newIndex;
			mfp.updateItemHTML();
		},
		preloadNearbyImages: function() {
			var p = mfp.st.gallery.preload,
				preloadBefore = Math.min(p[0], mfp.items.length),
				preloadAfter = Math.min(p[1], mfp.items.length),
				i;

			for(i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
				mfp._preloadItem(mfp.index+i);
			}
			for(i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
				mfp._preloadItem(mfp.index-i);
			}
		},
		_preloadItem: function(index) {
			index = _getLoopedId(index);

			if(mfp.items[index].preloaded) {
				return;
			}

			var item = mfp.items[index];
			if(!item.parsed) {
				item = mfp.parseEl( index );
			}

			_mfpTrigger('LazyLoad', item);

			if(item.type === 'image') {
				item.img = $('<img class="mfp-img" />').on('load.mfploader', function() {
					item.hasSize = true;
				}).on('error.mfploader', function() {
					item.hasSize = true;
					item.loadError = true;
					_mfpTrigger('LazyLoadError', item);
				}).attr('src', item.src);
			}


			item.preloaded = true;
		}
	}
});

/*>>gallery*/

/*>>retina*/

var RETINA_NS = 'retina';

$.magnificPopup.registerModule(RETINA_NS, {
	options: {
		replaceSrc: function(item) {
			return item.src.replace(/\.\w+$/, function(m) { return '@2x' + m; });
		},
		ratio: 1 // Function or number.  Set to 1 to disable.
	},
	proto: {
		initRetina: function() {
			if(window.devicePixelRatio > 1) {

				var st = mfp.st.retina,
					ratio = st.ratio;

				ratio = !isNaN(ratio) ? ratio : ratio();

				if(ratio > 1) {
					_mfpOn('ImageHasSize' + '.' + RETINA_NS, function(e, item) {
						item.img.css({
							'max-width': item.img[0].naturalWidth / ratio,
							'width': '100%'
						});
					});
					_mfpOn('ElementParse' + '.' + RETINA_NS, function(e, item) {
						item.src = st.replaceSrc(item, ratio);
					});
				}
			}

		}
	}
});

/*>>retina*/
 _checkInstance(); }));

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.ScrollReveal = factory();
  }
}(this, function(require, exports, module) {


/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////             /////    /////
/////             /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
         /////    /////
         /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////

/**
 * ScrollReveal
 * ------------
 * Version : 3.1.4
 * Website : scrollrevealjs.org
 * Repo    : github.com/jlmakes/scrollreveal.js
 * Author  : Julian Lloyd (@jlmakes)
 */

;(function() {
    'use strict';

    var
        sr,
        Tools,
        _requestAnimationFrame;

    this.ScrollReveal = (function() {

        /**
         * Configuration
         * -------------
         * This object signature can be passed directly to the ScrollReveal constructor,
         * or as the second argument of the `reveal()` method.
         */

        ScrollReveal.prototype.defaults = {

            //            'bottom', 'left', 'top', 'right'
            origin      : 'bottom',

            //            Can be any valid CSS distance, e.g. '5rem', '10%', '20vw', etc.
            distance    : '20px',

            //            Time in milliseconds.
            duration    : 500,
            delay       : 0,

            //            Starting angles in degrees, will transition from these values to 0 in all axes.
            rotate      : { x: 0, y: 0, z: 0 },

            //            Starting opacity value, before transitioning to the computed opacity.
            opacity     : 0,

            //            Starting scale value, will transition from this value to 1
            scale       : 0.9,

            //            Accepts any valid CSS easing, e.g. 'ease', 'ease-in-out', 'linear', etc.
            easing      : 'cubic-bezier(0.6, 0.2, 0.1, 1)',

            //            When null, `<html>` is assumed to be the reveal container. You can pass a
            //            DOM node as a custom container, e.g. document.querySelector('.fooContainer')
            //            or a selector, e.g. '.fooContainer'
            container   : null,

            //            true/false to control reveal animations on mobile.
            mobile      : true,

            //            true:  reveals occur every time elements become visible
            //            false: reveals occur once as elements become visible
            reset       : false,

            //            'always' — delay for all reveal animations
            //            'once'   — delay only the first time reveals occur
            //            'onload' - delay only for animations triggered by first load
            useDelay    : 'always',

            //            Change when an element is considered in the viewport. The default value
            //            of 0.20 means 20% of an element must be visible for its reveal to occur.
            viewFactor  : 0.2,

            //            Pixel values that alter the container boundaries.
            //            e.g. Set `{ top: 48 }`, if you have a 48px tall fixed toolbar.
            //            --
            //            Visual Aid: https://scrollrevealjs.org/assets/viewoffset.png
            viewOffset  : { top: 0, right: 0, bottom: 0, left: 0 },

            //            Callbacks that fire for each completed element reveal, and if
            //            `config.reset = true`, for each completed element reset. When creating your
            //            callbacks, remember they are passed the element’s DOM node that triggered
            //            it as the first argument.
            afterReveal : function(domEl) {},
            afterReset  : function(domEl) {}
        };



        function ScrollReveal(config) {

            // Support instantiation without the `new` keyword.
            if (typeof this == 'undefined' || Object.getPrototypeOf(this) !== ScrollReveal.prototype) {
                return new ScrollReveal(config)
            }

            sr = this; // Save reference to instance.
            sr.tools = new Tools(); // *required utilities

            if (sr.isSupported()) {

                sr.tools.extend(sr.defaults, config || {});

                _resolveContainer(sr.defaults);

                sr.store = {
                    elements   : {},
                    containers : []
                };

                sr.sequences   = {};
                sr.history     = [];
                sr.uid         = 0;
                sr.initialized = false;
            }

            // Note: IE9 only supports console if devtools are open.
            else if (typeof console !== 'undefined' && console !== null) {
                console.log('ScrollReveal is not supported in this browser.');
            }

            return sr
        }



        /**
         * Check if client supports CSS Transform and CSS Transition.
         * @return {boolean}
         */
        ScrollReveal.prototype.isSupported = function() {
            var style = document.documentElement.style;
            return 'WebkitTransition' in style && 'WebkitTransform' in style
                || 'transition' in style && 'transform' in style
        };



        /**
         * Creates a reveal set, a group of elements that will animate when they
         * become visible. If [interval] is provided, a new sequence is created
         * that will ensure elements reveal in the order they appear in the DOM.
         *
         * @param {string|Node} [selector] The element (node) or elements (selector) to animate.
         * @param {Object}      [config]   Override the defaults for this reveal set.
         * @param {number}      [interval] Time between sequenced element animations (milliseconds).
         * @param {boolean}     [sync]     Used internally when updating reveals for async content.
         *
         * @return {Object} The current ScrollReveal instance.
         */
        ScrollReveal.prototype.reveal = function(selector, config, interval, sync) {

            var
                container,
                elements,
                elem,
                elemId,
                sequence,
                sequenceId;

            // Resolve container.
            if (config && config.container) {
                container = _resolveContainer(config);
            } else {
                container = sr.defaults.container;
            }

            // Let’s check to see if a DOM node was passed in as the first argument,
            // otherwise query the container for all elements matching the selector.
            if (sr.tools.isNode(selector)) {
                elements = [selector];
            } else {
                elements = Array.prototype.slice.call(container.querySelectorAll(selector));
            }

            if (!elements.length) {
                console.log('ScrollReveal: reveal on "'+ selector + '" failed, no elements found.');
                return sr
            }

            // No custom configuration was passed, but a sequence interval instead.
            // let’s shuffle things around to make sure everything works.
            if (config && typeof config == 'number') {
                interval = config;
                config = {};
            }

            // Prepare a new sequence if an interval is passed.
            if (interval && typeof interval == 'number') {
                sequenceId = _nextUid();

                sequence = sr.sequences[sequenceId] = {
                    id       : sequenceId,
                    interval : interval,
                    elemIds  : [],
                    active   : false
                }
            }

            // Begin main loop to configure ScrollReveal elements.
            for (var i = 0; i < elements.length; i++) {

                // Check if the element has already been configured and grab it from the store.
                elemId = elements[i].getAttribute('data-sr-id');
                if (elemId) {
                    elem = sr.store.elements[elemId];
                }

                // Otherwise, let’s do some basic setup.
                else {
                    elem = {
                        id        : _nextUid(),
                        domEl     : elements[i],
                        seen      : false,
                        revealing : false
                    };
                    elem.domEl.setAttribute('data-sr-id', elem.id);
                }

                // Sequence only setup
                if (sequence) {

                    elem.sequence = {
                        id    : sequence.id,
                        index : sequence.elemIds.length
                    };

                    sequence.elemIds.push(elem.id);
                }

                // New or existing element, it’s time to update its configuration, styles,
                // and send the updates to our store.
                _configure(elem, config || {});
                _style(elem);
                _updateStore(elem);

                // We need to make sure elements are set to visibility: visible, even when
                // on mobile and `config.mobile == false`, or if unsupported.
                if (sr.tools.isMobile() && !elem.config.mobile || !sr.isSupported()) {
                    elem.domEl.setAttribute('style', elem.styles.inline);
                    elem.disabled = true;
                }

                // Otherwise, proceed normally.
                else if (!elem.revealing) {
                    elem.domEl.setAttribute('style',
                        elem.styles.inline
                      + elem.styles.transform.initial
                    );
                }
            }

            // Each `reveal()` is recorded so that when calling `sync()` while working
            // with asynchronously loaded content, it can re-trace your steps but with
            // all your new elements now in the DOM.

            // Since `reveal()` is called internally by `sync()`, we don’t want to
            // record or intiialize each reveal during syncing.
            if (!sync && sr.isSupported()) {
                _record(selector, config);

                // We push initialization to the event queue using setTimeout, so that we can
                // give ScrollReveal room to process all reveal calls before putting things into motion.
                // --
                // Philip Roberts - What the heck is the event loop anyway? (JSConf EU 2014)
                // https://www.youtube.com/watch?v=8aGhZQkoFbQ
                if (sr.initTimeout) {
                    window.clearTimeout(sr.initTimeout);
                }
                sr.initTimeout = window.setTimeout(_init, 0);
            }

            return sr
        };



        /**
         * Re-runs `reveal()` for each record stored in history, effectively capturing
         * any content loaded asynchronously that matches existing reveal set selectors.
         *
         * @return {Object} The current ScrollReveal instance.
         */
        ScrollReveal.prototype.sync = function() {
            if (sr.history.length && sr.isSupported()) {
                for (var i = 0; i < sr.history.length; i++) {
                    var record = sr.history[i];
                    sr.reveal(record.selector, record.config, record.interval, true);
                };
                _init();
            } else {
                console.log('ScrollReveal: sync failed, no reveals found.');
            }
            return sr
        };



        /**
         * Private Methods
         * ---------------
         * These methods remain accessible only to the ScrollReveal instance, even
         * though they only "exist" during instantiation outside of the constructors scope.
         * --
         * http://stackoverflow.com/questions/111102/how-do-javascript-closures-work
         */

        function _resolveContainer(config) {
            var container = config.container;

            // Check if our container is defined by a selector.
            if (container && typeof container == 'string') {
                return config.container = window.document.querySelector(container);
            }

            // Check if our container is defined by a node.
            else if (container && !sr.tools.isNode(container)) {
                console.log('ScrollReveal: Invalid container provided, using <html> instead.');
                config.container = null;
            }

            // Otherwise use <html> by default.
            if (container == null) {
                config.container = window.document.documentElement;
            }

            return config.container
        }



        /**
         * A consistent way of creating unique IDs.
         * @returns {number}
         */
        function _nextUid() {
            return ++sr.uid;
        }



        function _configure(elem, config) {

            // If the element hasn’t already been configured, let’s use a clone of the
            // defaults extended by the configuration passed as the second argument.
            if (!elem.config) {
                elem.config = sr.tools.extendClone(sr.defaults, config);
            }

            // Otherwise, let’s use a clone of the existing element configuration extended
            // by the configuration passed as the second argument.
            else {
                elem.config = sr.tools.extendClone(elem.config, config);
            }

            // Infer CSS Transform axis from origin string.
            if (elem.config.origin === 'top' || elem.config.origin === 'bottom') {
                elem.config.axis = 'Y';
            } else {
                elem.config.axis = 'X';
            }

            // Let’s make sure our our pixel distances are negative for top and left.
            // e.g. config.origin = 'top' and config.distance = '25px' starts at `top: -25px` in CSS.
            if (elem.config.origin === 'top' || elem.config.origin === 'left') {
                elem.config.distance = '-' + elem.config.distance;
            }
        }



        function _style(elem) {
            var computed = window.getComputedStyle(elem.domEl);

            if (!elem.styles) {
                elem.styles = {
                    transition : {},
                    transform  : {},
                    computed   : {}
                };

                // Capture any existing inline styles, and add our visibility override.
                // --
                // See section 4.2. in the Documentation:
                // https://github.com/jlmakes/scrollreveal.js#42-improve-user-experience
                elem.styles.inline  = elem.domEl.getAttribute('style') || '';
                elem.styles.inline += '; visibility: visible; ';

                // grab the elements existing opacity.
                elem.styles.computed.opacity = computed.opacity;

                // grab the elements existing transitions.
                if (!computed.transition || computed.transition == 'all 0s ease 0s') {
                    elem.styles.computed.transition = '';
                } else {
                    elem.styles.computed.transition = computed.transition + ', ';
                }
            }

            // Create transition styles
            elem.styles.transition.instant = _generateTransition(elem, 0);
            elem.styles.transition.delayed = _generateTransition(elem, elem.config.delay);

            // Generate transform styles, first with the webkit prefix.
            elem.styles.transform.initial = ' -webkit-transform:';
            elem.styles.transform.target  = ' -webkit-transform:';
            _generateTransform(elem);

            // And again without any prefix.
            elem.styles.transform.initial += 'transform:';
            elem.styles.transform.target  += 'transform:';
            _generateTransform(elem);

        }



        function _generateTransition(elem, delay) {
            var config = elem.config;

            return '-webkit-transition: ' + elem.styles.computed.transition +
                     '-webkit-transform ' + config.duration / 1000 + 's '
                                          + config.easing + ' '
                                          + delay / 1000 + 's, opacity '
                                          + config.duration / 1000 + 's '
                                          + config.easing + ' '
                                          + delay / 1000 + 's; ' +

                           'transition: ' + elem.styles.computed.transition +
                             'transform ' + config.duration / 1000 + 's '
                                          + config.easing + ' '
                                          + delay / 1000 + 's, opacity '
                                          + config.duration / 1000 + 's '
                                          + config.easing + ' '
                                          + delay / 1000 + 's; '
        }



        function _generateTransform(elem) {
            var config    = elem.config;
            var transform = elem.styles.transform;

            if (parseInt(config.distance)) {
                transform.initial += ' translate' + config.axis + '(' + config.distance + ')';
                transform.target  += ' translate' + config.axis + '(0)';
            }
            if (config.scale) {
                transform.initial += ' scale(' + config.scale + ')';
                transform.target  += ' scale(1)';
            }
            if (config.rotate.x) {
                transform.initial += ' rotateX(' + config.rotate.x + 'deg)';
                transform.target  += ' rotateX(0)';
            }
            if (config.rotate.y) {
                transform.initial += ' rotateY(' + config.rotate.y + 'deg)';
                transform.target  += ' rotateY(0)';
            }
            if (config.rotate.z) {
                transform.initial += ' rotateZ(' + config.rotate.z + 'deg)';
                transform.target  += ' rotateZ(0)';
            }
            transform.initial += '; opacity: ' + config.opacity + ';';
            transform.target  += '; opacity: ' + elem.styles.computed.opacity + ';';
        }



        function _updateStore(elem) {
            var container = elem.config.container;

            // If this element’s container isn’t already in the store, let’s add it.
            if (container && sr.store.containers.indexOf(container) == -1) {
                sr.store.containers.push(elem.config.container);
            }

            // Update the element stored with our new element.
            sr.store.elements[elem.id] = elem;
        };



        function _record(selector, config, interval) {

            // Save the `reveal()` arguments that triggered this `_record()` call, so we
            // can re-trace our steps when calling the `sync()` method.
            var record = {
                selector : selector,
                config   : config,
                interval : interval
            };
            sr.history.push(record);
        }



        function _init() {
            if (sr.isSupported()) {

                // Initial animate call triggers valid reveal animations on first load.
                // Subsequent animate calls are made inside the event handler.
                _animate();

                // Then we loop through all container nodes in the store and bind event
                // listeners to each.
                for (var i = 0; i < sr.store.containers.length; i++) {
                    sr.store.containers[i].addEventListener('scroll', _handler);
                    sr.store.containers[i].addEventListener('resize', _handler);
                }

                // Let’s also do a one-time binding of window event listeners.
                if (!sr.initialized) {
                    window.addEventListener('scroll', _handler);
                    window.addEventListener('resize', _handler);
                    sr.initialized = true;
                }
            }
            return sr
        }



        function _handler() {
            _requestAnimationFrame(_animate);
        }



        function _setActiveSequences() {

            var
                active,
                elem,
                elemId,
                sequence;

            // Loop through all sequences
            sr.tools.forOwn(sr.sequences, function(sequenceId) {
                sequence = sr.sequences[sequenceId];
                active   = false;

                // For each sequenced elemenet, let’s check visibility and if
                // any are visible, set it’s sequence to active.
                for (var i = 0; i < sequence.elemIds.length; i++) {
                    elemId = sequence.elemIds[i]
                    elem   = sr.store.elements[elemId];
                    if (_isElemVisible(elem) && !active) {
                        active = true;
                    }
                }

                sequence.active = active;
            });
        }



        function _animate() {

            var
                delayed,
                elem;

            _setActiveSequences();

            // Loop through all elements in the store
            sr.tools.forOwn(sr.store.elements, function(elemId) {

                elem = sr.store.elements[elemId];
                delayed = _shouldUseDelay(elem);

                // Let’s see if we should reveal, and if so, whether to use delay.
                if (_shouldReveal(elem)) {
                    if (delayed) {
                        elem.domEl.setAttribute('style',
                            elem.styles.inline
                          + elem.styles.transform.target
                          + elem.styles.transition.delayed
                        );
                    } else {
                        elem.domEl.setAttribute('style',
                            elem.styles.inline
                          + elem.styles.transform.target
                          + elem.styles.transition.instant
                        );
                    }

                    // Let’s queue the `afterReveal` callback and tag the element.
                    _queueCallback('reveal', elem, delayed);
                    elem.revealing = true;
                    elem.seen = true;

                    if (elem.sequence) {
                        _queueNextInSequence(elem, delayed);
                    }
                }

                // If we got this far our element shouldn’t reveal, but should it reset?
                else if (_shouldReset(elem)) {
                    elem.domEl.setAttribute('style',
                        elem.styles.inline
                      + elem.styles.transform.initial
                      + elem.styles.transition.instant
                    );
                    _queueCallback('reset', elem);
                    elem.revealing = false;
                }
            });
        }



        /**
         * Sequence callback that triggers the next element.
         */
        function _queueNextInSequence(elem, delayed) {

            var
                elapsed  = 0,
                delay    = 0,
                sequence = sr.sequences[elem.sequence.id];

            // We’re processing a sequenced element, so let's block other elements in this sequence.
            sequence.blocked = true;

            // Since we’re triggering animations a part of a sequence after animations on first load,
            // we need to check for that condition and explicitly add the delay to our timer.
            if (delayed && elem.config.useDelay == 'onload') {
                delay = elem.config.delay;
            }

            // If a sequence timer is already running, capture the elapsed time and clear it.
            if (elem.sequence.timer) {
                elapsed = Math.abs(elem.sequence.timer.started - new Date());
                window.clearTimeout(elem.sequence.timer);
            }

            // Start a new timer.
            elem.sequence.timer = { started: new Date() };
            elem.sequence.timer.clock = window.setTimeout(function() {

                // Sequence interval has passed, so unblock the sequence and re-run the handler.
                sequence.blocked = false;
                elem.sequence.timer = null;
                _handler();

            }, Math.abs(sequence.interval) + delay - elapsed);
        }



        function _queueCallback(type, elem, delayed) {

            var
                elapsed  = 0,
                duration = 0,
                callback = 'after';

            // Check which callback we’re working with.
            switch (type) {

                case 'reveal':
                    duration = elem.config.duration;
                    if (delayed) {
                        duration += elem.config.delay;
                    }
                    callback += 'Reveal';
                    break

                case 'reset':
                    duration = elem.config.duration;
                    callback += 'Reset';
                    break
            }

            // If a timer is already running, capture the elapsed time and clear it.
            if (elem.timer) {
                elapsed = Math.abs(elem.timer.started - new Date());
                window.clearTimeout(elem.timer.clock);
            }

            // Start a new timer.
            elem.timer = { started: new Date() };
            elem.timer.clock = window.setTimeout(function() {

                // The timer completed, so let’s fire the callback and null the timer.
                elem.config[callback](elem.domEl);
                elem.timer = null;

            }, duration - elapsed);
        }



        function _shouldReveal(elem) {
            if (elem.sequence) {
                var sequence = sr.sequences[elem.sequence.id];
                return sequence.active
                    && !sequence.blocked
                    && !elem.revealing
                    && !elem.disabled
            }
            return _isElemVisible(elem)
                && !elem.revealing
                && !elem.disabled
        }



        function _shouldUseDelay(elem) {
            var config = elem.config.useDelay;
            return config === 'always'
                || (config === 'onload' && !sr.initialized)
                || (config === 'once' && !elem.seen)
        }



        function _shouldReset(elem) {
            if (elem.sequence) {
                var sequence = sr.sequences[elem.sequence.id];
                return !sequence.active
                    && elem.config.reset
                    && elem.revealing
                    && !elem.disabled
            }
            return !_isElemVisible(elem)
                && elem.config.reset
                && elem.revealing
                && !elem.disabled
        }



        function _getContainer(container) {
            return {
                width  : container.clientWidth,
                height : container.clientHeight
            }
        }



        function _getScrolled(container) {

            // Return the container scroll values, plus the its offset.
            if (container && container !== window.document.documentElement) {
                var offset = _getOffset(container);
                return {
                    x : container.scrollLeft + offset.left,
                    y : container.scrollTop  + offset.top
                }
            }

            // Otherwise, default to the window object’s scroll values.
            else {
                return {
                    x : window.pageXOffset,
                    y : window.pageYOffset
                }
            }
        }



        function _getOffset(domEl) {

            var
                offsetTop    = 0,
                offsetLeft   = 0,

                // Grab the element’s dimensions.
                offsetHeight = domEl.offsetHeight,
                offsetWidth  = domEl.offsetWidth;

            // Now calculate the distance between the element and its parent, then
            // again for the parent to its parent, and again etc... until we have the
            // total distance of the element to the document’s top and left origin.
            do {
                if (!isNaN(domEl.offsetTop)) {
                    offsetTop += domEl.offsetTop;
                }
                if (!isNaN(domEl.offsetLeft)) {
                    offsetLeft += domEl.offsetLeft;
                }
            } while (domEl = domEl.offsetParent);

            return {
                top    : offsetTop,
                left   : offsetLeft,
                height : offsetHeight,
                width  : offsetWidth
            }
        }



        function _isElemVisible(elem) {

            var
                offset     = _getOffset(elem.domEl),
                container  = _getContainer(elem.config.container),
                scrolled   = _getScrolled(elem.config.container),
                vF         = elem.config.viewFactor,

                // Define the element geometry.
                elemHeight = offset.height,
                elemWidth  = offset.width,
                elemTop    = offset.top,
                elemLeft   = offset.left,
                elemBottom = elemTop  + elemHeight,
                elemRight  = elemLeft + elemWidth;

            return confirmBounds() || isPositionFixed()

            function confirmBounds() {

                var
                    // Define the element’s functional boundaries using its view factor.
                    top        = elemTop    + elemHeight * vF,
                    left       = elemLeft   + elemWidth  * vF,
                    bottom     = elemBottom - elemHeight * vF,
                    right      = elemRight  - elemWidth  * vF,

                    // Define the container functional boundaries using its view offset.
                    viewTop    = scrolled.y + elem.config.viewOffset.top,
                    viewLeft   = scrolled.x + elem.config.viewOffset.left,
                    viewBottom = scrolled.y - elem.config.viewOffset.bottom + container.height,
                    viewRight  = scrolled.x - elem.config.viewOffset.right  + container.width;

                return top    < viewBottom
                    && bottom > viewTop
                    && left   > viewLeft
                    && right  < viewRight
            }

            function isPositionFixed() {
                return (window.getComputedStyle(elem.domEl).position === 'fixed')
            }
        }



        return ScrollReveal

    })();


    /**
     * helper.tools.js
     * ---------------
     * Simple deep object extend, and a few other agnostic helper methods.
     * gist: https://gist.github.com/jlmakes/9f104e3f1b4d86334987
     */

    Tools = (function() {

        Tools.prototype.isObject = function(object) {
            return object !== null && typeof object === 'object' && object.constructor == Object
        };

        Tools.prototype.isNode = function(object) {
            return typeof Node === 'object'
                ? object instanceof Node
                : object && typeof object === 'object'
                         && typeof object.nodeType === 'number'
                         && typeof object.nodeName === 'string'
        };

        Tools.prototype.forOwn = function(object, callback) {
            if (!this.isObject(object)) {
                throw new TypeError('Expected "object", but received "' + typeof object + '".');
            } else {
                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        callback(property);
                    }
                }
            }
        };

        Tools.prototype.extend = function(target, source) {
            this.forOwn(source, function(property) {
                if (this.isObject(source[property])) {
                    if (!target[property] || !this.isObject(target[property])) {
                        target[property] = {};
                    }
                    this.extend(target[property], source[property]);
                } else {
                    target[property] = source[property];
                }
            }.bind(this));
            return target
        };

        Tools.prototype.extendClone = function(target, source) {
            return this.extend(this.extend({}, target), source)
        };

        Tools.prototype.isMobile = function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };

        function Tools() {};
        return Tools

    })();



    _requestAnimationFrame = window.requestAnimationFrame       ||
                             window.webkitRequestAnimationFrame ||
                             window.mozRequestAnimationFrame;



}).call(this);

return this.ScrollReveal;

}));

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(document).on('click', 'a.page-scroll', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Initialize and Configure Scroll Reveal Animation
    window.sr = ScrollReveal();
    sr.reveal('.sr-icons', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 200);
    sr.reveal('.sr-button', {
        duration: 1000,
        delay: 200
    });
    sr.reveal('.sr-contact', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 300);

    // Initialize and Configure Magnific Popup Lightbox Plugin
    $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
        }
    });

})(jQuery); // End of use strict
