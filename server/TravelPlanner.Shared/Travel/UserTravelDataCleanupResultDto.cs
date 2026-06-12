using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Travel;

[DataContract]
public class UserTravelDataCleanupResultDto
{
    [DataMember] public int UserId { get; set; }
    [DataMember] public int DeletedTravelPlansCount { get; set; }
    [DataMember] public int RevokedShareTokensCount { get; set; }
}
