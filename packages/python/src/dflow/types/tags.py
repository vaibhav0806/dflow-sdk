"""Tag types for DFlow SDK."""

from typing import Any

from pydantic import BaseModel, Field

# Tags organized by category. Some categories may have None as value.
CategoryTags = dict[str, list[str] | None]


class TagsByCategoriesResponse(BaseModel):
    """Response from the tags by categories endpoint."""

    tags_by_categories: CategoryTags = Field(alias="tagsByCategories")

    model_config = {"populate_by_name": True}


class CompetitionScopes(BaseModel):
    """Scopes available for a specific competition."""

    scopes: list[str] = Field(default_factory=list)


class SportFilterData(BaseModel):
    """Sports filter data - filtering options for each sport."""

    # Available scopes for this sport
    scopes: list[str] | None = None
    # Competitions with their scopes (dict of competition name -> CompetitionScopes)
    competitions: dict[str, CompetitionScopes] | dict[str, Any] | None = None


# Sports filters organized by sport name.
FiltersBySports = dict[str, SportFilterData]


class FiltersBySportsResponse(BaseModel):
    """Response from the filters by sports endpoint."""

    # Filters organized by sports
    filters_by_sports: FiltersBySports = Field(alias="filtersBySports")
    # Ordered list of sports
    sport_ordering: list[str] = Field(alias="sportOrdering")

    model_config = {"populate_by_name": True}


# Keep for backwards compatibility
class SportsFilter(BaseModel):
    """Sports filter with leagues and teams (legacy type)."""

    sport: str
    leagues: list[str] = Field(default_factory=list)
    teams: list[str] | None = None


# Legacy alias
class SportsFilters(BaseModel):
    """Response from sports filters endpoint (legacy)."""

    filters_by_sports: dict[str, SportFilterData] = Field(
        default_factory=dict, alias="filtersBySports"
    )
    sport_ordering: list[str] = Field(default_factory=list, alias="sportOrdering")

    model_config = {"populate_by_name": True}

    @property
    def sport_names(self) -> list[str]:
        """Get list of all sport names."""
        return self.sport_ordering

    def get_sport_filter(self, sport_name: str) -> SportFilterData | None:
        """Get filter info for a specific sport."""
        return self.filters_by_sports.get(sport_name)
