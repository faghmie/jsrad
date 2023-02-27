function open_card(content, on_show, on_close) {
	return new Card(content, on_show, on_close);
}

function Card(content, on_show, on_close) {
	let overlay = $('<div>').addClass('ui-overlay').appendTo('body').show();
	let options = {
		overflow: 'auto',
		width: '40vw',
		no_header: false,
		on_close: () => { },
		on_show: () => { }
	};

	if (typeof on_show === 'function' || typeof on_close === 'function') {
		options.on_show = on_show;
		options.on_close = on_close;
	} else {
		options = { ...options, ...on_show };
	}

	let div = $(`<div class="popup-card">
					<div class="header-row">
						<div class="drag-me header title"></div>
						<div class="action-list">
							<i class="close-btn la la-times"></i>
						</div>
					</div>
					<div class="body-wrapper">
						<div class="body-content"></div>
					</div>
				</div>`)
		.css({
			'width': parseFloat(options.width) + 25,
			'max-width': options['max-width'],
			'min-width': options['min-width'],
			'max-height': '90vh',
		})
		.appendTo(overlay)
		.show();


	if (true === options.transparent) {
		div.removeClass('card');
	}

	div.find('.body-content')
		.append(content)
		.css({
			'min-height': options['min-height'],
			height: parseFloat(options.height) + 5, //add offset for header
		});
		
	div.draggable({ handle: '.drag-me' });
	
	if (options.title) {
		div.find('.header-row .header').append(options.title);
	}

	if (options.action_list) {
		div.find('.header-row .action-list').prepend(options.action_list);
	}

	if (options.no_header === true) {
		div.find('.header-row').remove();
	}

	addEventListener('resize', function () {
		calc_dimensions();
	});

	calc_dimensions();

	function calc_dimensions() {
		let dims = content[0].getBoundingClientRect();
		let height = dims.height;
		let width = dims.width;
		if (options.no_header !== true && div) { //This seems odd...not sure why this sometimes fails to find div
			height += div.find('.header-row').height() + 30;
			width += 20;
		}

		if (typeof options.height != 'undefined') {
			//Honor dimensions sent in
			return;
		}

		if (dims.width > 0) {
			div.css({
				width: width,
				'max-width': width,
				'min-width': width,
			});
		}

		if (dims.height > 0) {
			div.css({
				height: height,
				'max-height': height,
				'min-height': height,
			});
		}
	}

	function close(_callback) {
		if (this.is_closed === true || !div) return console.log('nothing to do');

		this.is_closed = true;

		div.animate({ right: '-800' },
			{
				queue: false,
				duration: 50,
				complete: function () {
					overlay.remove();

					if (div) {
						div.remove();
					}
					div = null;
					if (typeof _callback === 'function') {
						_callback();
					}
				},
			}
		);
	}

	div.find('i.close-btn').on('click', this, function (evt) {
		let ret = options.on_close();
		if (false === ret) return;
		close.call(evt.data);
	});

	$('body').css({ 'overflow': 'hidden' });

	overlay.show(function () {
		div.animate({ right: '0px' },
			{
				queue: false,
				duration: 200,
				complete: function () {
					if (typeof (options.on_show) === 'function') options.on_show(div);
				},
			}
		);

		div.show(function () {
			// if (typeof(options.on_show) === 'function') options.on_show();
			if (!div) return;
			div.position({
				of: overlay,
				my: 'center center',
				at: 'center center'
			});
		});
	});

	recenter = function () {
		div.position({
			of: overlay,
			my: 'center center',
			at: 'center center'
		});
	};

	this.is_closed = false;


	return {
		close: close,
		recenter: recenter,
		container: div
	};
}
