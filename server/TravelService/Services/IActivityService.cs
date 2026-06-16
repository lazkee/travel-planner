using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface IActivityService
{
    Task<Result<List<ActivityDto>>> GetForPlanAsync(int planId);
    Task<Result<List<ActivityDto>>> GetForPlanAsync(int userId, int planId);
    Task<Result<ActivityDto>> GetByIdForPlanAsync(int planId, int activityId);
    Task<Result<ActivityDto>> GetByIdAsync(int userId, int planId, int activityId);
    Task<Result<ActivityDto>> CreateForPlanAsync(int planId, ActivityRequestDto request);
    Task<Result<ActivityDto>> CreateAsync(int userId, int planId, ActivityRequestDto request);
    Task<Result<ActivityDto>> UpdateForPlanAsync(int planId, int activityId, ActivityRequestDto request);
    Task<Result<ActivityDto>> UpdateAsync(int userId, int planId, int activityId, ActivityRequestDto request);
    Task<Result<bool>> DeleteForPlanAsync(int planId, int activityId);
    Task<Result<bool>> DeleteAsync(int userId, int planId, int activityId);
}
