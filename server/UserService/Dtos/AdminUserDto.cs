using System.Text.Json.Serialization;
using UserService.Models;

namespace UserService.Dtos;

public class AdminUserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }

    public DateTime CreatedAt { get; set; }
}
