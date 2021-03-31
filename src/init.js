const DIFF_CSS_CLASSNAME = 'bb-udiff';

function createHelperMenuDom() {
    const menuContainer = document.createElement('div');
    menuContainer.id = 'bbpr-menu';
    menuContainer.className = 'bbpr-menu';
    menuContainer.innerHTML = `
        <button class="bbpr-menu-btn">
            Review Menu ▼
        </button>
        <ul class="bbpr-menu-items">
            <li><button class="bbpr-display-all-btn">Display all reviewed diffs</button></li>
            <li><button class="bbpr-hide-all-btn">Hide all reviewed diffs</button></li>
            <li><button class="bbpr-mark-all">Mark all files as reviewed</button></li>
            <li><button class="bbpr-mark-all-snapshots">Mark all snapshots as reviewed</button></li>
            <li><button class="bbpr-unmark-all">Mark all files as unreviewed</button></li>
        </ul>
    `;
    return menuContainer;
}

function getAllFileDiffElements() {
    return Array.from(document.querySelectorAll(`#changeset-diff .${DIFF_CSS_CLASSNAME}`))
        .filter((element) => !element.querySelector('.load-diff.try-again'));
}

function getAllFileDiffs() {
    const diffElements = getAllFileDiffElements();
    return diffElements.map((element) => new FileDiff(element));
}

function toggleMenu() {
    const menuContainer = document.getElementById('bbpr-menu');
    menuContainer.classList.toggle('bbpr-open');
}

function closeMenu() {
    const menuContainer = document.getElementById('bbpr-menu');
    menuContainer.classList.remove('bbpr-open');
}

function closeMenuOnBodyClick(e) {
    const menuContainer = document.getElementById('bbpr-menu');
    if (menuContainer) {
        const allMenuButtons = Array.from(menuContainer.querySelectorAll('button'));
        const isMenuClick = allMenuButtons.some((btn) => btn === e.target);
        if (!isMenuClick) {
            closeMenu();
        }
    }
}

function displayAll() {
    const pullRequestDiff = document.getElementById('pullrequest-diff');
    pullRequestDiff.classList.add('bbpr-open-all-diffs');
    closeMenu();
}

function hideAll() {
    const pullRequestDiff = document.getElementById('pullrequest-diff');
    pullRequestDiff.classList.remove('bbpr-open-all-diffs');
    closeMenu();
}

function setAllToReviewed() {
    getAllFileDiffs().forEach((fileDiff) => fileDiff.setReviewed());
    closeMenu();
}

function setAllSnapshotsToReviewed() {
    getAllFileDiffs().forEach((fileDiff) => {
        if (fileDiff.element.id.includes('.snap')) fileDiff.setReviewed();
    });
    closeMenu();
}

function setAllToUnreviewed() {
    getAllFileDiffs().forEach((fileDiff) => fileDiff.setUnreviewed());
    closeMenu();
}

function addHelperMenuEventListeners(menuContainer) {
    const menuButton = menuContainer.querySelector('.bbpr-menu-btn');
    const displayAllButton = menuContainer.querySelector('.bbpr-display-all-btn');
    const hideAllButton = menuContainer.querySelector('.bbpr-hide-all-btn');
    const markAllButton = menuContainer.querySelector('.bbpr-mark-all');
    const markAllSnapshotsButton = menuContainer.querySelector('.bbpr-mark-all-snapshots');
    const unmarkAllButton = menuContainer.querySelector('.bbpr-unmark-all');

    menuButton.addEventListener('click', toggleMenu);
    displayAllButton.addEventListener('click', displayAll);
    hideAllButton.addEventListener('click', hideAll);
    markAllButton.addEventListener('click', setAllToReviewed);
    markAllSnapshotsButton.addEventListener('click', setAllSnapshotsToReviewed);
    unmarkAllButton.addEventListener('click', setAllToUnreviewed);

    document.body.addEventListener('click', closeMenuOnBodyClick);
}

function initHelperMenu() {
    const pullRequestDiff = document.getElementById('pullrequest-diff');
    if (pullRequestDiff) {
        const menuContainer = createHelperMenuDom();
        addHelperMenuEventListeners(menuContainer);
        pullRequestDiff.insertBefore(menuContainer, pullRequestDiff.querySelector('#compare'));
    }
}

function repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, count = 0) {
    fileDiff.updateDisplay();
    if (count < 5) {
        setTimeout(() => { repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, count + 1); }, 100);
    }
}

