using System.ComponentModel.DataAnnotations;

namespace TravelService.Dtos;

public class ShareRequestDto
{
    [Required]
    public string AccessLevel { get; set; } = string.Empty;

    [Required]
    public DateTime ExpiresAtUtc { get; set; }
}