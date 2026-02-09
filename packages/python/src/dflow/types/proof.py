"""Proof KYC types for DFlow SDK."""

from pydantic import BaseModel, Field


class VerifyAddressResponse(BaseModel):
    """Response from the Proof KYC verify endpoint.

    Indicates whether a wallet address has completed KYC verification.
    """

    verified: bool = Field(description="Whether the address has been verified")


class DeepLinkParams(BaseModel):
    """Parameters for generating a Proof KYC deep link.

    Used by partners to redirect users to the Proof KYC verification flow.
    After verification, users are redirected back to the partner's redirect_uri.

    Example:
        >>> params = DeepLinkParams(
        ...     wallet="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        ...     signature="base58_encoded_signature",
        ...     timestamp=1699123456789,
        ...     redirect_uri="https://myapp.com/callback",
        ...     project_id="my-project"
        ... )
    """

    wallet: str = Field(description="Solana wallet address to verify")
    signature: str = Field(
        description="Base58 encoded signature proving wallet ownership"
    )
    timestamp: int = Field(
        description="Unix timestamp in milliseconds when the signature was created"
    )
    redirect_uri: str = Field(
        alias="redirectUri",
        description="URL to redirect to after verification completes",
    )
    project_id: str | None = Field(
        default=None,
        alias="projectId",
        description="Optional partner project identifier",
    )

    model_config = {"populate_by_name": True}
