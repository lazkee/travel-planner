using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

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

        var plan = await _context.TravelPlans
            .Include(tp => tp.Expenses)
            .Include(tp => tp.Activities)
            .FirstOrDefaultAsync(tp => tp.Id == planId );

        if (plan == null)
            return Result<BudgetSummaryDto>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var expenseTotal = plan.Expenses.Sum(e => e.Amount);
        var activityEstimates = plan.Activities
            .Where(a => a.EstimatedCost > 0 && a.Status != ActivityStatus.Cancelled)
            .Sum(a => a.EstimatedCost);
        var totalSpent = expenseTotal + activityEstimates;

        var categories = plan.Expenses
            .GroupBy(e => e.Category)
            .Select(g => new BudgetCategorySummaryDto
            {
                Category = g.Key,
                TotalAmount = g.Sum(e => e.Amount)
            })
            .ToList();

        if (activityEstimates > 0)
        {
            var activityCategory = categories.FirstOrDefault(c => c.Category == ExpenseCategory.Activities);
            if (activityCategory == null)
            {
                categories.Add(new BudgetCategorySummaryDto
                {
                    Category = ExpenseCategory.Activities,
                    TotalAmount = activityEstimates
                });
            }
            else
            {
                activityCategory.TotalAmount += activityEstimates;
            }
        }

        var summary = new BudgetSummaryDto
        {
            TravelPlanId = planId,
            Budget = plan.Budget,
            TotalExpenses = totalSpent,
            RemainingBudget = plan.Budget - totalSpent,
            Categories = categories
        };

        return Result<BudgetSummaryDto>.Success(summary);
    }
}
