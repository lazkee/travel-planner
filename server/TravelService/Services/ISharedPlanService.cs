using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ISharedPlanService
{
    Task<Result<SharedTravelPlanDto>> GetByShareTokenAsync(string token);
}