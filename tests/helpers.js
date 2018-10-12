const diffTemplate = Handlebars.compile(document.getElementById('diff-template').innerHTML);

function createStorageInterface(storageClass) {
    const items = Symbol(`${storageClass}Items`);
    return {
        [items]: {},
        get(key, callback) {
            console.log(`getting from ${storageClass}: `, { [key]: this[items][key] });
            callback({ [key]: this[items][key] });
        },
        set(newItems, callback) {
            console.log(`setting to ${storageClass}: `, newItems);
            Object.assign(this[items], newItems);
            callback();
        },
        remove(key, callback) {
            console.log(`removing from ${storageClass}: ${key}`);
            delete this[items][key];
            callback();
        },
        reset() {
            this[items] = {};
        },
    };
}

window.chrome = window.chrome || {};
window.chrome.storage = {
    sync: createStorageInterface('sync'),
    local: createStorageInterface('local'),
};

class DiffDomElementBuilder {
    constructor(filePath, encodedFilePath) {
        this.filePath = filePath;
        this.encodedFilePath = encodedFilePath || escape(filePath);
        this.diffLines = [];
        this.currentFnum = 0;
        this.currentTnum = 0;
        this.comments = [];
    }

    addCommonDiffLine(source, isLast) {
        this.currentFnum += 1;
        this.currentTnum += 1;
        this.diffLines.push({
            type: isLast ? 'common last' : 'common',
            source,
            fnum: this.currentFnum,
            tnum: this.currentTnum,
        });
    }

    addAdditionDiffLine(source) {
        this.currentTnum += 1;
        this.diffLines.push({
            type: 'addition',
            source,
            tnum: this.currentTnum,
        });
    }

    addDeletionDiffLine(source) {
        this.currentFnum += 1;
        this.diffLines.push({
            type: 'deletion',
            source,
            fnum: this.currentFnum,
        });
    }

    addComment(id, author, content, date) {
        this.comments.push({
            id,
            author,
            content,
            date,
        });
    }

    build() {
        const rendered = diffTemplate({
            filePath: this.filePath,
            encodedFilePath: this.encodedFilePath,
            diffLines: this.diffLines,
            comments: this.comments,
        });
        const sandbox = document.getElementById('dom-sandbox');
        sandbox.innerHTML = rendered;
        return sandbox.querySelector('.bb-udiff');
    }

    static cleanUp() {
        const sandbox = document.getElementById('dom-sandbox');
        sandbox.innerHTML = '';
    }
}
