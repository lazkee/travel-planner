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

    public TravelPlanService(TravelDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<TravelPlanDto>>> GetUserPlansAsync(int userId)
    {
        var plans = await _context.TravelPlans
            .Where(p => p.UserId == userId)
            .ToListAsync();

        return Result<List<TravelPlanDto>>.Success(_mapper.Map<List<TravelPlanDto>>(plans));
    }

    public async Task<Result<TravelPlanDto>> GetByIdAsync(int userId, int planId)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        if (plan.UserId != userId)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.Forbidden);

        return Result<TravelPlanDto>.Success(_mapper.Map<TravelPlanDto>(plan));
    }

    public async Task<Result<TravelPlanDto>> CreateAsync(int userId, TravelPlanRequestDto request)
    {
        if (request.EndDate < request.StartDate)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.InvalidDateRange);

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
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        if (plan.UserId != userId)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.Forbidden);

        if (request.EndDate < request.StartDate)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.InvalidDateRange);

        if (request.Budget < 0)
            return Result<TravelPlanDto>.Failure(TravelServiceErrors.TravelPlanErrors.InvalidBudget);

        _mapper.Map(request, plan);
        await _context.SaveChangesAsync();

        return Result<TravelPlanDto>.Success(_mapper.Map<TravelPlanDto>(plan));
    }

    public async Task<Result<bool>> DeleteAsync(int userId, int planId)
    {
        var plan = await _context.TravelPlans.FindAsync(planId);

        if (plan == null)
            return Result<bool>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        if (plan.UserId != userId)
            return Result<bool>.Failure(TravelServiceErrors.TravelPlanErrors.Forbidden);

        _context.TravelPlans.Remove(plan);
        await _context.SaveChangesAsync();

        return Result<bool>.Success(true);
    }
}