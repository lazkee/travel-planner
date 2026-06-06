using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Dtos;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/travel-plans/{planId:int}/checklist-items")]
[Authorize]
public class ChecklistItemsController : ControllerBase
{
    private readonly IChecklistItemService _checklistItemService;

    public ChecklistItemsController(IChecklistItemService checklistItemService)
    {
        _checklistItemService = checklistItemService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int planId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _checklistItemService.GetForPlanAsync(userId.Value, planId);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int planId, int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _checklistItemService.GetByIdAsync(userId.Value, planId, id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int planId, [FromBody] ChecklistItemRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _checklistItemService.CreateAsync(userId.Value, planId, request);
        if (result.IsFailure) return MapError(result.Error!);

        return CreatedAtAction(nameof(GetById), new { planId, id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int planId, int id, [FromBody] ChecklistItemRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _checklistItemService.UpdateAsync(userId.Value, planId, id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int planId, int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _checklistItemService.DeleteAsync(userId.Value, planId, id);
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
        "ChecklistItem.NotFound" => NotFound(new { message = error.Message }),
        "TravelPlan.Forbidden" => StatusCode(403, new { message = error.Message }),
        _ => BadRequest(new { message = error.Message })
    };
}