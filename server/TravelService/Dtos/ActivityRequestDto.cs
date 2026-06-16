using System.ComponentModel.DataAnnotations;
using TravelService.Models;

namespace TravelService.Dtos;

public class ActivityRequestDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public DateTime Date { get; set; }
    public TimeSpan? Time { get; set; }

    [StringLength(300)]
    public string? Location { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [Range(0.0, double.MaxValue)]
    public double EstimatedCost { get; set; }

    [EnumDataType(typeof(ActivityStatus))]
    public ActivityStatus Status { get; set; }
}