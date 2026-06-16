using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/shared")]
[AllowAnonymous]
public class SharedPlansController : ControllerBase
{
    private readonly ISharedPlanService _sharedPlanService;

    public SharedPlansController(ISharedPlanService sharedPlanService)
    {
        _sharedPlanService = sharedPlanService;
    }

    [HttpGet("{token}")]
    [HttpGet("{token}/travel-plan")]
    public async Task<IActionResult> Get(string token)
    {
        var result = await _sharedPlanService.GetByShareTokenAsync(token);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    private IActionResult MapError(Error error) => error.Code switch
    {
        "Sharing.NotFound"   => NotFound(new { message = error.Message }),
        "TravelPlan.NotFound" => NotFound(new { message = error.Message }),
        "Sharing.Expired"    => StatusCode(410, new { message = error.Message }),
        _                    => BadRequest(new { message = error.Message })
    };
}
