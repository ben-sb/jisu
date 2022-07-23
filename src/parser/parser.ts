import * as t from './ast/types';
import { Token } from '../tokeniser/tokens/token';
import { assignmentOperatorTokens, binaryOperatorTokens, booleanValueTokens, groupedOperatorTokens, logicalOperatorTokens, TokenType, tt, unaryOperatorTokens, updateOperatorTokens, variableDeclarationKindTokens } from '../tokeniser/tokens/tokenTypes';
import { SourceLocation, SourcePosition } from '../tokeniser/tokens/location';

export class Parser {
    private readonly input: string;
    private readonly tokens: Token[];
    private readonly options: ParserOptions;
    private position: number;
    private readonly nodeStartPositions: SourcePosition[];
    private readonly warnings: string[];

    /**
     * Creates a new parser.
     * @param input The input string.
     * @param tokens The list of tokens.
     * @param options The parser options.
     */
    constructor(input: string, tokens: Token[], options: ParserOptions = {}) {
        this.input = input;
        this.tokens = tokens;
        this.options = options;
        this.position = 0;
        this.nodeStartPositions = [];
        this.warnings = [];
    }

    /**
     * Parses the tokens and returns the outer program node.
     * @returns The program node.
     */
    parse(): t.Program {
        this.startNode();
    
        const statements = [];
        while (this.position < this.tokens.length && !this.match(tt.EOF)) {
            statements.push(this.parseStatement());
        }

        const program = this.finishNode(t.program(statements));

        if (this.nodeStartPositions.length > 0) {
            this.warnings.push('Leftover start positions, node locations may be misaligned');
        }

        return program;
    }

    /**
     * Returns the current position and increments it by 1.
     * @returns The previous position.
     */
    private advance(): number {
        return this.position++;
    }

    /**
     * Records the next token as the start of the current node being parsed.
     */
    private startNode(existingNode?: t.Node): void {
        if (this.options.omitLocations) {
            return;
        }

        if (existingNode) {
            if (existingNode.extra && existingNode.extra.location) {
                this.nodeStartPositions.push(existingNode.extra.location.start);
            } else if (!this.options.omitLocations) {
                throw new Error('Expected existing node to have location');
            }
        } else {
            const token = this.peekToken();
            this.nodeStartPositions.push(token.location.start);
        }
    }

    /**
     * Adds the source location to a node if possible.
     * @param node The node.
     * @returns The node.
     */
    private finishNode<T extends t.Node>(node: T): T {
        if (this.options.emitLogs) {
            console.log(`Parsed ${node.type}`);
        }
        if (this.options.omitLocations) {
            return node;
        }

        const lastToken = this.peekToken(-1);
        if (this.nodeStartPositions.length > 0 && lastToken.location) {
            const start = this.nodeStartPositions.pop() as SourcePosition;
            this.addExtra(node, 'location', new SourceLocation(start, lastToken.location.end));
        }
        return node;
    }

    /**
     * Adds extra data to a node.
     * @param node The node.
     * @param key The key within the extra data.
     * @param value The value.
     */
    private addExtra(node: t.Node, key: t.NodeExtraKey, value: any): void {
        if (!node.extra) {
            node.extra = {};
        }
        node.extra[key] = value;
    }

    /**
     * Returns the next token from the token list and increments the
     * current position.
     * @param requiredType The type the token is required to be (optional).
     * @returns The next token.
     */
    private getNextToken(requiredType?: TokenType | Set<TokenType>): Token {
        const token = this.position < this.tokens.length
            ? this.tokens[this.advance()]
            : this.tokens[this.tokens.length - 1]; // EOF token

        if (requiredType) {
            if ((requiredType instanceof Set && !requiredType.has(token.type)) || (!(requiredType instanceof Set) && token.type != requiredType)) {
                throw new SyntaxError(this.unexpectedTokenErrorMessage(token, requiredType));
            }
        }

        return token;
    }

    /**
     * Returns a token at a given offset from the current position
     * but without modifying the current position.
     * @param offset The offset from the current position (defaults to 0).
     * @returns The token at the desired position.
     */
    private peekToken(offset: number = 0): Token {
        if (this.position + offset >= this.tokens.length) {
            throw new SyntaxError('Unexpected EOF');
        }

        return this.position < this.tokens.length
            ? this.tokens[this.position + offset]
            : this.tokens[this.tokens.length - 1]; // EOF token
    }

    /**
     * Returns an error message indicating an encountered token was not of the
     * expected type. Also logs the actual location of the error if possible.
     * @param token The unexpected token.
     * @param expectedType The expected token type (or set of types).
     * @returns The error message.
     */
    private unexpectedTokenErrorMessage(token: Token, expectedType?: TokenType | Set<TokenType>): string {
        if (token.location) {
            const location = token.location;
            const line = this.input.split('\n')[location.start.line];
            const tokenLength = location.start.line == location.end.line
                ? location.end.column - location.start.column
                : 1;
            const indicatorLine = ' '.repeat(location.start.column) + '^'.repeat(tokenLength);
            console.error(`${line}\n${indicatorLine}\n`);
        }

        if (expectedType) {
            if (expectedType instanceof Set) {
                return `Unexpected token ${token.value}, expected ${Array.from(expectedType).map(t => t.name).join(', ')}`;
            } else {
                return `Unexpected token ${token.value}, expected ${expectedType.name}`;
            }
        } else {
            return `Unexpected token ${token.value}`;
        }
    }

    /**
     * Returns an error message indicating an encountered node was not valid.
     * Also logs the actual location of the error if possible.
     * @param node The unexpected node.
     * @param message The error message.
     * @returns The error message.
     */
    private unexpectedNodeErrorMessage(node: t.Node, message: string): string {
        if (node.extra && node.extra.location) {
            const location = node.extra.location;
            const line = this.input.split('\n')[location.start.line];
            const nodeLength = location.start.line == location.end.line
                ? location.end.column - location.start.column
                : 1;
            const indicatorLine = ' '.repeat(location.start.column) + '^'.repeat(nodeLength);
            console.error(`${line}\n${indicatorLine}\n`);
        }

        return message;
    }

