using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface IExpenseService
{
    Task<Result<List<ExpenseDto>>> GetForPlanAsync(int planId);
    Task<Result<List<ExpenseDto>>> GetForPlanAsync(int userId, int planId);
    Task<Result<ExpenseDto>> GetByIdForPlanAsync(int planId, int expenseId);
    Task<Result<ExpenseDto>> GetByIdAsync(int userId, int planId, int expenseId);
    Task<Result<ExpenseDto>> CreateForPlanAsync(int planId, ExpenseRequestDto request);
    Task<Result<ExpenseDto>> CreateAsync(int userId, int planId, ExpenseRequestDto request);
    Task<Result<ExpenseDto>> UpdateForPlanAsync(int planId, int expenseId, ExpenseRequestDto request);
    Task<Result<ExpenseDto>> UpdateAsync(int userId, int planId, int expenseId, ExpenseRequestDto request);
    Task<Result<bool>> DeleteForPlanAsync(int planId, int expenseId);
    Task<Result<bool>> DeleteAsync(int userId, int planId, int expenseId);
}
