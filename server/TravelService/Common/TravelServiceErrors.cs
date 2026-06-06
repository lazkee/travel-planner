using TravelPlanner.Shared.Common;

namespace TravelService.Common;

public static class TravelServiceErrors
{
    public static class TravelPlanErrors
    {
        public static readonly Error NotFound =
            new("TravelPlan.NotFound", "Travel plan was not found.");

        public static readonly Error Forbidden =
            new("TravelPlan.Forbidden", "You are not allowed to access this travel plan.");

        public static readonly Error InvalidDateRange =
            new("TravelPlan.InvalidDateRange", "End date cannot be before start date.");

        public static readonly Error InvalidBudget =
            new("TravelPlan.InvalidBudget", "Budget cannot be negative.");
    }

    public static class DestinationErrors
    {
        public static readonly Error NotFound =
            new("Destination.NotFound", "Destination was not found.");

        public static readonly Error InvalidDateRange =
            new("Destination.InvalidDateRange", "Departure date cannot be before arrival date.");
    }

    public static class ActivityErrors
    {
        public static readonly Error NotFound =
            new("Activity.NotFound", "Activity was not found.");

        public static readonly Error InvalidEstimatedCost =
            new("Activity.InvalidEstimatedCost", "Estimated cost cannot be negative.");
    }
}