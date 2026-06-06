using System.ComponentModel.DataAnnotations;

namespace TravelService.Dtos;

public class TravelPlanRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public double Budget { get; set; }
    public string? Notes { get; set; }
}