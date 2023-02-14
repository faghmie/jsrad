import ControlInterface from "../_base/ControlInterface.js"

export default class Audio extends ControlInterface {

	properties = {
		height: 50,
		width: 350,
		height_fixed: true,
		label: '',
	};

	ignore_properties = [
		'on-click',
		'label',
		'allow inline editor',
	];

	setDefault(value){
		this.value = value || this.value;
		this.format();
	}

	setValue(value) {
		this.value = value || this.value;

		this.format();
	}

	format(){
		super.format();

		this.ctrl.attr('src', this.value);
	}

	getControl() {
		this.ctrl = $(`
		<audio controls>
			Your browser does not support the audio element.
		</audio>
		`);

		return this.ctrl;
	}
}
