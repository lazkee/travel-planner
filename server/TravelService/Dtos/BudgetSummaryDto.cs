namespace TravelService.Dtos;

public class BudgetSummaryDto
{
    public int TravelPlanId { get; set; }
    public double Budget { get; set; }
    public double TotalExpenses { get; set; }
    public double RemainingBudget { get; set; }
    public List<BudgetCategorySummaryDto> Categories { get; set; } = new();
}