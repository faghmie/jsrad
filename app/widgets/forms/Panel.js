import ControlInterface from "../_base/ControlInterface.js";

export default class PanelControl extends ControlInterface {
	properties = {
		height: 150,
		width: 150,
		label: 'Sample Panel',
		value: {
			button_group: false
		}
	};

	style_to_exclude = ['border-width', 'border-color'];

	panel_types = ['well', 'bg-light', 'bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-dark'];

	ignore_properties = [
		'when the user click go to....',
		'name',
		'value',
		'allow inline editor',
	];

	get_settings() {
		var $this = this;
		if (typeof this.value !== 'object' || this.value === null) this.value = {};

		var type_list = $('<select>').addClass('form-control');
		type_list.append('<option>');
		for (var i = 0; i < this.panel_types.length; i++) {
			type_list.append('<option>' + this.panel_types[i] + '</option>');
		}

		type_list.find('option').each(function () {
			var opt = $(this);
			if (opt.val() === $this.value.panel_type) opt.attr('selected', 'selected');
		});

		type_list.on('change', function () {
			$this.value.panel_type = $(this).val();
			$this.format();
		});

		//ICONS
		var icon_select = $("<a class='btn btn-lg btn-light'>").html("<i class='fa fa-fw " + this.value.icon + "'>");

		if (false === this.value.use_icon)
			icon_select.html("No Icon");

		icon_select.on("click", this, function (evt) {
			var $this = evt.data;
			var icons = new icon_selector({
				on_selected: function (icon_class, use_icon) {
					$this.value.icon = icon_class;
					$this.value.use_icon = use_icon;
					$this.format();
					if (true === use_icon) {
						icon_select.remove("i");
						icon_select.html("<i class='fa fa-fw " + icon_class + "'>");
					} else {
						icon_select.html("No Icon");
					}
				}
			}).open();
		});

		return [
			['card-type', type_list],
			['icon', icon_select],
		];
	}

	setLabel(label) {
		this.format();
	}

	format() {
		super.format();
		if (typeof this.value !== 'object' || this.value === null) this.value = {};
		if (typeof this.value !== 'object') this.value = {};
		if (typeof this.value.button_group !== 'string') this.value.button_group = '';
		if (typeof this.value.panel_type !== 'string') this.value.panel_type = 'bg-primary';
		if (typeof this.value.background !== 'string') this.value.background = '';

		var header = this.ctrl.find('.card-header');

		this.ctrl.addClass('card border');
		header.show();
		if (this.value.panel_type.length === 0) {
			// this.ctrl.removeClass('panel');
			header.hide();
		}


		header.removeClass(this.panel_types.join(' '));
		header.removeClass('text-dark text-white');
		header.addClass(this.value.panel_type);
		header.addClass(this.value.panel_type == 'bg-light' ? 'text-dark' : 'text-white');
		this.ctrl.addClass(this.value.panel_type.replace('bg-', 'border-'));

		this.ctrl.find('.card-text').html(this.label);
		this.ctrl.find('.card-icon').children().remove();
		if (this.value.use_icon === true) {
			this.ctrl.find('.card-icon')
				.css('padding-right', '10px')
				.append('<i class="fa fa-lg fa-fw ' + this.value.icon + '" ></i>');
		}

	}

	getControl() {
		this.ctrl = $('<div class="card">' +
			'<div class="card-header">' +
			'<span class="card-icon"></span>' +
			'<span class="card-text">Header</span>' +
			'</div>' +
			'<div class="card-body"></div>' +
			'</div>');

		return this.ctrl;
	}
};