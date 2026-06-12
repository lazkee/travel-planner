using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.Travel;

namespace TravelPlanner.Shared;

public interface ITravelDataCleanupService : IService
{
    Task<TravelDataCleanupRemotingResult> DeleteAllForUserAsync(int userId);
}
