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
    const menuButton = menuContainer.querySelector('.bbpr-menu-btn');
    const displayAllButton = menuContainer.querySelector('.bbpr-display-all-btn');
    const hideAllButton = menuContainer.querySelector('.bbpr-hide-all-btn');
    if (e.target === menuButton || e.target === displayAllButton || e.target === hideAllButton) {
        return;
    }
    menuContainer.classList.remove('bbpr-open');
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

function waitForLoad() {
    const waitForElement = document.querySelector('#pullrequest-diff .main');
    if (waitForElement) {
        init();
    } else {
        setTimeout(waitForLoad, 100);
    }
}

waitForLoad();
