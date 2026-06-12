using TravelPlanner.Shared.Common;
using TravelPlanner.Shared.Enums;
using TravelPlanner.Shared.Sharing;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ISharingClientService
{
    Task<Result<ShareResponseDto>> CreateShareAsync(int travelPlanId, ShareAccessLevel accessLevel, DateTime expiresAtUtc);
    Task<Result<ShareTokenDto>> ValidateShareAsync(string token);
    Task<Result<ShareTokenDto>> ValidateEditShareAsync(string token);
    Task<Result<int>> RevokeSharesForPlanAsync(int travelPlanId);
    Task<Result<List<ShareResponseDto>>> GetSharesForPlanAsync(int travelPlanId);
    Task<Result<bool>> RevokeShareAsync(int planId, string token);
}
