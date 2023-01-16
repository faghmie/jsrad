import ControlInterface from "../_base/ControlInterface.js";

export default class BaseShape extends ControlInterface {
	edit_field = 'label';

	style = {
		'background-color': '#ffff66',
		'border-width': 2,
		'border-style': 'solid',
		'border-color': '#ffcc00',
		'text-align': 'center',
		'font-weight': 'bold',
		'font-family': 'arial',
		'font-size': '14px',
		'color': '#ffcc00',
		'vertical-align': 'middle',
	};

	properties = {
		height: 60,
		width: 100,

	};


	ignore_properties = [
		'required',
		'make it a card',
		'name',
		'value',
		'tab index',
		'id',
		'allow inline editor',
	];

	setLabel(string) {
		this.label = string;
		this.#redraw();
	}

	setControlStyle() {
		this.#redraw()
	}

	resize(width, height) {
		super.resize(width, height);

		this.ctrl[0].width = this.width;
		this.ctrl[0].height = this.height;

		this.#redraw();
	}

	format() {
		super.format();
		this.#redraw()
	}

	getControl() {
		this.ctrl = $('<canvas>');

		return this.ctrl;
	}

	#redraw() {
		this.ctrl.children().remove();

		// if (typeof this.create_shape === 'function')    
		this.create_shape();

		var canvas = this.ctrl[0];
		var ctx = canvas.getContext('2d');

		ctx.beginPath();

		ctx.fillStyle = this.style['color'];
		ctx.font = `${this.style['font-size']} ${this.style['font-family']}`;
		ctx.textAlign = this.style['text-align'];
		ctx.textBaseline = this.style['vertical-align'];
		var x = 0;
		var y = 0;
		if (this.style['text-align'] == 'center') {
			x = canvas.width / 2;
		} else if (this.style['text-align'] == 'right') {
			x = canvas.width;
		}

		if (this.style['vertical-align'] == 'middle') {
			y = canvas.height / 2;
		} else if (this.style['vertical-align'] == 'bottom') {
			y = canvas.height;
		}

		ctx.fillText(this.label, x, y);
		ctx.fill();
		ctx.stroke();

		this.dom.container.css({
			overflow: 'visible'
		});
	}
}


var base_shape = {
	edit_field: 'label',

	style: {
		'background-color': '#ffff66',
		'border-width': 2,
		'border-style': 'solid',
		'border-color': '#ffcc00',
		'text-align': 'center',
		'font-weight': 'bold',
		'color': '#ffcc00',
		'vertical-align': 'middle',
	},

	style_19_01_09: {
		'background-color': '#fbd5b5',
		'border-width': 2,
		'border-style': 'solid',
		'border-color': '#fac08f',
		'text-align': 'center',
		'color': '#e36c09',
		'vertical-align': 'middle',
	},

	style_2018: {
		'background-color': '#ebf1dd',
		'border-width': 2,
		'border-style': 'solid',
		'border-color': '#BFBFBF',
		'text-align': 'center',
		'color': '#595959',
		'vertical-align': 'middle',
	},
	properties: {
		height: 60,
		width: 100,
	},


	ignore_properties: [
		'required',
		'make it a card',
		'name',
		'value',
		'tab index',
		'id',
		'allow inline editor',
	],

	_setLabel: function () {
		this.find('.caption').html(this.label);
	},

	_setControlStyle: function () {
		this._format();
	},

	_resize: function () {
		this._format();
	},

	_format: function () {
		this.ctrl.children().remove();

		if (typeof this.create_shape === 'function')
			this.create_shape();

		this.dom.container.css({
			overflow: 'visible'
		});

		this.ctrl.css({
			background: 'transparent',
			border: '0',
			overflow: 'visible',
			width: this.width,
			height: this.height
		});

		var caption = $('<span>').addClass('caption').appendTo(this.ctrl);
		var deg = -1 * this.rotation;

		caption
			.text(this.label)
			.css({
				padding: '5px',
				display: 'table-cell',
				overflow: 'auto',
				'z-index': 15,
				position: 'relative',
				top: 0,
				left: 0,
				'vertical-align': this.style['vertical-align'],

				'text-align': this.style['text-align'],
				'text-decoration': this.style['text-decoration'],
				'color': this.style.color,
				'background': 'transparent',
				'width': this.width,
				'height': this.height,
				'word-wrap': 'break-word',

				'-ms-transform': 'rotate(' + deg + 'deg)',
				'-webkit-transform': 'rotate(' + deg + 'deg)',
				'-moz-transform': 'rotate(' + deg + 'deg)',
				'-o-transform': 'rotate(' + deg + 'deg)',
				'transform': 'rotate(' + deg + 'deg)'
			});
	},

};