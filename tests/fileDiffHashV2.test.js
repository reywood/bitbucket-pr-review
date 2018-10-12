describe('FileDiffHashV2', function () {
    let diffElement;
    let diffDomElementBuilder;

    beforeEach(function () {
        diffDomElementBuilder = new DiffDomElementBuilder('path/to/file');
        diffDomElementBuilder.addCommonDiffLine('a');
        diffDomElementBuilder.addDeletionDiffLine(' b ');
        diffDomElementBuilder.addCommonDiffLine('  c  ', true);
        diffDomElementBuilder.addAdditionDiffLine('   d   ');
        diffDomElementBuilder.addComment('10001', 'Jane Doe', 'This is a test', '2017-01-01T12:00:00-07:00');
        diffDomElementBuilder.addComment('10003', 'Amy Clark', 'This is a reply', '2017-01-01T12:02:00-07:00');
        diffDomElementBuilder.addComment('10002', 'John Smith', ' This is another test ', '2017-01-01T12:01:00-07:00');
        diffElement = diffDomElementBuilder.build();
    });

    afterEach(function () {
        DiffDomElementBuilder.cleanUp();
    });

    describe('.serializeDiffLines()', function () {
        it('should serialize diff lines', function it() {
            const fileDiffHash = new FileDiffHashV2(new FileDiff(diffElement));

            const expected = '[["deletion","2,"," b "],["addition",",3","   d   "]]';
            chai.expect(fileDiffHash.serializeDiffLines()).to.equal(expected);
        });
    });

    describe('.serializeComments()', function () {
        it('should serialize comments', function it() {
            const fileDiffHash = new FileDiffHashV2(new FileDiff(diffElement));

            const expected = '[["10001","Jane Doe","This is a test","2017-01-01T12:00:00-07:00"],["10002","John Smith","This is another test","2017-01-01T12:01:00-07:00"],["10003","Amy Clark","This is a reply","2017-01-01T12:02:00-07:00"]]';
            chai.expect(fileDiffHash.serializeComments()).to.equal(expected);
        });
    });

    describe('.hash()', function () {
        it('should hash file diff', function it() {
            const fileDiffHash = new FileDiffHashV2(new FileDiff(diffElement));

            return fileDiffHash.hash().then((hash) => {
                chai.expect(hash).to.equal('98870172036fc62d6fd5580ed781944ccbba8147');
            });
        });
    });
});
