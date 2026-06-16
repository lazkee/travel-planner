using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface IDestinationService
{
    Task<Result<List<DestinationDto>>> GetForPlanAsync(int planId);
    Task<Result<List<DestinationDto>>> GetForPlanAsync(int userId, int planId);
    Task<Result<DestinationDto>> GetByIdForPlanAsync(int planId, int destinationId);
    Task<Result<DestinationDto>> GetByIdAsync(int userId, int planId, int destinationId);
    Task<Result<DestinationDto>> CreateForPlanAsync(int planId, DestinationRequestDto request);
    Task<Result<DestinationDto>> CreateAsync(int userId, int planId, DestinationRequestDto request);
    Task<Result<DestinationDto>> UpdateForPlanAsync(int planId, int destinationId, DestinationRequestDto request);
    Task<Result<DestinationDto>> UpdateAsync(int userId, int planId, int destinationId, DestinationRequestDto request);
    Task<Result<bool>> DeleteForPlanAsync(int planId, int destinationId);
    Task<Result<bool>> DeleteAsync(int userId, int planId, int destinationId);
}
