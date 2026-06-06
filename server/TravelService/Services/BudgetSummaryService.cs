using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;

namespace TravelService.Services;

public class BudgetSummaryService : IBudgetSummaryService
{
    private readonly TravelDbContext _context;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public BudgetSummaryService(TravelDbContext context, ITravelPlanOwnershipValidator ownershipValidator)
    {
        _context = context;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<Result<BudgetSummaryDto>> GetForPlanAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<BudgetSummaryDto>.Failure(planError);

        var plan = await _context.TravelPlans.FindAsync(planId);

        var expenses = await _context.Expenses
            .Where(e => e.TravelPlanId == planId)
            .ToListAsync();

        var totalExpenses = expenses.Sum(e => e.Amount);

        var categories = expenses
            .GroupBy(e => e.Category)
            .Select(g => new BudgetCategorySummaryDto
            {
                Category = g.Key,
                TotalAmount = g.Sum(e => e.Amount)
            })
            .ToList();

        var summary = new BudgetSummaryDto
        {
            TravelPlanId = planId,
            Budget = plan!.Budget,
            TotalExpenses = totalExpenses,
            RemainingBudget = plan.Budget - totalExpenses,
            Categories = categories
        };

        return Result<BudgetSummaryDto>.Success(summary);
    }
}