namespace TravelService.Dtos;

public class AdminTravelPlanDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public double Budget { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}
