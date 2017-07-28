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
        </ul>
    `;
    return menuContainer;
}

function openMenu() {
    const menuContainer = document.getElementById('bbpr-menu');
    menuContainer.classList.toggle('bbpr-open');
}

function closeMenuOnBodyClick(e) {
    const menuContainer = document.getElementById('bbpr-menu');
    if (menuContainer) {
        const menuButton = menuContainer.querySelector('.bbpr-menu-btn');
        const displayAllButton = menuContainer.querySelector('.bbpr-display-all-btn');
        const hideAllButton = menuContainer.querySelector('.bbpr-hide-all-btn');
        const isMenuClick = (
            e.target === menuButton ||
            e.target === displayAllButton ||
            e.target === hideAllButton
        );
        if (isMenuClick) {
            return;
        }
        menuContainer.classList.remove('bbpr-open');
    }
}

function displayAll() {
    const pullRequestDiff = document.getElementById('pullrequest-diff');
    const menuContainer = document.getElementById('bbpr-menu');
    pullRequestDiff.classList.add('bbpr-open-all-diffs');
    menuContainer.classList.remove('bbpr-open');
}

function hideAll() {
    const pullRequestDiff = document.getElementById('pullrequest-diff');
    const menuContainer = document.getElementById('bbpr-menu');
    pullRequestDiff.classList.remove('bbpr-open-all-diffs');
    menuContainer.classList.remove('bbpr-open');
}

function addHelperMenuEventListeners(menuContainer) {
    const menuButton = menuContainer.querySelector('.bbpr-menu-btn');
    const displayAllButton = menuContainer.querySelector('.bbpr-display-all-btn');
    const hideAllButton = menuContainer.querySelector('.bbpr-hide-all-btn');
    menuButton.addEventListener('click', openMenu);
    displayAllButton.addEventListener('click', displayAll);
    hideAllButton.addEventListener('click', hideAll);
    document.body.addEventListener('click', closeMenuOnBodyClick);
}

function initHelperMenu() {
    const pullRequestDiff = document.getElementById('pullrequest-diff');
    const menuContainer = createHelperMenuDom();
    addHelperMenuEventListeners(menuContainer);
    pullRequestDiff.insertBefore(menuContainer, pullRequestDiff.querySelector('#compare'));
}

function repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, count) {
    fileDiff.updateDisplay();
    if (count < 5) {
        setTimeout(() => { repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, count + 1); }, 100);
    }
}

function init() {
    initHelperMenu();

    const fileDiffs = Array.from(document.querySelectorAll('#changeset-diff .bb-udiff'))
        .map(section => new FileDiff(section));

    fileDiffs.forEach((fileDiff) => {
        fileDiff.initUI();
        repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, 0);
    });
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
    if (!isDiffTabActive()) {
        return;
    }

    const isDiffDomLoaded = !!document.querySelector('#pullrequest-diff .main');
    if (isDiffDomLoaded) {
        init();
    } else {
        setTimeout(waitForDiffLoad, 100);
    }
}

function addDiffTabClickHandler() {
    const tabMenuDiffLink = document.querySelector('.pr-tab-links #pr-menu-diff');
    if (tabMenuDiffLink) {
        tabMenuDiffLink.addEventListener('click', () => {
            setTimeout(waitForDiffLoad, 100);
        });
    }
}

waitForDiffLoad();
addDiffTabClickHandler();
