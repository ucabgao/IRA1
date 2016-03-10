var DirService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties)
var FileOutputStream = CC("@mozilla.org/network/file-output-stream;1", "nsIFileOutputStream", "init");
var FileInputStream = CC("@mozilla.org/network/file-input-stream;1", "nsIFileInputStream", "init");
var LocalFile = CC("@mozilla.org/file/local;1", "nsILocalFile", "initWithPath");

var exports = require('./file');
var IO = require("./io").IO;

function MozFile(path) {
    var file;
    try {
        file = new LocalFile(path);
    } catch(e) {
        file = new LocalFile(exports.cwd());
        path.split(/[\\\/]/).forEach(function(part) {
            if (part != '') file.append(part)
        });
    }
    return file;
}

exports.cwd = function () DirService.get("CurWorkD", Ci.nsIFile).path;

exports.list = function (path) {
    var entries = MozFile(path).directoryEntries;
    var entryNames = [];
    while(entries.hasMoreElements()) {
        var entry = entries.getNext();
        entry.QueryInterface(Ci.nsIFile);
        entryNames.push(entry.leafName);
    }
    return entryNames;
};

exports.canonical = function (path) {
    var file = MozFile(path);
    try {
        file.normalize();
    } catch(e) {}
    return file.path;
}

exports.exists = function (path) MozFile(path).exists();

exports.mtime = function (path) new Date(MozFile(path).lastModifiedTime);

exports.size = function (path) MozFile(path).fileSize;

exports.stat = function (path) {
    return {
        mtime: exports.mtime(path),
        size: exports.size(path)
    }
};

exports.isDirectory = function (path) {
    var file = MozFile(path);
    return file.exists() && file.isDirectory();
}

exports.isFile = function (path) {
    var file = MozFile(path);
    return file.exists() && file.isFile();
}

exports.isLink = function (path) MozFile(path).isSymlink();

exports.isReadable = function (path) MozFile(path).isReadable();

exports.isWritable = function (path) MozFile(path).isWritable();

exports.rename = function (source, target) {
    source = exports.path(source);
    target = source.resolve(target);
    source = MozFile(source);
    target = MozFile(target);
    try {
        source.moveTo(target.parent, target.leafName);
    } catch(e) {
        throw new Error("failed to rename " + source.path + " to " + target.path);
    }
};

exports.move = function (source, target) {
    source = exports.path(source);
    target = source.resolve(target);
    source = MozFile(source);
    target = MozFile(target);
    try {
        source.moveTo(target.parent, target.leafName);
    } catch(e) {
        throw new Error("failed to move " + source.path + " to " + target.path);
    }
};

exports.remove = function (path) {
    try {
        MozFile(path).remove(false)
    } catch(e) {
        throw new Error("failed to delete " + path);
    }
};

exports.mkdir = function (path) MozFile(path).create(Ci.nsIFile.DIRECTORY_TYPE, 0777);

exports.mkdirs = exports.mkdir;

exports.rmdir = function(path) {
    try {
        MozFile(path).remove(false)
    } catch(e) {
        throw new Error("failed to delete " + path);
    }
};

exports.rmtree = function(path) {
    try {
        MozFile(path).remove(true)
    } catch(e) {
        throw new Error("failed to delete " + path);
    }
};

exports.touch = function (path, mtime) {
    var file = MozFile(path);
    if (!file.exists()) file.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
    else file.lastModifiedTime = new Date().getTime().toString();
};

exports.symlink = function (path) {
    throw "NYI";
};

exports.FileIO = function (path, mode, permissions) {
    file = MozFile(path);

    var {
        read: read,
        write: write,
        append: append,
        update: update
    } = exports.mode(mode);

    if (update) {
        throw new Error("Updating IO not yet implemented.");
    } else if (write || append) {
        return new IO(null, new FileOutputStream(file, -1, -1, 0));
    } else if (read) {
        return new IO(new FileInputStream(file, -1, 0, 0), null);
    } else {
        throw new Error("Files must be opened either for read, write, or update mode.");
    }
};