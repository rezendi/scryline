export default class Entry {
    constructor(vals) {
        this.id = vals.id || -1;
        this.originalUrl = vals.originalUrl || '';
        this.url = vals.url || '';
        this.when = vals.when || '';
        this.author = vals.author || '';
        this.source = vals.source || '';
        this.logo = vals.logo || '';
        this.image = vals.image || '';
        this.title = vals.title || '';
        this.summary = vals.summary || '';
        this.comments = vals.comments || '';
        this.suggestions = vals.suggestions || '';
        this.tags = vals.tags || '';
        this.chapter = vals.chapter || '';
    }
}