using TravelService.Models;

namespace TravelService.Dtos;

public class BudgetCategorySummaryDto
{
    public ExpenseCategory Category { get; set; }
    public double TotalAmount { get; set; }
}