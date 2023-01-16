function store_data(file){
    // console.log(file)
    file = JSON.parse(JSON.stringify(file));
    return new Promise(function(resolve, reject){
        file.sync_required = false;
        googleDrive.send_file(file)
        .then(function(data){
            // console.log('save to DRIVE is done');
            file.drive_id = data.drive_id;
            project_store_local(file)
            .then(function(data){
                resolve(data);
            });
        })
        .catch(function(err){
            file.sync_required = true;
            project_store_local(file)
            .then(function(data){
                resolve(data);
            });
        });
    });
}

function project_store_local(data) {
    return new Promise(function (resolve, reject) {
        var request = self.indexedDB.open('JSRAD_DATA', 1);
        var db = null, store = null;

        delete data.access_token;
        // console.log('file to save locally ?', data);
        request.onsuccess = function (event) {
            // console.log('[onsuccess]', request.result);
            db = event.target.result;
            create_record(db, data, resolve);
        };
        request.onupgradeneeded = function (event) {
            // console.log('[onupgradeneeded]', request.result);
            db = event.target.result;
            store = db.createObjectStore('projects', { keyPath: 'name' });
        };
        request.onerror = function (event) {
            reject(request.error);
            console.log('[onerror]', request.error);
        };
    });
}

function create_record(db, data, resolve){
    var transaction = db.transaction('projects', 'readwrite');
    
    transaction.onsuccess = function(event) {
        console.log('[Transaction] ALL DONE!');
    };
    
    var projectStore = transaction.objectStore('projects');
    // console.log('store data to local db ? ', data);
    var db_op_req = projectStore.put(data);
    db_op_req.onsuccess = function(event) {
        resolve(data);
        // console.log(event); // true
    };
}