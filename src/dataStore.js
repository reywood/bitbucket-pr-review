const getFilePathKey = Symbol('getFilePathKey');
const get = Symbol('get');
const set = Symbol('set');
const remove = Symbol('remove');


class DataStore { // eslint-disable-line no-unused-vars
    static async setReviewed(filepath, reviewed, hash) {
        const key = DataStore[getFilePathKey](filepath);
        if (reviewed) {
            return DataStore[set](key, hash);
        }
        return DataStore[remove](key);
    }

    static async hasBeenReviewed(filepath, hash) {
        const key = DataStore[getFilePathKey](filepath);

        return (await DataStore[get](key)) === hash;
    }

    static [getFilePathKey](filepath) {
        const pullRequestElement = document.querySelector('#pullrequest');
        const destinationBranch = pullRequestElement.dataset.compareDestValue;
        const pullRequestId = pullRequestElement.dataset.localId;
        const prKey = `${destinationBranch}::pr${pullRequestId}`;
        return `${prKey}::${filepath}`;
    }

    static [get](key) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, (items) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items[key]);
                }
            });
        });
    }

    static [set](key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    static [remove](key) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.remove(key, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
}
