import IconSelector from "../IconSelector.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class IconControl extends ControlInterface {

	properties = {
		height: 50,
		width: 50,
		value: {
			icon: 'fa la-bell',
			icon_size: 'la-3x'
		}
	}

	ignore_properties = [
		//'when the user click go to....',
		'make it a card',
		'display name',
		'name',
		'allow inline editor',
	];

	get_settings() {
		if (typeof this.value !== 'object') this.value = {};

		var $this = this;

		//ICONS
		var icon_select = $('<a>')
			.addClass('btn btn-lg btn-flat btn-light')
			.html("<i class='la la-fw " + this.value.icon + "'>");

		icon_select.on('click', function () {
			var icons = new IconSelector({
				on_selected: function (icon_class, use_icon) {
					$this.value.icon = icon_class;
					$this.format();
					icon_select.remove('i');
					icon_select.html("<i class='la la-fw " + icon_class + "'>");
				}
			}).open();
		});

		//OUTLINE
		var can_spin = $("<input type='checkbox'>");
		if (this.value.can_spin === true)
			can_spin.attr('checked', 'checked');

		can_spin.on('click', this, function (evt) {
			evt.data.value.can_spin = $(this).is(':checked');
			evt.data.format();
		});

		return [
			['icon', icon_select],
			['can spin', can_spin]
		];
	}

	resize (width, height){
		super.resize(width, height)
	    this.format();
	}

	format() {
		// super.format();
		if (typeof this.value !== 'object') this.value = {};
		if (typeof this.value.icon !== 'string') this.value.icon = 'la la-bell';
		this.aspect_ratio = 1;
		this.ctrl.attr('class', 'main-control la');

		this.ctrl.addClass(this.value.icon + ' la ');
		this.ctrl.css({
			'font-size': parseFloat(this.width) //*0.8
		});

		if (true === this.value.can_spin)
			this.ctrl.addClass('la-spin');
	}

	setControlStyle (css){
		super.setControlStyle(css);
	    this.format();
	}

	getControl() {
		this.ctrl = $('<div>').addClass('la la-fw la-bell');

		return this.ctrl;
	}
}