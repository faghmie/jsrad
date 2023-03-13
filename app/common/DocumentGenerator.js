import Dialog from "./Dialog.js";

export default class DocumentGenerator {

    Forms = null;

    Project = null;

    DataModeller = null;

    Designer = null;

    html2canvas_options = {
        allowTaint: true,
        useCORS: true
    };
    constructor(designer) {
        this.Forms = designer.Forms;
        this.Project = designer.Project;
        this.DataModeller = designer.DataModeller;
        this.Designer = designer;
    }

    async Show() {
        let current_active_form = this.Forms.getActiveForm();
        let dlg = $(`<div title="Documentation" class="entity-report">`);

        dlg.append(this.#document_project_info());
        dlg.append(`<h1>User Interface Screens</h1>`);

        for (let form of this.Forms) {
            if (form.is_a_process == true) {
                continue;
            }

            let form_doc = await this.GenerateDocument(form);
            dlg.append(form_doc);
        }
        dlg.append(`<h1>Process / Code Maps</h1>`);

        for (let form of this.Forms) {
            if (form.is_a_process !== true) {
                continue;
            }

            let form_doc = await this.GenerateDocument(form);
            dlg.append(form_doc);
        }

        dlg.append(`<h1>DataModel</h1>`);

        dlg.append(await this.#get_datamodel_docs())

        this.Forms.showForm(current_active_form);
        
        new Dialog(dlg, {
            title: 'Documentation',
            'width': '80vw',
            'min-width': '80vw',
            'max-width': '80vw',
            'height': '40vw',
            'min-height': '40vw',
            'max-height': '40vw',
        });
    }

    #get_datamodel_diagram() {
        return new Promise((resolve, reject) => {
            let prev_context = this.Designer.current_context;
            this.Designer.switch_context('DATA');

            html2canvas(this.DataModeller.dom.container[0], this.html2canvas_options).then((canvas) => {
                let div = $('<div>');
                div.append(`<br>`);


                let img = $('<img>').appendTo(div);
                img.attr('src', canvas.toDataURL());

                div.append('<br>');

                resolve(div.html());

                this.Designer.switch_context(prev_context);
            });
        });
    }

    #get_datamodel_tables() {
        return new Promise((resolve, reject) => {
            let html = `
                    <table>
                        <thead>
                            <tr>
                            <th>Entity</th>
                            <th>Description</th>
                            </tr>
                        </thead>
                    <tbody>`;


            for (let tbl of this.DataModeller.TableManager) {
                html += `
                <tr>
                    <td>${tbl.title}</td>
                    <td>${tbl.comment}</td>
                </tr>`;
            }

            html += '</tbody></table>';

            resolve(html);
        });
    }

    async #get_datamodel_docs() {
        return await this.#get_datamodel_diagram() +
            await this.#get_datamodel_tables();
    }

    GenerateDocument(form) {
        return new Promise((resolve, reject) => {
            
            this.Forms.showForm(form);

            form.deselect();

            for (let ctrl in form.controls) {
                form.controls[ctrl].deselect();
            }

            form.ctrl.removeClass('design-mode');

            html2canvas(form.ctrl[0], this.html2canvas_options).then((canvas) => {
                form.ctrl.addClass('design-mode');

                let div = $('<div>');
                div.append(`<h2>${form.label}</h2>`);
                div.append(`<p>${form.description || '**No description provided**'}</p>`);
                div.append(`<br>`);


                let img = $('<img>').appendTo(div);
                img.attr('src', canvas.toDataURL());

                div.append(this.get_documentation(form));
                div.append('<br>');

                resolve(div.html());
            });
        });
    }


    #document_project_info() {
        let startup = this.Forms.controls[this.Project.project.startup];
        let txt_startup = '';

        if (startup) {
            txt_startup = `
                <br>
                    <p><strong>Startup Form:</strong> ${startup.label}</p>
                <br>
            `;
        }
        return `
            <div class="cover">
                ${this.Project.project.name}
                <h5> version: ${this.Project.project.version}</h5>
            </div>
            <br>
            ${txt_startup}
            <p>
                ${this.Project.project.desription || '***No project description available***'}
            </p>
            <br>
        `;
    }

    get_documentation(form) {
        let html = '';

        //COLUMNS
        for (let key in form.controls) {
            let ctrl = form.controls[key];
            html += `<br>
                <h3>${ctrl.label || 'UNKNOWN'}</h3>
                <table>
                    <thead>
                        <tr></tr>
                    </thead>
                    <tbody>`;

            html += `
				<tr>
					<td>Type</td>
					<td>${ctrl.type}</td>
				</tr>
				<tr>
					<td>Required</td>
					<td>${(true === ctrl.required ? 'YES' : '')}</td>
				</tr>
				<tr>
					<td>Behaviour</td>
					<td>${ctrl.behaviour}</td>
				</tr>
				<tr>
					<td>Description</td>
					<td>${ctrl.description}</td>
				</tr>`;

            html += '</tbody></table>';
        }

        return html;
    }
}