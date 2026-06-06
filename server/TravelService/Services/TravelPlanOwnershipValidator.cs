using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;

namespace TravelService.Services;

public class TravelPlanOwnershipValidator : ITravelPlanOwnershipValidator
{
    private readonly TravelDbContext _context;

    public TravelPlanOwnershipValidator(TravelDbContext context)
    {
        _context = context;
    }

    public async Task<Error?> ValidateAsync(int userId, int planId)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null) return TravelServiceErrors.TravelPlanErrors.NotFound;
        if (plan.UserId != userId) return TravelServiceErrors.TravelPlanErrors.Forbidden;

        return null;
    }
}