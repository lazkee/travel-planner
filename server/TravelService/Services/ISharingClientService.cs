using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ISharingClientService
{
    Task<Result<ShareResponseDto>> CreateShareAsync(int travelPlanId, string accessLevel, DateTime expiresAtUtc);
}