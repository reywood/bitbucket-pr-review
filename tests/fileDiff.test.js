describe('FileDiff', function () {
    const filePath = 'folder1/folder 2/file with spaces 😃.txt';
    const encodedFilePath = 'folder1/folder%202/file%20with%20spaces%20%F0%9F%98%83.txt';
    let diffElement;
    let diffDomElementBuilder;

    beforeEach(function () {
        chrome.storage.local.reset();
        chrome.storage.sync.reset();

        diffDomElementBuilder = new DiffDomElementBuilder(filePath, encodedFilePath);
        diffDomElementBuilder.addCommonDiffLine('a');
        diffDomElementBuilder.addDeletionDiffLine(' b ');
        diffDomElementBuilder.addCommonDiffLine('  c  ');
        diffDomElementBuilder.addAdditionDiffLine('   d   ');
        diffDomElementBuilder.addComment('10001', 'Jane Doe', 'This is a test', '2017-01-01T12:00:00-07:00');
        diffDomElementBuilder.addComment('10003', 'Amy Clark', 'This is a reply', '2017-01-01T12:02:00-07:00');
        diffDomElementBuilder.addComment('10002', 'John Smith', ' This is another test ', '2017-01-01T12:01:00-07:00');
        diffElement = diffDomElementBuilder.build();
    });

    afterEach(function () {
        DiffDomElementBuilder.cleanUp();
    });

    describe('.hasBeenReviewed()', function () {
        it('should indicate file has not been reviewed', function () {
            const fileDiff = new FileDiff(diffElement);

            return fileDiff.hasBeenReviewed().then((reviewed) => {
                chai.expect(reviewed).to.be.false;
            });
        });

        it('should indicate file has been reviewed with v2 hash if value stored in local storage', function () {
            const fileDiff = new FileDiff(diffElement);
            const hashV2 = new FileDiffHashV2(fileDiff);

            return hashV2.hash()
                .then((hash) => {
                    chrome.storage.local.set({ [`jane-doe/my-repo::master::pr100::${filePath}`]: hash }, () => {});
                })
                .then(() => fileDiff.hasBeenReviewed())
                .then((reviewed) => {
                    chai.expect(reviewed).to.be.true;
                });
        });

        it('should indicate file has been reviewed with v2 hash if value stored in sync storage', function () {
            const fileDiff = new FileDiff(diffElement);
            const hashV2 = new FileDiffHashV2(fileDiff);

            return hashV2.hash()
                .then((hash) => {
                    chrome.storage.sync.set({ [`jane-doe/my-repo::master::pr100::${filePath}`]: hash }, () => {});
                })
                .then(() => fileDiff.hasBeenReviewed())
                .then((reviewed) => {
                    chai.expect(reviewed).to.be.true;
                });
        });

        it('should indicate file has been reviewed with v1 hash', function () {
            const fileDiff = new FileDiff(diffElement);
            const hashV1 = new FileDiffHashV1(fileDiff);

            return hashV1.hash()
                .then((hash) => {
                    chrome.storage.local.set({ [`jane-doe/my-repo::master::pr100::${filePath}`]: hash }, () => {});
                })
                .then(() => fileDiff.hasBeenReviewed())
                .then((reviewed) => {
                    chai.expect(reviewed).to.be.true;
                });
        });
    });

    describe('.updateDisplay()', function () {
        it('should update display', function () {
            const fileDiff = new FileDiff(diffElement);
            return fileDiff.updateDisplay();
        });
    });
});
