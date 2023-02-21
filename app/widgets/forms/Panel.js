import IconSelector from "../IconSelector.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class PanelControl extends ControlInterface {
	properties = {
		height: 150,
		width: 150,
		label: 'Sample Panel',
	};

	style_to_exclude = ['border-width', 'border-color'];

	panel_types = ['well', 'bg-light', 'bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-dark'];

	ignore_properties = [
		'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	get_settings() {
		let $this = this;

		let type_list = $('<select>').addClass('form-control');
		type_list.append('<option>');
		for (let i = 0; i < this.panel_types.length; i++) {
			type_list.append('<option>' + this.panel_types[i] + '</option>');
		}

		type_list.find('option').each(function () {
			if (this.value === $this.panel_type) this.setAttribute('selected', 'selected');
		});

		type_list.on('change', function (evt) {
			this.panel_type = evt.target.value;
			this.format();
		}.bind(this));

		//ICONS
		let icon_select = $("<a class='btn btn-lg btn-light'>").html("<i class='la la-fw " + this.icon + "'>");

		if (false === this.use_icon)
			icon_select.html("No Icon");

		icon_select.on("click", this, function (evt) {
			let $this = evt.data;
			new IconSelector({
				on_selected: function (icon_class, use_icon) {
					$this.icon = icon_class;
					$this.use_icon = use_icon;
					$this.format();
					if (true === use_icon) {
						icon_select.remove("i");
						icon_select.html("<i class='la la-fw " + icon_class + "'>");
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
		super.setLabel(label);
		this.format();
	}

	format() {
		super.format();

		if (typeof this.button_group !== 'string') this.button_group = '';
		if (typeof this.panel_type !== 'string') this.panel_type = 'bg-primary';
		if (typeof this.background !== 'string') this.background = '';

		let header = this.ctrl.find('.card-header');

		this.ctrl.addClass('card border');
		header.show();
		if (this.panel_type.length === 0) {
			// this.ctrl.removeClass('panel');
			header.hide();
		}


		header.removeClass(this.panel_types.join(' '));
		header.removeClass('text-dark text-white');
		header.addClass(this.panel_type);
		header.addClass(this.panel_type == 'bg-light' ? 'text-dark' : 'text-white');
		this.ctrl.addClass(this.panel_type.replace('bg-', 'border-'));

		this.ctrl.find('.card-text').html(this.label);
		this.ctrl.find('.card-icon').children().remove();
		if (this.use_icon === true) {
			this.ctrl.find('.card-icon')
				.css('padding-right', '10px')
				.append('<i class="la la-lg la-fw ' + this.icon + '" ></i>');
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