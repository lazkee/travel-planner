using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Sharing;

[DataContract]
public class ShareValidationResult
{
    [DataMember] public bool IsValid { get; set; }
    [DataMember] public string? ErrorCode { get; set; }
    [DataMember] public ShareTokenDto? Token { get; set; }
}