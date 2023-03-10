import ControlInterface from "../_base/ControlInterface.js";

export default class HeadingControl extends ControlInterface {

	properties = {
		height: 50,
		width: 200,
		label: 'Heading...',
		heading_list: ["h1", "h2", "h3", "h4", "h5", "h6"],
		heading_type: "h1"
	};

	ignore_properties = [
		//'on-click',
		// 'name',
		'value',
		'allow inline editor',
	];

	get_settings() {
		let types = $(`<select class="form-select form-control">`).append("<option>");

		this.heading_list.forEach(item => {
			let opt = $("<option>").text(item).appendTo(types);

			if (this.heading_type === item) opt.attr("selected", "selected");
		});

		types.on("change", function (evt) {
			this.heading_type = evt.target.value;
			this.format();
		}.bind(this));

		return [
			["heading", types]
		];
	}

	format() {
		super.format();

		this.ctrl.removeClass(this.heading_list.join(' '));
		this.ctrl.addClass(this.heading_type);

		this.ctrl
			.css({
				margin: 0
			})
			.text(this.label);
	}

	setValue(string) {
		if (typeof string !== 'undefined' &&
			string.trim().length > 0){
			this.label = string;
		} 
		
		this.format();
	}

	getControl() {
		this.ctrl = $("<p>");

		return this.ctrl;
	}
}