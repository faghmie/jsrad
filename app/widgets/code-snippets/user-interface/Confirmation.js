import BaseActivity from "../BaseActivity.js";

export default class ConfirmMessageActivity extends BaseActivity {
	get_settings() {
		let settings = super.get_settings();

		//ATTRIBUTES
		let msg = this.create_attribute('message');

		let alt_step = this.create_next_step_selector();

		alt_step.find('option').each(function(key, item){
			let opt = $(item);
			opt.removeAttr('selected');
			if (item.value == this.alternate_next){
				opt.attr('selected', 'selected');
			}
		}.bind(this));


		alt_step.off('change').on('change', function (evt) {
			this.remove_connection();
			
			if (this.next_steps.indexOf(this.alternate_next) !== -1){
				let idx = this.next_steps.indexOf(this.alternate_next);
				this.next_steps.splice(idx, 1);
			}
			
			this.next_steps.push(evt.target.value);
			
			this.alternate_next = evt.target.value;

			this.create_connection();
		}.bind(this));

		return [...settings,
			['alternate next', alt_step],
			...msg,
		];
	}

	execute() {
		let msg = this.get_attribute('message');
		// let title = this.get_attribute('title');
		let card = null;

		let div = $(`<div class="activity-confirmation">
						<div class="body-content"></div>
						<div class="button-list">
							<button class="ok-button">Ok</button>
							<button class="cancel-button">Cancel</button>
						</div>
					</div>`);
		
		div.find('.body-content').html(msg);

		card = open_card(div, {
			no_header: true,
		});

		div.find('.ok-button').on('click', card, function (evt) {
			evt.data.close();
			this.next();
		}.bind(this));

		div.find('.cancel-button').on('click', card, function (evt) {
			evt.data.close();
			this.next(this.alternate_next);
		}.bind(this));

	}
}
