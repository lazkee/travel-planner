using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class ActivityService : IActivityService
{
    private static readonly Error PlanNotFoundError =
        new("TravelPlan.NotFound", "Travel plan was not found.");
    private static readonly Error PlanForbiddenError =
        new("TravelPlan.Forbidden", "You are not allowed to access this travel plan.");
    private static readonly Error ActivityNotFoundError =
        new("Activity.NotFound", "Activity was not found.");
    private static readonly Error InvalidEstimatedCostError =
        new("Activity.InvalidEstimatedCost", "Estimated cost cannot be negative.");

    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;

    public ActivityService(TravelDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<ActivityDto>>> GetForPlanAsync(int userId, int planId)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<List<ActivityDto>>.Failure(planCheck);

        var activities = await _context.Activities
            .Where(a => a.TravelPlanId == planId)
            .ToListAsync();

        return Result<List<ActivityDto>>.Success(_mapper.Map<List<ActivityDto>>(activities));
    }

    public async Task<Result<ActivityDto>> GetByIdAsync(int userId, int planId, int activityId)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<ActivityDto>.Failure(planCheck);

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<ActivityDto>.Failure(ActivityNotFoundError);

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<ActivityDto>> CreateAsync(int userId, int planId, ActivityRequestDto request)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<ActivityDto>.Failure(planCheck);

        if (request.EstimatedCost < 0)
            return Result<ActivityDto>.Failure(InvalidEstimatedCostError);

        var activity = _mapper.Map<TravelActivity>(request);
        activity.TravelPlanId = planId;

        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<ActivityDto>> UpdateAsync(int userId, int planId, int activityId, ActivityRequestDto request)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<ActivityDto>.Failure(planCheck);

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<ActivityDto>.Failure(ActivityNotFoundError);

        if (request.EstimatedCost < 0)
            return Result<ActivityDto>.Failure(InvalidEstimatedCostError);

        _mapper.Map(request, activity);
        await _context.SaveChangesAsync();

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<bool>> DeleteAsync(int userId, int planId, int activityId)
    {
        var planCheck = await ValidatePlanOwnershipAsync(userId, planId);
        if (planCheck != null) return Result<bool>.Failure(planCheck);

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<bool>.Failure(ActivityNotFoundError);

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }

    private async Task<Error?> ValidatePlanOwnershipAsync(int userId, int planId)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null) return PlanNotFoundError;
        if (plan.UserId != userId) return PlanForbiddenError;

        return null;
    }
}