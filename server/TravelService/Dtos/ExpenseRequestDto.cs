using System.ComponentModel.DataAnnotations;
using TravelService.Models;

namespace TravelService.Dtos;

public class ExpenseRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public ExpenseCategory Category { get; set; }

    public double Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public string? Description { get; set; }
}