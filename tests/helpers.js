const diffTemplate = Handlebars.compile(document.getElementById('diff-template').innerHTML);

const items = Symbol('items');
window.chrome = window.chrome || {};
window.chrome.storage = {
    sync: {
        [items]: {},
        get: function get(key, callback) {
            console.log('getting: ', { [key]: this[items][key] });
            callback({ [key]: this[items][key] });
        },
        set: function set(newItems, callback) {
            console.log('setting: ', newItems);
            Object.assign(this[items], newItems);
            callback();
        },
        remove: function remove(key, callback) {
            console.log(`removing: ${key}`);
            delete this[items][key];
            callback();
        },
    },
};

class DiffDomElementBuilder {
    constructor(filePath) {
        this.filePath = filePath;
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
            diffLines: this.diffLines,
            comments: this.comments,
        });
        const sandbox = document.getElementById('dom-sandbox');
        sandbox.innerHTML = rendered;
        return sandbox.querySelector('.bb-udiff');
    }
}
