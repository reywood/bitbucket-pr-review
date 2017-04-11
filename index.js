const getFilePathKey = Symbol('getFilePathKey');
const createButton = Symbol('createButton');
const attachButton = Symbol('attachButton');
const handleButtonClick = Symbol('handleButtonClick');
const updateDisplay = Symbol('updateDisplay');
const showDiffContents = Symbol('showDiffContents');
const hideDiffContents = Symbol('hideDiffContents');
const hasBeenReviewed = Symbol('hasBeenReviewed');
const summaryListElement = Symbol('summaryListElement');


async function sha1(message) {
    const msgBuffer = new TextEncoder('utf-8').encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => (`00${b.toString(16)}`).slice(-2)).join('');
    return hashHex;
}


class DataStore {
    static async setReviewed(filepath, reviewed, hash) {
        const key = DataStore[getFilePathKey](filepath);
        if (reviewed) {
            return DataStore.set(key, hash);
        }
        return DataStore.remove(key);
    }

    static async hasBeenReviewed(filepath, hash) {
        const key = DataStore[getFilePathKey](filepath);

        return (await DataStore.get(key)) === hash;
    }

    static [getFilePathKey](filepath) {
        const pullRequestElement = document.querySelector('#pullrequest');
        const prKey = `${pullRequestElement.dataset.compareDestValue}::pr${pullRequestElement.dataset.localId}`;
        return `${prKey}::${filepath}`;
    }

    static get(key) {
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

    static set(key, value) {
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

    static remove(key) {
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


class FileDiff {
    constructor(sectionElement) {
        this.element = sectionElement;
        this.filepath = this.element.dataset.path;
    }

    async hash() {
        const textElement = this.element.querySelector('.diff-content-container');
        const lineContent = FileDiff.serializeDiffLines(textElement);
        const commentContent = FileDiff.serializeComments(textElement);

        const textHash = await sha1(`${lineContent}\n${commentContent}`);
        return textHash;
    }

    initUI() {
        const reviewedBtn = this[createButton]();
        this[attachButton](reviewedBtn);
        this[updateDisplay]();
    }

    static serializeDiffLines(textElement) {
        return Array.from(textElement.querySelectorAll('.udiff-line'))
            .map((line) => {
                const lineNumbers = line.querySelector('.line-numbers');
                const source = line.querySelector('.source');
                const parts = [
                    line.className,
                    `${lineNumbers.dataset.fnum},${lineNumbers.dataset.tnum}`,
                    source.innerText,
                ];
                return parts.join('\n');
            })
            .join('\n');
    }

    static serializeComments(textElement) {
        return Array.from(textElement.querySelectorAll('.comment article'))
            .map((comment) => {
                const parts = [
                    comment.id,
                    comment.querySelector('.author').textContent,
                    comment.querySelector('.comment-content').textContent,
                    comment.querySelector('time').getAttribute('datetime'),
                ];
                return parts.join('\n');
            })
            .join('\n');
    }

    [createButton]() {
        const btn = document.createElement('button');
        btn.classList.add('aui-button', 'aui-button-light');
        btn.innerHTML = `
            <span class="bbpr-not-done">Done Reviewing</span>
            <span class="bbpr-done">Reviewed</span>
        `;
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

    async [updateDisplay]() {
        if (await this[hasBeenReviewed]()) {
            this[summaryListElement].classList.add('bbpr-reviewed');
            this[hideDiffContents]();
        } else {
            this[summaryListElement].classList.remove('bbpr-reviewed');
            this[showDiffContents]();
        }
    }

    [hideDiffContents]() {
        this.element.classList.add('bbpr-reviewed');
    }

    [showDiffContents]() {
        this.element.classList.remove('bbpr-reviewed');
    }

    async [handleButtonClick]() {
        const hash = await this.hash();
        const reviewed = await this[hasBeenReviewed]();
        await DataStore.setReviewed(this.filepath, !reviewed, hash);
        this[updateDisplay]();
    }

    async [hasBeenReviewed]() {
        const hash = await this.hash();
        return DataStore.hasBeenReviewed(this.filepath, hash);
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