    /**
     * Returns whether the next token is of a given type.
     * @param type The token type.
     * @param offset The offset from the current position (defaults to 0).
     * @returns Whether.
     */
    private match(type: TokenType, offset: number = 0): boolean {
        return this.peekToken(offset).type == type;
    }

    /**
     * Expects a break token/character.
     */
    private expectBreak(): void {
        if (this.match(tt.SemiColon)) {
            this.advance();
        }
        else if (!this.match(tt.RightBrace) && !this.match(tt.EOF) && !this.isLineBreak()) {
            throw new SyntaxError(this.unexpectedTokenErrorMessage(this.peekToken()));
        }
    }

    /**
     * Returns whether the next token/character is a break.
     * @returns Whether.
     */
    private isBreak(): boolean {
        return this.match(tt.SemiColon) || this.match(tt.RightBrace)
            || this.match(tt.EOF) || this.isLineBreak();
    }

    /**
     * Checks whether there is a line break between the last token
     * and the current token.
     * @returns Whether.
     */
    private isLineBreak(): boolean {
        if (this.tokens.length == 0) {
            return false;
        }

        const lastToken = this.peekToken(-1);
        const currentToken = this.peekToken();
        const str = this.input.slice(lastToken.location.end.position + 1, currentToken.location.start.position);
        return /[\n\r]/.test(str);
    }

    /**
     * Expects a semi colon.
     */
    private expectSemiColon(): void {
        if (this.match(tt.SemiColon)) {
            this.advance();
        } else {
            throw new SyntaxError(this.unexpectedTokenErrorMessage(this.peekToken(), tt.SemiColon));
        }
    }

    /**
     * Parses a single statement.
     * @returns The statement node.
     */
    private parseStatement(): t.Statement {
        const token = this.peekToken();

        if (variableDeclarationKindTokens.has(token.type)) {
            return this.parseVariableDeclaration();
        }

        switch (token.type) {
            case tt.LeftBrace:
                return this.parseBlockStatement();
            case tt.Function:
            case tt.Async:
                return this.parseFunction(true) as t.FunctionDeclaration;
            case tt.If:
                return this.parseIfStatement();
            case tt.Switch:
                return this.parseSwitchStatement();
            case tt.For:
                return this.parseForStatement();
            case tt.While:
                return this.parseWhileStatement();
            case tt.Do:
                return this.parseDoWhileStatement();
            case tt.Try:
                return this.parseTryStatement();
            case tt.With:
                return this.parseWithStatement();
            case tt.Debugger:
                return this.parseDebuggerStatement();
            case tt.Break:
                return this.parseBreakStatement();
            case tt.Continue:
                return this.parseContinueStatement();
            case tt.Return:
                return this.parseReturnStatement();
            case tt.SemiColon:
                return this.parseEmptyStatement();
            case tt.Identifier: {
                if (this.match(tt.Colon, 1)) {
                    return this.parseLabeledStatement();
                } else {
                    return this.parseExpressionStatement();
                }
            }
            default:
                return this.parseExpressionStatement();
        }
    }

    /**
     * Parses a variable declaration.
     * @returns The variable declaration node.
     */
    private parseVariableDeclaration(): t.VariableDeclaration {
        this.startNode();
        const kindToken = this.getNextToken(variableDeclarationKindTokens);

        const declarators = [];
        while (true) {
            declarators.push(this.parseVariableDeclarator());

            if (this.match(tt.Comma)) {
                this.advance();
            } else {
                break;
            }
        }

        this.expectBreak();
        return this.finishNode(t.variableDeclaration(kindToken.value, declarators));
    }

    /**
     * Parses a variable declarator.
     * @returns The variable declarator node.
     */
    private parseVariableDeclarator(): t.VariableDeclarator {
        this.startNode();
        const pattern = this.parsePattern(false);

        this.getNextToken(tt.Assignment);
        
        const expression = this.parseExpression({ canBeSequence: false });

        return this.finishNode(t.variableDeclarator(pattern, expression));
    }

    /**
     * Parses a function declaration or expression.
     * @param isDeclaration Whether it is a function declaration.
     * @returns The function declaration or expression node.
     */
    private parseFunction(isDeclaration: boolean): t.FunctionDeclaration | t.FunctionExpression {
        this.startNode();
        let async = false;
        if (this.match(tt.Async)) {
            async = true;
            this.advance();
        }
        
        this.getNextToken(tt.Function);

        let generator = false;
        if (this.match(tt.Multiply)) {
            generator = true;
            this.advance();
        }
        
        const identifier = this.match(tt.LeftParenthesis)
            ? null
            : this.parseIdentifier();
        if (isDeclaration && !identifier) {
            throw new SyntaxError('Function statements require a function name');
        }

        const params = this.parseFunctionParams();
        const body = this.parseBlockStatement();

        const func = isDeclaration
            ? t.functionDeclaration(identifier as t.Identifier, params, body, generator, async)
            : t.functionExpression(identifier, params, body, generator, async);
        return this.finishNode(func);
    }

    /**
     * Parses function parameters.
     * @returns The identifier nodes.
     */
    private parseFunctionParams(): t.Pattern[] {
        this.getNextToken(tt.LeftParenthesis);

        const params = [];
        while (!this.match(tt.RightParenthesis)) {
            const pattern = this.parsePattern();
            params.push(pattern);

            if (this.match(tt.Comma)) {
                this.advance();
                if (this.match(tt.RightParenthesis)) {
                    if (pattern.type == 'RestElement') {
                        throw new SyntaxError(this.unexpectedNodeErrorMessage(pattern, 'A rest element must be last in a parameter list'));
                    }
                    this.addExtra(pattern, 'trailingComma', true);
                } else if (pattern.type == 'RestElement') {
                    throw new SyntaxError(this.unexpectedNodeErrorMessage(pattern, 'A rest element in a parameter list cannot have a trailing comma'));
                }
            } else {
                break;
            }
        }

        this.getNextToken(tt.RightParenthesis);

        return params;
    }

