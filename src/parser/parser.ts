import { Token } from '../tokeniser/tokens/token';
import { assignmentOperatorTokens, binaryOperatorTokens, booleanValueTokens, groupedOperatorTokens, logicalOperatorTokens, TokenType, tt, unaryOperatorTokens } from '../tokeniser/tokens/tokenTypes';
import * as t from './ast/types';

export class Parser {
    private readonly tokens: Token[];
    private position: number;

    /**
     * Creates a new parser.
     * @param tokens The list of tokens.
     */
    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.position = 0;
    }

    /**
     * Parses the tokens and returns the outer program node.
     * @returns The program node.
     */
    parse(): t.Program {
        const statements = [];
        while (this.position < this.tokens.length && this.peekToken().type != tt.EOF) {
            statements.push(this.parseStatement());
        }

        return t.program(statements);
    }

    /**
     * Returns the current position and increments it by 1.
     * @returns The previous position.
     */
    private advance(): number {
        return this.position++;
    }

    /**
     * Returns an error message indicating an encountered token was not of the
     * expected type.
     * @param token The unexpected token.
     * @param expectedType The expected token type (or set of types).
     */
    private unexpectedTokenErrorMessage(token: Token, expectedType?: TokenType | Set<TokenType>): string {
        if (expectedType) {
            if (expectedType instanceof Set) {
                return `Unexpected token ${token.value}, expected ${Array.from(expectedType).map(t => t.name).join(',')}`;
            } else {
                return `Unexpected token ${token.value}, expected ${expectedType.name}`;
            }
        } else {
            return  `Unexpected token ${token.value}`;
        }
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

        if (requiredType && token.type != requiredType) {
            throw new Error(this.unexpectedTokenErrorMessage(token, requiredType));
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
            throw new Error('Unexpected EOF');
        }

        return this.position < this.tokens.length
            ? this.tokens[this.position + offset]
            : this.tokens[this.tokens.length - 1]; // EOF token
    }

    /**
     * Parses a single statement.
     * @returns The statement node.
     */
    private parseStatement(): t.Statement {
        const token = this.peekToken();
        switch (token.type) {
            case tt.LeftBrace:
                return this.parseBlockStatement();
            case tt.Var:
                return this.parseVariableDeclaration();
            case tt.Function:
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
                if (this.peekToken(1).type == tt.Colon) {
                    return this.parseLabeledStatement();
                }
            }
            default:
                return this.parseExpressionStatement();
        }
    }

    /**
     * Parses an optional semicolon.
     */
    private parseSemiColon(): void {
        if (this.peekToken().type == tt.SemiColon) {
            this.advance();
        }
    }

    /**
     * Parses a variable declaration.
     * @returns The variable declaration node.
     */
    private parseVariableDeclaration(): t.VariableDeclaration {
        const kindToken = this.getNextToken(tt.Var);

        const declarators = [];
        while (true) {
            declarators.push(this.parseVariableDeclarator());

            if (this.peekToken().type == tt.Comma) {
                this.advance();
            } else {
                break;
            }
        }

        this.parseSemiColon();
        return t.variableDeclaration(kindToken.value, declarators);
    }

    /**
     * Parses a variable declarator.
     * @returns The variable declarator node.
     */
    private parseVariableDeclarator(): t.VariableDeclarator {
        const identifier = this.parseIdentifier();

        this.getNextToken(tt.Assignment);
        
        const expression = this.parseExpression(false);

        return t.variableDeclarator(identifier, expression);
    }

    /**
     * Parses a function declaration or expression.
     * @param isDeclaration Whether it is a function declaration.
     * @returns The function declaration or expression node.
     */
    private parseFunction(isDeclaration: boolean): t.FunctionDeclaration | t.FunctionExpression {
        this.getNextToken(tt.Function);
        
        const identifier = this.peekToken().type == tt.LeftParenthesis
            ? null
            : this.parseIdentifier();
        if (isDeclaration && !identifier) {
            throw new Error('Function statements require a function name');
        }

        const params = this.parseFunctionParams();
        const body = this.parseBlockStatement();

        return isDeclaration
            ? t.functionDeclaration(identifier as t.Identifier, params, body)
            : t.functionExpression(identifier, params, body);
    }

    /**
     * Parses function parameters.
     * @returns The identifier nodes.
     */
    private parseFunctionParams(): t.Identifier[] {
        this.getNextToken(tt.LeftParenthesis);

        const params = [];
        while (this.peekToken().type != tt.RightParenthesis) {
            params.push(this.parseIdentifier());
            if (this.peekToken().type == tt.Comma) {
                this.advance();
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
        this.getNextToken(tt.LeftBrace);

        const statements = [];
        while (this.peekToken().type != tt.RightBrace) {
            statements.push(this.parseStatement());
        }

        this.getNextToken(tt.RightBrace);

        return t.blockStatement(statements);
    }

    /**
     * Parses an if statement.
     * @returns The if statement node.
     */
    private parseIfStatement(): t.IfStatement {
        this.getNextToken(tt.If);
        this.getNextToken(tt.LeftParenthesis);
        
        const test = this.parseExpression();

        this.getNextToken(tt.RightParenthesis);

        const consequent = this.parseStatement();

        let alternate: t.Statement | undefined;
        if (this.peekToken().type == tt.Else) {
            this.getNextToken(tt.Else);
            alternate = this.parseStatement();
        }

        return t.ifStatement(test, consequent, alternate);
    }

    /**
     * Parses a switch statement.
     * @returns The switch statement node.
     */
    private parseSwitchStatement(): t.SwitchStatement {
        this.getNextToken(tt.Switch);
        this.getNextToken(tt.LeftParenthesis);

        const discriminant = this.parseExpression();

        this.getNextToken(tt.RightParenthesis);
        this.getNextToken(tt.LeftBrace);

        const cases = [];
        while (this.peekToken().type != tt.RightBrace) {
            cases.push(this.parseSwitchCase());
        }

        this.getNextToken(tt.RightBrace);

        return t.switchStatement(discriminant, cases);
    }

    /**
     * Parses a switch case.
     * @returns The switch case node.
     */
    private parseSwitchCase(): t.SwitchCase {
        let test: t.Expression | null;
        if (this.peekToken().type == tt.Default) {
            test = null;
            this.advance();
        } else {
            this.getNextToken(tt.Case);
            test = this.parseExpression();
        }
        this.getNextToken(tt.Colon);

        const consequent = [this.parseStatement()];
        while (this.peekToken().type != tt.Case && this.peekToken().type != tt.Default && this.peekToken().type != tt.RightBrace) {
            consequent.push(this.parseStatement());
        }

        return t.switchCase(test, consequent);
    }

    /**
     * Parses a for statement.
     * @returns The for statement node.
     */
    private parseForStatement(): t.ForStatement {
        this.getNextToken(tt.For);
        this.getNextToken(tt.LeftParenthesis);

        let init: t.VariableDeclaration | t.Expression | null;
        if (this.peekToken().type == tt.SemiColon) {
            init = null;
            this.advance();
        } else if (this.peekToken().type == tt.Var) {
            init = this.parseVariableDeclaration();
        } else {
            init = this.parseExpression();
        }
        this.parseSemiColon();
        
        let test: t.Expression | null;
        if (this.peekToken().type == tt.SemiColon) {
            test = null;
        } else {
            test = this.parseExpression();
        }
        this.parseSemiColon();

        let update: t.Expression | null;
        if (this.peekToken().type == tt.RightParenthesis) {
            update = null;
        } else {
            update = this.parseExpression();
        }
        this.getNextToken(tt.RightParenthesis);
        
        const body = this.parseStatement();

        return t.forStatement(init, test, update, body);
    }

    /**
     * Parses a while statement.
     * @returns The while statement node.
     */
    private parseWhileStatement(): t.WhileStatement {
        this.getNextToken(tt.While);
        this.getNextToken(tt.LeftParenthesis);

        const test = this.parseExpression();
        this.getNextToken(tt.RightParenthesis);

        const body = this.parseStatement();

        return t.whileStatement(test, body);
    }

    /**
     * Parses a do while statement.
     * @returns The do while statement node.
     */
    private parseDoWhileStatement(): t.DoWhileStatement {
        this.getNextToken(tt.Do);

        const body = this.parseStatement();

        this.getNextToken(tt.While);
        this.getNextToken(tt.LeftParenthesis);

        const test = this.parseExpression();
        
        this.getNextToken(tt.RightParenthesis);

        return t.doWhileStatement(body, test);
    }

    /**
     * Parses a with statement.
     * @returns The with statement node.
     */
    private parseWithStatement(): t.WithStatement {
        this.getNextToken(tt.With);
        
        this.getNextToken(tt.LeftParenthesis);
        const expression = this.parseExpression();
        this.getNextToken(tt.RightParenthesis);

        const body = this.parseStatement();

        return t.withStatement(expression, body);
    }

    /**
     * Parses a debugger statement.
     * @returns The debugger statement node.
     */
    private parseDebuggerStatement(): t.DebuggerStatement {
        this.getNextToken(tt.Debugger);
        this.parseSemiColon();
        return t.debuggerStatement();
    }
    
    /**
     * Parses a break statement.
     * @returns The break statement node.
     */
    private parseBreakStatement(): t.BreakStatement {
        this.getNextToken(tt.Break);
        this.parseSemiColon();
        return t.breakStatement();
    }

    /**
     * Parses a continue statement.
     * @returns The continue statement node.
     */
    private parseContinueStatement(): t.ContinueStatement {
        this.getNextToken(tt.Continue);
        this.parseSemiColon();
        return t.continueStatement();
    }

    /**
     * Parses a return statement.
     * @returns The return statement node.
     */
    private parseReturnStatement(): t.ReturnStatement {
        this.getNextToken(tt.Return);

        const expression = this.parseExpression();

        this.parseSemiColon();
        return t.returnStatement(expression);
    }

    /**
     * Parses an empty statement.
     * @returns The empty statement node.
     */
    private parseEmptyStatement(): t.EmptyStatement {
        this.parseSemiColon();
        return t.emptyStatement();
    }

    private parseLabeledStatement(): t.LabeledStatement {
        const label = this.parseIdentifier();
        this.getNextToken(tt.Colon);
        const statement = this.parseStatement();

        return t.labeledStatement(label, statement);
    }

    /**
     * Parses an expression statement.
     * @returns The expression statement node.
     */
    private parseExpressionStatement(): t.ExpressionStatement {
        const expression = this.parseExpression();
        this.parseSemiColon();
        return t.expressionStatement(expression);
    }

    /**
     * Parses an expression.
     * @param canBeSequence Whether it can be a sequence expression (defaults to true).
     * @returns The expression node.
     */
    private parseExpression(canBeSequence: boolean = true): t.Expression {
        const expression = this.parseExpressionInner();
        const nextToken = this.peekToken();

        if (assignmentOperatorTokens.has(nextToken.type)) {
            return this.parseAssignmentExpression(expression);
        } else if (binaryOperatorTokens.has(nextToken.type) || logicalOperatorTokens.has(nextToken.type)) {
            return this.parseGroupedExpression(expression);
        } else if (canBeSequence && nextToken.type == tt.Comma) {
            this.advance();
            return this.parseSequenceExpression(expression);
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
        }

        switch (token.type) {
            case tt.Function:
                return this.parseFunction(false) as t.FunctionExpression;
            case tt.Identifier:
                return this.parseIdentifier();
            case tt.Number:
                return this.parseNumericLiteral();
            case tt.True:
            case tt.False:
                return this.parseBooleanLiteral();
            case tt.This:
                return this.parseThisExpression();
            case tt.LeftParenthesis:
                return this.parseParenthesisedExpression();
            case tt.LeftBracket:
                return this.parseArrayExpression();
            case tt.LeftBrace:
                return this.parseObjectExpression();
            default:
                throw new Error(this.unexpectedTokenErrorMessage(token));
        }
    }

    /**
     * Parses an identifier.
     * @returns The identifier node.
     */
    private parseIdentifier(): t.Identifier {
        const token = this.getNextToken(tt.Identifier);
        return t.identifier(token.value);
    }

    /**
     * Parses a numeric literal.
     * @returns The numeric literal node.
     */
    private parseNumericLiteral(): t.NumericLiteral {
        const token = this.getNextToken(tt.Number);
        const value = parseInt(token.value);
        return t.numericLiteral(value);
    }

    /**
     * Parses a boolean literal.
     * @returns The boolean literal node.
     */
    private parseBooleanLiteral(): t.BooleanLiteral {
        const token = this.getNextToken(booleanValueTokens);
        const value = token.type == tt.True;
        return t.booleanLiteral(value);
    }

    /**
     * Parses a this expression.
     * @returns The this expression node.
     */
    private parseThisExpression(): t.ThisExpression {
        this.getNextToken(tt.This);
        return t.thisExpression();
    }

    /**
     * Parses an assignment expression.
     * @param left The left hand side of the assignment.
     * @returns The assignment expression node.
     */
    private parseAssignmentExpression(left: t.Expression): t.AssignmentExpression {
        const operator = this.getNextToken(assignmentOperatorTokens);
        const right = this.parseExpression();
        return t.assignmentExpression(operator.value, left, right);
    }

    /**
     * Parses a unary expression.
     * @returns The unary expression node.
     */
    private parseUnaryExpression(): t.UnaryExpression {
        const operator = this.getNextToken(unaryOperatorTokens);
        const expression = this.parseExpression();
        return t.unaryExpression(operator.value, expression);
    }

    /**
     * Parses a grouped expression. This is either a binary or logical 
     * expression.
     * @param firstExpression The first expression in the grouped expression.
     * @param minPrecedence The minimum precedence to continue (defaults to 0).
     * @returns The binary or logical expression node.
     */
    private parseGroupedExpression(firstExpression: t.Expression, minPrecedence: number = 0): t.BinaryExpression | t.LogicalExpression {
        let expression = firstExpression;
        let lookahead = this.peekToken();

        while (groupedOperatorTokens.has(lookahead.type) && lookahead.type.precedence! >= minPrecedence) {
            const operator = lookahead.type;
            const operatorPrecedence = operator.precedence as number;
            this.advance();
            let right = this.parseExpressionInner();
            
            lookahead = this.peekToken();
            while (groupedOperatorTokens.has(lookahead.type) && (lookahead.type.precedence! > operatorPrecedence
                || (lookahead.type.rightAssociative && lookahead.type.precedence! >= operatorPrecedence))) {
                const nextMinPrecedence = operatorPrecedence + +(lookahead.type.precedence! > operatorPrecedence);
                right = this.parseGroupedExpression(right, nextMinPrecedence);
                lookahead = this.peekToken();
            }

            expression = logicalOperatorTokens.has(operator)
                ? t.logicalExpression(operator.name as any, expression, right)
                : t.binaryExpression(operator.name as any, expression, right);
        }

        return expression as t.BinaryExpression | t.LogicalExpression;
    }

    /**
     * Parses a sequence expression.
     * @param firstExpression The first expression in the sequence.
     * @returns The sequence expression node.
     */
    private parseSequenceExpression(firstExpression: t.Expression): t.SequenceExpression {
        const expressions = [firstExpression];
        while (true) {
            const nextExpression = this.parseExpressionInner();
            expressions.push(nextExpression);

            if (this.peekToken().type == tt.Comma) {
                this.advance();
            } else {
                break;
            }
        }

        return t.sequenceExpression(expressions);
    }

    /**
     * Parses an expression within parenthesis.
     * @returns The expression node.
     */
    private parseParenthesisedExpression(): t.Expression {
        this.getNextToken(tt.LeftParenthesis);
        const expression = this.parseExpression();
        this.getNextToken(tt.RightParenthesis);

        return expression;
    }

    /**
     * Parses an array expression.
     * @returns The array expression node.
     */
    private parseArrayExpression(): t.ArrayExpression {
        this.getNextToken(tt.LeftBracket);

        const elements = [];
        while (this.peekToken().type != tt.RightBracket) {
            if (this.peekToken().type == tt.Comma) {
                elements.push(null);
                this.advance();
            } else {
                elements.push(this.parseExpression(false));
                if (this.peekToken().type == tt.Comma) {
                    this.advance();
                }
            }
        }
        this.getNextToken(tt.RightBracket);

        return t.arrayExpression(elements);
    }

    /**
     * Parses an object expression.
     * @returns The object expression node.
     */
    private parseObjectExpression(): t.ObjectExpression {
        this.getNextToken(tt.LeftBrace);

        const properties = [];
        while (this.peekToken().type != tt.RightBrace) {
            let key: t.Expression;
            let computed = false;
            let method: 'get' | 'set' | undefined;

            let nextToken = this.peekToken();
            if (nextToken.type == tt.LeftBracket) {
                this.getNextToken(tt.LeftBracket);
                key = this.parseExpression();
                this.getNextToken(tt.RightBracket);
                computed = true;
            } else if (nextToken.type == tt.Identifier) {
                key = this.parseIdentifier();

                if (key.name == 'get' || key.name == 'set' && this.peekToken().type == tt.Identifier) { // getter or setter
                    method = key.name;
                    key = this.parseIdentifier();
                    if (this.peekToken().type != tt.LeftParenthesis) {
                        throw new Error(this.unexpectedTokenErrorMessage(this.peekToken(), tt.LeftParenthesis));
                    }
                } else if (this.peekToken().type == tt.Comma) { // shorthand property
                    this.advance();
                    const property = t.objectProperty(key, key, false, true);
                    properties.push(property);
                    continue;
                }
            } else {
                throw new Error(this.unexpectedTokenErrorMessage(nextToken));
            }

            let property: t.ObjectProperty | t.ObjectMethod;
            nextToken = this.peekToken();
            if (nextToken.type == tt.Colon) {
                this.getNextToken();
                const value = this.parseExpression(false);
                property = t.objectProperty(key, value, computed);
            } else if (nextToken.type == tt.LeftParenthesis) {
                const params = this.parseFunctionParams();
                const body = this.parseBlockStatement();
                property = t.objectMethod(method || 'method', key, params, body, computed);
            } else {
                throw new Error(this.unexpectedTokenErrorMessage(nextToken));
            }
            properties.push(property);

            if (this.peekToken().type == tt.Comma) {
                this.advance();
            }
        }
        this.getNextToken(tt.RightBrace);

        return t.objectExpression(properties);
    }
}