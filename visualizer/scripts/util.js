'use strict';

(function () {
    let get = function (url) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);

            xhr.onload = function () {
                if (200 <= this.status && this.status < 300) {
                    resolve(this.response);
                } else {
                    reject(Error(this.statusText));
                }
            };
            xhr.onerror = function () {
                reject(Error('connection failed'));
            };

            xhr.send();
        });
    };

    window.get = get;
})();
