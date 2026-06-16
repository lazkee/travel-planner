using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelPlanner.Shared.Enums;
using TravelService.Data;

namespace TravelService.Services;

public class SharedAccessValidator : ISharedAccessValidator
{
    private static readonly Error SharedTravelPlanNotFound =
        new("TravelPlan.NotFound", "The travel plan associated with this token no longer exists.");

    private readonly ISharingClientService _sharingClient;
    private readonly TravelDbContext _context;

    public SharedAccessValidator(ISharingClientService sharingClient, TravelDbContext context)
    {
        _sharingClient = sharingClient;
        _context = context;
    }

    public async Task<Result<SharedAccessContext>> ValidateReadAccessAsync(string token)
    {
        var tokenResult = await _sharingClient.ValidateShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<SharedAccessContext>.Failure(tokenResult.Error!);

        var shareToken = tokenResult.Value!;
        var planExists = await _context.TravelPlans
            .AnyAsync(p => p.Id == shareToken.TravelPlanId);

        if (!planExists)
            return Result<SharedAccessContext>.Failure(SharedTravelPlanNotFound);

        return Result<SharedAccessContext>.Success(new SharedAccessContext
        {
            TravelPlanId = shareToken.TravelPlanId,
            AccessLevel = shareToken.AccessLevel.ToString(),
            ExpiresAt = shareToken.ExpiresAtUtc
        });
    }

    public async Task<Result<SharedAccessContext>> ValidateEditAccessAsync(string token)
    {
        var accessResult = await ValidateReadAccessAsync(token);
        if (accessResult.IsFailure)
            return accessResult;

        if (accessResult.Value!.AccessLevel != ShareAccessLevel.Edit.ToString())
        {
            return Result<SharedAccessContext>.Failure(new Error(
                "Sharing.EditAccessRequired",
                "This share link does not have edit access."));
        }

        return accessResult;
    }
}
