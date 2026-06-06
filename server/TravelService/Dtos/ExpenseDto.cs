using TravelService.Models;

namespace TravelService.Dtos;

public class ExpenseDto
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public string Name { get; set; } = string.Empty;
    public ExpenseCategory Category { get; set; }
    public double Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}