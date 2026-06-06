using TravelPlanner.Shared.Common;

namespace TravelService.Services;

public interface ITravelPlanOwnershipValidator
{
    Task<Error?> ValidateAsync(int userId, int planId);
}