    /**
     * Parses a block statement.
     * @returns The block statement node.
     */
    private parseBlockStatement(): t.BlockStatement {
        this.startNode();
        this.getNextToken(tt.LeftBrace);

        const statements = [];
        while (!this.match(tt.RightBrace)) {
            statements.push(this.parseStatement());
        }

        this.getNextToken(tt.RightBrace);

        return this.finishNode(t.blockStatement(statements));
    }

    /**
     * Parses an if statement.
     * @returns The if statement node.
     */
    private parseIfStatement(): t.IfStatement {
        this.startNode();
        this.getNextToken(tt.If);
        this.getNextToken(tt.LeftParenthesis);
        
        const test = this.parseExpression();

        this.getNextToken(tt.RightParenthesis);

        const consequent = this.parseStatement();

        let alternate: t.Statement | undefined;
        if (this.match(tt.Else)) {
            this.getNextToken(tt.Else);
            alternate = this.parseStatement();
        }

        return this.finishNode(t.ifStatement(test, consequent, alternate));
    }

    /**
     * Parses a switch statement.
     * @returns The switch statement node.
     */
    private parseSwitchStatement(): t.SwitchStatement {
        this.startNode();
        this.getNextToken(tt.Switch);
        this.getNextToken(tt.LeftParenthesis);

        const discriminant = this.parseExpression();

        this.getNextToken(tt.RightParenthesis);
        this.getNextToken(tt.LeftBrace);

        const cases = [];
        while (!this.match(tt.RightBrace)) {
            cases.push(this.parseSwitchCase());
        }

        this.getNextToken(tt.RightBrace);

        return this.finishNode(t.switchStatement(discriminant, cases));
    }

    /**
     * Parses a switch case.
     * @returns The switch case node.
     */
    private parseSwitchCase(): t.SwitchCase {
        this.startNode();
        let test: t.Expression | null;
        if (this.match(tt.Default)) {
            test = null;
            this.advance();
        } else {
            this.getNextToken(tt.Case);
            test = this.parseExpression();
        }
        this.getNextToken(tt.Colon);

        const consequent = [this.parseStatement()];
        while (!this.match(tt.Case) && !this.match(tt.Default) && this.match(tt.RightBrace)) {
            consequent.push(this.parseStatement());
        }

        return this.finishNode(t.switchCase(test, consequent));
    }

    /**
     * Parses a for statement.
     * @returns The for statement node.
     */
    private parseForStatement(): t.ForStatement {
        this.startNode();
        this.getNextToken(tt.For);
        this.getNextToken(tt.LeftParenthesis);

        let init: t.VariableDeclaration | t.Expression | null;
        if (this.match(tt.SemiColon)) {
            init = null;
            this.advance();
        } else if (this.match(tt.Var)) {
            init = this.parseVariableDeclaration();
        } else {
            init = this.parseExpression();
            this.expectSemiColon();
        }
        
        let test: t.Expression | null;
        if (this.match(tt.SemiColon)) {
            test = null;
        } else {
            test = this.parseExpression();
        }
        this.expectSemiColon();

        let update: t.Expression | null;
        if (this.match(tt.RightParenthesis)) {
            update = null;
        } else {
            update = this.parseExpression();
        }
        this.getNextToken(tt.RightParenthesis);
        
        const body = this.parseStatement();

        return this.finishNode(t.forStatement(init, test, update, body));
    }

    /**
     * Parses a while statement.
     * @returns The while statement node.
     */
    private parseWhileStatement(): t.WhileStatement {
        this.startNode();
        this.getNextToken(tt.While);
        this.getNextToken(tt.LeftParenthesis);

        const test = this.parseExpression();
        this.getNextToken(tt.RightParenthesis);

        const body = this.parseStatement();

        return this.finishNode(t.whileStatement(test, body));
    }

    /**
     * Parses a do while statement.
     * @returns The do while statement node.
     */
    private parseDoWhileStatement(): t.DoWhileStatement {
        this.startNode();
        this.getNextToken(tt.Do);

        const body = this.parseStatement();

        this.getNextToken(tt.While);
        this.getNextToken(tt.LeftParenthesis);

        const test = this.parseExpression();
        
        this.getNextToken(tt.RightParenthesis);

        return this.finishNode(t.doWhileStatement(body, test));
    }

    /**
     * Parses a try statement.
     * @returns The try statement node.
     */
    private parseTryStatement(): t.TryStatement {
        this.startNode();
        this.getNextToken(tt.Try);
        const block = this.parseBlockStatement();

        let handler: t.CatchClause | null = null;
        if (this.match(tt.Catch)) {
            handler = this.parseCatchClause();
        }

        let finalizer: t.BlockStatement | null = null;
        if (this.match(tt.Finally)) {
            this.advance();
            finalizer = this.parseBlockStatement();
        }

        if (!handler && !finalizer) {
            throw new SyntaxError('Missing catch or finally after try');
        }

        return this.finishNode(t.tryStatement(block, handler, finalizer));
    }

    /**
     * Parses a catch clause.
     * @returns The catch clause node.
     */
    private parseCatchClause(): t.CatchClause {
        this.startNode();
        this.getNextToken(tt.Catch);

        let param: t.Identifier | null = null;
        if (this.match(tt.LeftParenthesis)) {
            this.advance();
            param = this.parseIdentifier();
            this.getNextToken(tt.RightParenthesis);
        }

        const body = this.parseBlockStatement();

        return this.finishNode(t.catchClause(param, body));
    }

