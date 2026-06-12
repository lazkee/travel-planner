using System.Runtime.Serialization;
using TravelPlanner.Shared.Enums;

namespace TravelPlanner.Shared.Sharing;

[DataContract]
public class ShareTokenDto
{
    [DataMember] public string Token { get; set; } = string.Empty;
    [DataMember] public int TravelPlanId { get; set; }
    [DataMember] public ShareAccessLevel AccessLevel { get; set; }
    [DataMember] public DateTime ExpiresAtUtc { get; set; }
}
