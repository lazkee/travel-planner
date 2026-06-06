using System.Runtime.Serialization;

namespace TravelPlanner.Shared.Sharing;

[DataContract]
public class ShareCreateResult
{
    [DataMember] public bool IsSuccess { get; set; }
    [DataMember] public string? ErrorCode { get; set; }
    [DataMember] public ShareTokenDto? Token { get; set; }
}