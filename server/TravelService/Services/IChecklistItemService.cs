using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface IChecklistItemService
{
    Task<Result<List<ChecklistItemDto>>> GetForPlanAsync(int planId);
    Task<Result<List<ChecklistItemDto>>> GetForPlanAsync(int userId, int planId);
    Task<Result<ChecklistItemDto>> GetByIdForPlanAsync(int planId, int checklistItemId);
    Task<Result<ChecklistItemDto>> GetByIdAsync(int userId, int planId, int checklistItemId);
    Task<Result<ChecklistItemDto>> CreateForPlanAsync(int planId, ChecklistItemRequestDto request);
    Task<Result<ChecklistItemDto>> CreateAsync(int userId, int planId, ChecklistItemRequestDto request);
    Task<Result<ChecklistItemDto>> UpdateForPlanAsync(int planId, int checklistItemId, ChecklistItemRequestDto request);
    Task<Result<ChecklistItemDto>> UpdateAsync(int userId, int planId, int checklistItemId, ChecklistItemRequestDto request);
    Task<Result<bool>> DeleteForPlanAsync(int planId, int checklistItemId);
    Task<Result<bool>> DeleteAsync(int userId, int planId, int checklistItemId);
}
