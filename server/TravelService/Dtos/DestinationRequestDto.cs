using System.ComponentModel.DataAnnotations;

namespace TravelService.Dtos;

public class DestinationRequestDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(300)]
    public string Location { get; set; } = string.Empty;

    public DateTime ArrivalDate { get; set; }
    public DateTime DepartureDate { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }
}