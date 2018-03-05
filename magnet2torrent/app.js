var magnet = require('magnet-uri');
var http = require('http');
var fs = require('fs');

var torrentCaches = [
    "http://itorrents.org/torrent/{0}.torrent",
    "http://archive.org/download/{0}/{0}_archive.torrent"
];

var tasks = []

var downloadFileFromMagnet = function (magnetLink, downloadPath, onCompleted) {

    var parsed = magnet.decode(magnetLink)
    downloadFileFromInfoHash(parsed.infoHash, downloadPath, onCompleted);
}

var downloadFileFromInfoHash = function (infoHash, downloadPath, onCompleted) {

    for (var i = 0; i < torrentCaches.length; i++) {

        var url = torrentCaches[i].split("{0}").join(infoHash.toUpperCase());
        try {
            tasks.push(download(url, downloadPath, onCompleted));
        }
        catch (e) {
            console.log(e);
        }
    }
}

var download = function (url, dest, cb) {
    return http.get(url, function (response) {
        if (response.headers['content-type'] == "application/x-bittorrent") {
            var file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', function () {
                endRequests();
                file.close();
                cb(dest);
            });
        }
    });
}

var endRequests = function () {

    tasks.forEach(function (task) {

        task.end();
    });

}


module.exports = downloadFileFromMagnet;
module.exports.fromMagnet = downloadFileFromMagnet;
module.exports.fromInfoHash = downloadFileFromInfoHash;