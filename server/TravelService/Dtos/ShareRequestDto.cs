using System.ComponentModel.DataAnnotations;
using TravelPlanner.Shared.Enums;

namespace TravelService.Dtos;

public class ShareRequestDto
{
    [Required]
    [EnumDataType(typeof(ShareAccessLevel))]
    public ShareAccessLevel? AccessLevel { get; set; }

    [Required]
    public DateTime ExpiresAtUtc { get; set; }
}
