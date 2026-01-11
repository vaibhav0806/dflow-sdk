"""Tokens API for DFlow SDK."""

from dflow.types import Token, TokenWithDecimals
from dflow.utils.http import HttpClient


class TokensAPI:
    """API for retrieving available token information.

    Get information about tokens supported for trading, including
    their mint addresses and decimal precision.

    Example:
        >>> dflow = DFlowClient()
        >>>
        >>> # Get all available tokens
        >>> tokens = dflow.tokens.get_tokens()
        >>>
        >>> # Get tokens with decimal information
        >>> tokens_with_decimals = dflow.tokens.get_tokens_with_decimals()
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_tokens(self) -> list[Token]:
        """Get all available tokens for trading.

        Returns:
            Array of token information

        Example:
            >>> tokens = dflow.tokens.get_tokens()
            >>> for token in tokens:
            ...     print(f"{token.symbol}: {token.mint}")
        """
        data = self._http.get("/tokens")
        return [Token.model_validate(t) for t in data]

    def get_tokens_with_decimals(self) -> list[TokenWithDecimals]:
        """Get all available tokens with decimal information.

        Includes the number of decimal places for each token,
        useful for formatting amounts correctly.

        Returns:
            Array of tokens with decimal information

        Example:
            >>> tokens = dflow.tokens.get_tokens_with_decimals()
            >>> for token in tokens:
            ...     print(f"{token.symbol}: {token.decimals} decimals")
            ...     # Convert 1 token to base units
            ...     base_units = 1 * (10 ** token.decimals)
        """
        data = self._http.get("/tokens-with-decimals")
        return [TokenWithDecimals.model_validate(t) for t in data]
