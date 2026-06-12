using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Dtos;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/shared/{token}")]
[AllowAnonymous]
public class SharedEditController : ControllerBase
{
    private readonly ISharedEditService _sharedEditService;

    public SharedEditController(ISharedEditService sharedEditService)
    {
        _sharedEditService = sharedEditService;
    }

    [HttpPut("travel-plan")]
    public async Task<IActionResult> UpdateTravelPlan(string token, [FromBody] TravelPlanRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _sharedEditService.UpdateTravelPlanAsync(token, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPost("destinations")]
    public async Task<IActionResult> CreateDestination(string token, [FromBody] DestinationRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _sharedEditService.CreateDestinationAsync(token, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPut("destinations/{id}")]
    public async Task<IActionResult> UpdateDestination(string token, int id, [FromBody] DestinationRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _sharedEditService.UpdateDestinationAsync(token, id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpDelete("destinations/{id}")]
    public async Task<IActionResult> DeleteDestination(string token, int id)
    {
        var result = await _sharedEditService.DeleteDestinationAsync(token, id);
        return result.IsSuccess ? NoContent() : MapError(result.Error!);
    }

    [HttpPost("activities")]
    public async Task<IActionResult> CreateActivity(string token, [FromBody] ActivityRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _sharedEditService.CreateActivityAsync(token, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPut("activities/{id}")]
    public async Task<IActionResult> UpdateActivity(string token, int id, [FromBody] ActivityRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _sharedEditService.UpdateActivityAsync(token, id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpDelete("activities/{id}")]
    public async Task<IActionResult> DeleteActivity(string token, int id)
    {
        var result = await _sharedEditService.DeleteActivityAsync(token, id);
        return result.IsSuccess ? NoContent() : MapError(result.Error!);
    }

    private IActionResult MapError(Error error) => error.Code switch
    {
        "Sharing.NotFound"           => NotFound(new { message = error.Message }),
        "TravelPlan.NotFound"        => NotFound(new { message = error.Message }),
        "Destination.NotFound"       => NotFound(new { message = error.Message }),
        "Activity.NotFound"          => NotFound(new { message = error.Message }),
        "Sharing.EditAccessRequired" => StatusCode(403, new { message = error.Message }),
        "Sharing.Expired"            => StatusCode(410, new { message = error.Message }),
        _                            => BadRequest(new { message = error.Message })
    };
}
