import BaseActivity from '../BaseActivity.js';

export default class StartActivity extends BaseActivity {
	style = {
		'background-color': '#339933',
		'text-align': 'center',
		'color': '#FFFFFF',
		'font-size': '14px',
		'font-weight': 'bold',
		'border-style': 'solid',
		'border-color': '#d7e3bc',
		'border-width': '2px',
		'vertical-align': 'middle'
	};

	__start__ = true;

	properties = {
		height: 50,
		width: 50,
		label: 'start',
	};

	format() {
		super.format();

		this.ctrl.children().remove();

		this.ctrl.css({
			'border-radius': '50%',
		});

		this.addCaption();

	}
}
