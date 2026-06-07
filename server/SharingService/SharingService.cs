using System.Fabric;
using System.Security.Cryptography;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelPlanner.Shared;
using TravelPlanner.Shared.Sharing;

namespace SharingService;

internal sealed class SharingService : StatefulService, ISharingService
{
    private const string DictionaryName = "shareTokens";

    private static readonly HashSet<string> ValidAccessLevels =
        new(StringComparer.OrdinalIgnoreCase) { "View", "Edit" };

    public SharingService(StatefulServiceContext context) : base(context) { }

    protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        => this.CreateServiceRemotingReplicaListeners();

    public async Task<ShareCreateResult> CreateAsync(int travelPlanId, string accessLevel, DateTime expiresAtUtc)
    {
        if (!ValidAccessLevels.Contains(accessLevel))
            return new ShareCreateResult { IsSuccess = false, ErrorCode = "Sharing.InvalidAccessLevel" };

        if (expiresAtUtc <= DateTime.UtcNow)
            return new ShareCreateResult { IsSuccess = false, ErrorCode = "Sharing.ExpiryInPast" };

        var token = GenerateToken();
        var dto = new ShareTokenDto
        {
            Token = token,
            TravelPlanId = travelPlanId,
            AccessLevel = accessLevel,
            ExpiresAtUtc = expiresAtUtc
        };

        var dict = await StateManager.GetOrAddAsync<IReliableDictionary<string, ShareTokenDto>>(DictionaryName);

        using var tx = StateManager.CreateTransaction();
        await dict.AddOrUpdateAsync(tx, token, dto, (_, _) => dto);
        await tx.CommitAsync();

        return new ShareCreateResult { IsSuccess = true, Token = dto };
    }

    public async Task<ShareValidationResult> ValidateAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return new ShareValidationResult { IsValid = false, ErrorCode = "Sharing.EmptyToken" };

        var dict = await StateManager.GetOrAddAsync<IReliableDictionary<string, ShareTokenDto>>(DictionaryName);

        using var tx = StateManager.CreateTransaction();
        var result = await dict.TryGetValueAsync(tx, token);

        if (!result.HasValue)
        {
            await tx.CommitAsync();
            return new ShareValidationResult { IsValid = false, ErrorCode = "Sharing.NotFound" };
        }

        if (result.Value.ExpiresAtUtc <= DateTime.UtcNow)
        {
            await dict.TryRemoveAsync(tx, token);
            await tx.CommitAsync();
            return new ShareValidationResult { IsValid = false, ErrorCode = "Sharing.Expired" };
        }

        await tx.CommitAsync();
        return new ShareValidationResult { IsValid = true, Token = result.Value };
    }

    public async Task RevokeAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return;

        var dict = await StateManager.GetOrAddAsync<IReliableDictionary<string, ShareTokenDto>>(DictionaryName);

        using var tx = StateManager.CreateTransaction();
        await dict.TryRemoveAsync(tx, token);
        await tx.CommitAsync();
    }

    public async Task<int> RevokeForPlanAsync(int travelPlanId)
    {
        var dict = await StateManager.GetOrAddAsync<IReliableDictionary<string, ShareTokenDto>>(DictionaryName);

        using var tx = StateManager.CreateTransaction();
        var enumerable = await dict.CreateEnumerableAsync(tx);
        var enumerator = enumerable.GetAsyncEnumerator();

        var toRemove = new List<string>();
        while (await enumerator.MoveNextAsync(CancellationToken.None))
        {
            if (enumerator.Current.Value.TravelPlanId == travelPlanId)
                toRemove.Add(enumerator.Current.Key);
        }

        foreach (var key in toRemove)
            await dict.TryRemoveAsync(tx, key);

        await tx.CommitAsync();
        return toRemove.Count;
    }

    public async Task<List<ShareTokenDto>> GetForPlanAsync(int travelPlanId)
    {
        var dict = await StateManager.GetOrAddAsync<IReliableDictionary<string, ShareTokenDto>>(DictionaryName);

        using var tx = StateManager.CreateTransaction();
        var enumerable = await dict.CreateEnumerableAsync(tx);
        var enumerator = enumerable.GetAsyncEnumerator();

        var result = new List<ShareTokenDto>();
        var expired = new List<string>();
        var now = DateTime.UtcNow;

        while (await enumerator.MoveNextAsync(CancellationToken.None))
        {
            var entry = enumerator.Current.Value;
            if (entry.TravelPlanId != travelPlanId) continue;

            if (entry.ExpiresAtUtc <= now)
                expired.Add(enumerator.Current.Key);
            else
                result.Add(entry);
        }

        foreach (var key in expired)
            await dict.TryRemoveAsync(tx, key);

        await tx.CommitAsync();
        return result;
    }

    private static string GenerateToken()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }
}