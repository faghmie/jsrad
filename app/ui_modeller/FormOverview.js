// import Form from "../widgets/form";

export default class FormOverview {
	Forms = null;

	constructor(forms_manager) {
		this.Forms = forms_manager;
	}

	#get_workspace() {
		$('.form-overview').remove();

		let overview = $('<div>')
			.addClass('form-overview')
			.appendTo('body')
			.hide();

		let btn_add = $(`<div class="form-overview-item" title="add new form">
							<i class="la la-fw la-plus"></i> new form
						</div>`).appendTo(overview);


		let btn_clone = $(`<div class="form-overview-item" title="clone the current form">
							<i class="la la-fw la-clone"></i> clone current
						</div>`)
			.appendTo(overview);

		btn_add.on('click', this, async function (evt) {
			await evt.data.Forms.addForm();
			overview.hide();
			overview.remove();
		});

		btn_clone.on('click', this, evt => {
			evt.data.Forms.cloneForm();
			overview.remove();
		});

		return overview;
	}


	refresh() {
		let $this = this;

		let overview = this.#get_workspace();

		for (let form of this.Forms) {
			let li = $(`<div class="form-overview-item">
						<div class="form-title">
							<span>${form.label}</span>
							<i class="ui-icon-close la la-times"></i>
						</div>
						<img src="preview form"></img>
					</div>`).appendTo(overview);

			li.data('form', form);

			li.find('img').attr('src', form.preview);

			if (!form.preview) {
				li.find('img')
					.css('opacity', '0.05')
					.attr('alt', 'no preview image')
					.attr('src', 'data:image/png;base64,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');
			}

			li.on('click', form, function (evt) {
				document.dispatchEvent(new CustomEvent('ui-form-show', {
					detail: evt.data
				}));

				overview.remove();
			});
			li.find('.ui-icon-close').on('click', {
				item: li,
				form: form
			}, function (evt) {
				let data = evt.data;
				evt.stopPropagation();
				App.Confirm('Are you sure you want remove the form?', 'Remove Form', function () {
					$this.Forms.removeForm(data.form);
					data.item.remove();
				});
			});
		}

		return overview;
	}

	get_buttons() {
		let actions = $(`<div class="actions">`);

		let btn_add = $(`<button title="add new form">
							<i class="la la-fw la-plus"></i> new form
						</button>`).appendTo(actions);


		let btn_clone = $(`<button title="clone the current form">
							<i class="la la-fw la-clone"></i> clone current
						</button>`)
			.appendTo(actions);

		btn_add.on('click', this, async function (evt) {
			await evt.data.Forms.addForm();
		});

		btn_clone.on('click', this, evt => {
			evt.data.Forms.cloneForm();
		});

		return actions;

	}

	get() {
		let $this = this;

		/** @type{Form | undefined} */
		let form = null;

		let overview = $(`<div class="form-overview toolbox">`);

		/** @type{Form | undefined} */
		let active_form = this.Forms.getActiveForm();

		overview.append(this.get_buttons());

		for (form of this.Forms) {
			let prefix = `<i class="la la-wpforms"></i>`;
			if (form.is_a_process === true) {
				prefix = `<i class="la la-code"></i>`;
				// prefix = '[P] ';
			}

			let li = $(`<div class="form-overview-item">
							<span>${prefix}${form.label}</span>
							<i class="ui-icon-close la la-times"></i>
					</div>`).appendTo(overview);

			if (form.uuid == active_form.uuid) {
				li.addClass('active');
			}

			li.data('form', form);

			li.on('click', form, function (evt) {
				document.dispatchEvent(new CustomEvent('ui-form-show', {
					detail: evt.data
				}));
			});
			li.find('.ui-icon-close').on('click', {
				item: li,
				form: form
			}, function (evt) {
				let data = evt.data;
				evt.stopPropagation();
				App.Confirm('Are you sure you want remove the form?', 'Remove Form', function () {
					$this.Forms.removeForm(data.form);
					data.item.remove();
				});
			});
		}

		return overview;
	}

	show() {
		let overview = this.refresh();

		this.#update_form_preview().then(() => {
			overview.show('blind');
		})
			.catch(msg => {
				console.log(msg);
			});
	}

	#update_form_preview() {
		return new Promise((resolve, reject) => {

			let form = this.Forms.getActiveForm();

			if (!form) {
				return resolve();
				// return reject('No Active Form');
			}

			let options = {
				allowTaint: true,
				useCORS: true,
				height: 50,
				width: 30
			};

			html2canvas(form.ctrl[0], options).then((canvas) => {
				try {
					form.preview = canvas.toDataURL();
					resolve();
				} catch (e) {
					App.MessageError('Failed to update preview of form');
					console.log(e);
				}
			});
		});
	}
}