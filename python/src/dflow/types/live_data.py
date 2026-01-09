"""Live data types for DFlow SDK."""

from pydantic import BaseModel


class LiveDataMilestone(BaseModel):
    """Milestone in live data."""

    id: str
    name: str
    value: str | int | float | None = None
    timestamp: str | None = None


class LiveData(BaseModel):
    """Live data for an event."""

    event_ticker: str | None = None
    milestones: list[LiveDataMilestone]


class LiveDataResponse(BaseModel):
    """Response from live data endpoint."""

    data: list[LiveData]
