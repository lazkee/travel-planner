using TravelPlanner.Shared.Common;

namespace UserService.Services;

public class TravelDataCleanupClient : ITravelDataCleanupClient
{
    private readonly HttpClient _httpClient;

    public TravelDataCleanupClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;

        var baseUrl = configuration["TravelService:BaseUrl"]
            ?? throw new InvalidOperationException("TravelService:BaseUrl is not configured.");

        _httpClient.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
    }

    public async Task<Result<bool>> DeleteUserTravelDataAsync(int userId, string authorizationHeader)
    {
        using var request = new HttpRequestMessage(HttpMethod.Delete, $"api/admin/users/{userId}/travel-data");

        if (!string.IsNullOrWhiteSpace(authorizationHeader))
            request.Headers.TryAddWithoutValidation("Authorization", authorizationHeader);

        using var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return Result<bool>.Failure(new Error(
                "Admin.TravelDataCleanupFailed",
                $"TravelService cleanup failed with status {(int)response.StatusCode}."));
        }

        return Result<bool>.Success(true);
    }
}
