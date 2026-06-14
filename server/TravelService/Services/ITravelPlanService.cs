using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ITravelPlanService
{
    Task<Result<List<TravelPlanDto>>> GetUserPlansAsync(int userId);
    Task<Result<List<TravelPlanDto>>> GetAdminUserTripsAsync(int currentAdminId);
    Task<Result<TravelPlanDto>> GetByIdAsync(int userId, int planId);
    Task<Result<TravelPlanDto>> CreateAsync(int userId, TravelPlanRequestDto request);
    Task<Result<TravelPlanDto>> UpdateAsync(int userId, int planId, TravelPlanRequestDto request);
    Task<Result<bool>> DeleteAsync(int userId, int planId);
    Task<Result<UserTravelDataCleanupResultDto>> DeleteAllForUserAsync(int userId);
}
