using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Travel;

[DataContract]
public class TravelDataCleanupRemotingResult
{
    [DataMember] public bool IsSuccess { get; set; }
    [DataMember] public string? ErrorCode { get; set; }
    [DataMember] public string? ErrorMessage { get; set; }
    [DataMember] public UserTravelDataCleanupResultDto? CleanupResult { get; set; }
}
