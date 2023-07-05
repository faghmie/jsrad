import App from "../../common/App.js";
import Button from "./Button.js";

export default class ButtonDataExport extends Button {

	ignore_properties = [
		'on-click',
		'name',
		'value',
		'allow inline editor',
	];

	is_data_aware = true;

    getControl() {
		this.ctrl = $(`<button class="btn btn-primary"></button>`);
		this.ctrl.on('click', this.save_to_disk.bind(this));

		return this.ctrl;
	}

    async save_to_disk() {
        this.read_records().then(function(data){
            console.log(data);
			if (!(data instanceof Array)){
				return App.notifyError('No data found');
			}

            let table = this.get_data_entity();

			this.send_to_disk(this.make_csv(data, table), table);
		}.bind(this));
    }

    make_csv(data, table){
        let csv = '',
            hdr = [];
        
        for(let col of table){
            hdr.push(col);
        }
        hdr = hdr.sort(function(a, b){
            return a.index - b.index;
        });

        hdr.forEach(col => {
            csv += `"${col.title}",`;
        });

        csv += '\n';
        
        data.forEach(row => {
            hdr.forEach(col => {
                csv += `"${row[col.title]||''}",`;
            });

            csv += '\n';
        });

        return csv;
    }

    send_to_disk(file_data, table){
        

        let blob = new Blob([file_data], {
            type: 'javascript/json'
        });

        saveAs(blob, table.title + '.csv');
    }

}
