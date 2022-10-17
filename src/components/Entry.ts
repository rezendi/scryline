export default class Entry {
    id: number;
    originalUrl: string;
    url: string;
    when: string;
    originalWhen: string;
    author: string;
    source: string;
    logo: string;
    image: string;
    title: string;
    summary: string;
    comments: string;
    suggestions: string;
    tags: string;
    chapter: string;

    constructor(vals) {
        this.id = vals.id || -1;
        this.originalUrl = vals.originalUrl || '';
        this.url = vals.url || '';
        this.when = vals.when || '';
        this.originalWhen = vals.originalWhen || '';
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