function service_worker_init(){
    if ('serviceWorker' in navigator) {
        console.log('register service-worker');
        navigator.serviceWorker.register('/sw.js',{scope:'/'})
        .then(function() {
            return navigator.serviceWorker.ready;
        })
        .then(function(registration){
            console.log('Service worker registration succeeded:', registration);
            console.log('ready ', navigator.serviceWorker.ready);
            console.log(registration);

            if(registration.sync) {
                registration.sync.register('project-sync')
                .catch(function(err) {
                    console.log(err);
                    return err;
                });
            } else {
                // sync isn't there so fallback
                checkInternet();
            }
        })
        .catch(function(err){
            console.log(err);
        });

        //navigator.serviceWorker.ready always resolve
        navigator.serviceWorker.ready.then(function (registration) {
            console.log('Service worker successfully registered on scope', registration.scope);
        });
    }
}

function fetchData() {
    return new Promise(function(resolve, reject) {
        var myDB = window.indexedDB.open('JSRAD_DATA');

        myDB.onsuccess = function(event) {
            this.result.transaction("projects").objectStore("projects").getAll().onsuccess = function(event) {
                resolve(event.target.result);
            };
        };

        myDB.onerror = function(err) {
            reject(err);
        };
    });
}



function sendData() {
    console.log('send the data to sync');
    //AUTH TOKEN MIGHT HAVE CHANGED?
    googleDrive.handleClientLoad(function(){
        fetchData().then(function(data){
            data.forEach(element => {
                if (element.sync_required !== true) return;

                console.log('send item to server', element);
                element.access_token = googleDrive.authToken;
                fetch('api/v1/projects', {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify(element)
                    });
            });
        });
    });
}


function checkInternet() {
    event.preventDefault();
    if(navigator.onLine) {
        sendData();
    } else {
        console.log("You are offline! When your internet returns, we'll finish up your request.");
    }
}

window.addEventListener('online', function() {
    console.log('back online');
    sendData();
});

window.addEventListener('offline', function() {
    console.log('You have lost internet access!');
});