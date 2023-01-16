function get_data(request){
    return new Promise(function(resolve, reject){
        var file         = get_param(request.url, "json");
        var access_token = get_param(request.url, "access_token");
        console.log(request.url)
        console.log(file);
        console.log(access_token);
        if (file) file = file = JSON.parse(file);

        if (file && file.name){
            googleDrive.download_file(file).then(function(data){
                resolve(data);
                //STORE THE DOWNLOADED FILE LOCALLY FOR FUTURE USE
                project_store_local(data);
            })
            .catch(function(err){
                console.log('failed to download file from DRIVE', err);

                project_download_local(request).then(function(data){
                    resolve(data);
                });
            });
        } else {
            googleDrive.list_files(access_token).then(function(data){
                // console.log(data)
                resolve(data);
            })
            .catch(function(err){
                console.log('failed to download file from DRIVE', err);

                project_list_local(request).then(function(data){
                    resolve(data);
                });
            });
        }
    })
}

function project_download_local(request) {
    return new Promise(function (resolve, reject) {
        var db_request = self.indexedDB.open('JSRAD_DATA', 1);
        var db = null, store = null, searchKey = null;
        db_request.onsuccess = function (event) {
            // console.log('[onsuccess]', db_request.result);
            db = event.target.result;
            searchKey = get_param(request.url, "json");
            // console.log('searchKey', searchKey);
            projects_get_one(db, resolve, JSON.parse(searchKey));
        };
        db_request.onupgradeneeded = function (event) {
            // console.log('[onupgradeneeded]', db_request.result);
            db = event.target.result;
            store = db.createObjectStore('projects', { keyPath: 'name' });
        };
        db_request.onerror = function (event) {
            // console.log('[onerror]', db_request.error);
            reject(db_request.error);
        };
    });
}

function project_list_local(request) {
    return new Promise(function (resolve, reject) {
        var db_request = self.indexedDB.open('JSRAD_DATA', 1);
        var db = null, store = null, searchKey = null;
        db_request.onsuccess = function (event) {
            // console.log('[onsuccess]', db_request.result);
            db = event.target.result;
            projects_get_all(db, resolve);
        };
        db_request.onupgradeneeded = function (event) {
            // console.log('[onupgradeneeded]', db_request.result);
            db = event.target.result;
            store = db.createObjectStore('projects', { keyPath: 'name' });
        };
        db_request.onerror = function (event) {
            // console.log('[onerror]', db_request.error);
            reject(db_request.error);
        };
    });
}
function projects_get_all(db, resolve){
    var transaction = db.transaction('projects', 'readonly');
    
    transaction.onsuccess = function(event) {
        console.log('[Transaction] ALL DONE!');
    };
    
    transaction.objectStore('projects').getAll().onsuccess = function(event){
        var list = [];
        // console.log(event);
        event.target.result.forEach(element => {
            list.push({
                name: element.name, 
                drive_id: element.drive_id
            });
        });
        resolve(list);
    };
}

function projects_get_one(db, resolve, searchKey){
    var transaction = db.transaction('projects', 'readonly');
    
    transaction.onsuccess = function(event) {
        console.log('[Transaction] ALL DONE!');
    };

    transaction.onerror = function(event) {
        console.log('[Transaction] ERROR!', event);
        resolve({});
    };
    
    transaction.objectStore('projects').get(searchKey.name).onsuccess = function(event){
        // console.log('data', event.target.result);
        resolve(event.target.result);
    };
}