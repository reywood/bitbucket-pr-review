const getFilePathKey = Symbol('getFilePathKey');
const createButton = Symbol('createButton');
const attachButton = Symbol('attachButton');
const handleButtonClick = Symbol('handleButtonClick');
const updateDisplay = Symbol('updateDisplay');
const showDiffContents = Symbol('showDiffContents');
const hideDiffContents = Symbol('hideDiffContents');
const hasBeenReviewed = Symbol('hasBeenReviewed');
const summaryListElement = Symbol('summaryListElement');

class DataStore {
    static setReviewed(filepath, reviewed, hash, callback) {
        const key = DataStore[getFilePathKey](filepath);
        const callbackWrapper = () => {
            if (chrome.runtime.lastError) {
                console.log('Setting value failed: ', chrome.runtime.lastError);
            }
            callback();
        };
        if (reviewed) {
            chrome.storage.sync.set({ [key]: hash }, callbackWrapper);
        } else {
            chrome.storage.sync.remove(key, callbackWrapper);
        }
    }

    static hasBeenReviewed(filepath, hash, callback) {
        const key = DataStore[getFilePathKey](filepath);
        chrome.storage.sync.get(key, (items) => {
            if (chrome.runtime.lastError) {
                console.log('Getting value failed: ', chrome.runtime.lastError);
            }
            callback(items[key] === hash);
        });
    }

    static [getFilePathKey](filepath) {
        const pullRequestElement = document.querySelector('#pullrequest');
        const prKey = `${pullRequestElement.dataset.compareDestValue}::pr${pullRequestElement.dataset.localId}`;
        return `${prKey}::${filepath}`;
    }
}


class FileDiff {
    constructor(sectionElement) {
        this.element = sectionElement;
        this.filepath = this.element.dataset.path;
    }

    get hash() {
        return Sha1.hash(this.element.innerText);
    }

    initUI() {
        const reviewedBtn = this[createButton]();
        this[attachButton](reviewedBtn);
        this[updateDisplay]();
    }

    [createButton]() {
        const btn = document.createElement('button');
        btn.classList.add('aui-button', 'aui-button-light');
        btn.textContent = 'Reviewed';
        btn.addEventListener('click', () => {
            this[handleButtonClick]();
        });
        return btn;
    }

    [attachButton](btn) {
        const pluginActionsContainer = document.createElement('div');
        pluginActionsContainer.classList.add('aui-buttons', 'bbpr-buttons');
        pluginActionsContainer.appendChild(btn);

        const actionsContainer = this.element.querySelector('.diff-actions');
        actionsContainer.insertBefore(pluginActionsContainer, actionsContainer.firstChild);
    }

    [updateDisplay]() {
        this[hasBeenReviewed]((reviewed) => {
            if (reviewed) {
                this[summaryListElement].classList.add('bbpr-reviewed');
                this[hideDiffContents]();
            } else {
                this[summaryListElement].classList.remove('bbpr-reviewed');
                this[showDiffContents]();
            }
        });
    }

    [hideDiffContents]() {
        this.element.classList.add('bbpr-reviewed');
    }

    [showDiffContents]() {
        this.element.classList.remove('bbpr-reviewed');
    }

    [handleButtonClick]() {
        this[hasBeenReviewed]((reviewed) => {
            DataStore.setReviewed(this.filepath, !reviewed, this.hash, () => {
                this[updateDisplay]();
            });
        });
    }

    [hasBeenReviewed](callback) {
        return DataStore.hasBeenReviewed(this.filepath, this.hash, callback);
    }

    get [summaryListElement]() {
        return document.querySelector(`ul#commit-files-summary li[data-file-identifier="${this.filepath}"]`);
    }
}


function init() {
    const fileDiffs = Array.from(document.querySelectorAll('#changeset-diff .bb-udiff'))
        .map(section => new FileDiff(section));

    fileDiffs.forEach((fileDiff) => {
        fileDiff.initUI();
    });
}


function waitForLoad() {
    const waitForElement = document.querySelector('#pullrequest-diff .main');
    if (waitForElement) {
        init();
    } else {
        setTimeout(waitForLoad, 100);
    }
}


waitForLoad();
