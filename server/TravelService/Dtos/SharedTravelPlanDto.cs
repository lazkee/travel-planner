using TravelPlanner.Shared.Enums;

namespace TravelService.Dtos;

public class SharedTravelPlanDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public double Budget { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<DestinationDto> Destinations { get; set; } = new();
    public List<ActivityDto> Activities { get; set; } = new();
    public List<ExpenseDto> Expenses { get; set; } = new();
    public List<ChecklistItemDto> ChecklistItems { get; set; } = new();
    public BudgetSummaryDto BudgetSummary { get; set; } = new();

    public ShareAccessLevel AccessLevel { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
}
