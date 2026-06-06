namespace TravelService.Dtos;

public class ShareResponseDto
{
    public string Token { get; set; } = string.Empty;
    public int TravelPlanId { get; set; }
    public string AccessLevel { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public string ShareUrl { get; set; } = string.Empty;
}