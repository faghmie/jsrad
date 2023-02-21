import PropertyBase from "./PropertyBase.js";

export default class DocsProperties extends PropertyBase {

	attached_object = null;

	attach(obj) {
		let widget = $(`<div class="text-formater">`);
		this.attached_object = obj;
		
		widget.append(this.edit_description());
		widget.append(this.edit_behaviour());
		widget.append(this.edit_tooltip());

		return widget;
	}

	edit_description() {
		let prop = $(`<textarea class="form-control">`)
			.val(this.attached_object.description)
			.on('input', function (evt) {
				this.attached_object.description = evt.target.value;
			}.bind(this));

		return $(`
			<div class="control-with-label">
				<label>description</label>
			</div>`).append(prop);
	}

	edit_tooltip() {
		let prop = $(`<textarea class="form-control">`)
			.val(this.attached_object.tooltip)
			.on('input', function (evt) {
				this.attached_object.setToolTip(evt.target.value);
			}.bind(this));

		return $(`
			<div class="control-with-label">
				<label>tooltip</label>
			</div>`).append(prop);
	}

	edit_behaviour() {
		let prop = $(`<textarea class="form-control">`)
			.val(this.attached_object.behaviour)
			.on('input', function (evt) {
				this.attached_object.behaviour = evt.target.value;
			}.bind(this));

		return $(`
			<div class="control-with-label">
				<label>behavior</label>
			</div>`).append(prop);
	}
}
