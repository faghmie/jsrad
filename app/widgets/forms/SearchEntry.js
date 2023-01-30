import { BaseFormControl } from "./BaseFormControl.js";
import ControlInterface from "../_base/ControlInterface.js";

export default class SearchBox extends BaseFormControl(ControlInterface) {

	properties = {
		height: 35,
		width: 320,
		height_fixed: true,
	};

	ignore_properties = [
		'when the user click go to....',
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
		var obj = super.toObject();
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
		var settings = super.get_settings();

		//PLACEHOLDER
		var placeholder = $("<input type='text'>")
			.addClass('form-control')
			.val(this.placeholder || this.label);

		placeholder.on('keyup', function (evt) {
			evt.stopPropagation();
			this.placeholder = evt.target.value;
			this.format();
		}.bind(this));

		//CLEAR ON SHOW
		var clear_on_show = $("<input type='checkbox'>");
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

		var event = "click";
		var $this = this;

		if (false === this.in_run_mode) {
			this.ctrl.find(".search-submit").off(event);
			return;
		}

		if (this.datasource.entity === null) return;
		if (this.datasource.name === null) {
			this.setValue();
			return;
		}

		if (typeof App.datasources[this.datasource.name] === "undefined") {
			this.setValue();
			return;
		}

		if (typeof App.datasources[this.datasource.name] === "undefined" || typeof App.datasources[this.datasource.name].entities === "undefined") {
			this.setValue();
			return;
		}


		//RESET ANY PREVIOUS VALUE
		this._selected_key = null;
		this._selected_text = null;

		//BIND EVENTS FOR SEARCH
		this.ctrl.find(".search-submit").off(event).on(event, function (evt) {
			var ds = App.datasources[$this.datasource.name].entities[$this.datasource.entity];
			//IF THIS FIELD IS A FOREIGN KEY IN IT'S CURRENT DATA-SET THEN WE NEED TO SEARCH THE
			//REFERED DATASET
			var field = ds.fields[$this.datasource.value[0]];
			if (field && field.foreign_key) {
				//CHANGE THE DATA-SOURCE TO THE 
				ds = App.datasources[$this.datasource.name].entities[field.foreign_key.sql_table];
			}


			ds.showSearch(function (data) {

				for (var col in ds.fields) {
					var sel_field = ds.fields[col];
					if (sel_field.primary_key === true) {
						$this._selected_key = ds.message[sel_field.name];

						$this.ctrl.find(".search-input").val($this._selected_key);
					}
				}

				if ($this.datasource.value.length > 0) {
					$this._selected_text = ds.message[$this.datasource.value[0]];
					if (field && field.foreign_key)
						$this.ctrl.find(".search-input").val(ds.message[field.foreign_key.value]);
					else
						$this.ctrl.find(".search-input").val(ds.message[$this.datasource.value[0]]);
				}
			});
		});

		this.ctrl.find(".search-submit").off("focusout").on("focusout", function (evt) {
			if ($this._selected_text !== null) {

			}
		});
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
		this.ctrl.find('.control-group').append(`<input type="text" class="form-control">
			<span class="icon">
				<i class="la la-search"></i>
			</span>`);
		return this.ctrl;
	}
};