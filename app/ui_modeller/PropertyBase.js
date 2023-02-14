export default class PropertyBase {
	_append_item(text, control, widget) {
		let ignore_properties = [];

		// if (this.ctrl) ignore_properties = this.ctrl.ignore_properties;
		if (!this.ctrl){
			return;
		}

		console.log(text, this.ctrl.ignore_properties)

		if (this.ctrl.ignore_properties instanceof Array) {
			if (this.ctrl.ignore_properties.indexOf(text) !== -1) {
				logger.log('IGNORE > ' + text);
				return;
			}
		}

		control = $(control).addClass('form-control');
		let div = $(`<div class="control-with-label"><label>${text.trim()}</label></div>`)
			.append(control)
			.appendTo(widget);
	}
}
