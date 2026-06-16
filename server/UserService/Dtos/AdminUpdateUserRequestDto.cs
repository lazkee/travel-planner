using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using UserService.Models;

namespace UserService.Dtos;

public class AdminUpdateUserRequestDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole? Role { get; set; }
}
