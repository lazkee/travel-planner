using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Users;

[DataContract]
public class UserRoleLookupItemDto
{
    [DataMember] public int UserId { get; set; }
    [DataMember] public string Role { get; set; } = string.Empty;
}
