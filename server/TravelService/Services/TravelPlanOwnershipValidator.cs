using Microsoft.AspNetCore.Http;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;

namespace TravelService.Services;

public class TravelPlanOwnershipValidator : ITravelPlanOwnershipValidator
{
    private readonly TravelDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TravelPlanOwnershipValidator(TravelDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public bool CanAccessAllPlans() =>
        _httpContextAccessor.HttpContext?.User.IsInRole("Admin") == true;

    public async Task<Error?> ValidateAsync(int userId, int planId)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null) return TravelServiceErrors.TravelPlanErrors.NotFound;
        if (CanAccessAllPlans()) return null;
        if (plan.UserId != userId) return TravelServiceErrors.TravelPlanErrors.Forbidden;

        return null;
    }
}
