using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface IBudgetSummaryService
{
    Task<Result<BudgetSummaryDto>> GetForPlanAsync(int userId, int planId);
}