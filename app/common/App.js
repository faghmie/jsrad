export default class App{

	static MessageTypes = {
		INFO: 0,
		WARNING: 1,
		ERROR: 2
	}

	static is_web_app = (location.href.indexOf('file:///') === 0);

	static is_mobile = (/Mobi|Android/i.test(navigator.userAgent));

	static Confirm (msg, on_done, ok_button, cancel_button) {
		if (typeof ok_button !== 'string') ok_button = 'Yes';
		if (typeof cancel_button !== 'string') cancel_button = 'No';

		let dlg = $(`
			<div class="confirm-card">
				<div class="message"></div>
				<div>
				<div class="button-list">
					<button class="default"><i class="la la-check"></i>${ok_button}</button>
					<button class="cancel"><i class="la la-times"></i>${cancel_button}</button>
				</div>
				</div>
			</div>`);
		ok_button = dlg.find('.default');
		cancel_button = dlg.find('.cancel');

		dlg.find('.message').html(msg);

		ok_button.on('click', dlg, function (evt) {
			if (typeof on_done === 'function') on_done();
			card.close();
		});

		cancel_button.on('click', dlg, function (evt) {
			card.close();
		});

		let card = new Dialog(dlg, {
			no_header: true,
		});

		return card;
	}

	static notifyError (message) {
		this.notify({
			message: message,
			type: this.MessageTypes.ERROR
		})
	}

	static notifyInfo (message) {
		this.notify({
			message: message,
			type: this.MessageTypes.INFO
		})
	}

	static notifyWarning (message) {
		this.notify({
			message: message,
			type: this.MessageTypes.WARNING
		})
	}

	static notify (defaults) {

		let options = Object.assign(
			{
				message: '',
				type: App.MessageTypes.INFO,
				auto_close: true,
				timeout: 5000,
			},
			defaults
		);

		let message_div = $(`
				<div class="snackbar">
					<div class="side-bar"></div>
					<div class="content">${options.message}</div>
				</div>`)
			.appendTo('body');

		switch (options.type) {
			case this.MessageTypes.ERROR:
				message_div.find('.side-bar').addClass('error');
				message_div.addClass('error');
				break;
			case this.MessageTypes.WARNING:
				message_div.find('.side-bar').addClass('warning');
				message_div.addClass('warning');
				break;

			case this.MessageTypes.INFO:
				message_div.find('.side-bar').addClass('info');
				message_div.addClass('info');
				break;
		}

		message_div.on('click', function (evt) {
			message_div.hide(() => {
				message_div.remove();
			});
		});

		if (options.auto_close === true) {
			setTimeout(function () {
				message_div.hide(() => {
					message_div.remove();
				});
			}, options.timeout);
		}

		message_div.addClass('show');

		return message_div;
	}
}
