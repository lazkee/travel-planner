using Microsoft.Extensions.Configuration;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using TravelPlanner.Shared;
using TravelPlanner.Shared.Common;
using TravelPlanner.Shared.Enums;
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

    public async Task<Result<ShareResponseDto>> CreateShareAsync(int travelPlanId, ShareAccessLevel accessLevel, DateTime expiresAtUtc)
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

        if (result.Value!.AccessLevel != ShareAccessLevel.Edit)
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

    public async Task<Result<List<ShareResponseDto>>> GetSharesForPlanAsync(int travelPlanId)
    {
        var proxy = ServiceProxy.Create<ISharingService>(_sharingServiceUri);
        var tokens = await proxy.GetForPlanAsync(travelPlanId);
        var responses = tokens.Select(t => new ShareResponseDto
        {
            Token = t.Token,
            TravelPlanId = t.TravelPlanId,
            AccessLevel = t.AccessLevel,
            ExpiresAtUtc = t.ExpiresAtUtc,
            ShareUrl = $"{_publicBaseUrl}/shared/{t.Token}"
        }).ToList();
        return Result<List<ShareResponseDto>>.Success(responses);
    }

    public async Task<Result<bool>> RevokeShareAsync(int planId, string token)
    {
        var proxy = ServiceProxy.Create<ISharingService>(_sharingServiceUri);
        var validation = await proxy.ValidateAsync(token);

        if (!validation.IsValid)
            return Result<bool>.Failure(new Error("Sharing.NotFound", "Share token was not found."));

        if (validation.Token!.TravelPlanId != planId)
            return Result<bool>.Failure(new Error("Sharing.NotFound", "Share token was not found."));

        await proxy.RevokeAsync(token);
        return Result<bool>.Success(true);
    }
}
