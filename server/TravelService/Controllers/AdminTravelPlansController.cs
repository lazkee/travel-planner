using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/admin/travel-plans")]
[Authorize(Roles = "Admin")]
public class AdminTravelPlansController : ControllerBase
{
    private readonly ITravelPlanService _travelPlanService;

    public AdminTravelPlansController(ITravelPlanService travelPlanService)
    {
        _travelPlanService = travelPlanService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _travelPlanService.GetAllForAdminAsync();
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _travelPlanService.DeleteAsAdminAsync(id);
        return result.IsSuccess ? NoContent() : MapError(result.Error!);
    }

    private IActionResult MapError(Error error) => error.Code switch
    {
        "TravelPlan.NotFound" => NotFound(new { message = error.Message }),
        "Sharing.RevokeFailed" => StatusCode(502, new { message = error.Message }),
        _ => BadRequest(new { message = error.Message })
    };
}
