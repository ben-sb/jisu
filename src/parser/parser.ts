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
            if (requiredType instanceof Set) {
                if (!requiredType.has(token.type)) {
                    throw new Error(`Unexpected token ${token.value}, expected one of ${Array.from(requiredType).map(t => t.name).join(',')}`);
                }
            } else if (token.type != requiredType) {
                throw new Error(`Unexpected token ${token.value}, expected ${requiredType.name}`);
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
            case tt.Break:
                return this.parseBreakStatement();
            case tt.Continue:
                return this.parseContinueStatement();
            case tt.Return:
                return this.parseReturnStatement();
            case tt.SemiColon:
                return this.parseEmptyStatement();
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
            default:
                throw new Error(`Unexpected token ${token.value}`);
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
}