"""Tag types for DFlow SDK."""

from pydantic import BaseModel


# CategoryTags is a dict mapping category names to lists of tag strings
CategoryTags = dict[str, list[str]]


class SportsFilter(BaseModel):
    """Sports filter with leagues and teams."""

    sport: str
    leagues: list[str]
    teams: list[str] | None = None


class SportsFilters(BaseModel):
    """Response from sports filters endpoint."""

    sports: list[SportsFilter]
