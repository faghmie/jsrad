import BaseActivity from "../BaseActivity.js";

export default class ParallelActivity extends BaseActivity {
	
	get_settings(){
		let alt_step = this.create_next_step_selector();

		alt_step.find('option').each(function (key, item) {
			let opt = $(item);
			opt.removeAttr('selected');
			if (item.value == this.alternate_next) {
				opt.attr('selected', 'selected');
			}
		}.bind(this));


		alt_step.off('change').on('change', function (evt) {
			this.remove_connection();

			if (this.next_steps.indexOf(this.alternate_next) !== -1) {
				let idx = this.next_steps.indexOf(this.alternate_next);
				this.next_steps.splice(idx, 1);
			}

			this.next_steps.push(evt.target.value);

			this.alternate_next = evt.target.value;

			this.create_connection();
		}.bind(this));

			
		return [
			...super.get_settings(),
			['parallel step', alt_step]
		];
	}
	
	execute(){
		this.next_steps.forEach(function(step){
			setTimeout(function(){
				this.next(step)
			}.bind(this), 0);
		}.bind(this));
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

		let marker = $('<span>').addClass('my-caption');
		marker
			.text('P')
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
