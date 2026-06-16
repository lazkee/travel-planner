using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelPlanner.Shared.Enums;
using TravelService.Data;
using TravelService.Dtos;

namespace TravelService.Services;

public class SharedPlanService : ISharedPlanService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ISharedAccessValidator _sharedAccessValidator;
    private readonly IBudgetSummaryService _budgetSummaryService;

    public SharedPlanService(
        TravelDbContext context,
        IMapper mapper,
        ISharedAccessValidator sharedAccessValidator,
        IBudgetSummaryService budgetSummaryService)
    {
        _context = context;
        _mapper = mapper;
        _sharedAccessValidator = sharedAccessValidator;
        _budgetSummaryService = budgetSummaryService;
    }

    public async Task<Result<SharedTravelPlanDto>> GetByShareTokenAsync(string token)
    {
        var accessResult = await _sharedAccessValidator.ValidateReadAccessAsync(token);
        if (accessResult.IsFailure)
            return Result<SharedTravelPlanDto>.Failure(accessResult.Error!);

        var access = accessResult.Value!;
        var plan = await _context.TravelPlans
            .Include(p => p.Destinations)
            .Include(p => p.Activities)
            .Include(p => p.Expenses)
            .Include(p => p.ChecklistItems)
            .FirstOrDefaultAsync(p => p.Id == access.TravelPlanId);

        if (plan == null)
            return Result<SharedTravelPlanDto>.Failure(
                new Error("TravelPlan.NotFound", "The travel plan associated with this token no longer exists."));

        var budgetSummaryResult = await _budgetSummaryService.GetForPlanAsync(plan.Id);
        if (budgetSummaryResult.IsFailure)
            return Result<SharedTravelPlanDto>.Failure(budgetSummaryResult.Error!);

        var dto = new SharedTravelPlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            StartDate = plan.StartDate,
            EndDate = plan.EndDate,
            Budget = plan.Budget,
            Notes = plan.Notes,
            CreatedAt = plan.CreatedAt,
            Destinations = _mapper.Map<List<DestinationDto>>(plan.Destinations),
            Activities = _mapper.Map<List<ActivityDto>>(plan.Activities),
            Expenses = _mapper.Map<List<ExpenseDto>>(plan.Expenses),
            ChecklistItems = _mapper.Map<List<ChecklistItemDto>>(plan.ChecklistItems),
            BudgetSummary = budgetSummaryResult.Value!,
            AccessLevel = Enum.Parse<ShareAccessLevel>(access.AccessLevel),
            ExpiresAtUtc = access.ExpiresAt
        };

        return Result<SharedTravelPlanDto>.Success(dto);
    }
}
