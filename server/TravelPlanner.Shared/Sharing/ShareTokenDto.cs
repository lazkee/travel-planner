using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Sharing;

[DataContract]
public class ShareTokenDto
{
    [DataMember] public string Token { get; set; } = string.Empty;
    [DataMember] public int TravelPlanId { get; set; }
    [DataMember] public string AccessLevel { get; set; } = string.Empty;
    [DataMember] public DateTime ExpiresAtUtc { get; set; }
}