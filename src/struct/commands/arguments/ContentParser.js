/*
 * Grammar:
 *
 * Arguments
 *  = (Argument (WS? Argument)*)? EOF
 *
 * Argument
 *  = Flag
 *  | Phrase
 *
 * Flag
 *  = FlagWord
 *  | OptionFlagWord WS? Phrase?
 *
 * Phrase
 *  = Quote (Word | WS)* Quote?
 *  | OpenQuote (Word | OpenQuote | Quote | WS)* EndQuote?
 *  | EndQuote
 *  | Word
 *
 * FlagWord = Given
 * OptionFlagWord = Given
 * Quote = "
 * OpenQuote = “
 * EndQuote = ”
 * Word = /^\S+/ (and not in FlagWord or OptionFlagWord)
 * WS = /^\s+/
 * EOF = /^$/
 */

class ContentParser {
    /**
     * Parser for getting phrases and flags out of content.
     * @param {ContentParserOptions} options - Options for the parser.
     */
    constructor({
        flagWords = [],
        optionFlagWords = [],
        quoted = true,
        separator
    } = {}) {
        /**
         * Flags considered to be part of a flag arg.
         * @type {string[]}
         */
        this.flagWords = flagWords;
        this.flagWords.sort((a, b) => b.length - a.length);

        /**
         * Flags considered to be part of an option flag arg.
         * @type {string[]}
         */
        this.optionFlagWords = optionFlagWords;
        this.optionFlagWords.sort((a, b) => b.length - a.length);

        /**
         * Whether or not to consider quotes.
         * @type {boolean}
         */
        this.quoted = Boolean(quoted);

        /**
         * A custom separator.
         * @type {string}
         */
        this.separator = separator;
    }

    parse(content) {
        if (this.separator != null) {
            const parts = {
                content: [],
                phrases: [],
                flags: [],
                optionFlags: []
            };

            const sep = this.separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matches = content.match(new RegExp(`((?!${sep}).)+|(${sep})`, 'gi'));

            if (!matches) return parts;
            let prev;
            outer: for (const match of matches) {
                if (match.toLowerCase() === sep.toLowerCase()) {
                    prev.content += match;
                    parts.content[parts.content.length - 1] += match;
                    continue;
                }

                const trimmed = match.trim();
                for (const word of this.flagWords) {
                    if (trimmed.toLowerCase() === word.toLowerCase()) {
                        prev = {
                            type: 'Flag',
                            key: trimmed,
                            content: match
                        };

                        parts.flags.push(prev);
                        parts.content.push(match);
                        continue outer;
                    }
                }

                for (const word of this.optionFlagWords) {
                    if (trimmed.toLowerCase().startsWith(word.toLowerCase())) {
                        prev = {
                            type: 'OptionFlag',
                            key: trimmed.slice(0, word.length),
                            value: trimmed.slice(word.length).trim(),
                            content: match
                        };

                        parts.optionFlags.push(prev);
                        parts.content.push(match);
                        continue outer;
                    }
                }

                prev = {
                    type: 'Phrase',
                    value: trimmed,
                    content: match
                };

                parts.phrases.push(prev);
                parts.content.push(match);
            }

            return parts;
        }

        return new ContentParserState(this, content).parse();
    }
}

class ContentParserState {
    /**
     * The ongoing parsing (without separators).
     * @param {ContentParser} parser - The content parser.
     * @param {string} content - Content to parse.
     */
    constructor(parser, content) {
        /**
         * The content parser.
         * @type {ContentParser}
         */
        this.parser = parser;

        /**
         * Content to parse.
         * @type {string}
         */
        this.content = content;

        /**
         * List of tokens.
         * @type {Object[]}
         */
        this.tokens = this.tokenize();

        /**
         * Position in the tokens.
         * @type {number}
         */
        this.position = 0;
    }

