import SqlRelation from "./SqlRelation.js";
import SqlTable from "./SqlTable.js";

export default class TableManager{
	
	owner	= null;
	adding 	= false;
	tables	= {};
	relations = [];

	constructor(container, owner){
		this.container = container;
		this.owner = owner;

		this.#listen_for_events();
	}

	[Symbol.iterator]() {
        let index = -1;
        let data = Object.keys(this.tables);
        let $this = this;

        return {
            next: () => ({
                value: $this.tables[data[++index]],
                done: !(index in data)
            })
        };
    }

	#listen_for_events(){
		let $this = this;

		document.addEventListener('foreign-key-add', function(evt){
			$this.AddRelation(evt.detail.node_from, evt.detail.node_to);
		});

		document.addEventListener('foreign-key-remove', function(evt){
			$this.RemoveRelation(evt.detail.foreign_key);
		});

		document.addEventListener('table-remove', function(evt){
			$this.removeTable(evt.detail);
		});

		document.addEventListener('table-row-removed', function(evt){
			let field = evt.detail.field;

			let remove_list	= [];
			$this.relations.forEach((item, index) => {
				if (item.node_from == field || item.node_to == field){
					item.hide();
					remove_list.push(index);
				} else {
					item.show();
				}
			});

			remove_list.forEach(val =>{
				$this.relations.splice(val, 1);
			});
		});

		document.addEventListener('table-redraw', function(evt){
			$this.relations.forEach((item, index) => {
				item.hide();

				if (item.node_from.table.visible && item.node_to.table.visible){
					item.show();
				}
			});
		});

		document.addEventListener('table-send-to-front', function(evt){
			$this.SendTableToFront(evt.detail.table);
		});
	}

	click(e) { // * finish adding new table * /
		let newtable = false,
			t = null;
		
		if (this.adding) {
			this.adding = false;
			this.container.removeClass("adding");

			let rect = e.target.getBoundingClientRect();
			let offset = this.container.offset();
			
			let x = e.clientX - rect.left + offset.left;
			let y = e.clientY - rect.top + offset.top;
			let tbl_name = "new_table";
			
			let index = 0;

			//Get Unique Table Name
			while(true){
				let found = false;
				for(t in this.tables){
					let table = this.tables[t];
					if (table.name === tbl_name){
						found = true;
					}
				}
				if (true === found){
					index++;
					tbl_name = "new_table" + index;
				} else {
					break;
				}
			}

			newtable = this.addTable(tbl_name, x, y);

			let col_opts = {nullable:false, auto_increment:true, show_on_editor:false, show_on_grid:true, show_on_import:false};
			newtable.addRow("id",col_opts);
			newtable.addRow("name",{ai:false});

		} else {
			for(t in this.tables){
				this.tables[t].deselect();
			}
		}
	}

	preAdd(e) {
		if (this.adding) {
			this.adding = false;
		} else {
			this.adding = true;
			this.container.addClass("adding");
		}
	}

	clear(e) {
		App.Confirm("Are your sure you want to remove all the tables" + " ?", this.ClearTables);
	}

	ClearTables(){
		for (let t in this.tables) {
			this.tables[t].destroy();
		}

		this.dom.container.children().remove();

		document.dispatchEvent(new CustomEvent('ide-is-dirty'));
	}

	addTable(name, left, top, uuid) {
		let t = new SqlTable(this, name, left, top);

		if (typeof uuid !== 'undefined') t.uuid = uuid;

		this.tables[t.uuid] = t;
		this.container.append(t.dom.container);

		document.dispatchEvent(new CustomEvent('table-added', {
			detail:{
				table: t
			}
		}));

		document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		
		return t;
	}
	
	removeTable(table){
		App.Confirm('Are you sure you want to remove table: ' + ' [' + table.title + '] ?', function () {
			delete this.tables[table.uuid];
			table.destroy();
			document.dispatchEvent(new CustomEvent('ide-is-dirty'));
		}.bind(this));

	}

	Sync() {
		for (let t in this.tables) {
			let table = this.tables[t];
			document.dispatchEvent(new CustomEvent('table-redraw',{
				detail: {
					table: table
				}
			}));
		}
	}

	SendTableToFront(table){
		let z = 1;
		for(let key in this.tables){
			let item = this.tables[key];
			if (parseFloat(item.dom.container.css('z-index')) > z)
				z = parseFloat(item.dom.container.css('z-index'));
		}

		let z_dropped = z - 1;

		for(let key in this.tables){
			let item = this.tables[key];
			if (parseFloat(item.dom.container.css('z-index')) === z){
				item.dom.container.css('z-index', z_dropped);
			}
		}

		if (isNaN(parseInt(z)) || parseInt(z) <= 0) z = 1;
		
		table.dom.container.css({'z-index':z});
	}

	AddRelation(node_from, node_to) {
		let r = new SqlRelation(this.container.parent(), node_from, node_to);
		this.relations.push(r);
		if (node_from) node_from.redraw();
		if (node_to) node_to.redraw();

		document.dispatchEvent(new CustomEvent('ide-is-dirty'));

		return this.relations[this.relations.length - 1];
	}

	RemoveRelation(r) {
		for (let idx = 0; idx < this.relations.length; idx++) {
			let rel = this.relations[idx];
			if (rel.node_from === r.node_from && rel.node_to === r.node_to) {
				console.log('found relation to remove')
				rel.hide();
				this.relations.splice(idx, 1);
				r.node_to.foreign_key = null;
			} else {
				rel.show();
			}
		}

		document.dispatchEvent(new CustomEvent('ide-is-dirty'));
	}
}
