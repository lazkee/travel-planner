namespace TravelService.Models;

public class TravelPlan
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public double Budget { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public ICollection<Destination> Destinations { get; set; } = new List<Destination>();
    public ICollection<TravelActivity> Activities { get; set; } = new List<TravelActivity>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();
}