    /**
     * Tokenizes the content.
     * @returns {Object[]}
     */
    tokenize() {
        const tokens = [];
        let content = this.content;
        let state = 0;
        outer: while (content.length) {
            if (state === 0) {
                for (const word of this.parser.flagWords) {
                    if (content.toLowerCase().startsWith(word.toLowerCase())) {
                        tokens.push(this.createToken('FlagWord', content.slice(0, word.length)));
                        content = content.slice(word.length);
                        continue outer;
                    }
                }

                for (const word of this.parser.optionFlagWords) {
                    if (content.toLowerCase().startsWith(word.toLowerCase())) {
                        tokens.push(this.createToken('OptionFlagWord', content.slice(0, word.length)));
                        content = content.slice(word.length);
                        continue outer;
                    }
                }
            }

            if (this.parser.quoted && content.toLowerCase().startsWith('"')) {
                if (state === 1) {
                    state = 0;
                } else if (state === 0) {
                    state = 1;
                }

                tokens.push(this.createToken('Quote', '"'));
                content = content.slice(1);
                continue outer;
            }

            if (this.parser.quoted && content.toLowerCase().startsWith('“')) {
                if (state === 0) {
                    state = 2;
                }

                tokens.push(this.createToken('OpenQuote', '“'));
                content = content.slice(1);
                continue outer;
            }

            if (this.parser.quoted && content.toLowerCase().startsWith('”')) {
                if (state === 2) {
                    state = 0;
                }

                tokens.push(this.createToken('EndQuote', '”'));
                content = content.slice(1);
                continue outer;
            }

            const wordRe = state === 0 ? /^\S+/ : state === 1 ? /^[^\s"]+/ : /^[^\s”]+/;
            const wordMatch = content.match(wordRe);
            if (wordMatch) {
                tokens.push(this.createToken('Word', wordMatch[0]));
                content = content.slice(wordMatch[0].length);
                continue;
            }

            const wsMatch = content.match(/^\s+/);
            if (wsMatch) {
                tokens.push(this.createToken('WS', wsMatch[0]));
                content = content.slice(wsMatch[0].length);
                continue;
            }
        }

        tokens.push(this.createToken('EOF', ''));
        return tokens;
    }

    /**
     * Creates a token.
     * @param {string} type - Type of the token.
     * @param {string} value - Value of the token.
     * @returns {Object}
     */
    createToken(type, value) {
        return { type, value };
    }

    /**
     * Gets the current token.
     * @type {Object}
     */
    get token() {
        return this.tokens[this.position];
    }

    /**
     * Increments position by 1.
     * @returns {void}
     */
    next() {
        this.position++;
    }

    /**
     * Checks if the current token could match.
     * @param {...string} types - Types of tokens to match.
     * @returns {boolean}
     */
    check(...types) {
        return types.includes(this.tokens[this.position].type);
    }

    /**
     * Matches the current token.
     * @param {...string} types - Types of tokens to match.
     * @returns {Object}
     */
    match(...types) {
        if (types.includes(this.tokens[this.position].type)) {
            this.next();
            return this.tokens[this.position - 1];
        }

        throw new Error('Parsing did not match something (this should never happen)');
    }

    /**
     * Parses the tokens into an object with representations of the original content.
     * @returns {Object}
     */
    parse() {
        const parts = {
            content: [],
            phrases: [],
            flags: [],
            optionFlags: []
        };

        if (!this.check('EOF')) {
            let prev = this.parseArgument();
            parts[prev.type === 'Flag' ? 'flags' : prev.type === 'OptionFlag' ? 'optionFlags' : 'phrases'].push(prev);
            parts.content.push(prev.content);

            while (!this.check('EOF')) {
                if (this.check('WS')) {
                    const ws = this.match('WS').value;
                    prev.content += ws;
                    parts.content[parts.content.length - 1] += ws;
                }

                prev = this.parseArgument();
                parts[prev.type === 'Flag' ? 'flags' : prev.type === 'OptionFlag' ? 'optionFlags' : 'phrases'].push(prev);
                parts.content.push(prev.content);
            }
        }

        this.match('EOF');
        return parts;
    }

    /**
     * Parses one argument.
     * @returns {Object}
     */
    parseArgument() {
        if (this.check('FlagWord', 'OptionFlagWord')) {
            return this.parseFlag();
        }

        return this.parsePhrase();
    }

    /**
     * Parses one flag.
     * @returns {Object}
     */
    parseFlag() {
        if (this.check('FlagWord')) {
            const flag = { type: 'Flag', key: this.match('FlagWord').value };
            flag.content = flag.key;
            return flag;
        }

        const flag = { type: 'OptionFlag', key: this.match('OptionFlagWord').value };
        const separation = this.check('WS') ? this.match('WS').value : '';
        flag.value = this.check('Quote', 'OpenQuote', 'EndQuote', 'Word') ? this.parsePhrase().value : '';
        flag.content = `${flag.key}${separation}${flag.value}`;
        return flag;
    }

    /**
     * Parses one phrase.
     * @returns {Object}
     */
    parsePhrase() {
        if (this.check('Quote')) {
            const phrase = {
                type: 'Phrase',
                value: ''
            };

            const openQuote = this.match('Quote').value;
            while (this.check('Word', 'WS')) {
                const match = this.match('Word', 'WS');
                phrase.value += match.value;
            }

            const endQuote = this.check('Quote') ? this.match('Quote').value : '';
            phrase.content = `${openQuote}${phrase.value}${endQuote}`;
            return phrase;
        }

        if (this.check('OpenQuote')) {
            const phrase = {
                type: 'Phrase',
                value: ''
            };

            const openQuote = this.match('OpenQuote').value;
            while (this.check('Word', 'OpenQuote', 'Quote', 'WS')) {
                const match = this.match('Word', 'OpenQuote', 'Quote', 'WS');
                phrase.value += match.v;
            }

            const endQuote = this.check('EndQuote') ? this.match('EndQuote').value : '';
            phrase.content = `${openQuote}${phrase.value}${endQuote}`;
            return phrase;
        }

        if (this.check('EndQuote')) {
            const phrase = { type: 'Phrase', value: this.match('EndQuote').value };
            phrase.content = phrase.value;
            return phrase;
        }

        const phrase = { type: 'Phrase', value: this.match('Word').value };
        phrase.content = phrase.value;
        return phrase;
    }
}

Object.assign(ContentParser, { ContentParserState });
module.exports = ContentParser;

/**
 * @typedef {Object} ContentParserOptions
 * @prop {string[]} [flagWords=[]] - Flags considered to be part of a flag arg.
 * @prop {string[]} [optionFlagWords=[]] - Flags considered to be part of an option flag arg.
 * @prop {boolean} [quoted=true] - Whether or not to consider quotes.
 * @prop {string} [separator] - A custom separator.
 */
