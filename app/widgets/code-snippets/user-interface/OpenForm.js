import BaseActivity from "../BaseActivity.js"

export default class OpenFormActivity extends BaseActivity {
	
	get_settings(){
		let settings = super.get_settings();
		
		return [...settings, ['form to open', this.get_link_form(false)]] ;
	}
	
	execute(previous_step){
		let form = this.getForm().designer.Forms.Get(this.linked_form),
			$this = this;
		
		if (form){
			form.show(function(){
				$this.message = Object.assign($this.message, form.message);
				$this.next();
				
			}, this.message);
		} else {
			console.log('could not find form ? ' + this.linked_form);
		}
		
	}
}
