"""Tests for Proof KYC API module."""

import time
from unittest.mock import patch

import pytest
from pytest_httpx import HTTPXMock

from dflow import DFlowClient, DeepLinkParams, DFlowApiError


class TestProofAPI:
    """Tests for ProofAPI."""

    def test_verify_address_verified(self, httpx_mock: HTTPXMock):
        """Test verify_address returns verified=True for verified wallet."""
        httpx_mock.add_response(
            url="https://proof.dflow.net/verify/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            json={"verified": True},
        )

        with DFlowClient() as client:
            result = client.proof.verify_address(
                "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
            )

            assert result.verified is True

    def test_verify_address_not_verified(self, httpx_mock: HTTPXMock):
        """Test verify_address returns verified=False for unverified wallet."""
        httpx_mock.add_response(
            url="https://proof.dflow.net/verify/UnverifiedWallet123456789abcdefghijk",
            json={"verified": False},
        )

        with DFlowClient() as client:
            result = client.proof.verify_address(
                "UnverifiedWallet123456789abcdefghijk"
            )

            assert result.verified is False

    def test_verify_address_invalid_address(self, httpx_mock: HTTPXMock):
        """Test verify_address handles invalid address error."""
        httpx_mock.add_response(
            url="https://proof.dflow.net/verify/invalid",
            status_code=400,
            json={"error": "Invalid wallet address"},
        )

        with DFlowClient() as client:
            with pytest.raises(DFlowApiError) as exc_info:
                client.proof.verify_address("invalid")

            assert exc_info.value.status_code == 400

    def test_verify_address_not_found(self, httpx_mock: HTTPXMock):
        """Test verify_address handles 404 error."""
        httpx_mock.add_response(
            url="https://proof.dflow.net/verify/NonExistentWallet12345678901234567",
            status_code=404,
            json={"error": "Address not found"},
        )

        with DFlowClient() as client:
            with pytest.raises(DFlowApiError) as exc_info:
                client.proof.verify_address("NonExistentWallet12345678901234567")

            assert exc_info.value.status_code == 404


class TestProofAPISignatureMessage:
    """Tests for ProofAPI.generate_signature_message."""

    def test_generate_signature_message_with_timestamp(self):
        """Test generate_signature_message with explicit timestamp."""
        with DFlowClient() as client:
            message = client.proof.generate_signature_message(1699123456789)

            assert message == "Proof KYC verification: 1699123456789"

    def test_generate_signature_message_without_timestamp(self):
        """Test generate_signature_message uses current time when no timestamp provided."""
        with DFlowClient() as client:
            # Mock time to get predictable result
            with patch("time.time", return_value=1699123456.789):
                message = client.proof.generate_signature_message()

            assert message == "Proof KYC verification: 1699123456789"

    def test_generate_signature_message_format(self):
        """Test generate_signature_message follows correct format."""
        with DFlowClient() as client:
            message = client.proof.generate_signature_message(1234567890123)

            # Verify format: "Proof KYC verification: {timestamp}"
            assert message.startswith("Proof KYC verification: ")
            timestamp_part = message.split(": ")[1]
            assert timestamp_part == "1234567890123"
            assert int(timestamp_part) == 1234567890123

    def test_generate_signature_message_different_timestamps(self):
        """Test generate_signature_message produces different messages for different timestamps."""
        with DFlowClient() as client:
            message1 = client.proof.generate_signature_message(1000000000000)
            message2 = client.proof.generate_signature_message(2000000000000)

            assert message1 != message2
            assert "1000000000000" in message1
            assert "2000000000000" in message2


