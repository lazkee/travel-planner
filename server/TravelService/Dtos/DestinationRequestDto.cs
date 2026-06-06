using System.ComponentModel.DataAnnotations;

namespace TravelService.Dtos;

public class DestinationRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    public DateTime ArrivalDate { get; set; }
    public DateTime DepartureDate { get; set; }
    public string? Description { get; set; }
}