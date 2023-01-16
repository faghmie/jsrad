export default class TableProperties {

	ctrl = null;

	constructor(table) {
		this.ctrl = table;
	}

	Show() {
		var widget = $(`<div class="popup-toolbox-panel">`);

		widget.append(this.#evt_setName(this.ctrl));

		widget.append(this.#evt_set_comment(this.ctrl));

		open_card(widget, {
			title: this.ctrl.title,
			'width': '350px',
			'min-width': '350px',
			'max-width': '350px',
		});

		return widget;
	}

	#evt_setName(obj) {
		var prop = $(`<input class="form-control" type="text" placeholder="title" />`)
			.val(obj.title)
			.on('input', evt => {
				obj.setName(evt.target.value);
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		var div = $(`<div class="control-with-label"><label>name</label></div>`).append(prop);

		return div;
	}

	#evt_set_comment(obj) {
		var prop = $(`<textarea class="form-control" placeholder="comment"/>`)
			.val(obj.comment)
			.on('input', evt => {
				obj.setComment(evt.target.value);
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		var div = $(`<div class="control-with-label"><label>comment</label></div>`).append(prop);
		return div;
	}
}
