namespace TravelService.Models;

public class Expense
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public TravelPlan TravelPlan { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public ExpenseCategory Category { get; set; }
    public double Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}