function waitForFileSectionLoad(fileSectionSelector) {
    const fileDiffDom = document.querySelector(fileSectionSelector);
    if (fileDiffDom) {
        const fileDiff = new FileDiff(fileDiffDom);
        if (!fileDiff.isUIInitialized) {
            fileDiff.initUI();
            repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, 0);
        }
    } else {
        setTimeout(waitForFileSectionLoad, 100, fileSectionSelector);
    }
}

function getFileSectionSelector(identifier) {
    return `#changeset-diff .${DIFF_CSS_CLASSNAME}[data-path][data-identifier="${identifier}"]`;
}

const initIndividualFileDiffsUI = throttle(() => {
    const fileDiffs = getAllFileDiffs();
    fileDiffs.forEach((fileDiff) => {
        fileDiff.initUI();
        repeatInitUIToWorkAroundCommentLoadIssue(fileDiff);
    });
}, 1000);

function init() {
    initHelperMenu();
    initIndividualFileDiffsUI();

    if (window.location.hash.indexOf('#chg-') >= 0) {
        const identifier = window.location.hash.substring(5);

        const fileSectionSelector = getFileSectionSelector(identifier);
        waitForFileSectionLoad(fileSectionSelector);
    }
}

function isDiffTabActive() {
    const tabMenu = document.querySelector('.pr-tab-links');
    if (!tabMenu) {
        console.log('tab menu not found');
        return false;
    }
    const activeTab = tabMenu.querySelector('.active-tab [data-tab-link-id]');
    return !!activeTab && activeTab.dataset.tabLinkId === 'diff';
}

function waitForDiffLoad() {
    const resolveWhenLoaded = (resolve) => {
        const isDiffDomLoaded = !!document.querySelector('#pullrequest-diff .main');
        if (isDiffDomLoaded) {
            resolve();
        } else {
            setTimeout(() => resolveWhenLoaded(resolve), 100);
        }
    };

    return new Promise((resolve) => {
        if (!isDiffTabActive()) {
            resolve();
        }
        resolveWhenLoaded(resolve);
    });
}

function watchForDiffTabContentChanges() {
    const mutationObserver = new MutationObserver((mutations) => {
        const wereNodesAdded = mutations
            .some((mutation) => !!mutation.addedNodes && mutation.addedNodes.length > 0);
        if (wereNodesAdded && isDiffTabActive()) {
            initIndividualFileDiffsUI();
        }
    });
    const tabContentsNode = document.querySelector('#pr-tab-content-wrapper');
    if (tabContentsNode) {
        mutationObserver.observe(tabContentsNode, { childList: true, subtree: true });
    }
}

function handleScrolling() {
    const isBelowViewport = (rect, clientHeight, bottomBtn) => (
        rect.top > clientHeight - bottomBtn.offsetHeight - 10
    );
    const isAboveViewport = (rect) => rect.bottom < 0;
    const isBottomInView = (rect, clientHeight) => (
        rect.bottom > 0 && rect.bottom < clientHeight - 10
    );

    const updateBottomBtn = (rect, clientHeight, bottomBtn) => {
        if (isBelowViewport(rect, clientHeight, bottomBtn)) {
            bottomBtn.classList.remove('bbpr-affix', 'bbpr-affix-bottom');
        } else if (isAboveViewport(rect) || isBottomInView(rect, clientHeight)) {
            bottomBtn.classList.remove('bbpr-affix');
            bottomBtn.classList.add('bbpr-affix-bottom');
        } else {
            bottomBtn.classList.remove('bbpr-affix-bottom');
            bottomBtn.classList.add('bbpr-affix');
        }
    };

    const scrollHandler = throttle(() => {
        const { clientHeight } = document.documentElement;
        getAllFileDiffElements().forEach((element) => {
            const bottomBtnContainer = element.querySelector('.bbpr-bottom-btn-container');
            const bottomBtn = element.querySelector('.bbpr-bottom-btn');

            if (!bottomBtnContainer) {
                return;
            }

            const rect = bottomBtnContainer.getBoundingClientRect();
            updateBottomBtn(rect, clientHeight, bottomBtn);
        });
    }, 10);
    window.addEventListener('scroll', scrollHandler);
    scrollHandler();
}

(async function main() {
    await waitForDiffLoad();
    init();
    watchForDiffTabContentChanges();
    handleScrolling();
}());
