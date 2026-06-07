using TravelPlanner.Shared.Common;
using TravelPlanner.Shared.Sharing;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ISharingClientService
{
    Task<Result<ShareResponseDto>> CreateShareAsync(int travelPlanId, string accessLevel, DateTime expiresAtUtc);
    Task<Result<ShareTokenDto>> ValidateShareAsync(string token);
    Task<Result<ShareTokenDto>> ValidateEditShareAsync(string token);
    Task<Result<int>> RevokeSharesForPlanAsync(int travelPlanId);
}