    /**
     * Parses a with statement.
     * @returns The with statement node.
     */
    private parseWithStatement(): t.WithStatement {
        this.startNode();
        this.getNextToken(tt.With);
        
        this.getNextToken(tt.LeftParenthesis);
        const expression = this.parseExpression();
        this.getNextToken(tt.RightParenthesis);

        const body = this.parseStatement();

        return this.finishNode(t.withStatement(expression, body));
    }

    /**
     * Parses a debugger statement.
     * @returns The debugger statement node.
     */
    private parseDebuggerStatement(): t.DebuggerStatement {
        this.startNode();
        this.getNextToken(tt.Debugger);
        this.expectBreak();
        return this.finishNode(t.debuggerStatement());
    }
    
    /**
     * Parses a break statement.
     * @returns The break statement node.
     */
    private parseBreakStatement(): t.BreakStatement {
        this.startNode();
        this.getNextToken(tt.Break);
        this.expectBreak();
        return this.finishNode(t.breakStatement());
    }

    /**
     * Parses a continue statement.
     * @returns The continue statement node.
     */
    private parseContinueStatement(): t.ContinueStatement {
        this.startNode();
        this.getNextToken(tt.Continue);
        this.expectBreak();
        return this.finishNode(t.continueStatement());
    }

    /**
     * Parses a return statement.
     * @returns The return statement node.
     */
    private parseReturnStatement(): t.ReturnStatement {
        this.startNode();
        this.getNextToken(tt.Return);

        const expression = this.isBreak()
            ? null
            : this.parseExpression();

        this.expectBreak();
        return this.finishNode(t.returnStatement(expression));
    }

    /**
     * Parses an empty statement.
     * @returns The empty statement node.
     */
    private parseEmptyStatement(): t.EmptyStatement {
        this.startNode();
        this.expectSemiColon();
        return this.finishNode(t.emptyStatement());
    }

    /**
     * Parses a labeled statement.
     * @returns The labeled statement node.
     */
    private parseLabeledStatement(): t.LabeledStatement {
        this.startNode();
        const label = this.parseIdentifier();
        this.getNextToken(tt.Colon);
        const statement = this.parseStatement();

        return this.finishNode(t.labeledStatement(label, statement));
    }

    /**
     * Parses an expression statement.
     * @returns The expression statement node.
     */
    private parseExpressionStatement(): t.ExpressionStatement {
        this.startNode();
        const expression = this.parseExpression();
        this.expectBreak();
        return this.finishNode(t.expressionStatement(expression));
    }

    /**
     * Parses an expression.
     * @param canBeGrouped Whether it can be a grouped expression, i.e
     * binary or logical expression (defaults to true).
     * @param canBeSequence Whether it can be a sequence expression (defaults 
     * to true).
     * @param canBeAssignment Whether it can be an assignment expression
     * (defaults to true).
     * @param canBeCall Whether it can be a call expression (defaults to
     * true).
     * @returns The expression node.
     */
    private parseExpression({ 
        canBeGrouped = true, 
        canBeSequence = true,
        canBeAssignment = true,
        canBeCall = true
    }: ParseExpressionParams = {}): t.Expression {
        const expression = this.parseExpression2({ canBeGrouped, canBeSequence, canBeAssignment, canBeCall });
        const nextToken = this.peekToken();

        if (canBeSequence && nextToken.type == tt.Comma) {
            this.advance();
            return this.parseSequenceExpression(expression);
        } else {
            return expression;
        }
    }

    /**
     * Second level of parsing an expression.
     * @param canBeGrouped Whether it can be a grouped expression, i.e
     * binary or logical expression (defaults to true).
     * @param canBeSequence Whether it can be a sequence expression (defaults 
     * to true).
     * @param canBeAssignment Whether it can be an assignment expression
     * (defaults to true).
     * @param canBeCall Whether it can be a call expression (defaults to
     * true).
     * @returns The expression node.
     */
    private parseExpression2({ 
        canBeGrouped = true, 
        canBeSequence = true,
        canBeAssignment = true,
        canBeCall = true
    }: ParseExpressionParams = {}): t.Expression {
        let expression = this.parseExpressionInner();
        let nextToken = this.peekToken();

        if (canBeAssignment && assignmentOperatorTokens.has(nextToken.type)) {
            return this.parseAssignmentExpression(expression);
        } else if (updateOperatorTokens.has(nextToken.type)) {
            expression = this.parsePostfixUpdateExpression(expression);
            nextToken = this.peekToken(); // could also be grouped
        } else if (nextToken.type == tt.LeftBracket) {
            return this.parseMemberExpression(expression, true);
        } else if (nextToken.type == tt.Dot) {
            return this.parseMemberExpression(expression, false);
        } else if (canBeCall && nextToken.type == tt.LeftParenthesis) {
            return this.parseCallExpression(expression);
        } else if (nextToken.type == tt.Question) {
            return this.parseConditionalExpression(expression);
        } else if (nextToken.type == tt.Arrow) {
            const params = expression.type == 'SequenceExpression'
                ? expression.expressions.map(this.expressionToPattern.bind(this))
                : [this.expressionToPattern(expression)];
            return this.parseArrowFunctionExpression(params);
        }
        
        if (canBeGrouped && (binaryOperatorTokens.has(nextToken.type) || logicalOperatorTokens.has(nextToken.type))) {
            return this.parseGroupedExpression(expression);
        } else {
            return expression;
        }
    }

