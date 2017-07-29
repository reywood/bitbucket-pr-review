const createButton = Symbol('createButton');
const attachButton = Symbol('attachButton');
const handleButtonClick = Symbol('handleButtonClick');
const showDiffContents = Symbol('showDiffContents');
const hideDiffContents = Symbol('hideDiffContents');
const summaryListElement = Symbol('summaryListElement');

class FileDiff { // eslint-disable-line no-unused-vars
    constructor(sectionElement) {
        this.element = sectionElement;
        this.filepath = this.element.dataset.path;
    }

    async hash() {
        return new FileDiffHashV2(this).hash();
    }

    initUI() {
        const reviewedBtn = this[createButton]();
        this[attachButton](reviewedBtn);
        this.updateDisplay();
    }

    async hasBeenReviewed() {
        const hbr = async (HashClass) => {
            const hasher = new HashClass(this);
            const hash = await hasher.hash();
            return DataStore.hasBeenReviewed(this.filepath, hash);
        };

        if (await hbr(FileDiffHashV2)) {
            return true;
        }

        return hbr(FileDiffHashV1);
    }

    async updateDisplay() {
        if (await this.hasBeenReviewed()) {
            this[summaryListElement].classList.add('bbpr-reviewed');
            this[hideDiffContents]();
        } else {
            this[summaryListElement].classList.remove('bbpr-reviewed');
            this[showDiffContents]();
        }
    }

    async setReviewed() {
        const hash = await this.hash();
        await DataStore.setReviewed(this.filepath, true, hash);
        this.updateDisplay();
    }

    async setUnreviewed() {
        const hash = await this.hash();
        await DataStore.setReviewed(this.filepath, false, hash);
        this.updateDisplay();
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

    [hideDiffContents]() {
        this.element.classList.add('bbpr-reviewed');
    }

    [showDiffContents]() {
        this.element.classList.remove('bbpr-reviewed');
    }

    async [handleButtonClick]() {
        const reviewedAccordingToUi = this[summaryListElement].classList.contains('bbpr-reviewed');
        if (reviewedAccordingToUi) {
            this.setUnreviewed();
        } else {
            this.setReviewed();
        }
    }

    get [summaryListElement]() {
        return document.querySelector(`ul#commit-files-summary li[data-file-identifier="${this.filepath}"]`);
    }
}
