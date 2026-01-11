"""Live data types for DFlow SDK."""

from pydantic import BaseModel, Field


class LiveDataMilestone(BaseModel):
    """A milestone data point from live data."""

    id: str
    name: str
    value: str | int | float | None = None
    timestamp: str | None = None


class LiveData(BaseModel):
    """Live data for an event or market."""

    event_ticker: str | None = Field(default=None, alias="eventTicker")
    milestones: list[LiveDataMilestone] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class LiveDataResponse(BaseModel):
    """Response from the live data endpoint."""

    data: list[LiveData] = Field(default_factory=list)


class LiveDataParams(BaseModel):
    """Parameters for fetching live data."""

    # Array of milestone IDs (max 100). Required parameter.
    milestone_ids: list[str] = Field(alias="milestoneIds")

    model_config = {"populate_by_name": True}


class LiveDataFilterParams(BaseModel):
    """Filter parameters for live data by event or mint endpoints."""

    # Minimum start date to filter milestones (RFC3339 format)
    minimum_start_date: str | None = Field(default=None, alias="minimumStartDate")
    # Filter by milestone category
    category: str | None = None
    # Filter by competition
    competition: str | None = None
    # Filter by source ID
    source_id: str | None = Field(default=None, alias="sourceId")
    # Filter by milestone type
    type: str | None = None

    model_config = {"populate_by_name": True}