    /**
     * Parses an expression that is known not to be a series of chained
     * expressions (e.g. not a binary or sequence expression).
     * @returns The expression node.
     */
    private parseExpressionInner(): t.Expression {
        const token = this.peekToken();

        if (unaryOperatorTokens.has(token.type)) {
            return this.parseUnaryExpression();
        } else if (updateOperatorTokens.has(token.type)) {
            return this.parsePrefixUpdateExpression();
        }

        switch (token.type) {
            case tt.Identifier:
                return this.parseIdentifier();
            case tt.Number:
                return this.parseNumericLiteral();
            case tt.True:
            case tt.False:
                return this.parseBooleanLiteral();
            case tt.String:
                return this.parseStringLiteral();
            case tt.TemplateString:
                return this.parseTemplateLiteral();
            case tt.Null:
                return this.parseNullLiteral();
            case tt.This:
                return this.parseThisExpression();
            case tt.Super:
                return this.parseSuperExpression();
            case tt.New:
                return this.parseNewExpression();
            case tt.LeftParenthesis: {
                if (this.match(tt.RightParenthesis, 1)) {
                    this.getNextToken(tt.LeftParenthesis);
                    this.getNextToken(tt.RightParenthesis);
                    return this.parseArrowFunctionExpression([]);
                } else {
                    return this.parseParenthesisedExpression() as t.Expression;
                }
            }
            case tt.Function:
                return this.parseFunction(false) as t.FunctionExpression;
            case tt.LeftBracket:
                return this.parseArrayExpression();
            case tt.LeftBrace:
                return this.parseObjectExpression();
            case tt.Yield:
                return this.parseYieldExpression();
            case tt.Await:
                return this.parseAwaitExpression();
            case tt.Async: {
                const nextToken = this.peekToken(1);
                if (nextToken.type == tt.LeftParenthesis) {
                    this.getNextToken(tt.Async);
                    const params = this.parseFunctionParams();
                    return this.parseArrowFunctionExpression(params);
                } else if (nextToken.type == tt.Do) {
                    return this.parseDoExpression(true);
                } else {
                    return this.parseFunction(false) as t.FunctionExpression;
                }
            }
            case tt.Do:
                return this.parseDoExpression();
            default:
                throw new SyntaxError(this.unexpectedTokenErrorMessage(token));
        }
    }

    /**
     * Parses an identifier.
     * @returns The identifier node.
     */
    private parseIdentifier(): t.Identifier {
        this.startNode();
        const token = this.getNextToken(tt.Identifier);
        return this.finishNode(t.identifier(token.value));
    }

    /**
     * Parses a keyword as an identifier. Used within object properties.
     * @returns The identifier node.
     */
    private parseKeywordAsIdentifier(): t.Identifier {
        this.startNode();
        const token = this.getNextToken();
        if (!token.type.isKeyword) {
            throw new SyntaxError(`Token ${token.type.name} is not a keyword`);
        }
        return this.finishNode(t.identifier(token.type.name));
    }

    /**
     * Parses a pattern.
     * @param canBeAssignment Whether it can be an assignment pattern
     * (defaults to true).
     * @returns The pattern node.
     */
    private parsePattern(canBeAssignment: boolean = true): t.Pattern {
        const expression = this.match(tt.Ellipsis)
            ? this.parseSpreadElement()
            : this.parseExpression({ canBeSequence: false, canBeAssignment });
        return this.expressionToPattern(expression);
    }

    /**
     * Parses a numeric literal.
     * @returns The numeric literal node.
     */
    private parseNumericLiteral(): t.NumericLiteral {
        this.startNode();
        const token = this.getNextToken(tt.Number);
        const value = parseInt(token.value);
        return this.finishNode(t.numericLiteral(value));
    }

    /**
     * Parses a boolean literal.
     * @returns The boolean literal node.
     */
    private parseBooleanLiteral(): t.BooleanLiteral {
        this.startNode();
        const token = this.getNextToken(booleanValueTokens);
        const value = token.type == tt.True;
        return this.finishNode(t.booleanLiteral(value));
    }

    /**
     * Parses a string literal.
     * @returns The string literal node.
     */
    private parseStringLiteral(): t.StringLiteral {
        this.startNode();
        const value = this.getNextToken(tt.String);
        return this.finishNode(t.stringLiteral(value.value));
    }

    /**
     * Parses a template literal.
     * @returns The template literal node.
     */
    private parseTemplateLiteral(): t.TemplateLiteral {
        this.startNode();
        const value = this.getNextToken(tt.TemplateString);
        return this.finishNode(t.templateLiteral(value.value));
    }

    /**
     * Parses a null literal.
     * @returns The null literal node.
     */
    private parseNullLiteral(): t.NullLiteral {
        this.startNode();
        this.getNextToken(tt.Null);
        return this.finishNode(t.nullLiteral());
    }

    /**
     * Parses a this expression.
     * @returns The this expression node.
     */
    private parseThisExpression(): t.ThisExpression {
        this.startNode();
        this.getNextToken(tt.This);
        return this.finishNode(t.thisExpression());
    }

    /**
     * Parses a super expression.
     * @returns The super expression node.
     */
    private parseSuperExpression(): t.SuperExpression {
        this.startNode();
        this.getNextToken(tt.Super);
        return this.finishNode(t.superExpression());
    }

    /**
     * Parses an assignment expression.
     * @param left The left hand side of the assignment.
     * @returns The assignment expression node.
     */
    private parseAssignmentExpression(left: t.Expression): t.AssignmentExpression {
        this.startNode(left);
        const leftPattern = this.expressionToPattern(left);
        const operator = this.getNextToken(assignmentOperatorTokens);
        const right = this.parseExpression({ canBeSequence: false });
        return this.finishNode(t.assignmentExpression(operator.value, leftPattern, right));
    }

    /**
     * Parses a unary expression.
     * @returns The unary expression node.
     */
    private parseUnaryExpression(): t.UnaryExpression {
        this.startNode();
        const operator = this.getNextToken(unaryOperatorTokens);
        const expression = this.parseExpression({ canBeGrouped: false, canBeSequence: false, canBeAssignment: false });
        return this.finishNode(t.unaryExpression(operator.value, expression));
    }

    /**
     * Parses a prefix update expression.
     * @returns The update expression node.
     */
    private parsePrefixUpdateExpression(): t.UpdateExpression {
        this.startNode();
        const operator = this.getNextToken(updateOperatorTokens);
        const argument = this.parseExpression({ canBeGrouped: false, canBeSequence: false, canBeAssignment: false });
        return this.finishNode(t.updateExpression(operator.value, argument, true));
    }

