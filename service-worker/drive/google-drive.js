var SCOPES = ['https://www.googleapis.com/auth/drive','profile'];
// var SCOPES = ['https://www.googleapis.com/auth/drive.appdata','profile'];
var CLIENT_ID = '26993373135-jg35i8p0sjkdp2jcf8ul5g5554rgcdj8.apps.googleusercontent.com';
var API_KEY = '';
var NO_OF_FILES = 1000;
var FOLDER_ID = "1wmyFEBWd8j2ne6-hgbrvskukQe4dzKv9";

/******************** AUTHENTICATION ********************/
var googleDrive = {
    signedInStatus: false,
    authToken: null,

    handleClientLoad: function (cb_done) {
        if (typeof cb_done !== 'function') cb_done = function(){};

        // Load the API client and auth2 library
        gapi.load('client:auth2', function(){
            gapi.client.init({
                //apiKey: API_KEY, //THIS IS OPTIONAL AND WE DONT ACTUALLY NEED THIS, BUT I INCLUDE THIS AS EXAMPLE
                clientId: CLIENT_ID,
                scope: SCOPES.join(' ')
            }).then(function () {
                console.log('gapi.client.init ? done');
                
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(googleDrive.checkStatus);
                // Handle the initial sign-in state.
                googleDrive.checkStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

                cb_done();
            });    
        });
    },

    //check the return authentication of the login is successful, we display the drive box and hide the login box.
    checkStatus: function (isSignedIn) {
        if (isSignedIn === undefined) isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

        googleDrive.signedInStatus = isSignedIn;

        if (isSignedIn) {
            googleDrive.authToken = gapi.auth.getToken().access_token;
            console.log('signed in', googleDrive.authToken);
        } else {
            googleDrive.authToken = null;
            console.log('you need to log in');
        }
    },

    handleAuthClick: function (cb) {
        if (typeof cb !== 'function') cb = function(){};
	    gapi.auth2.getAuthInstance().signIn().then(function(){
            googleDrive.authToken = gapi.auth.getToken().access_token;
            console.log('user signed in', googleDrive.authToken);
            cb();
        });
    },

    handleSignoutClick: function (event) {
	    if(confirm("Are you sure you want to logout?")){
		    gapi.auth2.getAuthInstance().signOut();
	    }
    },

    /******************** END AUTHENTICATION ********************/

    /******************** DRIVER API ********************/
    send_file: function(file){
        //FIRST CLONE ORIGINAL OBJECT
        var data = JSON.parse(JSON.stringify(file));
        if (data.drive_id)
            return googleDrive.update_file(data);
        else
            return googleDrive.create_file(data);
    },

    create_file: function(data){
        // console.log('DRIVE -> create_file');
        return new Promise(function(resolve, reject){
            // console.log("Uploading file in progress...", data.access_token);
            var access_token = data.access_token;
            delete data.access_token;
            console.log('googleDrive->create_file ? access_token', access_token);

            fileContent = JSON.stringify(data);

            var file = new Blob([fileContent], {type: 'text/plain'});
            var metadata = {
                'name': data.name, // Filename at Google Drive
                'mimeType': 'text/plain', // mimeType at Google Drive
                'parents': [FOLDER_ID], // Folder ID at Google Drive
            };

            var form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + access_token}),
                body: form,
            }).then((res) => {
                if (!res.ok) return null;
                return res.json();
            }).then(function(val) {
                console.log('create DRIVE',val);
                if (!val) return reject(new Error('Error saving to drive'));
                val.drive_id = val.id;
                resolve(val);
            }).catch(function(err){
                // console.log(err);
                reject(err);
            });
        });
    },

    update_file: function(file, cb_done){
        // console.log('DRIVE -> update_file');
        return new Promise(function(resolve, reject){
            var access_token = file.access_token;
            delete file.access_token;
            // console.log(file);
            fetch('https://www.googleapis.com/upload/drive/v3/files/'+ file.drive_id, {
                method: 'PATCH',
                headers: new Headers({ 'Authorization': 'Bearer ' + access_token, 'Accept': 'application/json', 'Content-Type': 'application/json' }),
                body: JSON.stringify(file),
            }).then(res => {
                if (!res.ok) return null;
                return res.json();
            }).then(function(val) {
                console.log('update DRIVE',val);
                if (!val) return reject(new Error('Error saving to drive'));
                if (val.id) val.drive_id = val.id;
                resolve(val);
            }).catch(function(err){
                // console.log(err);
                reject(err);
            });
        });
    },

    download_file: function (file) {
        return new Promise(function (resolve, reject) {
            console.log("fetch file from DRIVE...", file);
            fetch('https://www.googleapis.com/drive/v3/files/' + file.drive_id + '?alt=media', {
                method: 'GET',
                headers: new Headers({ 'Authorization': 'Bearer ' + file.access_token, 'Accept': 'application/json' }),
            }).then((res) => {
                console.log(res);
                if (!res.ok) return reject(new Error('Error reading from drive...'));
                
                return res.json();
            }).then(function (val) {
                console.log(val);
                if (file.drive_id) val.drive_id = file.drive_id;
                resolve(val);
            }).catch(function (err) {
                reject(err);
            });
        });
    },

    list_files: function(access_token){
        return new Promise(function(resolve, reject){
            // console.log("List files in folder...");

            var query = (FOLDER_ID == 'root') ? 
                        'trashed=false and sharedWithMe' : 
                        "trashed=false and '" + FOLDER_ID + "' in parents";

            query += '&pageSize=1000';
            
            // console.log('googleDrive.get_files', access_token);

            fetch('https://www.googleapis.com/drive/v3/files?q='+query, {
                method: 'GET',
                headers: new Headers({ 'Authorization': 'Bearer ' + access_token, 'Accept': 'application/json' }),
            }).then((res) => {
                if (!res.ok) return reject(new Error('Failed to read from drive'));
                return res.json();
            }).then(function(val) {
                // console.log(val);
                resolve(googleDrive.buildFiles(val.files));
            }).catch(function(err){
                // console.log(err);
                reject(err);
            });
        });
    },

    buildFiles: function (file_list){
        var list = [];
        // console.log(file_list);
        if (file_list.length > 0) {
            for (var i = 0; i < file_list.length; i++) {
                list.push({
                    name: file_list[i].name,
                    drive_id: file_list[i].id
                });
            }
        }

        return list;
    }
};