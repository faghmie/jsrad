export default class Dialog {
	overlay = null;
	options = {};
	card = null;
	content = null;
	is_closed = false;

	constructor(content, on_show, on_close) {
		this.content = content;

		this.set_options(on_show, on_close);
		this.set_basic_card();
		this.apply_options();
		this.set_card_content(content);
		this.draggable();
		this.make_closeable();
		this.calc_dimensions(content);
		this.show();
	}

	set_options(on_show, on_close) {
		this.options = {
			overflow: 'auto',
			width: '40vw',
			no_header: false,
			on_close: () => { },
			on_show: () => { }
		};

		if (typeof on_show === 'function' || typeof on_close === 'function') {
			this.options.on_show = on_show;
			this.options.on_close = on_close;
		} else {
			this.options = { ...this.options, ...on_show };
		}
	}

	set_basic_card() {
		this.overlay = $('<div>').addClass('ui-overlay').appendTo('body').show();

		this.card = $(`<div class="popup-card">
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
				'width': parseFloat(this.options.width) + 25,
				'max-width': this.options['max-width'],
				'min-width': this.options['min-width'],
				'max-height': '90vh',
			})
			.appendTo(this.overlay)
			.show();
	}

	apply_options() {
		if (true === this.options.transparent) {
			this.card.removeClass('card');
		}

		if (this.options.title) {
			this.card.find('.header-row .header').append(this.options.title);
		}

		if (this.options.action_list) {
			this.card.find('.header-row .action-list').prepend(this.options.action_list);
		}

		if (this.options.no_header === true) {
			this.card.find('.header-row').remove();
		}
	}

	set_card_content(content) {
		this.card.find('.body-content')
			.append(content)
			.css({
				'min-height': this.options['min-height'],
				height: parseFloat(this.options.height) + 5, //add offset for header
			});

		addEventListener('resize', function () {
			this.calc_dimensions(content)
		}.bind(this));
	}

	draggable() {
		this.card.draggable({ handle: '.drag-me' });

	}

	make_closeable() {
		this.card.find('i.close-btn').on('click', function (evt) {
			let ret = this.options.on_close();

			if (false === ret) {
				return;
			}

			this.close();
		}.bind(this));
	}

	calc_dimensions(content) {
		let dims = content[0].getBoundingClientRect();
		let height = dims.height;
		let width = dims.width;
		if (this.options.no_header !== true && this.card) { //This seems odd...not sure why this sometimes fails to find div
			height += this.card.find('.header-row').height() + 30;
			width += 20;
		}

		if (typeof this.options.height != 'undefined') {
			//Honor dimensions sent in
			return;
		}

		if (dims.width > 0) {
			this.card.css({
				width: width,
				'max-width': width,
				'min-width': width,
			});
		}

		if (dims.height > 0) {
			this.card.css({
				height: height,
				'max-height': height,
				'min-height': height,
			});
		}
	}

	close(_callback) {
		if (this.is_closed === true || !this.card) {
			return console.log('nothing to do');
		}

		this.is_closed = true;

		this.card.animate({ right: '-800' },
			{
				queue: false,
				duration: 50,
				complete: function () {
					this.overlay.remove();

					if (this.car) {
						this.card.remove();
					}

					this.card = null;

					if (typeof _callback === 'function') {
						_callback();
					}
				}.bind(this),
			}
		);
	}

	show() {
		this.overlay.show(function () {
			this.card.animate({ right: '0px' },
				{
					queue: false,
					duration: 200,
					complete: function () {
						if (typeof (this.options.on_show) === 'function') this.options.on_show(this.card);
					}.bind(this),
				}
			);

			this.card.show(function () {
				if (!this.card) return;
				this.card.position({
					of: this.overlay,
					my: 'center center',
					at: 'center center'
				});
			}.bind(this));
		}.bind(this));
	}
}
