import Dialog from "../../../common/Dialog.js";
import BaseActivity from "../BaseActivity.js";

export default class ShowMessageActivity extends BaseActivity {
	get_settings() {
		let settings = super.get_settings();

		//ATTRIBUTES
		return [...settings,
			...this.create_attribute('message'),
		];
	}

	execute() {
		let msg = this.get_attribute('message');
		
		let card = null;

		let div = $(`<div class="activity-confirmation">
						<div class="body-content center"></div>
						<div class="button-list center">
							<button class="ok-button">Ok</button>
						</div>
					</div>`);
					
		div.find('.body-content').html(JSON.stringify(msg));

		card = new Dialog(div, {
			no_header: true,
		});

		div.find('.ok-button').on('click', card, function (evt) {
			evt.data.close();
			this.next();
		}.bind(this));
	}
}
