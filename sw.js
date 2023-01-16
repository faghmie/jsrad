self.importScripts('service-worker/project_create.js');
self.importScripts('service-worker/project_get.js');
self.importScripts('service-worker/drive/google-drive.js');

var cacheName = 'jsrad-cache-name-01';

self.addEventListener('install', function(event) {
    // console.log('Installed sw.js');
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
          return cache.addAll(
            [
              '/images',
              '/images/webapp.jpg',
              '/service-worker',
              '/service-worker/main.js',
              '/service-worker/project_create.js',
              '/service-worker/project_get.js',
              '/service-worker/drive',
              '/service-worker/drive/google-drive.js',
            ]
          );
        }).catch(function(err){
            console.log(err);
        })
      );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
    // console.log('Activated sw.js');
    
});

self.addEventListener('fetch', function(event){
    // console.log('fetch from service-worker');
    var request = event.request.clone();
    event.respondWith(
        caches.match(request).then(function(response) {
            if (request.method === 'POST' && request.url.indexOf('/api/v1/projects') !== -1){
                // console.log('store locally before sending to server ? '+ request.url);
                return request.text().then(function(data){
                    return store_data(JSON.parse(data)).then(function(data){
                        return new Response(JSON.stringify(data));
                    });
                });
                        
            } else if (request.method === 'GET' && request.url.indexOf('/api/v1/projects') !== -1){
                return get_data(request).then(function(data){
                    return new Response(JSON.stringify(data));
                });
            }
          return response || fetch(event.request).catch(function(){
                // console.log('post did not work');
            });

        })
    );
});

self.onmessage = function(event) {
    console.log('post failed');
    console.log(event.data);
};

self.onsync = function(event){
    console.log('sync required');
};

self.addEventListener('controllerchange',function() { 
    console.log('service-worker changed');
    window.location.reload(); 
});

function get_param(url, name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(url))
       return decodeURIComponent(name[1]);
 }