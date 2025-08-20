interface Characters {
    indent: string;
    straight: string;
    elbow: string;
    split: string;
}

const treeCharSets: Record<string, Characters> = {
    ascii: {
        indent: '   ',
        straight: '|  ',
        split: '|- ',
        elbow: '`- ',
    },
    heavy: {
        indent: '   ',
        straight: '┃  ',
        split: '┣━ ',
        elbow: '┗━ ',
    },
    double: {
        indent: '   ',
        straight: '║  ',
        split: '╠═ ',
        elbow: '╚═ ',
    },
    rounded: {
        indent: '   ',
        straight: '│  ',
        split: '╰─ ',
        elbow: '╰─ ',
    },
    arrows: {
        indent: '   ',
        straight: '→  ',
        split: '↳ ',
        elbow: '↴ ',
    },
    bullets: {
        indent: '   ',
        straight: '   ',
        split: '•  ',
        elbow: '•  ',
    },
    bulbs: {
        indent: '   ',
        straight: '│  ',
        split: '├○ ',
        elbow: '└○ ',
    },
    default: {
        indent: '   ',
        straight: '│  ',
        split: '├─ ',
        elbow: '└─ ',
    },
};

const ANSI = {
    reset: '\u001b[0m',

    bold: '\u001b[1m',
    dim: '\u001b[2m',
    italic: '\u001b[3m',
    underline: '\u001b[4m',
    inverse: '\u001b[7m',

    fg: {
        black: '\u001b[30m',
        red: '\u001b[31m',
        green: '\u001b[32m',
        yellow: '\u001b[33m',
        blue: '\u001b[34m',
        magenta: '\u001b[35m',
        cyan: '\u001b[36m',
        white: '\u001b[37m',
        brightBlack: '\u001b[90m',
        brightRed: '\u001b[91m',
        brightGreen: '\u001b[92m',
        brightYellow: '\u001b[93m',
        brightBlue: '\u001b[94m',
        brightMagenta: '\u001b[95m',
        brightCyan: '\u001b[96m',
        brightWhite: '\u001b[97m',
    },

    bg: {
        black: '\u001b[40m',
        red: '\u001b[41m',
        green: '\u001b[42m',
        yellow: '\u001b[43m',
        blue: '\u001b[44m',
        magenta: '\u001b[45m',
        cyan: '\u001b[46m',
        white: '\u001b[47m',
        brightBlack: '\u001b[100m',
        brightRed: '\u001b[101m',
        brightGreen: '\u001b[102m',
        brightYellow: '\u001b[103m',
        brightBlue: '\u001b[104m',
        brightMagenta: '\u001b[105m',
        brightCyan: '\u001b[106m',
        brightWhite: '\u001b[107m',
    },

    cursor: {
        up: (n = 1) => `\u001b[${n}A`,
        down: (n = 1) => `\u001b[${n}B`,
        forward: (n = 1) => `\u001b[${n}C`,
        back: (n = 1) => `\u001b[${n}D`,
        nextLine: (n = 1) => `\u001b[${n}E`,
        prevLine: (n = 1) => `\u001b[${n}F`,
        moveTo: (row: number, col: number) => `\u001b[${row};${col}H`,
        save: '\u001b[s',
        restore: '\u001b[u',
        hide: '\u001b[?25l',
        show: '\u001b[?25h',
    },

    erase: {
        screen: '\u001b[2J',
        screenDown: '\u001b[0J',
        screenUp: '\u001b[1J',
        line: '\u001b[2K',
        lineEnd: '\u001b[0K',
        lineStart: '\u001b[1K',
    },

    scroll: {
        up: (n = 1) => `\u001b[${n}S`,
        down: (n = 1) => `\u001b[${n}T`,
    },
};

type LogEntry = {
    message: string;
    children: LogEntry[];
};

interface StyleOptions {
    color?: keyof typeof ANSI.fg;
    background?: keyof typeof ANSI.bg;
    bold?: boolean;
    underline?: boolean;
    inverse?: boolean;
    italic?: boolean;
}

interface LogOptions {
    /** Applied to this log only */
    styles?: StyleOptions;
    /** Applied to this log and children */
    cascadingStyles?: StyleOptions;
    /** Applied to children only */
    childStyles?: StyleOptions;
    /** Character set to use, automatically cascades */
    charSet?: keyof typeof treeCharSets;
}

