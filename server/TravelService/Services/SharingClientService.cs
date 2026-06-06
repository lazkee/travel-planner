using Microsoft.Extensions.Configuration;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared;
using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public class SharingClientService : ISharingClientService
{
    private readonly Uri _sharingServiceUri;
    private readonly string _publicBaseUrl;

    public SharingClientService(IConfiguration configuration)
    {
        _sharingServiceUri = new Uri(
            configuration["Sharing:ServiceUri"]
            ?? throw new InvalidOperationException("Sharing:ServiceUri is not configured."));

        _publicBaseUrl = (configuration["Sharing:PublicBaseUrl"]
            ?? throw new InvalidOperationException("Sharing:PublicBaseUrl is not configured."))
            .TrimEnd('/');
    }

    public async Task<Result<ShareResponseDto>> CreateShareAsync(int travelPlanId, string accessLevel, DateTime expiresAtUtc)
    {
        var proxy = ServiceProxy.Create<ISharingService>(_sharingServiceUri);
        var result = await proxy.CreateAsync(travelPlanId, accessLevel, expiresAtUtc);

        if (!result.IsSuccess)
        {
            var message = result.ErrorCode switch
            {
                "Sharing.InvalidAccessLevel" => "Access level must be 'View' or 'Edit'.",
                "Sharing.ExpiryInPast" => "Expiry date must be in the future.",
                _ => "Share creation failed."
            };
            return Result<ShareResponseDto>.Failure(new Error(result.ErrorCode!, message));
        }

        var token = result.Token!;
        var response = new ShareResponseDto
        {
            Token = token.Token,
            TravelPlanId = token.TravelPlanId,
            AccessLevel = token.AccessLevel,
            ExpiresAtUtc = token.ExpiresAtUtc,
            ShareUrl = $"{_publicBaseUrl}/shared/{token.Token}"
        };

        return Result<ShareResponseDto>.Success(response);
    }
}