"""Tokens API for DFlow SDK."""

from dflow.types import TokenWithDecimals
from dflow.utils.http import HttpClient


class TokensAPI:
    """API for retrieving available token information.

    Get information about tokens supported for trading, including
    their mint addresses and decimal precision.

    Example:
        >>> dflow = DFlowClient()
        >>> tokens = dflow.tokens.get_tokens()
        >>> for mint in tokens[:5]:
        ...     print(f"Mint: {mint}")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_tokens(self) -> list[str]:
        """Get all available token mint addresses for trading.

        Returns:
            List of token mint addresses (Solana public keys)

        Example:
            >>> mints = dflow.tokens.get_tokens()
            >>> print(f"Found {len(mints)} tokens")
        """
        data = self._http.get("/tokens")
        return data

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
            ...     base_units = 1 * (10 ** token.decimals)
        """
        data = self._http.get("/tokens-with-decimals")
        return [TokenWithDecimals.model_validate(t) for t in data]
