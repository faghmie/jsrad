export const BaseFormControl = (superclass) => class BaseFormControl extends superclass {
	label_alignment = 'right';
	label_position = 'left';

	get_settings() {
		//LABEL ALIGNMENT
		var label_alignment = $('<select>')
			.addClass('form-control')
			.append('<option>left</option>')
			.append('<option>center</option>')
			.append('<option>right</option>');

		label_alignment.on('change', function (evt) {
			this.label_alignment = evt.target.value;
			this.format();
		}.bind(this));

		if (this.label_alignment === 'center') {
			label_alignment.find('option').eq(1).attr('selected', 'selected');
		} else if (this.label_alignment === 'right') {
			label_alignment.find('option').eq(2).attr('selected', 'selected');
		} else {
			label_alignment.find('option').eq(0).attr('selected', 'selected');
		}

		//LABEL POSITION
		var label_position = $('<select>')
			.addClass('form-control')
			.append('<option>top</option>')
			.append('<option>bottom</option>')
			.append('<option>left</option>')
			.append('<option>right</option>');

		label_position.on('change', function (evt) {
			this.label_position = evt.target.value;
			this.format();
		}.bind(this));

		if (this.label_position === 'top') {
			label_position.find('option').eq(0).attr('selected', 'selected');
		} else if (this.label_position === 'bottom') {
			label_position.find('option').eq(1).attr('selected', 'selected');
		} else if (this.label_position === 'left') {
			label_position.find('option').eq(2).attr('selected', 'selected');
		} else {
			label_position.find('option').eq(3).attr('selected', 'selected');
		}

		

		return [
			['label alignment', label_alignment],
			['label position', label_position]
		];
	}

	format() {
		super.format();

		var label = this.ctrl.find('label');

		if (this.label.trim().length == 0) {
			label.hide();
		} else {
			label.show();
			label.text(this.label);
		}

		label.removeClass('left right center');
		if (this.label_alignment == 'left') {
			label.addClass('left');
		} else if (this.label_alignment == 'right') {
			label.addClass('right');
		} else if (this.label_alignment == 'center') {
			label.addClass('center');
		}

		this.ctrl.removeClass('top bottom left right');
		this.ctrl.addClass(this.label_position);
	}

	getControl() {
		this.ctrl = $(`
			<div class="labelled-control">
				<label>Label</label>
				<div class="control-group"></div>
			</div>`);

		return this.ctrl;
	}
};