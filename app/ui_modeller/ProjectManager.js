import App from '../common/App.js';

export default class ProjectManager {
    browserDbName = 'JSRAD_DATA';

    /** @type {UiDesigner | undefined} */
    designer = null;

    /** @type {FormManager | undefined} */
    Forms = null;

    project = {
        name: 'My Application',
        version: '0.0.1',
        description: 'some notes about this project',
        type: 'application',
        startup: null,
    };


    /**
     * Creates an instance of ProjectManager.
     * @param {UiDesigner} designer
     * @param {FormManager} forms
     * @memberof ProjectManager
     */
    constructor(designer, forms) {
        this.designer = designer;
        this.Forms = forms;

        this.#listen_for_project_events();
    }

    #listen_for_project_events() {
        document.addEventListener('project-save-to-disk', function (evt) {
            this.SaveToDisk();
        }.bind(this));

        document.addEventListener('project-save', function (evt) {
            this.Save(this.designer.toObject());
        }.bind(this));
    }

    CreateNew(projectName) {
        this.Close();
        let uuid = generate_uuid();

        projectName = projectName || uuid;

        this.project = {
            name: projectName,
            version: 0.01,
            description: 'some notes about this project',
            type: 'application',
            uuid: uuid
        };


        this.Forms.addForm().then(function () {
            this.designer.switch_context();
        }.bind(this));

        this.#enable_auto_save();
    }
    
    #enable_auto_save(){
        this.save_timer = window.setInterval(function(){
            
            if (this.designer.is_dirty === false){
                return;
            }

            this.designer.toObject().then(function(data){
                this.Save(data);
            }.bind(this));
            
        }.bind(this), 2000);
    }

    async Open(json) {

        this.Close();
        await this.designer.fromObject(json);
        this.project = {
            name: json.project.name,
            version: json.project.version,
            description: json.project.description,
            type: json.project.type,
            uuid: json.project.uuid,
            startup: json.project.startup
        };

        this.#enable_auto_save();

        this.designer.switch_context();
    }

    List() {
        return new Promise((resolve, reject) => {
            let db = window.indexedDB.open(this.browserDbName);

            db.onupgradeneeded = (event) => {
                // Save the IDBDatabase interface
                const db = event.target.result;

                // Create an objectStore for this database
                db.createObjectStore("projects", {
                    keyPath: "uuid"
                });
            };

            db.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["projects"]);
                const objectStore = transaction.objectStore("projects");
                const request = objectStore.getAll();
                request.onsuccess = event => {
                    resolve(request.result);
                }
            };

            db.onerror = (err) => {
                resolve(null);
            };
        });
    }

    ListSamples() {
        return new Promise((resolve, reject) => {
            import('../../samples/index.js').then(function (list) {
                resolve(list.default);
            }.bind(this)).catch(ex => {
                console.log(ex);
                reject(ex);
            });
        });
    }

    OpenSample(filename) {
        return new Promise((resolve, reject) => {
            import(`../../samples/${filename}`).then(function (list) {
                this.Open(list.default);
                resolve(list.default);
            }.bind(this)).catch(ex => {
                App.notifyError(ex);
                reject(ex);
            });
        });
    }

    Load(name) {
        return new Promise((resolve, reject) => {
            let db = window.indexedDB.open(this.browserDbName);

            db.onupgradeneeded = (event) => {
                // Save the IDBDatabase interface
                const db = event.target.result;

                // Create an objectStore for this database
                db.createObjectStore("projects", {
                    keyPath: "uuid"
                });
            };

            db.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["projects"]);
                const objectStore = transaction.objectStore("projects");
                const request = objectStore.get(name);
                request.onsuccess = event => {
                    console.log(request.result);
                    resolve(request.result);
                }
            };

            db.onerror = (err) => {
                resolve(null);
            };
        });
    }

    Save(json) {
        let $this = this;
        return new Promise((resolve, reject) => {
            let db = window.indexedDB.open(this.browserDbName);

            db.onupgradeneeded = (event) => {
                // Save the IDBDatabase interface
                const db = event.target.result;

                // Create an objectStore for this database
                db.createObjectStore("projects", {
                    keyPath: "uuid"
                });
            };

            db.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["projects"], "readwrite");
                const objectStore = transaction.objectStore("projects");
                const request = objectStore.put(json);
                request.onsuccess = event => {
                    $this.designer.is_dirty = false;
                    resolve();
                };

                request.onerror = event => {
                    console.log("error saving record");
                    console.log(event);
                    reject(event);
                };
            };

            db.onerror = (err) => {
                reject(err);
            };
        });
    }

    Remove(project_uuid) {
        return new Promise((resolve, reject) => {
            let db = window.indexedDB.open(this.browserDbName);

            db.onupgradeneeded = (event) => {
                // Save the IDBDatabase interface
                const db = event.target.result;

                // Create an objectStore for this database
                db.createObjectStore("projects", {
                    keyPath: "uuid"
                });
            };

            db.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(["projects"], "readwrite");
                const objectStore = transaction.objectStore("projects");
                objectStore.delete(project_uuid);
                transaction.oncomplete = event => {
                    resolve();
                };
            };

            db.onerror = (err) => {
                reject(err);
            };
        });
    }

    async SaveToDisk() {
        let json = await this.designer.toObject(),
            name = json.name;

        if (json.project) {
            name = json.project.name;
        }

        let export_name = $.trim(name).replace(/( )/g, '_').toLowerCase();
        let file_data = '';
        if (this.project.type === 'module')
            file_data = export_name + ' = ' + JSON.stringify(json);
        else
            file_data = JSON.stringify(json);

        let blob = new Blob([file_data], {
            type: 'javascript/json'
        });

        saveAs(blob, name + '.json');
    }

    Close() {
        this.Forms.removeAllForms();

        this.project = {
            name: 'My Application',
            version: 0.01,
            description: 'some notes about this project',
            type: 'application',
        };

        if (this.save_timer) {
            window.clearInterval(this.save_timer);
            this.save_timer = null;
        }
    }

    async GenerateDocument() {
        let html = '<html>';
        html += documentation_style.get_header(this.project.name);
        html += '<body></body></html>';

        let $dlg = $("<div title='Documentation'>");
        $dlg.append(html);

        for (let form of this.Forms) {
            let form_doc = await this.Forms.GenerateDocument(form);
            $dlg.append(form_doc);
        }

        let blob = new Blob([$dlg.html()], {
            type: 'text/html;charset=utf-8'
        });
        saveAs(blob, this.project.name + '.html');

    };
}