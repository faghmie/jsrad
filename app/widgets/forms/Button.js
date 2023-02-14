import IconSelector from "../IconSelector.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class Button extends ControlInterface {
	properties = {
		height: 45,
		width: 120,
		label: 'button',
		label_align: 'hide',
		edit_field: 'label',
		hover: false,

		type: 'btn btn-primary',
		use_icon: false,
		check_button: false,
		icon: '',
		icon_position: 'left',
		data: null,
	};

	style = {
		'text-align': 'center',
	};
	style_to_exclude = ['border-width', 'border-color'];
	color_list = ['btn-light', 'btn-primary', 'btn-info', 'btn-success', 'btn-warning', 'btn-danger', 'btn-link'];
	size_list = ['btn-lg', 'btn-md', 'btn-sm', 'btn-xs'];

	ignore_properties = [
		//'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	toObject() {
		let obj = super.toObject();
		delete obj.color_list;
		delete obj.size_list;

		return obj;
	}

	get_settings() {
		if (typeof this.value !== 'object') this.value = {};

		let $this = this;

		//ICON POSITION
		let icon_position = $('<select>')
			.addClass('form-control')
			.append('<option>left</option>')
			.append('<option>right</option>');

		icon_position
			.on('change', this, function (evt) {
				evt.data.icon_position = $(this).val();
				evt.data.format();
			})
			.css({
				'width': '60px',
				'padding-left': '5px'
			});

		//ICONS
		let icon_select = $('<button>')
			.html("<i class='la la-fw" + this.icon + "'>");
			// .css('width', '40px');

		if (false === this.use_icon)
			icon_select.html('No Icon');

		icon_select.on('click', function () {
			new IconSelector({
				on_selected: function (icon_class, use_icon) {
					$this.icon = icon_class;
					$this.use_icon = use_icon;
					$this.format();
					if (true === use_icon) {
						icon_select.remove('i');
						icon_select.html("<i class='la la-fw " + icon_class + "'>");
					} else {
						icon_select.html('No Icon');
					}
				}
			}).open();
		});

		let icon = $(`
			<div class="inline-controls">
				<div class="icon"></div>
				<div class="icon-pos"></div>
			</div>`);
		icon.find('.icon').append(icon_select);
		icon.find('.icon-pos').append(icon_position);

		//OUTLINE
		let is_outline = $("<input type='checkbox'>");
		if (this.outline === true)
			is_outline.attr('checked', 'checked');

		is_outline.on('click', this, function (evt) {
			evt.data.outline = $(this).is(':checked');
			evt.data.format();
		});

		//COLOR SELECTION
		let color_select = $('<select>').addClass('form-control');

		$(this.color_list).each(function (key, value) {
			let cls = value;
			let opt = $("<option value='" + cls + "'></option>")
				.append("<span><i class='" + cls + "'></i> " + cls.replace(/btn-/g, '') + '</span>')
				.appendTo(color_select);

			if (cls === $this.button_type) {
				opt.attr('selected', 'selected');
			}
		});

		color_select.on('change', this, function (evt) {
			evt.data.button_type = $(this).val();
			evt.data.format();
		});

		//COLOR SELECTION
		let size_select = $('<select>').addClass('form-control');

		$(this.size_list).each(function (key, value) {
			let cls = value;
			let opt = $("<option value='" + cls + "'>")
				.text(cls)
				.appendTo(size_select);

			if (cls === $this.size) {
				opt.attr('selected', 'selected');
			}
		});

		size_select.on('change', this, function (evt) {
			evt.data.size = $(this).val();
			evt.data.format();
		});

		return [
			['theme', color_select],
			['icon', icon],
			['size', size_select],
			['outline?', is_outline],
		];
	}

	format() {
		super.format();
		let html = this.label;
		if (typeof this.value !== 'object') this.value = {};

		if (typeof this.button_type !== 'string' || $.trim(this.button_type) === '') this.button_type = 'btn-light';
		if (typeof this.size !== 'string') this.size = 'btn-lg';
		if (typeof this.icon_position !== 'string') this.icon_position = 'left';
		if (typeof this.icon !== 'string') this.icon = '';

		this.ctrl.removeClass(this.color_list.join(' '));
		this.ctrl
			.addClass(this.button_type);
		this.ctrl.removeClass(this.size_list.join(' '));
		this.ctrl
			.addClass(this.size + ' btn-wrap');

		this.ctrl.removeClass('btn-outline');
		if (this.outline === true)
			this.ctrl.addClass('btn-outline');

		if (this.use_icon === true && this.icon !== '') {
			let icon = "<i class='" + this.icon + "'";

			if (this.icon_position === 'left')
				html = icon + " style='padding-right:10px;'></i> " + html;
			else
				html = html + icon + " style='padding-left:10px;'></i> ";
		}

		this.ctrl.html(html);
	}

	setValue(value) {
		this.val(value);
	}

	val(value) {
		if (value !== undefined)
			this.data = value;
		else
			return this.data;
	}

	setLabel(string) {
		this.label = typeof string !== 'undefined' ? string : this.label;
		this.ctrl.html(this.label);
		this.format();
	}

	getControl() {
		this.ctrl = $("<button type='button' class='btn btn-light'></button>");
		// IControl.extend(this, data_aware_base);
		return this.ctrl;
	}
}
