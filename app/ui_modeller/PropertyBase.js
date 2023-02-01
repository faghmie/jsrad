export default class PropertyBase {
	_append_item(text, control, attribute, widget){
			let ignore_properties = [];
			
			if (this.attached_object) ignore_properties = this.attached_object.ignore_properties;
			
			if (ignore_properties instanceof Array){
				if (ignore_properties.indexOf(text) !== -1) {
					//logger.log('IGNORE > '+ text);
					return;
				}
			}
			
			control = $(control).addClass('form-control');
			let div = $(`<div class="control-with-label"><label>${text.trim()}</label></div>`)
				.append(control)
				.appendTo(widget);
	}
}
