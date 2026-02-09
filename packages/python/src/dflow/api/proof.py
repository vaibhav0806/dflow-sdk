"""Proof KYC API for DFlow SDK."""

import time
from urllib.parse import urlencode

from dflow.types.proof import DeepLinkParams, VerifyAddressResponse
from dflow.utils.constants import (
    PROOF_DEEP_LINK_BASE_URL,
    PROOF_SIGNATURE_MESSAGE_PREFIX,
)
from dflow.utils.http import HttpClient


class ProofAPI:
    """API for Proof KYC verification.

    Proof is DFlow's KYC verification service. This API allows you to:
    - Check if a wallet address has completed KYC verification
    - Generate the message that needs to be signed for verification
    - Build deep links for partner integration

    Example:
        >>> dflow = DFlowClient()
        >>>
        >>> # Check if an address is verified
        >>> result = dflow.proof.verify_address("7xKXtg2CW...")
        >>> print(f"Verified: {result.verified}")
        >>>
        >>> # Generate signature message
        >>> timestamp = 1699123456789
        >>> message = dflow.proof.generate_signature_message(timestamp)
        >>> # Sign this message with the user's wallet
        >>>
        >>> # Build deep link for verification
        >>> link = dflow.proof.build_deep_link(DeepLinkParams(
        ...     wallet="7xKXtg2CW...",
        ...     signature="signed_message_base58",
        ...     timestamp=timestamp,
        ...     redirect_uri="https://myapp.com/callback"
        ... ))
    """

    def __init__(self, http: HttpClient):
        """Initialize ProofAPI.

        Args:
            http: HttpClient configured for the Proof API base URL
        """
        self._http = http

    def verify_address(self, address: str) -> VerifyAddressResponse:
        """Check if a wallet address has completed KYC verification.

        Args:
            address: Solana wallet address to check

        Returns:
            VerifyAddressResponse with verified status

        Example:
            >>> result = dflow.proof.verify_address(
            ...     "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
            ... )
            >>> if result.verified:
            ...     print("User is verified!")
            ... else:
            ...     print("User needs to complete KYC")
        """
        data = self._http.get(f"/verify/{address}")
        return VerifyAddressResponse.model_validate(data)

    def generate_signature_message(self, timestamp: int | None = None) -> str:
        """Generate the message to be signed for KYC verification.

        The user should sign this message with their wallet to prove ownership.
        The signature is then used in the deep link for verification.

        Args:
            timestamp: Unix timestamp in milliseconds. If not provided,
                      uses the current time.

        Returns:
            The message string to be signed

        Example:
            >>> import time
            >>> timestamp = int(time.time() * 1000)
            >>> message = dflow.proof.generate_signature_message(timestamp)
            >>> print(message)  # "Proof KYC verification: 1699123456789"
            >>> # Now sign this message with the user's wallet
        """
        if timestamp is None:
            timestamp = int(time.time() * 1000)

        return f"{PROOF_SIGNATURE_MESSAGE_PREFIX}{timestamp}"

    def build_deep_link(self, params: DeepLinkParams) -> str:
        """Build a deep link URL for the Proof KYC verification flow.

        Partners can use this to redirect users to complete KYC verification.
        After verification, users are redirected to the specified redirect_uri.

        Args:
            params: Deep link parameters including wallet, signature, etc.

        Returns:
            Complete deep link URL

        Example:
            >>> link = dflow.proof.build_deep_link(DeepLinkParams(
            ...     wallet="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            ...     signature="base58_signature_here",
            ...     timestamp=1699123456789,
            ...     redirect_uri="https://myapp.com/verification-complete",
            ...     project_id="my-dapp"
            ... ))
            >>> print(link)
            # https://dflow.net/proof?wallet=7xKXtg...&signature=...&...
        """
        query_params = {
            "wallet": params.wallet,
            "signature": params.signature,
            "timestamp": str(params.timestamp),
            "redirect_uri": params.redirect_uri,
        }

        if params.project_id:
            query_params["projectId"] = params.project_id

        return f"{PROOF_DEEP_LINK_BASE_URL}?{urlencode(query_params)}"
