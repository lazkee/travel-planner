using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Dtos;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/travel-plans/{planId:int}/shares")]
[Authorize]
public class SharesController : ControllerBase
{
    private readonly ISharingClientService _sharingClientService;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public SharesController(ISharingClientService sharingClientService, ITravelPlanOwnershipValidator ownershipValidator)
    {
        _sharingClientService = sharingClientService;
        _ownershipValidator = ownershipValidator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(int planId, [FromBody] ShareRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var planError = await _ownershipValidator.ValidateAsync(userId.Value, planId);
        if (planError != null) return MapError(planError);

        var result = await _sharingClientService.CreateShareAsync(planId, request.AccessLevel, request.ExpiresAtUtc);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(value, out var id) ? id : null;
    }

    private IActionResult MapError(Error error) => error.Code switch
    {
        "TravelPlan.NotFound" => NotFound(new { message = error.Message }),
        "TravelPlan.Forbidden" => StatusCode(403, new { message = error.Message }),
        _ => BadRequest(new { message = error.Message })
    };
}