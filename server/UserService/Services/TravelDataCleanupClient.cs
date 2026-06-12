using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared;
using TravelPlanner.Shared.Common;

namespace UserService.Services;

public class TravelDataCleanupClient : ITravelDataCleanupClient
{
    private readonly Uri _travelServiceUri;

    public TravelDataCleanupClient(IConfiguration configuration)
    {
        _travelServiceUri = new Uri(
            configuration["TravelService:ServiceUri"]
            ?? throw new InvalidOperationException("TravelService:ServiceUri is not configured."));
    }

    public async Task<Result<bool>> DeleteUserTravelDataAsync(int userId)
    {
        try
        {
            var proxy = ServiceProxy.Create<ITravelDataCleanupService>(_travelServiceUri);

            var response = await proxy.DeleteAllForUserAsync(userId);
            if (!response.IsSuccess)
            {
                return Result<bool>.Failure(new Error(
                    "Admin.TravelDataCleanupFailed",
                    response.ErrorMessage ?? "TravelService cleanup failed."));
            }

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(new Error(
                "Admin.TravelDataCleanupFailed",
                $"TravelService cleanup failed: {ex.Message}"));
        }
    }
}