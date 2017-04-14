describe('FileDiffHashV1', function () {
    const diffDomElementBuilder = new DiffDomElementBuilder('path/to/file');
    diffDomElementBuilder.addCommonDiffLine('a');
    diffDomElementBuilder.addDeletionDiffLine(' b ');
    diffDomElementBuilder.addCommonDiffLine('  c  ');
    diffDomElementBuilder.addAdditionDiffLine('   d   ');
    diffDomElementBuilder.addComment('10001', 'Jane Doe', 'This is a test', '2017-01-01T12:00:00-07:00');
    diffDomElementBuilder.addComment('10003', 'Amy Clark', 'This is a reply', '2017-01-01T12:02:00-07:00');
    diffDomElementBuilder.addComment('10002', 'John Smith', ' This is another test ', '2017-01-01T12:01:00-07:00');
    const diffElement = diffDomElementBuilder.build();

    describe('.serializeDiffLines()', function () {
        it('should serialize diff lines', function it() {
            const fileDiffHash = new FileDiffHashV1(new FileDiff(diffElement));

            const expected = 'udiff-line common\n1,1\na\nudiff-line deletion\n2,undefined\n b \nudiff-line common\n3,2\n  c  \nudiff-line addition\nundefined,3\n   d   ';
            chai.expect(fileDiffHash.serializeDiffLines()).to.equal(expected);
        });
    });

    describe('.serializeComments()', function () {
        it('should serialize comments', function it() {
            const fileDiffHash = new FileDiffHashV1(new FileDiff(diffElement));

            const expected = 'comment-10001\nJane Doe\n\n                                                This is a test\n                                            \n2017-01-01T12:00:00-07:00\ncomment-10003\nAmy Clark\n\n                                                This is a reply\n                                            \n2017-01-01T12:02:00-07:00\ncomment-10002\nJohn Smith\n\n                                                 This is another test \n                                            \n2017-01-01T12:01:00-07:00';
            chai.expect(fileDiffHash.serializeComments()).to.equal(expected);
        });
    });

    describe('.hash()', function () {
        it('should hash file diff', function it() {
            const fileDiff = new FileDiffHashV1(new FileDiff(diffElement));

            return fileDiff.hash().then((hash) => {
                chai.expect(hash).to.equal('51a68e5fb777350cc3fd9958bd3bfb9e5e71cbf4');
            });
        });
    });
});
