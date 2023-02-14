import ControlInterface from "../_base/ControlInterface.js"

export default class Video extends ControlInterface {

	properties = {
		height: 250,
		width: 350,
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
		<video controls>
			Your browser does not support the audio element.
		</video>
		`);

		return this.ctrl;
	}
}