    /**
     * Parses a postfix update expression.
     * @param argument The argument of the update expression.
     * @returns The update expression node.
     */
    private parsePostfixUpdateExpression(argument: t.Expression): t.UpdateExpression {
        this.startNode(argument);
        const operator = this.getNextToken(updateOperatorTokens);
        return this.finishNode(t.updateExpression(operator.value, argument, false));
    }

    /**
     * Parses a grouped expression. This is either a binary or logical 
     * expression.
     * @param firstExpression The first expression in the grouped expression.
     * @param minPrecedence The minimum precedence to continue (defaults to 0).
     * @returns The binary or logical expression node.
     */
    private parseGroupedExpression(firstExpression: t.Expression, minPrecedence: number = 0): t.BinaryExpression | t.LogicalExpression {
        this.startNode(firstExpression);
        let isFirst = true;
        let expression = firstExpression;
        let lookahead = this.peekToken();

        while (groupedOperatorTokens.has(lookahead.type) && lookahead.type.precedence! >= minPrecedence) {
            if (!isFirst) {
                this.startNode(expression);
            } else {
                isFirst = false;
            }
            
            const operator = lookahead.type;
            const operatorPrecedence = operator.precedence as number;
            this.advance();
            let right = this.parseExpression({ canBeGrouped: false, canBeSequence: false });
            
            lookahead = this.peekToken();
            while (groupedOperatorTokens.has(lookahead.type) && (lookahead.type.precedence! > operatorPrecedence
                || (lookahead.type.rightAssociative && lookahead.type.precedence! >= operatorPrecedence))) {
                const nextMinPrecedence = operatorPrecedence + +(lookahead.type.precedence! > operatorPrecedence);
                right = this.parseGroupedExpression(right, nextMinPrecedence);
                lookahead = this.peekToken();
            }

            const expr = logicalOperatorTokens.has(operator)
                ? t.logicalExpression(operator.name as any, expression, right)
                : t.binaryExpression(operator.name as any, expression, right);
            expression = this.finishNode(expr);
        }

        return expression as t.BinaryExpression | t.LogicalExpression;
    }

    /**
     * Parses a sequence expression.
     * @param firstExpression The first expression in the sequence.
     * @returns The sequence expression node.
     */
    private parseSequenceExpression(firstExpression: t.Expression): t.SequenceExpression {
        this.startNode(firstExpression);
        const expressions = [firstExpression];

        while (true) {
            const nextExpression = this.match(tt.Ellipsis)
                ? this.parseSpreadElement()
                : this.parseExpression({ canBeSequence: false });
            expressions.push(nextExpression as t.Expression);

            if (this.match(tt.Comma)) {
                this.advance();
            } else {
                break;
            }
        }

        return this.finishNode(t.sequenceExpression(expressions));
    }

    /**
     * Parses a member expression.
     * @param object The object of the member expression.
     * @param computed Whether it is computed (i.e. a[b] rather than a.b).
     * @returns The member expression node.
     */
    private parseMemberExpression(object: t.Expression, computed: boolean): t.MemberExpression {
        this.startNode();
        this.getNextToken(computed ? tt.LeftBracket : tt.Dot);
        
        const property = this.parseExpression();

        if (computed) {
            this.getNextToken(tt.RightBracket);
        }

        return this.finishNode(t.memberExpression(object, property, computed));
    }

    /**
     * Parses a call expression.
     * @param callee The callee expression of the call expression.
     * @returns The call expression node.
     */
    private parseCallExpression(callee: t.Expression): t.CallExpression {
        this.startNode();
        this.getNextToken(tt.LeftParenthesis);

        const args = [];
        while (!this.match(tt.RightParenthesis)) {
            const arg = this.match(tt.Ellipsis)
                ? this.parseSpreadElement()
                : this.parseExpression({ canBeSequence: false });
            args.push(arg);

            if (this.match(tt.Comma)) {
                this.advance();
                if (this.match(tt.RightParenthesis)) {
                    this.addExtra(arg, 'trailingComma', true);
                }
            } else {
                break;
            }
        }

        this.getNextToken(tt.RightParenthesis);

        return this.finishNode(t.callExpression(callee, args));
    }

    /**
     * Parses a new expression.
     * @returns The new expression node.
     */
    private parseNewExpression(): t.NewExpression {
        this.startNode();
        this.getNextToken(tt.New);

        const callee = this.parseExpression({ canBeCall: false });

        const args = [];
        if (this.match(tt.LeftParenthesis)) {
            this.getNextToken(tt.LeftParenthesis);

            while (!this.match(tt.RightParenthesis)) {
                const arg = this.match(tt.Ellipsis)
                    ? this.parseSpreadElement()
                    : this.parseExpression({ canBeSequence: false });
                args.push(arg);
    
                if (this.match(tt.Comma)) {
                    this.advance();
                    if (this.match(tt.RightParenthesis)) {
                        this.addExtra(arg, 'trailingComma', true);
                    }
                } else {
                    break;
                }
            }

            this.getNextToken(tt.RightParenthesis);
        }

        return this.finishNode(t.newExpression(callee, args));
    }

    /**
     * Parses a conditional expression.
     * @param test The test expression of the conditional expression.
     * @returns The conditional expression node.
     */
    private parseConditionalExpression(test: t.Expression): t.ConditionalExpression {
        this.startNode();
        this.getNextToken(tt.Question);

        const consequent = this.parseExpression();

        this.getNextToken(tt.Colon);
        
        const alternate = this.parseExpression();

        return this.finishNode(t.conditionalExpression(test, consequent, alternate));
    }

    /**
     * Parses a spread element.
     * @returns The spread element node.
     */
    private parseSpreadElement(): t.SpreadElement {
        this.startNode();
        this.getNextToken(tt.Ellipsis);
        const expression = this.parseExpression({ canBeSequence: false });
        return this.finishNode(t.spreadElement(expression));
    }

