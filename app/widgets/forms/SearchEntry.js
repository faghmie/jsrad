import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class SearchBox extends BaseFormControl(ControlInterface) {

	properties = {
		height: 35,
		width: 320,
		height_fixed: true,
	};

	ignore_properties = [
		'on-click',
		'name',
		'allow inline editor',
		'value',
		'tab index',
		'rotation',
		'opacity',
		'display name',
	];

	_selected_key = null;
	_selected_text = null;

	toObject() {
		let obj = super.toObject();
		delete obj._selected_key;
		delete obj._selected_text;

		return obj;
	}

	val(value) {
		if (this._selected_key !== null)
			return this._selected_key;
		else
			return this.ctrl.find(".search-input").val();
	}

	get_settings() {
		let settings = super.get_settings();

		//PLACEHOLDER
		let placeholder = $("<input type='text'>")
			.addClass('form-control')
			.val(this.placeholder || this.label);

		placeholder.on('keyup', function (evt) {
			evt.stopPropagation();
			this.placeholder = evt.target.value;
			this.format();
		}.bind(this));

		//CLEAR ON SHOW
		let clear_on_show = $("<input type='checkbox'>");
		if (this.clear_on_show === true)
			clear_on_show.attr("checked", "checked");

		clear_on_show.on("click", this, function (evt) {
			evt.data.clear_on_show = $(this).is(":checked");
		});

		return [...settings,
			['place-holder', placeholder],
			['clear on show', clear_on_show],
		];
	}

	change_mode(in_run_mode) {
		super.change_mode(in_run_mode);

		let event = "click";

		if (false === this.in_run_mode) {
			this.ctrl.find(".search-submit").off(event);
			return;
		}

		if (this.datasource.entity === null) return;
		if (this.datasource.name === null) {
			this.setValue();
			return;
		}

		//RESET ANY PREVIOUS VALUE
		this._selected_key = null;
		this._selected_text = null;
	}

	format() {
		super.format();

		if (typeof this.placeholder !== "string"){
			this.placeholder = this.label;
		}

		this.ctrl.find("input").attr("placeholder", this.placeholder);

	}

	getControl() {
		super.getControl();
		this.ctrl.find('.control-group').append(`<input type="search" class="form-control">
			<span class="icon">
				<i class="la la-search"></i>
			</span>`);
		return this.ctrl;
	}
};