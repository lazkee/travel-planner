using Microsoft.ServiceFabric.Services.Remoting;
using TravelPlanner.Shared.Users;

namespace TravelPlanner.Shared;

public interface IUserRoleLookupService : IService
{
    Task<UserRoleLookupRemotingResult> GetRolesByUserIdsAsync(int[] userIds);
}
