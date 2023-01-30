import SqlTable from "./SqlTable.js";

export default class TableProperties {

	/** @type {SqlTable | undefined} */
	ctrl = null;

	constructor(table) {
		this.ctrl = table;
	}

	Show() {
		let widget = $(`<div class="text-formater">`);

		widget.append(this.#evt_setName(this.ctrl));

		widget.append(this.#evt_set_comment(this.ctrl));

		this.ctrl.add_panel('Table Properties', widget);

		return widget;
	}

	#evt_setName(obj) {
		let prop = $(`<input class="form-control" type="text" placeholder="title" >`)
			.val(obj.title)
			.on('input', evt => {
				obj.setName(evt.target.value);
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		let div = $(`<div class="control-with-label"><label>name</label></div>`).append(prop);

		return div;
	}

	#evt_set_comment(obj) {
		let prop = $(`<textarea class="form-control" placeholder="comment"></textarea>`)
			.val(obj.comment)
			.on('input', evt => {
				obj.setComment(evt.target.value);
				document.dispatchEvent(new CustomEvent('ide-is-dirty'));
			});

		let div = $(`<div class="control-with-label"><label>comment</label></div>`).append(prop);
		return div;
	}
}
