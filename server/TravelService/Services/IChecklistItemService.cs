using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface IChecklistItemService
{
    Task<Result<List<ChecklistItemDto>>> GetForPlanAsync(int userId, int planId);
    Task<Result<ChecklistItemDto>> GetByIdAsync(int userId, int planId, int checklistItemId);
    Task<Result<ChecklistItemDto>> CreateAsync(int userId, int planId, ChecklistItemRequestDto request);
    Task<Result<ChecklistItemDto>> UpdateAsync(int userId, int planId, int checklistItemId, ChecklistItemRequestDto request);
    Task<Result<bool>> DeleteAsync(int userId, int planId, int checklistItemId);
}