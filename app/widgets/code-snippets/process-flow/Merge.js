import Form from "../../form.js";
import BaseActivity from "../BaseActivity.js";

export default class MergeActivity extends BaseActivity {
	already_moved = false;
	merge_points = {};

	//Use this method to build the activities to wait for
	change_mode(in_run_mode) {
		super.change_mode(in_run_mode);

		this.merge_points = {};

		/** @type {Form | undefined} */
		let form = this.getForm();

		/** @type {BaseActivity | undefined} */
		let ctrl = null;

		for (let key in form.controls) {
			if (this.uuid == key) continue;

			ctrl = form.controls[key];

			if (ctrl.next_steps.indexOf(this.uuid) != -1) {
				this.merge_points[key] = false;
			}
		}
	}

	execute(prev_node) {
		if (!prev_node) return;

		this.merge_points[prev_node.uuid] = true;

		//MERGE THE MESSAGE FROM THE PREVIOUS NODE WITH THAT OF THIS ACTIVITY
		for (var attr in prev_node.message_map) {
			if (attr === '@types') {
				continue;
			}

			this.message[prev_node.message_map[attr]] = prev_node.message[prev_node.message_map[attr]];
		}

		var can_move = true;
		for (var m in this.merge_points) {
			if (this.merge_points[m] !== true) {
				can_move = false;
			}
		}

		if (true === can_move && false === this.already_moved) {
			this.next();
			this.already_moved = true;
		} else if (false === can_move) {
			this.already_moved = false;
		}
	}

	setControlStyle(css) {
		this.draw();
	}

	resize(width, height) {
		super.resize(width, height);
		this.draw();
	}

	format() {
		super.format();

		this.dom.container.css({
			overflow: 'visible',
		});

		this.ctrl.removeClass('activity');

		this.ctrl.css({
			'text-align': 'center',
			// 'vertical-align': 'middle',
			position: 'relative',
			'background-color': '#FFFFFF',
			'border-width': 0,
			overflow: 'visible',
			display: 'table-cell'
		});

		this.draw();
	}

	draw() {
		this.ctrl.children().remove();

		this.dom.container.find('.my-caption').remove();

		let size = Math.min(this.width, this.height);
		this.height_fixed = false;

		let diamond = $('<div>').addClass('diamond');
		diamond.css({
			background: this.style['background-color'],
			width: size * 0.75,
			height: size * 0.75,
			opacity: parseFloat(this.style['opacity']),
			'border-style': this.style['border-style'],
			'border-width': parseFloat(this.style['border-width']) + 'px',
			'border-color': this.style['border-color'],
			'-ms-transform': 'rotateZ(-45deg)',
			'-webkit-transform': 'rotateZ(-45deg)',
			'-moz-transform': 'rotateZ(-45deg)',
			'transform': 'rotateZ(-45deg)',
			'-webkit-transform-origin': 'center',
			position: 'absolute',
			left: size * 0.125,
			top: size * 0.125,
			'z-index': 0
		});

		this.aspect_ratio = 1;
		if (this.dom.container.is('.ui-resizable')) {
			this.dom.container.resizable('option', 'aspectRatio', this.aspect_ratio);
		}

		let marker = $('<span>').addClass('my-caption');
		marker
			.text('M')
			.css({
				'z-index': '15',
				position: 'absolute',
				'vertical-align': 'middle',
				'margin-top': 'auto',
				left: 0,
				'max-height': size,
				width: size,
				background: 'transparent',
				color: '#FFFFFF',
				'line-height': `${Math.floor(size * 0.9)}px`,
				'font-size': `${size*0.6}px`,
				'font-weight': 'bold',
				'text-align': 'center'
			});

		this.ctrl.append(diamond).append(marker);
	}
}
