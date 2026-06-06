using System.ComponentModel.DataAnnotations;

namespace TravelService.Dtos;

public class ChecklistItemRequestDto
{
    [Required]
    public string Text { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}