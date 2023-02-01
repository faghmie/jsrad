import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";
import IconSelector from "../IconSelector.js";

export default class TextEntry extends BaseFormControl(ControlInterface) {

	style_to_exclude = ['border-width', 'border-color'];
	properties = {
		height: 35,
		width: 200,
		// height_fixed: true,
		label: 'Label',
		value: '',
		placeholder: 'start typing...',
		icon_position: 'left',
		icon: 'la la-pencil'

	};

	ignore_properties = [
		'when the user click go to....',
		'display name',
		'allow inline editor',
	];

	toObject() {
		let obj = super.toObject();

		delete obj.color_list;

		return obj;
	}

	get_settings() {
		let settings = super.get_settings();
		//PLACEHOLDER
		let placeholder = $(`<input type="text">`)
			.addClass('form-control')
			.val(this.placeholder)
			.on('input', function (evt) {
				evt.stopPropagation();
				this.placeholder = evt.target.value;
				this.format();
			}.bind(this));

		//ADD-ON TEXT
		let add_on_text = $("<input type='text'>")
			.addClass('form-control')
			.val(this.add_on_text)
			.on('input', function (evt) {
				evt.stopPropagation();
				this.add_on_text = evt.target.value;
				this.format();
			}.bind(this));

		//ICON POSITION
		let icon_position = $('<select></select>')
			.addClass('form-control')
			.append('<option>left</option>')
			.append('<option>right</option>');

		icon_position.on('change', function (evt) {
			this.icon_position = evt.target.value;
			this.format();
		}.bind(this));

		if (this.icon_position === 'left')
			icon_position.find('option').eq(0).attr('selected', 'selected');
		else
			icon_position.find('option').eq(1).attr('selected', 'selected');

		//ICONS
		let icon_select = $('<a>')
			.addClass('btn btn-sm btn-light')
			.html("<i class='la la-fw " + this.icon + "'>");

		if (false === this.use_icon)
			icon_select.html('No Icon');

		icon_select.on('click', this, function (evt) {
			new IconSelector({
				on_selected: function (icon_class, use_icon) {
					evt.data.icon = icon_class;
					evt.data.use_icon = use_icon;
					evt.data.format();
					if (true === use_icon) {
						icon_select.remove('i');
						icon_select.html("<i class='la la-fw " + icon_class + "'>");
					} else {
						icon_select.html('No Icon');
					}
				}
			}).open();
		});

		//CLEAR ON SHOW
		let clear_on_show = $("<input type='checkbox'>");
		if (this.clear_on_show === true)
			clear_on_show.attr("checked", "checked");

		clear_on_show.on("click", this, function (evt) {
			evt.data.clear_on_show = $(this).is(":checked");
		});

		return [...settings,
			['place-holder', placeholder],
			['add-on text', add_on_text],
			['icon', icon_select],
			['icon position', icon_position],
			['clear on show', clear_on_show],
		];
	}

	format() {
		super.format();

		if (typeof this.add_on_text !== 'string') this.add_on_text = '';
		if (typeof this.icon_position !== 'string') this.icon_position = 'left';
		if (typeof this.icon !== 'string') this.icon = '';
		if (typeof this.placeholder !== 'string') this.placeholder = this.label;


		this.ctrl.find('.icon').remove();
		this.ctrl.find('input').attr('placeholder', this.placeholder);

		let icon = null;
		this.use_icon = this.icon.length !== 0;
		if (this.use_icon === true) {
			icon = $(`<span class="icon la la-fw ${this.icon}">`);

		} else if (this.add_on_text !== '') {
			icon = $(`<span class="icon">${this.add_on_text}>`);
		}

		if (icon !== null) {
			if (this.icon_position === 'left')
				this.ctrl.find('input').before(icon);
			else
				this.ctrl.find('input').after(icon);
		}

		this.ctrl.show();
	}

	val(string) {
		if (typeof string === 'undefined')
			return this.ctrl.find('input').val();
		else {
			this.ctrl.find('input').val(string);
			this.ctrl.find('input').trigger('input');
		}
	}

	setName(string) {
		super.setName(string)
		this.label = this.name;
	}

	setDefault(txt){
		this.ctrl.find('input').val(txt);
	}

	setValue(string) {
		if (typeof (this.value) === 'string'){
			this.value = string;
		}

		this.val(typeof string !== 'undefined' ?
			string :
			typeof this.default_value === 'string' ?
			this.default_value :
			'');

		let $this = this;
		if (true === $this.clear_on_show)
			$this.val('');

		this.get_datasource(function (data_) {
			if (data_) {
				$this.val(data_[1]);
			}
		});
	}

	getControl() {
		super.getControl();
		this.ctrl.find('.control-group').append(`
			<span class="icon la la-pencil"></span>
			<input class="form-control">`);

		return this.ctrl;
	}
}
