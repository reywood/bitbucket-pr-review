class FileDiffHashV2 { // eslint-disable-line no-unused-vars
    constructor(fileDiff) {
        this.fileDiff = fileDiff;
    }

    async hash() {
        const lineContent = this.serializeDiffLines();
        const commentContent = this.serializeComments();

        const textHash = await sha1(`${lineContent}\n${commentContent}`);
        return textHash;
    }

    serializeDiffLines() {
        const parsedDiffs = Array.from(this.fileDiff.element.querySelectorAll('.diff-content-container .udiff-line:not(.common)'))
            .map((line) => {
                const lineNumbers = line.querySelector('.line-numbers');
                const source = line.querySelector('.source');
                const fnum = lineNumbers.dataset.fnum || '';
                const tnum = lineNumbers.dataset.tnum || '';
                return [
                    line.className.replace(/\s*udiff-line\s*/, ''),
                    `${fnum},${tnum}`,
                    source.textContent,
                ];
            });
        return JSON.stringify(parsedDiffs);
    }

    serializeComments() {
        const parsedComments = Array.from(this.fileDiff.element.querySelectorAll('.diff-content-container .comment article'))
            .map((comment) => [
                comment.dataset.commentId,
                comment.querySelector('.author, .author-name').textContent,
                comment.dataset.content.trim(),
                comment.querySelector('time').getAttribute('datetime'),
            ])
            .sort((a, b) => (a[0] > b[0] ? 1 : -1));
        return JSON.stringify(parsedComments);
    }
}
