namespace TravelService.Services;

public sealed class SharedAccessContext
{
    public int TravelPlanId { get; init; }
    public string AccessLevel { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}
