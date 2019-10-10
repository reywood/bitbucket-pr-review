class FileDiffHashV1 { // eslint-disable-line no-unused-vars
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
        const containerElement = this.fileDiff.element.querySelector('.diff-content-container');
        if (!containerElement) {
            return '';
        }
        return Array.from(containerElement.querySelectorAll('.udiff-line'))
            .map((line) => {
                const lineNumbers = line.querySelector('.line-numbers');
                const source = line.querySelector('.source');
                const parts = [
                    line.className,
                    `${lineNumbers.dataset.fnum},${lineNumbers.dataset.tnum}`,
                    source.innerText,
                ];
                return parts.join('\n');
            })
            .join('\n');
    }

    serializeComments() {
        const containerElement = this.fileDiff.element.querySelector('.diff-content-container');
        if (!containerElement) {
            return '';
        }
        return Array.from(containerElement.querySelectorAll('.comment article'))
            .map((comment) => {
                const parts = [
                    comment.id,
                    comment.querySelector('.author, .author-name').textContent,
                    comment.querySelector('.comment-content').textContent,
                    comment.querySelector('time').getAttribute('datetime'),
                ];
                return parts.join('\n');
            })
            .join('\n');
    }
}
