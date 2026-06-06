using System.ComponentModel.DataAnnotations;
using TravelService.Models;

namespace TravelService.Dtos;

public class ActivityRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public DateTime Date { get; set; }
    public TimeSpan? Time { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public double EstimatedCost { get; set; }
    public ActivityStatus Status { get; set; }
}