import PropertyBase from "./PropertyBase.js";

export default class DocsProperties extends PropertyBase {

	attached_object		= null;

	attach(obj){
		var widget = $(`<div class="text-formater">`);
		this.attached_object = obj;
		var s = [
				["tooltip", "<textarea  id='tooltip' style='width:90%'></textarea>"],
				["description", "<textarea  id='description' style='width:90%'></textarea>"],
				["behaviour", "<textarea  id='behaviour' style='width:90%'></textarea>"],
			];
		
		for(var index = 0; index < s.length; index++){
			this._append_item(s[index][0], s[index][1], null, widget);
		}
		
		widget.find("#description").val(obj.description);
		widget.find("#behaviour").val(obj.behaviour);
		widget.find("#tooltip").val(obj.tooltip);
		
		widget.on("keyup", "#tooltip", obj, function(evt){
			evt.stopPropagation();
			evt.data.setToolTip(evt.target.value);
		});
		
		widget.on("keyup", "#description", obj, function(evt){
			evt.stopPropagation();
			evt.data.description = evt.target.value;
		});
		
		widget.on("keyup", "#behaviour", obj, function(evt){
			evt.stopPropagation();
			evt.data.behaviour = evt.target.value;
		});
		
		return widget;
	}
}
