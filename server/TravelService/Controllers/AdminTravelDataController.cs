using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/admin/users/{userId:int}/travel-data")]
[Authorize(Roles = "Admin")]
public class AdminTravelDataController : ControllerBase
{
    private readonly ITravelPlanService _travelPlanService;

    public AdminTravelDataController(ITravelPlanService travelPlanService)
    {
        _travelPlanService = travelPlanService;
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteUserTravelData(int userId)
    {
        var result = await _travelPlanService.DeleteAllForUserAsync(userId);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    private IActionResult MapError(Error error) => error.Code switch
    {
        _ => BadRequest(new { message = error.Message })
    };
}
