using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/travel-plans/{planId:int}/budget-summary")]
[Authorize]
public class BudgetSummaryController : ControllerBase
{
    private readonly IBudgetSummaryService _budgetSummaryService;

    public BudgetSummaryController(IBudgetSummaryService budgetSummaryService)
    {
        _budgetSummaryService = budgetSummaryService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(int planId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _budgetSummaryService.GetForPlanAsync(userId.Value, planId);
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