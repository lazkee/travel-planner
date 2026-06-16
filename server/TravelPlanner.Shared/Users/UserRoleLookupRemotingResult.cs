using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Users;

[DataContract]
public class UserRoleLookupRemotingResult
{
    [DataMember] public bool IsSuccess { get; set; }
    [DataMember] public string? ErrorCode { get; set; }
    [DataMember] public string? ErrorMessage { get; set; }
    [DataMember] public List<UserRoleLookupItemDto> Users { get; set; } = new();
}
