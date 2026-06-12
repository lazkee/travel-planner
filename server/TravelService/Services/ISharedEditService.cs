using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ISharedEditService
{
    Task<Result<TravelPlanDto>> UpdateTravelPlanAsync(string token, TravelPlanRequestDto request);
    Task<Result<DestinationDto>> CreateDestinationAsync(string token, DestinationRequestDto request);
    Task<Result<DestinationDto>> UpdateDestinationAsync(string token, int destinationId, DestinationRequestDto request);
    Task<Result<bool>> DeleteDestinationAsync(string token, int destinationId);
    Task<Result<ActivityDto>> CreateActivityAsync(string token, ActivityRequestDto request);
    Task<Result<ActivityDto>> UpdateActivityAsync(string token, int activityId, ActivityRequestDto request);
    Task<Result<bool>> DeleteActivityAsync(string token, int activityId);
    Task<Result<ExpenseDto>> CreateExpenseAsync(string token, ExpenseRequestDto request);
    Task<Result<ExpenseDto>> UpdateExpenseAsync(string token, int expenseId, ExpenseRequestDto request);
    Task<Result<bool>> DeleteExpenseAsync(string token, int expenseId);
}
