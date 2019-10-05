const createButton = Symbol('createButton');
const createTopButton = Symbol('createTopButton');
const createBottomButton = Symbol('createBottomButton');
const attachTopButton = Symbol('attachTopButton');
const attachBottomButton = Symbol('attachBottomButton');
const handleTopButtonClick = Symbol('handleTopButtonClick');
const handleBottomButtonClick = Symbol('handleBottomButtonClick');
const showDiffContents = Symbol('showDiffContents');
const hideDiffContents = Symbol('hideDiffContents');
const summaryListElement = Symbol('summaryListElement');
const shouldShowBottomButton = Symbol('shouldShowBottomButton');

class FileDiff { // eslint-disable-line no-unused-vars
    constructor(sectionElement) {
        this.element = sectionElement;
        this.filepath = this.element.dataset.path;
        this.fileIdentifier = this.element.dataset.identifier;
    }

    get isUIInitialized() {
        return !!this.element.querySelector('.bbpr-buttons');
    }

    async hash() {
        return new FileDiffHashV2(this).hash();
    }

    initUI() {
        if (!this.isUIInitialized) {
            const topReviewedBtn = this[createTopButton]();
            this[attachTopButton](topReviewedBtn);
            if (this[shouldShowBottomButton]()) {
                const bottomReviewedBtn = this[createBottomButton]();
                this[attachBottomButton](bottomReviewedBtn);
            }
        }
        this.updateDisplay();
    }

    async hasBeenReviewed() {
        const doesHashMatch = async (HashClass) => {
            const hasher = new HashClass(this);
            const hash = await hasher.hash();
            return DataStore.hasBeenReviewed(this.filepath, hash);
        };

        if (await doesHashMatch(FileDiffHashV2)) {
            return true;
        }

        return doesHashMatch(FileDiffHashV1);
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

    [createTopButton]() {
        const btn = FileDiff[createButton]();
        btn.addEventListener('click', () => {
            this[handleTopButtonClick]();
        });
        return btn;
    }

    [shouldShowBottomButton]() {
        const sectionHeight = parseInt(this.element.offsetHeight, 10);
        const windowHeight = window.innerHeight;
        return sectionHeight > Math.min(300, windowHeight);
    }

    [createBottomButton]() {
        const btn = FileDiff[createButton]();
        btn.classList.add('bbpr-bottom-btn');
        btn.addEventListener('click', () => {
            this[handleBottomButtonClick]();
        });
        return btn;
    }

    static [createButton]() {
        const btn = document.createElement('button');
        btn.classList.add('aui-button', 'aui-button-light');
        btn.innerHTML = `
            <span class="bbpr-not-done">Done Reviewing</span>
            <span class="bbpr-done">Reviewed</span>
        `;
        return btn;
    }

    [attachTopButton](btn) {
        const pluginActionsContainer = document.createElement('div');
        pluginActionsContainer.classList.add('aui-buttons', 'bbpr-buttons');
        pluginActionsContainer.appendChild(btn);

        const actionsContainer = this.element.querySelector('.diff-actions');
        actionsContainer.insertBefore(pluginActionsContainer, actionsContainer.firstChild);
    }

    [attachBottomButton](btn) {
        this.element.appendChild(btn);
    }

    [hideDiffContents]() {
        this.element.classList.add('bbpr-reviewed');
    }

    [showDiffContents]() {
        this.element.classList.remove('bbpr-reviewed');
    }

    async [handleTopButtonClick]() {
        const reviewedAccordingToUi = this[summaryListElement].classList.contains('bbpr-reviewed');
        if (reviewedAccordingToUi) {
            this.setUnreviewed();
        } else {
            this.setReviewed();
        }
    }

    [handleBottomButtonClick]() {
        const rect = this.element.getBoundingClientRect();
        const clientHeight = document.documentElement.clientHeight;
        const isTopOfElementInView = rect.top >= 0 && rect.top < (clientHeight - 50);
        if (!isTopOfElementInView) {
            this.element.scrollIntoView();
        }
        this.setReviewed();
    }

    get [summaryListElement]() {
        return document.querySelector(`ul#commit-files-summary li[data-file-identifier="${this.fileIdentifier}"]`);
    }
}
