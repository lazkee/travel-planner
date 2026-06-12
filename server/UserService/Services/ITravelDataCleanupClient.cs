using TravelPlanner.Shared.Common;

namespace UserService.Services;

public interface ITravelDataCleanupClient
{
    Task<Result<bool>> DeleteUserTravelDataAsync(int userId, string authorizationHeader);
}
