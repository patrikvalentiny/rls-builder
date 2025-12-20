import type { CreatePolicy } from '../types/createPolicy';

class PolicyParser {
    private pos = 0;
    private input: string;
    private length: number;

    constructor(input: string) {
        this.input = input;
        this.length = input.length;
    }

    /**
     * Main entry point for parsing a CREATE POLICY statement.
     * Implements a recursive descent parser for the SQL syntax.
     */
    public parse(): CreatePolicy {
        this.expectKeyword('CREATE');
        this.expectKeyword('POLICY');
        
        this.skipWhitespace();
        if (this.peekWord() === 'ON') {
            throw new Error(`Expected identifier at position ${this.pos}`);
        }

        const name = this.parseIdentifier();

        this.expectKeyword('ON');

        const part1 = this.parseIdentifier();
        let schema = 'public';
        let table = part1;

        this.skipWhitespace();
        if (this.peek() === '.') {
            this.consume();
            schema = part1;
            table = this.parseIdentifier();
        }

        let asClause: 'PERMISSIVE' | 'RESTRICTIVE' = 'PERMISSIVE';
        if (this.matchKeyword('AS')) {
            const type = this.parseKeyword();
            if (type !== 'PERMISSIVE' && type !== 'RESTRICTIVE') {
                throw new Error(`Expected PERMISSIVE or RESTRICTIVE, found ${type}`);
            }
            asClause = type;
        }

        let forClause: 'ALL' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'ALL';
        if (this.matchKeyword('FOR')) {
            const cmd = this.parseKeyword();
            if (!['ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(cmd)) {
                throw new Error(`Invalid command: ${cmd}`);
            }
            forClause = cmd as typeof forClause;
        }

        let toClause = 'public';
        if (this.matchKeyword('TO')) {
            const startPos = this.pos;
            while (this.pos < this.length) {
                this.skipWhitespace();
                const nextWord = this.peekWord();
                if (nextWord && ['USING', 'WITH', 'AS', 'FOR'].includes(nextWord)) {
                    break;
                }
                if (this.peek() === ';') break;
                this.advance();
            }
            toClause = this.input.substring(startPos, this.pos).trim();
            // Remove surrounding quotes if it's a simple quoted identifier
            if (toClause.startsWith('"') && toClause.endsWith('"') && !toClause.includes(',', 1)) {
                 toClause = toClause.replace(/^"|"$/g, '');
            }
        }

        let usingClause = '';
        if (this.matchKeyword('USING')) {
            usingClause = this.parseParenthesizedExpression();
        }

        let withCheckClause = '';
        if (this.matchKeyword('WITH')) {
            this.expectKeyword('CHECK');
            withCheckClause = this.parseParenthesizedExpression();
        }
        
        this.skipWhitespace();
        if (this.peek() === ';') {
            this.consume();
        }

        this.skipWhitespace();
        if (this.pos < this.length) {
            throw new Error(`Unexpected input at position ${this.pos}: "${this.input.slice(this.pos)}"`);
        }

        return {
            name,
            schema,
            table,
            as: asClause,
            for: forClause,
            to: toClause,
            using: usingClause,
            withCheck: withCheckClause
        };
    }

    /**
     * Returns the character at the current position without advancing.
     */
    private peek(): string {
        return this.input[this.pos] || '';
    }

    /**
     * Returns the character at the current position and advances the cursor.
     */
    private consume(): string {
        return this.input[this.pos++] || '';
    }

    /**
     * Advances the cursor by one position.
     */
    private advance(): void {
        this.pos++;
    }

    /**
     * Advances the cursor past any whitespace characters.
     */
    private skipWhitespace(): void {
        while (this.pos < this.length && /\s/.test(this.input[this.pos])) {
            this.pos++;
        }
    }

    /**
     * Checks if the next token matches the given keyword (case-insensitive).
     * If it matches, consumes the token and returns true.
     * If not, resets position and returns false.
     */
    private matchKeyword(keyword: string): boolean {
        const savedPos = this.pos;
        this.skipWhitespace();
        const word = this.peekWord();
        if (word === keyword) {
            this.parseKeyword();
            return true;
        }
        this.pos = savedPos;
        return false;
    }

    /**
     * Asserts that the next token matches the given keyword.
     * Throws an error if the match fails.
     */
    private expectKeyword(keyword: string): void {
        if (!this.matchKeyword(keyword)) {
            throw new Error(`Expected keyword ${keyword} at position ${this.pos}`);
        }
    }

    /**
     * Scans ahead for the next alphanumeric word without consuming it.
     * Returns the word in uppercase for keyword comparison.
     */
    private peekWord(): string | null {
        let p = this.pos;
        while (p < this.length && /\s/.test(this.input[p])) p++;
        if (p >= this.length) return null;
        const match = this.input.slice(p).match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
        return match ? match[1].toUpperCase() : null;
    }

    /**
     * Consumes and returns the next alphanumeric word.
     * Returns the word in uppercase.
     */
    private parseKeyword(): string {
        this.skipWhitespace();
        const match = this.input.slice(this.pos).match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (match) {
            this.pos += match[0].length;
            return match[1].toUpperCase();
        }
        return '';
    }

    /**
     * Parses a SQL identifier.
     * Handles double-quoted identifiers (preserving case/content) and unquoted identifiers.
     */
    private parseIdentifier(): string {
        this.skipWhitespace();
        const char = this.peek();
        if (char === '"') {
            this.consume();
            let value = '';
            while (this.pos < this.length && this.peek() !== '"') {
                value += this.consume();
            }
            this.consume();
            return value;
        } else {
            const match = this.input.slice(this.pos).match(/^([a-zA-Z0-9_]+)/);
            if (match) {
                const word = match[1];
                // Prevent keywords from being parsed as identifiers
                // This ensures that if a table/schema name is missing, we don't consume the next keyword
                const reserved = [
                    'CREATE', 'POLICY', 'ON', 'AS', 'PERMISSIVE', 'RESTRICTIVE', 
                    'FOR', 'ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 
                    'TO', 'USING', 'WITH', 'CHECK',
                    'TRUE', 'FALSE', 'NULL'
                ];
                if (reserved.includes(word.toUpperCase())) {
                     throw new Error(`Expected identifier, found keyword ${word} at position ${this.pos}`);
                }

                this.pos += match[0].length;
                return match[1];
            }
            throw new Error(`Expected identifier at position ${this.pos}`);
        }
    }

    /**
     * Parses content within parentheses, handling nested parentheses and string literals.
     * Returns the inner content trimmed.
     */
    private parseParenthesizedExpression(): string {
        this.skipWhitespace();
        if (this.peek() !== '(') {
            throw new Error(`Expected '(' at position ${this.pos}`);
        }
        this.consume();
        
        let balance = 1;
        const start = this.pos;
        
        while (this.pos < this.length && balance > 0) {
            const char = this.consume();
            if (char === "'") {
                // Skip strings to avoid counting parens inside them
                while (this.pos < this.length) {
                    const c = this.consume();
                    if (c === "'") {
                        if (this.peek() === "'") {
                            this.consume(); // skip escaped quote
                        } else {
                            break;
                        }
                    }
                }
            } else if (char === '(') {
                balance++;
            } else if (char === ')') {
                balance--;
            }
        }

        if (balance !== 0) {
            throw new Error('Unbalanced parentheses');
        }

        return this.input.substring(start, this.pos - 1).trim();
    }
}

export function parsePolicy(policyString: string): CreatePolicy {
    return new PolicyParser(policyString).parse();
}
