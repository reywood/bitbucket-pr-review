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

            const expected = 'udiff-line common\n' +
                             '1,1\n' +
                             'a\n' +
                             'udiff-line deletion\n' +
                             '2,undefined\n' +
                             ' b \n' +
                             'udiff-line common\n' +
                             '3,2\n' +
                             '  c  \n' +
                             'udiff-line addition\n' +
                             'undefined,3\n' +
                             '   d   ';
            chai.expect(fileDiffHash.serializeDiffLines()).to.equal(expected);
        });
    });

    describe('.serializeComments()', function () {
        it('should serialize comments', function it() {
            const fileDiffHash = new FileDiffHashV1(new FileDiff(diffElement));

            const expected = 'comment-10001\n' +
                             'Jane Doe\n\n' +
                             '                                                This is a test\n' +
                             '                                            \n' +
                             '2017-01-01T12:00:00-07:00\n' +
                             'comment-10003\n' +
                             'Amy Clark\n\n' +
                             '                                                This is a reply\n' +
                             '                                            \n' +
                             '2017-01-01T12:02:00-07:00\n' +
                             'comment-10002\n' +
                             'John Smith\n\n' +
                             '                                                 This is another test \n' +
                             '                                            \n' +
                             '2017-01-01T12:01:00-07:00';
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
