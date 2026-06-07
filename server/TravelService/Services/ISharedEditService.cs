using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ISharedEditService
{
    Task<Result<TravelPlanDto>> UpdateTravelPlanAsync(string token, TravelPlanRequestDto request);
    Task<Result<DestinationDto>> CreateDestinationAsync(string token, DestinationRequestDto request);
    Task<Result<DestinationDto>> UpdateDestinationAsync(string token, int destinationId, DestinationRequestDto request);
    Task<Result<bool>> DeleteDestinationAsync(string token, int destinationId);
}