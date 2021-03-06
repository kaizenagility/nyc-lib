QUnit.module('nyc.ZoomSearch', {
	beforeEach: function(assert){
		setup(assert, this);

		this.AMBIGUOUS = {
			input: '2 broadway',
			possible: [{
				type: nyc.Locate.ResultType.GEOCODE,
				coordinates: [1, 2],
				accuracy: nyc.Geocoder.Accuracy.HIGH,
				name: '2 Broadway, Manhattan, NY 10004',
				geometry: null,
				data: 'data'
			},
			{
				type: nyc.Locate.ResultType.GEOCODE,
				coordinates: [3, 4],
				accuracy: nyc.Geocoder.Accuracy.HIGH,
				name: '2 Broadway, Queens, NY 11414',
				geometry: null,
				data: 'data'
			},
			{
				type: nyc.Locate.ResultType.GEOCODE,
				coordinates: [5, 6],
				accuracy: nyc.Geocoder.Accuracy.MEDIUM,
				name: '2 Broadway, Staten Is, NY 10310',
				geometry: null,
				data: 'data'
			}]
		};

		$('body').append($('<div id="test-container"></div>'));
		this.TEST_CONTROL = function(useSearchTypeMenu){
			nyc.ZoomSearch.apply(this, [useSearchTypeMenu]);
		};
		this.TEST_CONTROL.prototype.getContainer = function(){
			return $('#test-container');
		}
		nyc.inherits(this.TEST_CONTROL, nyc.ZoomSearch);
	},
	afterEach: function(assert){
		teardown(assert, this);
		delete this.AMBIGUOUS;
		$('#test-container').remove();
		delete this.TEST_CONTROL;
	}
});

QUnit.test('render (useSearchTypeMenu = false)', function(assert){
	assert.expect(10);

	var control = new this.TEST_CONTROL();
	assert.equal(control.getElem('.btn-z-in').length, 1);
	assert.equal(control.getElem('.btn-z-out').length, 1);
	assert.equal(control.getElem('.fld-srch-container input').length, 1);
	assert.equal(control.getElem('.fld-srch').length, 1);
	assert.equal(control.getElem('.fld-srch-retention').length, 1);

	assert.equal(control.getElem('.btn-geo').length, 1);
	assert.notOk(control.getElem('.btn-srch-typ').length);
	assert.notOk(control.getElem('.mnu-srch-typ').length);
	assert.notOk(control.getElem('.srch-type-geo').length);
	assert.notOk(control.getElem('.srch-type-addr').length);
});

QUnit.test('geolocate (useSearchTypeMenu = false)', function(assert){
	assert.expect(1);

	var control = new this.TEST_CONTROL();
	control.on(nyc.ZoomSearch.EventType.GEOLOCATE, function(){
		assert.ok(true);
	});
	control.getElem('.btn-geo').trigger('click');
	control.getElem('.srch-type-geo').trigger('click');
});

QUnit.test('geolocate (useSearchTypeMenu = true)', function(assert){
	assert.expect(1);

	var control = new this.TEST_CONTROL(true);
	control.on(nyc.ZoomSearch.EventType.GEOLOCATE, function(){
		assert.ok(true);
	});
	control.getElem('.btn-geo').trigger('click');
	control.getElem('.srch-type-geo').trigger('click');
});

QUnit.test('render (useSearchTypeMenu = false)', function(assert){
	assert.expect(10);

	var control = new this.TEST_CONTROL();
	assert.equal(control.getElem('.btn-z-in').length, 1);
	assert.equal(control.getElem('.btn-z-out').length, 1);
	assert.equal(control.getElem('.fld-srch-container input').length, 1);
	assert.equal(control.getElem('.fld-srch').length, 1);
	assert.equal(control.getElem('.fld-srch-retention').length, 1);

	assert.equal(control.getElem('.btn-geo').length, 1);
	assert.notOk(control.getElem('.btn-srch-typ').length);
	assert.notOk(control.getElem('.mnu-srch-typ').length);
	assert.notOk(control.getElem('.srch-type-geo').length);
	assert.notOk(control.getElem('.srch-type-addr').length);
});

QUnit.test('triggerSearch (input = "my address")', function(assert){
	assert.expect(2);

	var control = new this.TEST_CONTROL();
	control.searching = function(show){
		assert.ok(show);
	};
	control.one(nyc.ZoomSearch.EventType.SEARCH, function(data){
		assert.equal(data, 'my address');
	});
	control.getElem('.fld-srch-container input').val(' my address ');
	control.triggerSearch();
});

