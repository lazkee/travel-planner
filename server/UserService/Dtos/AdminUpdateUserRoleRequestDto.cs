using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using UserService.Models;

namespace UserService.Dtos;

public class AdminUpdateUserRoleRequestDto
{
    [EnumDataType(typeof(UserRole))]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }
}
