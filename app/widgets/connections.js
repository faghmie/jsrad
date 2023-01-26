export default class LineConnection {
	line = null;
	arrow = null;

	connection = null;
	detection_margin = 5;
	mouse_over = false;

	base_class = 'jsrad-connection-line';

	constructor(options) {
		this.style = Object.assign({
			position: 'absolute',
			'border-color': '#4D4D4D',
			'border-style': 'solid',
			'border-width': '2px',
			'border-radius': '8px',
			'z-index': '0',
		}, options.style || {});

		this.options = options;

		if (!this.options.event_prefix) {
			this.options.event_prefix = '';
		}

		this.options.event_prefix = this.options.event_prefix.trim();

		this.source_id = options.source_id;
		this.destination_id = options.destination_id;
		this.container_id = options.container_id;
		
		this.connect(this.options);
	}

	remove() {
		this.destroy();
	}

	hide() {
		if (this.line) {
			this.line.hide();
		}
	}

	destroy() {
		if (this.line) {
			this.line.hide();
			this.line.remove();
			this.line = null;
		}
	}

	show() {
		if (this.line) {
			this.line.show();
		}
	}

	contains(ctrl){
		return this.connection.from == ctrl || this.connection.to == ctrl;
	}

	startsWith(ctrl){
		return this.connection.from == ctrl;
	}

	endsWith(ctrl){
		return this.connection.to == ctrl;
	}

	connect(_connection) {
		let data = _connection || this.connection;

		if (!data && $this.line === null) return;

		//IF FROM OR TO IS NOT AN DOM-ELEMENT THEN DON'T PROCEED
		if (!(data.from instanceof Element) ||
			!(data.to instanceof Element) ||
			!data.container) {
			return;
		}

		this.connection = data;

		let from_rect = data.from.getBoundingClientRect();
		let to_rect = data.to.getBoundingClientRect();

		let from = {
			bottom: from_rect.bottom,
			left: from_rect.left,
			top: from_rect.top,
			right: from_rect.right,
			width: from_rect.right - from_rect.left,
			height: from_rect.bottom - from_rect.top
		};
		let to = {
			bottom: to_rect.bottom,
			left: to_rect.left,
			right: to_rect.right,
			top: to_rect.top,
			width: to_rect.right - to_rect.left,
			height: to_rect.bottom - to_rect.top
		};

		if (this.line) {
			this.line.remove();
			this.line = null;
		}

		let dimension = this.#detect_position(from, to);

		let _line = this.draw(dimension);

		_line.appendTo(data.container);

		this.line = _line;

		_line.show();

		this.#detect_click();

		return _line;
	};

	#is_on_line(evt) {
		let on_line = false;

		if (evt.offsetY < this.detection_margin) {
			if (parseFloat(this.line.css('border-top-width')) !== 0) {
				on_line = true;
			}
		} else if (evt.offsetY > (this.line.height() - this.detection_margin)) {
			if (parseFloat(this.line.css('border-bottom-width')) !== 0) {
				on_line = true;
			}
		} else if (evt.offsetX < this.detection_margin) {
			if (parseFloat(this.line.css('border-left-width')) !== 0) {
				on_line = true;
			}
		} else if (evt.offsetX > (this.line.width() - this.detection_margin)) {
			if (parseFloat(this.line.css('border-right-width')) !== 0) {
				on_line = true;
			}
		}

		return on_line;
	}

	#detect_click() {
		this.line
			.on('mousemove', this, evt => {
				let on_line = evt.data.#is_on_line(evt);

				if (false === on_line) {
					if (evt.data.mouse_over === true) {
						evt.data.mouse_over = false;
						document.dispatchEvent(new CustomEvent(evt.data.options.event_prefix + 'connector-mouse-out', {
							detail: {
								connector: evt.data,
							}
						}));
					}
					return;
				}

				// If statement to ensure event only fires once
				if (evt.data.mouse_over === false) {
					evt.data.mouse_over = true;

					document.dispatchEvent(new CustomEvent(evt.data.options.event_prefix + 'connector-mouse-over', {
						detail: {
							connector: evt.data,
						}
					}));
				}
			})
			.on('mouseout mouseleave', this, evt => {
				if (evt.data.mouse_over === true) {
					document.dispatchEvent(new CustomEvent(evt.data.options.event_prefix + 'connector-mouse-out', {
						detail: {
							connector: evt.data,
						}
					}));

					evt.data.mouse_over = false;
				}
			})
			.on('click', this, function (evt) {
				let on_line = evt.data.#is_on_line(evt);

				if (false === on_line) {
					return;
				}

				document.dispatchEvent(new CustomEvent(evt.data.options.event_prefix + 'connector-clicked', {
					detail: {
						connector: evt.data,
					}
				}));
			});
	}

	#detect_position(from, to) {
		let dim = {
			top: 0,
			left: 0,
			width: 0,
			height: 0,
			direction: '',
			from: from,
			to: to,
			orientation: {
				left: function () {
					dim.direction = 'left';
					dim.width = Math.abs(from.left - to.right) - 4;
					dim.left = to.right;
					dim.top = Math.max(to.top, from.top) + (Math.min(from.bottom, to.bottom) - Math.max(to.top, from.top)) / 2;
				},

				right: function () {
					dim.direction = 'right';
					dim.width = Math.abs(to.left - from.right) - 4;
					dim.left = from.right;
					dim.top = Math.max(to.top, from.top) + (Math.min(from.bottom, to.bottom) - Math.max(to.top, from.top)) / 2;
				},

				up: function () {
					dim.direction = 'up';
					dim.height = Math.abs(from.top - to.bottom) - 4;
					dim.top = to.bottom + 4;
					dim.left = Math.max(from.left, to.left) + (Math.min(from.right, to.right) - Math.max(from.left, to.left)) / 2;
				},

				down: function () {
					dim.direction = 'down';
					dim.height = Math.abs(to.top - from.bottom) - 4;
					dim.top = from.bottom + 4;
					dim.left = Math.max(from.left, to.left) + (Math.min(from.right, to.right) - Math.max(from.left, to.left)) / 2;
				},

				left_to_right: function () {
					dim.direction = 'left-to-right';
					dim.width = Math.abs(to.right - from.right);

					if (from.right < to.left)
						dim.width -= to.width / 2;
					else
						dim.width /= 2;

					dim.height = (to.top - from.top) - from.height / 2;
					dim.top = from.top + from.height / 2 - 4;
					dim.left = from.right;
				},

				right_to_left: function () {
					dim.direction = 'right-to-left';
					dim.width = Math.abs(from.left - to.left - to.width / 2);
					dim.height = Math.abs(to.top - from.top) - from.height / 2;
					dim.left = from.left - dim.width;
					dim.top = to.top - dim.height - 4;
				},

				bottom_left_to_right: function () {
					dim.direction = 'bottom-left-to-right';
					dim.width = Math.abs(to.right - from.right - to.width / 2);
					dim.height = (from.bottom - to.bottom) - from.height / 2;
					dim.top = to.bottom + 4;
					dim.left = from.right;
				},

				bottom_right_to_left: function () {
					dim.direction = 'bottom-right-to-left';
					dim.width = Math.abs(from.left - to.left - to.width / 2);
					dim.height = from.bottom - to.bottom - from.height / 2;
					dim.left = from.left - dim.width;
					dim.top = to.bottom + 4;
				}
			}
		};

		//WIDTH
		dim.width = Math.abs(to.left - from.right);
		dim.left = from.right;
		dim.top = from.top;

		//ON LEFT SIDE
		if (from.right <= to.left && from.bottom >= to.top && from.top <= to.bottom) {
			dim.orientation.right();

			//ON RIGHT SIDE
		} else if (from.left >= to.right && from.bottom >= to.top && from.top <= to.bottom) {
			dim.orientation.left();

			//ON TOP SLIDING ACROSS
		} else if (from.bottom <= to.top && from.right <= to.left) {
			dim.orientation.left_to_right();
		} else if (from.bottom <= to.top && from.left >= to.right) {
			dim.orientation.right_to_left();
		} else if (from.bottom <= to.top && from.right >= to.left && from.left <= to.right) {
			dim.orientation.down();

			//AT BOTTOM SLIDING ACROSS
		} else if (from.top >= to.bottom && from.right <= to.left) {
			dim.orientation.bottom_left_to_right();
		} else if (from.top >= to.bottom && from.left >= to.right) {
			dim.orientation.bottom_right_to_left();
		} else if (from.top >= to.bottom && from.right >= to.left && from.left <= to.right) {
			dim.orientation.up();
		}

		return dim;
	}

	draw(dimension, style, highlight) {
		let line_width = null,
			line_color = null,
			arrow_size = null,
			direction = dimension.direction,
			_line = $('<div>');

		style = style || this.style;

		let arrow = $('<div>').addClass('arrow-head').appendTo(_line);

		if (highlight !== true) {
			_line.data('style', style);
		} else {
			style = _line.data('style') || this.style;
			_line = $this.line;
			arrow = _line.find('.arrow-head');
		}

		for (let css in style) {
			_line.css(css, style[css]);
		}

		line_color = highlight === true ? '#FF0000' : _line.css('border-color');
		line_width = parseFloat(style['border-width']);
		arrow_size = parseFloat(line_width) * 2;

		let offset = this.options.container.getBoundingClientRect();
		_line
			.addClass(this.base_class)
			.css({
				position: _line.css('position'),
				width: dimension.width + 'px',
				height: dimension.height + 'px',
				left: (dimension.left - offset.left + window.scrollX) + 'px',
				top: (dimension.top - offset.top + window.scrollY) + 'px',
				// left: dimension.left + 'px',
				// top: dimension.top + 'px',
				'border-color': line_color,
				// 'pointer-events': 'none'
			});

		arrow.css({
			'z-index': 0,
			position: _line.css('position'),
			'border-style': 'solid',
			width: 0,
			height: 0,
		});

		switch (direction) {
			case 'up':
				_line.css({
					'border-top-width': '0',
					'border-bottom-width': '0',
					'border-left-width': line_width + 'px',
					'border-right-width': '0',
					'border-top-left-radius': 0,
					'border-top-right-radius': 0,
					'border-bottom-right-radius': 0,
					'border-bottom-left-radius': 0,

				});
				arrow.css({
					left: -1.15 * arrow_size,
					top: (-1 * arrow_size / 2) + 'px',

					'border-color': 'transparent transparent ' + line_color + ' transparent',
					'border-width': '0 ' +
						arrow_size + 'px ' +
						arrow_size + 'px ' +
						arrow_size + 'px',
				});
				break;
			case 'down':
				_line.css({
					'border-top-width': '0',
					'border-bottom-width': '0',
					'border-left-width': line_width + 'px',
					'border-right-width': '0',
					'border-top-left-radius': 0,
					'border-top-right-radius': 0,
					'border-bottom-right-radius': 0,
					'border-bottom-left-radius': 0
				});
				arrow.css({
					left: -1.25 * arrow_size,
					bottom: (-1 * arrow_size / 2) + 'px',

					'border-color': line_color + ' transparent transparent transparent',
					'border-width': arrow_size + 'px ' +
						arrow_size + 'px ' +
						'0 ' +
						arrow_size + 'px',
				});
				break;
			case 'left':
				_line.css({
					'border-top-width': line_width + 'px',
					'border-bottom-width': '0',
					'border-left-width': '0',
					'border-right-width': '0',
					'border-top-left-radius': 0,
					'border-top-right-radius': 0,
					'border-bottom-right-radius': 0,
					'border-bottom-left-radius': 0
				});

				arrow.css({
					left: (-1 * arrow_size / 2) + 'px',

					top: -1.15 * arrow_size,
					'border-color': 'transparent ' + line_color + ' transparent transparent',
					'border-width': arrow_size + 'px ' +
						arrow_size + 'px ' +
						arrow_size + 'px ' +
						'0',
				});
				break;
			case 'right':
				_line.css({
					'border-top-width': line_width + 'px',
					'border-bottom-width': '0',
					'border-left-width': '0',
					'border-right-width': '0',
					'border-top-left-radius': 0,
					'border-top-right-radius': 0,
					'border-bottom-right-radius': 0,
					'border-bottom-left-radius': 0
				});

				arrow.css({
					right: (-1 * arrow_size / 2) + 'px',
					top: -1.25 * arrow_size,

					'border-color': 'transparent transparent transparent ' + line_color,
					'border-width': arrow_size + 'px ' +
						'0 ' +
						arrow_size + 'px ' +
						arrow_size + 'px',
				});
				break;

			case 'left-to-right':
				_line.css({
					'border-top-width': line_width + 'px',
					'border-bottom-width': '0',
					'border-left-width': '0',
					'border-right-width': line_width + 'px',
					'border-top-left-radius': 0,
					'border-bottom-right-radius': 0,
					'border-bottom-left-radius': 0
				});
				arrow.css({
					bottom: (-1 * arrow_size / 2) + 'px',
					right: -1.15 * arrow_size,

					'border-color': line_color + ' transparent transparent transparent',
					'border-width': arrow_size + 'px ' +
						arrow_size + 'px ' +
						'0 ' +
						arrow_size + 'px',
				});
				break;
			case 'right-to-left':
				_line.css({
					'border-top-width': line_width + 'px',
					'border-bottom-width': '0',
					'border-left-width': line_width + 'px',
					'border-right-width': '0',
					'border-top-right-radius': 0,
					'border-bottom-right-radius': 0,
					'border-bottom-left-radius': 0
				});
				arrow.css({
					bottom: (-1 * arrow_size / 2) + 'px',
					left: -1.15 * arrow_size,

					'border-color': line_color + ' transparent transparent transparent',
					'border-width': arrow_size + 'px ' +
						arrow_size + 'px ' +
						'0 ' +
						arrow_size + 'px',
				});
				break;
			case 'bottom-left-to-right':
				_line.css({
					'border-top-width': '0',
					'border-bottom-width': line_width + 'px',
					'border-left-width': '0',
					'border-right-width': line_width + 'px',
					'border-top-left-radius': 0,
					'border-top-right-radius': 0,
					'border-bottom-left-radius': 0
				});
				arrow.css({
					top: (-1 * arrow_size / 2) + 'px',
					right: -1.15 * arrow_size,
					'border-color': 'transparent transparent ' + line_color + ' transparent',
					'border-width': '0 ' +
						arrow_size + 'px ' +
						arrow_size + 'px ' +
						arrow_size + 'px',
				});
				break;
			case 'bottom-right-to-left':
				_line.css({
					'border-top-width': 0,
					'border-bottom-width': line_width + 'px',
					'border-left-width': line_width + 'px',
					'border-right-width': 0,
					'border-top-left-radius': 0,
					'border-top-right-radius': 0,
					'border-bottom-right-radius': 0,
				});
				arrow.css({
					top: (-1 * arrow_size / 2) + 'px',
					left: -1.15 * arrow_size,
					'border-color': 'transparent transparent ' + line_color + ' transparent',
					'border-width': '0 ' +
						arrow_size + 'px ' +
						arrow_size + 'px ' +
						arrow_size + 'px',
				});
				break;
			default:
				_line.css({
					'border-top-width': '0',
					'border-bottom-width': '0',
					'border-left-width': '0',
					'border-right-width': '0',
				});
				arrow.remove();
				break;
		}

		return _line;
	};
}