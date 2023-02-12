export const ControlDatasource = (superclass) => class extends superclass {

	insert_record(record){
		return new Promise((resolve, reject)=>{
			let ds = this.datamodel.TableManager.tables;
			if (!ds) return resolve();
	
			let table = ds[this.entity];
			if (!table) return resolve();
	
			table.data ||= [];
	
			table.data.push(record);
			resolve();	
		});
	}

	read_records(){
		return new Promise((resolve, reject)=>{
			let ds = this.datamodel.TableManager.tables;
			if (!ds) return [];
	
			let table = ds[this.entity];
			if (!table) return [];
	
			table.data ||= [];
			let result = table.data.filter(this.apply_filter.bind(this));
			
			result = this.apply_field_selector(result)
				.map(item => {
					let rec = {};
					for (let uuid in item) {
						rec[table.fields[uuid].title] = item[uuid];
					}
	
					return rec;
				});
	
			console.log(result);
			
			result = this.transform_result(result);

			resolve(result);
		});
	}

	remove_records(){
		return new Promise((resolve, reject)=>{
			let ds = this.datamodel.TableManager.tables;
			if (!ds) return resolve();
	
			let table = ds[this.entity];
			if (!table) return resolve();
	
			table.data ||= [];
	
			let list_to_remove = [];
	
			table.data.forEach(function (item, index) {
				if (this.apply_filter(item)) {
					list_to_remove.push(index);
				}
			}.bind(this));
	
			console.log(list_to_remove);
	
			list_to_remove.forEach(function(idx){
				table.data.splice(idx, 1);
			}.bind(this));

			resolve();
		});
	}

	update_records(record){
		return new Promise((resolve, reject)=>{
			let ds = this.datamodel.TableManager.tables;
			if (!ds) return resolve();
	
			let table = ds[this.entity];
			if (!table) return resolve();
	
			table.data ||= [];
	
			let list_to_update = [];
	
			table.data.forEach(function (item, index) {
				if (this.apply_filter(item)) {
					list_to_update.push(index);
				}
			}.bind(this));
	
			console.log(record)
			console.log(list_to_update);
	
			list_to_update.forEach(function (idx) {
				for (let uuid in record) {
					table.data[idx][uuid] = record[uuid];
				}
			}.bind(this));

			resolve();
		});
	}

	apply_field_selector(records){
		this.data_fields ||= [];

		if (this.data_fields.length == 0){
			return records;
		}

		let result = records.map(function(item){
			let rec = {};
			this.data_fields.forEach(uuid=>{
				rec[uuid] = item[uuid];
			})

			return rec;
		}.bind(this))

		return result;
	}

	transform_result(records){
		if (this.data_single_field === true){
			return this.transform_to_single_value(records);
		} else if (this.data_list_field === true) {
			return this.transform_to_list(records);
		}
	}
	
	transform_to_single_value(records){
		let result = null;

		if (records.length > 0){
			for (let key in records[0]) {
				result = records[0][key];
			}
		}
		
		return result;
	}

	
	transform_to_list(records){
		let result = [];

		records.forEach(item =>{
			for (let key in item) {
				result.push(item[key]);
				break;
			}
		});
		
		return result;
	}

	apply_filter(record) {
		let result = true;
		// let filter_types = ['equals', 'not equal', 'is empty', 'contains'];

		for (let uuid in this.filter) {
			let rule = this.filter[uuid];

			if (rule.value === undefined) {
				//Skip empty filter records
				continue;
			}

			switch (rule.type) {
				case 'not equal':
					if (record[uuid] == rule.value) {
						result = false;
					}
					break;
				case 'is empty':
					if (record[uuid] == undefined ||
						record[uuid] == null ||
						(record[uuid] || '').trim().length > 0) {

						result = false;
					}
					break;

				case 'contains':
					if (!record[uuid].toString().includes(rule.value)) {
						result = false;
					}
					break;
				default:
					if (record[uuid] != rule.value) {
						result = false;
					}
					break;
			}
		}

		return result;
	}
    
}