class TestProofAPIDeepLink:
    """Tests for ProofAPI.build_deep_link."""

    def test_build_deep_link_basic(self):
        """Test build_deep_link with required parameters only."""
        with DFlowClient() as client:
            link = client.proof.build_deep_link(
                DeepLinkParams(
                    wallet="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
                    signature="5TuPHPFe7p3nLh",
                    timestamp=1699123456789,
                    redirect_uri="https://myapp.com/callback",
                )
            )

            assert link.startswith("https://dflow.net/proof?")
            assert "wallet=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" in link
            assert "signature=5TuPHPFe7p3nLh" in link
            assert "timestamp=1699123456789" in link
            assert "redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback" in link
            assert "projectId" not in link

    def test_build_deep_link_with_project_id(self):
        """Test build_deep_link with optional project_id."""
        with DFlowClient() as client:
            link = client.proof.build_deep_link(
                DeepLinkParams(
                    wallet="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
                    signature="5TuPHPFe7p3nLh",
                    timestamp=1699123456789,
                    redirect_uri="https://myapp.com/callback",
                    project_id="my-dapp-project",
                )
            )

            assert "projectId=my-dapp-project" in link

    def test_build_deep_link_url_encoding(self):
        """Test build_deep_link properly URL encodes special characters."""
        with DFlowClient() as client:
            link = client.proof.build_deep_link(
                DeepLinkParams(
                    wallet="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
                    signature="abc+def/ghi=",
                    timestamp=1699123456789,
                    redirect_uri="https://myapp.com/callback?foo=bar&baz=qux",
                )
            )

            # Check URL encoding of special characters
            assert "signature=abc%2Bdef%2Fghi%3D" in link
            assert "redirect_uri=https%3A%2F%2Fmyapp.com%2Fcallback%3Ffoo%3Dbar%26baz%3Dqux" in link

    def test_build_deep_link_base_url(self):
        """Test build_deep_link uses correct base URL."""
        with DFlowClient() as client:
            link = client.proof.build_deep_link(
                DeepLinkParams(
                    wallet="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
                    signature="test",
                    timestamp=1699123456789,
                    redirect_uri="https://example.com",
                )
            )

            assert link.startswith("https://dflow.net/proof?")

    def test_build_deep_link_with_alias_field_names(self):
        """Test DeepLinkParams works with both snake_case and camelCase field names."""
        # Test with snake_case (Python style)
        params_snake = DeepLinkParams(
            wallet="wallet123",
            signature="sig123",
            timestamp=1699123456789,
            redirect_uri="https://example.com",
            project_id="project123",
        )
        assert params_snake.redirect_uri == "https://example.com"
        assert params_snake.project_id == "project123"

        # Test with camelCase via alias (API style)
        params_camel = DeepLinkParams(
            wallet="wallet123",
            signature="sig123",
            timestamp=1699123456789,
            redirectUri="https://example.com",
            projectId="project123",
        )
        assert params_camel.redirect_uri == "https://example.com"
        assert params_camel.project_id == "project123"


class TestProofAPIIntegration:
    """Integration tests for ProofAPI combining multiple methods."""

    def test_full_verification_flow(self, httpx_mock: HTTPXMock):
        """Test the full partner verification flow."""
        # Step 1: Check if wallet is verified (it's not)
        httpx_mock.add_response(
            url="https://proof.dflow.net/verify/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            json={"verified": False},
        )

        with DFlowClient() as client:
            # Check initial verification status
            result = client.proof.verify_address(
                "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
            )
            assert result.verified is False

            # Generate signature message
            timestamp = 1699123456789
            message = client.proof.generate_signature_message(timestamp)
            assert "1699123456789" in message

            # Build deep link for user to verify
            link = client.proof.build_deep_link(
                DeepLinkParams(
                    wallet="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
                    signature="user_signature_here",
                    timestamp=timestamp,
                    redirect_uri="https://partner-app.com/verified",
                    project_id="partner-app",
                )
            )

            # Verify the link contains all expected parameters
            assert "wallet=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" in link
            assert "signature=user_signature_here" in link
            assert "timestamp=1699123456789" in link
            assert "projectId=partner-app" in link


class TestProofConstants:
    """Tests for Proof-related constants."""

    def test_proof_api_base_url(self):
        """Test PROOF_API_BASE_URL constant is correctly defined."""
        from dflow import PROOF_API_BASE_URL

        assert PROOF_API_BASE_URL == "https://proof.dflow.net"

    def test_proof_deep_link_base_url(self):
        """Test PROOF_DEEP_LINK_BASE_URL constant is correctly defined."""
        from dflow import PROOF_DEEP_LINK_BASE_URL

        assert PROOF_DEEP_LINK_BASE_URL == "https://dflow.net/proof"

    def test_proof_signature_message_prefix(self):
        """Test PROOF_SIGNATURE_MESSAGE_PREFIX constant is correctly defined."""
        from dflow import PROOF_SIGNATURE_MESSAGE_PREFIX

        assert PROOF_SIGNATURE_MESSAGE_PREFIX == "Proof KYC verification: "
