function repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, count) {
    fileDiff.updateDisplay();
    if (count < 5) {
        setTimeout(() => { repeatInitUIToWorkAroundCommentLoadIssue(fileDiff, count + 1); }, 100);
    }
}


function init() {
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
