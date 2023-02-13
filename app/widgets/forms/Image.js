import ControlInterface from "../_base/ControlInterface.js"

export default class Image extends ControlInterface {

	properties = {
		height: 150,
		width: 150,
		label_align: 'hide',
		label_show: false,
		shape: '',
		image: './images/logo.png'
	};

	ignore_properties = [
		//'on-click',
		'display name',
		'allow inline editor',
	];

	get_settings() {
		let $this = this;
		let img_shape = $('<select>').addClass('form-control');

		img_shape.append('<option></option>');
		img_shape.append('<option>img-rounded</option>');
		img_shape.append('<option>img-circle</option>');
		img_shape.append('<option>img-thumbnail</option>');

		img_shape.find('option').each(function () {
			if ($(this).val() === $this.shape) $(this).attr('selected', 'selected');
		});

		img_shape.change(function (evt) {
			this.shape = evt.target.value;
			this.format();
		}.bind(this));

		//IMAGE
		let image = $('<input>').val(this.image);

		image.on('input', function (evt) {
			if (evt.which !== 13) return;

			this.image = evt.target.value;
			this.format();
		}.bind(this));

		return [
			['shape', img_shape],
			['image', image]
		];
	}

	format() {
		super.format();
		
		let img = this.ctrl;

		this.ctrl.removeClass('img-rounded img-circle img-thumbnail');

		if (this.image.indexOf('class:') === 0) {
			let cls = this.image.split('class:');
			img.addClass(cls[1]);
			img.attr('src', '');
			img.attr('alt', this.image);
		} else {
			img
				.attr('src', this.image)
				.attr('alt', this.image)
				.show();
		}

		this.ctrl.addClass(this.shape);
	}

	setDefault(img){
		this.image = img;
		this.format();
	}

	setValue(value) {
		this.image = typeof value !== 'undefined' ? value : this.image;

		let $this = this;

	}

	getControl() {
		this.ctrl = $('<img class="img-rounded">');

		return this.ctrl;
	}
}
