import Form from "../../form.js";
import BaseActivity from "../BaseActivity.js";

export default class OpenSubProcess extends BaseActivity {
	get_settings(){
			return [
				...super.get_settings(),
				['go to sub-process', this.get_link_form()]
			];
	}
	
	execute(prev_node){
		var designer = this.getForm().designer;

		/** @type {Form | undefined} */
		var form = designer.Forms.Get(this.linked_form);
		if (form){
			form.show(function(){
					for(var key in form.message){
						this.message[key] = form.message[key];
					}

					//Sub-process is complete so now continue in current process
					this.next();
				}.bind(this), 
				this.message);
		} else {
			logger.log('could not find sub-process ? ' + this.value.form);
			this.next();
		}
	}
}