QUnit.test('triggerSearch (no input)', function(assert){
	assert.expect(2);

	var control = new this.TEST_CONTROL();
	control.searching = function(show){
		assert.ok(false, 'searching should not be called');
	};
	var handled = false;
	var handler = function(){handled = true;};
	control.on(nyc.ZoomSearch.EventType.SEARCH, handler);
	control.getElem('.ld-srch-container input').val('');
	control.triggerSearch();
	assert.notOk(handled);
	control.getElem('.fld-srch-container input').val(' ');
	control.triggerSearch();
	assert.notOk(handled);
	control.off(nyc.ZoomSearch.EventType.SEARCH, handler);
});

QUnit.test('val', function(assert){
	assert.expect(4);

	var control = new this.TEST_CONTROL();
	control.searching = function(show){
		assert.notOk(show);
	};

	control.getElem('.fld-srch-container input').val('my address');
	assert.equal(control.val(), 'my address');
	assert.equal(control.val('your address'), 'your address');
	assert.equal(control.val(), 'your address');
});

QUnit.test('disambiguate', function(assert){
	assert.expect(9);

	var names = ['2 Broadway, Manhattan, NY 10004', '2 Broadway, Queens, NY 11414', '2 Broadway, Staten Is, NY 10310'];
	var control = new this.TEST_CONTROL();
	assert.equal(control.list.height(), 0);
	control.disambiguate(this.AMBIGUOUS);
	assert.ok(control.list.height() > 0);
	assert.equal(control.list.children().length, 3);
	control.list.children().each(function(i, li){
		assert.notOk($(li).hasClass('ui-screen-hidden'));
		assert.equal($(li).html(), names[i]);
	});
});

QUnit.test('disambiguated', function(assert){
	assert.expect(8);
	var ambiguous = this.AMBIGUOUS;

	var control = new this.TEST_CONTROL();

	assert.equal(control.list.height(), 0);
	control.disambiguate(ambiguous);
	assert.ok(control.list.height() > 0);
	assert.equal(control.list.children().length, 3);
	control.one(nyc.ZoomSearch.EventType.DISAMBIGUATED, function(data){
		assert.deepEqual(data, ambiguous.possible[0]);
	});
	$(control.list.children()[0]).trigger('click');

	control.disambiguate(ambiguous);
	assert.equal(control.list.children().length, 3);
	control.one(nyc.ZoomSearch.EventType.DISAMBIGUATED, function(data){
		assert.deepEqual(data, ambiguous.possible[1]);
	});
	$(control.list.children()[1]).trigger('click');

	control.disambiguate(ambiguous);
	assert.equal(control.list.children().length, 3);
	control.one(nyc.ZoomSearch.EventType.DISAMBIGUATED, function(data){
		assert.deepEqual(data, ambiguous.possible[2]);
	});
	$(control.list.children()[2]).trigger('click');
});

QUnit.test('searching', function(assert){
	assert.expect(3);

	var control = new this.TEST_CONTROL();
	assert.notOk(control.getElem('.fld-srch-container a.ui-input-clear').hasClass('searching'));

	control.searching(true);
	assert.ok(control.getElem('.fld-srch-container a.ui-input-clear').hasClass('searching'));

	control.searching(false);
	assert.notOk(control.getElem('.fld-srch-container a.ui-input-clear').hasClass('searching'));
});

QUnit.test('listItem', function(assert){
	assert.expect(6);

	var control = new this.TEST_CONTROL();
	var location = {
		 name: 'test-name',
		 coordinates: [1, 2],
		 geometry: "geometry",
		 accuracy: nyc.Geocoder.Accuracy.HIGH,
		 type: nyc.Locate.ResultType.GEOCODE,
		 data: "data"
	};
	var li = control.listItem('test', location);

	control.on(nyc.ZoomSearch.EventType.DISAMBIGUATED, function(data){
		assert.deepEqual(data, location);
	});
	li.trigger('click');

	assert.deepEqual(li.data('location'), location);
	assert.equal(li.html(), location.name);
	assert.ok(li.hasClass('srch-type-test'));
	assert.ok(li.hasClass('notranslate'));
	assert.equal(li.attr('translate'), 'no');
});

QUnit.test('searchType', function(assert){
	assert.expect(3);
	var done = assert.async();

	var control = new this.TEST_CONTROL(true);
	control.flipIcon = function(){
		assert.ok(true);
	};

	control.list.show();
	control.getElem('.mnu-srch-typ').hide();

	control.searchType()

	assert.equal(control.list.css('display'), 'none');
	setTimeout(function(){
		assert.equal(control.getElem('.mnu-srch-typ').css('display'), 'block');
		done();
	}, 1000);
});

