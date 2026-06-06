using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class ActivityService : IActivityService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public ActivityService(TravelDbContext context, IMapper mapper, ITravelPlanOwnershipValidator ownershipValidator)
    {
        _context = context;
        _mapper = mapper;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<Result<List<ActivityDto>>> GetForPlanAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<List<ActivityDto>>.Failure(planError);

        var activities = await _context.Activities
            .Where(a => a.TravelPlanId == planId)
            .ToListAsync();

        return Result<List<ActivityDto>>.Success(_mapper.Map<List<ActivityDto>>(activities));
    }

    public async Task<Result<ActivityDto>> GetByIdAsync(int userId, int planId, int activityId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ActivityDto>.Failure(planError);

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<ActivityDto>.Failure(TravelServiceErrors.ActivityErrors.NotFound);

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<ActivityDto>> CreateAsync(int userId, int planId, ActivityRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ActivityDto>.Failure(planError);

        if (request.EstimatedCost < 0)
            return Result<ActivityDto>.Failure(TravelServiceErrors.ActivityErrors.InvalidEstimatedCost);

        var activity = _mapper.Map<TravelActivity>(request);
        activity.TravelPlanId = planId;

        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<ActivityDto>> UpdateAsync(int userId, int planId, int activityId, ActivityRequestDto request)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<ActivityDto>.Failure(planError);

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<ActivityDto>.Failure(TravelServiceErrors.ActivityErrors.NotFound);

        if (request.EstimatedCost < 0)
            return Result<ActivityDto>.Failure(TravelServiceErrors.ActivityErrors.InvalidEstimatedCost);

        _mapper.Map(request, activity);
        await _context.SaveChangesAsync();

        return Result<ActivityDto>.Success(_mapper.Map<ActivityDto>(activity));
    }

    public async Task<Result<bool>> DeleteAsync(int userId, int planId, int activityId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<bool>.Failure(planError);

        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == planId);

        if (activity == null)
            return Result<bool>.Failure(TravelServiceErrors.ActivityErrors.NotFound);

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }
}