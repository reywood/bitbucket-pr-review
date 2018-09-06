const getFilePathKey = Symbol('getFilePathKey');
const get = Symbol('get');
const getFromStorageClass = Symbol('getFromStorageClass');
const set = Symbol('set');
const remove = Symbol('remove');

const STORAGE_CLASS_LOCAL = 'local';
const STORAGE_CLASS_SYNC = 'sync';

function createStorageCallback(reject, resolve, returnValueGetter) {
    return function storageCallback(...args) {
        const lastRuntimeError = chrome.runtime && chrome.runtime.lastError;
        if (lastRuntimeError) {
            reject(lastRuntimeError);
        } else {
            resolve(returnValueGetter && returnValueGetter(...args));
        }
    };
}

class DataStore { // eslint-disable-line no-unused-vars
    static async setReviewed(filepath, reviewed, hash) {
        const key = DataStore[getFilePathKey](filepath);
        if (reviewed) {
            return DataStore[set](key, hash);
        }
        return DataStore[remove](key);
    }

    static async hasEverBeenReviewed(filepath) {
        const key = DataStore[getFilePathKey](filepath);

        return !!(await DataStore[get](key));
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

    static async [get](key) {
        const localValue = await DataStore[getFromStorageClass](STORAGE_CLASS_LOCAL, key);

        if (localValue) {
            return localValue;
        }

        return DataStore[getFromStorageClass](STORAGE_CLASS_SYNC, key);
    }

    static [getFromStorageClass](storageClass, key) {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage[storageClass].get(
                    key,
                    createStorageCallback(reject, resolve, items => items[key]),
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    static [set](key, value) {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage[STORAGE_CLASS_LOCAL].set(
                    { [key]: value },
                    createStorageCallback(reject, resolve),
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    static [remove](key) {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage[STORAGE_CLASS_LOCAL].remove(
                    key,
                    createStorageCallback(reject, resolve),
                );
            } catch (error) {
                reject(error);
            }
        }).then(() => new Promise((resolve, reject) => {
            try {
                chrome.storage[STORAGE_CLASS_SYNC].remove(
                    key,
                    createStorageCallback(reject, resolve),
                );
            } catch (error) {
                reject(error);
            }
        }));
    }
}