type LogOptionsWithoutColor = Omit<LogOptions, 'color'>;

class Logger {
    private charSet: keyof typeof treeCharSets = 'default';
    private entry: LogEntry;
    private parent?: Logger;
    private root: Logger;
    private options: LogOptions = {};

    constructor(message?: string, options: LogOptions = {}, parent?: Logger) {
        this.entry = {
            message: this.getMessage(message, {
                ...options.cascadingStyles,
                ...options.styles,
            }),
            children: [],
        };
        this.options = options;
        this.parent = parent;
        if (options.charSet) this.charSet = options.charSet;
        this.root = parent ? parent.root : this;
        if (parent) {
            parent.entry.children.push(this.entry);
        }
    }

    private getMessage(message: string, options: StyleOptions): string {
        let prefix: string[] = [];
        if (options?.color) prefix.push(ANSI.fg[options.color]);
        if (options?.background) prefix.push(ANSI.bg[options.background]);
        if (options?.bold) prefix.push(ANSI.bold);
        if (options?.underline) prefix.push(ANSI.underline);
        if (options?.inverse) prefix.push(ANSI.inverse);
        if (options?.italic) prefix.push(ANSI.italic);
        return prefix.join('') + message + ANSI.reset;
    }

    log(message: string, options: LogOptions = {}): Logger {
        const mergedOptions: LogOptions = {
            charSet: options.charSet ?? this.options.charSet,
            cascadingStyles: {
                ...this.options.cascadingStyles,
                ...options.cascadingStyles,
            },
            childStyles: {
                ...this.options.childStyles,
                ...options.childStyles,
            },
            styles: {
                ...this.options.cascadingStyles,
                ...this.options.childStyles,
                ...options.styles,
            },
        };

        return new Logger(message, mergedOptions, this);
    }

    red(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'red' },
        });
    }
    brightRed(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightRed' },
        });
    }

    yellow(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightYellow' },
        });
    }
    brightYellow(
        message: string,
        options: LogOptionsWithoutColor = {},
    ): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'yellow' },
        });
    }

    green(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'green' },
        });
    }
    brightGreen(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightGreen' },
        });
    }

    blue(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'blue' },
        });
    }
    brightBlue(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightBlue' },
        });
    }

    magenta(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'magenta' },
        });
    }
    brightMagenta(
        message: string,
        options: LogOptionsWithoutColor = {},
    ): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightMagenta' },
        });
    }

    cyan(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'cyan' },
        });
    }
    brightCyan(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightCyan' },
        });
    }

    white(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'white' },
        });
    }
    brightWhite(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightWhite' },
        });
    }

    black(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'black' },
        });
    }
    brightBlack(message: string, options: LogOptionsWithoutColor = {}): Logger {
        return this.log(message, {
            ...options,
            styles: { ...options.styles, color: 'brightBlack' },
        });
    }

    draw() {
        this.printEntry(this.entry, [], true, true);
    }

    private printEntry(
        entry: LogEntry,
        prefix: string[],
        isLast: boolean,
        isRoot = false,
    ): number {
        let lines = 0;

        if (entry.message) {
            if (isRoot) {
                process.stdout.write(entry.message + '\n');
                lines++;
            } else {
                const branch = isLast
                    ? treeCharSets[this.charSet].elbow
                    : treeCharSets[this.charSet].split;
                process.stdout.write(
                    ANSI.fg.brightBlack +
                        prefix.join('').replace('   ', '') +
                        branch +
                        ANSI.reset +
                        entry.message +
                        '\n',
                );
                lines++;
            }
        }

        const childPrefix = [...prefix];
        if (!isRoot) {
            childPrefix.push(
                isLast
                    ? treeCharSets[this.charSet].indent
                    : treeCharSets[this.charSet].straight,
            );
        } else {
            childPrefix.push(treeCharSets[this.charSet].indent);
        }

        entry.children.forEach((child, i) => {
            const last = i === entry.children.length - 1;
            lines += this.printEntry(child, childPrefix, last, false);
        });

        return lines;
    }
}

export function log(message: string, options: LogOptions = {}): Logger {
    return new Logger(message, options);
}
