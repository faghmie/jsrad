import SqlBase from './SqlBase.js';
import line_connection from '../widgets/connections.js';

export default class SqlRelation extends SqlBase {

	connection 	= null;
	node_from	= null;
	node_to		= null;
	container	= null;

	object_type = 'RELATION';

	constructor(container, row1, row2){
		super();

		this.container = container;
		this.node_from = row1,
		this.node_to = row2;

		var found = false;
	
		if (!this.node_from) return;
	
		if (typeof this.node_to.hide_connector === 'undefined') this.node_to.hide_connector = false;
		if (typeof this.node_from.table.visible === 'undefined') this.node_from.table.visible = true;
		if (typeof this.node_to.table.visible === 'undefined') this.node_to.table.visible = true;
	
		if (this.node_to.foreign_key) {
			//CHECK IF WE ALREADY HAVE THIS CONNECTION
			found = (
				this.node_to.foreign_key.sql_table 	!== this.node_from.table.uuid &&
				this.node_to.foreign_key.key 		!== this.node_from.uuid
			);
		}
			
		if (found === true) {
			this.show();
			return;
		}
	
		this.node_to.foreign_key = {
			sql_table: this.node_from.table.uuid,
			key: this.node_from.uuid,
			value: this.node_from.uuid
		};

		this.#build();
	}

	#build() {

		if (this.node_from.table.visible === false || this.node_to.table.visible === false) {
			return;
		}

		if (this.node_to.hide_connector === true) {
			return;
		}

		this.connection = new line_connection({
			from: this.node_from.table.dom.container[0],
			to: this.node_to.table.dom.container[0],
			container: this.container[0]
		});
	}

	hide() {
		this.connection.destroy();
	};

	destroy() {
		this.connection.destroy();

		delete this.node_to.foreign_key;
	};

	show() {
		this.connection.connect();
	}
}