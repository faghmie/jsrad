import BaseShape from "./BaseShape.js";

export default class BoxControlV2 extends BaseShape {
	create_shape() {
		var activity = $('<div>').appendTo(this.ctrl);

		activity.css({
			background: this.style['background-color'],
			width: this.ctrl.css('width'),
			height: this.ctrl.css('height'),
			opacity: parseFloat(this.opacity),
			'border-style': this.style['border-style'],
			'border-width': parseFloat(this.style['border-width']) + 'px',
			'border-color': this.style['border-color'],
			'border-top-right-radius': '30%',
			'border-bottom-left-radius': '30%',
			position: 'absolute',
			left: '0',
			top: '0',
			'z-index': 0
		});
	}

	getControl() {
		this.ctrl = $('<div>');

		this.style['background-color'] = '#dbe5f1';
		this.style['border-width'] = '0';
		this.style['font-size'] = '36px';
		this.style['font-weight'] = 'bold';

		return this.ctrl;
	}
}