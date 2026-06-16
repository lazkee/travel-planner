using Microsoft.AspNetCore.Http;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;

namespace TravelService.Services;

public class TravelPlanOwnershipValidator : ITravelPlanOwnershipValidator
{
    private const string AdminRole = "Admin";
    private const string UserRole = "User";

    private readonly TravelDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserRoleLookupClient _userRoleLookupClient;

    public TravelPlanOwnershipValidator(
        TravelDbContext context,
        IHttpContextAccessor httpContextAccessor,
        IUserRoleLookupClient userRoleLookupClient)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _userRoleLookupClient = userRoleLookupClient;
    }

    public bool CanAccessAllPlans() =>
        _httpContextAccessor.HttpContext?.User.IsInRole(AdminRole) == true;

    public async Task<Error?> ValidateAsync(int userId, int planId)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null) return TravelServiceErrors.TravelPlanErrors.NotFound;
        if (plan.UserId == userId) return null;
        if (!CanAccessAllPlans()) return TravelServiceErrors.TravelPlanErrors.Forbidden;

        var rolesResult = await _userRoleLookupClient.GetRolesByUserIdsAsync(new[] { plan.UserId });
        if (rolesResult.IsFailure) return rolesResult.Error;

        var roles = rolesResult.Value!;
        if (!roles.TryGetValue(plan.UserId, out var ownerRole) || ownerRole != UserRole)
            return TravelServiceErrors.TravelPlanErrors.Forbidden;

        return null;
    }
}
