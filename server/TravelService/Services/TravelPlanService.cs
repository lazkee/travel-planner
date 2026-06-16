using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class TravelPlanService : ITravelPlanService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ISharingClientService _sharingClient;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public TravelPlanService(
        TravelDbContext context,
        IMapper mapper,
        ISharingClientService sharingClient,
        ITravelPlanOwnershipValidator ownershipValidator)
    {
        _context = context;
        _mapper = mapper;
        _sharingClient = sharingClient;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<Result<List<TravelPlanDto>>> GetUserPlansAsync(int userId)
    {
        var plans = await _context.TravelPlans
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.Id)
            .ToListAsync();

        return Result<List<TravelPlanDto>>.Success(_mapper.Map<List<TravelPlanDto>>(plans));
    }

    public async Task<Result<List<TravelPlanDto>>> GetAdminUserTripsAsync(int currentAdminId)
    {
        var plans = await _context.TravelPlans
            .Where(p => p.UserId != currentAdminId)
            .OrderBy(p => p.Id)
            .ToListAsync();

        return Result<List<TravelPlanDto>>.Success(_mapper.Map<List<TravelPlanDto>>(plans));
    }

    public async Task<Result<TravelPlanDto>> GetByIdAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<TravelPlanDto>.Failure(planError);

        var plan = await _context.TravelPlans.FindAsync(planId);

        return Result<TravelPlanDto>.Success(_mapper.Map<TravelPlanDto>(plan!));
    }

    public async Task<Result<TravelPlanDto>> CreateAsync(int userId, TravelPlanRequestDto request)
    {
        var dateError = ValidateDatesForCreate(request);
        if (dateError != null) return Result<TravelPlanDto>.Failure(dateError);

        if (request.Budget < 0)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.InvalidBudget);

        var plan = _mapper.Map<TravelPlan>(request);
        plan.UserId = userId;
        plan.CreatedAt = DateTime.Now;

        _context.TravelPlans.Add(plan);
        await _context.SaveChangesAsync();

        return Result<TravelPlanDto>.Success(_mapper.Map<TravelPlanDto>(plan));
    }

    public async Task<Result<TravelPlanDto>> UpdateAsync(int userId, int planId, TravelPlanRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<TravelPlanDto>.Failure(planError);

        var dateError = ValidateDatesForUpdate(request);
        if (dateError != null) return Result<TravelPlanDto>.Failure(dateError);

        if (request.Budget < 0)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.InvalidBudget);

        if (await HasActivitiesOutsideDateRange(planId, request.StartDate, request.EndDate))
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.DateRangeExcludesActivities);

        var plan = await _context.TravelPlans.FindAsync(planId);

        _mapper.Map(request, plan);
        await _context.SaveChangesAsync();

        return Result<TravelPlanDto>.Success(_mapper.Map<TravelPlanDto>(plan));
    }

    public async Task<Result<bool>> DeleteAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<bool>.Failure(planError);

        var plan = await _context.TravelPlans.FindAsync(planId);

        var revokeResult = await _sharingClient.RevokeSharesForPlanAsync(planId);
        if (revokeResult.IsFailure)
            return Result<bool>.Failure(revokeResult.Error!);

        _context.TravelPlans.Remove(plan!);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    public async Task<Result<UserTravelDataCleanupResultDto>> DeleteAllForUserAsync(int userId)
    {
        var plans = await _context.TravelPlans
            .Where(p => p.UserId == userId)
            .ToListAsync();

        if (plans.Count == 0)
        {
            return Result<UserTravelDataCleanupResultDto>.Success(new UserTravelDataCleanupResultDto
            {
                UserId = userId,
                DeletedTravelPlansCount = 0,
                RevokedShareTokensCount = 0
            });
        }

        var revokedShareTokensCount = 0;

        foreach (var plan in plans)
        {
            var revokeResult = await _sharingClient.RevokeSharesForPlanAsync(plan.Id);
            if (revokeResult.IsFailure)
                return Result<UserTravelDataCleanupResultDto>.Failure(revokeResult.Error!);

            revokedShareTokensCount += revokeResult.Value;
        }

        _context.TravelPlans.RemoveRange(plans);
        await _context.SaveChangesAsync();

        return Result<UserTravelDataCleanupResultDto>.Success(new UserTravelDataCleanupResultDto
        {
            UserId = userId,
            DeletedTravelPlansCount = plans.Count,
            RevokedShareTokensCount = revokedShareTokensCount
        });
    }

    private static Error? ValidateDatesForCreate(TravelPlanRequestDto request)
    {
        if (request.StartDate.Date < DateTime.UtcNow.Date)
            return TravelServiceErrors.TravelPlanErrors.StartDateInPast;

        if (request.EndDate.Date < request.StartDate.Date)
            return TravelServiceErrors.TravelPlanErrors.InvalidDateRange;

        return null;
    }

    private static Error? ValidateDatesForUpdate(TravelPlanRequestDto request)
    {
        if (request.EndDate.Date < request.StartDate.Date)
            return TravelServiceErrors.TravelPlanErrors.InvalidDateRange;

        return null;
    }

    private async Task<bool> HasActivitiesOutsideDateRange(int planId, DateTime startDate, DateTime endDate)
    {
        var start = startDate.Date;
        var endExclusive = endDate.Date.AddDays(1);

        return await _context.Activities
            .AnyAsync(a => a.TravelPlanId == planId &&
                           (a.Date < start || a.Date >= endExclusive));
    }
}