QUnit.test('flipIcon', function(assert){
	assert.expect(6);

	var control = new this.TEST_CONTROL(true);

	assert.ok(control.typBtn.hasClass('ui-icon-carat-d'));
	assert.notOk(control.typBtn.hasClass('ui-icon-carat-u'));

	control.flipIcon();

	assert.notOk(control.typBtn.hasClass('ui-icon-carat-d'));
	assert.ok(control.typBtn.hasClass('ui-icon-carat-u'));

	control.flipIcon();

	assert.ok(control.typBtn.hasClass('ui-icon-carat-d'));
	assert.notOk(control.typBtn.hasClass('ui-icon-carat-u'));
});

QUnit.test('choices (srch-type = addr)', function(assert){
	assert.expect(15);
	var done = assert.async();

	var control = new this.TEST_CONTROL(true);
	control.flipIcon = function(){
		assert.ok(true);
	};
	control.emptyList = function(){
		assert.ok(true);
	};
	control.isAddrSrch = false;
	control.val('before');
	control.getElem('.mnu-srch-typ').show();
	control.input.attr('placeholder', 'placeholder');

	var liAddr = $('<li></li><li></li><li></li>').addClass('srch-type-addr');
	var liOther = $('<li>1</li><li></li><li></li>').addClass('srch-type-other');
	control.getElem('.fld-srch-retention').append(liAddr);
	control.getElem('.fld-srch-retention').append(liOther);

	assert.notOk(control.isAddrSrch);
	assert.ok(control.val());
	assert.notOk(control.input.get(0) === document.activeElement);
	assert.notOk(control.getElem('.fld-srch li.srch-type-addr').length);
	assert.notOk(control.getElem('.fld-srch li.srch-type-other').length);

	control.choices({target: liAddr.get(1)});

	assert.ok(control.isAddrSrch);
	assert.notOk(control.val());
	assert.ok(control.input.get(0) == document.activeElement);
	assert.ok(control.input.get(0) === document.activeElement);

	assert.equal(control.input.attr('placeholder'), 'Search for an address...');

	assert.equal(control.getElem('.fld-srch li.srch-type-addr').length, 3);
	assert.notOk(control.getElem('.fld-srch li.srch-type-other').length);

	setTimeout(function(){
		assert.equal(control.getElem('.mnu-srch-typ').css('display'), 'none');
		done();
	}, 1000);
});

QUnit.test('choices (srch-type = other)', function(assert){
	assert.expect(15);
	var done = assert.async();

	var control = new this.TEST_CONTROL(true);
	control.flipIcon = function(){
		assert.ok(true);
	};
	control.emptyList = function(){
		assert.ok(true);
	};
	control.isAddrSrch = false;
	control.val('before');
	control.getElem('.mnu-srch-typ').show();
	control.input.attr('placeholder', 'placeholder');

	var liAddr = $('<li></li><li></li><li></li>').addClass('srch-type-addr');
	var liOther = $('<li>1</li><li></li><li></li>').addClass('srch-type-other').data('srch-type', 'other').data('placeholder', 'Search Other...');
	control.getElem('.fld-srch-retention').append(liAddr);
	control.getElem('.fld-srch-retention').append(liOther);

	assert.notOk(control.isAddrSrch);
	assert.ok(control.val());
	assert.notOk(control.input.get(0) === document.activeElement);
	assert.notOk(control.getElem('.fld-srch li.srch-type-addr').length);
	assert.notOk(control.getElem('.fld-srch li.srch-type-other').length);

	control.choices({target: liOther.get(1)});

	assert.notOk(control.isAddrSrch);
	assert.notOk(control.val());
	assert.ok(control.input.get(0) == document.activeElement);
	assert.ok(control.input.get(0) === document.activeElement);

	assert.equal(control.input.attr('placeholder'), 'Search Other...');

	assert.equal(control.getElem('.fld-srch li.srch-type-other').length, 3);
	assert.notOk(control.getElem('.fld-srch li.srch-type-addr').length);

	setTimeout(function(){
		assert.equal(control.getElem('.mnu-srch-typ').css('display'), 'none');
		done();
	}, 1000);
});

QUnit.test('emptyList', function(assert){
	assert.expect(4);

	var control = new this.TEST_CONTROL();
	var liAddr = $('<li></li><li></li><li></li>').addClass('srch-type-addr');
	control.getElem('.fld-srch').append(liAddr);

	assert.equal(control.getElem('.fld-srch-retention').length, 1);
	assert.notOk(control.getElem('.fld-srch-retention li.srch-type-addr').length);

	control.emptyList();

	assert.notOk(control.getElem('.fld-srch li.srch-type-addr').length);
	assert.equal(control.getElem('.fld-srch-retention li.srch-type-addr').length, 3);
});
