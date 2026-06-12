using TravelPlanner.Shared.Travel;

namespace TravelService.Services.Remoting;

public interface ITravelDataCleanupRemotingHandler
{
    Task<TravelDataCleanupRemotingResult> DeleteAllForUserAsync(int userId);
}
