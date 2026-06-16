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

        public static readonly Error StartDateInPast =
            new("TravelPlan.StartDateInPast", "Travel plan start date cannot be in the past.");

        public static readonly Error DateRangeExcludesActivities =
            new("TravelPlan.DateRangeExcludesActivities", "Travel plan date range must include all existing activities.");

        public static readonly Error InvalidBudget =
            new("TravelPlan.InvalidBudget", "Budget cannot be negative.");

        public static readonly Error UserRoleLookupFailed =
            new("TravelPlan.UserRoleLookupFailed", "Unable to verify travel plan owner roles.");
    }

    public static class DestinationErrors
    {
        public static readonly Error NotFound =
            new("Destination.NotFound", "Destination was not found.");

        public static readonly Error InvalidDateRange =
            new("Destination.InvalidDateRange", "Departure date cannot be before arrival date.");

        public static readonly Error DateOutsideTravelPlan =
            new("Destination.DateOutsideTravelPlan", "Destination dates must be within the travel plan date range.");
    }

    public static class ActivityErrors
    {
        public static readonly Error NotFound =
            new("Activity.NotFound", "Activity was not found.");

        public static readonly Error InvalidEstimatedCost =
            new("Activity.InvalidEstimatedCost", "Estimated cost cannot be negative.");

        public static readonly Error DateOutsideTravelPlan =
            new("Activity.DateOutsideTravelPlan", "Activity date must be within the travel plan date range.");

        public static readonly Error InvalidStatus =
            new("Activity.InvalidStatus", "Activity status is invalid.");
    }

    public static class ExpenseErrors
    {
        public static readonly Error NotFound =
            new("Expense.NotFound", "Expense was not found.");

        public static readonly Error InvalidAmount =
            new("Expense.InvalidAmount", "Expense amount cannot be negative.");

        public static readonly Error DateOutsideTravelPlan =
            new("Expense.DateOutsideTravelPlan", "Expense date must be within the travel plan date range.");

        public static readonly Error InvalidCategory =
            new("Expense.InvalidCategory", "Expense category is invalid.");
    }

    public static class ChecklistItemErrors
    {
        public static readonly Error NotFound =
            new("ChecklistItem.NotFound", "Checklist item was not found.");

        public static readonly Error EmptyText =
            new("ChecklistItem.EmptyText", "Checklist item text is required.");
    }
}
