namespace TravelService.Models;

public class TravelActivity
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public TravelPlan TravelPlan { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan? Time { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public double EstimatedCost { get; set; }
    public ActivityStatus Status { get; set; }
}