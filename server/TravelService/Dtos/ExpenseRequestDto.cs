using System.ComponentModel.DataAnnotations;
using TravelService.Models;

namespace TravelService.Dtos;

public class ExpenseRequestDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(ExpenseCategory))]
    public ExpenseCategory Category { get; set; }

    [Range(0.0, double.MaxValue)]
    public double Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }
}