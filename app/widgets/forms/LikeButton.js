import ControlInterface from "../_base/ControlInterface.js";

export default class LikeButton extends ControlInterface {
	properties = {
		height: 25,
		width: 100,
		default_value: false,

		value: {
			type: 'btn btn-light',
			icon: 'la la-thumbs-o-up',
			icon_position: 'left',
			size: 'btn-sm',
			flat: true,
		}
	};

	style_to_exclude = ['border-width', 'border-color'];
	size_list = ['btn-lg', 'btn-md', 'btn-sm', 'btn-xs'];

	ignore_properties = [
		'when the user click go to....',
		'display name',
		'allow inline editor',
	];

	toObject() {
		var obj = super.toObject();

		delete obj.size_list;

		return obj;
	}

	get_settings() {
		if (typeof this.value !== 'object') this.value = Object.assign({}, this.properties);

		var $this = this;

		//ICON POSITION
		var icon_position = $("<select class='form-control input-sm'>")
			.append('<option>left</option>')
			.append('<option>right</option>');

		icon_position
			.on('change', this, function (evt) {
				evt.data.value.icon_position = $(this).val();
				evt.data.format();
			})
			.css({
				'width': '80px'
			});

		if (this.value.icon_position == 'right'){
			icon_position.find('option:eq(1)').attr('selected', 'selected');
		}

		//FLAT
		var is_flat = $("<input type='checkbox'>");
		if (this.value.flat === true)
			is_flat.attr('checked', 'checked');

		is_flat.on('click', this, function (evt) {
			evt.data.value.flat = $(this).is(':checked');
			evt.data.format();
		});

		//SIZE SELECTION
		var size_select = $("<select class='form-control'>");

		this.size_list.forEach(function (value) {
			var cls = value;
			var opt = $("<option value='" + cls + "'>")
				.text(cls)
				.appendTo(size_select);

			if (cls === $this.value.size) {
				opt.attr('selected', 'selected');
			}
		});

		size_select.on('change', this, function (evt) {
			evt.data.value.size = $(this).val();
			evt.data.format();
		});

		return [
			['icon position', icon_position],
			['size', size_select],
			['flat?', is_flat],
		];
	}

	format() {
		try {
			super.format();

			var html = this.label;
			var count = '';

			if (typeof this.value !== 'object') this.value = Object.assign({}, this.properties);

			if (typeof this.value.type !== 'string' || $.trim(this.value.type) === '') this.value.type = 'btn-light';
			if (typeof this.value.size !== 'string') this.value.size = 'btn-lg';
			if (typeof this.value.icon_position !== 'string') this.value.icon_position = 'left';
			if (typeof this.value.icon !== 'string') this.value.icon = '';
			if (typeof this.value.flat !== 'boolean') this.value.flat = false;


			this.ctrl
				.removeClass('btn-success')
				.removeClass(this.size_list.join(' '))
				.removeClass('btn-flat')
				.removeClass('btn-outline');

			if (this.value.outline === true && this.like_state === true)
				this.ctrl.addClass('btn-outline');

			if (this.value.flat === true)
				this.ctrl.addClass('btn-flat');

			var icon = "<i class='la la-thumbs-o-up m-2'></i>   ";
			if (this.like_state > 0) {
				icon = "<i class='la la-thumbs-up m-2'></i>   ";
			}

			if (this.value.icon_position === 'left')
				html = icon + html;
			else
				html = html + icon;

			this.ctrl.html(html + count);

			this.ctrl
				.addClass(this.value.type)
				.addClass(this.value.size + ' btn-wrap');


		} catch (err) {
			console.log(err);
		}
	}

	setValue(value) {
		super.setValue(value);
		if (typeof this.like_state === 'undefined') this.like_state = this.properties.default_value;
		//if (typeof this.value !== 'object') this.value = {};
		var $this = this;
		this.get_datasource(null, null, function (data_) {
			try {
				if (data_) {
					$this.like_state = data_[1];
				}

				if ($this.in_run_mode === false) $this.like_state = $this.default_value;

				$this.value.type = 'btn-light';
				if (isNaN(parseInt($this.like_state))) {
					$this.like_state = 0;
				}

				if ($this.like_state > 0)
					$this.value.type = 'btn-success';

				$this.format();
			} catch (err) {
				console.log(err);
			}
		});
	}

	setDefault(value) {
		this.setValue(value);
	}

	val(value) {
		this.setValue(value);
	}

	setLabel(string) {
		this.label = typeof string !== 'undefined' ? string : this.label;
		this.format();
	}

	getControl() {
		this.ctrl = $("<button type='button' class='btn btn-light' title='i like this' ></button>");

		return this.ctrl;
	}
}