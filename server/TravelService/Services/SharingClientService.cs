using Microsoft.Extensions.Configuration;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared;
using TravelPlanner.Shared.Common;
using TravelPlanner.Shared.Sharing;
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

    public async Task<Result<ShareTokenDto>> ValidateShareAsync(string token)
    {
        var proxy = ServiceProxy.Create<ISharingService>(_sharingServiceUri);
        var result = await proxy.ValidateAsync(token);

        if (!result.IsValid)
        {
            var (code, message) = result.ErrorCode switch
            {
                "Sharing.EmptyToken" => ("Sharing.EmptyToken", "Token is required."),
                "Sharing.NotFound"   => ("Sharing.NotFound",   "Share token was not found."),
                "Sharing.Expired"    => ("Sharing.Expired",    "Share token has expired."),
                _                    => ("Sharing.Invalid",    "Share token is invalid.")
            };
            return Result<ShareTokenDto>.Failure(new Error(code, message));
        }

        return Result<ShareTokenDto>.Success(result.Token!);
    }

    public async Task<Result<ShareTokenDto>> ValidateEditShareAsync(string token)
    {
        var result = await ValidateShareAsync(token);
        if (result.IsFailure)
            return result;

        if (!string.Equals(result.Value!.AccessLevel, "Edit", StringComparison.OrdinalIgnoreCase))
            return Result<ShareTokenDto>.Failure(new Error(
                "Sharing.EditAccessRequired",
                "This share link does not have edit access."));

        return result;
    }

    public async Task<Result<int>> RevokeSharesForPlanAsync(int travelPlanId)
    {
        try
        {
            var proxy = ServiceProxy.Create<ISharingService>(_sharingServiceUri);
            var count = await proxy.RevokeForPlanAsync(travelPlanId);
            return Result<int>.Success(count);
        }
        catch (Exception ex)
        {
            return Result<int>.Failure(new Error(
                "Sharing.RevokeFailed",
                $"Failed to revoke share tokens: {ex.Message}"));
        }
    }
}