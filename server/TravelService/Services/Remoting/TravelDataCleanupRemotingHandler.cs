using TravelPlanner.Shared.Travel;
using SharedUserTravelDataCleanupResultDto = TravelPlanner.Shared.Travel.UserTravelDataCleanupResultDto;

namespace TravelService.Services.Remoting;

public class TravelDataCleanupRemotingHandler : ITravelDataCleanupRemotingHandler
{
    private readonly ITravelPlanService _travelPlanService;

    public TravelDataCleanupRemotingHandler(ITravelPlanService travelPlanService)
    {
        _travelPlanService = travelPlanService;
    }

    public async Task<TravelDataCleanupRemotingResult> DeleteAllForUserAsync(int userId)
    {
        var result = await _travelPlanService.DeleteAllForUserAsync(userId);
        if (result.IsFailure)
        {
            return new TravelDataCleanupRemotingResult
            {
                IsSuccess = false,
                ErrorCode = result.Error!.Code,
                ErrorMessage = result.Error.Message
            };
        }

        var cleanupResult = result.Value!;
        return new TravelDataCleanupRemotingResult
        {
            IsSuccess = true,
            CleanupResult = new SharedUserTravelDataCleanupResultDto
            {
                UserId = cleanupResult.UserId,
                DeletedTravelPlansCount = cleanupResult.DeletedTravelPlansCount,
                RevokedShareTokensCount = cleanupResult.RevokedShareTokensCount
            }
        };
    }
}