    /**
     * Parses an expression within parenthesis.
     * @returns The expression node.
     */
    private parseParenthesisedExpression(): t.Expression | t.SpreadElement {
        this.startNode();
        this.getNextToken(tt.LeftParenthesis);
        const expression = this.match(tt.Ellipsis)
            ? this.parseSpreadElement()
            : this.parseExpression();
        this.getNextToken(tt.RightParenthesis);
        return this.finishNode(expression);
    }

    /**
     * Parses an array expression.
     * @returns The array expression node.
     */
    private parseArrayExpression(): t.ArrayExpression {
        this.startNode();
        this.getNextToken(tt.LeftBracket);

        const elements = [];
        while (!this.match(tt.RightBracket)) {
            if (this.match(tt.Comma)) {
                elements.push(null);
                this.advance();
            } else {
                const element = this.match(tt.Ellipsis)
                    ? this.parseSpreadElement()
                    : this.parseExpression({ canBeSequence: false });
                elements.push(element);

                if (this.match(tt.Comma)) {
                    this.advance();
                    if (this.match(tt.RightBracket)) {
                        this.addExtra(element, 'trailingComma', true);
                    }
                } else {
                    break;
                }
            }
        }
        this.getNextToken(tt.RightBracket);

        return this.finishNode(t.arrayExpression(elements));
    }

    /**
     * Parses an object expression.
     * @returns The object expression node.
     */
    private parseObjectExpression(): t.ObjectExpression {
        this.startNode();
        this.getNextToken(tt.LeftBrace);

        const properties = [];
        while (!this.match(tt.RightBrace)) {
            const member = this.parseObjectMember();
            properties.push(member);

            if (this.match(tt.Comma)) {
                this.advance();
                if (this.match(tt.RightBrace)) {
                    this.addExtra(member, 'trailingComma', true);
                }
            } else {
                break;
            }
        }
        this.getNextToken(tt.RightBrace);

        return this.finishNode(t.objectExpression(properties));
    }

    /**
     * Parses an object member.
     * @returns The object property or method node.
     */
    private parseObjectMember(): t.ObjectProperty | t.ObjectMethod | t.SpreadElement {
        let key: t.Expression;
        let computed = false;
        let method: 'get' | 'set' | undefined;

        let nextToken = this.peekToken();
        if (nextToken.type == tt.LeftBracket) {
            this.startNode();
            this.getNextToken(tt.LeftBracket);
            key = this.parseExpression();
            this.getNextToken(tt.RightBracket);
            computed = true;
        } else if (nextToken.type == tt.Identifier || nextToken.type.isKeyword) {
            this.startNode();
            key = nextToken.type == tt.Identifier
                ? this.parseIdentifier()
                : this.parseKeywordAsIdentifier();

            nextToken = this.peekToken();
            if ((key.name == 'get' || key.name == 'set') && (nextToken.type == tt.Identifier || nextToken.type.isKeyword)) { // getter or setter
                method = key.name;
                key = nextToken.type == tt.Identifier
                    ? this.parseIdentifier()
                    : this.parseKeywordAsIdentifier();
                nextToken = this.peekToken();
                if (nextToken.type != tt.LeftParenthesis) {
                    throw new SyntaxError(this.unexpectedTokenErrorMessage(nextToken, tt.LeftParenthesis));
                }
            } else if (nextToken.type == tt.Comma || nextToken.type == tt.RightBrace) { // shorthand property
                return this.finishNode(t.objectProperty(key, key, false, true));
            }
        } else if (nextToken.type == tt.Ellipsis) {
            return this.parseSpreadElement();
        } else {
            throw new SyntaxError(this.unexpectedTokenErrorMessage(nextToken));
        }

        nextToken = this.peekToken();
        if (nextToken.type == tt.Colon) {
            this.getNextToken();
            const value = this.parseExpression({ canBeSequence: false });
            return this.finishNode(t.objectProperty(key, value, computed));
        } else if (nextToken.type == tt.Assignment) { // assignment property (only for object)
            const expression = this.parseAssignmentExpression(key);
            const assignmentPattern = this.assignmentExpressionToPattern(expression);
            return this.finishNode(t.objectProperty(key, assignmentPattern as any)) as t.AssignmentProperty;
        } else if (nextToken.type == tt.LeftParenthesis) {
            const params = this.parseFunctionParams();
            const body = this.parseBlockStatement();
            return this.finishNode(t.objectMethod(method || 'method', key, params, body, computed));
        } else {
            throw new SyntaxError(this.unexpectedTokenErrorMessage(nextToken));
        }
    }

    /**
     * Parses a yield expression.
     * @returns The yield expression node.
     */
    private parseYieldExpression(): t.YieldExpression {
        this.startNode();
        this.getNextToken(tt.Yield);

        let delegate = false;
        if (this.match(tt.Multiply)) {
            delegate = true;
            this.advance();
        }

        const argument = this.isBreak()
            ? null
            : this.parseExpression();
        
        return this.finishNode(t.yieldExpression(argument, delegate));
    }
    
    /**
     * Parses an await expression.
     * @returns The await expression.
     */
    private parseAwaitExpression(): t.AwaitExpression {
        this.startNode();
        this.getNextToken(tt.Await);
        const argument = this.parseExpression();

        return this.finishNode(t.awaitExpression(argument));
    }

    /**
     * Parses an arrow function expression.
     * @param params The parameters of the function expression.
     * @param async Whether it is async.
     * @returns The arrow function expression node.
     */
    private parseArrowFunctionExpression(params: t.Pattern[], async: boolean = false): t.ArrowFunctionExpression {
        this.startNode();
        this.getNextToken(tt.Arrow);

        const body = this.match(tt.LeftBrace)
            ? this.parseBlockStatement()
            : this.parseExpression();

        return this.finishNode(t.arrowFunctionExpression(params, body, async));
    }

