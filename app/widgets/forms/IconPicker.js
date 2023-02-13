import IconSelector from "../IconSelector.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class IconControl extends ControlInterface {

	properties = {
		height: 50,
		width: 50,
		
			icon: 'fa la-bell',
			icon_size: 'la-3x'
		
	}

	ignore_properties = [
		//'on-click',
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
			.html("<i class='la la-fw " + this.icon + "'>");

		icon_select.on('click', function () {
			var icons = new IconSelector({
				on_selected: function (icon_class, use_icon) {
					$this.icon = icon_class;
					$this.format();
					icon_select.remove('i');
					icon_select.html("<i class='la la-fw " + icon_class + "'>");
				}
			}).open();
		});

		//OUTLINE
		var can_spin = $("<input type='checkbox'>");
		if (this.can_spin === true)
			can_spin.attr('checked', 'checked');

		can_spin.on('click', this, function (evt) {
			evt.data.can_spin = $(this).is(':checked');
			evt.data.format();
		});

		return [
			['icon', icon_select],
			['can spin', can_spin]
		];
	}

	resize (width, height){
		super.resize(width, height)
	    this.draw();
	}

	format() {
		super.format();
		this.draw();
	}
	
	setControlStyle (css){
		super.setControlStyle(css);
	    this.draw();
	}

	draw(){
		if (typeof this.icon !== 'string') this.icon = 'la la-bell';
		this.aspect_ratio = 1;
		this.ctrl.attr('class', 'main-control la');
	
		this.ctrl.addClass(this.icon + ' la ');
		this.ctrl.css({
			'font-size': parseFloat(this.width) //*0.8
		});
	
		if (true === this.can_spin){
			this.ctrl.addClass('la-spin');
		}
	}
	
	getControl() {
		this.ctrl = $('<div>').addClass('la la-fw la-bell');

		return this.ctrl;
	}
}