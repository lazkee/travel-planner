using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Data;
using TravelService.Dtos;

namespace TravelService.Services;

public class SharedPlanService : ISharedPlanService
{
    private readonly TravelDbContext _context;
    private readonly IMapper _mapper;
    private readonly ISharingClientService _sharingClient;

    public SharedPlanService(TravelDbContext context, IMapper mapper, ISharingClientService sharingClient)
    {
        _context = context;
        _mapper = mapper;
        _sharingClient = sharingClient;
    }

    public async Task<Result<SharedTravelPlanDto>> GetByShareTokenAsync(string token)
    {
        var tokenResult = await _sharingClient.ValidateShareAsync(token);
        if (tokenResult.IsFailure)
            return Result<SharedTravelPlanDto>.Failure(tokenResult.Error!);

        var shareToken = tokenResult.Value!;

        var plan = await _context.TravelPlans
            .Include(p => p.Destinations)
            .Include(p => p.Activities)
            .Include(p => p.Expenses)
            .Include(p => p.ChecklistItems)
            .FirstOrDefaultAsync(p => p.Id == shareToken.TravelPlanId);

        if (plan == null)
            return Result<SharedTravelPlanDto>.Failure(
                new Error("TravelPlan.NotFound", "The travel plan associated with this token no longer exists."));

        var expenses = plan.Expenses.ToList();
        var totalExpenses = expenses.Sum(e => e.Amount);

        var budgetSummary = new BudgetSummaryDto
        {
            TravelPlanId = plan.Id,
            Budget = plan.Budget,
            TotalExpenses = totalExpenses,
            RemainingBudget = plan.Budget - totalExpenses,
            Categories = expenses
                .GroupBy(e => e.Category)
                .Select(g => new BudgetCategorySummaryDto
                {
                    Category = g.Key,
                    TotalAmount = g.Sum(e => e.Amount)
                })
                .ToList()
        };

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
            BudgetSummary = budgetSummary,
            AccessLevel = shareToken.AccessLevel,
            ExpiresAtUtc = shareToken.ExpiresAtUtc
        };

        return Result<SharedTravelPlanDto>.Success(dto);
    }
}