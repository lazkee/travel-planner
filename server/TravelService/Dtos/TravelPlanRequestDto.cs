using System.ComponentModel.DataAnnotations;

namespace TravelService.Dtos;

public class TravelPlanRequestDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [Range(0.0, double.MaxValue)]
    public double Budget { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }
}