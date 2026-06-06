using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Dtos;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/travel-plans")]
[Authorize]
public class TravelPlansController : ControllerBase
{
    private readonly ITravelPlanService _travelPlanService;

    public TravelPlansController(ITravelPlanService travelPlanService)
    {
        _travelPlanService = travelPlanService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _travelPlanService.GetUserPlansAsync(userId.Value);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _travelPlanService.GetByIdAsync(userId.Value, id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TravelPlanRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _travelPlanService.CreateAsync(userId.Value, request);
        if (result.IsFailure) return MapError(result.Error!);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TravelPlanRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _travelPlanService.UpdateAsync(userId.Value, id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _travelPlanService.DeleteAsync(userId.Value, id);
        return result.IsSuccess ? NoContent() : MapError(result.Error!);
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