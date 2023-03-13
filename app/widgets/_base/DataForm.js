import App from "../../common/App.js";
import Dialog from "../../common/Dialog.js";
import SqlBase from "../../data_modeller/SqlBase.js";
import SqlTable from "../../data_modeller/SqlTable.js";
import ControlInterface from "./ControlInterface.js";

export default class DataForm {

    card = null;
    record = null;

    /** @type{SqlBase|undefined} */
    entity = null;

    /** @type{ControlInterface|undefined} */
    ctrl = null;

    /**
     *
     *
     * @param {SqlTable} entity
     * @param {string} row_system_id
     * @memberof DataFrom
     */
    Open(ctrl, row_system_id) {
        let entity = ctrl.get_data_entity();
        let data = entity.data.filter(row => row.__system_id__ == row_system_id);

        if (!data) {
            return App.notifyError('No data to show');
        }

        this.entity = entity;
        this.row_system_id = row_system_id;
        this.record = data[0] || {};
        this.ctrl = ctrl;

        this.MakeForm();
    }

    MakeForm() {
        let div = $(`<div class="data-form">`);

        for (let col of this.entity) {
            div.append(`<label>${col.title}</label>`);
            div.append(`<input class="form-control data-field" value="${this.record[col.uuid]||''}" col-uuid="${col.uuid}">`);
        }

        this.card = new Dialog(div, {
            action_list: this.#create_buttons()
        });
    }

    #create_buttons() {
        let btn_list = $(`<div class="action-list">`);

        btn_list.append(this.#btn_insert());
        btn_list.append(this.#btn_update());
        btn_list.append(this.#btn_remove());

        return btn_list;
    }

    #btn_insert() {
        let btn = $(`<i class="btn-action la la-plus"  title="new record">`)
            .on('click', function () {
                let data = this.#form_to_record();
                this.ctrl.insert_record(data).then((new_record) => {
                    App.notifyInfo('Record created');
                    this.ctrl.setValue();
                    this.row_system_id = new_record.__system_id__;
                });
            }.bind(this));

        return btn;
    }

    #btn_update() {
        let btn = $(`<i class="btn-action la la-save"  title="update record">`)
            .on('click', function () {
                let data = this.#form_to_record();
                if (!this.row_system_id){
                    return App.notifyWarning('No record to update');
                }
                this.#update_record(data).then(() => {
                    App.notifyInfo('Record updated');
                    this.ctrl.setValue();
                });
            }.bind(this));

        return btn;
    }

    #btn_remove() {
        let btn = $(`<i class="btn-action la la-trash"  title="remove record">`)
            .on('click', function () {
                if (!this.row_system_id){
                    return App.notifyWarning('No record to remove');
                }
                this.#remove_record().then(() => {
                    App.notifyInfo('Record removed');
                    this.ctrl.setValue();
                    this.card.close();
                });
            }.bind(this));

        return btn;
    }

    #form_to_record() {
        let record = {};

        this.card.container.find('.data-field').each(function () {
            record[this.getAttribute('col-uuid')] = this.value;
        });

        return record;
    }

    #update_record(record) {
        return new Promise((resolve, reject) => {
            let list_to_update = this.#get_affected_records();

            console.log(record)
            console.log(list_to_update);

            list_to_update.forEach(function (idx) {
                for (let uuid in record) {
                    this.entity.data[idx][uuid] = record[uuid];
                }
            }.bind(this));

            resolve();
        });
    }

    #remove_record() {
        return new Promise((resolve, reject) => {
            App.Confirm(
                'Are you sure you want to remove this record?<br>This action cannot be reversed.',
                function () {
                    let list_to_remove = this.#get_affected_records();

                    console.log(list_to_remove);

                    list_to_remove.forEach(function (idx) {
                        this.entity.data.splice(idx, 1);
                    }.bind(this));

                    resolve();
                }.bind(this))
        });
    }

    #get_affected_records() {
        let list_to_return = [];

        this.entity.data.forEach(function (item, index) {
            if (item.__system_id__ == this.row_system_id) {
                list_to_return.push(index);
            }
        }.bind(this));

        return list_to_return
    }
}