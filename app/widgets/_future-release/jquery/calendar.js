var control_calendar = class Calendar extends ControlInterface {
	static type = 'calendar';
	static control_label = 'Calendar';
	static control_category = null; //'Special';
	static control_thumbnail = 'class:la la-calendar';

	properties = {
		height: 280,
		width: 230,
		resizable: false
	};

	ignore_properties = [
		'when the user click go to....',
		'display name',
		'required',
		'make it a card',
		//'name',
		'value',
		'tab index',
		'id',
		'allow inline editor',
	];

	val(string) {
		if (typeof string === 'undefined') {
			var picker = $(this.ctrl).data("DateTimePicker");
			if (picker) {
				return picker.date(); //moment(date).format('dd MMMM yyyy');
			} else {
				return null;
			}
		} else {
			this.ctrl.datepicker('update', string);
		}
	}

	getControl() {
		this.ctrl = $('<div>');
		this.ctrl.datetimepicker({
			format: 'LL',
			inline: true,
			showTodayButton: true,
		});

		return this.ctrl;
	}
}