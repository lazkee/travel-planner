namespace TravelService.Dtos;

public class UserTravelDataCleanupResultDto
{
    public int UserId { get; set; }
    public int DeletedTravelPlansCount { get; set; }
    public int RevokedShareTokensCount { get; set; }
}
