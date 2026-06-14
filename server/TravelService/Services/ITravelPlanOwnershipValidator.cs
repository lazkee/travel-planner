using TravelPlanner.Shared.Common;

namespace TravelService.Services;

public interface ITravelPlanOwnershipValidator
{
    bool CanAccessAllPlans();
    Task<Error?> ValidateAsync(int userId, int planId);
}