    /**
     * Parses a do expression.
     * @param isAsync Whether it is async.
     * @returns The do expression node.
     */
    private parseDoExpression(isAsync: boolean = false): t.DoExpression {
        this.startNode();
        let async = false;
        if (isAsync) {
            this.getNextToken(tt.Async);
            async = true;
        }

        this.getNextToken(tt.Do);
        const body = this.parseBlockStatement();

        return this.finishNode(t.doExpression(body, async));
    }

    /**
     * Converts an expression to a pattern.
     * @param expression The expression.
     * @returns The pattern.
     */
    private expressionToPattern(expression: t.Expression | t.SpreadElement): t.Pattern {
        if (t.isPattern(expression)) {
            return expression;
        }

        switch (expression.type) {
            case 'AssignmentExpression':
                return this.assignmentExpressionToPattern(expression);
            case 'ArrayExpression':
                return this.arrayExpressionToPattern(expression);
            case 'ObjectExpression':
                return this.objectExpressionToPattern(expression);
            case 'SpreadElement':
                return this.spreadElementToPattern(expression);
            default:
                throw new SyntaxError(this.unexpectedNodeErrorMessage(expression, `Invalid pattern ${expression.type}`));
        }
    }

    /**
     * Converts an assignment expression to an assignment pattern.
     * @param expression The assignment expression.
     * @returns The assignment pattern node.
     */
    private assignmentExpressionToPattern(
        expression: t.AssignmentExpression
    ): t.AssignmentPattern {
        if (expression.operator != '=') {
            throw new SyntaxError(this.unexpectedNodeErrorMessage(expression, `Invalid assignment pattern operator ${expression.operator}, expected =`));
        }
        
        const left = t.isPattern(expression.left)
            ? expression.left
            : this.expressionToPattern(expression.left);
        const pattern = t.assignmentPattern(left, expression.right);
        pattern.extra = expression.extra;
        return pattern;
    }

    /**
     * Converts an array exression to an array pattern.
     * @param expression The array expression.
     * @returns The array pattern node.
     */
    private arrayExpressionToPattern(
        expression: t.ArrayExpression
    ): t.ArrayPattern {
        const elements = [];
        for (let i=0; i<expression.elements.length; i++) {
            const pattern = this.arrayElementToPattern(expression.elements[i]);
            if (pattern && pattern.type == 'RestElement') {
                if (i < expression.elements.length - 1) {
                    throw new SyntaxError(this.unexpectedNodeErrorMessage(pattern, 'A rest element must be last in a destructuring pattern'));
                } else if (pattern.extra && pattern.extra.trailingComma) {
                    throw new SyntaxError(this.unexpectedNodeErrorMessage(pattern, 'A rest element in a destructuring pattern cannot have a trailing comma'));
                }
            }
            elements.push(pattern);
        }
        
        const pattern = t.arrayPattern(elements);
        pattern.extra = expression.extra;
        return pattern;
    }

    /**
     * Converts an array element to a pattern.
     * @param element The array element.
     * @returns The pattern.
     */
    private arrayElementToPattern(
        element: t.Expression | t.SpreadElement | null
    ): t.Pattern | null {
        if (!element) {
            return element;
        } else if (element.type == 'SpreadElement') {
            return this.spreadElementToPattern(element);
        } else {
            return this.expressionToPattern(element);
        }
    }

    /**
     * Converts an object expression to an object pattern.
     * @param expression The object expression.
     * @returns The object pattern node.
     */
    private objectExpressionToPattern(
        expression: t.ObjectExpression
    ): t.ObjectPattern {
        const properties = [];
        for (let i=0; i<expression.properties.length; i++) {
            const pattern = this.objectMemberToPattern(expression.properties[i]);
            if (pattern.type == 'RestElement') {
                if (i < expression.properties.length - 1) {
                    throw new SyntaxError(this.unexpectedNodeErrorMessage(pattern, 'A rest element must be last in a destructuring pattern'));
                } else if (pattern.extra && pattern.extra.trailingComma) {
                    throw new SyntaxError(this.unexpectedNodeErrorMessage(pattern, 'A rest element in a destructuring pattern cannot have a trailing comma'));
                }
            }
            properties.push(pattern);
        }
        
        const pattern = t.objectPattern(properties);
        pattern.extra = expression.extra;
        return pattern;
    }

    /**
     * Converts an object member to a pattern.
     * @param member The object member.
     * @returns The pattern.
     */
    private objectMemberToPattern(
        member: t.ObjectProperty | t.ObjectMethod | t.SpreadElement
    ): t.AssignmentProperty | t.RestElement {
        if (member.type == 'SpreadElement') {
            return this.spreadElementToPattern(member);
        } else if (member.type == 'ObjectProperty') {
            return this.objectPropertyToPattern(member);
        } else {
            throw new SyntaxError(this.unexpectedNodeErrorMessage(member, `Invalid object member pattern type ${member.type}`));
        }
    }

    /**
     * Converts an object property to an assignment property.
     * @param property The object property.
     * @returns The assignment property.
     */
    private objectPropertyToPattern(property: t.ObjectProperty): t.AssignmentProperty {
        const pattern = property as {[key: string]: any};
        pattern.value = this.expressionToPattern(property.value);
        pattern.extra = property.extra;
        return pattern as t.AssignmentProperty;
    }

    /**
     * Converts a spread element to a rest element.
     * @param element The spread element.
     * @returns The rest element node.
     */
    private spreadElementToPattern(
        element: t.SpreadElement
    ): t.RestElement {
        const pattern = this.expressionToPattern(element.argument);
        const restElement = t.restElement(pattern);
        restElement.extra = element.extra;
        return restElement;
    }
}

export interface ParserOptions {
    emitLogs?: boolean;
    omitLocations?: boolean;
}

interface ParseExpressionParams {
    canBeGrouped?: boolean;
    canBeSequence?: boolean;
    canBeAssignment?: boolean,
    canBeCall?: boolean
}