async function sha1(message) {
    const msgBuffer = new TextEncoder('utf-8').encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => (`00${b.toString(16)}`).slice(-2)).join('');
    return hashHex;
}

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
            .map(comment => [
                comment.dataset.commentId,
                comment.querySelector('.author').textContent,
                comment.dataset.content.trim(),
                comment.querySelector('time').getAttribute('datetime'),
            ])
            .sort((a, b) => (a[0] > b[0] ? 1 : -1));
        return JSON.stringify(parsedComments);
    }
}


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
        return Array.from(containerElement.querySelectorAll('.comment article'))
            .map((comment) => {
                const parts = [
                    comment.id,
                    comment.querySelector('.author').textContent,
                    comment.querySelector('.comment-content').textContent,
                    comment.querySelector('time').getAttribute('datetime'),
                ];
                return parts.join('\n');
            })
            .join('\n');
    }
}
